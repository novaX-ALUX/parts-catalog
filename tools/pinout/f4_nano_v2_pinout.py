# -*- coding: utf-8 -*-
"""AF-F4 nano v2 핀아웃 한 장 — FC 윗면 사진 + BEC 보드 사진, AF-H7E 와 같은 배치(사진 + 둘레 표 + 파란 점선) · 글자 = 화면 13 px 이상.

사용자 2026-09-30 "지금 H7E 처럼 모든 것들 핀아웃 만들자 … 일관성 지키고 … 니 맘대로 핀 변경하지말고" →
  표의 글자 · 순서 = 지금 공개된 그림(0166c49)과 똑같이(핀 잠금 대조 = scratchpad lock/check_lock.py). 모양만 다른 제품과 같게.
근거:
  FC 보드 = PCB fc/_vendor/F405/Nova_F405-8S_V1.5/AP_F405_FC_V1.5.PcbDoc(패드 좌표 · 넷, 기록 cross_verify/README.md 4 차) →
    ESC 9핀(P11) 왼→오 = 9…1 번(CUR · S4 · S3 · S2 · S1 · + · + · − · −, 보드 실크 "C 4 3 2 1 + + − −" 와 같음) ·
    GPS 6핀(P3) 위→아래 = 6…1 번(− · + · TX · RX · SCL · SDA) · BEC 8핀(J1) 위→아래 = 8…1 번(− · SCL · SDA · LED · TX · RX · TX · RX)
  BEC 보드 = PCB 가 저장소에 없다 → 제조사 그림 표 그대로(번호 · ① 없음).
바탕: FC = 카탈로그 제품 사진 public/images/products/fc_F4_nano_v2.png · BEC 보드 = src/f4_nano_v2_bec_vendor.png
      (git 의 옛 fc_F4_nano_v2_pinout_bottom.png 에서 보드 사진만 잘라 둔 것 — 제조사 파란 점선은 여기서 지운다. 출력 파일을 다시 읽지 않는다).
실행: python f4_nano_v2_pinout.py [출력 폴더]   → fc_F4_nano_v2_pinout.png
"""
import os
import sys

import cv2
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from pinout_style import RED, Sheet, load_rgb, region, word_cells  # noqa: E402

CAT = os.path.normpath(os.path.join(HERE, "..", ".."))
IMG = os.path.join(CAT, "public", "images", "products")
OUT = sys.argv[1] if len(sys.argv) > 1 else IMG


def bec_board():
    """BEC 보드 사진 — 제조사가 그린 파란 점선 상자 · 지시선을 주변 색으로 메운다."""
    a = load_rgb(os.path.join(HERE, "src", "f4_nano_v2_bec_vendor.png"))
    r, g, b = [a[:, :, i].astype(int) for i in range(3)]
    mask = ((b > r + 60) & (b > g + 25)).astype(np.uint8) * 255
    mask = cv2.dilate(mask, np.ones((3, 3), np.uint8), iterations=2)
    return cv2.inpaint(a[:, :, ::-1].copy(), mask, 5, cv2.INPAINT_TELEA)[:, :, ::-1]


def h(words, pins=None):
    return ("h", word_cells(words.split(), pins))


def v(words, pins=None):
    return ("v", word_cells(words.split(), pins))


FC = [   # (이름, 상자 px (x0, x1, y0, y1) — fc_F4_nano_v2.png 1024 × 974, 부제, 표, 1 번 끝, 자리)
    ("ESC Interface", (281, 556, 37, 156), "9-Pin · JST-SH · to the 4-in-1 ESC", h("CUR S4 S3 S2 S1 + + − −", list(range(9, 0, -1))), "R", "T"),
    ("GPS", (860, 975, 220, 425), "6-Pin · JST-SH · USART1 + I2C1", v("− + TX RX SCL SDA", list(range(6, 0, -1))), "B", "R"),
    ("BEC", (860, 978, 445, 700), "8-Pin · JST-SH · to the BEC board", v("− SCL SDA LED TX RX TX RX", list(range(8, 0, -1))), "B", "R"),
]
# BEC 보드: src 그림 좌표 = 옛 그림(1250 × 1217) 좌표 − 잘라 낸 원점(190, 215)
OX, OY = 190, 215
BEC = [
    ("POWER", (350, 556, 230, 359), "6-Pin · power in", h("SCL SDA + + − −"), "T", 1),
    ("From FC", (629, 854, 230, 365), "8-Pin · from the FC BEC port", h("− SCL SDA LED RX TX RX TX"), "T", 1),
    ("LED", (195, 296, 409, 515), "", None, "L", 1),
    ("LED", (195, 296, 696, 840), "", None, "L", 1),
    ("LED", (906, 1015, 661, 767), "", None, "R", 1),
    ("LED", (906, 1015, 796, 902), "", None, "R", 1),
    ("Camera SOC", (365, 566, 920, 1040), "6-Pin", h("− − RX TX + +"), "B", 1),
    ("GIMBAL", (690, 837, 920, 1040), "4-Pin", h("+ − RX TX"), "B", 1),
]


def main():
    fc = load_rgb(os.path.join(IMG, "fc_F4_nano_v2.png"))
    bec = bec_board()
    sh = Sheet()
    sh.header("AF-F4 nano v2 Pinout",
              "Each table lists the pins left → right (side connectors: top → bottom) as you see them in the photo.",
              [("1", RED), "= pin 1, the red 1 in its table (FC board)", "+ = power    − = GND    blue = signal"])
    sh.caption("FC board — top")
    sh.board(region(fc, 0, fc.shape[1], 0, fc.shape[0]),
             [{"box": b, "name": n, "sub": s, "table": t, "p1": p1, "side": sd} for n, b, s, t, p1, sd in FC], img_w=820)
    sh.caption("BEC board — connector names as printed by the maker (no pin numbers)")
    sh.board(bec, [{"box": (b[0] - OX, b[1] - OX, b[2] - OY, b[3] - OY), "name": n, "sub": s or None, "table": t, "p1": None,
                    "side": sd, "row": rw} for n, b, s, t, sd, rw in BEC], img_w=780)
    sh.note(["FC board: MCU STM32F405 · IMU ICM-42688-P · BOOT button and USB Type-C on the left."])
    out = os.path.join(OUT, "fc_F4_nano_v2_pinout.png")
    rep = sh.save(out)
    print(out, rep["shown_px"], "min font on screen %.1f px (%r)" % (rep["min_font_screen_px"], rep["smallest_text"]))


if __name__ == "__main__":
    main()
