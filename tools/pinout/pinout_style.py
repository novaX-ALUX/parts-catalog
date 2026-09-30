# -*- coding: utf-8 -*-
"""카탈로그 핀아웃 그림 공용 — '지도 + 카드' 시트(px 단위, 글자 크기 강제).

사용자 2026-09-30 "이 글자가 보이니??? 왜이렇게 작게 만들어!!! … 글자 사람이 쉽게보이도록해" →
  카탈로그 Pinout 칸은 그림을 **최대 844 px 폭**으로 보여 준다(src/styles/global.css: 카드 900 − 여백 28 × 2).
  캔버스 = 1688 px(= 2 × 844, 고해상도 화면에서도 선명), **모든 글자 = 화면 13 px 이상**(캔버스 26 px 이상) — Sheet.text 가 막는다.
  한 장에 커넥터 표를 다 몰아넣으면 글자가 작아지므로:
  ① 지도 = 제품 그림 · 커넥터마다 파란 점선 상자 + 파란 글자 배지(A B …) + 빨간 ①(1 번 끝, 상자 안)
  ② 카드 = 커넥터마다 한 줄 [확대 그림(① 표시) | 글자 · 이름 · 부제 · 핀 표] — 표 칸 왼 → 오 = 확대 그림에서 보이는 핀 왼 → 오.
핀 신호 정본은 카탈로그 md 의 pinTable 이고 여기서는 읽기만 한다. + = 5 V(빨강) · − = GND(검정) · 신호 = 파랑.
"""
import json
import os
import re

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402
import numpy as np  # noqa: E402
from matplotlib.patches import Circle, FancyBboxPatch, Rectangle  # noqa: E402
from PIL import Image, ImageFont  # noqa: E402

plt.rcParams["font.family"] = ["Segoe UI", "Malgun Gothic"]
plt.rcParams["axes.unicode_minus"] = False
BLUE, RED, INK, GREY, LINE = "#1f5fbf", "#d62828", "#111111", "#555555", "#c9ced6"

PAGE_PX = 844                     # 카탈로그 Pinout 칸 그림 최대 폭(px)
W = 2 * PAGE_PX                   # 캔버스 폭
SCALE = PAGE_PX / W               # 캔버스 → 화면
MIN_SCREEN_PX = 13                # 화면 글자 최소(글자 크기 = em)
DPI = 100
PX = dict(title=52, lead=28, name=36, sub=28, pin=26, sig=32, badge=28, small=26)   # 캔버스 px
MARGIN = 40
_FONT = {False: "C:/Windows/Fonts/segoeui.ttf", True: "C:/Windows/Fonts/segoeuib.ttf"}
_FCACHE = {}

# 범례 조각: 글자 = 그대로, (글자, 색) = 배지
LEGEND = [("A", BLUE), "= connector, its table below", ("1", RED), "= pin 1, the red 1 in its table",
          "+ = 5 V    − = GND    blue = signal"]


def text_w(s, px, bold=False):
    """글자 폭(px) — Segoe UI 실측."""
    key = (px, bold)
    if key not in _FCACHE:
        _FCACHE[key] = ImageFont.truetype(_FONT[bold], px)
    return _FCACHE[key].getlength(s)


def wrap(s, px, width, bold=False):
    """폭 안에 들어가게 낱말 단위로 줄 나눔."""
    lines, cur = [], ""
    for wd in s.split(" "):
        t = (cur + " " + wd).strip()
        if not cur or text_w(t, px, bold) <= width:
            cur = t
        else:
            lines.append(cur)
            cur = wd
    return lines + ([cur] if cur else [])


# ────────────────────────────── 핀 표 데이터 ──────────────────────────────
def pin_table(md_path):
    """md pinTable → {커넥터 이름: {"type", "mapping", "pins": [(pin, signal)]}} (순서 유지)."""
    s = open(md_path, encoding="utf-8").read()
    s = s[s.index("pinTable:"):]
    end = re.search(r"\n[a-zA-Z]", s[1:])
    s = s[: end.start() + 1] if end else s
    out = {}
    for blk in re.split(r"\n  - name: ", s)[1:]:
        name = blk.split("\n", 1)[0].strip()
        typ = re.search(r"\n    type: (.+)", blk)
        mp = re.search(r"\n    mapping: (.+)", blk)
        pins = [(m.group(1).strip().strip('"'), m.group(2).strip())
                for m in re.finditer(r"\{ pin: ([^,]+), signal: ([^,]+), function:", blk)]
        out[name] = {"type": typ.group(1).strip() if typ else "", "mapping": mp.group(1).strip() if mp else "", "pins": pins}
    return out


def label(sig):
    """신호 이름 → (칸 글자, 색). 5 V = +, GND = −."""
    if sig in ("VCC", "VCC_IN", "V_SERVO"):
        return "+", RED
    if sig == "GND":
        return "−", INK
    if sig in ("VCC_3V3", "VBUS"):
        return {"VCC_3V3": "3V3"}.get(sig, sig), RED
    if sig == "NC":
        return "NC", GREY
    return {"CONSOLE_TX": "TX", "CONSOLE_RX": "RX", "IO_TX": "TX"}.get(sig, sig), BLUE


def subtitle(entry):
    """부제: SERIALn(있으면) · N-Pin · 커넥터 계열."""
    t, n = entry["type"], len([p for p in entry["pins"] if p[0].isdigit()])
    fam = next((f for f in ("JST-GH", "JST-SH", "Micro-Lock Plus", "Type-C") if f in t), "")
    m = re.match(r"(SERIAL\d+)", entry["mapping"])
    base = ("%d-Pin" % n) if n else ""
    return " · ".join(x for x in ((m.group(1) if m else ""), base, fam) if x)


def word_color(w):
    """글자 색: 전원 레일(5V · 12 V · VBAT · BAT + · 3V3 · + …) 빨강 · GND 검정 · 나머지(신호) 파랑."""
    if w in ("GND", "−"):
        return INK
    if w == "NC":
        return GREY
    return RED if w == "+" or re.match(r"^\+?\d[\d.]*([–-]\d+)? ?V\b|^(VCC|VBAT|VBUS|BAT( ?\+)?$|3V3)", w) else BLUE


def word_cells(words, pins=None):
    """["5V", "RX", …] → [(pin, 글자, 색)] — 전원 빨강 · GND 검정 · 나머지 파랑(word_color)."""
    pins = pins or [""] * len(words)
    return [(str(p), w, word_color(w)) for p, w in zip(pins, words)]


def conn_cells(entry):
    return [(p,) + label(sig) for p, sig in entry["pins"]]


# ────────────────────────────── 그림 도우미 ──────────────────────────────
def load_rgb(path):
    """PNG(투명 가능) → 흰 바탕 RGB 배열(uint8)."""
    im = Image.open(path).convert("RGBA")
    bg = Image.new("RGBA", im.size, "white")
    bg.alpha_composite(im)
    return np.asarray(bg.convert("RGB")).copy()


def crop_px(img, box, pad_x, pad_y=None, pad_bottom=None):
    """그림 배열에서 box(x0, x1, y0, y1 px) 둘레를 잘라 (crop, 그 안의 box) 로. 그림 밖은 흰색으로 채운다.
    pad_x 가 (왼, 오, 위, 아래) 네 값이면 그대로 쓴다(옆에 인쇄된 실크 글자까지 보이게)."""
    if isinstance(pad_x, (tuple, list)):
        pl, pr, pt, pb = pad_x
    else:
        pl = pr = pad_x
        pt = pad_x if pad_y is None else pad_y
        pb = pt if pad_bottom is None else pad_bottom
    return region(img, box[0] - pl, box[1] + pr, box[2] - pt, box[3] + pb),         (pl, pl + box[1] - box[0], pt, pt + box[3] - box[2])


def region(img, x0, x1, y0, y1):
    """그림 배열의 (x0, x1, y0, y1) 구역 — 그림 밖은 흰색."""
    x0, x1, y0, y1 = int(round(x0)), int(round(x1)), int(round(y0)), int(round(y1))
    h, w = img.shape[:2]
    out = np.full((y1 - y0, x1 - x0, img.shape[2]), 255, dtype=img.dtype)
    sx0, sx1, sy0, sy1 = max(0, x0), min(w, x1), max(0, y0), min(h, y1)
    out[sy0 - y0:sy1 - y0, sx0 - x0:sx1 - x0] = img[sy0:sy1, sx0:sx1]
    return out


def hstack(imgs, height, gap=60):
    """그림 여러 장(RGB 배열)을 같은 높이로 맞춰 가로로 잇는다 → (배열, [(가로 위치, 배율)])."""
    parts, offs, x = [], [], 0
    for im in imgs:
        k = height / im.shape[0]
        w = int(round(im.shape[1] * k))
        parts.append(np.asarray(Image.fromarray(im).resize((w, height), Image.LANCZOS)))
        offs.append((x, k))
        x += w + gap
    out = np.full((height, x - gap, 3), 255, np.uint8)
    for im, (ox, _) in zip(parts, offs):
        out[:, ox:ox + im.shape[1]] = im
    return out, offs


# ────────────────────────────── 표 ──────────────────────────────
CELL_MIN, CELL_PAD, PIN_H, SIG_H = 88, 30, 44, 64
V_PIN_W, V_ROW_H = 72, 52
G_LAB_W, G_ROW_H = 120, 58


def sig_px(lab):
    """신호 칸 글자 크기 — + · − 한 글자는 획이 가늘어 같은 크기면 작아 보여 키운다."""
    return PX["sig"] + 10 if lab in ("+", "−") else PX["sig"]


def _hcell_w(cells):
    return [max(CELL_MIN, text_w(lab, PX["sig"], True) + CELL_PAD) for _, lab, _ in cells]


def _numbered(cells):
    return any(c[0] for c in cells)


def table_size(table):
    kind = table[0]
    if kind == "h":
        return sum(_hcell_w(table[1])), (PIN_H if _numbered(table[1]) else 0) + SIG_H
    if kind == "v":
        sw = max([170] + [text_w(lab, PX["sig"], True) + CELL_PAD for _, lab, _ in table[1]])
        return (V_PIN_W if _numbered(table[1]) else 0) + sw, V_ROW_H * len(table[1])
    if kind == "rows":                                          # 패드 묶음(여러 줄 · 번호 없음) — 열 폭은 그 열의 가장 넓은 칸
        return sum(_rows_w(table[1])), SIG_H * len(table[1])
    return max(260, text_w(table[1], PX["sig"], True) + 60), SIG_H      # "one"


def _rows_w(rows):
    return [max(CELL_MIN, max(text_w(r[j][1], PX["sig"], True) + CELL_PAD for r in rows if j < len(r)))
            for j in range(max(len(r) for r in rows))]


def draw_table(sh, ax, x, y, table):
    kind = table[0]
    if kind == "h":                                            # 위 = 핀 번호 줄, 아래 = 신호 줄. 1 번 = 빨간 굵은 숫자 + 빨간 밑줄
        cx = x
        ph = PIN_H if _numbered(table[1]) else 0               # 번호 자료가 없으면 번호 줄을 그리지 않는다
        for (pin, lab, col), w in zip(table[1], _hcell_w(table[1])):
            one = pin == "1"
            if ph:
                ax.add_patch(Rectangle((cx, y), w, ph, fc="#e9edf2", ec=INK, lw=1.6, zorder=5))
            ax.add_patch(Rectangle((cx, y + ph), w, SIG_H, fc="white", ec=INK, lw=1.6, zorder=5))
            if pin:
                sh.text(ax, cx + w / 2, y + ph / 2 + 1, pin, PX["pin"] + (4 if one else 0), ha="center", va="center",
                        color=RED if one else GREY, fontweight="bold" if one else "normal", zorder=6)
            if one:
                ax.add_patch(Rectangle((cx + 1.5, y + ph + SIG_H - 8), w - 3, 8, fc=RED, ec="none", zorder=6))
            sh.text(ax, cx + w / 2, y + ph + SIG_H / 2 - 1, lab, sig_px(lab), ha="center", va="center", color=col,
                    fontweight="bold", zorder=6)
            cx += w
    elif kind == "v":                                          # 왼 = 핀 번호 칸, 오른 = 신호 칸. 위 → 아래 = 그림의 위 → 아래
        pw = V_PIN_W if _numbered(table[1]) else 0             # 번호 자료가 없으면 번호 칸을 그리지 않는다
        sw = table_size(table)[0] - pw
        for i, (pin, lab, col) in enumerate(table[1]):
            yy = y + i * V_ROW_H
            one = pin == "1"
            if pw:
                ax.add_patch(Rectangle((x, yy), pw, V_ROW_H, fc="#e9edf2", ec=INK, lw=1.6, zorder=5))
            ax.add_patch(Rectangle((x + pw, yy), sw, V_ROW_H, fc="white", ec=INK, lw=1.6, zorder=5))
            if one:
                ax.add_patch(Rectangle((x + pw + 1.5, yy + 1.5), 8, V_ROW_H - 3, fc=RED, ec="none", zorder=6))
            if pin:
                sh.text(ax, x + pw / 2, yy + V_ROW_H / 2 + 1, pin, PX["pin"] + (4 if one else 0), ha="center", va="center",
                        color=RED if one else GREY, fontweight="bold" if one else "normal", zorder=6)
            sh.text(ax, x + pw + sw / 2, yy + V_ROW_H / 2, lab, sig_px(lab), ha="center", va="center", color=col,
                    fontweight="bold", zorder=6)
    elif kind == "rows":                                       # 위 → 아래 = 그림의 위 → 아래 줄, 칸 = 왼 → 오
        ws = _rows_w(table[1])
        for i, row in enumerate(table[1]):
            cx = x
            for (pin, lab, col), w in zip(row, ws):
                ax.add_patch(Rectangle((cx, y + i * SIG_H), w, SIG_H, fc="white", ec=INK, lw=1.6, zorder=5))
                sh.text(ax, cx + w / 2, y + i * SIG_H + SIG_H / 2 - 1, lab, sig_px(lab), ha="center", va="center", color=col,
                        fontweight="bold", zorder=6)
                cx += w
    else:                                                      # 한 칸(번호 없는 커넥터: USB-C · MMCX 등)
        w, h = table_size(table)
        ax.add_patch(Rectangle((x, y), w, h, fc="white", ec=INK, lw=1.6, zorder=5))
        sh.text(ax, x + w / 2, y + h / 2, table[1], PX["sig"], ha="center", va="center", color=table[2], fontweight="bold", zorder=6)


# ────────────────────────────── 시트 ──────────────────────────────
class Sheet:
    """위에서 아래로 블록을 쌓는 px 캔버스(y 아래로). 모든 글자는 text() 로 — 화면 13 px 미만이면 오류."""

    def __init__(self):
        self.ops, self.y, self.texts, self.tables = [], MARGIN, [], []

    # ── 그리기 도구 ──
    def text(self, ax, x, y, s, px, **kw):
        if px * SCALE < MIN_SCREEN_PX - 1e-6:
            raise ValueError("글자가 화면 %.1f px < %d px: %r" % (px * SCALE, MIN_SCREEN_PX, s))
        self.texts.append((s, px))
        kw.setdefault("color", INK)
        ax.text(x, y, s, fontsize=px * 72.0 / DPI, **kw)

    def badge(self, ax, x, y, s, color, r=22):
        ax.add_patch(Circle((x, y), r, fc=color, ec="white", lw=3, zorder=20))
        self.text(ax, x, y + 1, s, PX["badge"] if r >= 20 else 26, ha="center", va="center", color="white", fontweight="bold", zorder=21)

    def _add(self, h, fn):
        self.ops.append((self.y, fn))
        self.y += h

    def marks(self, ax, bx, letter, p1, r=22, letter_at=None, pos="inside"):
        """점선 상자 + ①(1 번 끝) + 글자 배지(반대 끝).
        pos = "inside": 상자 안 양 끝(커넥터가 촘촘한 곳 — 옆 커넥터와 헷갈리지 않게)
              "below" / "above": 상자 바로 아래 / 위, 같은 양 끝(작은 커넥터의 핀을 가리지 않게, 그 자리에 각인이 없을 때)
              "left": 상자 왼쪽 바깥, 위 · 아래 끝(세로 커넥터)."""
        x0, x1, y0, y1 = bx
        ax.add_patch(Rectangle((x0 - 7, y0 - 7), x1 - x0 + 14, y1 - y0 + 14, fill=False, ec=BLUE, lw=3.2,
                               ls=(0, (7, 4)), zorder=15))
        cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
        if pos == "left":                                                   # 세로 커넥터: 상자 왼쪽 바깥, ① = 1 번 끝 · 글자 = 반대 끝
            bx_ = x0 - 7 - r - 6
            ends = {"T": y0 + r - 4, "B": y1 - r + 4}
            if p1 in ("T", "B"):
                self.badge(ax, bx_, ends[p1], "1", RED, r)
            if letter:
                ly = ends["B" if p1 == "T" else "T"]
                if p1 in ("T", "B") and abs(ly - ends[p1]) < 2 * r + 8:
                    ly = ends[p1] + (2 * r + 8) * (1 if p1 == "T" else -1)
                self.badge(ax, bx_, ly, letter, BLUE, r)
            return
        if pos in ("below", "above"):
            by = y1 + 7 + r + 6 if pos == "below" else y0 - 7 - r - 6
            end = {"L": x0 + r - 4, "R": x1 - r + 4}
            if p1 in ("L", "R"):
                self.badge(ax, end[p1], by, "1", RED, r)
                if letter:
                    lx = end["R" if p1 == "L" else "L"]
                    if abs(lx - end[p1]) < 2 * r + 8:                       # 좁은 상자: 글자를 바깥쪽으로 비킨다
                        lx = end[p1] + (2 * r + 8) * (1 if p1 == "L" else -1)
                    self.badge(ax, lx, by, letter, BLUE, r)
            else:
                if p1 in ("T", "B"):
                    self.badge(ax, x0 - 7 - r - 6, y0 + r if p1 == "T" else y1 - r, "1", RED, r)
                if letter:
                    self.badge(ax, cx, by, letter, BLUE, r)
            return
        inset = r + 4
        if p1 in ("L", "R"):
            self.badge(ax, x0 + inset if p1 == "L" else x1 - inset, cy, "1", RED, r)
        elif p1 in ("T", "B"):
            self.badge(ax, cx, y0 + inset if p1 == "T" else y1 - inset, "1", RED, r)
        if not letter:
            return
        if letter_at == "left" or (letter_at is None and p1 in ("L", "R", None) and (x1 - x0) < 4.6 * r):
            self.badge(ax, x0 - 7 - r - 6, cy, letter, BLUE, r)
        elif letter_at == "above":
            self.badge(ax, x0 + r, y0 - 7 - r - 6, letter, BLUE, r)
        elif p1 in ("T", "B"):
            self.badge(ax, cx, y1 - inset if p1 == "T" else y0 + inset, letter, BLUE, r)
        else:
            self.badge(ax, x1 - inset if p1 == "L" else x0 + inset, cy, letter, BLUE, r)

    # ── 블록 ──
    def header(self, title, lead, legend=LEGEND):
        leads = wrap(lead, PX["lead"], W - 2 * MARGIN)
        # 범례를 줄 단위로 흘려 배치(배지 44 px + 틈)
        items = [(52, p) if isinstance(p, tuple) else (text_w(p, PX["lead"]) + 44, p) for p in legend]
        rows, cur, cw = [], [], 0
        for wd, p in items:
            if cur and cw + wd > W - 2 * MARGIN:
                rows.append((cw, cur))
                cur, cw = [], 0
            cur.append((wd, p))
            cw += wd
        if cur:
            rows.append((cw, cur))
        h = 76 + 42 * len(leads) + 50 * len(rows) + 18

        def fn(ax, y0):
            self.text(ax, W / 2, y0 + 32, title, PX["title"], ha="center", va="center", fontweight="bold")
            for i, s in enumerate(leads):
                self.text(ax, W / 2, y0 + 88 + 42 * i, s, PX["lead"], ha="center", va="center", color="#333333")
            yy = y0 + 88 + 42 * len(leads) + 12
            for cw_, row in rows:
                x = W / 2 - cw_ / 2
                for wd, p in row:
                    if isinstance(p, tuple):
                        self.badge(ax, x + 22, yy, p[0], p[1])
                    else:
                        self.text(ax, x, yy + 1, p, PX["lead"], ha="left", va="center", color="#333333")
                    x += wd
                yy += 50
            ax.plot([MARGIN, W - MARGIN], [y0 + h - 4, y0 + h - 4], color=LINE, lw=2)
        self._add(h, fn)

    def caption(self, s):
        """면 제목(한 장에 면이 여럿일 때 각 그림 위) — 길면 줄을 나눈다."""
        ls = wrap(s, PX["name"], W - 2 * MARGIN, True)

        def fn(ax, y0):
            for i, t in enumerate(ls):
                self.text(ax, MARGIN, y0 + 30 + 46 * i, t, PX["name"], ha="left", va="center", fontweight="bold")
        self._add(52 + 46 * (len(ls) - 1), fn)

    def map(self, img, items, max_h=900):
        """img = 제품 그림 배열, items = [{"box": (x0, x1, y0, y1) 그림 px, "letter", "p1": "L"|"R"|"T"|"B"|None,
        "letter_at": None|"left"|"above", "pos": "inside"|"below"|"above"}]."""
        h0, w0 = img.shape[:2]
        k = min((W - 2 * MARGIN) / w0, max_h / h0)
        dw, dh = w0 * k, h0 * k
        x0 = (W - dw) / 2

        def fn(ax, y0):
            ax.imshow(img, extent=[x0, x0 + dw, y0 + 20 + dh, y0 + 20], zorder=1, interpolation="lanczos")
            for it in items:
                b = it["box"]
                self.marks(ax, [x0 + b[0] * k, x0 + b[1] * k, y0 + 20 + b[2] * k, y0 + 20 + b[3] * k],
                           it.get("letter"), it.get("p1"), letter_at=it.get("letter_at"), pos=it.get("pos", "inside"))
            ax.plot([MARGIN, W - MARGIN], [y0 + dh + 44, y0 + dh + 44], color=LINE, lw=2)
        self._add(dh + 48, fn)

    def _card_head(self, ax, x, y, letter, name, subs):
        self.badge(ax, x + 22, y + 26, letter, BLUE)
        self.text(ax, x + 58, y + 27, name, PX["name"], ha="left", va="center", fontweight="bold")
        for i, s in enumerate(subs):
            self.text(ax, x, y + 80 + 42 * i, s, PX["sub"], ha="left", va="center", color=GREY)

    def card(self, crop, box, letter, p1, name, sub, table, panel_w=420, pos="inside"):
        """커넥터 한 줄: [확대 그림 | 글자 · 이름 · 부제 · 표]. crop = 배열, box = 그 안의 커넥터 상자(px).
        table = ("h", cells) | ("v", cells) | ("rows", [cells, …]) | ("one", 글자, 색). 표가 오른쪽에 안 들어가면 그림 아래 전체 폭으로."""
        ch, cw = crop.shape[:2]
        tw, th = table_size(table)
        panel_h = min(max(190, panel_w * ch / cw), 300)
        if table[0] == "v":
            panel_h = max(panel_h, min(th, 460))
        k = min(panel_w / cw, panel_h / ch)
        dw, dh = cw * k, ch * k
        tx = MARGIN + panel_w + 40
        avail = W - MARGIN - tx
        subs = wrap(sub, PX["sub"], avail) if sub else []
        head = 60 + 42 * len(subs) + 16
        below = tw > avail
        body = max(panel_h, head + (0 if below else th))
        if below:
            body += 22 + th
        H = 22 + body + 30

        def fn(ax, y0):
            top = y0 + 22
            ax.add_patch(FancyBboxPatch((MARGIN, top), panel_w, panel_h, boxstyle="round,pad=0,rounding_size=14",
                                        fc="white", ec=LINE, lw=2, zorder=0))
            px0, py0 = MARGIN + (panel_w - dw) / 2, top + (panel_h - dh) / 2
            ax.imshow(crop, extent=[px0, px0 + dw, py0 + dh, py0], zorder=1, interpolation="lanczos")
            self.marks(ax, [px0 + box[0] * k, px0 + box[1] * k, py0 + box[2] * k, py0 + box[3] * k], None, p1, r=20, pos=pos)
            self._card_head(ax, tx, top, letter, name, subs)
            if below:
                draw_table(self, ax, MARGIN, top + max(panel_h, head) + 22, table)
            else:
                draw_table(self, ax, tx, top + head, table)
            ax.plot([MARGIN, W - MARGIN], [y0 + H - 6, y0 + H - 6], color=LINE, lw=2)
        self._add(H, fn)

    def cards(self, entries, ncol=2):
        """사진 없는 카드를 여러 열로 — 바탕 그림이 커넥터 모양을 못 보여 줄 때(예: 위에서 본 X-ray 개념 배치).
        entries = [(글자, 이름, 부제, 표)]. 한 줄 높이 = 그 줄에서 가장 큰 카드."""
        colw = (W - 2 * MARGIN - 40 * (ncol - 1)) / ncol
        for i in range(0, len(entries), ncol):
            row = [(lt, nm, wrap(sb, PX["sub"], colw) if sb else [], tb) for lt, nm, sb, tb in entries[i:i + ncol]]
            for _, nm, _, tb in row:
                if table_size(tb)[0] > colw:
                    raise ValueError("표가 열 폭보다 넓다: %s" % nm)
            H = 22 + max(60 + 42 * len(sb) + 16 + table_size(tb)[1] for _, _, sb, tb in row) + 30

            def fn(ax, y0, row=row, H=H):
                for j, (lt, nm, sb, tb) in enumerate(row):
                    x = MARGIN + j * (colw + 40)
                    self._card_head(ax, x, y0 + 22, lt, nm, sb)
                    draw_table(self, ax, x, y0 + 22 + 60 + 42 * len(sb) + 16, tb)
                ax.plot([MARGIN, W - MARGIN], [y0 + H - 6, y0 + H - 6], color=LINE, lw=2)
            self._add(H, fn)

    def grid_card(self, crop, cols, rows_y, letter, name, sub, rows, k=1.0):
        """핀이 격자로 선 헤더(예: PWM 3 × 16) — 확대 그림 바로 아래에 **핀 열에 맞춘** 표.
        cols = 핀 열 x(그림 px, 왼 → 오), rows_y = 핀 줄 y(그림 px, 위 → 아래), rows = [(줄 이름, 색, [칸 글자 …])] 같은 위 → 아래."""
        ch, cw = crop.shape[:2]
        pitch = (cols[-1] - cols[0]) / (len(cols) - 1) * k
        ix0 = W / 2 + G_LAB_W / 2 - (cols[0] + cols[-1]) / 2 * k
        subs = wrap(sub, PX["sub"], W - 2 * MARGIN) if sub else []
        head = 60 + 42 * len(subs) + 20
        H = 22 + head + ch * k + 18 + G_ROW_H * len(rows) + 34

        def fn(ax, y0):
            top = y0 + 22
            self._card_head(ax, MARGIN, top, letter, name, subs)
            iy0 = top + head
            ax.imshow(crop, extent=[ix0, ix0 + cw * k, iy0 + ch * k, iy0], zorder=1, interpolation="lanczos")
            lx = ix0 + cols[0] * k - pitch / 2 - G_LAB_W
            for (rl, col, _), ry in zip(rows, rows_y):             # 그림 속 핀 줄 옆에 줄 이름
                self.text(ax, lx + G_LAB_W / 2, iy0 + ry * k, rl, sig_px(rl), ha="center", va="center", color=col, fontweight="bold")
            ty = iy0 + ch * k + 18
            for i, (rl, col, vals) in enumerate(rows):
                yy = ty + i * G_ROW_H
                ax.add_patch(Rectangle((lx, yy), G_LAB_W, G_ROW_H, fc="#e9edf2", ec=INK, lw=1.6, zorder=5))
                self.text(ax, lx + G_LAB_W / 2, yy + G_ROW_H / 2, rl, sig_px(rl), ha="center", va="center", color=col,
                          fontweight="bold", zorder=6)
                for c, v in zip(cols, vals):
                    xx = ix0 + c * k - pitch / 2
                    ax.add_patch(Rectangle((xx, yy), pitch, G_ROW_H, fc="white", ec=INK, lw=1.6, zorder=5))
                    self.text(ax, xx + pitch / 2, yy + G_ROW_H / 2, v, sig_px(v) if len(v) < 3 else PX["pin"] + 2,
                              ha="center", va="center", color=col, fontweight="bold", zorder=6)
            ax.plot([MARGIN, W - MARGIN], [y0 + H - 6, y0 + H - 6], color=LINE, lw=2)
        self._add(H, fn)

    def note(self, lines):
        ls = [s for ln in lines for s in wrap(ln, PX["small"], W - 2 * MARGIN)]

        def fn(ax, y0):
            for i, s in enumerate(ls):
                self.text(ax, MARGIN, y0 + 26 + i * 40, s, PX["small"], ha="left", va="center", color="#333333")
        self._add(20 + 40 * len(ls), fn)

    def board(self, img, items, img_w=None, gap=34, lead=60, rowgap=26, badge_r=18):
        """원래 배치 한 덩어리: 제품 그림(가운데) + 둘레 표(위 T · 아래 B · 왼쪽 L · 오른쪽 R) + 파란 점선 연결선 + 빨간 ①.
        items = [{"box": (x0, x1, y0, y1) 그림 px, "name", "sub", "table", "p1", "side": "T"|"B"|"L"|"R",
                  "row": 그림에 가까운 줄부터 1, 2, …(T · B), "tx": 표 가운데 x(캔버스 px, 없으면 커넥터 위), "pos": ① 자리(marks),
                  "lx": 연결선을 곧게 내릴 x(그림 px — 아래 줄 커넥터 사이 틈, B 만)}]
        img_w 가 없으면 = 캔버스 폭에서 왼쪽 · 오른쪽 표 열을 뺀 폭. 표 칸 순서 = 그림에서 보이는 핀 순서(부르는 쪽이 정한다)."""
        ih0, iw0 = img.shape[:2]
        size = [ctable_size(it["name"], it.get("sub"), it.get("table")) for it in items]
        wl = max([sz[0] for sz, it in zip(size, items) if it["side"] == "L"], default=0)
        wr = max([sz[0] for sz, it in zip(size, items) if it["side"] == "R"], default=0)
        avail = W - 2 * MARGIN - (wl + gap if wl else 0) - (wr + gap if wr else 0)
        img_w = min(img_w or avail, avail)
        k = img_w / iw0
        ih = ih0 * k
        ix0 = MARGIN + (wl + gap if wl else 0) + (avail - img_w) / 2
        cx = [ix0 + (it["box"][0] + it["box"][1]) / 2 * k for it in items]

        def rows(side):
            rs = sorted({it.get("row", 1) for it in items if it["side"] == side})
            out = []
            for r in rs:
                idx = sorted([i for i, it in enumerate(items) if it["side"] == side and it.get("row", 1) == r],
                             key=lambda i: items[i].get("tx", cx[i]))
                st = spread1d([items[i].get("tx", cx[i]) for i in idx], [size[i][0] for i in idx], MARGIN, W - MARGIN, 24)
                out.append((idx, st, max(size[i][1] for i in idx)))
            return out
        top, bot = rows("T"), rows("B")
        iy0 = (sum(rh for _, _, rh in top) + rowgap * (len(top) - 1) + lead) if top else 16
        pos = {}
        yb = iy0 - lead
        for idx, st, rh in top:                                              # 위 줄: 안쪽 줄부터 위로, 표 아래 끝을 맞춘다
            for i, x in zip(idx, st):
                pos[i] = (x, yb - size[i][1])
            yb -= rh + rowgap
        cy = [iy0 + (it["box"][2] + it["box"][3]) / 2 * k for it in items]
        bottom, cols = iy0 + ih, []
        for side in ("L", "R"):                                              # 옆 열: 표 몸통 가운데를 커넥터 높이에
            idx = sorted([i for i, it in enumerate(items) if it["side"] == side], key=lambda i: cy[i])
            if not idx:
                continue
            st = spread1d([cy[i] - C_HEAD - size[i][3] / 2 + size[i][1] / 2 for i in idx], [size[i][1] for i in idx],
                          iy0 if top else 0, 1e9, 22)
            for i, y in zip(idx, st):
                pos[i] = (ix0 - gap - size[i][0] if side == "L" else ix0 + img_w + gap, y)
                cols.append((pos[i][0], pos[i][0] + size[i][0], y + size[i][1]))
                bottom = max(bottom, y + size[i][1])
        yt = iy0 + ih + lead
        for idx, st, rh in bot:                                              # 아래 줄: 안쪽 줄부터 아래로, 표 위 끝을 맞춘다
            for x0_, x1_, cb in cols:                                        # 옆 열 표와 겹치면 그 아래로
                if cb > yt and any(x < x1_ and x + size[i][0] > x0_ for i, x in zip(idx, st)):
                    yt = cb + rowgap
            for i, x in zip(idx, st):
                pos[i] = (x, yt)
            bottom = max(bottom, yt + rh)
            yt += rh + rowgap
        H = bottom + 34
        for it in items:                                                     # 핀 잠금 대조용 기록(PINOUT_PINS_JSON)
            self.tables.append({"name": it["name"], "table": _plain(it.get("table"))})

        def fn(ax, y0):
            ax.imshow(img, extent=[ix0, ix0 + img_w, y0 + iy0 + ih, y0 + iy0], zorder=1, interpolation="lanczos")
            for i, it in enumerate(items):
                b = it["box"]
                bx = (ix0 + b[0] * k, ix0 + b[1] * k, y0 + iy0 + b[2] * k, y0 + iy0 + b[3] * k)
                self.marks(ax, bx, None, it.get("p1"), r=badge_r, pos=it.get("pos", "inside"))
                x, y = pos[i][0], y0 + pos[i][1]
                w, h, bw, bh = size[i]
                bcx, bcy = (bx[0] + bx[1]) / 2, (bx[2] + bx[3]) / 2
                if it["side"] == "B" and "lx" in it:                             # 커넥터 사이 틈으로 곧게 내린 뒤 표로(원래 그림의 GPS & SAFETY)
                    gx = ix0 + it["lx"] * k
                    pts = [(gx, bx[3] + 2), (gx, y - 22), (x + w / 2, y - 22), (x + w / 2, y)]
                elif it["side"] == "T":
                    pts = [(bcx, bx[2] - 9), (x + w / 2, y + h)]
                elif it["side"] == "B":
                    pts = [(bcx, bx[3] + 9), (x + w / 2, y)]
                else:
                    ay = y + C_HEAD + bh / 2 if bh else y + C_HEAD / 2
                    ex = x + w if it["side"] == "L" else x
                    d = 16 if it["side"] == "L" else -16
                    pts = [(ex, ay), (ex + d, ay), (bx[0] - 9 if it["side"] == "L" else bx[1] + 9, bcy)]
                ax.plot([q[0] for q in pts], [q[1] for q in pts], color=BLUE, lw=2.4, ls=(0, (6, 4)), zorder=11)
                draw_ctable(self, ax, x, y, it["name"], it.get("sub"), it.get("table"))
            ax.plot([MARGIN, W - MARGIN], [y0 + H - 8, y0 + H - 8], color=LINE, lw=2)
        self._add(H, fn)

    def save(self, out):
        H = int(self.y + MARGIN)
        fig = plt.figure(figsize=(W / DPI, H / DPI), dpi=DPI)
        ax = fig.add_axes([0, 0, 1, 1])
        ax.set_xlim(0, W)
        ax.set_ylim(H, 0)
        ax.axis("off")
        for y0, fn in self.ops:
            fn(ax, y0)
        fig.savefig(out, dpi=DPI, facecolor="white")
        plt.close(fig)
        if os.environ.get("PINOUT_PINS_JSON"):                               # 핀 잠금 대조: 이 그림이 그린 표 전부
            with open(os.environ["PINOUT_PINS_JSON"], "w", encoding="utf-8") as fp:
                json.dump({"file": os.path.basename(out), "tables": self.tables}, fp, ensure_ascii=False, indent=1)
        smallest = min(self.texts, key=lambda t: t[1])
        rep = {"file": os.path.basename(out), "canvas_px": [W, H], "shown_px": [PAGE_PX, round(H * SCALE)],
               "texts": len(self.texts), "min_font_canvas_px": smallest[1], "min_font_screen_px": round(smallest[1] * SCALE, 1),
               "smallest_text": smallest[0], "rule_screen_px": MIN_SCREEN_PX}
        return rep


# ────────────── 원래 배치(제품 그림 가운데 + 둘레 표 + 점선 연결선)의 표 ──────────────
# 사용자 2026-09-30 "제품으로 해서 한페이지로 하고 원래 레이아웃에 포트설명 글자만 키우면되지 왜 전부 다 쪼개났냐"
#   → 제품마다 한 장, 원래 배치 그대로 표 글자만 키운다(화면 13 px 이상 — Sheet.text 가 막는다). 지도 + 카드(map · card)는 쓰지 않는다.
CX = dict(name=30, sub=26, sig=28, pin=26)            # 둘레 표 글자(캔버스 px, 화면 = ½)
C_MIN, C_PAD, C_PIN_H, C_SIG_H, C_ROW_H, C_PIN_W, C_LAB_W, C_HEAD = 60, 20, 36, 50, 46, 54, 64, 76


def csig_px(lab):
    """신호 칸 글자 — + · − 한 글자는 획이 가늘어 키운다."""
    return CX["sig"] + 8 if lab in ("+", "−") else CX["sig"]


def _cw(lab):
    return max(C_MIN, text_w(lab, csig_px(lab), True) + C_PAD)


def _crows_w(rows):
    return [max(_cw(r[j][1]) for r in rows if j < len(r)) for j in range(max(len(r) for r in rows))]


def _cgrid_w(table):
    return max([52] + [text_w(v, csig_px(v) if len(v) < 3 else CX["pin"], True) + 14 for _, _, vals in table[2] for v in vals])


def ctable_size(name, sub, table):
    """둘레 표 크기 → (폭, 높이, 몸통 폭, 몸통 높이). 머리 상자(이름 · 부제)가 몸통보다 넓으면 칸을 늘려 맞춘다.
    table = ("h", cells) 가로 | ("v", cells) 세로 | ("rows", [cells, …]) 패드 묶음 | ("grid", 열 이름, [(줄 이름, 색, 칸 …)]) | ("one", 글자, 색) | None(머리만)"""
    hw = max(text_w(name, CX["name"], True), text_w(sub, CX["sub"]) if sub else 0) + 32
    kind = table[0] if table else None
    if kind == "h":
        bw, bh = sum(_cw(c[1]) for c in table[1]), (C_PIN_H if _numbered(table[1]) else 0) + C_SIG_H
    elif kind == "v":
        bw, bh = (C_PIN_W if _numbered(table[1]) else 0) + max([110] + [_cw(c[1]) for c in table[1]]), C_ROW_H * len(table[1])
    elif kind == "rows":
        bw, bh = sum(_crows_w(table[1])), C_SIG_H * len(table[1])
    elif kind == "grid":
        bw, bh = C_LAB_W + _cgrid_w(table) * len(table[1]), C_SIG_H * len(table[2])
    elif kind == "one":
        bw, bh = max(150, text_w(table[1], CX["sig"], True) + 40), C_SIG_H
    else:
        bw, bh = 0, 0
    return max(hw, bw), C_HEAD + bh, bw, bh


def draw_ctable(sh, ax, x, y, name, sub, table):
    """원래 모양 표: 둥근 머리 상자(이름 굵게 · 부제) 아래 칸 — 번호 줄(1 번 = 빨간 굵은 숫자 + 빨간 밑줄) · 신호 줄."""
    w, h, bw, bh = ctable_size(name, sub, table)
    ax.add_patch(FancyBboxPatch((x, y), w, C_HEAD, boxstyle="round,pad=0,rounding_size=10", fc="white", ec=INK, lw=2, zorder=12))
    sh.text(ax, x + w / 2, y + (25 if sub else C_HEAD / 2), name, CX["name"], ha="center", va="center", fontweight="bold", zorder=13)
    if sub:
        sh.text(ax, x + w / 2, y + 57, sub, CX["sub"], ha="center", va="center", color=GREY, zorder=13)
    kind = table[0] if table else None
    y0, f = y + C_HEAD, (w / bw if bw else 1.0)

    def cell(cx, cy, cw, ch, fc="white"):
        ax.add_patch(Rectangle((cx, cy), cw, ch, fc=fc, ec=INK, lw=1.6, zorder=12))

    def pin_txt(cx, cy, pin):
        one = pin == "1"
        sh.text(ax, cx, cy, pin, CX["pin"] + (4 if one else 0), ha="center", va="center", color=RED if one else GREY,
                fontweight="bold" if one else "normal", zorder=13)

    def sig_txt(cx, cy, lab, col, px=None):
        sh.text(ax, cx, cy, lab, px or csig_px(lab), ha="center", va="center", color=col, fontweight="bold", zorder=13)
    if kind == "h":
        ph = C_PIN_H if _numbered(table[1]) else 0
        cx = x
        for pin, lab, col in table[1]:
            cw = _cw(lab) * f
            if ph:
                cell(cx, y0, cw, ph, "#eef1f5")
                if pin:
                    pin_txt(cx + cw / 2, y0 + ph / 2 + 1, pin)
            cell(cx, y0 + ph, cw, C_SIG_H)
            if pin == "1":
                ax.add_patch(Rectangle((cx + 1.5, y0 + ph + C_SIG_H - 7), cw - 3, 7, fc=RED, ec="none", zorder=13))
            sig_txt(cx + cw / 2, y0 + ph + C_SIG_H / 2 - 1, lab, col)
            cx += cw
    elif kind == "v":
        pw = C_PIN_W if _numbered(table[1]) else 0
        for i, (pin, lab, col) in enumerate(table[1]):
            yy = y0 + i * C_ROW_H
            if pw:
                cell(x, yy, pw, C_ROW_H, "#eef1f5")
                if pin:
                    pin_txt(x + pw / 2, yy + C_ROW_H / 2 + 1, pin)
            cell(x + pw, yy, w - pw, C_ROW_H)
            if pin == "1":
                ax.add_patch(Rectangle((x + pw + 1.5, yy + 1.5), 7, C_ROW_H - 3, fc=RED, ec="none", zorder=13))
            sig_txt(x + pw + (w - pw) / 2, yy + C_ROW_H / 2, lab, col)
    elif kind == "rows":
        ws = [v * f for v in _crows_w(table[1])]
        for i, row in enumerate(table[1]):
            cx = x
            for (pin, lab, col), cw in zip(row, ws):
                cell(cx, y0 + i * C_SIG_H, cw, C_SIG_H)
                sig_txt(cx + cw / 2, y0 + i * C_SIG_H + C_SIG_H / 2 - 1, lab, col)
                cx += cw
    elif kind == "grid":
        cols, rws = table[1], table[2]
        gw = (w - C_LAB_W) / len(cols)
        for i, (rl, col, vals) in enumerate(rws):
            yy = y0 + i * C_SIG_H
            cell(x, yy, C_LAB_W, C_SIG_H, "#eef1f5")
            sig_txt(x + C_LAB_W / 2, yy + C_SIG_H / 2 - 1, rl, col)
            for j, v in enumerate(vals):
                cell(x + C_LAB_W + j * gw, yy, gw, C_SIG_H)
                sig_txt(x + C_LAB_W + j * gw + gw / 2, yy + C_SIG_H / 2 - 1, v, col, csig_px(v) if len(v) < 3 else CX["pin"])
    elif kind == "one":
        cell(x, y0, w, C_SIG_H)
        sig_txt(x + w / 2, y0 + C_SIG_H / 2 - 1, table[1], table[2], CX["sig"])
    return w, h


def _plain(table):
    """표 → 기록용(글자만): h/v = [(번호, 글자)], rows = [[글자 …]], grid = {열 이름, 줄}, one = 글자."""
    if not table:
        return None
    k = table[0]
    if k in ("h", "v"):
        return {"kind": k, "cells": [[c[0], c[1]] for c in table[1]]}
    if k == "rows":
        return {"kind": k, "rows": [[c[1] for c in r] for r in table[1]]}
    if k == "grid":
        return {"kind": k, "cols": list(table[1]), "rows": [[r[0], list(r[2])] for r in table[2]]}
    return {"kind": k, "text": table[1]}


def spread1d(targets, sizes, lo, hi, gap):
    """가운데 목표 → 겹치지 않는 시작 위치(순서 유지). 범위를 넘치면 끝에서부터 당긴다, 그래도 안 들어가면 오류(배치를 고쳐야 한다)."""
    st = []
    for i, (t, z) in enumerate(zip(targets, sizes)):
        st.append(max(t - z / 2, lo if i == 0 else st[-1] + sizes[i - 1] + gap))
    if st and st[-1] + sizes[-1] > hi:
        st[-1] = hi - sizes[-1]
        for i in range(len(st) - 2, -1, -1):
            st[i] = min(st[i], st[i + 1] - gap - sizes[i])
    if st and st[0] < lo - 0.5:
        raise ValueError("표가 한 줄에 안 들어간다: 폭 합 %.0f > %.0f" % (sum(sizes) + gap * (len(sizes) - 1), hi - lo))
    return st

