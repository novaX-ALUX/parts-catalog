# -*- coding: utf-8 -*-
"""매뉴얼 PDF → Manual 탭 쪽 미리보기 PNG(같은 이름 .png, 쪽을 4칸씩 격자로).

실행: python tools/manual/manual_preview.py public/manuals/<이름>.pdf [...]
필요: PyMuPDF(fitz), Pillow
"""
import sys
from pathlib import Path

import fitz
from PIL import Image

COLS, PAGE_W, GAP, PAD = 4, 400, 18, 22

for arg in sys.argv[1:]:
    pdf = Path(arg)
    doc = fitz.open(pdf)
    pages = []
    for page in doc:
        if not page.get_text().strip() and len(page.get_drawings()) == 0 and not page.get_images():
            continue                                                  # 빈 쪽은 뺀다
        z = PAGE_W / page.rect.width
        pix = page.get_pixmap(matrix=fitz.Matrix(z, z), alpha=False)
        pages.append(Image.frombytes("RGB", (pix.width, pix.height), pix.samples))
    h = max(p.height for p in pages)
    rows = (len(pages) + COLS - 1) // COLS
    sheet = Image.new("RGB", (PAD * 2 + COLS * PAGE_W + (COLS - 1) * GAP, PAD * 2 + rows * h + (rows - 1) * GAP), (255, 255, 255))
    for i, p in enumerate(pages):
        x = PAD + (i % COLS) * (PAGE_W + GAP)
        y = PAD + (i // COLS) * (h + GAP)
        sheet.paste(p, (x, y))
        # 쪽 테두리(흰 쪽이 흰 바탕에 묻히지 않게)
        for dx in range(PAGE_W):
            sheet.putpixel((x + dx, y), (214, 214, 214))
            sheet.putpixel((x + dx, y + p.height - 1), (214, 214, 214))
        for dy in range(p.height):
            sheet.putpixel((x, y + dy), (214, 214, 214))
            sheet.putpixel((x + PAGE_W - 1, y + dy), (214, 214, 214))
    out = pdf.with_suffix(".png")
    sheet.quantize(colors=96, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).save(out, optimize=True)   # 색 수를 줄여 용량 ↓(흑백 위주 쪽)
    print(out, sheet.size, "pages", len(pages))
