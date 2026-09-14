# -*- coding: utf-8 -*-
"""원격 PC AI 선화 결과 → 매뉴얼용 먹선 그림(tools/manual/art/<slug>.png): 선은 진하게, 바탕 회색 기운은 순백, 여백 자르기.

실행: python tools/manual/clean_lineart.py <선화 폴더(photo_lineart.py out)> [모델 이름 sk_model]
"""
import sys
from pathlib import Path

import cv2
import numpy as np

src_dir = Path(sys.argv[1])
model = sys.argv[2] if len(sys.argv) > 2 else "sk_model"
art = Path(__file__).resolve().parent / "art"
art.mkdir(exist_ok=True)
for f in sorted(src_dir.glob("*_%s.png" % model)):
    slug = f.name[: -len("_%s.png" % model)]
    g = cv2.imread(str(f), cv2.IMREAD_GRAYSCALE).astype(np.float32)
    lo, hi = 50.0, 218.0                                                   # 선(어두운 쪽)은 더 검게, 옅은 음영·바탕은 흰색으로
    g = np.clip((g - lo) / (hi - lo), 0, 1)
    g = (np.power(g, 1.3) * 255).astype(np.uint8)
    ink = g < 200
    n, lab, st, _ = cv2.connectedComponentsWithStats(ink.astype(np.uint8), connectivity=8)
    keep = np.zeros_like(ink)
    for i in range(1, n):
        if st[i, cv2.CC_STAT_AREA] >= 6:                                   # 흩어진 점 잡음 제거
            keep[lab == i] = True
    g[~keep & (g < 255)] = 255
    ys, xs = np.nonzero(keep)
    pad = 16
    g = g[max(ys.min() - pad, 0):ys.max() + pad, max(xs.min() - pad, 0):xs.max() + pad]
    out = art / (slug + ".png")
    cv2.imwrite(str(out), g, [cv2.IMWRITE_PNG_COMPRESSION, 9])
    print(out, g.shape[::-1])
