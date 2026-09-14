# -*- coding: utf-8 -*-
"""받은 매뉴얼(일러스트레이터 PDF)의 반대 언어판 — 원본 디자인(선화·표·사진, 벡터) 그대로 두고 번역할 글자 조각만 지운 뒤
원문 기준선에 같은 굵기 · 같은 크기(Pretendard, TextWriter)로 번역을 얹는다. 칸 폭을 넘으면 글자를 줄여 맞춘다.

실행: python tools/manual/translate_manual.py
  public/manuals/gnss_AP-RTK-dual_manual_ko.pdf → gnss_AP-RTK-dual_manual_en.pdf
  public/manuals/fc_AF-F7-mini_manual_en.pdf   → fc_AF-F7-mini_manual_ko.pdf   (+ Manual 탭 미리보기 PNG)
글꼴: tools/manual/.fonts/Pretendard-*.ttf (README.md — OTF 는 문장부호 글자가 깨짐)
번역표 항목: (쪽 번호 0부터, 원문 조각, 번역, 정렬 L/C, 칸 폭 pt) · 여러 줄 문단은 ("para", 쪽, [원문 조각…], [번역 문단…], 칸 [x0,y0,x1,y1])
"""
import subprocess
import sys
from pathlib import Path

import fitz

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
FONTS = HERE / ".fonts"

L, C = "left", "center"
DUAL_EN = [
    (1, "패키지 구성품", "Package Contents", L, 165), (1, "안테나 *2", "Antenna ×2", C, 60), (1, "안테나 케이블 *2", "Antenna Cable ×2", C, 80),
    (1, "CAN 케이블 (4-4pin)", "CAN Cable (4-4 pin)", C, 90), (1, "UART 케이블 (4-6pin)", "UART Cable (4-6 pin)", C, 90), (1, "USB 케이블(C-type)", "USB Cable (Type-C)", C, 90),
    (2, "AP-RTK dual 스펙", "AP-RTK dual Specifications", L, 165), (2, "· 시스템", "· System", L, 80), (2, "나침반", "Compass", C, 58), (2, "수신기", "Receiver", C, 58),
    (2, "고정밀 GNSS SoC", "High-precision GNSS SoC", C, 104), (2, "지원 위성 시스템", "Constellations", C, 58), (2, "· 안테나", "· Antennas", L, 80),
    (2, "안테나1", "Antenna 1", C, 46), (2, "(마스터)", "(Master)", C, 46), (2, "안테나2", "Antenna 2", C, 46), (2, "(슬레이브)", "(Slave)", C, 46),
    (3, "AP-RTK dual 스펙", "AP-RTK dual Specifications", L, 165), (3, "단일 위치", "Standalone", C, 58), (3, "수평 1.5 m / 수직 2.5 m", "H 1.5 m / V 2.5 m", C, 104),
    (3, "수평 0.4 m + 1PPM /", "H 0.4 m + 1PPM /", C, 104), (3, "수직 0.8 m + 1PPM", "V 0.8 m + 1PPM", C, 104), (3, "수평 0.8 cm + 1PPM /", "H 0.8 cm + 1PPM /", C, 104),
    (3, "수직 1.5 cm + 1PPM", "V 1.5 cm + 1PPM", C, 104), (3, "헤딩 데이터", "Heading", C, 58), (3, "· 측위 정확도 (RMS)", "· Positioning Accuracy (RMS)", L, 140),
    (3, "갱신속도", "Update Rate", C, 58), (3, "최대 20Hz (기본값 5Hz)", "Up to 20 Hz (default 5 Hz)", C, 104), (3, "형식", "Format", C, 58), (3, "· 데이터", "· Data", L, 80),
    (3, "통신 프로토콜", "Protocol", C, 58), (3, "· 통신 프로토콜", "· Communication Protocol", L, 140), (3, "· 위성 포착(Acquisition)", "· Satellite Acquisition", L, 140),
    (3, "콜드 스타트", "Cold Start", C, 36), (3, "초기화 시간", "Init. Time", C, 36),
    (4, "AP-RTK dual 스펙", "AP-RTK dual Specifications", L, 165), (4, "크기", "Size", C, 58), (4, "무게", "Weight", C, 58), (4, "동작 온도", "Operating Temp", C, 58),
    (4, "동작 전압", "Operating Voltage", C, 58), (4, "· 물리적 & 환경 조건", "· Physical & Environmental", L, 140), (4, "· 입출력 포트 (I/O)", "· I/O Ports", L, 140),
    (4, "안테나", "Antenna", C, 42), (4, "주의사항", "Notes", L, 80),
    ("para", 4, ["· AP-RTK dual은 CAN(DroneCAN) 및 UART를 통해", "컨트 롤러에 연결할 수 있도록 지원하며, CAN을", "사용하는 것을 권장합니다.",
                 "· 설정 전에 두 안테나를 고정하고 30cm 이상의 거리를", "유지하며, 탁 트인 하늘 전망을 유지해야 합니다.",
                 "· 창문이나 기타 장애물에 가까이 가지 마십시오. 그렇지", "않으면 방위 데이터를 수신하지 못할 수 있습니다."],
     ["· AP-RTK dual connects to the flight controller over CAN (DroneCAN) or UART; CAN is recommended.",
      "· Before setup, fix both antennas at least 30 cm apart with a clear, open view of the sky.",
      "· Keep away from windows and other obstacles; otherwise heading data may not be received."], [17.5, 172.6, 183.0, 253.0]),
    (5, "AP-RTK dual 스펙 핀맵 & 포트 정보", "AP-RTK dual Pinout & Ports", L, 165), (5, "· 핀맵", "· Pinout", L, 80),
    (6, "AP-RTK dual 스펙 핀맵 & 포트 정보", "AP-RTK dual Pinout & Ports", L, 165), (6, "· 포트정보 - CAN", "· Port Info - CAN", L, 120),
    (6, "안테나2", "Antenna 2", C, 40), (6, "안테나1", "Antenna 1", C, 40), (6, "(슬레이브)", "(Slave)", C, 36), (6, "(마스터)", "(Master)", C, 36), (6, "호환 가능 FC 사용", "Compatible FC", C, 60),
    (7, "AP-RTK dual 스펙 핀맵 & 포트 정보", "AP-RTK dual Pinout & Ports", L, 165), (7, "· 포트정보 - UART", "· Port Info - UART", L, 120),
    (7, "안테나2", "Antenna 2", C, 40), (7, "안테나1", "Antenna 1", C, 40), (7, "(슬레이브)", "(Slave)", C, 36), (7, "(마스터)", "(Master)", C, 36), (7, "호환 가능 FC 사용", "Compatible FC", C, 60),
    (7, "<자세한 매뉴얼>", "<Detailed Manual>", C, 60),
]
F7_KO = [(1, "1. Parts List", "1. 각부 명칭", L, 120), (2, "2. Specifications", "2. 스펙", L, 120), (2, "· Basic Specifications", "· 기본 사양", L, 120)]
F7_KO += [(2, a, b, L, 58) for a, b in (("Magnetometer", "나침반"), ("Barometer", "기압계"), ("Operating Voltage", "동작 전압"), ("USB Input", "USB 입력"),
                                        ("Servo Rail", "서보 레일"), ("PWM Output", "PWM 출력"), ("PWM / Capture Input", "PWM / 캡처 입력"), ("RC Input", "RC 입력"),
                                        ("RSSI Input", "RSSI 입력"), ("Size / Weight", "크기 / 무게"), ("Operating Temp", "동작 온도"), ("Supported F/W", "지원 펌웨어"),
                                        ("Secondary IMU", "보조 IMU"))]
F7_KO += [(2, a, b, L, 100) for a, b in (("ICM-20689 (Accel/Gyro)", "ICM-20689 (가속도/자이로)"), ("4.75 – 5.5 V (Rated 5 V)", "4.75 – 5.5 V (정격 5 V)"),
                                         ("Max. 36 V (No Internal Regulator)", "최대 36 V (내부 레귤레이터 없음)"), ("8 CH", "8 채널"), ("3 CH", "3 채널"),
                                         ("Analog / PWM", "아날로그 / PWM"), ("4 Port", "4 포트"), ("3 Port", "3 포트"), ("2 Port", "2 포트"),
                                         ("VBat/Current + Aux Analog Input 2Ch", "배터리 전압/전류 + 보조 아날로그 입력 2채널"))]
F7_KO += [(p, "3. Pinouts", "3. 핀맵", L, 120) for p in (3, 4, 5, 6)]
F7_KO += [(3, "· Pinmap", "· 핀맵", L, 80), (3, "Pin Arrangement", "커넥터 배치", L, 80), (3, "Motor", "모터", L, 40)]
F7_KO += [(p, "· Pin Assignment", "· 핀 할당", L, 90) for p in (4, 5, 6)]

WEIGHT = [("SemiBold", "Pretendard-SemiBold"), ("Bold", "Pretendard-Bold"), ("Medium", "Pretendard-Medium"), ("Regular", "Pretendard-Regular"), ("Light", "Pretendard-Light")]
_FONTS = {}


def font_of(name):
    """원문 글꼴 이름 → 같은 굵기 Pretendard. 글자 모양 대체(문맥 대체·합자) 없이 cmap 그대로 쓴다(HTML 삽입은 ( ) × + & 를 다른 글자로 바꿈)."""
    fam = next((v for k, v in WEIGHT if k in name), "Pretendard-Regular")
    if fam not in _FONTS:
        _FONTS[fam] = fitz.Font(fontfile=str(FONTS / (fam + ".ttf")))          # OTF(CFF) 는 PDF 에서 ( ) - × + & 가 다른 글자로 찍힘 → TTF
    return _FONTS[fam]


def spans(page):
    for b in page.get_text("dict")["blocks"]:
        for ln in b.get("lines", []):
            if abs(ln["dir"][0] - 1) > 1e-3:
                continue
            for s in ln["spans"]:
                if s["text"].strip():
                    yield s


def rgb(c):
    return ((c >> 16) & 255) / 255.0, ((c >> 8) & 255) / 255.0, (c & 255) / 255.0


def put_line(page, s, text, align, width):
    """원문 조각의 기준선에 번역 한 줄 — 칸 폭을 넘으면 글자 크기를 줄여 맞춤."""
    f = font_of(s["font"])
    size = s["size"]
    tw = f.text_length(text, fontsize=size)
    if tw > width:
        size *= width / tw
        tw = width
    r = fitz.Rect(s["bbox"])
    x = r.x0 if align == L else (r.x0 + r.x1) / 2 - tw / 2
    wr = fitz.TextWriter(page.rect, color=rgb(s["color"]))
    wr.append(fitz.Point(x, s["origin"][1]), text, font=f, fontsize=size)
    wr.write_text(page)
    return size / s["size"]


def put_para(page, s, paras, rect):
    """여러 줄 문단: 단어 단위 줄바꿈, 원문과 같은 줄 간격(글자 크기 × 1.23), 문단 사이 3.2 pt."""
    f = font_of(s["font"])
    size, lead = s["size"], s["size"] * 1.23
    wr = fitz.TextWriter(page.rect, color=rgb(s["color"]))
    y = rect.y0 + size
    for para in paras:
        line = ""
        for word in para.split(" "):
            trial = (line + " " + word).strip()
            if f.text_length(trial, fontsize=size) > rect.width and line:
                wr.append(fitz.Point(rect.x0, y), line, font=f, fontsize=size)
                y += lead
                line = word
            else:
                line = trial
        wr.append(fitz.Point(rect.x0, y), line, font=f, fontsize=size)
        y += lead + 3.2
    wr.write_text(page)
    return y - 3.2 - lead <= rect.y1


def translate(src, dst, table):
    doc = fitz.open(src)
    report = {"replaced": 0, "missing": [], "scaled": [], "para_overflow": []}
    for pno, page in enumerate(doc):
        items = [t for t in table if (t[1] if t[0] == "para" else t[0]) == pno]
        if not items:
            continue
        found, used = [], set()
        all_spans = list(spans(page))
        for t in items:
            if t[0] == "para":
                ms = [s for s in all_spans if s["text"].strip() in [x.strip() for x in t[2]]]
                if len(ms) != len(t[2]):
                    report["missing"].append((pno, "para", len(ms), len(t[2])))
                found.append((t, ms))
                continue
            ms = [s for i, s in enumerate(all_spans) if s["text"].strip() == t[1].strip() and i not in used]
            if not ms:
                report["missing"].append((pno, t[1]))
                continue
            for s in ms:
                used.add(all_spans.index(s))
            found.append((t, ms))
        for t, ms in found:
            for s in ms:
                r = fitz.Rect(s["bbox"])
                page.add_redact_annot(fitz.Rect(r.x0 + 0.15, r.y0 + 0.6, r.x1 - 0.15, r.y1 - 0.6), fill=False)
        page.apply_redactions(images=fitz.PDF_REDACT_IMAGE_NONE, graphics=fitz.PDF_REDACT_LINE_ART_NONE, text=fitz.PDF_REDACT_TEXT_REMOVE)
        for t, ms in found:
            if t[0] == "para":
                if not put_para(page, ms[0], t[3], fitz.Rect(t[4])):
                    report["para_overflow"].append(pno)
                report["replaced"] += 1
                continue
            _, src_text, new, align, width = t
            for s in ms:
                scale = put_line(page, s, new, align, width)
                report["replaced"] += 1
                if scale < 1:
                    report["scaled"].append((pno, new, round(scale, 2)))
    doc.subset_fonts()                                                    # 넣은 TTF 를 쓴 글자만 남김(글꼴 통째 +4.6 MB 방지, fontTools)
    doc.save(dst, garbage=4, deflate=True)
    return report


if __name__ == "__main__":
    M = ROOT / "public" / "manuals"
    jobs = [(M / "gnss_AP-RTK-dual_manual_ko.pdf", M / "gnss_AP-RTK-dual_manual_en.pdf", DUAL_EN),
            (M / "fc_AF-F7-mini_manual_en.pdf", M / "fc_AF-F7-mini_manual_ko.pdf", F7_KO)]
    bad = False
    for src, dst, table in jobs:
        rep = translate(src, dst, table)
        bad |= bool(rep["missing"])
        print(dst.name, "replaced", rep["replaced"], "missing", rep["missing"], "scaled", rep["scaled"])
        subprocess.run([sys.executable, str(HERE / "manual_preview.py"), str(dst)], check=True, capture_output=True)
    sys.exit(1 if bad else 0)
