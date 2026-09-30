## A. 새 결함

**확인된 새 결함 없음.**

## B. 항목별 판정

| 항목 | 판정 | 근거 |
|---|---|---|
| 1. AF-F4 nano | **미확인** | 아랫면 SBUS 표는 실크를 180° 돌려 읽은 순서와, VTX 표는 패드 옆 실크의 위→아래 순서와 맞는다(그림 #3–5, `f4_nano_pinout.py:59–65`). 다만 윗면 VTX·CAM·RC·BUZZER·GPS는 핀별 실크가 없어 옛 그림의 값을 전사한 것만 확인된다(`f4_nano_pinout.py:10, 52–56`). |
| 2. AP-RTK X20D | **맞음** | PPS·UART·DEBUG·CAN의 ①와 표 방향은 R3 PCB 패드 좌표와 렌더 시점으로 계산한 방향에 맞는다(`AP-RTK_X20D.kicad_pcb`의 U17·U14·U15·U16, `gnss_pinout.py:99–111`). ANT 면의 ANT2 왼쪽·ANT1 오른쪽도 +Y 시점과 각인 좌표에 맞는다(`x20d_render_cfg.py:28–33, 61–65`, 그림 #8). JST의 1번 표기 방향도 [GH 공식 도면](https://www.jst-mfg.com/product/pdf/eng/eGH.pdf)과 대조했다. |
| 3. APMU-12S 100A | **맞음** | XT 극성과 GH ① 위치는 PCB 패드 좌표·넷을 `pad_xy` 회전식으로 옮긴 결과와 일치한다(`pinout_png.py:66–71, 101–119`, 그림 #10). J42의 3·4번은 각각 INA228의 5번·4번으로 이어지며, 해당 칩의 신호는 SCL·SDA다(`APMU-12S_100A_V2.kicad_pcb:5034–5047, 11104–11119`, [TI 데이터시트](https://www.ti.com/lit/ds/symlink/ina228.pdf)). |
| 4. AF-H7E Lite | **맞음** | ① 위치와 표 순서는 `lite_connectors.json`의 핀 좌표를 위에서 본 방향으로 정렬한 결과와 맞는다(`lite_docs.py:127–142, 175–183`, 그림 #11). 이는 개발 중인 설계 데이터 기준 판정이다(`AF-H7E-Lite.md:55–56`). |
| 5. AF-H7E | **맞음** | 번호형 포트의 ① 방향과 역순 표 처리, PWM의 S·+·− 행 및 M1→A8 열이 생성기와 핀 표에 일치한다(`h7e_pinout.py:39–49, 72–75, 107–139`; `AF-H7E.md:214–227`; 그림 #12–16). |
| 6. dual·ESC 6S | **맞음** | dual의 UART 세로 표와 CAN 가로 표는 앞선 원본 PCB 대조 기록의 방향을 유지한다(`r2_answer.md`의 dual 판정, `gnss_pinout.py:115–121`; 그림 #17). ESC 두 표는 제조사 원본 그림의 POWER·ESC INTERFACE 순서와 같다(`esc/AE-6S-60A-BC/assets/AE-6S 60A BC Pinout.png` 상단 두 표, 그림 #18). |

## C. 합의 여부

**2–6은 합의. 전체 합의는 유보한다.** 1번의 윗면 핀별 실크 없는 5개 커넥터는 현재 자료로 실제 신호 순서를 독립 확인할 수 없다.