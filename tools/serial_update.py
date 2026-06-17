#!/usr/bin/env python3
# ArduPilot/PX4 serial app-update over USB CDC (pyserial + pymavlink).
# Reboots the running app into its bootloader, finds the re-enumerated port, then
# erase/program/verify/boot via the PX4 serial bootloader protocol. Flashes an .apj.
#   serial_update.py <app_com> <apj>
import sys, time, struct, zlib, json, base64
import serial
import serial.tools.list_ports as lp
from pymavlink import mavutil

APP_PORT = sys.argv[1]
APJ = sys.argv[2]
EXCLUDE = {'COM5'}  # CH340 USB-serial, not our board

# PX4 bootloader protocol
INSYNC, EOC, OK, FAILED, INVALID = 0x12, 0x20, 0x10, 0x11, 0x13
GET_SYNC, GET_DEVICE, CHIP_ERASE, PROG_MULTI, GET_CRC, REBOOT = 0x21, 0x22, 0x23, 0x27, 0x29, 0x30
INFO_BL_REV, INFO_BOARD_ID, INFO_FLASH_SIZE = 1, 2, 4
PROG_MAX = 252

_CRCTAB = []
for _n in range(256):
    _c = _n
    for _ in range(8):
        _c = (0xedb88320 ^ (_c >> 1)) if (_c & 1) else (_c >> 1)
    _CRCTAB.append(_c & 0xffffffff)

def px4_crc(data):
    # PX4 bootloader CRC32: standard poly (0xedb88320), init=0, NO final XOR.
    # (zlib.crc32 uses init=0xFFFFFFFF + final XOR, hence the earlier mismatch.)
    state = 0
    for b in data:
        state = _CRCTAB[(state ^ b) & 0xff] ^ (state >> 8)
    return state & 0xffffffff

def ports():
    return [p.device for p in lp.comports() if p.device not in EXCLUDE]

class BL:
    def __init__(self, dev):
        self.s = serial.Serial(dev, 115200, timeout=5)
        self.dev = dev
    def _getsync(self):
        d = self.s.read(2)
        if len(d) != 2 or d[0] != INSYNC:
            raise RuntimeError("no INSYNC (%s)" % d.hex())
        if d[1] != OK:
            raise RuntimeError("sync code 0x%02x" % d[1])
    def sync(self):
        self.s.reset_input_buffer()
        self.s.write(bytes([GET_SYNC, EOC])); self.s.flush()
        self._getsync()
    def info(self, param):
        self.s.write(bytes([GET_DEVICE, param, EOC])); self.s.flush()
        v = self.s.read(4); self._getsync()
        return int.from_bytes(v, 'little')
    def erase(self):
        self.s.write(bytes([CHIP_ERASE, EOC])); self.s.flush()
        self.s.timeout = 30; self._getsync(); self.s.timeout = 5
    def prog(self, data, log):
        # pad to 4-byte multiple
        if len(data) % 4:
            data = data + b'\xff' * (4 - len(data) % 4)
        total = len(data)
        for o in range(0, total, PROG_MAX):
            chunk = data[o:o + PROG_MAX]
            self.s.write(bytes([PROG_MULTI, len(chunk)]) + chunk + bytes([EOC])); self.s.flush()
            self._getsync()
            if (o // PROG_MAX) % 64 == 0:
                log("  program %d/%d (%d%%)" % (o, total, o * 100 // total))
        return data
    def crc(self):
        self.s.write(bytes([GET_CRC, EOC])); self.s.flush()
        v = self.s.read(4); self._getsync()
        return int.from_bytes(v, 'little')
    def reboot(self):
        try:
            self.s.write(bytes([REBOOT, EOC])); self.s.flush()
        except Exception:
            pass
    def close(self):
        try: self.s.close()
        except Exception: pass

def load_apj(path):
    j = json.load(open(path))
    img = zlib.decompress(base64.b64decode(j['image']))
    extf = j.get('extf_image')
    extf_bytes = zlib.decompress(base64.b64decode(extf)) if extf else b''
    return j, img, extf_bytes

def reboot_to_bl(log):
    log("connecting MAVLink on %s ..." % APP_PORT)
    m = mavutil.mavlink_connection(APP_PORT, baud=115200)
    try:
        m.wait_heartbeat(timeout=8)
        log("  heartbeat sys=%d comp=%d -> reboot to bootloader" % (m.target_system, m.target_component))
        m.reboot_autopilot(hold_in_bootloader=True)
        time.sleep(0.5)
    finally:
        m.close()  # always release the port (device may already be in bootloader = no heartbeat)

def find_bl(log, timeout=20):
    log("waiting for bootloader ...")
    end = time.time() + timeout
    while time.time() < end:
        for d in ports():
            try:
                bl = BL(d); bl.s.timeout = 0.5
                bl.sync(); bl.s.timeout = 5
                log("  bootloader on %s" % d)
                return bl
            except Exception:
                try: bl.close()
                except Exception: pass
        time.sleep(0.3)
    return None

def main():
    log = lambda m: (print(m), sys.stdout.flush())
    j, img, extf = load_apj(APJ)
    log("APJ board_id=%s image=%d bytes extf=%d bytes" % (j.get('board_id'), len(img), len(extf)))

    try:
        reboot_to_bl(log)
    except Exception as e:
        log("  (reboot via MAVLink failed: %s — maybe already in bootloader)" % e)

    bl = find_bl(log)
    if not bl:
        log("BOOTLOADER NOT FOUND"); sys.exit(1)
    try:
        bid = bl.info(INFO_BOARD_ID); fsz = bl.info(INFO_FLASH_SIZE); rev = bl.info(INFO_BL_REV)
        log("  BL rev=%d board_id=%d flash=%d" % (rev, bid, fsz))
        if extf:
            log("  ⚠ this .apj has an external-flash image (%d B) — not handled by this CLI yet" % len(extf))
        t0 = time.time()
        log("erase ...")
        bl.erase()
        log("program %d bytes ..." % len(img))
        padded = bl.prog(img, log)
        local = px4_crc(bytes(padded) + b'\xff' * (fsz - len(padded)))
        dev_crc = bl.crc()
        ok = dev_crc == local
        log("CRC device=0x%08x local=0x%08x -> %s" % (dev_crc, local, "OK" if ok else "MISMATCH"))
        if not ok:
            log("VERIFY FAILED"); bl.close(); sys.exit(2)
        log("reboot -> run app (%.1fs)" % (time.time() - t0))
        bl.reboot()
    finally:
        bl.close()
    log("DONE")

if __name__ == '__main__':
    main()
