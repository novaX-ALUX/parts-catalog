# -*- coding: utf-8 -*-
"""AE-14S 60A FOC ESC 핀아웃 한 장 — 케이스 두 끝을 밖에서 본 카탈로그 렌더(배터리 쪽 | 모터 쪽) + 선마다 표 + 파란 점선.

근거: 선 자리 = 케이스 고무 구멍(미리보기/ae14s-render/ae14s_fit.py HOLES)과 케이블 끝 플러그(make_cables.py cables_plugs.json)를
      핀 그림 전용 끝면 렌더(ae14s-pin-1103)의 카메라로 옮긴 px(ae14s-render/pinout_px.py).
      모터 A · B · C = 전력 기판 V1.0(AE-14S_FOC_60A_TI_POWER_V1.0) 패드 넷 MOT_A/B/C — 빨간 + 선과 같은 쪽 끝이 C.
      CAN = JST-GH 4P(1 5V 미연결 · 2 CAN_H · 3 CAN_L · 4 GND, 이사님 9/30 규칙) · 엔코더 = 둥근 6핀 플러그(번호 자료 없음 → 신호만)
      · PWM = 선택(핀맵만, 11-03) — 제어 기판 V1.0 땜 자리 CAN_H · CAN_L · ISOGND · PWM · PWM_GND · VCC_3.3 · GND · SPICS ·
      SPICLK · SPISIMO · SPISOMI.
바탕: src/ae14s_pin_battery_end.png · src/ae14s_pin_motor_end.png(카탈로그 렌더와 같은 장면 · 카메라 방향) — 출력 파일을 다시 읽지 않는다.
실행: python ae14s_pinout.py [출력 폴더]   → esc_AE-14S-60A-FOC_pinout.png
"""
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from pinout_style import Sheet, hstack, load_rgb, region, word_cells  # noqa: E402

CAT = os.path.normpath(os.path.join(HERE, "..", ".."))
IMG = os.path.join(CAT, "public", "images", "products")
OUT = sys.argv[1] if len(sys.argv) > 1 else IMG
CROP = (600, 1000, 470, 1105)                       # 두 끝 그림 모두: 케이스 끝 + 늘어진 선 5 cm + 플러그 (x0, x1, y0, y1 px)
# 그림 = 핀 그림 전용 끝면 렌더(반대쪽 끝의 선 · 플러그를 빼서 겹치지 않게, 잡 ae14s-pin-1103): src/ae14s_pin_battery_end.png ·
# src/ae14s_pin_motor_end.png (정사영 196.83 · 204.84 mm / 1600 px)
# (이름, 그림 0 = 배터리 쪽 · 1 = 모터 쪽, 상자 px (x0, x1, y0, y1), 부제, 칸, 칸 번호, 위 T · 아래 B)
# 11-03 이사님: "SPI 케이블 · 캔통신은 GH 4pin 커넥터" → 두 케이블은 끝의 플러그를 가리킨다 · "PWM 도 넣어, 옵션 · 핀맵만" → 표만
WIRES = [
    ("BATTERY −", 0, (704.2, 741.4, 630.2, 667.4), "black · 14 AWG", "−", None, "T"),
    ("PWM (OPTION)", 0, (779.4, 820.6, 627.4, 668.6), "can_pwm = 1 · optically isolated", "PWM PWM−", None, "T"),
    ("BATTERY +", 0, (858.6, 895.8, 630.2, 667.4), "red · 14 AWG", "+", None, "T"),
    ("CAN", 0, (770.4, 829.6, 976.2, 1082.0), "JST-GH 4P plug · DroneCAN", "NC CAN_H CAN_L GND", "1 2 3 4", "B"),
    ("MOTOR C", 1, (707.8, 743.8, 628.9, 664.9), "16 AWG", "C", None, "T"),
    ("MOTOR B", 1, (785.0, 815.0, 632.0, 662.0), "16 AWG", "B", None, "T"),
    ("MOTOR A", 1, (856.2, 892.2, 628.9, 664.9), "16 AWG", "A", None, "T"),
    ("ENCODER", 1, (790.9, 874.6, 896.9, 1082.0), "round 6-pin plug · SPI", "3V3 GND CS CLK MOSI MISO", None, "B"),
]


def main():
    ends = [region(load_rgb(os.path.join(HERE, "src", "ae14s_pin_%s.png" % v)), *CROP) for v in ("battery_end", "motor_end")]
    img, offs = hstack(ends, ends[0].shape[0], gap=160)
    sh = Sheet()
    sh.header("AE-14S 60A FOC Pinout",
              "Seen from outside each end of the case: battery end (left) and motor end (right). The CAN cable ends in a "
              "JST-GH 4P plug (pin 1, 5 V, not connected), the encoder cable in a round 6-pin plug. PWM is an option (can_pwm = 1).",
              ["+ = battery    − = GND    blue = signal    NC = not connected"])
    items = []
    for name, src, (bx0, bx1, by0, by1), sub, words, nums, side in WIRES:
        ox, k = offs[src]
        box = (ox + (bx0 - CROP[0]) * k, ox + (bx1 - CROP[0]) * k, (by0 - CROP[2]) * k, (by1 - CROP[2]) * k)
        cells = word_cells(words.split(), nums.split() if nums else None)
        items.append({"box": box, "name": name, "sub": sub, "table": ("h", cells), "p1": None, "side": side})
    sh.board(img, items, img_w=1060)
    out = os.path.join(OUT, "esc_AE-14S-60A-FOC_pinout.png")
    rep = sh.save(out)
    print(out, rep["shown_px"], "min font on screen %.1f px (%r)" % (rep["min_font_screen_px"], rep["smallest_text"]))


if __name__ == "__main__":
    main()
