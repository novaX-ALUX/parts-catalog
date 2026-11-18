// 가짜 펌웨어 굽기 — 브라우저 화면 시험용(앱 안에서는 src-tauri/src/firmware.rs 가 진짜로 한다). 돌려주는 모양은 그쪽과 같다.
// 주소 고르기: &fwdev=p2 → 옛 드론(Drone_13_Drone_P2 v1.0.38, 파일이 맞지 않음 74) · 기본 p3(Drone_13_Drone_P3 v1.3.5)
//              &fwboot=1 → 이미 부트로더 · window.__mockFwMs(보내기 시간, 기본 6000) · window.__mockFwFail = true → 40% 에서 실패
const MODELS = {
  p3: { modelNumber: 0x000d1003, version: [1, 3, 5], date: [2026, 7, 24] },
  p2: { modelNumber: 0x000d1002, version: [1, 0, 38], date: [2024, 7, 25] },
  controller: { modelNumber: 0x000d2002, version: [1, 0, 13], date: [2024, 10, 14] },
};
const NAMES = { 0x10: "Drone", 0x20: "Controller" };
const modelName = (m) => `Drone_${m >>> 16}_${NAMES[(m >> 8) & 0xff] ?? "Device"}_P${m & 0xff}`;
const vtext = (v) => `${v >>> 24}.${(v >> 16) & 0xff}.${v & 0xffff}`;
const vval = ([a, b, c]) => ((a << 24) | (b << 16) | c) >>> 0;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const fail = (kind, code, text, found = null) => Promise.reject({ kind, code, text, found });

function info(dev, boot) {
  const v = vval(dev.version);
  return { modeUpdate: boot ? 1 : 0, modeLabel: boot ? "Ready·부트로더 대기" : "None·앱 실행 중", bootloader: boot,
    modelNumber: dev.modelNumber, modelName: modelName(dev.modelNumber), version: vtext(v), versionValue: v,
    year: dev.date[0], month: dev.date[1], day: dev.date[2] };
}

// 원본 FileOpen(true, true): 끝 0xFF 자르기 → 32 배수 채우기 → 헤더 32 를 뺀 길이
function check(bytes) {
  if (bytes.length <= 32) return null;
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let n = bytes.length;
  while (n > 1 && bytes[n - 1] === 0xff) n--;
  n = Math.ceil(n / 32) * 32;
  const m = dv.getUint32(0, true), v = dv.getUint32(4, true);
  if (!NAMES[(m >> 8) & 0xff]) return null;
  return { modelNumber: m, modelName: modelName(m), deviceType: (m >> 8) & 0xff, version: vtext(v), versionValue: v,
    year: dv.getUint16(12, true), month: bytes[14], day: bytes[15], length: n - 32, fileLen: bytes.length, crc32: 0 };
}

export function mockFw({ release }) {
  const q = new URLSearchParams(location.search);
  const dev = MODELS[q.get("fwdev") || "p3"] ?? MODELS.p3;
  let boot = q.get("fwboot") === "1";
  let remembered = null;
  const subs = new Set(), blSubs = new Set();
  const emit = (stage, done, total, text = "") => subs.forEach((f) => f({ stage, done, total, text }));
  const blEmit = (stage, done, total, text = "") => blSubs.forEach((f) => f({ stage, done, total, text }));
  const portOf = (port) => port ?? remembered;

  return {
    fwRelease: async () => { if (release()) remembered = "COM7"; await sleep(150); return remembered; },
    fwCheck: async (bytes) => check(bytes) ?? fail("file", 74, "앱만 든 업데이트 파일(_App.ax)이 아님"),
    fwProbe: async (port, bytes) => {
      const f = check(bytes);
      if (!f) return fail("file", 74, "파일이 이상함");
      if (!portOf(port)) return fail("noPort", 2, "연결된 포트가 없음");
      await sleep(700);
      if (f.modelNumber !== dev.modelNumber) {
        return fail("notCorrect", 74, `펌웨어 파일이 장치와 맞지 않음: 파일 모델 0x${f.modelNumber.toString(16).padStart(8, "0").toUpperCase()}, 장치 0x${dev.modelNumber.toString(16).padStart(8, "0").toUpperCase()}(보낸이 0x10)`, modelName(dev.modelNumber));
      }
      return { port: portOf(port), info: info(dev, boot) };
    },
    fwUpdate: async (port, bytes) => {
      const f = check(bytes), total = f.length + 32, before = info(dev, boot);
      emit("check", 0, total); await sleep(500);
      const switched = !boot;
      if (switched) { emit("boot", 0, total, "부트로더로 바꾸라고 보냄 — 장치가 1초 뒤 다시 켜짐"); await sleep(2500); boot = true; }
      emit("transfer", 0, total, "메모리를 초기화 하고있습니다."); await sleep(1200);
      const ms = window.__mockFwMs ?? 6000, t0 = performance.now();
      for (;;) {
        const done = Math.min(total, Math.round(((performance.now() - t0) / ms) * total / 32) * 32);
        emit("transfer", done, total);
        if (window.__mockFwFail && done > total * 0.4) {
          emit("failed", done, total, "업데이트가 진행되지 않아 중단합니다.");
          return fail("failed", 14, `업데이트 실패: 업데이트가 진행되지 않아 중단합니다. (${done}/${total} 바이트에서)`);
        }
        if (done >= total) break;
        await sleep(250);
      }
      emit("verify", total, total, "다시 켜진 장치의 정보를 읽는 중"); await sleep(1500);
      boot = false;
      dev.version = [f.versionValue >>> 24, (f.versionValue >> 16) & 0xff, f.versionValue & 0xffff];
      dev.date = [f.year, f.month, f.day];
      const after = info(dev, false);
      emit("done", total, total, `v${after.version} · ${after.year}.${String(after.month).padStart(2, "0")}.${String(after.day).padStart(2, "0")}`);
      return { port: portOf(port), before, after, switchedToBootloader: switched, resends: 1, transferMs: ms };
    },
    onFw: async (cb) => { subs.add(cb); return () => subs.delete(cb); },
    // 부트로더(칩 안 DFU) — window.__mockBlFail = true → 굽다 멈춤(장치가 DFU 에 남음) · __mockBlSame = true → 이미 같음 · __mockBlNoDriver = true
    blDriverReady: async () => !window.__mockBlNoDriver,
    blDriverInstall: async () => { await sleep(800); window.__mockBlNoDriver = false; return { ready: true, code: 0, log: "" }; },
    blUpdate: async (port, bytes, model) => {
      const total = bytes.length;
      for (const s of ["check", "enter", "flash", "read", "erase"]) { blEmit(s, 0, total); await sleep(300); }
      if (!window.__mockBlSame) {
        for (let done = 0; done < total; done = Math.min(total, done + 2048)) { blEmit("write", done, total); await sleep(60); }
        if (window.__mockBlFail) return fail("dfu", 14, "USB 오류: 파이프 오류");
        blEmit("write", total, total); blEmit("verify", total, total); await sleep(300);
      }
      blEmit("leave", total, total); await sleep(1200);
      return { port: portOf(port), same: !!window.__mockBlSame, bytes: total, ms: 1250, after: info(dev, false) };
    },
    blRetry: async (bytes) => { await sleep(1500); window.__mockBlFail = false; return { port: remembered, same: false, bytes: bytes.length, ms: 1250, after: info(dev, false) }; },
    onBl: async (cb) => { blSubs.add(cb); return () => blSubs.delete(cb); },
  };
}
