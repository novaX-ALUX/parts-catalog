# 반증 워커 1 회차 — 카탈로그 핀아웃 그림 전수 검사 (독립 풀이)

너는 읽기 전용 반증 검증자다. 파일을 고치지 말고, 근거(문서·쪽 / 파일:줄 / 실측 좌표)로만 판정해 보고서를 쓴다. 한국어로 쓴다.
작업 폴더 = `D:\1_Work\1_project\39_gitNovaX` (Windows, WSL 금지). 파이썬은 `%PY313%`
(PyMuPDF·olefile·PIL 사용 가능 여부는 직접 확인). 지휘자(나)는 같은 문제를 따로 풀고 있고, 2 회차에 서로의 결론을 공격한다.

## 사용자 요구 (2026-09-29, 원문)
- "커넥터는 가로로 되어있는데 어디가 1번인줄 알고 이렇게 표현하는데???" · "커넥터 모양대로 핀아웃을 설명해야 헷갈리지 않을거 아냐!!!!!"
  → 핀 표는 **그림에 보이는 커넥터 방향 그대로** 칸을 늘어놓아야 한다(가로 커넥터 = 가로 표, 칸의 왼→오 = 그 시점에서 실제 핀의 왼→오),
  **1 번 핀이 어느 끝인지** 그림에서 바로 보여야 하고, 그 1 번 위치는 **근거 자료**로 판정해야 한다.
- "다른 핀아웃도 전수 검사 제대로 해!!" · "실제품과 렌더링 비슷한가"
- 카탈로그 핀아웃 = 우리 스타일(제품 렌더/사진 + 커넥터별 핀 표 + 파란 점선), 타사(CUAV) 그림 금지.

## 과제 1 — AF-H7E 커넥터 24 개: 시점별 1 번 핀의 물리 위치 (독립 도출)
시점 정의(제품 좌표: 뒤 = PWM 헤더 쪽, 앞 = 커넥터 7 개가 있는 낮은 계단 쪽):
- 윗면도: 위에서 내려다봄, **화면 위 = 뒤(PWM)**, 화면 오른쪽 = 제품 오른쪽 옆면(마이크로 SD·UART4 쪽)
- 왼쪽 옆면도: 왼쪽(USB-C·ETH·AD&IO 쪽)에서 봄, 화면 오른쪽 = 앞
- 오른쪽 옆면도: 오른쪽(UART4·SPI6·DSM·PPM·SBUS OUT 쪽)에서 봄, 화면 오른쪽 = 뒤
- 앞 끝면도: 앞에서 봄(FMU DEBUG·USB·IO DEBUG), 화면 오른쪽 = 제품 오른쪽
커넥터마다: ① 그 시점에서 1 번 핀이 왼/오(또는 위/아래) 어느 끝인지 ② 핀 번호별 신호 ③ 근거. 신호는 카탈로그 정본
`web/parts-catalog/src/content/fc/AF-H7E.md` 의 `pinTable` 과 대조하고 다르면 결함으로 적는다.
근거 자료(전부 로컬):
- 받침(베이스) 보드 회로도 `fc/_vendor/V6X/APM_H7E_FC/V6X-BASE/U6X-BASE/U6X-BASE-SCH.pdf` · PCB 도면 `U6X-BASE-PCB.pdf` · `X2-BASE.pdf`
- 받침 보드 Altium PCB `.../U6X-BASE/X2-BASE.PCB`(OLE). 부품·패드를 읽는 참고 파서(지휘자 작성, 검증 대상):
  `<scratchpad>\pinouts\h7e_pcb\read_pcbdoc.py`
  와 그 출력 `x2base.json`(좌표 mm, 패드 이름·부품 번호). 파서도 믿지 말고 필요하면 따로 확인.
- 원본 전체 회로도 `fc/_vendor/V6X/Schematic_V6x_1213.pdf` · 펌웨어 `fc/boards/AF-H7E/ardupilot/hwdef.dat`(SERIAL_ORDER)
- 제품 3D `fc/AF-H7E_Lite/hardware/260907_H7E.step`(케이스+보드+모듈, 약 15° 기울어짐 — 바닥판을 수평으로 돌려 본다)
- 제품 사진(제조사 렌더) `web/parts-catalog/public/images/products/fc_CUAV_V6X.jpg` — 첨부 1
- JST GH 위꽂이(BM..B-GHS-TBT)·옆꽂이(SM..B-GHS-TB), JST SH, Molex Micro-Lock Plus 등 커넥터 도면의 Circuit No.1 위치(웹 검색 허용, URL·쪽 인용)
- 참고(1 번 규칙 선행 조사): `esc/AE-12S-80A-FOC-G4/hardware/docs/connector_compare_h7e_esc_xu_20260923.png`
확인할 것: 받침 보드가 케이스 안에서 **어느 면이 위인지**(뒤집혀 장착되는지) — 이것이 1 번의 좌우를 뒤집는다. 근거로 판정할 것.

## 과제 2 — 나머지 카탈로그 핀아웃 그림 전수
대상(카탈로그 `web/parts-catalog/public/images/products/`, 쓰는 곳 = `src/content/**.md` 의 pinoutImage(s)):
| 그림 | 제품 md | 회로·자료 위치(참고) |
|---|---|---|
| esc_32-6S-60A-BC_pinout.png | esc/AE-6S-60A-BC.md | esc/AE-6S-60A-BC/ |
| fc_F405_nano_pinout.png | fc/AF-F4-nano.md · fc/AF-F4-T10-nano.md | fc/AF-F4_T10_nano/ · fc/boards/ |
| fc_F4_nano_v2_pinout_top.png · _bottom.png | fc/AF-F4-nano-v2.md | fc/AF-F4_nano_v2/ |
| fc_AF-H7E-Lite_pinout.png | fc/AF-H7E-Lite.md | fc/AF-H7E_Lite/ (tools/carrier_layout.json · docs/) |
| fc_AF-H7_nano_firmware_ports.svg | fc/AF-H7-nano.md | fc/boards/ |
| pmu_APMU-12S-100A_pinout.png | pmu/APMU-12S-100A.md | pmu/APMU-12S_100A/ |
| pmu_APMU-12S-140A_pinout.png · pmu_APMU-BTN1_cable.png | pmu/APMU-12S-140A.md | pmu/APMU-12S_140A/ |
| gnss_AP-RTK-X20D_pinout.png | gnss/AP-RTK-X20D.md | gnss/AP-RTK_X20D/ |
| gnss_AP-RTK-dual_pinout.png | gnss/AP-RTK-dual.md | gnss/AP-RTK_dual/ |
| gnss_AP-RTK-G5H_pinout.png | gnss/AP-RTK-G5H.md | gnss/AP-RTK_G5H/ |
| gnss_X_G10C_pinout.png | gnss/AP-M10.md | (제조사 제품) |
GNSS 4 장은 지휘자가 오늘 새로 만든 것(아직 커밋 전), 이전 판은 `...\scratchpad\pinouts\pv\before\` 에 있다. 생성기 = `web/parts-catalog/tools/pinout/`.
그림마다 본다: (a) 표 칸 순서가 그림 속 커넥터의 실제 핀 순서·방향과 같은가(가로/세로 포함) (b) 1 번 위치가 그림에서 보이는가, 그 근거가
있는가(회로도·PCB·커넥터 도면) (c) 핀별 신호가 md 의 pinTable·pinoutNotes·회로도와 같은가 (d) 픽스호크 표준(1 = 전원, 마지막 = GND)과 다르면
그것이 실제 보드대로인지(근거) (e) 타사 그림·타사 브랜드가 남았는가 (f) 그림 속 제품 모양이 실제 제품과 다른가.

## 출력 형식
A. 결함 표 — | 등급(치명/중대/경미) | 그림·커넥터 | 무엇이 틀렸나 | 근거(문서·쪽 / 파일:줄 / 좌표) | 재현 명령 |
B. 확인 완료 — 커넥터·그림별 판정(1 번 끝·근거 한 줄)
C. 확인 못 한 것 — 무엇이 없어서
D. 지휘자에게 묻거나 반박할 것
E. 쓴 명령 목록

## 반증검증 규약
- 모든 주장은 출처를 인용한다: 파일:라인 또는 실측 수치. 기억·추측 금지.
- 남의 결론은 수용 전 독립으로 재현한다. 재현 못 하면 '미확인'이라 쓴다.
- 파생값(계산·재기술)을 실측으로 인용하지 마라. 측정과 재기술을 명확히 구분한다.
- 인용 전 소스의 버전/커밋을 확인한다. (세션마다 다른 버전을 읽어 생기는 오판 방지)
- 예측은 관측·실행 전에 고정한다(사전등록). 사후해석 금지.
- 틀리면 즉시 명시 철회하고 무엇을 왜 틀렸는지 기록한다.
