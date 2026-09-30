# -*- coding: utf-8 -*-
"""GNSS 핀아웃 그림 — AP-RTK X20D · dual · G5H · AP-M10 — 면마다 '지도 + 카드'(글자 = 화면 13 px 이상, pinout_style.Sheet).

규칙(사용자 2026-09-29 "커넥터 모양대로 핀아웃을 설명해야 헷갈리지 않을거 아냐" · 2026-09-30 "이 글자가 보이니???"):
  표 칸 = 그림 속 커넥터의 실제 핀 순서·방향(가로 커넥터 = 가로 표, 세로 = 세로 표), 1 번 끝 = 그림 위 빨간 ① + 표의 빨간 1 번 칸.
1 번 위치 근거 = PCB 패드 좌표(kicad-cli pcb export ipcd356) + 그림 속 포트 배치(2026-09-29, 반증 워커와 대조 — web/parts-catalog/tools/pinout/cross_verify/):
  X20D R3 · G5H: U17 PPS · U14 UART · U15 DEBUG 가 한 옆면에 y 순서로, 각 커넥터 1 번이 y 가 가장 작은 끝.
                 그 면을 마주 보면 왼 → 오 = PPS · UART · DEBUG → **1 번 = 왼쪽**. U16 CAN 1 번 x 112.5 > 4 번 108.8,
                 USB(x 116~125)가 CAN 보다 x 가 크고 마주 본 그림에서 왼쪽 → **CAN 1 번 = 왼쪽**.
                 정면 렌더에서도 JST-GH 잠금 창이 위 → 1 번 왼쪽(JST GH 도면 규칙)으로 맞다.
  dual(X-RTK2HP V6.0 PCB, gnss/AP-RTK_G5H/hardware/kicad/ap_rtk_dual_altium/rtk2hp.kicad_pcb): 같은 배치(U14 UART · U17 CAN).
                 앞면 USB 왼쪽 · CAN 오른쪽 → CAN 1 번 = 왼쪽, 왼쪽 옆면도(제조사 선화, 윗면도와 같은 세로축)에서 UART 1 번 = 위.
  번호별 신호 = 넷리스트(X20D R3 · G5H · rtk2hp) = 카탈로그 pinoutNotes(pin N → 1 순서로 적혀 있음).
  AP-M10 = 제조사 사진에 적힌 순서(SDA SCL TXD RXD 5V GND). 제조사 핀 번호 자료가 없어 번호·① 를 쓰지 않는다.
바탕:
  X20D = 블렌더 평행 투영 3 면(커넥터 정면) — gnss/AP-RTK_X20D/hardware/render/x20d_render_cfg.py <glb> out/pin cfg.json pinout
         → blender-3d 스킬 product_photo.py(HP). <렌더 폴더>/x20d_{gh,front,ant}_rgba.png + ../blender.log 의 RESULT(카메라 → mm 를 픽셀로)
  dual · G5H = 제품 렌더(앞면 USB·CAN) + 제조사 옆면도(UART — 이 면의 렌더가 없다, src/dual_lineart_vendor.png)
  M10 = 제조사 사진(src/m10_photo_vendor.png, 파란 주석 지움). src 는 git 의 원래 카탈로그 그림 — 출력 파일을 다시 읽지 않는다.
포트 이름 = 케이스 각인 그대로(PPS · UART · DEBUG · USB · CAN · ANT1 · ANT2). 앞에 원 숫자를 붙이지 않는다 — 빨간 ① = 1 번 핀 표시와 헷갈린다.
실행: python gnss_pinout.py [x20d dual g5h m10] [--out 폴더] [--x20d 렌더 폴더]   (기본 = public/images/products 의 원래 파일 이름)
"""
import json
import os
import sys

import cv2
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from pinout_style import BLUE, RED, Sheet, crop_px, load_rgb, region, word_cells  # noqa: E402

CAT = os.path.normpath(os.path.join(HERE, "..", ".."))
IMG = os.path.join(CAT, "public", "images", "products")
SRC = os.path.join(HERE, "src")
ARGS = sys.argv[1:]
X20D_RENDER = ARGS[ARGS.index("--x20d") + 1] if "--x20d" in ARGS else "D:/1_Work/remote-results/x20d-pin-views/pin"
COLORS = "red = power    black = GND    blue = signal"
LEG_P1 = [("A", BLUE), "= connector, its table below", ("1", RED), "= pin 1, the red 1 in its table", COLORS]
LEG_NO_P1 = [("A", BLUE), "= connector, its table below", COLORS]
GH4 = "4-Pin · JST-GH"
READS = "Each table reads left → right exactly as the picture next to it"


# ────────────── 바탕 그림 ──────────────
def lineart_side():
    """제조사 dual 그림(578 × 766)의 **왼쪽 옆면도**만(UART 가 보이는 면 — 이 면의 제품 렌더는 없다). 회색 표시(RGB 147·149·152)는 지운다.
    → (배열, 원본 좌표 → 배열 좌표 함수)"""
    a = load_rgb(os.path.join(SRC, "dual_lineart_vendor.png")).astype(int)
    grey = (np.abs(a - np.array([147, 149, 152])).sum(axis=2) < 40)
    a[grey] = 255
    blk = a[199:470, 160:171]                                        # 표시선의 번진 가장자리(밝은 회색)만 — 검은 선화는 둔다
    blk[blk.min(axis=2) > 120] = 255
    a = a[5:325, 100:216].astype(np.uint8)
    return np.asarray(Image.fromarray(a).resize((a.shape[1] * 3, a.shape[0] * 3), Image.LANCZOS)), \
        lambda b: ((b[0] - 100) * 3, (b[1] - 100) * 3, (b[2] - 5) * 3, (b[3] - 5) * 3)


def device(name):
    """카탈로그 제품 렌더(1500 × 1000, 투명 배경) — 제품 둘레만. 앞면에 USB · CAN 이 보인다."""
    return load_rgb(os.path.join(IMG, name))[60:910, 330:1160], lambda b: (b[0] - 330, b[1] - 330, b[2] - 60, b[3] - 60)


def photo_m10():
    """AP-M10 제조사 사진(804 × 594)에서 모듈 부분만 — 파란 주석(상자·화살표)을 주변 색으로 메운다."""
    a = load_rgb(os.path.join(SRC, "m10_photo_vendor.png"))
    a = a[70:462, 188:578].copy()
    r, g, b = [a[:, :, i].astype(int) for i in range(3)]
    mask = ((b > r + 50) & (b > g + 10) & (b > 120)).astype(np.uint8) * 255
    mask = cv2.dilate(mask, np.ones((3, 3), np.uint8), iterations=2)
    a = cv2.inpaint(a[:, :, ::-1].copy(), mask, 5, cv2.INPAINT_TELEA)[:, :, ::-1]
    return a, lambda b: (b[0] - 188, b[1] - 188, b[2] - 70, b[3] - 70)


def x20d_view(view):
    """X20D 평행 투영 렌더 한 면 → (배열, 케이스 좌표 mm 상자 (x0, x1, y0, y1, z0, z1) → 렌더 px 함수)."""
    log = open(os.path.join(X20D_RENDER, "..", "blender.log"), encoding="utf-8", errors="replace").read()
    c = json.loads(log[log.rindex("RESULT ") + 7:].splitlines()[0])["out"][view]["cam"]
    w, h = c["size"]
    s = max(w, h) / c["ortho_scale_mm"]

    def to_px(p):
        d = [p[i] - c["center_mm"][i] for i in range(3)]
        return w / 2 + s * sum(d[i] * c["right"][i] for i in range(3)), h / 2 - s * sum(d[i] * c["up"][i] for i in range(3))

    def box(b3):
        pts = [to_px((x, y, z)) for x in b3[:2] for y in b3[2:4] for z in b3[4:6]]
        return min(p[0] for p in pts), max(p[0] for p in pts), min(p[1] for p in pts), max(p[1] for p in pts)
    return load_rgb(os.path.join(X20D_RENDER, "x20d_%s_rgba.png" % view)), box


# ────────────── 제품별 면 ──────────────
# 면 = (제목, 바탕 함수, 지도 구역 px 또는 None(전체), 지도 최대 높이, 배지 자리, [커넥터 …])
# 커넥터 = (이름, 상자(바탕 함수가 받는 좌표), 부제, 표, 1 번 끝)
# 표 = ("h" 가로 왼 → 오 | "v" 세로 위 → 아래, 칸) | ("one", 글자, 색) · 1 번 끝 = "L" 왼 · "T" 위 · None(번호 없음)
# 배지 자리 = "inside" 상자 안 | "below" / "above" 상자 바로 아래 / 위(그 반대쪽에 포트 각인이 있을 때) | "left" 세로 커넥터 왼쪽 바깥
XS = -17.7                                                    # X20D PPS · UART · DEBUG 면(x) — 렌더 각인 RESULT at_mm
X20D = [
    ("PPS · UART · DEBUG side", lambda: x20d_view("gh"), (20, 2380, 40, 860), 900, "below", [
        ("PPS", (XS, XS, 8.0, 15.8, 0.5, 5.2), GH4, ("h", word_cells(["GND", "EVENT", "GND", "PPS"], [1, 2, 3, 4])), "L"),
        ("UART", (XS, XS, -1.9, 6.0, 0.5, 5.2), GH4, ("h", word_cells(["GND", "TX", "RX", "5V"], [1, 2, 3, 4])), "L"),
        ("DEBUG", (XS, XS, -14.35, -3.7, 0.5, 5.2), "6-Pin · JST-GH",
         ("h", word_cells(["5V", "SWDIO", "SWCLK", "RX", "TX", "GND"], [1, 2, 3, 4, 5, 6])), "L")]),
    ("USB · CAN end", lambda: x20d_view("front"), (0, 1800, 40, 860), 560, "below", [
        ("USB", (-9.4, 0.4, -24, -24, 0.3, 3.9), "Type-C", ("one", "USB 2.0", BLUE), None),
        ("CAN", (1.9, 9.8, -24, -24, 0.5, 5.2), GH4, ("h", word_cells(["GND", "CAN_L", "CAN_H", "5V"], [1, 2, 3, 4])), "L")]),
    ("Antenna end", lambda: x20d_view("ant"), (0, 1800, 40, 900), 560, "below", [
        ("ANT2", (6.5, 11.5, 25, 25, -5.75, -0.8), "MMCX · slave antenna", ("one", "RF", BLUE), None),
        ("ANT1", (-11.5, -6.5, 25, 25, -5.75, -0.8), "MMCX · master antenna", ("one", "RF", BLUE), None)]),
]


def dual_faces(dev, uart_sub, usb_sub):
    return [
        ("USB · CAN end — product render", lambda: device(dev), None, 700, "above", [
            ("USB", (478, 606, 790, 842), usb_sub, ("one", "USB 2.0", BLUE), None),
            ("CAN", (612, 742, 800, 846), GH4, ("h", word_cells(["GND", "CAN_L", "CAN_H", "5V"], [1, 2, 3, 4])), "L")]),
        ("UART side — maker's drawing (no render of this side)", lineart_side, None, 460, "left", [
            ("UART", (151, 184, 139, 200), uart_sub, ("v", word_cells(["GND", "TX", "RX", "5V"], [1, 2, 3, 4])), "T")]),
    ]


PRODUCTS = {
    "x20d": {"out": "gnss_AP-RTK-X20D_pinout.png", "title": "AP-RTK X20D Pinout", "legend": LEG_P1,
             "lead": "Each face seen straight on. %s; number = pin on the R3 board." % READS, "faces": X20D},
    "dual": {"out": "gnss_AP-RTK-dual_pinout.png", "title": "AP-RTK dual Pinout", "legend": LEG_P1,
             "lead": "%s (UART: top → bottom); number = pin on the X-RTK2HP V6.0 board." % READS,
             "faces": dual_faces("gnss_AP-RTK-dual_device.png", GH4, "Type-C")},
    "g5h": {"out": "gnss_AP-RTK-G5H_pinout.png", "title": "AP-RTK G5H Pinout", "legend": LEG_P1,
            "lead": "%s (UART: top → bottom); number = pin on the G5H board." % READS,
            "faces": dual_faces("gnss_AP-RTK-G5H_device.png", "4-Pin · JST-GH · receiver COM2", "Type-C · MCU bootloader / DFU")},
    "m10": {"out": "gnss_X_G10C_pinout.png", "title": "AP-M10 Pinout", "legend": LEG_NO_P1,
            "lead": "Cells left → right as printed on the maker's photo. The photo names the signals but gives no pin numbers.",
            "faces": [("Module — maker's photo", photo_m10, None, 600, "inside", [
                ("GPS", (328, 452, 342, 455), "6-Pin · JST-GH · UART + I2C", ("h", word_cells(["SDA", "SCL", "TXD", "RXD", "5V", "GND"])), None),
                ("BMM350", (268, 302, 344, 380), "Compass on the module's I2C bus", ("one", "I2C", BLUE), None)])]},
}


def render(key, out_dir):
    cfg = PRODUCTS[key]
    sh = Sheet()
    sh.header(cfg["title"], cfg["lead"], cfg["legend"])
    n = 0
    for title, source, reg, max_h, pos, conns in cfg["faces"]:
        img, conv = source()
        reg = reg or (0, img.shape[1], 0, img.shape[0])
        boxes = [conv(c[1]) for c in conns]
        if len(cfg["faces"]) > 1:
            sh.caption(title)
        sh.map(region(img, *reg), [{"box": (b[0] - reg[0], b[1] - reg[0], b[2] - reg[2], b[3] - reg[2]), "letter": chr(65 + n + i),
                                     "p1": c[4], "pos": pos} for i, (c, b) in enumerate(zip(conns, boxes))], max_h=max_h)
        for (name, _, sub, table, p1), b in zip(conns, boxes):
            pad = min(120, max(40, 0.5 * max(b[1] - b[0], b[3] - b[2])))
            crop, cb = crop_px(img, b, pad * (1.8 if pos == "left" else 1.0), pad * (1.8 if pos == "above" else 1.3),
                               pad * (1.8 if pos == "below" else 1.0))
            sh.card(crop, cb, chr(65 + n), p1, name, sub, table, pos=pos)
            n += 1
    out = os.path.join(out_dir, cfg["out"])
    rep = sh.save(out)
    print(out, rep["shown_px"], "min font on screen %.1f px (%r)" % (rep["min_font_screen_px"], rep["smallest_text"]))


if __name__ == "__main__":
    opts = {"--out", "--x20d"}
    keys = [a for i, a in enumerate(ARGS) if not a.startswith("--") and (i == 0 or ARGS[i - 1] not in opts)]
    out_dir = ARGS[ARGS.index("--out") + 1] if "--out" in ARGS else IMG
    for k in (keys or list(PRODUCTS)):
        render(k, out_dir)
