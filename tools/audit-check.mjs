// 배포 보안 점검 — `npm audit` 의 높음·심각 경보로 배포를 막되, tools/audit-allow.json 에 이유와 기한을 적은 경보만 뺀다.
// 쓰기: node tools/audit-check.mjs      (deploy.yml 의 npm audit --audit-level=high 를 대신함)
// 고친 판이 없는 경보(빌드 때만 쓰는 도구 등)로 사이트 전체 배포가 멈추지 않게 하려는 것 — 기한(until)이 지나면 다시 막힌다.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const BLOCK = new Set(["high", "critical"]);

let raw;
try {
  raw = execFileSync("npm", ["audit", "--json"], { encoding: "utf8", shell: process.platform === "win32", maxBuffer: 64 << 20 });
} catch (e) {
  raw = e.stdout; // 경보가 있으면 npm audit 는 1 로 끝남 — 내용은 stdout 에 있음
}
const report = JSON.parse(raw);
const allow = JSON.parse(readFileSync(new URL("./audit-allow.json", import.meta.url), "utf8"));
const today = new Date().toISOString().slice(0, 10);
const allowed = new Map(allow.filter((a) => !a.until || a.until >= today).map((a) => [a.id, a]));

// 경보 원본(via 안의 객체)만 모음 — 패키지 이름만 적힌 via 는 같은 경보가 이어진 것
const advisories = new Map();
for (const v of Object.values(report.vulnerabilities ?? {})) {
  for (const via of v.via ?? []) {
    if (typeof via === "object" && via.url) advisories.set(via.url, via);
  }
}

const blocking = [];
for (const a of advisories.values()) {
  if (!BLOCK.has(a.severity)) continue;
  const id = a.url.split("/").pop();
  const ok = allowed.get(id);
  console.log(`${ok ? "[뺌]" : "[막음]"} ${a.severity} ${id} ${a.name ?? ""} ${a.range ?? ""} — ${a.title}${ok ? ` (이유: ${ok.reason} · ${ok.until} 까지)` : ""}`);
  if (!ok) blocking.push(id);
}
for (const a of allow) {
  if (a.until && a.until < today) console.log(`[기한 지남 — 다시 막힘] ${a.id} (${a.until})`);
}
console.log(blocking.length ? `막힘: ${blocking.length}건` : "통과: 막을 경보 없음");
process.exit(blocking.length ? 1 : 0);
