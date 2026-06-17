#!/usr/bin/env python3
# Standalone STM32 DfuSe flasher + read-back verifier over libusb (pyusb).
# Reliable, repeatable flashing for stability testing.
#   flash_dfu.py <hex> [--loop N] [--no-leave] [--no-verify]
# libusb handles 2048-byte control transfers (unlike WebUSB), so it streams fast.
import sys, time, struct, re
import usb.core, usb.util, usb.backend.libusb1, libusb_package

VID, PID, XFER = 0x0483, 0xdf11, 2048
args = sys.argv[1:]
HEXFILE = args[0]
LOOP = int(args[args.index('--loop') + 1]) if '--loop' in args else 1
NO_LEAVE = '--no-leave' in args
NO_VERIFY = '--no-verify' in args

# ---------- Intel HEX ----------
def parse_hex(path):
    segs, upper = [], 0
    with open(path) as f:
        for line in f:
            line = line.strip()
            if not line or line[0] != ':':
                continue
            n = int(line[1:3], 16); off = int(line[3:7], 16); typ = int(line[7:9], 16)
            body = bytes(int(line[9 + i * 2:11 + i * 2], 16) for i in range(n))
            if typ == 0:
                addr = upper + off
                if segs and segs[-1][0] + len(segs[-1][1]) == addr:
                    segs[-1][1] += body
                else:
                    segs.append([addr, bytearray(body)])
            elif typ == 1:
                break
            elif typ == 4:
                upper = ((body[0] << 8) | body[1]) << 16
            elif typ == 2:
                upper = ((body[0] << 8) | body[1]) << 4
    segs.sort(key=lambda s: s[0])
    return segs

def parse_layout(s):
    m = re.search(r'/0x([0-9a-fA-F]+)/(.+)', s or '')
    if not m:
        return []
    addr, out = int(m.group(1), 16), []
    for part in m.group(2).split(','):
        pm = re.match(r'(\d+)\*(\d+)([KMB])', part)
        if not pm:
            continue
        cnt = int(pm.group(1)); unit = {'K': 1024, 'M': 1048576, 'B': 1}[pm.group(3)]
        size = int(pm.group(2)) * unit
        for _ in range(cnt):
            out.append((addr, size)); addr += size
    return out

F4_FALLBACK = [(0x08000000 + a, s) for a, s in
               [(0, 16 * 1024), (16 * 1024, 16 * 1024), (32 * 1024, 16 * 1024), (48 * 1024, 16 * 1024),
                (64 * 1024, 64 * 1024)] + [(128 * 1024 + i * 128 * 1024, 128 * 1024) for i in range(7)]]

# ---------- DFU primitives ----------
def get_status(dev, intf, timeout=8000):
    d = dev.ctrl_transfer(0xA1, 3, 0, intf, 6, timeout=timeout)
    return d[0], d[1] | (d[2] << 8) | (d[3] << 16), d[4]  # status, poll(ms), state

def dnload(dev, intf, w, data, timeout=8000):
    dev.ctrl_transfer(0x21, 1, w, intf, data, timeout=timeout)

def upload(dev, intf, w, length, timeout=8000):
    return dev.ctrl_transfer(0xA1, 2, w, intf, length, timeout=timeout)

def abort(dev, intf):
    try:
        dev.ctrl_transfer(0x21, 6, 0, intf)
    except Exception:
        pass

def reset_idle(dev, intf):
    # ABORT returns the DFU state machine to dfuIDLE (from dfuUPLOAD_IDLE after a verify,
    # or dfuDNLOAD_IDLE after a write); clear any latched error. Required between cycles,
    # else the next DNLOAD is stalled (libusb "Pipe error").
    abort(dev, intf)
    try:
        s, p, st = get_status(dev, intf)
        if st == 10:  # dfuERROR
            dev.ctrl_transfer(0x21, 4, 0, intf)  # CLRSTATUS
            get_status(dev, intf)
    except Exception:
        pass

def wait_done(dev, intf):
    # Re-poll quickly instead of sleeping the device's (often conservative) bwPollTimeout,
    # so each op returns as soon as it actually completes. If the bootloader stalls EP0
    # while busy (e.g. a 128KB erase), get_status simply blocks until done — also fine.
    while True:
        s, p, st = get_status(dev, intf)
        if st != 4:  # 4 = dfuDNBUSY
            break
        time.sleep(min(p, 2) / 1000.0)
    if s != 0:
        raise RuntimeError("DFU status %d" % s)

def dfuse_cmd(dev, intf, payload):
    dnload(dev, intf, 0, payload)
    wait_done(dev, intf)

def set_addr(dev, intf, addr):
    dfuse_cmd(dev, intf, bytes([0x21]) + struct.pack('<I', addr))

# ---------- operations ----------
def do_erase(dev, intf, layout, lo, hi):
    es = [st for st, sz in layout if st < hi and st + sz > lo]
    for st in es:
        dfuse_cmd(dev, intf, bytes([0x41]) + struct.pack('<I', st))
    return len(es)

def do_write(dev, intf, segs):
    written = 0
    for addr, data in segs:
        set_addr(dev, intf, addr)
        blk = 2
        for o in range(0, len(data), XFER):
            dnload(dev, intf, blk, bytes(data[o:o + XFER]))
            try:
                wait_done(dev, intf)
            except RuntimeError as e:
                raise RuntimeError("write fail @0x%08x: %s" % (addr + o, e))
            blk += 1; written += min(XFER, len(data) - o)
    return written

def do_verify(dev, intf, segs):
    checked, mism = 0, 0
    for addr, data in segs:
        abort(dev, intf)
        set_addr(dev, intf, addr)       # DfuSe: set read pointer
        abort(dev, intf)                 # back to dfuIDLE before UPLOAD
        blk = 2
        for o in range(0, len(data), XFER):
            n = min(XFER, len(data) - o)
            rd = bytes(upload(dev, intf, blk, n))
            exp = bytes(data[o:o + n])
            if rd[:len(exp)] != exp:
                for k in range(len(exp)):
                    if k >= len(rd) or rd[k] != exp[k]:
                        raise RuntimeError("VERIFY MISMATCH @0x%08x exp=%02x got=%02x"
                                           % (addr + o + k, exp[k], (rd[k] if k < len(rd) else -1)))
            blk += 1; checked += n
    return checked

def do_leave(dev, intf, lo):
    set_addr(dev, intf, lo)
    try:
        dnload(dev, intf, 2, b'')
        get_status(dev, intf)
    except Exception:
        pass

# ---------- main ----------
def main():
    be = usb.backend.libusb1.get_backend(find_library=libusb_package.find_library)
    dev = usb.core.find(idVendor=VID, idProduct=PID, backend=be)
    if dev is None:
        print("NO DEVICE (not in DFU mode?)"); sys.exit(2)
    intf = 0
    try:
        dev.set_configuration()
    except Exception:
        pass
    usb.util.claim_interface(dev, intf)
    dev.set_interface_altsetting(interface=intf, alternate_setting=0)
    try:
        layout = parse_layout(usb.util.get_string(dev, 4))
    except Exception:
        layout = []
    if not layout:
        layout = F4_FALLBACK; print("(using F4 fallback sector map)")
    abort(dev, intf)
    try:
        s, p, st = get_status(dev, intf)
        if st == 10:
            dev.ctrl_transfer(0x21, 4, 0, intf); get_status(dev, intf)
    except Exception:
        pass

    segs = parse_hex(HEXFILE)
    lo = segs[0][0]; hi = segs[-1][0] + len(segs[-1][1]); total = sum(len(s[1]) for s in segs)
    print("HEX 0x%08x-0x%08x  %d bytes  (loop=%d verify=%s)" % (lo, hi, total, LOOP, not NO_VERIFY))

    ok = 0
    for it in range(1, LOOP + 1):
        reset_idle(dev, intf)   # back to dfuIDLE before each cycle (fixes inter-cycle Pipe error)
        t0 = time.time()
        ns = do_erase(dev, intf, layout, lo, hi); te = time.time()
        w = do_write(dev, intf, segs); tw = time.time()
        vmsg = ""
        if not NO_VERIFY:
            c = do_verify(dev, intf, segs); tv = time.time()
            vmsg = "verify %d OK %.1fs" % (c, tv - tw)
        else:
            tv = tw
        print("[%d/%d] erase %d/%.1fs  write %d/%.1fs  %s  total %.1fs"
              % (it, LOOP, ns, te - t0, w, tw - te, vmsg, tv - t0)); sys.stdout.flush()
        ok += 1

    print("STABLE: %d/%d iteration(s) passed" % (ok, LOOP))
    if NO_LEAVE:
        print("(staying in DFU)")
    else:
        reset_idle(dev, intf)   # idle before the leave's Set Address (else Pipe error)
        do_leave(dev, intf, lo); print("Left DFU -> device rebooting")

if __name__ == '__main__':
    main()
