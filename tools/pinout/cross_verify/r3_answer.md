**A. 새 결함: 없음.** 이번 7장에서는 핀 표의 방향·신호와 ① 위치에서 새 오류를 확인하지 못했다. 판정 기준은 카탈로그 `HEAD ed610943`의 **수정 중인 작업트리**와 AF-H7E `HEAD fa0aa6c`다. 따라서 커밋 완료 판정은 아니다.

**B. 2회차 지적 판정**

| 지적 | 판정 | 근거 |
|---|---|---|
| A1 PWM `+` 전압 범례 | 해소 | PWM은 외부 BEC 서보 전원이라고 별도 명시했다. [h7e_pinout.py:133](D:/1_Work/1_project/39_gitNovaX/web/parts-catalog/tools/pinout/h7e_pinout.py:133) |
| A2 GNSS 설명의 N→1 방향 | 해소 | X20D·dual·G5H의 `pinoutNotes`가 역순임을 명시한다. [X20D.md:25](D:/1_Work/1_project/39_gitNovaX/web/parts-catalog/src/content/gnss/AP-RTK-X20D.md:25), [dual.md:7](D:/1_Work/1_project/39_gitNovaX/web/parts-catalog/src/content/gnss/AP-RTK-dual.md:7), [G5H.md:7](D:/1_Work/1_project/39_gitNovaX/web/parts-catalog/src/content/gnss/AP-RTK-G5H.md:7) |
| A3 PWM 2.54 mm 표기 | 해소 | 열 간격을 **베이스 PCB 기준 2.6 mm**로 한정했다. 앞서 읽은 X2-BASE J13의 A1·A16 `y=245.5164·206.5164 mm`에서 계산한 15칸 간격도 2.6 mm다. 양산 부품 공칭값은 주장하지 않는다. [AF-H7E.md:212](D:/1_Work/1_project/39_gitNovaX/web/parts-catalog/src/content/fc/AF-H7E.md:212) |
| A4 dual·G5H 선화 바탕 | 해소 | 앞면은 제품 렌더, UART 옆면은 제조사 도면임을 그림에 밝힌다. [gnss_pinout.py:79](D:/1_Work/1_project/39_gitNovaX/web/parts-catalog/tools/pinout/gnss_pinout.py:79), [dual 그림](D:/1_Work/1_project/39_gitNovaX/web/parts-catalog/public/images/products/gnss_AP-RTK-dual_pinout.png) |
| A5 USB-C 가짜 5칸 | 해소 | 한 칸 `USB 2.0`으로 바꾸고 접점별 신호는 페이지 핀 표를 가리킨다. [h7e_pinout.py:229](D:/1_Work/1_project/39_gitNovaX/web/parts-catalog/tools/pinout/h7e_pinout.py:229) |
| A6 나사·커넥터 렌더 | 해소 | 나사는 은색으로 바뀌었다. [cmp_photo3.png](<<scratchpad>/pinouts/h7e_blend/cmp_photo3.png>), [h7e_render_cfg.py:94](D:/1_Work/1_project/39_gitNovaX/fc/AF-H7E/tools/h7e_render_cfg.py:94). 커넥터 안쪽은 비교 사진보다 밝지만, 조명 차이와 실제 재질 차이를 분리할 실물 근거가 없어 결함으로 확정하지 않는다. |
| A7 AP-M10 공개 자료 단정 | 해소 | **사용한 사진에 번호가 없다**는 범위로 문장을 좁혔다. 원본 사진에는 신호명 표가 있다. [gnss_pinout.py:111](D:/1_Work/1_project/39_gitNovaX/web/parts-catalog/tools/pinout/gnss_pinout.py:111), [원본 사진](D:/1_Work/1_project/39_gitNovaX/web/parts-catalog/tools/pinout/src/m10_photo_vendor.png) |
| C1 POWER C의 자체 번호 | 해소 | 1…6이 베이스 PCB 패드 `0A→0F`·`0G→0L` 순서임을 표 부제에 명시했다. [h7e_pinout.py:52](D:/1_Work/1_project/39_gitNovaX/web/parts-catalog/tools/pinout/h7e_pinout.py:52) |
| ① 표시 위치 | 해소 | 표시 중심을 커넥터 상자 안쪽 끝으로 옮겼다. 생성기 좌표와 현재 그림에서 인접 USB·CAN 표시가 구분된다. [h7e_pinout.py:96](D:/1_Work/1_project/39_gitNovaX/web/parts-catalog/tools/pinout/h7e_pinout.py:96), [gnss_pinout.py:167](D:/1_Work/1_project/39_gitNovaX/web/parts-catalog/tools/pinout/gnss_pinout.py:167) |

**C. 합의** — 이번 3회차 대상의 확인된 잔여 결함은 없다. 사용자가 합의에서 제외한 미결 항목과 별도 `sync-conflict` 빌드 오류는 이 판정에 포함하지 않았다.