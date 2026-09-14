# -*- coding: utf-8 -*-
"""제품 사진 → 먹선(선화) PNG — 3D 원본이 없는 제품의 매뉴얼 그림용. 원격 PC(GPU)에서 돌린다.

모델: Informative Drawings(Chan et al. 2022, MIT) 생성기 — ControlNet 선화 전처리기(lllyasviel/Annotators)의 가중치
      sk_model.pth = 사실 선화(가는 선·세부), sk_model2.pth = 굵은 선화(윤곽 위주)
실행(HP 가상환경): python photo_lineart.py <cfg.json>
cfg: {"model_dir": "D:/remote-work/models", "out_dir": "out", "long_side": 1536,
      "items": [{"src": "in/x.png", "name": "x", "bg": "auto|white|black", "models": ["sk_model", "sk_model2"]}]}
출력: <name>_<model>.png (흰 바탕 검은 선, 배경 밖은 순백) · RESULT JSON(선 화소 비율)
"""
import json
import os
import sys

import cv2
import numpy as np
import torch
import torch.nn as nn

norm_layer = nn.InstanceNorm2d


class ResidualBlock(nn.Module):
    def __init__(self, f):
        super().__init__()
        self.conv_block = nn.Sequential(nn.ReflectionPad2d(1), nn.Conv2d(f, f, 3), norm_layer(f), nn.ReLU(inplace=True),
                                        nn.ReflectionPad2d(1), nn.Conv2d(f, f, 3), norm_layer(f))

    def forward(self, x):
        return x + self.conv_block(x)


class Generator(nn.Module):
    def __init__(self, input_nc=3, output_nc=1, n_residual_blocks=3):
        super().__init__()
        self.model0 = nn.Sequential(nn.ReflectionPad2d(3), nn.Conv2d(input_nc, 64, 7), norm_layer(64), nn.ReLU(inplace=True))
        m1, f = [], 64
        for _ in range(2):
            m1 += [nn.Conv2d(f, f * 2, 3, stride=2, padding=1), norm_layer(f * 2), nn.ReLU(inplace=True)]
            f *= 2
        self.model1 = nn.Sequential(*m1)
        self.model2 = nn.Sequential(*[ResidualBlock(f) for _ in range(n_residual_blocks)])
        m3 = []
        for _ in range(2):
            m3 += [nn.ConvTranspose2d(f, f // 2, 3, stride=2, padding=1, output_padding=1), norm_layer(f // 2), nn.ReLU(inplace=True)]
            f //= 2
        self.model3 = nn.Sequential(*m3)
        self.model4 = nn.Sequential(nn.ReflectionPad2d(3), nn.Conv2d(64, output_nc, 7), nn.Sigmoid())

    def forward(self, x):
        return self.model4(self.model3(self.model2(self.model1(self.model0(x)))))


def load_rgb(path, long_side, bg):
    im = cv2.imread(path, cv2.IMREAD_UNCHANGED)
    if im.ndim == 2:
        im = cv2.cvtColor(im, cv2.COLOR_GRAY2BGR)
    mask = None
    if im.shape[2] == 4:                                           # 투명 PNG → 흰 바탕
        a = im[:, :, 3:4].astype(np.float32) / 255
        mask = (a[:, :, 0] > 0.08).astype(np.uint8)
        im = (im[:, :, :3].astype(np.float32) * a + 255 * (1 - a)).astype(np.uint8)
    h, w = im.shape[:2]
    s = long_side / max(h, w)
    im = cv2.resize(im, (int(round(w * s / 8)) * 8, int(round(h * s / 8)) * 8), interpolation=cv2.INTER_LANCZOS4 if s > 1 else cv2.INTER_AREA)
    if mask is not None:
        mask = cv2.resize(mask, (im.shape[1], im.shape[0]), interpolation=cv2.INTER_NEAREST)
    g = cv2.cvtColor(im, cv2.COLOR_BGR2GRAY)
    border = np.r_[g[0], g[-1], g[:, 0], g[:, -1]]
    kind = bg if bg != "auto" else ("black" if np.median(border) < 60 else "white")
    if mask is None:                                               # 배경 = 가장자리와 이어진 비슷한 밝기 영역
        near = (g < 40) if kind == "black" else (g > 235)
        n, lab = cv2.connectedComponents(near.astype(np.uint8))
        edge_labels = set(np.unique(np.r_[lab[0], lab[-1], lab[:, 0], lab[:, -1]])) - {0}
        bgmask = np.isin(lab, list(edge_labels)) & near
        fg = (~bgmask).astype(np.uint8)
        fg = cv2.morphologyEx(fg, cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8))
        n, lab, st, _ = cv2.connectedComponentsWithStats(fg)
        mask = np.zeros_like(fg)
        for i in range(1, n):
            if st[i, cv2.CC_STAT_AREA] > fg.size * 0.001:
                mask[lab == i] = 1
    soft = cv2.GaussianBlur(mask.astype(np.float32), (0, 0), 1.5)[:, :, None]
    im = (im.astype(np.float32) * soft + 255 * (1 - soft)).astype(np.uint8)    # 제품 밖은 흰색으로
    return im, mask, kind


cfg = json.load(open(sys.argv[1], encoding="utf-8-sig"))                  # PowerShell 5.1 이 쓴 BOM 도 허용
os.makedirs(cfg["out_dir"], exist_ok=True)
dev = "cuda" if torch.cuda.is_available() else "cpu"
nets = {}
res = {"device": dev, "torch": torch.__version__, "items": []}
for it in cfg["items"]:
    img, mask, kind = load_rgb(it["src"], cfg.get("long_side", 1536), it.get("bg", "auto"))
    rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    x = torch.from_numpy(rgb).float().permute(2, 0, 1)[None].to(dev) / 255.0
    for mname in it.get("models", ["sk_model", "sk_model2"]):
        if mname not in nets:
            net = Generator().to(dev).eval()
            net.load_state_dict(torch.load(os.path.join(cfg["model_dir"], mname + ".pth"), map_location=dev))
            nets[mname] = net
        with torch.no_grad():
            y = nets[mname](x)[0, 0].float().cpu().numpy()
        line = (y * 255).clip(0, 255).astype(np.uint8)            # 흰 바탕(255) 검은 선(0)
        grow = cv2.dilate(mask, np.ones((5, 5), np.uint8))
        line[grow == 0] = 255
        dst = os.path.join(cfg["out_dir"], "%s_%s.png" % (it["name"], mname))
        cv2.imwrite(dst, line)
        res["items"].append({"name": it["name"], "model": mname, "bg": kind, "size": [int(line.shape[1]), int(line.shape[0])],
                             "ink_pct": round(100.0 * float((line < 128).mean()), 2), "file": dst})
print("RESULT", json.dumps(res, ensure_ascii=False))
