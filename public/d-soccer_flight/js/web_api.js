// 브라우저판(웹) 속 — 데스크톱 일꾼(crates/link worker.rs)이 하던 포트 일을 Web Serial 로 한다.
// 언제 무엇을 보내고 끊을지는 데스크톱과 같은 상태 기계(crates/web → pkg/dsf_web.wasm)가 정한다.
// 할 일 목록(open · write · close · sleep · event)을 받은 순서대로 하고, open 결과를 알려 준 뒤 생긴 일은 남은 일 뒤에 잇는다(worker.rs flush 와 같음).
// 앱 펌웨어 굽기: 순서·확인은 데스크톱과 같은 dsf_fw(wasm fwProbe · fwUpdate), 포트만 여기 fwIo 가 쥔다.
// 부트로더·ESC 굽기는 아직 PC판에서만 — bl* 은 없음(화면이 부트로더 단계를 건너뜀) · esc* 는 WEB_ONLY 예외.
import init, { WebLink, appVersion, fwCheck, fwProbe, fwUpdate } from "../pkg/dsf_web.js";
import { fwIo } from "./web_fw_io.js";

export const WEB_ONLY = "웹판에서는 아직 안 되는 기능 — PC판을 쓰세요";
const ST_VID = 0x0483; // 드론·조종기 USB(STM32 가상 COM)
const POLL_OPEN = 5, POLL_IDLE = 100; // worker.rs 와 같은 간격(ms)
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const errText = (e) => String(e?.message ?? e);

export async function webApi() {
  await init({ module_or_path: new URL("../pkg/dsf_web_bg.wasm", import.meta.url) });
  const link = new WebLink();
  const subs = new Set();
  const names = new WeakMap(); // SerialPort → "USB1" …(브라우저는 COM 이름을 안 알려 줌)
  const byName = new Map();
  let seq = 0, port = null, writer = null, reader = null, opening = false, askAgain = false;
  const queue = [];
  let running = false;

  const nameOf = (p) => {
    if (!names.has(p)) { const n = "USB" + ++seq; names.set(p, n); byName.set(n, p); }
    return names.get(p);
  };
  const emit = (ev) => {
    if (ev.kind === "status") askAgain = ev.state === "disconnected" && ev.reason === "notFound"; // 못 찾았으면 다음엔 포트 고르기 창
    subs.forEach((f) => f(ev));
  };

  /** 상태 기계가 준 할 일(JSON 글자)을 뒤에 잇고, 아무도 안 돌고 있으면 차례로 한다 */
  async function run(json) {
    const steps = JSON.parse(json);
    if (!steps.length) return;
    queue.push(...steps);
    if (running) return;
    running = true;
    try { while (queue.length) await step(queue.shift()); }
    finally { running = false; }
  }

  async function step(s) {
    switch (s.do) {
      case "open": {
        await closePort();
        opening = true;
        let err = null;
        try { await openPort(byName.get(s.port)); } catch (e) { err = errText(e); await closePort(); }
        opening = false;
        queue.push(...JSON.parse(link.openResult(err)));
        break;
      }
      case "write":
        if (!writer) break;
        try { await writer.write(new Uint8Array(s.bytes)); }
        catch (e) { queue.push(...JSON.parse(link.ioError(errText(e)))); }
        break;
      case "close": await closePort(); break;
      case "sleep": await wait(s.ms); break;
      case "event": emit(s.event); break;
    }
  }

  // 57600 8N1 · 흐름 제어 없음 · DTR·RTS 끔(원본 .NET SerialPort 기본값 · worker.rs open_port 와 같음)
  async function openPort(p) {
    if (!p) throw new Error("포트 없음");
    await p.open({ baudRate: 57600, dataBits: 8, parity: "none", stopBits: 1, flowControl: "none", bufferSize: 8192 });
    await p.setSignals({ dataTerminalReady: false, requestToSend: false }).catch(() => {});
    port = p;
    writer = p.writable.getWriter();
    readLoop(p);
    setPoll(POLL_OPEN);
  }

  async function readLoop(p) {
    while (port === p && p.readable) {
      reader = p.readable.getReader();
      try {
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          if (value?.length) run(link.bytes(value));
        }
      } catch (e) {
        if (port === p) run(link.ioError(errText(e))); // 선 뽑힘 등 → 상태 기계가 끊기·알림
        break;
      } finally {
        try { reader.releaseLock(); } catch {}
        reader = null;
      }
    }
  }

  async function closePort() {
    const p = port;
    if (!p) return;
    port = null;
    setPoll(POLL_IDLE);
    try { await reader?.cancel(); } catch {}
    try { writer?.releaseLock(); } catch {}
    writer = null;
    try { await p.close(); } catch {}
  }

  // 시간 흐름 — 숨은 탭에서도 느려지지 않게 작은 일꾼(Worker)의 시계를 씀
  const clock = new Worker(URL.createObjectURL(new Blob(
    ["let t=null;onmessage=(e)=>{clearInterval(t);t=setInterval(()=>postMessage(0),e.data)}"], { type: "text/javascript" })));
  let pollMs = 0;
  function setPoll(ms) { if (ms !== pollMs) { pollMs = ms; clock.postMessage(ms); } }
  clock.onmessage = () => { if (!opening) run(link.tick()); };
  setPoll(POLL_IDLE);

  // 드론·조종기 포트 — 허락받은 것 + (처음이거나 지난번에 못 찾았으면) 포트 고르기 창
  async function ports() {
    if (!navigator.serial) return [];
    const list = (await navigator.serial.getPorts()).filter((p) => (p.getInfo().usbVendorId ?? ST_VID) === ST_VID);
    if (!list.length || askAgain) {
      try {
        const p = await navigator.serial.requestPort({ filters: [{ usbVendorId: ST_VID }] });
        if (!list.includes(p)) list.push(p);
      } catch { /* 창을 닫음 — 있는 것으로 찾기(없으면 '찾지 못함') */ }
    }
    return list.map(nameOf);
  }
  navigator.serial?.addEventListener("disconnect", (e) => {
    if (e.target === port) run(link.ioError("USB 장치가 빠짐"));
  });
  addEventListener("pagehide", () => run(link.shutdown()));

  const webOnly = async () => { throw new Error(WEB_ONLY); };
  const PROFILE = "dsf-profile-";

  // ── 앱 펌웨어 굽기(데스크톱 src-tauri/src/firmware.rs 와 같은 일 · 같은 결과 꼴) ──
  const fwSubs = new Set();
  let fwBusy = false, fwPort = null;
  const fwError = (e) => { try { return JSON.parse(e); } catch { return { kind: "io", code: 14, text: errText(e) }; } };
  /** 본 연결을 닫고 닫힐 때까지 기다림 — 연결돼 있던 포트 이름을 기억해 돌려줌(원본 CloseSerial) */
  async function release() {
    const s = JSON.parse(link.snapshot());
    if (s.state === "connected" && s.port) fwPort = s.port;
    if (s.state !== "disconnected") {
      await run(link.disconnect());
      const t0 = performance.now();
      while (JSON.parse(link.snapshot()).state !== "disconnected" || port) {
        if (performance.now() - t0 > 5000) throw { kind: "busy", code: 7, text: "본 연결이 5초 안에 닫히지 않음" };
        await wait(50);
      }
    }
    return fwPort;
  }
  /** 굽기 한 번 — 본 연결을 닫고 그 포트를 fwIo 로 열어 `job(io, 이름)` */
  async function withFwPort(name, job) {
    if (fwBusy) throw { kind: "busy", code: 14, text: "이미 굽는 중" };
    fwBusy = true;
    try {
      const remembered = await release();
      const use = name ?? remembered;
      const p = use && byName.get(use);
      if (!p) throw { kind: "noPort", code: 2, text: "연결된 포트가 없음 — 장치를 먼저 연결" };
      const others = (await navigator.serial.getPorts()).filter((x) => x !== p); // 다른 장치 — 다시 켜진 뒤 우리 장치를 가려내는 데 씀
      // 다시 켜진 장치는 브라우저가 새 포트로 준다 — 같은 이름에 다시 묶어 다음 굽기·연결도 그 이름으로
      const io = fwIo(p, others, (np) => { names.set(np, use); byName.set(use, np); });
      await io.start();
      try { return JSON.parse(await job(io, use)); } catch (e) { throw fwError(e); } finally { await io.close(); }
    } finally { fwBusy = false; }
  }

  return {
    real: true,
    web: true,
    serial: !!navigator.serial, // false = 이 브라우저는 USB 직렬을 못 씀(크롬·엣지 필요)
    connect: async () => run(link.connect(await ports())),
    disconnect: async () => run(link.disconnect()),
    send: async (dataType, payload, to = null) => run(link.send(dataType, Uint8Array.from(payload), to ?? undefined)),
    escMode: async (on) => run(link.setEscMode(on)),
    status: async () => JSON.parse(link.snapshot()),
    version: async () => appVersion(),
    profileLoad: async (n) => localStorage.getItem(PROFILE + n),
    profileSave: async (n, json) => localStorage.setItem(PROFILE + n, json),
    onEvent: async (cb) => { subs.add(cb); return () => subs.delete(cb); },
    // 인터넷 받기 — 카탈로그 파일은 같은 사이트라 바로 받는다. 지문(SHA-256)을 주면 맞춰 본다(src-tauri/src/net.rs 와 같음)
    netGet: async (url, sha256) => {
      const res = await fetch(url, { cache: "no-cache" });
      if (!res.ok) throw new Error(`받기 실패 ${res.status}`);
      const buf = await res.arrayBuffer();
      if (sha256) {
        const hex = [...new Uint8Array(await crypto.subtle.digest("SHA-256", buf))].map((b) => b.toString(16).padStart(2, "0")).join("");
        if (hex !== sha256.toLowerCase()) throw new Error("파일 지문이 다름");
      }
      return buf;
    },
    fwRelease: async () => release(),
    fwCheck: async (bytes) => { try { return JSON.parse(fwCheck(Uint8Array.from(bytes))); } catch (e) { throw fwError(e); } },
    fwProbe: (name, bytes) => withFwPort(name, (io, use) => fwProbe(io, Uint8Array.from(bytes), use)),
    fwUpdate: (name, bytes) => withFwPort(name, (io, use) => fwUpdate(io, Uint8Array.from(bytes), use, (j) => { const ev = JSON.parse(j); fwSubs.forEach((f) => f(ev)); })),
    onFw: async (cb) => { fwSubs.add(cb); return () => fwSubs.delete(cb); },
    // 부트로더(칩 안 DFU)는 아직 PC판만 — bl* 이 없으면 화면(firmware.js bootStep)이 그 단계를 건너뛴다
    escRead: webOnly, escConfig: webOnly, escFlash: webOnly, escLeave: async () => {}, onEsc: async () => () => {},
  };
}
