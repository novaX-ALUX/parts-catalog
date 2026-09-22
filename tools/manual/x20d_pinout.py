# -*- coding: utf-8 -*-
"""AP-RTK X20D 핀아웃 그림 — AP-RTK dual 핀아웃(사용자 매뉴얼 5쪽 벡터 선화)을 그대로 다시 그려 X20D 포트 구성으로 바꾼다.

같은 것(dual 원본 도형 그대로): 옆면 · 윗면 · 앞면(USB · CAN) 선화, 커넥터 그림 모양, 회색 점 · 지시선, 글꼴(Pretendard)
바뀌는 것:
  옆면 커넥터 1 → 3개(위에서 볼 때 왼쪽 면): ④ PPS · ① UART · ③ DEBUG(6핀) — 위치 = 케이스 좌표(x20d_render_cfg.py), 크기 = GH 하우징
  윗면 로고 = x20d_logo.py 의 AP RTK X20D · 안테나 면(위쪽 끝) ANT1(왼쪽) · ANT2(오른쪽) 표시
  커넥터 그림 4개: 핀 이름은 dual 과 같은 순서(가장 큰 번호 → 1번, 왼쪽 → 오른쪽). R3 PCB 원본 패드 넷 기준
    ① UART 5V RX TX GND · ② CAN 5V CAN_H CAN_L GND · ③ DEBUG GND TX RX SWCLK SWDIO 5V · ④ PPS PPS GND EVENT GND
실행: python tools/manual/x20d_pinout.py → public/images/products/gnss_AP-RTK-X20D_pinout.png (dual 과 같은 297 dpi, 투명 바탕)
"""
import os
import runpy
from pathlib import Path

import cv2
import fitz
import numpy as np

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
DUAL = ROOT / "public" / "manuals" / "gnss_AP-RTK-dual_manual_ko.pdf"
OUT = ROOT / "public" / "images" / "products" / "gnss_AP-RTK-X20D_pinout.png"
LOGO_PY = ROOT.parents[1] / "gnss" / "AP-RTK_X20D" / "hardware" / "render" / "x20d_logo.py"
FONTS = HERE / ".fonts"

# dual 매뉴얼 5쪽(0 부터 5) 실측, pt
SIDE = fitz.Rect(49, 49, 79, 134)             # 옆면
SIDE_SOCK = fitz.Rect(61, 83, 72, 102)        # 옆면 커넥터(UART) + 회색 점
TOP = fitz.Rect(85, 49, 150, 134)             # 윗면
LOGO = fitz.Rect(108.5, 75.9, 126.4, 83.2)    # 윗면 로고(x20d_logo.py CLIP 과 같음)
END = fitz.Rect(85, 139, 150, 170)            # 앞면(USB · CAN)
CAN_DOT = (127.07, 152.59)                    # 앞면 CAN 회색 점 가운데
GRAY = (0.5773, 0.5855, 0.5958)
INK = (0.0042, 0.0056, 0.0048)
SHIFT = 100.0                                 # 왼쪽에 커넥터 그림 두 개를 더 놓을 자리

# 케이스(X20D_CASE_V1, case_fit) y -23.99 ~ 25.09 mm ↔ 옆면 도형 세로 50.91 ~ 132.30 pt
Y_TOP_MM, Y_BOT_MM, Y_TOP_PT, Y_BOT_PT = 25.09, -23.99, 50.91, 132.30
MM = (Y_BOT_PT - Y_TOP_PT) / (Y_TOP_MM - Y_BOT_MM)
TOP_CX = 117.33                                # 윗면 가운데 x(케이스 x = 0)
SOCK_X0, SOCK_Y0, SOCK_Y1 = 61.8, 84.4, 100.7  # dual 옆면 커넥터 그림(4핀): 왼쪽 끝 x, 위 · 아래 y
DOT_X, DOT_R = 65.85, 3.76

# 커넥터 그림(dual ① UART 4핀 실측) — 가로 요소는 핀 수만큼 늘리고, 오른쪽 요소는 옮긴다
PITCH = (73.41 - 50.38) / 3
SX0, SX1, SY0 = 36.49, 87.24, 192.61
PIN_X = [50.38, 58.12, 65.77, 73.41]


def pt_y(y_mm):
    return Y_TOP_PT + (Y_TOP_MM - y_mm) * MM


def replay(page, drawings, keep, fx):
    """dual 도형을 그대로 다시 그린다(fx = 좌표 변환)."""
    for d in drawings:
        if not keep(d):
            continue
        sh = page.new_shape()
        for it in d["items"]:
            op = it[0]
            if op == "l":
                sh.draw_line(fx(it[1]), fx(it[2]))
            elif op == "c":
                sh.draw_bezier(fx(it[1]), fx(it[2]), fx(it[3]), fx(it[4]))
            elif op == "re":
                r = it[1]
                sh.draw_rect(fitz.Rect(fx(r.tl), fx(r.br)))
            elif op == "qu":
                q = it[1]
                sh.draw_quad(fitz.Quad(fx(q.ul), fx(q.ur), fx(q.ll), fx(q.lr)))
        cap = d.get("lineCap") or (0,)
        sh.finish(color=d.get("color"), fill=d.get("fill"), width=d.get("width") or 0,
                  closePath=d.get("closePath", False), even_odd=d.get("even_odd", False),
                  lineCap=cap[0] if isinstance(cap, (tuple, list)) else cap,
                  lineJoin=int(d.get("lineJoin") or 0), dashes=d.get("dashes"))
        sh.commit()


def shift(dx, dy=0.0):
    return lambda p: fitz.Point(p.x + dx, p.y + dy)


def socket(page, cx, n, pins, title, fonts):
    """dual 커넥터 그림(4핀)을 n 핀으로: 가운데 cx, 핀 이름 = pins(왼쪽 → 오른쪽)."""
    extra = (n - 4) * PITCH
    x0 = cx - (SX1 - SX0 + extra) / 2 - SX0          # dual 좌표 → 새 좌표 x 이동량
    R = lambda x: x + extra if x > (SX0 + SX1) / 2 else x   # 오른쪽 요소는 옮김
    sh = page.new_shape()
    lines = [  # (x1, y1, x2, y2) dual 실측, 가로선이 가운데를 가로지르면 끝점만 R()
        (36.50, 192.61, 87.24, 192.61), (36.49, 192.61, 36.49, 206.76), (87.24, 192.61, 87.24, 206.76),
        (48.18, 195.07, 75.56, 195.07), (48.18, 195.07, 48.18, 203.69), (75.56, 195.07, 75.56, 203.69), (48.18, 203.69, 75.56, 203.69),
        (54.33, 201.22, 69.40, 201.22), (54.33, 201.22, 54.33, 203.69), (69.41, 201.22, 69.41, 203.68),
        (42.65, 202.45, 42.65, 215.07), (42.65, 202.45, 45.72, 202.45), (45.72, 202.45, 45.72, 205.53), (45.72, 205.53, 78.02, 205.53),
        (78.02, 202.45, 78.02, 205.53), (78.02, 202.45, 81.09, 202.45), (81.09, 202.45, 81.09, 215.07), (42.65, 215.07, 81.09, 215.07),
        (38.34, 206.76, 38.34, 219.37), (85.40, 206.76, 85.40, 219.37), (85.40, 206.76, 87.25, 206.76), (36.49, 206.76, 38.34, 206.76),
        (36.49, 206.76, 36.49, 218.76), (87.24, 206.76, 87.24, 218.76), (36.49, 215.07, 38.34, 215.07), (85.40, 215.07, 87.24, 215.07),
        (85.40, 218.76, 87.25, 218.76), (36.49, 218.76, 38.34, 218.76), (39.57, 218.76, 84.17, 218.76),
        (39.57, 218.76, 39.57, 219.37), (84.17, 218.76, 84.17, 219.37), (38.34, 219.37, 39.57, 219.37), (84.17, 219.37, 85.40, 219.37),
    ]
    for x1, y1, x2, y2 in lines:
        a, b = (x1, R(x2)) if y1 == y2 and x1 < (SX0 + SX1) / 2 < x2 else (R(x1), R(x2))
        sh.draw_line(fitz.Point(a + x0, y1), fitz.Point(b + x0, y2))
    sh.finish(color=GRAY, width=0.5)
    px = [PIN_X[0] + i * PITCH for i in range(n)]
    for x in px:   # 핀 아래 작은 홈
        sh.draw_line(fitz.Point(x - 0.66 + x0, 218.76), fitz.Point(x - 0.66 + x0, 219.37))
        sh.draw_line(fitz.Point(x + 0.57 + x0, 218.76), fitz.Point(x + 0.57 + x0, 219.37))
        sh.draw_line(fitz.Point(x - 0.66 + x0, 219.37), fitz.Point(x + 0.57 + x0, 219.37))
    sh.finish(color=GRAY, width=0.5)
    for x in px:   # 핀(채움)
        for rx0, ry0, rx1, ry1 in ((-1.46, 205.53, 1.46, 207.15), (-0.87, 205.53, 0.87, 208.25), (-0.84, 212.32, 0.84, 214.95)):
            sh.draw_rect(fitz.Rect(x + rx0 + x0, ry0, x + rx1 + x0, ry1))
    sh.finish(color=None, fill=GRAY, width=0)
    for x in px:   # 핀 지시선
        sh.draw_line(fitz.Point(x + x0, 214.95), fitz.Point(x + x0, 228.43))
    sh.finish(color=GRAY, width=0.3)
    sh.commit()
    size = 7.84
    for x, name in zip(px, pins):   # 핀 이름: 90° 돌림(아래 → 위), 윗끝을 230.6 에 맞춤
        w = fonts["light"].text_length(name, fontsize=size)
        page.insert_text(fitz.Point(x + x0 + size * 0.36, 230.6 + w), name, fontsize=size,
                         fontname="PL", fontfile=str(FONTS / "Pretendard-Light.ttf"), rotate=90, color=INK)
    w = fonts["medium"].text_length(title, fontsize=size)
    page.insert_text(fitz.Point(cx - w / 2, 188.2), title, fontsize=size,
                     fontname="PM", fontfile=str(FONTS / "Pretendard-Medium.ttf"), color=INK)


def x20d_logo_polys():
    """x20d_logo.py(정본) 로고 판 → 윗면 로고 자리 좌표의 다각형(바깥 · 구멍)."""
    os.environ.setdefault("XL_PDF", str(DUAL))
    g = runpy.run_path(str(LOGO_PY))
    logo, clip, z = g["logo"].astype(np.uint8), g["CLIP"], g["Z"]
    cnts, hier = cv2.findContours(logo, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_SIMPLE)
    to_pt = lambda c: [fitz.Point(clip.x0 + SHIFT + px / z, clip.y0 + py / z) for px, py in c.reshape(-1, 2)]
    return [to_pt(cv2.approxPolyDP(c, 0.8, True)) for c in cnts if cv2.contourArea(c) >= 20]


def main():
    src = fitz.open(DUAL)[5]
    dr = src.get_drawings()
    out = fitz.open()
    page = out.new_page(width=270, height=256)
    fonts = {"light": fitz.Font(fontfile=str(FONTS / "Pretendard-Light.ttf")),
             "medium": fitz.Font(fontfile=str(FONTS / "Pretendard-Medium.ttf"))}
    inside = lambda R: (lambda d: R.contains(d["rect"]))

    # 1) 옆면(커넥터 빼고) · 윗면(로고 빼고) · 앞면(CAN 점 포함) — dual 도형 그대로
    replay(page, dr, lambda d: SIDE.contains(d["rect"]) and not SIDE_SOCK.contains(d["rect"]), shift(SHIFT))
    replay(page, dr, lambda d: TOP.contains(d["rect"]) and not LOGO.contains(d["rect"]), shift(SHIFT))
    replay(page, dr, inside(END), shift(SHIFT))

    # 2) 옆면 커넥터 3개: dual 커넥터 그림을 GH 하우징 크기로(왼쪽 끝은 벽 선에 붙임)
    sock = [d for d in dr if SIDE_SOCK.contains(d["rect"]) and not d.get("fill")]
    h4 = SOCK_Y1 - SOCK_Y0
    ports = []   # (이름, 가운데 y pt, 핀 수) — 케이스 y(mm): x20d_render_cfg.py
    for name, y_mm, n in (("PPS", 11.91, 4), ("UART", 2.04, 4), ("DEBUG", -9.03, 6)):
        body_mm = (n - 1) * 1.25 + 3.2                       # GH 핀 간격 1.25 mm + 양끝 하우징
        sy = body_mm * MM / h4
        sx = 0.75
        cy = pt_y(y_mm)
        fx = (lambda sx, sy, cy: lambda p: fitz.Point(SOCK_X0 + (p.x - SOCK_X0) * sx + SHIFT,
                                                      cy + (p.y - (SOCK_Y0 + SOCK_Y1) / 2) * sy))(sx, sy, cy)
        replay(page, sock, lambda d: True, fx)
        ports.append((name, cy))
    sh = page.new_shape()
    for _, cy in ports:
        sh.draw_circle(fitz.Point(DOT_X + SHIFT, cy), DOT_R)
    sh.finish(color=None, fill=GRAY, width=0)
    sh.commit()

    # 3) 윗면 로고 = AP RTK X20D(x20d_logo.py), 안테나 면 ANT1 · ANT2
    sh = page.new_shape()
    for poly in x20d_logo_polys():
        sh.draw_polyline(poly + [poly[0]])
    sh.finish(color=None, fill=INK, width=0, even_odd=True, closePath=True)
    sh.commit()
    for name, x_mm in (("ANT1", -9.02), ("ANT2", 9.02)):
        x = TOP_CX + x_mm * MM + SHIFT
        sh = page.new_shape()
        sh.draw_line(fitz.Point(x, 44.6), fitz.Point(x, Y_TOP_PT))
        sh.finish(color=GRAY, width=0.5)
        sh.draw_circle(fitz.Point(x, Y_TOP_PT), 1.6)
        sh.finish(color=None, fill=GRAY, width=0)
        sh.commit()
        w = fonts["medium"].text_length(name, fontsize=7.84)
        page.insert_text(fitz.Point(x - w / 2, 42.4), name, fontsize=7.84,
                         fontname="PM", fontfile=str(FONTS / "Pretendard-Medium.ttf"), color=INK)

    # 4) 커넥터 그림 4개 + 지시선(겹치지 않게): DEBUG 는 곧장 아래, UART · PPS 는 왼쪽으로 꺾어 아래, CAN 은 앞면 점에서 아래
    gap = 7.0
    w4, w6 = SX1 - SX0, SX1 - SX0 + 2 * PITCH
    x_debug = DOT_X + SHIFT
    x_uart = x_debug - w6 / 2 - gap - w4 / 2
    x_pps = x_uart - w4 - gap
    x_can = CAN_DOT[0] + SHIFT
    y_leader = 177.8
    sh = page.new_shape()
    (_, y_pps), (_, y_uart), (_, y_dbg) = ports
    sh.draw_polyline([fitz.Point(DOT_X + SHIFT, y_pps), fitz.Point(x_pps, y_pps), fitz.Point(x_pps, y_leader)])
    sh.draw_polyline([fitz.Point(DOT_X + SHIFT, y_uart), fitz.Point(x_uart, y_uart), fitz.Point(x_uart, y_leader)])
    sh.draw_line(fitz.Point(x_debug, y_dbg), fitz.Point(x_debug, y_leader))
    sh.draw_line(fitz.Point(x_can, CAN_DOT[1]), fitz.Point(x_can, y_leader))
    sh.finish(color=GRAY, width=0.5, closePath=False)
    sh.commit()
    socket(page, x_uart, 4, ["5V", "RX", "TX", "GND"], "➀ UART", fonts)
    socket(page, x_can, 4, ["5V", "CAN_H", "CAN_L", "GND"], "➁ CAN", fonts)
    socket(page, x_debug, 6, ["GND", "TX", "RX", "SWCLK", "SWDIO", "5V"], "➂ DEBUG", fonts)
    socket(page, x_pps, 4, ["PPS", "GND", "EVENT", "GND"], "➃ PPS", fonts)

    # 5) 그림(dual 과 같은 297 dpi, 투명 바탕) — 잉크 둘레 + 여백으로 자름
    k = 297 / 72
    pix = page.get_pixmap(matrix=fitz.Matrix(k, k), alpha=True)
    a = np.frombuffer(pix.samples, np.uint8).reshape(pix.height, pix.width, 4)
    ys, xs = np.nonzero(a[:, :, 3] > 0)
    m = 12
    crop = a[max(ys.min() - m, 0):ys.max() + m, max(xs.min() - m, 0):xs.max() + m]
    cv2.imwrite(str(OUT), cv2.cvtColor(crop, cv2.COLOR_RGBA2BGRA))
    out.save(str(HERE / ".build" / "x20d_pinout.pdf"))
    print(OUT, crop.shape[1], "x", crop.shape[0])


if __name__ == "__main__":
    main()
