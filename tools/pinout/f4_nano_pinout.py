# -*- coding: utf-8 -*-
"""AF-F4 nano(= AF-F4 T10 nano 페이지도 같은 그림) 핀아웃 한 장 — 원래 배치(보드 사진 가운데 + 둘레 표 + 파란 점선) · 표 글자 = 화면 13 px 이상.

근거(이 보드 PCB 는 저장소에 없다 — 보드 사진의 실크 · 옛 핀아웃 그림):
  윗면 ESC 커넥터(실크 4 3 2 1 + + − −) · ELRS(실크 G 5V TX RX) = 실크 순서 그대로.
  아랫면 패드 = 실크(180° 돌려 인쇄) → 사진에서 보이는 순서로 옮겼다:
    SBUS 묶음 위 줄 GND 5V SBUS · 아래 줄 GND 3.3V RX2 / RGB 묶음 위 RGB GND 5V · 아래 RX3 TX5 RX5 /
    I2C·UART 한 줄 5V SDA1 SCL1 RX1 TX1 GND / VTX 위 → 아래 TX3 VTX GND / 모터 BAT S4 S3 S2 S1 S5 S6 S7 S8 GND.
    옛 그림은 SBUS 좌우 · VTX 위아래를 실크 글자 읽는 방향대로 적어 사진과 반대였다(2026-09-30 실크 대조, 반증 워커 합의).
  윗면 VTX · CAM · RC · BUZZER · GPS = 핀마다 실크가 없어 옛 핀아웃 그림의 순서 그대로(옛 그림 표와 칸마다 같음 — 워커 6 회차).
  1 번 핀 자료가 없어 번호 · ① 를 쓰지 않는다.
바탕(2026-10-27 이사님 #o2ac037c4 "이 사진들도 같이 렌더링해서 일관성 맞추라고"): 카탈로그 렌더
      public/images/products/fc_AF-F4-nano_top.png · fc_AF-F4-nano_bottom.png(아랫면은 180° 돌림 — 옛 제조사 사진과 같은 방향이라야
      표의 '보이는 순서'가 그대로 맞다). 상자 = 옛 사진(fc_F405_nano.png · src/f4_nano_bottom_vendor.png)의 검증된 상자를 검은 판
      테두리 맞춤으로 옮긴 것(미리보기/catalog-render/pinout_rebase.py) — 렌더 실크(4 3 2 1 + + − − · G 5V TX RX · 패드 글자)와 대조함.
사용자 2026-09-30 "제품으로 해서 한페이지로 하고 원래 레이아웃에 포트설명 글자만 키우면되지" → 한 장, 원래 배치.
실행: python f4_nano_pinout.py [출력 폴더]   → fc_F405_nano_pinout.png
"""
import os
import sys

import cv2
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from pinout_style import Sheet, load_rgb, region, word_cells  # noqa: E402

CAT = os.path.normpath(os.path.join(HERE, "..", ".."))
IMG = os.path.join(CAT, "public", "images", "products")
OUT = sys.argv[1] if len(sys.argv) > 1 else IMG
MAKER = " · maker's order"                  # 핀별 실크가 없는 것 = 옛 제조사 그림 순서
LEGEND = ["red = power    black = GND    blue = signal    grey = not connected"]


def bottom():
    """아랫면 렌더를 180° 돌린 것 — 옛 제조사 사진과 같은 방향(SBUS 왼쪽 위 · 모터 패드 아래)."""
    return np.ascontiguousarray(np.rot90(load_rgb(os.path.join(IMG, "fc_AF-F4-nano_bottom.png")), 2))


def rows(*lines):
    return ("rows", [word_cells(ln.split()) for ln in lines])


def h(words):
    return ("h", word_cells(words.split()))


def v(words):
    return ("v", word_cells(words.split()))


REG = (180, 1420, 0, 1200)   # 렌더 1600 × 1200 — 판 235…1364 · 35…1165 px
TOP = [   # (이름, 상자 px (x0, x1, y0, y1), 부제, 표, 자리 T · B · L · R, 줄) — 윗면 렌더 fc_AF-F4-nano_top.png
    ("ESC", (591, 922, 29, 163), "8-Pin · silk 4 3 2 1 + + − − (+ = VBAT)", h("S4 S3 S2 S1 + + − −"), "T", 1),
    ("ELRS", (951, 1146, 25, 163), "4-Pin · UART4 · silk G 5V TX RX", h("GND 5V TX4 RX4"), "T", 1),
    ("VTX", (1243, 1389, 210, 477), "6-Pin · UART3 TX" + MAKER, v("NC GND NC NC VTX TX3"), "R", 1),
    ("CAM", (1243, 1380, 502, 654), "3-Pin · video in" + MAKER, v("5V GND CAM"), "R", 1),
    ("RC", (465, 636, 1011, 1163), "3-Pin · PPM" + MAKER, h("GND 5V PPM"), "B", 1),
    ("BUZZER", (659, 877, 1011, 1163), "4-Pin · UART3 RX" + MAKER, h("5V RX3 BUZZ GND"), "B", 2),
    ("GPS", (912, 1179, 1011, 1163), "6-Pin · UART1 + I2C1" + MAKER, h("SDA1 SCL1 RX1 TX1 5V GND"), "B", 1),
]
BOTTOM = [  # 아랫면 렌더 fc_AF-F4-nano_bottom.png 를 180° 돌린 것
    ("SBUS pads", (419, 564, 42, 187), "UART2 RX · RC input", rows("GND 5V SBUS", "GND 3.3V RX2"), "T", 1),
    ("RGB pads", (632, 773, 42, 187), "UART3 / UART5 · LED or serial", rows("RGB GND 5V", "RX3 TX5 RX5"), "T", 2),
    ("I2C / UART pads", (899, 1131, 49, 116), "I2C1 / UART1", h("5V SDA1 SCL1 RX1 TX1 GND"), "T", 1),
    ("VTX pads", (1296, 1364, 767, 906), "UART3 TX · VTX control", v("TX3 VTX GND"), "R", 1),
    ("MOTOR / POWER pads", (598, 1030, 1086, 1163), "Motor signals S1–S8 + battery", h("BAT S4 S3 S2 S1 S5 S6 S7 S8 GND"), "B", 1),
]


def main():
    top, bot = load_rgb(os.path.join(IMG, "fc_AF-F4-nano_top.png")), bottom()
    sh = Sheet()
    sh.header("AF-F4 nano Pinout", "Both sides seen straight on. Each table lists the pins left → right (side connectors: top → bottom) "
              "as you see them in the picture. The board silk names the ESC, ELRS and every bottom pad; the other top connectors keep "
              "the maker's order. There are no pin numbers.", LEGEND)
    for title, img, reg, conns, w in (("Top side", top, REG, TOP, 820),
                                      ("Bottom side (pads)", bot, REG, BOTTOM, 900)):
        sh.caption(title)
        sh.board(region(img, *reg), [{"box": (b[0] - reg[0], b[1] - reg[0], b[2] - reg[2], b[3] - reg[2]), "name": nm, "sub": sub,
                                      "table": tb, "p1": None, "side": sd, "row": rw} for nm, b, sub, tb, sd, rw in conns], img_w=w)
    sh.note(["Also on the board: MCU STM32F405RG (168 MHz · 1 MB flash · 192 KB RAM) · IMU ICM-42688-P · OSD AT7456E · "
             "BOOT button and USB Type-C on the top · TF card slot and the BEC on the bottom."])
    out = os.path.join(OUT, "fc_F405_nano_pinout.png")
    rep = sh.save(out)
    print(out, rep["shown_px"], "min font on screen %.1f px (%r)" % (rep["min_font_screen_px"], rep["smallest_text"]))


if __name__ == "__main__":
    main()
