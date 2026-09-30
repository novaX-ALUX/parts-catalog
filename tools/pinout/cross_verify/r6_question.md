# 6 회차 — 5 회차 지적 처리 확인 (2026-09-30)

5 회차 지적: F4 nano 머리말이 "모든 표 = 사진 속 실제 핀 순서"라고 단정한다 · 5 개 순서를 제조사 원본 도면과 대조한 근거가 필요하다.

처리
1. 머리말을 바꿨다(첨부 `f4_head_new.png`, `f4_nano_pinout.py` main()의 sh.header):
   "Where the board silk names each pin (ESC, ELRS and every bottom pad) the table follows that silk in the order you see it in the picture next to it;
   the other top connectors keep the order of the maker's drawing (marked on each card). There are no pin numbers."
   — 이제 '사진 속 실제 순서'라는 주장은 실크가 있는 것에만 한다.
2. 제조사 원본 도면 대조: 첨부 `f4_old_tables.png` = git HEAD 의 `web/parts-catalog/public/images/products/fc_F405_nano_pinout.png`(3000 × 4500)에서
   그 5 개 표만 잘라 낸 것. VTX 위 → 아래 NC GND NC NC VTX TX3 · CAM 5V GND CAM · PPM(RC) GND 5V PPM · BUZZER 5V RX3 BUZZ GND ·
   GPS SDA1 SCL1 RX1 TX1 5V GND — 새 카드 표(`f4_mid.png`, `f4_nano_pinout.py` TOP)와 칸마다 같다. 직접 `git show HEAD:web/parts-catalog/public/images/products/fc_F405_nano_pinout.png` 로 확인해도 된다.

질문: 이것으로 1 번 항목 유보가 해소되어 전체 합의인가? 아니면 남은 것을 근거와 함께 한 줄로.
