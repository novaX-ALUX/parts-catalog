# 반증 검증 2회차

**핀의 좌우·위아래 반전은 수정 그림에서 재발견하지 못했습니다. 합의는 아직 아닙니다.** 전압 범례, GNSS 설명 문구, PWM 헤더 간격에 확인된 불일치가 남았습니다. 첨부 수정 그림은 현재 카탈로그 PNG와 SHA-256이 같음을 확인했습니다.

검사한 버전은 루트 `ae5945ee`, FC `fa0aa6c`, GNSS `c277263`, 카탈로그 `ed61094`의 **현재 작업트리**입니다. 카탈로그 그림과 생성기에는 미커밋 변경이 있습니다.

## A. 지휘자 결과의 결함

| 등급 | 무엇이 남았나 | 근거 | 재현 |
|---|---|---|---|
| **중대** | **AF-H7E 윗면 그림의 `+ = 5 V` 범례가 PWM 서보 전원에도 적용돼 보인다.** PWM 표의 `+`는 외부 공급 `V_SERVO`이며 허용 표기는 0–9.9 V다. 그림 내부의 “external BEC” 설명과도 충돌한다. | [그림 생성기:114](</D:/1_Work/1_project/39_gitNovaX/web/parts-catalog/tools/pinout/h7e_pinout.py:114>), [제품 핀 표:216·223](</D:/1_Work/1_project/39_gitNovaX/web/parts-catalog/src/content/fc/AF-H7E.md:216>), 첨부 ① 상단 범례·PWM 표 | E1 |
| **중대** | **GNSS `pinoutNotes`가 수정 그림과 반대 방향의 신호열을 방향 설명 없이 유지한다.** dual·G5H 그림은 UART를 1→4 `GND·TX·RX·5V`, CAN을 1→4 `GND·L·H·5V`로 번호까지 표시한다. 제품 페이지 문장은 `5V·RX·TX·GND`, `5V·H·L·GND`다. X20D 그림에만 “notes N→1” 단서가 있으며, 제품 설명 자체에는 없다. | [X20D:25](</D:/1_Work/1_project/39_gitNovaX/web/parts-catalog/src/content/gnss/AP-RTK-X20D.md:25>), [dual:7](</D:/1_Work/1_project/39_gitNovaX/web/parts-catalog/src/content/gnss/AP-RTK-dual.md:7>), [G5H:7](</D:/1_Work/1_project/39_gitNovaX/web/parts-catalog/src/content/gnss/AP-RTK-G5H.md:7>), 첨부 ④–⑥ | E1 |
| **중대** | **AF-H7E PWM 헤더의 `2.54 mm` 표기가 PCB의 열 간격과 다르다.** J13 A1 Y=245.5164 mm, A16 Y=206.5164 mm로 15칸에 39.0000 mm, 즉 **열 간격 2.6000 mm**다. 행 간격은 A1→B1 2.5146 mm, B1→C1 2.5400 mm다. 따라서 한 값 `2.54 mm`로 3×16 전체 피치를 설명할 수 없다. | [핀 표:212·219](</D:/1_Work/1_project/39_gitNovaX/web/parts-catalog/src/content/fc/AF-H7E.md:212>), `X2-BASE.PCB` J13 패드 원시 좌표; `X2-BASE.pdf` 2쪽 `PAJ130A1` (713,95.7), `PAJ130A16` (713,455.7)도 15칸 간격을 독립 확인. [렌더 설정:82–83](</D:/1_Work/1_project/39_gitNovaX/fc/AF-H7E/tools/h7e_render_cfg.py:82>)의 2.6은 **파생 설정값**으로만 취급했다. | E2 |
| **중대** | **dual·G5H의 바탕은 제품 렌더/사진이 아니라 제조사 선화다.** 사용자 지정 형식의 “제품 렌더/사진 + 핀 표 + 파란 점선” 중 첫 항목이 남았다. 제품 렌더 파일은 두 제품 모두 카탈로그에 있다. 단, 선화의 `DUAL` 로고를 G5H의 잘못된 브랜드라고 한 1회차 의심은 **철회**한다. G5H 제품 렌더에도 같은 로고·케이스가 있다. | [생성기:14·92·98](</D:/1_Work/1_project/39_gitNovaX/web/parts-catalog/tools/pinout/gnss_pinout.py:14>), 첨부 ⑤·⑥, `gnss_AP-RTK-{dual,G5H}_device.png` 두 파일의 동일 SHA-256 `8DEA2DB4…` | E3 |
| **경미** | AF-H7E 옆면 그림은 “각 표가 실제 보이는 핀 순서”라고 하지만 **USB-C를 `VBUS·D+·D−·CC·GND`의 가로 5칸**으로 그렸다. USB-C는 A/B 두 접점열이며 이 5칸은 기능 요약이다. `reversible, no pin 1` 표기는 정확하나, 다른 커넥터의 물리 핀 표와 구분이 약하다. | [생성기:227–229](</D:/1_Work/1_project/39_gitNovaX/web/parts-catalog/tools/pinout/h7e_pinout.py:227>), [실제 A/B 접점 정의:232](</D:/1_Work/1_project/39_gitNovaX/web/parts-catalog/src/content/fc/AF-H7E.md:232>), 첨부 ② | E1 |
| **경미** | AF-H7E 새 렌더는 윤곽·포트 위치·주요 각인 방향이 기준 이미지와 가깝지만, **나사 머리는 기준 이미지에서 은색, 새 렌더에서 검정**이고 앞쪽 7개 커넥터의 안쪽은 새 렌더가 훨씬 밝다. 이는 형상 오류 판정이 아니라 **기준 이미지와의 재질·조명 차이**다. | 첨부 ③의 FMU 전면 나사와 TELEM/CAN 개구; [렌더 설정의 나사·커넥터 색:94–96](</D:/1_Work/1_project/39_gitNovaX/fc/AF-H7E/tools/h7e_render_cfg.py:94>) | E3 |
| **경미** | AP-M10 그림의 “제조사는 핀 번호를 공개하지 않았다”는 단정은 출처가 없다. 이번 검색에서 해당 제품의 공식 번호 자료를 확보하지 못한 것과 **공개 자체가 없다는 주장**은 다르다. | [생성기:103](</D:/1_Work/1_project/39_gitNovaX/web/parts-catalog/tools/pinout/gnss_pinout.py:103>), 원본 `m10_photo_vendor.png`는 신호명만 표기 | E1, E4 |

## B. 1회차 결함별 판정

| 1회차 지적 | 2회차 판정 |
|---|---|
| X20D 4개 표 좌우 반전 | **해소.** 현재 그림은 PPS·UART·DEBUG·CAN 모두 1번 왼쪽이며 번호별 신호도 PCB와 같다. |
| AF-H7E Lite POWER 1·2 반전 | **해소.** 현재 표·빨간 ①는 오른쪽. Lite PCB J16의 1번 X=−5.625/6번 −11.875 mm, J17의 1번 11.941/6번 5.691 mm와 일치한다. |
| AF-H7E 가로 커넥터에 세로 표 | **해소.** 두 그림의 가로 표·빨간 ①를 `X2-BASE.PCB` 패드 끝과 대조했다. POWER 1·2와 C1·C2는 왼쪽, 앞쪽 7개·옆면·앞 끝의 번호형 포트는 해당 시점의 오른쪽이다. **새 전압 범례 오류는 A 참조.** |
| G5H 그림 오염·잘못된 제품 의심 | **오염은 해소.** 생성기가 고정된 `src/dual_lineart_vendor.png`를 읽는다. **‘DUAL 로고가 G5H와 다르다’는 주장은 철회:** G5H 카탈로그 제품 렌더도 같은 케이스·로고다. 선화 사용에 관한 형식 문제는 남음. |
| AF-H7 nano SVG는 물리 핀아웃이 아님 | **남음.** 이번 수정 대상에 포함되지 않았고 [SVG 자체](</D:/1_Work/1_project/39_gitNovaX/web/parts-catalog/public/images/products/fc_AF-H7_nano_firmware_ports.svg:7>)가 “NOT connector pin order”라고 표시한다. |
| PMU 140A J309에 1번·번호 표 없음 | **해소.** 새 표 1–6과 PCB J309: 1번 X=265.175 mm `+5V_FC`, 3·4번 미연결, 6번 X=271.425 mm GND가 일치한다. |
| dual 세로 UART에 가로 표 | **해소.** 원본 Altium `RTK2HP_V6.0.PcbDoc`를 직접 읽었다. U14의 1번 GND Y=73.7898 mm, 4번 5V Y=70.0398 mm이고 앞면 USB/CAN 쪽 Y≈54 mm이므로 왼쪽 옆면도의 1번은 **위**다. U17 CAN 1번 X=84.9889 mm, 4번 X=81.2389 mm; USB는 X=89.5884–98.2284 mm이므로 앞면도 1번은 **왼쪽**이다. 새 그림과 같다. |
| ESC·F4·PMU100·AP-M10의 1번 미표시/미확인 | **PMU100은 확인 완료:** J41·J42 풋프린트가 180° 회전, 1번은 각각 중심 X+3.125 mm로 오른쪽이며 6→1 그림과 맞는다. ESC·F4·AP-M10은 번호 근거가 없어 **미결**이다. 근거 없이 ①를 추가하지 않은 결정은 타당하다. |

## C. 미결

- AF-H7E POWER C1·C2는 J13 `0A…0F`와 `0G…0L`의 **왼쪽부터 자체 번호 1…6**이라는 대응과 신호를 PCB·회로도로 재현했다. 다만 원본 패드 이름은 문자이며, 별도 커넥터의 제조사 **Circuit 1** 표시를 확보하지 못했다. 빨간 ①가 ‘카탈로그 자체 번호’인지 명시할 필요가 있다.
- PWM 헤더 **실제 양산품의 공칭 피치와 호환 부품 번호**는 미확인이다. BOM `X2-BASE.xls` 84행은 J13을 `DIP-60`으로만 기록한다. 이번에 확정한 2.6000 mm는 PCB 설계 좌표다.
- AP-M10 공식 핀 번호 자료, ESC·F4 실물 커넥터의 Circuit 1 자료는 확보하지 못했다. `AP-M10 BMM350`, `X_G10C`, `DIP-C16A` 검색에서는 해당 제품의 공식 도면이 나오지 않았다.
- 첨부 ③의 왼쪽도 제조사 제공 **제품 이미지**다. 두 이미지의 재질 차이는 관찰됐지만 어느 쪽이 양산품 색·표면을 정확히 나타내는지는 실물 없이 판정할 수 없다. 오른쪽 옆면·앞 끝면 각인도 비교 사진이 없다.

## D. PWM `2.54 mm` 판정

**현재 PCB 설계 기준으로 표기가 틀립니다.** J13 A1→A16의 15칸이 정확히 39.0000 mm이므로 **열 피치 2.6000 mm**입니다. A1→B1은 2.5146 mm, B1→C1은 2.5400 mm입니다. [제품 문서의 단일 `2.54 mm 3 × 16` 표기](</D:/1_Work/1_project/39_gitNovaX/web/parts-catalog/src/content/fc/AF-H7E.md:212>)로 이 배열을 설명할 수 없습니다. 사진만으로 0.06 mm 차이를 측정하거나 실제 제작품의 공칭 규격을 확정하지는 않았습니다.

## E. 합의 여부·재현 명령

**합의 아님.** 위치 반전 3건(X20D·Lite·dual)은 해소에 동의한다. A의 전압 범례·GNSS 설명·피치 불일치와 사용자 지정 그림 형식이 남는다.

사용한 Windows 읽기 명령의 핵심:

```powershell
D:\1_Work\tools\whereami.cmd
git rev-parse HEAD
rg -n 'Servo rail 0|2\.54 mm 3|pinoutNotes' web/parts-catalog/src/content
rg -n '5 V|lineart_dual|pin numbers are not published' web/parts-catalog/tools/pinout
```

PCB 좌표는 `C:\Program Files\KiCad\10.0\bin\python.exe`의 `pcbnew.LoadBoard()`에서 `GetReference()`, `Pads()`, `GetNumber()`, `GetPosition()`, `GetNetname()`을 출력했다. PMU J309 재현 예:

```powershell
& 'C:\Program Files\KiCad\10.0\bin\python.exe' -c 'import pcbnew,sys; b=pcbnew.LoadBoard(sys.argv[1]); [print(f.GetReference(),[(p.GetNumber(),round(p.GetPosition().x/1e6,4),round(p.GetPosition().y/1e6,4),p.GetNetname()) for p in f.Pads()]) for f in b.GetFootprints() if f.GetReference()==sys.argv[2]]' 'D:\1_Work\1_project\39_gitNovaX\pmu\APMU-12S_140A\hardware\kicad\apmu_pcb\APMU-12S_140A.kicad_pcb' J309
```

AF-H7E·dual 원본 Altium은 Python `olefile`로 `Pads/Data`·`Nets/Data` 또는 `Pads6/Data`·`Nets6/Data`를 직접 읽었고, `fitz`로 `X2-BASE.pdf` 2쪽의 패드 문자 위치를 교차 확인했다. 파일은 수정하지 않았다.