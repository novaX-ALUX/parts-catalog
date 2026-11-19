// 웹판 펌웨어 굽기용 포트 다리 — crates/web fw.rs 의 FwIo(= 데스크톱 dsf_fw::serial::SerialLink 자리).
// 굽기 순서(dsf_fw::session)가 부르는 것: write · read(많아야 n, 기다림 ms) · now · sleep · close · reopen.
//
// reopen: 장치가 부트로더로(또는 새 앱으로) 다시 켜지면 USB 에서 빠졌다 다시 붙고, 브라우저는 그것을 새 포트로 준다.
// 같은 VID·PID·일련번호라 허락은 이어지므로 고르기 창 없이 getPorts() 에 다시 나온다 — 처음에 있던 '다른 장치'(others)가
// 아닌 포트를 연다. 아직 안 붙었으면 거절 → 굽기 순서가 0.3초 뒤 다시 부른다(20초까지 · session wait_reconnect).
const ST_VID = 0x0483;
export const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/** 받은 조각을 쌓아 두고 '많아야 n 바이트 · 기다림 ms' 로 꺼냄 — fwIo 와 웹판 ESC(web_api.js withEscPort)가 같이 씀 */
export function inbox() {
  let chunks = [], size = 0, wake = null;
  function take(max) {
    const out = new Uint8Array(Math.min(max, size));
    let n = 0;
    while (n < out.length) {
      const c = chunks[0], k = Math.min(c.length, out.length - n);
      out.set(c.subarray(0, k), n); n += k;
      if (k === c.length) chunks.shift(); else chunks[0] = c.subarray(k);
    }
    size -= n;
    return out;
  }
  return {
    push(v) { chunks.push(v); size += v.length; wake?.(); },
    clear() { chunks = []; size = 0; },
    /** 기다리는 읽기를 깨움(포트가 닫힘 등) */
    poke() { wake?.(); },
    /** 쌓인 게 없고 `waitable()` 이면 `timeoutMs` 까지 기다림 · 그래도 없고 `closed()` 면 거절 */
    async read(max, timeoutMs, waitable, closed) {
      if (!size && waitable()) {
        await new Promise((ok) => { const t = setTimeout(ok, timeoutMs); wake = () => { clearTimeout(t); ok(); }; });
        wake = null;
      }
      if (!size && closed()) throw "포트가 닫혀 있음";
      return take(max);
    },
  };
}

export function fwIo(first, others, rebind) {
  let port = first, reader = null, writer = null, pumping = null, closing = null;
  const box = inbox();

  // 데스크톱 SerialLink 와 같은 설정(115200 · 8N1 · 흐름 제어 없음 — USB 가상 직렬이라 속도 숫자는 쓰이지 않음)
  async function open(p) {
    await p.open({ baudRate: 115200, dataBits: 8, parity: "none", stopBits: 1, flowControl: "none", bufferSize: 8192 });
    await p.setSignals({ dataTerminalReady: false, requestToSend: false }).catch(() => {});
    port = p;
    box.clear();
    writer = p.writable.getWriter();
    pumping = pump(p);
  }

  async function pump(p) {
    reader = p.readable.getReader();
    try {
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        if (value?.length) box.push(value);
      }
    } catch { /* 장치가 빠짐(다시 켜짐) — 다음 reopen 이 새 포트를 연다 */ }
    finally { try { reader.releaseLock(); } catch {} reader = null; box.poke(); }
  }

  async function shut() {
    const p = port;
    try { await reader?.cancel(); } catch {}
    await pumping?.catch(() => {});
    try { writer?.releaseLock(); } catch {}
    writer = null; pumping = null;
    try { await p?.close(); } catch {}
  }

  return {
    start: () => open(first),
    async write(bytes) {
      if (!writer) throw "포트가 닫혀 있음";
      await writer.write(bytes);
    },
    read: (max, timeoutMs) => box.read(max, timeoutMs, () => !!reader, () => !reader && !writer),
    now: () => performance.now(),
    sleep: (ms) => wait(ms),
    // 굽기 순서의 close 는 기다리지 않는다 — 다음 reopen 이 닫기가 끝나기를 기다린다
    close() { closing = shut(); port = null; return closing; },
    async reopen() {
      await closing;
      await shut();
      const list = (await navigator.serial.getPorts()).filter((p) => (p.getInfo().usbVendorId ?? ST_VID) === ST_VID && !others.includes(p));
      let last = "아직 다시 붙지 않음";
      for (const p of list) {
        try { await open(p); rebind(p); return; } catch (e) { last = String(e?.message ?? e); }
      }
      throw last;
    },
  };
}
