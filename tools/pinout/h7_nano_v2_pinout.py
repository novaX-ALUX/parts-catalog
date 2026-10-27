# -*- coding: utf-8 -*-
"""AF-H7 nano V2 핀아웃 한 장 — 윗면 3D 렌더 + 커넥터 표, 아랫면 3D 렌더 + 땜 패드 표 (AF-F4 nano v2 와 같은 배치).

이사님 2026-10-24 #oa01b41c3 "깃에 v2 넣어서 커밍순으로 하고 이런 핀아웃까지 제대로 만들어" (보기 = AF-F4 nano v2 핀아웃).
근거(V2 회로 정본 = fc/AF-H7-nano-V2 저장소, v0.0.12):
  커넥터 = hardware/kicad/AFH7NANO/AFH7NANO_V2.kicad_pcb 의 부품 자리(mm) · 핀 신호 = 이 저장소 src/content/fc/AF-H7-nano-V2.md 의
  pinTable(정본 — 여기서는 읽기만) · 핀 1 끝 = 같은 판의 1 번 패드 자리.
  땜 패드(아랫면, 1.5 × 2.0 mm) = 같은 판의 번호 없는 협력사 패드와 그 넷 · 인쇄 글자는 협력사 실크 그대로(사진에 보임).
바탕 = public/images/products/fc_AF-H7-nano-V2_{top,bottom}.png (카탈로그 렌더 1600 × 1200, 정면 직교 — 2026-10-27 이사님 #o2ac037c4
  "이 사진들도 같이 렌더링해서 일관성 맞추라고" → 제품 사진과 같은 검은 판 렌더).
  mm → px: 검은 판 테두리 = 234…1365 · 34…1165 px ↔ 판 129.226…167.776 · 85.729…124.279 mm (29.339 px/mm), 그림은 x 180…1420 만
  잘라 쓴다(CROP). 아랫면은 좌우가 거울(x px = 1365 − …), 판 자리는 윗면과 같다.
실행: python h7_nano_v2_pinout.py [출력 폴더]   → fc_AF-H7-nano-V2_pinout.png
"""
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from pinout_style import RED, Sheet, load_rgb, pin_table, region, subtitle, word_color  # noqa: E402

CAT = os.path.normpath(os.path.join(HERE, "..", ".."))
IMG = os.path.join(CAT, "public", "images", "products")
MD = os.path.join(CAT, "src", "content", "fc", "AF-H7-nano-V2.md")
OUT = sys.argv[1] if len(sys.argv) > 1 else IMG
CROP = (180, 1420, 0, 1200)
S, X0, Y0, PX0, PY0, PX1 = 29.339, 129.226, 85.729, 234 - CROP[0], 34, 1365 - CROP[0]


def box(x0, y0, x1, y1, bottom=False):
    """판 mm 상자 → 렌더 px (x0, x1, y0, y1)."""
    a, b = (PX1 - (x1 - X0) * S, PX1 - (x0 - X0) * S) if bottom else (PX0 + (x0 - X0) * S, PX0 + (x1 - X0) * S)
    return (round(a), round(b), round(PY0 + (y0 - Y0) * S), round(PY0 + (y1 - Y0) * S))


def word(sig):
    return "−" if sig == "GND" else sig


def table(entry, order, kind):
    """md pinTable 한 커넥터 → 표(kind 'h' 왼 → 오 · 'v' 위 → 아래, order = 사진에서 보이는 핀 번호 순서)."""
    sig = dict(entry["pins"])
    return (kind, [(str(p), word(sig[str(p)]), word_color(word(sig[str(p)]))) for p in order])


def words(s, kind):
    return (kind, [("", w, word_color(w)) for w in s.split()])


# 윗면 커넥터: (pinTable 이름, 판 mm 상자, 표 방향, 사진에서 보이는 핀 순서, 1 번 끝, 표 자리)
TOP = [
    ("ESC", (161.04, 92.18, 167.65, 106.03), "v", range(10, 0, -1), "B", "R"),
    ("OpenIPC", (161.81, 106.14, 167.64, 117.15), "v", range(6, 0, -1), "B", "R"),
    ("SWD", (133.86, 94.84, 138.09, 96.04), "h", range(1, 5), "L", "L"),
    ("RC", (129.54, 97.08, 135.04, 103.68), "v", range(1, 5), "T", "L"),
    ("GPS", (129.33, 107.39, 135.94, 117.24), "v", range(1, 7), "T", "L"),
    ("VTX", (147.35, 86.51, 153.95, 92.01), "h", range(4, 0, -1), "R", "T"),
    ("CAMERA", (154.33, 86.51, 159.93, 92.01), "h", range(3, 0, -1), "R", "T"),
    ("CAN", (137.36, 118.38, 146.17, 123.77), "h", range(1, 5), "L", "B"),
    ("DJI O3", (150.65, 118.36, 159.26, 123.86), "h", range(1, 7), "L", "B"),
]
# 아랫면 선택 · 생산 패드(V2 · 박재량 TM8a3d4469 #13~15): 점퍼는 가운데 = 나가는 쪽, 5V/12V 쪽이 구리로 이어져 있다(끊고 반대쪽 납땜)
OPT = [
    ("Camera power", "jumper JP1 · cut 5V side, bridge VBAT", (149.77, 89.73, 152.6, 94.39), words("VBAT CAM 5V", "v"), "T"),
    ("Buzzer + supply", "jumper JP3 · cut 5V side, bridge 12V", (141.14, 90.28, 143.97, 94.92), words("12V BZ+ 5V", "v"), "T"),
    ("BZ+ pad", "BZ− = the edge pad", (131.41, 92.66, 133.96, 95.2), words("BZ+", "h"), "R"),
    ("Flashing jig pads", "D1.0 mm · 2.54 mm · BOOT0 to 3V3 = USB DFU", (137.07, 117.97, 151.82, 120.03),
     words("3V3 BOOT0 − D− D+ VBUS", "h"), "B"),
]
# 아랫면 땜 패드(사진 = 아래에서 본 모습, 좌우 거울): (이름, 부제, 판 mm 상자, 표, 표 자리)
PADS = [
    ("PWM pads", "outer column · silk S5–S10", (165.39, 94.63, 166.89, 115.98), words("S5 S6 S7 S8 S9 S10 5V −", "v"), "L"),
    ("ESC pads", "inner column · same M1–M4 as the ESC port", (161.33, 94.63, 162.83, 115.86),
     words("M1 M2 M3 M4 − VBAT RX4 TX4", "v"), "L"),
    ("Edge pads", "SPI3 · UART3 · buzzer", (129.83, 94.63, 131.33, 115.86), words("BZ− SCK MISO MOSI CS2 CS1 RX3 TX3", "v"), "R"),
    ("Top pads", "UART1 · WS2812 LED · I2C2", (138.6, 86.42, 160.54, 88.42), words("5V SCL2 SDA2 − LED 5V − RX1 TX1", "h"), "T"),
    ("Bottom pads", "UART2 · UART8 · CAN1 · 12 V", (137.45, 121.63, 159.12, 123.63), words("RX2 TX2 12V RX8 TX8 5V CANL CANH −", "h"),
     "B"),
]


def main():
    pins = pin_table(MD)
    top = load_rgb(os.path.join(IMG, "fc_AF-H7-nano-V2_top.png"))
    bot = load_rgb(os.path.join(IMG, "fc_AF-H7-nano-V2_bottom.png"))
    sh = Sheet()
    sh.header("AF-H7 nano V2 Pinout",
              "Each table lists the pins as you see them in the picture: left → right, side connectors top → bottom.",
              [("1", RED), "= pin 1, the red 1 in its table", "red = power    − = GND    blue = signal"])
    sh.caption("Top — connectors (all JST, pin 1 marked)")
    items = [{"box": box(*b), "name": n, "sub": subtitle(pins[n]), "table": table(pins[n], o, k), "p1": p1, "side": sd}
             for n, b, k, o, p1, sd in TOP]
    items.append({"box": box(136.81, 85.82, 146.45, 94.0), "name": "USB-C", "sub": "firmware · power", "table": None, "p1": None,
                  "side": "T"})
    items.append({"box": box(155.88, 92.08, 158.71, 96.73), "name": "VTX power", "sub": "jumper JP2 · cut 12V side, bridge VBAT",
                  "table": words("VBAT VTX 12V", "v"), "p1": None, "side": "R"})
    sh.board(region(top, *CROP), items, img_w=760)
    sh.caption("Bottom — solder pads (seen from below, so left and right are swapped)")
    sh.board(region(bot, *CROP),
             [{"box": box(*b, bottom=True), "name": n, "sub": s, "table": t, "p1": None, "side": sd} for n, s, b, t, sd in PADS],
             img_w=700)
    sh.caption("Bottom — option and production pads (seen from below)")
    sh.board(region(bot, *CROP),
             [{"box": box(*b, bottom=True), "name": n, "sub": s, "table": t, "p1": None, "side": sd} for n, s, b, t, sd in OPT],
             img_w=700)
    sh.note(["5V on GPS, RC, CAN, the top pads and the PWM-column pad is the USB-or-battery rail: it is on with USB alone.",
             "The camera 5V and the bottom-pad 5V are the battery 5 V regulator. 12 V and VBAT come only from the battery.",
             "UART4 goes to both DJI O3 and OpenIPC (and the RX4/TX4 pads) — use one of them.",
             "M1–M4 = Betaflight motors 1–4 (1 rear right · 2 front right · 3 rear left · 4 front left), ArduPilot FRAME_TYPE 12."])
    out = os.path.join(OUT, "fc_AF-H7-nano-V2_pinout.png")
    rep = sh.save(out)
    print(out, rep["shown_px"], "min font on screen %.1f px (%r)" % (rep["min_font_screen_px"], rep["smallest_text"]))


if __name__ == "__main__":
    main()
