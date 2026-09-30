# 반증 워커 3 회차 — 2 회차 지적 반영 확인

2 회차 지적(A 표 7 건 · C 미결 4 건)을 아래처럼 처리했다. 읽기 전용 · 근거로만 · 한국어. 해소 / 남음 / 새 결함 을 판정하고, 남은 것이 없으면 "합의" 라고 적어라.
첨부(순서): ① H7E 윗면 ② H7E 옆면·앞면 ③ 사진 vs 새 렌더(나사 은색) ④ X20D ⑤ dual ⑥ G5H ⑦ AP-M10
(카탈로그 작업트리 `web/parts-catalog/public/images/products/` 의 같은 파일)

| 2 회차 지적 | 처리 | 파일 |
|---|---|---|
| A1 윗면 범례 "+ = 5 V" 가 PWM + 에도 | 윗면 범례 = "+ = 5 V (PWM header + = servo rail from an external BEC)". PWM 표 줄 이름·부제는 그대로(servo rail) | `web/parts-catalog/tools/pinout/h7e_pinout.py` title_block(plus=) |
| A2 GNSS pinoutNotes 가 방향 설명 없이 N→1 | X20D · dual · G5H md 의 pinoutNotes 앞에 "Listed from the last pin to pin 1 (the Pinout image shows each connector as seen and marks pin 1): " 추가. 신호열 문구는 product-facts 테스트 그대로(테스트 통과) | `src/content/gnss/AP-RTK-{X20D,dual,G5H}.md` |
| A3 PWM "2.54 mm" | pinTable type = "3 × 16 pin header · rows about 2.54 mm (servo plug S · + · −), channels 2.6 mm apart on the base PCB · columns 1–8 (left)"(9–16 도 같음). 양산 부품 공칭은 미확인이라 "base PCB" 로 한정 | `src/content/fc/AF-H7E.md` 212·219 줄 |
| A4 dual·G5H 바탕이 선화 | 바탕 = 카탈로그 제품 렌더 `gnss_AP-RTK-{dual,G5H}_device.png`(앞면 USB·CAN 이 보임). UART 옆면은 제품 렌더가 없어 **제조사 옆면도만** 오른쪽에 두고 부제에 "UART side from the maker drawing (no render of that side)" 라고 밝힘. dual 케이스 STEP(`gnss/AP-RTK_dual/docs/RTKV4上/下.STEP`)은 옛 판이라 UART 구멍이 없고, G5H 케이스 STEP 은 우리 변형판(옆 구멍 3 개)이라 실제 dual 과 달라 렌더 근거로 쓰지 않음 | `gnss_pinout.py` device() · lineart_side() · DUAL_SUB |
| A5 USB-C 5 칸 | 한 칸 "USB 2.0", 부제 "SERIAL0 · reversible · contacts in the pin table below"(접점별 신호는 페이지 핀 표) | `h7e_pinout.py` |
| A6 나사 검정 · 커넥터 밝음 | 사진 확대(모듈·케이스 나사 모두 은색 스테인리스, STEP 색도 0.82/0.80/0.75) → 나사 = 스테인리스(0.62, 금속, 거칠기 0.30). GH 몸체 0.74 → 0.68 · 거칠기 0.62. HP 재렌더(h7e-render3) | `fc/AF-H7E/tools/h7e_render_cfg.py` |
| A7 AP-M10 "공개하지 않았다" 단정 | 부제 = "the photo names the signals but gives no pin numbers"(우리가 가진 자료 기준으로만) | `gnss_pinout.py` |
| C1 POWER C 의 ① = 자체 번호 | 표 부제에 "numbered in base-PCB pad order 0A→0F"(C2 는 0G→0L) 명시 | `h7e_pinout.py` SUB |
| (추가) ① 위치 | 상자 밖 모서리 → **상자 안 1 번 끝**(옆 커넥터 상자와 붙으면 어느 커넥터 표시인지 헷갈림, 예: dual USB·CAN) | `h7e_pinout.py` badge_at · `gnss_pinout.py` |

검증: `npm test` 22/23(실패 1 = `fc/AF-F4-nano-v2.sync-conflict-…md`, 이번 변경과 무관) · `npm run build` 89 쪽, 검증 오류 7 건 모두 `*.sync-conflict-*` 페이지.
남기는 미결(합의 제외 요청): AF-H7 nano SVG(펌웨어 포트 대응표, 테스트가 고정 — 이번 범위 밖) · ESC 6S BC · F4 nano/v2 · AP-M10 의 1 번 근거(자료 없음) ·
PWM 양산 부품 공칭 · 사진과 렌더 중 어느 쪽이 양산 표면인지(실물 없음). 이것들이 "결함" 이라고 보면 근거와 함께 반박하라.

## 출력
A. 새 결함 표(등급 · 무엇 · 근거 · 재현) — 없으면 "없음"
B. 2 회차 지적별 판정(해소/남음)
C. 합의 여부 한 줄

## 반증검증 규약
- 모든 주장은 출처를 인용한다: 파일:라인 또는 실측 수치. 기억·추측 금지.
- 남의 결론은 수용 전 독립으로 재현한다. 재현 못 하면 '미확인'이라 쓴다.
- 파생값(계산·재기술)을 실측으로 인용하지 마라. 측정과 재기술을 명확히 구분한다.
- 인용 전 소스의 버전/커밋을 확인한다. (세션마다 다른 버전을 읽어 생기는 오판 방지)
- 예측은 관측·실행 전에 고정한다(사전등록). 사후해석 금지.
- 틀리면 즉시 명시 철회하고 무엇을 왜 틀렸는지 기록한다.
