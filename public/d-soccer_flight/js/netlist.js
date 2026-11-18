// 인터넷 펌웨어 목록.
//  · 드론·조종기(펌웨어 창 firmware.js): 깃카탈로그(parts-catalog)의 firmware/dsoccer/index.json 이 정본이다.
//    앱 안에도 장치마다 가장 새 것 하나가 들어 있어(ui/assets/firmware/ · tools/fw_publish.mjs embed) 인터넷이 없어도 굽는다.
//    카탈로그에서 받은 파일은 목록의 지문(SHA-256)과 맞춰 본 뒤에만 쓴다(src-tauri/src/net.rs).
//  · ESC(esc_update.js): 원본 ESCFirmwareFileManager 그대로 — 회사 SharePoint 글 파일 "번호,이름,주소,…"(앞 세 칸은 머리).
// 받기는 속(src-tauri/src/net.rs)이 한다 — SharePoint 링크는 쿠키가 있어야 파일을 내주고, 화면(fetch)은 다른 곳에서 막힌다.
import { api } from "./api.js";

export const CATALOG_FW = "https://novax-alux.github.io/parts-catalog/firmware/dsoccer/";
const BUILTIN_FW = new URL("../assets/firmware/", import.meta.url).href;
const SCHEMA = "dsoccer-firmware/1";

const SP = "https://alux1004-my.sharepoint.com/:t:/g/personal/skji_aluxonline_com/";
export const LIST_URL = {
  esc: SP + "EWWweexXa4ROjArgDXqHV1IBOkftNeGmeD_GSeatmVX1zw?e=H4tqIE&download=1", // ESCFirmwareFileManager.url
};

/** 원본 GetFileList 의 나누기 그대로 */
export function parseFirmwareList(content) {
  const f = content.split(",");
  const list = [];
  for (let i = 3; i < f.length; i += 3) {
    if (i + 2 > f.length) break;
    list.push({ num: String(parseInt(f[i], 10)), name: f[i + 1], url: f[i + 2] + "&download=1" });
  }
  return list;
}

/** 주소의 내용을 바이트로 받기 — 못 받으면 예외(원본 ConnectionError 갈래). sha256 을 주면 속이 맞춰 본다 */
export async function fetchBytes(url, sha256) {
  return new Uint8Array(await api.netGet(url.replace(/"/g, ""), sha256)); // 원본 DownloadFile: fileURL.Replace("\"", "")
}

/** 목록 받아 나누기(ESC) */
export async function fetchList(url) {
  return parseFirmwareList(new TextDecoder().decode(await fetchBytes(url)));
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
