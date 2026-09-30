# -*- coding: utf-8 -*-
"""GNSS 핀아웃 그림 — AP-RTK X20D · dual · G5H · AP-M10 — 제품당 한 장, 원래 배치(제품 그림 + 아래 표 + 파란 점선) · 표 글자 = 화면 13 px 이상.

규칙(사용자 2026-09-29 "커넥터 모양대로 핀아웃을 설명해야 헷갈리지 않을거 아냐" · 2026-09-30 "제품으로 해서 한페이지로 하고 원래 레이아웃에
포트설명 글자만 키우면되지"): 표 칸 = 그림 속 커넥터의 실제 핀 순서·방향(가로 커넥터 = 가로 표, 세로 = 세로 표), 1 번 끝 = 그림 위 빨간 ① + 표의 빨간 1 번 칸.
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
from pinout_style import BLUE, RED, Sheet, hstack, load_rgb, region, word_cells  # noqa: E402

CAT = os.path.normpath(os.path.join(HERE, "..", ".."))
IMG = os.path.join(CAT, "public", "images", "products")
SRC = os.path.join(HERE, "src")
ARGS = sys.argv[1:]
X20D_RENDER = ARGS[ARGS.index("--x20d") + 1] if "--x20d" in ARGS else "D:/1_Work/remote-results/x20d-pin-views/pin"
COLORS = "red = power    black = GND    blue = signal"
LEG_P1 = [("1", RED), "= pin 1, the red 1 in its table", COLORS]
GH4 = "4-Pin · JST-GH"
READS = "Each table lists the pins left → right exactly as you see them in the picture it points to"


# ────────────── 바탕 그림: (배열, 원본 좌표 상자 → 배열 좌표 함수) ──────────────
def lineart_side():
    """제조사 dual 그림(578 × 766)의 **왼쪽 옆면도**만(UART 가 보이는 면 — 이 면의 제품 렌더는 없다). 회색 표시(RGB 147·149·152)는 지운다."""
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


def x20d_view(view, reg):
    """X20D 평행 투영 렌더 한 면(구역 reg 로 자름) → (배열, 케이스 좌표 mm 상자 (x0, x1, y0, y1, z0, z1) → 배열 px 함수)."""
    log = open(os.path.join(X20D_RENDER, "..", "blender.log"), encoding="utf-8", errors="replace").read()
    c = json.loads(log[log.rindex("RESULT ") + 7:].splitlines()[0])["out"][view]["cam"]
    w, h = c["size"]
    s = max(w, h) / c["ortho_scale_mm"]

    def to_px(p):
        d = [p[i] - c["center_mm"][i] for i in range(3)]
        return w / 2 + s * sum(d[i] * c["right"][i] for i in range(3)) - reg[0], h / 2 - s * sum(d[i] * c["up"][i] for i in range(3)) - reg[2]

    def box(b3):
        pts = [to_px((x, y, z)) for x in b3[:2] for y in b3[2:4] for z in b3[4:6]]
        return min(p[0] for p in pts), max(p[0] for p in pts), min(p[1] for p in pts), max(p[1] for p in pts)
    return region(load_rgb(os.path.join(X20D_RENDER, "x20d_%s_rgba.png" % view)), *reg), box


def joined(parts, height):
    """그림 여러 장을 같은 높이로 가로로 이어 한 그림으로 → (배열, [각 그림 상자 변환 함수])."""
    arr, offs = hstack([p[0] for p in parts], height)
    return arr, [(lambda b, f=p[1], o=o: tuple(v * o[1] + (o[0] if i < 2 else 0) for i, v in enumerate(f(b)))) for p, o in zip(parts, offs)]


def it(box, name, sub, table, p1=None, side="B", **kw):
    return dict(box=box, name=name, sub=sub, table=table, p1=p1, side=side, **kw)


# ────────────── 제품별 한 장 ──────────────
def x20d(sh):
    XS = -17.7                                                    # PPS · UART · DEBUG 면(x) — 렌더 각인 RESULT at_mm
    img, box = x20d_view("gh", (20, 2380, 40, 860))
    sh.caption("PPS · UART · DEBUG side")
    sh.board(img, [
        it(box((XS, XS, 8.0, 15.8, 0.5, 5.2)), "PPS", GH4, ("h", word_cells(["GND", "EVENT", "GND", "PPS"], [1, 2, 3, 4])), "L"),
        it(box((XS, XS, -1.9, 6.0, 0.5, 5.2)), "UART", GH4, ("h", word_cells(["GND", "TX", "RX", "5V"], [1, 2, 3, 4])), "L"),
        it(box((XS, XS, -14.35, -3.7, 0.5, 5.2)), "DEBUG", "6-Pin · JST-GH",
           ("h", word_cells(["5V", "SWDIO", "SWCLK", "RX", "TX", "GND"], [1, 2, 3, 4, 5, 6])), "L")], img_w=1400)
    img, (fb, ab) = joined([x20d_view("front", (0, 1800, 40, 860)), x20d_view("ant", (0, 1800, 40, 860))], 820)
    sh.caption("USB · CAN end (left) and antenna end (right)")
    sh.board(img, [
        it(fb((-9.4, 0.4, -24, -24, 0.3, 3.9)), "USB", "Type-C", ("one", "USB 2.0", BLUE)),
        it(fb((1.9, 9.8, -24, -24, 0.5, 5.2)), "CAN", GH4, ("h", word_cells(["GND", "CAN_L", "CAN_H", "5V"], [1, 2, 3, 4])), "L"),
        it(ab((6.5, 11.5, 25, 25, -5.75, -0.8)), "ANT2", "MMCX · slave antenna", ("one", "RF", BLUE)),
        it(ab((-11.5, -6.5, 25, 25, -5.75, -0.8)), "ANT1", "MMCX · master antenna", ("one", "RF", BLUE))])


def dual_like(dev, uart_sub, usb_sub):
    def draw(sh):
        img, (db, lb) = joined([device(dev), lineart_side()], 900)
        sh.caption("Product render (left: USB and CAN on the front) · maker's drawing of the UART side (right — no render of that side)")
        sh.board(img, [
            it(db((478, 606, 790, 842)), "USB", usb_sub, ("one", "USB 2.0", BLUE)),
            it(db((612, 742, 800, 846)), "CAN", GH4, ("h", word_cells(["GND", "CAN_L", "CAN_H", "5V"], [1, 2, 3, 4])), "L"),
            it(lb((151, 184, 139, 200)), "UART", uart_sub, ("v", word_cells(["GND", "TX", "RX", "5V"], [1, 2, 3, 4])), "T")],
            img_w=1100)
    return draw


def m10(sh):
    img, b = photo_m10()
    sh.board(img, [
        it(b((268, 302, 344, 380)), "BMM350", "Compass on the module's I2C bus", ("one", "I2C", BLUE)),
        it(b((328, 452, 342, 455)), "GPS", "6-Pin · JST-GH · UART + I2C", ("h", word_cells(["SDA", "SCL", "TXD", "RXD", "5V", "GND"])))],
        img_w=760)


PRODUCTS = {
    "x20d": ("gnss_AP-RTK-X20D_pinout.png", "AP-RTK X20D Pinout", READS + "; number = pin on the R3 board.", LEG_P1, x20d),
    "dual": ("gnss_AP-RTK-dual_pinout.png", "AP-RTK dual Pinout", READS + " (UART: top → bottom); number = pin on the X-RTK2HP V6.0 board.",
             LEG_P1, dual_like("gnss_AP-RTK-dual_device.png", GH4, "Type-C")),
    "g5h": ("gnss_AP-RTK-G5H_pinout.png", "AP-RTK G5H Pinout", READS + " (UART: top → bottom); number = pin on the G5H board.",
            LEG_P1, dual_like("gnss_AP-RTK-G5H_device.png", "4-Pin · JST-GH · receiver COM2", "Type-C · MCU bootloader / DFU")),
    "m10": ("gnss_X_G10C_pinout.png", "AP-M10 Pinout",
            "Cells left → right as printed on the maker's photo. The photo names the signals but gives no pin numbers.", [COLORS], m10),
}


def render(key, out_dir):
    out, title, lead, legend, draw = PRODUCTS[key]
    sh = Sheet()
    sh.header(title, lead, legend)
    draw(sh)
    path = os.path.join(out_dir, out)
    rep = sh.save(path)
    print(path, rep["shown_px"], "min font on screen %.1f px (%r)" % (rep["min_font_screen_px"], rep["smallest_text"]))


if __name__ == "__main__":
    opts = {"--out", "--x20d"}
    keys = [a for i, a in enumerate(ARGS) if not a.startswith("--") and (i == 0 or ARGS[i - 1] not in opts)]
    out_dir = ARGS[ARGS.index("--out") + 1] if "--out" in ARGS else IMG
    for k in (keys or list(PRODUCTS)):
        render(k, out_dir)
