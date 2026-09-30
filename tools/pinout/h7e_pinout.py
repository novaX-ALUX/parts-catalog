# -*- coding: utf-8 -*-
"""AF-H7E 핀아웃 그림 한 장 — 원래 배치(제품 렌더 가운데 + 둘레 표 + 파란 점선) · 표 글자 = 화면 13 px 이상(pinout_style.Sheet.board).

입력
  핀 신호 정본 = src/content/fc/AF-H7E.md 의 pinTable (그림은 그 표만 읽는다 — 표와 그림이 어긋날 수 없다)
  렌더 = fc/AF-H7E/tools/h7e_glb.py → h7e_render_cfg.py → blender-3d 스킬 product_photo.py (HP 원격, 평행 투영 4 면)
         <렌더 폴더>/h7e_{top,left,right,front}_rgba.png + <렌더 폴더>/../blender.log 의 RESULT(시점별 카메라 → mm 를 픽셀로)
  커넥터 자리 = fc/AF-H7E/docs/h7e_case_geometry.json (케이스 구멍·커넥터 몸체, 같은 정렬 좌표 mm)
그리는 규칙
  - 사용자 2026-09-29 "커넥터 모양대로 핀아웃을 설명해야 헷갈리지 않을거 아냐": 표 칸 왼 → 오 = 그 그림에서 보이는 실제 핀 왼 → 오,
    1 번 끝 = 그림 위 빨간 ① + 표의 빨간 1 번 칸(같은 쪽 끝). 1 번 끝은 아래 P1 표(근거 주석)
  - 사용자 2026-09-30 "제품으로 해서 한페이지로 하고 원래 레이아웃에 포트설명 글자만 키우면되지": 제품당 한 장(윗면 · 왼쪽 · 오른쪽 · 앞 끝을
    위에서 아래로), 원래 배치 그대로 표 글자만 키운다. 치수도는 따로 한 장(fc_AF-H7E_dimensions.png).
실행: python h7e_pinout.py <렌더 폴더> [출력 폴더]  → fc_AF-H7E_pinout.png · fc_AF-H7E_dimensions.png
"""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from pinout_style import BLUE, INK, RED, W, Sheet, conn_cells, load_rgb, pin_table, region, subtitle  # noqa: E402

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
SUB = {"POWER 1": "6-Pin · Micro-Lock Plus · I2C1 monitor",
       "POWER 2": "6-Pin · Micro-Lock Plus · I2C2 monitor",
       "POWER C1": "6-Pin · CAN1 · base-PCB pads 0A → 0F",
       "POWER C2": "6-Pin · CAN2 · base-PCB pads 0G → 0L"}


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


def cells(nm):
    """md 핀 표 → 칸(1 번이 오른쪽이면 N … 1 순서 = 보이는 왼 → 오)."""
    cl = conn_cells(PT[nm])
    return cl[::-1] if P1.get(nm) == "R" else cl


def item(nm, box, side, reg, **kw):
    """둘레 표 한 개 — box = 렌더 px, reg = 지도로 자른 구역(x0, x1, y0, y1)."""
    d = {"box": (box[0] - reg[0], box[1] - reg[0], box[2] - reg[2], box[3] - reg[2]), "name": nm, "side": side, "p1": P1.get(nm)}
    if nm in PT:
        d.update(sub=SUB.get(nm) or subtitle(PT[nm]), table=("h", cells(nm)))
    d.update(kw)
    return d


def section(sh, title, view, reg, items, img_w=None):
    sh.caption(title)
    sh.board(region(IMG[view], *reg), items, img_w=img_w)


sh = Sheet()
sh.header("AF-H7E Pinout",
          "Each table lists the pins left → right exactly as you see them in the picture it points to.",
          [("1", RED), "= pin 1, the red 1 in its table", "+ = 5 V (PWM +: servo rail)    − = GND    blue = signal"])

# ════════ 윗면: 뒤(PWM) 위 · 앞 계단 아래 ════════
posts = G["power_c_posts"]
pc = {nm: [min(p[0] for p in grp) - 0.85, max(p[1] for p in grp) + 0.85, 31.2, 34.3, 10.4, 10.4]   # 6 핀(2.0 mm) 창
      for nm, grp in (("POWER C1", [p for p in posts if p[0] < 0]), ("POWER C2", [p for p in posts if p[0] > 0]))}
pw1, pw2 = sorted(G["power_top"]["holes"], key=lambda h: h[0])
fs = G["front_step_top"]["holes"]
upper = sorted([h for h in fs if (h[2] + h[3]) / 2 > -44.0], key=lambda h: h[0])
lower = sorted([h for h in fs if (h[2] + h[3]) / 2 <= -44.0], key=lambda h: h[0])
hole = dict(zip(["TELEM 3", "GPS & SAFETY", "GPS 2"], upper)) | dict(zip(["CAN 1", "CAN 2", "TELEM 1", "TELEM 2"], lower))
names = ["M%d" % i for i in range(1, 9)] + ["A%d" % i for i in range(1, 9)]
R = (0, 1400, 20, 2690)
T = lambda nm, side, **kw: item(nm, pbox("top", hole.get(nm) or pc.get(nm) or {"POWER 1": pw1, "POWER 2": pw2}[nm]), side, R, **kw)
section(sh, "Top view — rear (PWM header) at the top", "top", R, [
    item("PWM", pbox("top", [-20.6, 20.6, 20.9, 28.5, 10.4, 10.4]), "T", R, name="PWM OUT — 3 × 16 header",
         sub="M1–M8 MAIN (IOMCU) · A1–A8 AUX (FMU) · rows as seen: S rear, +, − front",
         table=("grid", names, [("S", BLUE, names), ("+", RED, ["+"] * 16), ("−", INK, ["−"] * 16)])),
    T("POWER C1", "L"), T("POWER 1", "L"), T("TELEM 3", "L"), T("CAN 1", "L"),
    T("POWER C2", "R"), T("POWER 2", "R"), T("GPS 2", "R"), T("TELEM 2", "R"),
    T("CAN 2", "B", tx=W / 2 - 330), T("TELEM 1", "B", tx=W / 2 + 330),
    T("GPS & SAFETY", "B", row=2, tx=W / 2,                    # 연결선 = CAN 2 와 TELEM 1 사이 틈(원래 그림과 같게)
      lx=to_px("top", ((hole["CAN 2"][1] + hole["TELEM 1"][0]) / 2, 0, 0))[0] - R[0])])

# ════════ 왼쪽 옆면 · 오른쪽 옆면 · 앞 끝면 ════════
LB = sorted(G["left_bodies"], key=lambda o: o["bb"][2])
RB = sorted(G["right_bodies"], key=lambda o: o["bb"][2])
FB = sorted(G["front_bodies"], key=lambda o: o["bb"][0])
usb = [h for h in G["left_face"]["holes"] if (h[3] - h[2]) > 8.0][0]
R = (20, 2680, 15, 885)
section(sh, "Left side — the front of the board is to the right", "left", R, [
    item("AD & IO", pbox("left", LB[0]["bb"]), "B", R), item("ETHERNET", pbox("left", LB[1]["bb"]), "B", R),
    item("USB-C", pbox("left", [G["left_face"]["x"], G["left_face"]["x"], usb[2], usb[3], usb[4], usb[5]]), "T", R,
         sub="SERIAL0 · Type-C · contacts in the pin table", table=("one", "USB 2.0", BLUE), p1=None)])
section(sh, "Right side — the rear (PWM header) is to the right", "right", R, [
    item(nm, pbox("right", o["bb"]), side, R)
    for nm, o, side in zip(["UART 4", "SPI 6", "DSM / SBUS RC", "PPM IN", "SBUS OUT"], RB, ["B", "T", "B", "B", "T"])])
R = (0, 1400, 0, 900)
section(sh, "Front end", "front", R, [
    item(nm, pbox("front", o["bb"]), side, R) for nm, o, side in zip(["FMU DEBUG", "USB", "IO DEBUG"], FB, ["T", "B", "B"])],
    img_w=900)
os.makedirs(ODIR, exist_ok=True)
path = os.path.join(ODIR, "fc_AF-H7E_pinout.png")
rep = sh.save(path)
print(path, rep["shown_px"], "min font on screen %.1f px (%r)" % (rep["min_font_screen_px"], rep["smallest_text"]))

# ════════ 치수도 — 옛 도면(src/h7e_dimensions_vendor.png = git 의 원래 fc_AF-H7E_dimensions.png)을 부분별로 잘라 크게 다시 배치 ════════
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
print(path, rep["shown_px"])
