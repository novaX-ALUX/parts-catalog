# -*- coding: utf-8 -*-
"""AE-6S 60A BC ESC 핀아웃 — 제품 사진 지도 + 커넥터 카드(pinout_style.Sheet, 글자 = 화면 13 px 이상).

근거: 이 보드의 PCB · 도면이 저장소에 없고 커넥터 옆 실크도 없다 → 신호 순서 = 제조사가 준 옛 핀아웃 그림 그대로
      (POWER 4-Pin: + + − − · ESC INTERFACE: CUR S4 S3 S2 S1 + + − −, 커넥터 위에서 본 왼 → 오). 1 번 핀 자료가 없어 번호 · ① 없음.
바탕: 카탈로그 제품 사진 public/images/products/esc_32-6S-60A-BC.png(958 × 1024) — 출력 파일을 다시 읽지 않는다.
실행: python esc6s_pinout.py [출력 폴더]   → esc_32-6S-60A-BC_pinout.png
"""
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from pinout_style import BLUE, Sheet, crop_px, load_rgb, region, word_cells  # noqa: E402

CAT = os.path.normpath(os.path.join(HERE, "..", ".."))
IMG = os.path.join(CAT, "public", "images", "products")
OUT = sys.argv[1] if len(sys.argv) > 1 else IMG
CONNS = [   # (이름, 상자 px (x0, x1, y0, y1), 부제, 칸 왼 → 오)
    ("POWER", (307, 405, 62, 142), "4-Pin connector", "+ + − −"),
    ("ESC INTERFACE", (424, 599, 62, 142), "9-Pin · current sense, motor signals S1–S4 and power", "CUR S4 S3 S2 S1 + + − −"),
]


def main():
    img = load_rgb(os.path.join(IMG, "esc_32-6S-60A-BC.png"))
    sh = Sheet()
    sh.header("AE-6S 60A BC Pinout",
              "Seen from the top. Each table reads left → right exactly as the picture next to it. "
              "Order as in the maker's pinout drawing; there are no pin numbers.",
              [("A", BLUE), "= connector, its table below", "+ = power    − = GND    blue = signal"])
    reg = (0, img.shape[1], 0, img.shape[0])
    sh.map(region(img, *reg), [{"box": b, "letter": chr(65 + i), "p1": None} for i, (_, b, _, _) in enumerate(CONNS)], max_h=800)
    for i, (name, b, sub, words) in enumerate(CONNS):
        crop, cb = crop_px(img, b, 60)
        sh.card(crop, cb, chr(65 + i), None, name, sub, ("h", word_cells(words.split())))
    out = os.path.join(OUT, "esc_32-6S-60A-BC_pinout.png")
    rep = sh.save(out)
    print(out, rep["shown_px"], "min font on screen %.1f px (%r)" % (rep["min_font_screen_px"], rep["smallest_text"]))


if __name__ == "__main__":
    main()
