# -*- coding: utf-8 -*-
"""AF-F7 nano 핀아웃 한 장 — 윗면 3D 렌더 + 커넥터 표, 아랫면 3D 렌더 + 땜 패드 표 (AF-H7 nano V2 와 같은 꼴).

2026-11-24 이사님(AF-F7_nano 채팅 → 인계) "렌더되고, 핀아웃, 등등 문제 없으면 … 카탈로그에 자료 올리라고 해".
근거(정본 = fc/AF-F7_nano 저장소(옛 이름 AF-F7222)의 판 파일 hardware/kicad/aff7nano/aff7nano_placed.kicad_pcb, 2026-11-24):
  커넥터 J2~J7 · 패드 줄 P1~P9 · 점퍼 JP1 · 버튼 SW1 의 판 mm 상자 = 그 판의 패드 바깥 끝 · 핀 1 끝 = 1 번 패드 자리.
  핀 신호 = 이 저장소 src/content/fc/AF-F7-nano.md 의 pinTable(여기서는 읽기만) — 판 패드 넷과 6 개 커넥터 모두 같음을 확인.
  패드 글자 = fc/AF-F7_nano/hardware/tools/padrows.py(아랫면 실크 정본, 윗면 기준 차례 → 아랫면 사진은 가로 줄만 좌우가 뒤집힘).
바탕 = public/images/products/fc_AF-F7-nano_{top,bottom}.png (catalog-render 스킬 HP 렌더 1600 × 1200, 정면 직교).
  mm → px: 판 테두리 = 234…1365 · 34…1165 px(board_bbox.py) ↔ 판 100…137 · 100…137 mm(Edge.Cuts) = 30.568 px/mm,
  그림은 x 180…1420 만 잘라 쓴다(CROP). 아랫면은 좌우가 거울(x px = 1365 − …).
실행: python f7_nano_pinout.py [출력 폴더]   → fc_AF-F7-nano_pinout.png
"""
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from pinout_style import INK, RED, Sheet, load_rgb, pin_table, region, subtitle, word_color  # noqa: E402

CAT = os.path.normpath(os.path.join(HERE, "..", ".."))
IMG = os.path.join(CAT, "public", "images", "products")
MD = os.path.join(CAT, "src", "content", "fc", "AF-F7-nano.md")
OUT = sys.argv[1] if len(sys.argv) > 1 else IMG
CROP = (180, 1420, 0, 1200)
S, X0, Y0, PX0, PY0, PX1 = 1131 / 37, 100.0, 100.0, 234 - CROP[0], 34, 1365 - CROP[0]


def box(x0, y0, x1, y1, bottom=False):
    """판 mm 상자 → 렌더 px (x0, x1, y0, y1)."""
    a, b = (PX1 - (x1 - X0) * S, PX1 - (x0 - X0) * S) if bottom else (PX0 + (x0 - X0) * S, PX0 + (x1 - X0) * S)
    return (round(a), round(b), round(PY0 + (y0 - Y0) * S), round(PY0 + (y1 - Y0) * S))


def word(sig):
    return "−" if sig in ("GND", "GD", "G") else sig


def color(w):
    """패드 글자 색 — VIN(배터리) · JMP(VTX 전원 점퍼 출력)도 전원 빨강, GD · G 는 GND."""
    return RED if w in ("VIN", "JMP") else INK if w == "−" else word_color(w)


def table(entry, order, kind):
    """md pinTable 한 커넥터 → 표(kind 'h' 왼 → 오 · 'v' 위 → 아래, order = 사진에서 보이는 핀 번호 순서)."""
    sig = dict(entry["pins"])
    return (kind, [(str(p), word(sig[str(p)]), color(word(sig[str(p)]))) for p in order])


def words(s, kind):
    return (kind, [("", word(w), color(word(w))) for w in s.split()])


# 윗면 커넥터: (pinTable 이름, 판 mm 상자, 표 방향, 사진에서 보이는 핀 순서, 1 번 끝, 표 자리)
TOP = [
    ("ESC", (109.0, 103.33, 120.4, 108.88), "h", range(8, 0, -1), "R", "T"),
    ("GPS", (128.12, 105.9, 133.67, 115.3), "v", range(6, 0, -1), "B", "R"),
    ("Receiver", (128.12, 123.6, 133.67, 131.0), "v", range(4, 0, -1), "B", "R"),
    ("Camera", (103.33, 118.7, 108.88, 127.1), "v", range(1, 6), "T", "L"),
    ("Analog VTX", (106.8, 128.12, 115.2, 133.67), "h", range(1, 6), "L", "B"),
    ("HD VTX", (117.3, 128.12, 126.7, 133.67), "h", range(1, 7), "L", "B"),
]
# 아랫면 땜 패드(사진 = 아래에서 본 모습, 좌우 거울): (이름, 부제, 판 mm 상자, 표, 표 자리)
PADS = [
    ("ESC pads", "same M1–M4 as the ESC port (E1 = M1)", (105.6, 100.55, 121.4, 102.35), words("VIN GD AC R5 E1 E2 E3 E4", "h"), "T"),
    ("GPS pads", "UART3 · I2C1", (134.65, 105.7, 136.45, 115.5), words("SCL SDA T3 R3 GND", "v"), "L"),
    ("Extra pads", "current · motors 5–6 · buzzer −", (134.65, 115.7, 136.45, 123.5), words("AC E5 E6 BEEP", "v"), "L"),
    ("Receiver pads", "UART1", (134.65, 123.7, 136.45, 131.5), words("T1 R1 GND 5V", "v"), "L"),
    ("Buzzer power", "5 V for the buzzer +", (130.8, 116.3, 132.6, 120.1), words("5V GND", "v"), "L"),
    ("HD VTX pads", "UART4 · SBUS on R6", (116.1, 134.65, 127.9, 136.45), words("R6 G R4 T4 G 10V", "h"), "B"),
    ("Analog VTX pads", "UART2 · video out · JMP = spare VTX power", (106.1, 134.65, 115.9, 136.45),
     words("T2 R2 VO JMP 10V", "h"), "B"),
    ("Camera pads", "video in · camera control", (100.55, 121.7, 102.35, 131.5), words("5V GND VI CC GND", "v"), "R"),
    ("LED strip", "WS2812", (100.55, 118.7, 102.35, 120.5), words("LED", "v"), "R"),
]
# 아랫면 점퍼(JP1 · 1 = 10V · 2 = JMP 패드 · 3 = 배터리): 한 쌍만 잇는다
OPT = [
    ("JMP power jumper", "bridge 1–2 = 10 V · 2–3 = battery · never all three", (123.75, 114.45, 125.25, 118.55),
     (("v", [("1", "10V", RED), ("2", "JMP", RED), ("3", "VBAT", RED)])), "L"),
]


def main():
    pins = pin_table(MD)
    top = load_rgb(os.path.join(IMG, "fc_AF-F7-nano_top.png"))
    bot = load_rgb(os.path.join(IMG, "fc_AF-F7-nano_bottom.png"))
    sh = Sheet()
    sh.header("AF-F7 nano Pinout",
              "Each table lists the pins as you see them in the picture: left → right, side connectors top → bottom.",
              [("1", RED), "= pin 1, the red 1 in its table", "red = power    − = GND    blue = signal"])
    sh.caption("Top — connectors (all JST-SH 1.0 mm, pin 1 marked) · the A of the ALUX logo points forward")
    items = [{"box": box(*b), "name": n, "sub": subtitle(pins[n]), "table": table(pins[n], o, k), "p1": p1, "side": sd}
             for n, b, k, o, p1, sd in TOP]
    items.append({"box": box(101.7, 106.38, 107.93, 117.12), "name": "USB-C", "sub": "firmware · power", "table": None, "p1": None,
                  "side": "L"})
    items.append({"box": box(120.9, 106.5, 126.0, 108.2), "name": "BOOT", "sub": "hold while plugging USB = DFU", "table": None,
                  "p1": None, "side": "T"})
    sh.board(region(top, *CROP), items, img_w=760)
    sh.caption("Bottom — solder pads (seen from below, so left and right are swapped)")
    sh.board(region(bot, *CROP),
             [{"box": box(*b, bottom=True), "name": n, "sub": s, "table": t, "p1": None, "side": sd} for n, s, b, t, sd in PADS],
             img_w=700)
    sh.caption("Bottom — JMP power jumper (seen from below)")
    sh.board(region(bot, *CROP),
             [{"box": box(*b, bottom=True), "name": n, "sub": s, "table": t, "p1": None, "side": sd} for n, s, b, t, sd in OPT],
             img_w=700)
    sh.note(["5V on the GPS and Receiver ports and pads is the USB-or-battery rail: it is on with USB alone.",
             "The camera 5V, the buzzer 5V pad and every 10V pin come only from the battery.",
             "JMP: bridge only one pair of the jumper. All three pads together put the battery voltage on the 10 V rail",
             "and damage the 10 V output and the video transmitters on it.",
             "M1–M4 = Betaflight motors 1–4 (pads E1–E4), E5 · E6 = motors 5–6."])
    out = os.path.join(OUT, "fc_AF-F7-nano_pinout.png")
    rep = sh.save(out)
    print(out, rep["shown_px"], "min font on screen %.1f px (%r)" % (rep["min_font_screen_px"], rep["smallest_text"]))


if __name__ == "__main__":
    main()
