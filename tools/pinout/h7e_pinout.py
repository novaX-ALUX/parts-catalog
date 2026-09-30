# -*- coding: utf-8 -*-
"""AF-H7E 핀아웃 그림 5 장 — 면마다 '지도 + 카드'(글자 = 화면 13 px 이상, pinout_style.Sheet).

입력
  핀 신호 정본 = src/content/fc/AF-H7E.md 의 pinTable (그림은 그 표만 읽는다 — 표와 그림이 어긋날 수 없다)
  렌더 = fc/AF-H7E/tools/h7e_glb.py → h7e_render_cfg.py → blender-3d 스킬 product_photo.py (HP 원격, 평행 투영 4 면)
         <렌더 폴더>/h7e_{top,left,right,front}_rgba.png + <렌더 폴더>/../blender.log 의 RESULT(시점별 카메라 → mm 를 픽셀로)
  커넥터 자리 = fc/AF-H7E/docs/h7e_case_geometry.json (케이스 구멍·커넥터 몸체, 같은 정렬 좌표 mm)
그리는 규칙
  - 사용자 2026-09-29 "커넥터 모양대로 핀아웃을 설명해야 헷갈리지 않을거 아냐": 표 칸 왼 → 오 = 그 그림에서 보이는 실제 핀 왼 → 오,
    1 번 끝 = 그림 위 빨간 ① + 표의 빨간 1 번 칸(같은 쪽 끝). 1 번 끝은 아래 P1 표(근거 주석)
  - 사용자 2026-09-30 "이 글자가 보이니???": 글자 크기는 pinout_style.Sheet 가 강제(카탈로그 844 px 폭에서 13 px 이상)
실행: python h7e_pinout.py <렌더 폴더> [출력 폴더]
  → fc_AF-H7E_pinout.png(윗면 뒤: 전원 · PWM) · _pinout_top_front.png(윗면 앞 계단) · _pinout_left.png · _pinout_right.png · _pinout_front.png
"""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from pinout_style import BLUE, INK, RED, Sheet, conn_cells, crop_px, load_rgb, pin_table, region, subtitle  # noqa: E402

CAT = os.path.normpath(os.path.join(HERE, "..", ".."))
REPO = os.path.normpath(os.path.join(CAT, "..", ".."))
RDIR = sys.argv[1]
ODIR = sys.argv[2] if len(sys.argv) > 2 else os.path.join(CAT, "public", "images", "products")
PT = pin_table(os.path.join(CAT, "src", "content", "fc", "AF-H7E.md"))
G = json.load(open(os.path.join(REPO, "fc", "AF-H7E", "docs", "h7e_case_geometry.json"), encoding="utf-8"))
log = open(os.path.join(RDIR, "..", "blender.log"), encoding="utf-8", errors="replace").read()
CAM = {k: v["cam"] for k, v in json.loads(log[log.rindex("RESULT ") + 7:].splitlines()[0])["out"].items()}
IMG = {v: load_rgb(os.path.join(RDIR, "h7e_%s_rgba.png" % v)) for v in ("top", "left", "right", "front")}

# ── 1 번 핀 끝(그 그림에서 보이는 방향) ─────────────────────────────────────────────────────────────
# 근거(2026-09-29, 반증 워커와 독립으로 같은 결론 — 기록 web/parts-catalog/tools/pinout/cross_verify/):
#   받침 보드 PCB X2-BASE.PCB 의 1 번 패드 좌표 + 케이스 장착 방향(M1 이 왼쪽 · GND 줄이 앞 = 제품 사진) → 시점별 좌우.
#   렌더에서도 JST 래치가 **아래**에 보이는 커넥터 = 1 번 오른쪽(래치를 위로 두면 1 번 왼쪽 — JST GH 도면 규칙).
#   POWER C1·C2 = 받침 보드 J13 패드 0A…0F · 0G…0L(번호 대신 글자), 0A·0G = GND 쪽 끝 = 표의 1 번(md 번호).
P1 = {"TELEM 3": "R", "GPS & SAFETY": "R", "GPS 2": "R", "CAN 1": "R", "CAN 2": "R", "TELEM 1": "R", "TELEM 2": "R",
      "POWER 1": "L", "POWER 2": "L", "POWER C1": "L", "POWER C2": "L",
      "ETHERNET": "R", "AD & IO": "R",
      "UART 4": "R", "SPI 6": "R", "DSM / SBUS RC": "R", "PPM IN": "R", "SBUS OUT": "R",
      "FMU DEBUG": "R", "USB": "R", "IO DEBUG": "R"}
SUB = {"POWER 1": "6-Pin · Micro-Lock Plus · primary power · I2C1 monitor",
       "POWER 2": "6-Pin · Micro-Lock Plus · redundant power · I2C2 monitor",
       "POWER C1": "6-Pin · CAN power module · CAN1 bus · numbered in base-PCB pad order 0A → 0F",
       "POWER C2": "6-Pin · CAN power module · CAN2 bus · numbered in base-PCB pad order 0G → 0L",
       "USB-C": "SERIAL0 · Type-C · reversible — contacts in the pin table on this page"}
LEAD = " Each table reads left → right exactly as the picture next to it."


def to_px(view, p):
    """제품 좌표(mm) → 렌더 픽셀(x 오른쪽, y 아래). 평행 투영 카메라(RESULT.cam) 그대로."""
    c = CAM[view]
    w, h = c["size"]
    s = max(w, h) / c["ortho_scale_mm"]
    d = [p[i] - c["center_mm"][i] for i in range(3)]
    return (w / 2 + s * sum(d[i] * c["right"][i] for i in range(3)), h / 2 - s * sum(d[i] * c["up"][i] for i in range(3)))


def pbox(view, b3):
    """3 차원 상자 (x0, x1, y0, y1, z0, z1) mm → 렌더 상자 (x0, x1, y0, y1) px."""
    pts = [to_px(view, (x, y, z)) for x in b3[:2] for y in b3[2:4] for z in b3[4:6]]
    return min(p[0] for p in pts), max(p[0] for p in pts), min(p[1] for p in pts), max(p[1] for p in pts)


def px_per_mm(view):
    c = CAM[view]
    return max(c["size"]) / c["ortho_scale_mm"]


def cells(nm):
    """md 핀 표 → 칸(1 번이 오른쪽이면 N … 1 순서 = 보이는 왼 → 오)."""
    cl = conn_cells(PT[nm])
    return cl[::-1] if P1.get(nm) == "R" else cl


def make(out, title, lead, view, reg, conns, max_h=900, pwm=None):
    """한 장: 지도(렌더 region 자르기, 밖은 흰색) + 커넥터 카드. conns = [(이름, 렌더 상자 px, 옵션)] — 글자는 이 순서로 A, B, …
    옵션 pos = 배지 자리("inside" 촘촘한 곳 · "below"/"above" 작은 커넥터의 핀을 가리지 않게 — 그 자리에 각인이 없는 쪽)."""
    img = IMG[view]
    x0, x1, y0, y1 = reg
    sh = Sheet()
    sh.header(title, lead + LEAD)
    items = []
    for i, (nm, b, opt) in enumerate(conns):
        items.append({"box": (b[0] - x0, b[1] - x0, b[2] - y0, b[3] - y0), "letter": chr(65 + i),
                      "p1": P1.get(nm), "letter_at": opt.get("letter_at"), "pos": opt.get("pos", "inside")})
    sh.map(region(img, x0, x1, y0, y1), items, max_h=max_h)
    s = px_per_mm(view)
    for i, (nm, b, opt) in enumerate(conns):
        if nm == "PWM":
            pwm(sh, chr(65 + i))
            continue
        pos = opt.get("pos", "inside")
        top = opt.get("pad_top", 3.4 if pos == "above" else 2.4)
        crop, cb = crop_px(img, b, 3.0 * s, top * s, (3.4 if pos == "below" else 2.4) * s)
        if nm == "USB-C":                                    # 뒤집어 꽂는 커넥터 — 접점 순서가 아니라 한 칸
            sh.card(crop, cb, chr(65 + i), None, nm, SUB[nm], ("one", "USB 2.0", BLUE), pos=pos)
        else:
            sh.card(crop, cb, chr(65 + i), P1[nm], nm, SUB.get(nm) or subtitle(PT[nm]), ("h", cells(nm)), pos=pos)
    path = os.path.join(ODIR, out)
    rep = sh.save(path)
    print(path, rep["shown_px"], "min font on screen %.1f px (%r)" % (rep["min_font_screen_px"], rep["smallest_text"]))


def pwm_card(sh, letter):
    """PWM 3 × 16 — 사진 속 핀 열에 표 칸을 맞춘다. 열 = −19.5 + 2.6 i mm(받침 PCB, 렌더 금색 핀 무게중심과 1 px 안),
    줄 = 27.22 · 24.68 · 22.19 mm(렌더 금색 핀 무게중심) = 보이는 위 → 아래 S(뒤) · + · −(앞)."""
    cols_mm = [-19.5 + 2.6 * i for i in range(16)]
    rows_mm = [27.22, 24.68, 22.19]
    xa, ya = to_px("top", (cols_mm[0] - 2.1, 29.4, 0))
    xb, yb = to_px("top", (cols_mm[-1] + 2.1, 15.3, 0))
    crop = IMG["top"][int(ya):int(yb), int(xa):int(xb)]
    cols = [to_px("top", (x, 0, 0))[0] - int(xa) for x in cols_mm]
    rows_y = [to_px("top", (0, y, 0))[1] - int(ya) for y in rows_mm]
    names = ["M%d" % i for i in range(1, 9)] + ["A%d" % i for i in range(1, 9)]
    sh.grid_card(crop, cols, rows_y, letter, "PWM OUT — 3 × 16 header",
                 "M1–M8 = MAIN (IOMCU, SERVO1–8) · A1–A8 = AUX (FMU, SERVO9–16) · rows as seen: S rear, + middle, − front · "
                 "+ = servo rail, fed by an external BEC",
                 [("S", BLUE, names), ("+", RED, ["+"] * 16), ("−", INK, ["−"] * 16)])


os.makedirs(ODIR, exist_ok=True)

# ════════ ① 윗면 뒤: POWER C1 · C2 · PWM · POWER 1 · 2 ════════
posts = G["power_c_posts"]
pc = {nm: [min(p[0] for p in grp) - 0.85, max(p[1] for p in grp) + 0.85, 31.2, 34.3, 10.4, 10.4]   # 6 핀(2.0 mm) 창
      for nm, grp in (("POWER C1", [p for p in posts if p[0] < 0]), ("POWER C2", [p for p in posts if p[0] > 0]))}
pw1, pw2 = sorted(G["power_top"]["holes"], key=lambda h: h[0])
make("fc_AF-H7E_pinout.png", "AF-H7E Pinout — Top, Rear",
     "Seen from above with the rear edge (PWM header) at the top.", "top", (0, 1400, 20, 1010),
     [("POWER C1", pbox("top", pc["POWER C1"]), {"pos": "above"}), ("POWER C2", pbox("top", pc["POWER C2"]), {"pos": "above"}),
      ("PWM", pbox("top", [-20.6, 20.6, 20.9, 28.5, 10.4, 10.4]), {"letter_at": "left"}),
      ("POWER 1", pbox("top", pw1), {"pad_top": 1.6}), ("POWER 2", pbox("top", pw2), {"pad_top": 1.6})], pwm=pwm_card)

# ════════ ② 윗면 앞 계단 7 개 ════════
fs = G["front_step_top"]["holes"]
upper = sorted([h for h in fs if (h[2] + h[3]) / 2 > -44.0], key=lambda h: h[0])
lower = sorted([h for h in fs if (h[2] + h[3]) / 2 <= -44.0], key=lambda h: h[0])
hole = dict(zip(["TELEM 3", "GPS & SAFETY", "GPS 2"], upper)) | dict(zip(["CAN 1", "CAN 2", "TELEM 1", "TELEM 2"], lower))
make("fc_AF-H7E_pinout_top_front.png", "AF-H7E Pinout — Top, Front Step",
     "Seen from above with the front edge at the bottom.", "top", (0, 1400, 2140, 2690),
     [(nm, pbox("top", hole[nm]), {}) for nm in ["TELEM 3", "GPS & SAFETY", "GPS 2", "CAN 1", "CAN 2", "TELEM 1", "TELEM 2"]])

# ════════ ③ 왼쪽 옆면 · ④ 오른쪽 옆면 · ⑤ 앞 끝면 ════════
LB = sorted(G["left_bodies"], key=lambda o: o["bb"][2])
RB = sorted(G["right_bodies"], key=lambda o: o["bb"][2])
FB = sorted(G["front_bodies"], key=lambda o: o["bb"][0])
usb = [h for h in G["left_face"]["holes"] if (h[3] - h[2]) > 8.0][0]
left = [("AD & IO", pbox("left", LB[0]["bb"])), ("ETHERNET", pbox("left", LB[1]["bb"])),
        ("USB-C", pbox("left", [G["left_face"]["x"], G["left_face"]["x"], usb[2], usb[3], usb[4], usb[5]]))]
right = [(nm, pbox("right", o["bb"])) for nm, o in zip(["UART 4", "SPI 6", "DSM / SBUS RC", "PPM IN", "SBUS OUT"], RB)]
front = [(nm, pbox("front", o["bb"])) for nm, o in zip(["FMU DEBUG", "USB", "IO DEBUG"], FB)]
for out, title, lead, view, reg, conns, mh in [
        ("fc_AF-H7E_pinout_left.png", "AF-H7E Pinout — Left Side",
         "Seen from the left side; the front of the board is to the right.", "left", (20, 2680, 15, 975), left, 900),
        ("fc_AF-H7E_pinout_right.png", "AF-H7E Pinout — Right Side",
         "Seen from the right side; the rear (PWM header) is to the right.", "right", (20, 2680, 15, 975), right, 900),
        ("fc_AF-H7E_pinout_front.png", "AF-H7E Pinout — Front End",
         "Seen from the front end.", "front", (0, 1400, 0, 975), front, 620)]:
    # 옆면 · 앞 끝면: 배지 = 커넥터 바로 아래(위쪽엔 각인 USB · ETH · AD&IO PORT 가 있다)
    make(out, title, lead, view, reg, [(nm, b, {"pos": "below"}) for nm, b in sorted(conns, key=lambda t: t[1][0])], max_h=mh)

# ════════ ⑥ 치수도 — 옛 도면(src/h7e_dimensions_vendor.png = git 의 원래 fc_AF-H7E_dimensions.png)을 부분별로 잘라 크게 다시 배치 ════════
# 원본 1467 px 을 카탈로그 844 px 로 줄이면 치수 숫자가 화면 약 10 px(2026-09-30) → 옆면도 1.88 배 · 윗면도 · 앞면도 1.7 배로 키워
# 숫자 = 화면 약 14 px 이상. 도면 내용은 바꾸지 않는다(출력 파일을 다시 읽지 않는다).
import numpy as np  # noqa: E402
from PIL import Image  # noqa: E402

dim = Image.open(os.path.join(HERE, "src", "h7e_dimensions_vendor.png")).convert("RGB")
side, front, top = dim.crop((7, 105, 794, 329)), dim.crop((1167, 105, 1422, 329)), dim.crop((65, 612, 712, 943))
up = lambda im, k: im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
side, front, top = up(side, 1.88), up(front, 1.7), up(top, 1.7)
cw = max(side.width, top.width + 40 + front.width)
canvas = Image.new("RGB", (cw, side.height + 70 + top.height), "white")
canvas.paste(side, ((cw - side.width) // 2, 0))
canvas.paste(top, ((cw - top.width - 40 - front.width) // 2, side.height + 70))
canvas.paste(front, ((cw - top.width - 40 - front.width) // 2 + top.width + 40, side.height + 70 + (top.height - front.height) // 2))
sh = Sheet()
sh.header("AF-H7E Dimensions", "Millimetres. Side view (top), top view and front view (bottom).", legend=[])
sh.map(np.asarray(canvas), [], max_h=canvas.height)
path = os.path.join(ODIR, "fc_AF-H7E_dimensions.png")
rep = sh.save(path)
print(path, rep["shown_px"], "drawing scale on screen: side %.2f · top/front %.2f (original 0.58)" % (1.88 * min(1, 1608 / cw) / 2,
                                                                                                    1.7 * min(1, 1608 / cw) / 2))
