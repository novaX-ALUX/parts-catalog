// 인터넷 펌웨어 목록.
//  · 드론·조종기(펌웨어 창 firmware.js): 깃카탈로그(parts-catalog)의 firmware/dsoccer/index.json 이 정본이다.
//    앱 안에도 장치마다 가장 새 것 하나가 들어 있어(ui/assets/firmware/ · tools/fw_publish.mjs embed) 인터넷이 없어도 굽는다.
//    카탈로그에서 받은 파일은 목록의 지문(SHA-256)과 맞춰 본 뒤에만 쓴다(src-tauri/src/net.rs).
//  · ESC(esc_update.js): 같은 카탈로그의 firmware/dsoccer/esc/index.json(dsoccer-esc-firmware/1 · tools/fw_publish.mjs 가 만듦)
//    — 웹·PC 같은 목록 · 파일은 지문을 맞춰 본 뒤에만 쓴다. 2.12.x 까지는 회사 SharePoint 글 파일이라 웹판은 받을 수 없었다.
// PC 는 속(src-tauri/src/net.rs)이 받고, 웹은 같은 사이트(github.io)라 화면이 바로 받는다(web_api.js netGet).
import { api } from "./api.js";

export const CATALOG_FW = "https://novax-alux.github.io/parts-catalog/firmware/dsoccer/";
const BUILTIN_FW = new URL("../assets/firmware/", import.meta.url).href;
const SCHEMA = "dsoccer-firmware/1";
const ESC_SCHEMA = "dsoccer-esc-firmware/1";

export const LIST_URL = { esc: CATALOG_FW + "esc/index.json" };

/** ESC 목록(dsoccer-esc-firmware/1) → [{ name, url, sha256, default }] — default = 처음에 골라 둘 것(카탈로그가 정함) */
export function escRows(index, base) {
  if (index?.schema !== ESC_SCHEMA || !Array.isArray(index.firmware)) throw new Error("ESC 펌웨어 목록 모양이 다름");
  return index.firmware.map((f) => ({ name: f.name, url: base + f.file, sha256: f.sha256, default: !!f.default }));
}

/** 주소의 내용을 바이트로 받기 — 못 받으면 예외(원본 ConnectionError 갈래). sha256 을 주면 속이 맞춰 본다 */
export async function fetchBytes(url, sha256) {
  return new Uint8Array(await api.netGet(url.replace(/"/g, ""), sha256)); // 원본 DownloadFile: fileURL.Replace("\"", "")
}

/** ESC 목록 받기 — 파일 주소는 목록이 있는 폴더 기준 */
export async function fetchList(url) {
  return escRows(JSON.parse(new TextDecoder().decode(await fetchBytes(url))), url.replace(/[^/]*$/, ""));
}

/** dsoccer-firmware/1 목록 → [{ device, name, file, version, date, size, sha256, url, builtin }] */
export function firmwareRows(index, base, builtin) {
  if (index?.schema !== SCHEMA || !Array.isArray(index.firmware)) throw new Error("펌웨어 목록 모양이 다름");
  return index.firmware.map((f) => ({ ...f, url: base + f.file, builtin }));
}

/** 같은 파일(지문)은 앱 안의 것으로 바꿔 끼운다(내려받지 않음). 카탈로그 차례를 따르고, 카탈로그에 없는 앱 안의 것은 뒤에 */
export function mergeFirmware(online, local) {
  const mine = new Map(local.map((f) => [f.sha256, f]));
  const list = online.map((f) => mine.get(f.sha256) ?? f);
  for (const f of local) if (!list.includes(f)) list.push(f);
  return list;
}

/** 드론·조종기 펌웨어 목록 — online: 카탈로그를 받았는가(못 받으면 앱 안의 것만) */
export async function fetchFirmwareList() {
  let local = [], online = [], ok = false;
  try { local = firmwareRows(await (await fetch(BUILTIN_FW + "index.json")).json(), BUILTIN_FW, true); }
  catch (e) { console.warn("[fw] 앱 안 목록을 못 읽음", e); }
  try {
    online = firmwareRows(JSON.parse(new TextDecoder().decode(await fetchBytes(CATALOG_FW + "index.json"))), CATALOG_FW, false);
    ok = true;
  } catch (e) { console.info("[fw] 카탈로그 목록 못 받음: " + (e?.message ?? e)); }
  return { list: mergeFirmware(online, local), online: ok };
}

/** 고른 펌웨어의 바이트 — 앱 안의 것은 그대로 읽고, 카탈로그 것은 받아서 지문을 맞춰 본다 */
export async function firmwareBytes(f) {
  if (f.builtin) return new Uint8Array(await (await fetch(f.url)).arrayBuffer());
  return fetchBytes(f.url, f.sha256);
}
