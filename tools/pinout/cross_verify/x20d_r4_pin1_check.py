# -*- coding: utf-8 -*-
"""X20D 핀아웃 그림의 1 번 위치를 최신 R4 보드(유거산 10-08 최종 PcbDoc) 패드 좌표로 다시 판정한다.
입력: R4 패드 json(remote-run x20d-r4-pads-1112) · 카탈로그 렌더 cfg(보는 방향). 출력: 판정 json.
PCB(Altium 윗면 좌표) → 케이스 mm: 케이스 x = A − pcb x, 케이스 y = pcb y + B (보드가 뒤집혀 들어감 — 커넥터가 아랫면).
A 는 안테나 두 개(J1 · J2) 중심으로, B 는 UART(U14) 중심으로 맞춘 뒤 CAN · USB 로 따로 대조한다(케이스 좌표 = gnss_pinout.py 상자 + DX/DY)."""
import json
import sys

pads_json, cfg_json, out = sys.argv[1:4]
P = json.load(open(pads_json, encoding="utf-8"))
V = json.load(open(cfg_json, encoding="utf-8"))["views"]
DX, DY = -4.97, -5.00
C = P["components"]


def mid(*v):
    return sum(v) / len(v)


case = {  # gnss_pinout.py x20d() 상자 가운데(케이스 mm)
    "J1": mid(-11.5 + DX, -6.5 + DX), "J2": mid(6.5 + DX, 11.5 + DX),
    "USB1": mid(-9.4 + DX, 0.4 + DX), "U16": mid(1.9 + DX, 9.8 + DX), "U14_y": mid(-1.9 + DY, 6.0 + DY)}
A = mid(case["J1"] + C["J1"]["x_mm"], case["J2"] + C["J2"]["x_mm"])
B = case["U14_y"] - C["U14"]["y_mm"]
fit = {k: round(A - C[k]["x_mm"] - case[k], 3) for k in ("J1", "J2", "USB1", "U16")}   # 맞춘 뒤 남는 차이(mm)


def right_of(view):
    d, up = V[view]["dir"], V[view]["up"]
    f = [-c for c in d]                                    # 카메라가 보는 방향 = 놓인 방향의 반대
    return [f[1] * up[2] - f[2] * up[1], f[2] * up[0] - f[0] * up[2], f[0] * up[1] - f[1] * up[0]]


def side(ref, view):
    r = right_of(view)
    pads = {p["name"]: p for p in C[ref]["pads"] if p["name"] in ("1", "4")}
    s = {n: r[0] * (A - p["x"]) + r[1] * (p["y"] + B) for n, p in pads.items()}   # 그림 오른쪽 방향 좌표
    return {"view": view, "right_vector": r, "pin1_vs_pin4_mm": round(s["1"] - s["4"], 3),
            "pin1": "left" if s["1"] < s["4"] else "right",
            "nets": {p["name"]: p["net"] for p in sorted(C[ref]["pads"], key=lambda p: p["name"]) if p["name"].isdigit()}}


res = {"board": P["source"], "pcbdoc_sha256": P["sha256"], "map": {"case_x": "%.3f - pcb_x" % A, "case_y": "pcb_y + %.3f" % B},
       "fit_residual_mm": fit, "UART_U14": side("U14", "left"), "CAN_U16": side("U16", "front"),
       "antennas_back_view": {k: ("right" if right_of("back")[0] * (A - C[k]["x_mm"]) > right_of("back")[0] * (A - C["J2" if k == "J1" else "J1"]["x_mm"]) else "left")
                              for k in ("J1", "J2")}}
json.dump(res, open(out, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(json.dumps(res, ensure_ascii=False, indent=1))
