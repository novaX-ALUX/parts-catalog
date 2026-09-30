# 카탈로그 핀아웃 반증 검증 — 1회차

**실제 배선과 충돌하는 그림 2건을 확인했습니다.** AP-RTK X20D의 커넥터 표 4개는 물리적 좌우가 뒤집혔고, AF-H7E Lite의 POWER 1·2는 그림의 1번 위치가 PCB 및 제품 설명과 반대입니다. 파일은 수정하지 않았습니다.

검사 기준: 루트 `ae5945ee`, FC `fa0aa6c`, GNSS `c277263`, 카탈로그 `ed61094`. 카탈로그의 GNSS 그림과 AF-H7E 문서는 작업트리에 변경이 있는 상태이므로, 아래 판정은 **현재 파일 내용**에 대한 것입니다.

## A. 결함

| 등급 | 그림·커넥터 | 판정과 근거 | 재현 |
|---|---|---|---|
| **치명** | `gnss_AP-RTK-X20D_pinout.png`의 PPS·UART·DEBUG·CAN | 그림은 네 표 모두 왼쪽을 마지막 핀, 오른쪽을 1번으로 표시한다. 생성기 [gnss_pinout.py](</D:/1_Work/1_project/39_gitNovaX/web/parts-catalog/tools/pinout/gnss_pinout.py:64>)도 4→1/6→1 순서다. 그러나 R3 PCB에서 PPS U17·UART U14·DEBUG U15는 **1번의 Y 좌표가 마지막 핀보다 작고**, 사진에서 세 포트가 PPS→UART→DEBUG 순서로 놓여 Y 증가 방향이 화면 오른쪽이다. CAN U16은 1번 X=112.535 mm, 4번 X=108.785 mm이고 제품 그림에서 USB 왼쪽·CAN 오른쪽이므로 1번은 화면 **왼쪽**이다. [R3 핀맵](</D:/1_Work/1_project/39_gitNovaX/gnss/AP-RTK_X20D/docs/pinmap.md:6>)의 번호별 신호와 그림의 번호별 신호는 맞지만 **물리 위치가 반대**다. [카탈로그 설명](</D:/1_Work/1_project/39_gitNovaX/web/parts-catalog/src/content/gnss/AP-RTK-X20D.md:25>)도 반대 순서를 반복한다. | R1, R3 |
| **치명** | `fc_AF-H7E-Lite_pinout.png` POWER 1·2 | 그림은 가로 표의 **왼쪽을 1번**으로 표시하면서 아래에는 `pin-1 end TBC`라고 적었다. [제품 설명](</D:/1_Work/1_project/39_gitNovaX/web/parts-catalog/src/content/fc/AF-H7E-Lite.md:68>)은 윗면에서 1번이 **오른쪽**이라고 명시한다. Lite PCB의 J16 POWER1은 1번 X=−5.625 mm, 6번 X=−11.875 mm, J17 POWER2는 1번 X=11.941 mm, 6번 X=5.691 mm로 두 곳 모두 1번이 오른쪽이다. 전원·접지 끝이 바뀌는 표시다. | R1 |
| **중대** | `fc_AF-H7E_pinout.png`의 가로 커넥터 표 | 실제 커넥터는 가로인데 신호 표를 세로로 그려, 표의 “첫 행=1번”만으로 물리적인 왼쪽·오른쪽 끝을 읽을 수 없다. [생성기](</D:/1_Work/1_project/39_gitNovaX/web/parts-catalog/tools/pinout/h7e_pinout.py:91>)가 `table_v`를 사용하고 [그림 설명](</D:/1_Work/1_project/39_gitNovaX/web/parts-catalog/tools/pinout/h7e_pinout.py:186>)도 첫 행만 지정한다. PCB 도면에서는 POWER 1·2의 1번은 그림 **왼쪽**, 앞쪽 7개 및 옆·끝면의 번호형 커넥터 1번은 각 정의된 시점에서 **오른쪽**으로 갈린다. 한 방향으로 추정할 수 없다. | R2, R3 |
| **중대** | `gnss_AP-RTK-G5H_pinout.png` | 그림 안에 잘린 **“AP-RTK dual”** 제목과 연결 대상이 없는 점선 상자가 남아 있다. [생성기](</D:/1_Work/1_project/39_gitNovaX/web/parts-catalog/tools/pinout/gnss_pinout.py:34>)가 dual 출력 그림을 G5H 밑그림으로 다시 읽으며, dual 자체도 같은 출력 파일을 입력으로 읽는다. 재생성 안정성과 제품 형상 모두 결함이다. G5H PCB의 CAN U16 좌표도 X20D와 같아, 현 그림의 CAN `5V·H·L·GND` 좌→우 표시는 제품 렌더의 USB/CAN 위치와 대조하면 역방향이다. | R1, R3 |
| **중대** | `fc_AF-H7_nano_firmware_ports.svg` | [그림 자체](</D:/1_Work/1_project/39_gitNovaX/web/parts-catalog/public/images/products/fc_AF-H7_nano_firmware_ports.svg:7>)가 “Firmware mapping — NOT connector pin order”라고 밝힌다. 그런데 [제품 페이지](</D:/1_Work/1_project/39_gitNovaX/web/parts-catalog/src/content/fc/AF-H7-nano.md:6>)는 이를 `pinoutImage`로 사용한다. 커넥터 형상·물리 순서·1번 끝을 알려주지 않는다. | R3 |
| **중대** | `pmu_APMU-12S-140A_pinout.png` FC PWR2/J309 | [제품 핀 표](</D:/1_Work/1_project/39_gitNovaX/web/parts-catalog/src/content/pmu/APMU-12S-140A.md:122>)에는 1–6번이 있으나 그림은 `5V 5V NC NC GND GND`라는 문장형 상자만 보여 주며 1번 표시가 없다. [생성기](</D:/1_Work/1_project/39_gitNovaX/pmu/APMU-12S_140A/hardware/tools/pinout_png.py:26>)에서도 J309만 `CALLOUT`이다. PCB J309의 1번 X=265.175 mm, 6번 X=271.425 mm로 윗면 기준 1번은 **왼쪽**이다. | R1, R3 |
| **중대** | `gnss_AP-RTK-dual_pinout.png` UART | 제품 측면의 세로 커넥터를 가로 핀 표로 설명하고 1번 번호가 없다. 화면에서 위·아래 어느 끝이 1번인지 판독할 수 없다. [생성기](</D:/1_Work/1_project/39_gitNovaX/web/parts-catalog/tools/pinout/gnss_pinout.py:77>)도 번호 없는 가로 셀을 만든다. 원본 Altium PCB의 물리 끝은 이번 회차에서 확정하지 못했다. | R3, 그림 확인 |
| **중대** | ESC, F4 nano, F4 nano v2, PMU 100A, AP-M10 그림 | 커넥터별 신호 또는 일부 핀 번호는 보이지만, **각 실물 커넥터의 1번 끝**을 일관되게 표시하지 않는다. 특히 ESC·F4·AP-M10은 신호명 `S1` 또는 `5V`를 커넥터의 회로 번호 1과 동일시할 근거가 그림에 없다. PMU 100A의 GH 표는 6→1 번호를 표시하지만 XT 전원 단자는 극성과 물리 방향을 별도로 대조해야 한다. | R3, 그림 확인 |

## B. 확인 완료

AF-H7E의 방향은 **제품 윗면에 Altium PCB의 `BOTTOM` 면이 보이는 장착**을 기준으로 판정했다. 근거는 `X2-BASE.PCB`의 J13·J15·J16 부품 면과 [X2-BASE.pdf](</D:/1_Work/1_project/39_gitNovaX/fc/_vendor/V6X/APM_H7E_FC/V6X-BASE/U6X-BASE/X2-BASE.pdf>) **2쪽**의 패드 위치, 현재 제품 그림의 헤더·POWER 위치다. 아래 신호열은 [AF-H7E.md의 pinTable](</D:/1_Work/1_project/39_gitNovaX/web/parts-catalog/src/content/fc/AF-H7E.md:66>)을 **재기술한 값**이다. PCB 좌표로 번호의 물리적 끝을 확인했으며, 모든 신호의 회로 경로까지 독립 검증했다는 뜻은 아니다.

| AF-H7E 커넥터 | 해당 시점의 1번 끝 | `pinTable`의 1번→마지막 신호 | 위치 근거 |
|---|---|---|---|
| POWER 1 / J16 | **왼쪽** | VCC_IN, VCC_IN, SCL, SDA, GND, GND | PDF 2쪽 `PAJ1601` (543,151.1), `PAJ1606` (543,207.8) |
| POWER 2 / J15 | **왼쪽** | 위와 같음 | PDF 2쪽 `PAJ1501` (542,357.1), `PAJ1506` (542,413.8) |
| POWER C1 | **미확인** | GND, GND, CAN_L, CAN_H, VCC_IN, VCC_IN | PCB에서는 J13의 `0A…0L` 패드군으로 보여 별도 1번 표기를 확정하지 못함 |
| POWER C2 | **미확인** | 위와 같음 | C1과 동일 |
| TELEM 1 / J26 | **오른쪽** | VCC, TX, RX, CTS, RTS, GND | PDF 2쪽·PCB 패드 번호 |
| TELEM 2 / J25 | **오른쪽** | 위와 같음 | PDF 2쪽·PCB 패드 번호 |
| TELEM 3 / J23 | **오른쪽** | 위와 같음 | PDF 2쪽 `PAJ2301` (113,173.3), `PAJ2306` (113,115.3) |
| GPS & SAFETY / J20 | **오른쪽** | VCC, TX, RX, SCL, SDA, SAFETY_SW, SAFETY_LED, VCC_3V3, BUZZER, GND | PDF 2쪽 `PAJ2001` (112,334.3), `PAJ20010` (112,230.3) |
| GPS 2 / J19 | **오른쪽** | VCC, TX, RX, SCL, SDA, GND | PDF 2쪽 `PAJ1901` (112,450.3), `PAJ1906` (112,392.3) |
| UART 4 / J8 | **오른쪽** | VCC, TX, RX, SCL, SDA, NFC_GPIO, GND | PDF 1쪽·PCB 패드 번호 |
| CAN 1 / J28 | **오른쪽** | VCC, CAN_H, CAN_L, GND | PDF 2쪽 `PAJ2801` (48,149.3), `PAJ2804` (48,115.3) |
| CAN 2 / J27 | **오른쪽** | 위와 같음 | PDF 2쪽·PCB 패드 번호 |
| DSM / SBUS RC / J3 | **오른쪽** | VCC, RC_IN, RSSI, VCC_3V3, GND | PDF 1쪽·PCB 패드 번호 |
| PPM IN / J2 | **오른쪽** | VCC, PPM, GND | PDF 1쪽·PCB 패드 번호 |
| SBUS OUT / J1 | **오른쪽** | NC, SBUS_OUT, GND | PDF 1쪽·PCB 패드 번호. 1번이 전원이라는 일반 규칙의 **실제 예외** |
| PWM OUT M1–M8 / J13 | 1열 **왼쪽** | 각 열 뒤쪽 S=해당 M, 가운데 +=V_SERVO, 앞쪽 −=GND | PCB J13 A/B/C의 1열 좌표와 그림의 M1→M8 배열 |
| PWM OUT A1–A8 / J13 | A1은 M8 바로 **오른쪽** | 각 열 S=해당 A, +=V_SERVO, −=GND | 같은 3×16 헤더의 9–16열. 독립된 ‘1번 커넥터’는 아님 |
| ETHERNET / J6 | **오른쪽** | RX−, RX+, TX−, TX+ | PDF 1쪽·PCB 패드 번호 |
| USB-C | 단일 1→N 끝 **해당 없음** | A/B 접점별 VBUS, D+, D−, CC1/CC2, GND | [pinTable](</D:/1_Work/1_project/39_gitNovaX/web/parts-catalog/src/content/fc/AF-H7E.md:232>)의 A/B 접점 정의 |
| USB / J11 | **오른쪽** | VBUS, D−, D+, GND | PDF 1쪽·PCB 패드 번호 |
| AD & IO / J9 | **오른쪽** | VCC, CAP1, BOOTLOADER, RST_REQ, nARMED, ADC_3V3, ADC_6V6, GND | PDF 1쪽·PCB 패드 번호 |
| SPI 6 / J5 | **오른쪽** | VCC, SCK, MISO, MOSI, CS1, CS2, SYNC, DRDY1, DRDY2, nRESET, GND | PDF 1쪽·PCB 패드 번호 |
| FMU DEBUG / J12 | **오른쪽** | VCC_3V3, CONSOLE_TX, CONSOLE_RX, SWDIO, SWCLK, SWO, NFC_GPIO, PH11, nRST, GND | PDF 1쪽·PCB 패드 번호 |
| IO DEBUG / J10 | **오른쪽** | VCC_3V3, IO_TX, NC, SWDIO, SWCLK, SWO, GPIO1, GPIO2, nRST, GND | PDF 1쪽·PCB 패드 번호 |

나머지 그림의 확인 범위:

| 그림 | 확인한 것 | 남은 판정 |
|---|---|---|
| ESC 6S 60A | 사진과 그림의 PCB 외형이 대응하고, POWER 4칸·ESC 9칸은 실물처럼 가로다. | 회로 1번 및 신호의 PCB 근거 미확인 |
| F405 nano | 윗면 사진의 ESC 실크 `4 3 2 1 + + − −`, ELRS 실크 `G 5V TX RX`와 표의 순서가 대응한다. | 다른 단자 전체의 회로 번호 미확인 |
| F4 nano v2 윗면·아랫면 | 윗면 ESC 실크 `C 4 3 2 1 + + − −`와 표가 대응한다. 아랫면 가로 단자도 가로 표다. | 커넥터별 1번 끝·전체 넷 미확인 |
| AF-H7E Lite | 개념도라는 표기와 PCB의 POWER 1·2 패드 위치는 대조했다. | 전원 표의 충돌은 A 참조; 양산 실물과의 일치 미확인 |
| PMU 100A | ANALOG·I2C 표는 6→1 숫자를 표시한다. | KiCad 10에서 10.99 형식 PCB를 열지 못해 패드 좌우 독립 확인 실패 |
| PMU 140A | J301 FC PWR1은 PCB 패드 1번이 윗면 **왼쪽**이고 그림과 맞는다. J304 CAN도 1번 왼쪽. 하단 NAV·BUTTON은 PCB의 역방향 번호 배열과 그림이 맞는다. | J309 결함은 A 참조 |
| BTN1 케이블 | `btn_pin_check.py` 결과 **8/8 일치**: 1↔1 직결 및 AUTO-ON 6–7 단락. | 제작된 케이블 실측은 아님 |
| X20D | R3 PCB의 **번호→신호**와 로컬 핀맵은 일치한다. | 그림의 **번호→물리 위치**가 반대, A 참조 |
| RTK dual | 외형 선화와 UART·USB·CAN 위치를 확인했다. | 원본 Altium 패드 좌표를 이번 회차에 해독하지 못해 신호 좌우 확정 불가 |
| RTK G5H | G5H PCB U14–U17 패드 배치는 X20D와 같다. | 잘못된 밑그림·CAN 좌우 결함은 A 참조 |
| AP-M10 | 제품 사진의 GPS 6핀 가로 단자와 가로 표는 대응한다. | 제조사 회로·풋프린트 근거가 없어 1번 및 신호 순서 미확인 |
| AF-H7 nano | SVG의 펌웨어 포트명만 확인했다. | 물리 핀아웃 그림이 아니므로 커넥터 검증 불가 |

## C. 확인 못 한 것

- **AF-H7E POWER C1·C2의 실제 회로 1번 끝**, 그리고 24개 항목의 모든 신호에 대한 회로도 수준의 독립 대조. 번호의 위치 확인과 MD 신호 전사를 구별했다.
- RTK dual 원본 Altium PCB의 패드 위치, PMU 100A의 새 KiCad 형식 PCB, AP-M10 제조사 핀 도면. 따라서 이 세 제품의 물리 핀 순서를 확정하지 않았다.
- AF-H7E Lite와 PMU 설계 렌더가 **제작 실물**과 닮았는지. Lite 문서 자체가 개발 중인 정의라고 밝힌다.
- `fc_CUAV_V6X.jpg`의 제작·라이선스 출처. 화면에는 novaX 표기가 보이고 새 AF-H7E 핀아웃에는 CUAV 브랜드가 보이지 않지만, **타사 이미지가 전혀 없다고 확정할 근거는 부족**하다.
- 첨부 그림을 먼저 본 상태라 맹검식 사전 예측을 고정하지 못했다. 좌표 판정은 PCB와 PDF를 따로 대조했지만, 이를 사전등록 검증으로 주장하지 않는다.

## D. 지휘자에게 반박·확인 요청

1. **X20D의 “왼→오 = N번→1번” 가정은 R3 PCB 좌표와 제품의 포트 배열에 반한다.** 핀맵의 신호 번호가 맞는다는 사실로 그림의 물리 좌우를 승인하면 안 된다.
2. **H7E의 ‘첫 행=1번’은 물리 1번 표시가 아니다.** POWER는 왼쪽, 대부분의 다른 번호형 포트는 오른쪽이다. 각 그림의 커넥터 모양 옆에 끝을 표시해야 한다.
3. Lite POWER 1·2는 그림, MD, PCB가 충돌한다. 공식 [Molex Micro-Lock Plus 자료](https://www.molex.com/en-us/products/part-detail/5055680671)의 Circuit 1 방향까지 대조하되, 현재 그림의 `TBC`를 확정 핀 표처럼 게시해서는 안 된다. JST의 [GH](https://www.jst-mfg.com/product/pdf/eng/eGH.pdf)·[SH](https://www.jst-mfg.com/product/pdf/eng/eSH.pdf) 도면도 회로 1번 기준을 확인하는 자료다.

## E. 사용한 명령

- `D:\1_Work\tools\whereami.cmd`; 각 저장소 `git rev-parse HEAD`, `git status --short`
- `rg -n`으로 `pinoutImage(s)`, `pinTable`, 생성기, PCB 핀맵의 해당 줄 검색
- **R1:** Windows KiCad Python의 `pcbnew.LoadBoard()`로 X20D·G5H·Lite·PMU 140A 보드를 **읽기 전용** 로드하여 `GetReference()`, `Pads()`, `GetNumber()`, `GetPosition()`, `GetNetname()` 출력. 예: `& 'C:\Program Files\KiCad\10.0\bin\python.exe' -c 'import pcbnew,sys; b=pcbnew.LoadBoard(sys.argv[1]); refs=set(sys.argv[2].split(chr(44))); [print(f.GetReference(),[(p.GetNumber(),round(p.GetPosition().x/1e6,3),round(p.GetPosition().y/1e6,3),p.GetNetname()) for p in f.Pads()]) for f in b.GetFootprints() if f.GetReference() in refs]' '<PCB 절대경로>' 'U14,U15,U16,U17'`
- **R2:** Python `fitz.open('...\X2-BASE.pdf')[1].get_text('words')`에서 `PAJ1601` 등 패드 문자열의 PDF 쪽 좌표 추출. 별도로 `olefile`로 `X2-BASE.PCB`의 `Pads/Data`와 `Nets/Data`를 읽어 부품·패드 면과 mm 좌표 대조
- **R3:** `rg -n`과 원본 그림 직접 열람으로 이미지 표·MD·생성기 순서를 대조
- `& '%PY313%' 'pmu\APMU-12S_140A\hardware\tools\btn_pin_check.py'` → **8/8 PASS**

Windows 명령만 사용했고, 파일 변경·빌드·플래시는 하지 않았습니다.