# 4 회차 — 큰 글자 재배치 후 핀 순서 · 1 번 반증 (2026-09-30)

당신은 반증 워커다. 지휘자(Claude)가 카탈로그 핀아웃 그림을 모두 다시 만들었다(사용자: "글자가 안 보인다 — 전수검사해서 크게").
형식 = 제품 그림 지도(커넥터마다 파란 글자 배지 · 빨간 ① = 1 번 끝) + 커넥터 카드 [확대 그림 | 이름 · 부제 · 표]. 표 칸 왼 → 오(세로 커넥터는 위 → 아래) = 그 그림에서 보이는 실제 핀 순서라고 주장한다.
글자 크기(화면 13 px 이상)는 생성기가 강제하므로 판정하지 않아도 된다. **핀 순서 · 1 번 끝 · 신호 이름이 근거와 맞는지만** 반증하라.

## 규약
- 모든 주장은 출처를 인용한다: 파일:줄 또는 그림의 어느 부분인지. 기억 · 추측 금지. 재현 못 하면 '미확인'.
- 파생값(계산 · 재기술)을 실측으로 인용하지 마라. 틀리면 즉시 철회하고 기록한다.
- 읽기 전용이다. 파일을 고치지 마라.

## 새로 판단한 것(반증 우선순위 순)
1. **AF-F4 nano 아랫면 패드**(`f4.png` 아랫면 · 원본 사진 `f4_bottom_src.png` · 확대 `f4b_*.png`). PCB 가 저장소에 없어 **보드 실크**로 판단했다.
   - 실크는 180° 돌려 인쇄돼 있다(`f4b_sbus_rot.png` = 180° 돌린 것: "RX2 3.3V GND / SBUS 5V GND").
   - 지휘자 해석: 실크 범례는 패드 묶음과 같은 격자 → 사진에서 보이는 순서로 **SBUS 묶음 위 줄 GND 5V SBUS · 아래 줄 GND 3.3V RX2**.
     옛 그림(git HEAD 의 `web/parts-catalog/public/images/products/fc_F405_nano_pinout.png`)은 위 줄 SBUS 5V GND · 아래 줄 RX2 3.3V GND.
   - **VTX 패드**: 글자가 패드 바로 옆 → 위 → 아래 **TX3 VTX GND**(`f4b_vtx.png`). 옛 그림 표는 GND VTX TX3.
   - RGB 묶음 위 RGB GND 5V · 아래 RX3 TX5 RX5, I2C/UART 5V SDA1 SCL1 RX1 TX1 GND, 모터 BAT S4 S3 S2 S1 S5 S6 S7 S8 GND = 옛 그림과 같다.
   - 윗면 ESC(실크 4 3 2 1 + + − −) · ELRS(실크 G 5V TX RX)는 실크, VTX · CAM · RC · BUZZER · GPS 는 핀별 실크가 없어 옛 그림 순서 그대로.
   생성기: `web/parts-catalog/tools/pinout/f4_nano_pinout.py`.
2. **AP-RTK X20D** 를 커넥터 정면 평행 투영 렌더(블렌더, `x20d_boxes_all.png` = 새 렌더 3 면 + 상자)로 바꿨다. PPS · UART · DEBUG · CAN 1 번 = 왼쪽(3 회차 합의 그대로),
   정면에서 JST-GH 잠금 창이 위 → 1 번 왼쪽이 맞는지. ANT 면(카메라 +Y 쪽)에서 ANT2 왼쪽 · ANT1 오른쪽이 맞는지.
   렌더 설정: `gnss/AP-RTK_X20D/hardware/render/x20d_render_cfg.py`(마지막 인자 pinout), 좌표 · 상자: `web/parts-catalog/tools/pinout/gnss_pinout.py` X20D 표.
3. **APMU-12S 100A**(`pmu100.png`) — XT 커넥터 극성(보이는 순서)을 보드 파일 패드 넷에서 새로 그렸다:
   J55 · J44 · J66(XT30, 위 가장자리) 왼 → 오 GND · +, J7 · J6(왼쪽 XT60) 위 → 아래 GND · VBAT, J4 · J1 · J5(오른쪽 XT60) 위 → 아래 VBAT · GND,
   J45(XT90) 위 → 아래 BAT+ · GND. GH J41 · J42 1 번 = 오른쪽(6 … 1).
   보드: `pmu/APMU-12S_100A/hardware/kicad/APMU-12S_100A_V2.kicad_pcb`, 생성기 `pmu/APMU-12S_100A/tools/pinout_png.py`(pad_xy 회전식), 신호명 = `web/parts-catalog/src/content/pmu/APMU-12S-100A.md` pinTable.
4. **AF-H7E Lite**(`lite.png`) — 데이터 그대로(`fc/AF-H7E_Lite/docs/lite_connectors.json`), 뒤쪽을 윗면(POWER · PWM, 불투명 렌더) · 아랫면(X-ray) 지도로 나눴다. 표 = 위에서 본 순서.
   생성기 `fc/AF-H7E_Lite/tools/lite_docs.py` pinout().
5. **AF-H7E** 5 장(`h7e_*.png`) — 3 회차 합의 데이터 그대로 재배치. PWM 표 열을 사진 속 핀 열에 맞췄다(열 = −19.5 + 2.6 i mm, 줄 = S 뒤 · + · − 앞).
   생성기 `web/parts-catalog/tools/pinout/h7e_pinout.py`.
6. dual · ESC 6S(`dual.png` · `esc6s.png`) — 데이터 그대로 재배치.

## 답 형식
A. 새 결함(있으면 번호 · 근거 · 고칠 값) / 없으면 "없음"
B. 위 1–6 항목별 판정(맞음 · 틀림 · 미확인)과 근거
C. 합의 여부
