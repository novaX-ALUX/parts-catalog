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

## 합의에서 뺀 미결(자료 없음)
- AF-H7 nano 그림 = 펌웨어 포트 대응표(커넥터 그림 아님, product-facts 테스트가 고정).
- AE-6S 60A BC · AF-F4 nano / T10 nano · AF-F4 nano v2 · AP-M10 — 보드 PCB·제조사 핀 번호 자료가 저장소에 없다. 제조사 그림·실크 순서 그대로 두고 번호·① 를 새로 쓰지 않았다.
- AF-H7E PWM 헤더 양산 부품의 공칭 피치(BOM = DIP-60 만). 핀 표는 받침 PCB 좌표(줄 ≈ 2.54 · 채널 2.6 mm)만 적는다.
- 제품 사진과 새 렌더 중 어느 쪽이 양산 표면·색인지(실물 없음).

## 근거 요약
- 1 번 위치 = PCB 패드 좌표(KiCad 11 보드 `kicad-cli pcb export ipcd356`, Altium = olefile `Pads`/`Nets`) + 그림 속 기준물 배치(포트 순서, USB 와 CAN 의 좌우).
- AF-H7E POWER C = 받침 PCB J13 패드 0A…0F / 0G…0L(GND GND CAN_L CAN_H 5V 5V) — 회로도 U6X-BASE-SCH 의 J28/J27 · MCP2542 CANH/CANL 라벨.

로컬 임시 폴더 경로는 `<scratchpad>`, 파이썬 실행 파일 경로는 `%PY313%` 로 바꿔 적었다(사용자 폴더를 기록에 남기지 않는다).
