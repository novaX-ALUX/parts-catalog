# 반증 워커 2 회차 — 지휘자 결과를 공격하라

1 회차 보고(네 결론) 고맙다. 지휘자가 **독립으로 재현**한 결과와 고친 그림을 넘긴다. 이번엔 이것을 **반박**하는 것이 일이다.
여전히 읽기 전용이고 근거(문서·쪽 / 파일:줄 / 좌표 / 재현 명령)로만 판정한다. 한국어.
첨부 그림(순서): ① H7E 윗면 핀아웃 ② H7E 옆면·앞면 핀아웃 ③ 제품 사진(왼쪽) vs 새 블렌더 렌더(오른쪽) 비교 ④ X20D ⑤ dual ⑥ G5H ⑦ AP-M10 ⑧ Lite ⑨ PMU 140A
(파일: `<scratchpad>\pinouts\` 아래 h7e_fig · gnss_fig · pmu, Lite = `D:\1_Work\remote-results\lite-pinout-0930\docs\lite_pinout_top.png`)

## 1. 지휘자 독립 재현 — 네 1 회차 결론과 대조
- **X20D 치명(좌우 반대)**: 재현됨. `kicad-cli(10.99) pcb export ipcd356` 로 R3 보드 패드: U17 PPS 1=GND(y 108.81) … 4=PPS(112.55), U14 UART 1=GND(118.67)…4=5V(122.43),
  U15 DEBUG 1=5V(128.50)…6=GND(134.74) → 세 커넥터가 y 증가 순 PPS·UART·DEBUG, 렌더(gnss_AP-RTK-X20D_ports.png)에서 왼→오 PPS·UART·DEBUG → 1 번 왼쪽.
  U16 CAN 1=GND x 112.53 · 4=5V x 108.79, USB1 x 116.4~125.3(CAN 보다 x 큼) · 렌더에서 USB 왼쪽 → CAN 1 번 왼쪽. 번호별 신호는 넷리스트와 일치(바꾸지 않음).
  → 그림을 1…N 왼→오로 고쳤다(① 표시). 카탈로그 pinoutNotes 는 product-facts 테스트가 "pin N → 1" 문구로 고정 — 그림 부제에 "the Pinout notes list the pins N → 1" 을 적었다.
- **dual·G5H**: dual PCB = `gnss/AP-RTK_G5H/hardware/kicad/ap_rtk_dual_altium/rtk2hp.kicad_pcb`(X-RTK2HP V6.0 을 옮긴 것) — U14 UART 1=GND(KiCad y −0.48)…4=5V(+3.27),
  U17 CAN 1=GND x −3.97 · 4=5V x −7.72, USB1 x +0.6~+9.3. G5H 보드는 X20D 와 커넥터 좌표가 같다. 판정: 선화 앞면도(윗면도 아래)에서 USB 왼쪽·CAN 오른쪽
  → x 가 왼쪽으로 증가 → CAN 1 번 왼쪽. 왼쪽 옆면도는 윗면도와 같은 세로축(앞면 = 아래) → UART 1 번(y 작음) = **위**. 그래서 UART 는 세로 표(1 번 위), CAN 은 가로 표(1 번 왼쪽).
  제조사 매뉴얼 `gnss/AP-RTK_dual/docs/AP-RTK_dual_사용자매뉴얼_260611.pdf` 6쪽 그림(5V RX TX GND)은 어느 쪽에서 본 그림인지 밝히지 않아 근거로 쓰지 않았다.
- **G5H 밑그림 오염**: 원인 = 생성기가 출력 파일(gnss_AP-RTK-dual_pinout.png)을 다시 밑그림으로 읽음. 원래 그림을 git HEAD 에서 꺼내
  `web/parts-catalog/tools/pinout/src/{dual_lineart_vendor,m10_photo_vendor}.png` 로 고정, 생성기는 src 만 읽는다.
- **Lite POWER 1·2**: 재현됨 — 보드 `fc/AF-H7E_Lite/hardware/kicad/aflite/aflite.kicad_pcb` J16 1번 x −5.63 · 6번 −11.87, J17 1번 11.94 · 6번 5.69 → 1 번 오른쪽.
  원인 = 카탈로그 그림이 09-24 판(carrier_lite 가 09-26 에 Molex SD-505568-001 로 고치기 전). 지금 carrier 로 HP 에서 다시 만든 커넥터 좌표 json 이
  저장소 `docs/lite_connectors.json` 과 **완전히 같음**을 확인하고 핀아웃을 다시 그렸다(POWER = 6…1, "TBC" → "pin 1 = right end (Molex SD-505568-001)", 모든 커넥터 1 번 자리에 ①).
- **PMU 140A J309**: 재현됨 — J309 1=+5V_FC x 265.18(10.4400 in) … 6=GND 271.43, 3·4 = 미연결 넷 → 1 번 왼쪽. J309 를 J301 과 같은 번호 표로(`pmu/APMU-12S_140A/hardware/tools/pinout_png.py`, NC = 미연결 넷).
- **PMU 100A**: J41·J42 1번 x 가 6번보다 큼(윗면 오른쪽) = 그림(6→1) 일치 → 결함 아님으로 판정. 반박할 것 있으면.
- **AF-H7E**: 네 표와 1 번 끝 전부 같다. 네가 미확인이던 **POWER C1·C2** 근거: X2-BASE.PCB `Nets/Data` + `Pads/Data`(olefile) — J13 패드 0A GND · 0B GND · 0C J13-0C · 0D J13-0D ·
  0E VC9 · 0F VC9(y 241.96→231.96), 0G GND · 0H GND · 0I · 0J · 0K VC8 · 0L VC8. VC9 = J16(POWER 1) 1·2 번, VC8 = J15(POWER 2). U6X-BASE-SCH.pdf 글자 좌표:
  J28(CAN 1, GH-4AB) 2 번 = J13-0D, 3 번 = J13-0C, U13 MCP2542 CANH(7)·CANL(6) 옆 라벨 J13-0D(y 209.2)·J13-0C(y 214.5) → 0C = CAN_L, 0D = CAN_H.
  X2-BASE 좌표 → 제품 윗면: 제품 X = −(PCB y − yc) (근거: A1 = M1 열 y 245.52 가 왼쪽, C 열 = GND 가 앞 — 제품 사진의 M1 왼쪽·GND 앞과 일치) → 0A 가 왼쪽 끝.
  md 의 1…6 = 0A…0F 순서(1 = GND). **다만 커넥터 제조사 회로 번호가 아니라 패드 글자 순서다** — 그림 부제에 적지 않았다. 반박하라.
- **ESC 6S 60A BC · F4 nano · F4 nano v2 · AP-M10 · AF-H7 nano svg**: 저장소에 PCB·도면이 없다(ESC 는 `esc/AE-6S-60A-BC/assets/AE-6S 60A BC Pinout.png` = 제조사 그림과 카탈로그 그림이 같은 그림,
  `esc/_vendor/F10_60A` 는 1 채널 ESC 라 다른 보드). F4 nano 는 사진 실크(4 3 2 1 + + − − · G 5V TX RX)와 표가 대응. 이들은 1 번 근거가 없어 **번호·① 를 새로 쓰지 않는다**.
  AP-M10 부제 = "order as printed by the maker · pin numbers are not published". 웹에서 제조사 핀 자료를 찾을 수 있으면 찾아서 반박하라(URL·쪽).

## 2. AF-H7E 새 렌더 — 실물과 같은가 (사용자 "실제품과 렌더링 비슷한가")
glb = `fc/AF-H7E/tools/h7e_glb.py`: STEP(260907_H7E.step)의 **부품·면 색**(Import.insert 가 돌려주는 색)으로 재질을 나눔 — 0.749 회색 = 알루미늄 케이스, 0.098 = FMU 로고(STEP 에 형상),
흰색 = JST 몸체, 금색/노랑 = 핀, 0.251 = 검은 헤더·Micro-Lock. 받침 보드가 두 벌(527 · X2FCPCB394)이라 흰 커넥터 쪽을 정본, 다른 쪽 면은 버림
(남겨 두면 POWER 2 핀이 12 개로 보였다: 옛 판의 핀 6 개 · 받침 PCB J15/J16 = 6 핀 1.25 mm). 각인 = `fc/AF-H7E/tools/h7e_render_cfg.py`
(사진에 보이는 것만: 앞 계단 7 개, 왼쪽 USB·ETH·AD&IO PORT, POWER 1·2 **180° 뒤집힘**(사진 "ER 1" 이 거꾸로), 헤더 경사면 M1…A8 세로(아래→위)). 오른쪽 옆면·앞 끝면은 사진이 없어 각인 없음.
첨부 ③ 에서 사진과 다른 점을 찾아라(형상·각인 위치·방향·재질).

## 3. 할 일
A. 지휘자 결과의 결함 표(등급 · 무엇 · 근거 · 재현 명령). 특히: 좌우·위아래 판정, 표 칸 순서, ① 자리, 신호, 렌더 각인 방향.
B. 1 회차 네 결함 각각: 해소됨 / 남음 / 새 문제.
C. 미결로 남길 것과 이유.
D. 추가 확인: AF-H7E md pinTable 의 PWM `type: 2.54 mm 3 × 16 pin header` — X2-BASE J13 A1…A16 은 y 간격 **2.60 mm**(245.52 → 206.52, 15 칸 39.0), 줄 A·B·C 는 x 2.51·2.54.
   제품 STEP 헤더 기둥도 x 2.6 mm 간격. 표기 "2.54 mm" 가 틀렸는지 판정하라(부품 도면·사진 근거).
E. 합의 문장: 남은 결함 0 이면 "합의" 라고 적고, 아니면 무엇이 남았는지.

## 반증검증 규약
- 모든 주장은 출처를 인용한다: 파일:라인 또는 실측 수치. 기억·추측 금지.
- 남의 결론은 수용 전 독립으로 재현한다. 재현 못 하면 '미확인'이라 쓴다.
- 파생값(계산·재기술)을 실측으로 인용하지 마라. 측정과 재기술을 명확히 구분한다.
- 인용 전 소스의 버전/커밋을 확인한다. (세션마다 다른 버전을 읽어 생기는 오판 방지)
- 예측은 관측·실행 전에 고정한다(사전등록). 사후해석 금지.
- 틀리면 즉시 명시 철회하고 무엇을 왜 틀렸는지 기록한다.
