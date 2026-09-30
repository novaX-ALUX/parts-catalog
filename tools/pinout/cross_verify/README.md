# 카탈로그 핀아웃 전수 검사 — 반증 교차검증 기록 (2026-09-29 ~ 30)

지휘자(Claude) ↔ 반증 워커 1 개(Codex `gpt-6-sol` · effort xhigh · 읽기 전용, 세션 `01a0eda2-e81f-77f3-92c9-d4ad96c476d9`).
규칙 = `kicad-code-schematic/references/circuit_integrity.md` §5 · `cross-verify` 스킬. 결론 뒤 워커 프로세스 없음 확인(세션 ID 로).

| 회차 | 질문 | 답 | 결과 |
|---|---|---|---|
| 1 | [r1_question.md](r1_question.md) | [r1_answer.md](r1_answer.md) | 독립 풀이 — AF-H7E 24 커넥터 1 번 끝이 지휘자와 전부 일치(POWER C 만 미확인). 다른 그림 결함: **X20D 좌우 반대(치명)** · **Lite POWER 1 번 반대(치명)** · G5H 밑그림 오염 · PMU 140A J309 번호 없음 · dual UART 가로 표 · AF-H7 nano 는 커넥터 그림 아님 · ESC/F4/M10 1 번 근거 없음 |
| 2 | [r2_question.md](r2_question.md) | [r2_answer.md](r2_answer.md) | 반전 3 건(X20D·Lite·dual)·J309 해소. 새 지적 7: PWM + 범례 · GNSS 설명 방향 · PWM 2.54 mm 표기 · dual/G5H 선화 바탕 · USB-C 5 칸 · 나사 색 · M10 단정. 워커 철회 1: "G5H 선화의 DUAL 로고 = 잘못된 제품" |
| 3 | [r3_question.md](r3_question.md) | [r3_answer.md](r3_answer.md) | **합의 — 새 결함 없음** |

## 2 차: 큰 글자 재배치(2026-09-30, 사용자 "이 글자가 보이니???")
워커 1 개(같은 모델 · 읽기 전용, 세션 `01a0efc9-cab3-76f0-acb1-1a41e5a08919`). 결론 뒤 프로세스 없음 확인(세션 ID 로).

| 회차 | 질문 | 답 | 결과 |
|---|---|---|---|
| 4 | [r4_question.md](r4_question.md) | [r4_answer.md](r4_answer.md) | 새 결함 없음 · X20D 정면 렌더 · PMU 100A XT 극성 · Lite · H7E · dual · ESC **합의**. F4 nano 아랫면 SBUS · VTX(실크대로 고침)는 맞음, 윗면 핀별 실크 없는 5 개는 미확인 → 전체 합의 유보 |
| 5 | [r5_question.md](r5_question.md) | [r5_answer.md](r5_answer.md) | 5 개 카드에 "제조사 그림 순서" 표기만으로는 부족 — 머리말이 '모든 표 = 사진 속 실제 순서'라고 단정 |
| 6 | [r6_question.md](r6_question.md) | [r6_answer.md](r6_answer.md) | 머리말을 실크 범위 · 제조사 그림 범위로 나누고, 옛 그림 표(git HEAD)와 칸마다 같음을 첨부 → **전체 합의** |

## 3 차: 제품당 한 장 · 원래 배치로 되돌림(2026-09-30, 사용자 "원래 레이아웃에 포트설명 글자만 키우면되지 왜 전부 다 쪼개났냐")
면마다 여러 장 · 지도 + 카드로 나눈 그림을 제품당 한 장 · 원래 배치(제품 그림 + 둘레 표 + 파란 점선)로 되돌리고 표 글자만 키웠다(화면 13 px 이상 —
`pinout_style.Sheet.board`). **핀 데이터(칸 순서 · 1 번 끝 · 신호)는 4–6 회차 합의본 그대로**이고 배치만 바뀌었다. 연결선이 다른 커넥터를
가로지르지 않게 AF-H7E GPS & SAFETY 선은 원래 그림처럼 CAN 2 와 TELEM 1 사이 틈으로 내린다.

## 4 차: AF-F4 nano v2 윗면 BEC 8핀 표 위아래 반대 — 제보(2026-09-30)로 확인 · 수정
근거 = FC 보드 PCB `fc/_vendor/F405/Nova_F405-8S_V1.5/AP_F405_FC_V1.5.PcbDoc`(Components6 · Pads6 · Nets6). J1(8핀, 오른쪽 가장자리)
1 번 패드 y 68.76 mm(가장 아래) … 8 번 75.76 mm(가장 위) · 1→8 = PA3 UART2 RX · PA2 UART2 TX · PC11 UART3 RX · PC10 UART3 TX ·
PA15(M5 → LED) · PB7 SDA · PB6 SCL · GND. 사진 방향 = PCB 윗면(Y 위) — 같은 PCB 의 ESC 9핀(P11) 왼→오 9…1 번이 사진 실크
"C 4 3 2 1 + + − −" 와 같고, GPS 6핀(P3) 위→아래 − + TX RX SCL SDA 도 그림과 같다. 그래서 BEC 표만 뒤집혀 있었다(위→아래 RX TX RX TX LED SDA SCL −
→ − SCL SDA LED TX RX TX RX). 그림(fc_F4_nano_v2_pinout_top.png)의 표 8 칸만 옮겼다. 아랫면 그림(BEC 보드)은 그 보드 PCB 가 저장소에 없어 확인하지 못했다.

## 5 차: 모든 핀아웃을 제품 렌더 · 사진 위 AF-H7E 배치로 통일(2026-09-30, 사용자 "H7E Lite는 왜 랜더링파일에 핀아웃을 하지않고
## 이상한 pcb 렌더링파일에 … 니 맘대로 핀 변경하지말고")
- AF-H7E Lite: 보드 X-ray 그림 → 카탈로그 갤러리와 같은 블렌더 렌더(lite_render_cfg.py · 커밋된 케이스 + 지금 보드, HP)의 윗면 · 왼쪽 · 오른쪽 · 앞 · 뒤.
- AF-F4 nano v2: 제조사식 그림 두 장 → 제품 사진(FC 윗면 · BEC 보드) 한 장, 같은 배치. FC 커넥터 번호 · ① = FC PCB(4 차).
- **핀 잠금 대조 PASS**: 새 그림이 그린 표를 커밋본 자료와 칸마다 비교(번호 있는 표 = 번호별 신호, 번호 없는 표 = 보이는 순서) —
  Lite 15 커넥터 + PWM 헤더(열 SB · M12 … M1 · 줄 S · + · −), F4 nano v2 표 7 개, 바뀐 칸 0.
- 그대로 둔 것: AP-RTK dual · G5H 의 UART 옆면(렌더가 없고 보드 3D 에 커넥터 모델이 없다 — 제조사 도면), AP-M10(제품 그림은 케이블 달린 퍽이라 핀이 안 보인다 — 모듈 사진),
  AF-H7 nano(커넥터 핀 자료 없음 — 펌웨어 포트 표).

## 합의에서 뺀 미결(자료 없음)
- AF-H7 nano 그림 = 펌웨어 포트 대응표(커넥터 그림 아님, product-facts 테스트가 고정).
- AE-6S 60A BC · AF-F4 nano / T10 nano · AP-M10 — 보드 PCB·제조사 핀 번호 자료가 저장소에 없다. AF-F4 nano v2 는 FC 보드 PCB(V1.5)가 fc/_vendor 에 있다(4 차) — BEC 보드만 없다. 제조사 그림·실크 순서 그대로 두고 번호·① 를 새로 쓰지 않았다.
- AF-H7E PWM 헤더 양산 부품의 공칭 피치(BOM = DIP-60 만). 핀 표는 받침 PCB 좌표(줄 ≈ 2.54 · 채널 2.6 mm)만 적는다.
- 제품 사진과 새 렌더 중 어느 쪽이 양산 표면·색인지(실물 없음).

## 근거 요약
- 1 번 위치 = PCB 패드 좌표(KiCad 11 보드 `kicad-cli pcb export ipcd356`, Altium = olefile `Pads`/`Nets`) + 그림 속 기준물 배치(포트 순서, USB 와 CAN 의 좌우).
- AF-H7E POWER C = 받침 PCB J13 패드 0A…0F / 0G…0L(GND GND CAN_L CAN_H 5V 5V) — 회로도 U6X-BASE-SCH 의 J28/J27 · MCP2542 CANH/CANL 라벨.

로컬 임시 폴더 경로는 `<scratchpad>`, 파이썬 실행 파일 경로는 `%PY313%` 로 바꿔 적었다(사용자 폴더를 기록에 남기지 않는다).
