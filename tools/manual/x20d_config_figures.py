# -*- coding: utf-8 -*-
"""AP-RTK X20D Configuration 그림 1 — AP-RTK dual 그림(gnss_AP-RTK-dual_antenna-setup.png)에서 X20D 에 맞게 바꿀 곳만 바꾼다.

X20D 펌웨어 v1.0.6 부터 dual 과 같은 방식(RelPosHeading → FC 가 GPS1_MB_OFS 로 헤딩 계산)이라
안테나 배치 · 이름 · 파라미터가 dual 과 같다: Antenna 1 = MASTER(앞), Antenna 2 = SLAVE(뒤) — 원본 글자 그대로.
바뀌는 것 = 본체 쪽 연결 자리뿐: X20D 는 ANT1 포트가 dual 의 ANT2 자리(위에서 볼 때 왼쪽, 그림에서 아래 입구)에 있다.
  앞 안테나 선 → 아래 입구(ANT1), 뒤 안테나 선 → 그림 위쪽으로 돌아 위 입구(ANT2) — 두 선이 겹치지 않음
  "AP–RTK Dual" → "AP–RTK X20D"(AP–RTK 는 원본 글자) · 본체 로고 = x20d_logo.py 의 X20D 로고(원본처럼 90° 돌림)
  본체로 들어가는 선 끝에 포트 이름(ANT2 · ANT1) — X20D 케이스 각인과 같은 이름
그림 2(오프셋 부호)는 dual 그림을 그대로 쓴다(파라미터가 같으므로).
새 글자 = 한컴 고딕(원본 그림 글꼴과 대조 일치). 원본 글자와 높이 · 폭 비율을 맞춰 그린다.
실행: python tools/manual/x20d_config_figures.py → public/images/products/gnss_AP-RTK-X20D_antenna-setup.png
"""
import os
import runpy
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
IMG = ROOT / "public" / "images" / "products"
SRC, OUT = IMG / "gnss_AP-RTK-dual_antenna-setup.png", IMG / "gnss_AP-RTK-X20D_antenna-setup.png"
LOGO_PY = ROOT.parents[1] / "gnss" / "AP-RTK_X20D" / "hardware" / "render" / "x20d_logo.py"
FONT_B = r"C:\Windows\Fonts\Hancom Gothic Bold.ttf"

# 원본 1400 × 693 실측(px)
NAME = (421, 322, 556, 341)           # "AP–RTK Dual"
AP_RTK_END = 505                      # "AP–RTK" 끝(글자 사이 빈 칸 505~512)
UNIT_X = 489.5                        # 본체 가운데
LOGO_BOX = (448, 424, 474, 473)       # 본체 로고 자리(가운데 평평한 칸)
CABLE_Y = (401, 494)                  # 본체로 들어가는 선: 위 입구 · 아래 입구
CABLE_END_X = 377                     # 화살촉 앞
FRONT_X, REAR_X = 296, 339            # 원본: 앞 안테나 선 · 뒤 안테나 선이 올라오는 세로줄
BOTTOM_Y = 646                        # 원본: 두 선의 아래 가로줄
UP_X, OVER_Y, DOWN_X = 1100, 300, 330 # 새 뒤 안테나 선: FC 와 뒤 안테나 사이로 올라감 · 제품 이름 위 가로줄 · 본체 왼쪽으로 내려옴
R_CORNER = 16                         # 모서리 반지름(원본 실측)
JOIN_X = 357                          # 이 오른쪽 가로선 · 화살촉은 원본 그대로 이어 씀
LINE_W = 1.5                          # 선 굵기(원본 실측)


def fill(a, box, colour):
    x0, y0, x1, y1 = box
    a[y0:y1, x0:x1] = colour


def paste(a, piece, x, y):
    h, w = piece.shape[:2]
    a[y:y + h, x:x + w] = piece


def text_ink(txt, font, colour, bg):
    """글자를 배경색 위에 그려 잉크 bbox 로 잘라낸 조각."""
    l, t, r, b = font.getbbox(txt)
    c = Image.new("RGB", (r - l + 8, b - t + 8), tuple(int(v) for v in bg))
    ImageDraw.Draw(c).text((4 - l, 4 - t), txt, font=font, fill=tuple(int(v) for v in colour))
    arr = np.asarray(c).copy()
    ink = np.abs(arr.astype(int) - np.array(bg, int)).sum(axis=2) > 30
    ys, xs = np.nonzero(ink)
    return arr[ys.min():ys.max() + 1, xs.min():xs.max() + 1]


def x20d_logo_mask():
    """x20d_logo.py(정본)의 X20D 로고 판(1 = 잉크, 가로 방향)."""
    os.environ.setdefault("XL_PDF", str(ROOT / "public" / "manuals" / "gnss_AP-RTK-dual_manual_ko.pdf"))
    return runpy.run_path(str(LOGO_PY))["logo"].astype(np.float32)


def draw_lines(a, box, shapes, colour, ss=8):
    """box 안에 선 · 호를 ss 배로 그려 줄여 얹는다(안티앨리어싱). shapes = [("line", x0, y0, x1, y1) | ("arc", cx, cy, r, a0, a1)]."""
    x0, y0, x1, y1 = box
    m = Image.new("L", ((x1 - x0) * ss, (y1 - y0) * ss), 0)
    d = ImageDraw.Draw(m)
    w = max(1, int(round(LINE_W * ss)))
    for s in shapes:
        if s[0] == "line":
            _, ax, ay, bx, by = s
            d.line([((ax - x0) * ss, (ay - y0) * ss), ((bx - x0) * ss, (by - y0) * ss)], fill=255, width=w)
        else:
            _, cx, cy, r, a0, a1 = s
            d.arc([((cx - r - x0) * ss, (cy - r - y0) * ss), ((cx + r - x0) * ss, (cy + r - y0) * ss)], a0, a1, fill=255, width=w)
    al = np.asarray(m.resize((x1 - x0, y1 - y0), Image.LANCZOS)).astype(np.float32)[:, :, None] / 255
    reg = a[y0:y1, x0:x1].astype(np.float32)
    a[y0:y1, x0:x1] = (reg * (1 - al) + np.array(colour, np.float32) * al).astype(np.uint8)


def main():
    a = np.asarray(Image.open(SRC).convert("RGB")).copy()
    bg = np.median(a[5:40, 5:40].reshape(-1, 3), axis=0).astype(np.uint8)
    word = a[240:259, 134:235].reshape(-1, 3)                     # "Antenna 1" — 원본 글자색
    colour = word[word.sum(axis=1).argmin()]
    cable = a[440:460, FRONT_X - 2:FRONT_X + 3].reshape(-1, 3)   # 원본 선 색(세로선 가운데)
    line_colour = cable[cable.sum(axis=1).argmin()]

    # 1) 제품 이름: "AP–RTK" 원본 + "X20D"(원본 "Dual" 과 같은 높이 · 폭 비율)
    ap = a[NAME[1]:NAME[3], NAME[0]:AP_RTK_END].copy()
    dual = a[NAME[1]:NAME[3], AP_RTK_END + 7:NAME[2]]
    size = 21.5
    while text_ink("Dual", ImageFont.truetype(FONT_B, size), colour, bg).shape[0] < dual.shape[0]:
        size += 0.25
    bold = ImageFont.truetype(FONT_B, size)
    squeeze = dual.shape[1] / text_ink("Dual", bold, colour, bg).shape[1]
    x20 = text_ink("X20D", bold, colour, bg)
    x20 = np.asarray(Image.fromarray(x20).resize((max(1, int(round(x20.shape[1] * squeeze))), x20.shape[0]), Image.LANCZOS))
    space = 7
    fill(a, (NAME[0] - 2, NAME[1] - 2, NAME[2] + 30, NAME[3] + 2), bg)
    total = ap.shape[1] + space + x20.shape[1]
    x0 = int(round(UNIT_X - total / 2))
    paste(a, ap, x0, NAME[1])
    paste(a, x20, x0 + ap.shape[1] + space, NAME[3] - x20.shape[0])

    # 2) 본체 로고: 옛 로고 지우고 X20D 로고(90° 왼쪽으로 돌림 = 원본과 같은 방향)
    x0, y0, x1, y1 = LOGO_BOX
    ring = np.concatenate([a[y0 - 1, x0:x1], a[y1, x0:x1]])
    panel = np.median(ring[ring.sum(axis=1) > 600], axis=0).astype(np.uint8)
    fill(a, LOGO_BOX, panel)
    m = np.rot90(x20d_logo_mask(), 1)
    tgt_h = 43
    tgt_w = max(1, int(round(m.shape[1] * tgt_h / m.shape[0])))
    alpha = cv2.resize(m, (tgt_w, tgt_h), interpolation=cv2.INTER_AREA)[:, :, None]
    ty, tx = int(round((y0 + y1) / 2 - tgt_h / 2)), int(round((x0 + x1) / 2 - tgt_w / 2))
    region = a[ty:ty + tgt_h, tx:tx + tgt_w].astype(np.float32)
    a[ty:ty + tgt_h, tx:tx + tgt_w] = (region * (1 - alpha) + np.array(colour, np.float32) * alpha).astype(np.uint8)

    # 3) 연결 자리 바꿈(선은 서로 겹치지 않게):
    #    앞 안테나 선 → 아래 입구(ANT1) · 뒤 안테나 선 → 그림 위쪽으로 돌아 위 입구(ANT2)
    top, low = CABLE_Y
    rc = R_CORNER
    fill(a, (FRONT_X - 4, top - 4, JOIN_X, top + 4), bg)                         # 옛 앞 선: 위 가로선 + 모서리
    fill(a, (FRONT_X - 4, top - 4, FRONT_X + rc + 2, low + rc + 2), bg)          # 옛 앞 선: 세로선 위쪽
    fill(a, (REAR_X - 5, low - 4, JOIN_X, BOTTOM_Y + 5), bg)                     # 옛 뒤 선: 아래 입구 모서리 · 세로선
    fill(a, (REAR_X - 5, BOTTOM_Y - 4, UP_X + rc, BOTTOM_Y + 5), bg)             # 옛 뒤 선: 아래 가로선
    shapes = [
        # 앞 안테나 선: 아래 입구에서 오른쪽으로 꺾음
        ("line", FRONT_X, low + rc + 2, FRONT_X, low + rc), ("arc", FRONT_X + rc, low + rc, rc, 180, 270),
        ("line", FRONT_X + rc, low, JOIN_X + 1, low),
        # 뒤 안테나 선: 아래 가로선 → UP_X 에서 위로 → 그림 위쪽(OVER_Y) 가로 → DOWN_X 에서 내려와 위 입구로
        ("arc", UP_X + rc, BOTTOM_Y - rc, rc, 90, 180), ("line", UP_X, BOTTOM_Y - rc, UP_X, OVER_Y + rc),
        ("arc", UP_X - rc, OVER_Y + rc, rc, 270, 360), ("line", UP_X - rc, OVER_Y, DOWN_X + rc, OVER_Y),
        ("arc", DOWN_X + rc, OVER_Y + rc, rc, 180, 270), ("line", DOWN_X, OVER_Y + rc, DOWN_X, top - rc),
        ("arc", DOWN_X + rc, top - rc, rc, 90, 180), ("line", DOWN_X + rc, top, JOIN_X + 1, top),
    ]
    draw_lines(a, (FRONT_X - 6, OVER_Y - 6, UP_X + rc + 4, BOTTOM_Y + 6), shapes, line_colour)

    # 4) 본체로 들어가는 선 끝의 포트 이름(케이스 각인과 같은 이름)
    small = ImageFont.truetype(FONT_B, 13)
    for txt, y in (("ANT2", top), ("ANT1", low)):
        p = text_ink(txt, small, colour, bg)
        paste(a, p, CABLE_END_X - p.shape[1], y - 5 - p.shape[0])

    Image.fromarray(a).save(OUT, optimize=True)
    print(OUT, a.shape[1], "x", a.shape[0])


if __name__ == "__main__":
    main()
