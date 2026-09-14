# -*- coding: utf-8 -*-
"""매뉴얼 내용 — 제품군별 쪽 구성과 한국어·영어 문구. 제품 수치는 카탈로그 md 에서만 가져온다(여기에 수치를 적지 않는다).

spec_for(d, lang, work, helpers) → {"cover": Path, "pages": [(띠 제목, 본문 HTML)]}
"""
import html
import re
from pathlib import Path

import manual_products as MP

SPEC_KO = {
    # 공통
    "MCU": "MCU", "Size": "크기", "Weight": "무게", "Operating Temp": "동작 온도", "Operating Voltage": "동작 전압", "Firmware": "펌웨어",
    "Mounting Hole": "고정 구멍", "Mount Hole": "고정 구멍", "Interface": "인터페이스", "Voltage": "전압", "Power Consumption": "소비 전력",
    # 모터
    "Stator Dimensions": "스테이터 크기", "Slots / Poles": "슬롯 / 극", "Motor Weight": "모터 무게", "KV Value": "KV",
    "Rated Voltage": "정격 전압", "Max Current": "최대 전류", "Max Power": "최대 출력", "Recommended Prop": "권장 프로펠러",
    "Shaft / Thread": "축 / 나사",
    # ESC
    "Voltage Range": "입력 전압", "Constant Current": "연속 전류", "Burst Current": "순간 전류", "Capacitor": "커패시터",
    "PWM Frequency": "PWM 주파수", "Supported Protocols": "지원 프로토콜", "BDShot": "BDShot", "Current Sensor": "전류 센서",
    "BEC Output": "BEC 출력", "Control": "제어 방식", "Power Stage": "전력단", "Position Sensor": "위치 센서", "Telemetry": "텔레메트리",
    "Protection": "보호 기능",
    # FC
    "IMU": "IMU", "Barometer": "기압계", "Gimbal": "짐벌", "USB Input": "USB 입력", "PWM Output": "PWM 출력", "Serial Ports": "시리얼 포트",
    "RC Input": "RC 입력", "Supported F/W": "지원 펌웨어", "GNSS": "GNSS", "Compass": "나침반", "GPS Port": "GPS 포트",
    "Output Voltage": "출력 전압", "Blackbox": "블랙박스", "Servo Output": "서보 출력", "RAM / Flash": "RAM / Flash",
    "Secondary IMU": "보조 IMU", "Magnetometer": "나침반", "Servo Rail": "서보 레일", "RSSI Input": "RSSI 입력", "UART": "UART",
    "I²C": "I²C", "CAN": "CAN", "ADC": "ADC", "Ethernet": "이더넷",
    # GNSS
    "Chipset": "칩셋", "Satellite Systems": "지원 위성 시스템", "Antenna Band": "안테나 대역", "Antenna Type": "안테나 형식",
    "Single-Point Accuracy": "단독 측위 정확도", "Cold Start": "콜드 스타트", "Hot Start": "핫 스타트", "Update Rate": "갱신 속도",
    "Data Format": "데이터 형식", "Comm. Protocol": "통신 프로토콜", "I/O Ports": "입출력 포트", "Receiver": "수신기", "Signals": "신호",
    "Heading (dual antenna)": "헤딩(듀얼 안테나)", "Pitch / Roll": "피치 / 롤", "RTK Accuracy": "RTK 정확도",
    "RTK Initialization": "RTK 초기화", "Standalone / DGNSS": "단독 / DGNSS", "Velocity Accuracy": "속도 정확도",
    "Cold / Warm Start": "콜드 / 웜 스타트", "Interference Protection": "간섭 보호", "GNSS Bands": "GNSS 대역", "Heading": "헤딩",
    "PCB": "PCB", "Validation Status": "검증 상태", "Antenna 1 (Master)": "안테나1 (마스터)", "Antenna 2 (Slave)": "안테나2 (슬레이브)",
    "DGPS Accuracy": "DGPS 정확도",
    # 카메라
    "Resolution": "해상도", "Pixel Pitch": "화소 간격", "Sensor Size": "센서 크기", "Frame Rate": "프레임 속도",
    "FOV (Horizontal)": "화각(수평)", "Aperture": "조리개", "TV Distortion": "TV 왜곡", "Lens Configuration": "렌즈 구성",
    "Lens Mount": "렌즈 마운트", "Module Size": "모듈 크기", "Camera": "카메라", "Stabilization": "안정화",
    "Max. Controllable Speed": "최대 제어 속도", "Max. Control Range": "최대 제어 범위", "Control Mode": "제어 방식",
    "Manufacturer": "제조사", "Detector Type": "검출기 형식", "NETD": "NETD", "Weight (core w/o lens)": "무게(렌즈 제외 코어)",
    "Frame Rate (SoC)": "프레임 속도(SoC)", "Frame Rate (FPGA)": "프레임 속도(FPGA)", "Output (SoC)": "출력(SoC)",
    "Output (FPGA)": "출력(FPGA)", "Core Dimension (SoC)": "코어 크기(SoC)", "Core Dimension (FPGA)": "코어 크기(FPGA)",
    "Lens Options (SoC)": "렌즈 옵션(SoC)", "Lens Options (FPGA)": "렌즈 옵션(FPGA)",
}
VALUE_KO = [(r"\binch\b", "인치"), (r"\bPort\b", "포트"), (r"\bCH\b", "채널"), (r"(\d+) pole pairs", r"\1 극쌍")]

T = {
    "ko": {"specs": "스펙", "basic": "· 기본 사양", "dims": "외형 및 치수", "dims_sub": "· 치수 (단위 mm)", "perf": "성능 데이터",
           "install": "설치 및 연결", "safety": "주의사항", "detail": "&lt;자세한 매뉴얼&gt;", "bottom": "밑면 · 고정부", "side": "옆면",
           "top": "윗면 · 프로펠러 쪽", "throttle": "스로틀", "thrust": "추력 (g)", "current": "전류 (A)", "power": "전력 (W)",
           "eff": "효율 (g/W)", "temp": "온도 (℃)", "rpm": "회전수 (rpm)", "voltage": "전압 (V)", "prop": "프로펠러"},
    "en": {"specs": "Specifications", "basic": "· Basic Specifications", "dims": "Dimensions", "dims_sub": "· Dimensions (mm)",
           "perf": "Performance Data", "install": "Installation", "safety": "Safety Notes", "detail": "&lt;Detailed Manual&gt;",
           "bottom": "Bottom · mount", "side": "Side", "top": "Top · propeller side", "throttle": "Throttle", "thrust": "Thrust (g)",
           "current": "Current (A)", "power": "Power (W)", "eff": "Eff. (g/W)", "temp": "Temp (℃)", "rpm": "Speed (rpm)",
           "voltage": "Voltage (V)", "prop": "Propeller"},
}


def e(s):
    return html.escape(str(s))


def spec_value(v, lang):
    if lang != "ko":
        return v
    for pat, rep in VALUE_KO:
        v = re.sub(pat, rep, v)
    return v


def spec_table(d, lang, keys=None):
    rows = [s for s in d.get("specs", []) if keys is None or s["key"] in keys]
    tr = "".join("<tr><th>%s</th><td>%s</td></tr>" % (e(SPEC_KO.get(s["key"], s["key"]) if lang == "ko" else s["key"]), e(spec_value(s["value"], lang)))
                 for s in rows)
    return '<table class="t">%s</table>' % tr


def spec(d, key):
    return next((s["value"] for s in d.get("specs", []) if s["key"] == key), None)


def qr_block(d, lang):
    return '<div class="qr"><div class="code" data-url="%s"></div><div class="lbl">%s</div></div>' % (e(d["_url"]), T[lang]["detail"])


def test_conditions(text, lang):
    if not text or lang != "ko":
        return text or ""
    m = re.match(r"(\d+S) LiPo, (20%–100% throttle on )?(?:sea-level )?static thrust stand\. Measured values; rated specs may differ\.", text)
    if not m:
        return text
    return "%s LiPo, 정지 추력 시험대 측정값%s. 정격 사양과 다를 수 있습니다." % (m.group(1), " (스로틀 20~100 %)" if m.group(2) else "")


def rows_figure(rows, max_w=171.4, max_h=196.0, gap_px=120, row_gap=6.0):
    """도면 보기들을 원래 줄 구성 그대로 배치 — 줄마다 쪽 폭까지 키우되 전체 높이(max_h) 안에서 가장 크게(줄 안에서는 같은 축척)."""
    widths = [sum(v["box"][2] - v["box"][0] for v in r) + gap_px * (len(r) - 1) for r in rows]
    heights = [max(v["box"][3] - v["box"][1] for v in r) for r in rows]
    room = max_h - row_gap * (len(rows) - 1)
    base = min(max_w / max(widths), room / sum(heights))
    lo, hi = 1.0, 20.0
    for _ in range(40):                                                   # 공통 배율 k: 줄 배율 = min(폭 한계, k × 기본)
        k = (lo + hi) / 2
        if sum(hh * min(max_w / ww, k * base) for ww, hh in zip(widths, heights)) <= room:
            lo = k
        else:
            hi = k
    out = []
    for r, ww, hh in zip(rows, widths, heights):
        s = min(max_w / ww, lo * base)
        imgs = "".join('<img src="%s" style="width:%.2fpt;height:%.2fpt">' % (v["path"].as_uri(), (v["box"][2] - v["box"][0]) * s, (v["box"][3] - v["box"][1]) * s) for v in r)
        out.append('<div style="display:flex;justify-content:center;align-items:center;gap:%.2fpt;height:%.2fpt;margin-bottom:%.1fpt">%s</div>'
                   % (gap_px * s, hh * s, row_gap, imgs))
    return "".join(out)


# ───────────────────────── 모터 ─────────────────────────
def motor(d, lang, work, h):
    L = T[lang]
    name = d["name"]
    cover = h["white_background"](h["root"] / "public" / d["image"].lstrip("/"), work / "cover.png")
    rows = h["split_drawing"](h["root"] / "public" / d["datasheet"].lstrip("/"), work)
    pages = []
    if len(rows[0]) == 3 and len(rows) > 1:                               # 표준 배치: 윗줄 = 밑면 · 옆면 · 윗면, 아랫줄 = 사선 보기
        b, s, t = (v["path"].as_uri() for v in rows[0])
        isos = [v for r in rows[1:] for v in r]
        body = ('<div class="sub">%s</div>'
                '<div class="fig" style="height:98pt"><img src="%s"></div><div class="cap">%s</div><div class="gap"></div>'
                '<div style="display:flex;gap:10pt"><div style="flex:1"><div class="fig" style="height:78pt"><img src="%s"></div><div class="cap">%s</div></div>'
                '<div style="flex:1"><div class="fig" style="height:78pt"><img src="%s"></div><div class="cap">%s</div></div></div>'
                % (L["dims_sub"], s, L["side"], b, L["bottom"], t, L["top"]))
    else:                                                                 # 그 밖: 줄 구성·축척 그대로, 마지막 줄 오른쪽 끝(2개 이상일 때) = 사선 보기
        last = rows[-1]
        isos = [last[-1]] if len(last) >= 2 else []
        ortho = rows[:-1] + ([last[:-1]] if len(last) >= 2 else [last])
        body = '<div class="sub">%s</div>%s' % (L["dims_sub"], rows_figure(ortho))
    pages.append(("%s %s" % (name, L["dims"]), body))
    pages.append(("%s %s" % (name, L["specs"]), '<div><div class="sub">%s</div>%s</div>' % (L["basic"], spec_table(d, lang))))
    thrust = d.get("thrust") or []
    if thrust:
        cols = ["throttle", "thrust", "current", "power", "eff"]
        has_rpm = any(r.get("rpm") not in (None, "—") for t in thrust for r in t["rows"])
        cols += ["rpm"] if has_rpm else ["temp"]
        blocks = ['<div class="note">%s</div>' % e(test_conditions(d.get("testConditions"), lang))]
        for t in thrust:
            head = "".join("<th>%s</th>" % L[c] for c in cols)
            body_rows = "".join("<tr>%s</tr>" % "".join("<td>%s</td>" % e(r.get(c) or "—") for c in cols) for r in t["rows"])
            esc_name = (" · " + t["esc"]) if t.get("esc") else ""
            blocks.append('<div><div class="sub">· %s %s%s</div><table class="g"><tr>%s</tr>%s</table></div>' % (L["prop"], e(t["propeller"]), e(esc_name), head, body_rows))
        pages.append(("%s %s" % (name, L["perf"]), "".join(blocks)))
    volt, prop, cur = spec(d, "Rated Voltage"), spec(d, "Recommended Prop"), spec(d, "Max Current")
    isos = "".join('<div style="flex:1"><div class="fig" style="height:60pt"><img src="%s"></div></div>' % v["path"].as_uri() for v in isos[:2])
    if lang == "ko":
        steps = ["<b>모터 고정</b> — 밑면 고정 구멍으로 암에 고정합니다. 나사 규격·간격은 치수 도면을 따르고, 나사 끝이 코일에 닿지 않는 길이를 씁니다.",
                 "<b>ESC 연결</b> — 모터 선 3가닥을 ESC 출력에 연결합니다. 회전 방향이 반대이면 아무 2가닥을 서로 바꾸거나 ESC 설정에서 반전합니다.",
                 "<b>회전 확인</b> — 프로펠러 없이 낮은 스로틀로 회전 방향과 이상 소음을 확인합니다.",
                 "<b>프로펠러 장착</b> — 회전 방향에 맞는 프로펠러를 끼우고 너트를 단단히 조입니다." + ((" 권장 프로펠러: %s." % e(spec_value(prop, lang))) if prop else "")]
        notes = ["정격 전압을 넘기지 마십시오." + ((" 정격: %s." % e(volt)) if volt else ""),
                 "ESC는 모터 최대 전류보다 여유 있는 정격을 쓰십시오." + ((" 최대 전류: %s." % e(cur)) if cur else ""),
                 "연결·설정·점검 중에는 프로펠러를 반드시 분리하십시오.",
                 "운용 직후 모터는 뜨거울 수 있으니 식은 뒤 만지십시오.",
                 "자석에 금속 가루·나사가 붙지 않게 하고, 축 휨·베어링 소음이 있으면 사용을 멈추십시오."]
    else:
        steps = ["<b>Mounting</b> — Fix the motor to the arm through the bottom mounting holes. Follow the screw size and spacing on the drawing and use screws that do not reach the windings.",
                 "<b>ESC wiring</b> — Connect the three motor wires to the ESC outputs. To reverse the rotation, swap any two wires or reverse it in the ESC settings.",
                 "<b>Spin check</b> — Without a propeller, run at low throttle and check the direction and for abnormal noise.",
                 "<b>Propeller</b> — Fit a propeller matching the rotation and tighten the nut firmly." + ((" Recommended: %s." % e(prop)) if prop else "")]
        notes = ["Do not exceed the rated voltage." + ((" Rated: %s." % e(volt)) if volt else ""),
                 "Use an ESC rated with margin above the motor maximum current." + ((" Max current: %s." % e(cur)) if cur else ""),
                 "Always remove the propeller while wiring, configuring or bench testing.",
                 "The motor can be hot right after operation; let it cool before touching.",
                 "Keep metal debris away from the magnets; stop using the motor if the shaft is bent or the bearings are noisy."]
    body = '<div style="display:flex;gap:8pt;margin-bottom:5pt">%s</div>%s' % (isos, steps_html(steps))
    pages.append(("%s %s" % (name, L["install"]), body))
    pages.append(("%s %s" % (name, L["safety"]), notes_html(notes) + qr_block(d, lang)))
    return {"cover": cover, "pages": pages}


def steps_html(steps):
    """번호 목록 — 항목마다 블록(쪽 넘김 단위), 번호는 start 로 이어짐."""
    return "".join('<ol class="steps" start="%d"><li>%s</li></ol>' % (i, s) for i, s in enumerate(steps, start=1))


def notes_html(notes):
    return "".join('<ul class="dots"><li>%s</li></ul>' % n for n in notes)


# ─────────────── FC · ESC · GNSS · 카메라 (공용) ───────────────
T["ko"].update({"overview": "제품 외형", "pinout": "핀맵", "pins": "핀 정의", "pin_sub": "· 핀맵", "dim_sub": "· 치수", "notes_sub": "· 핀맵 참고",
                "fw": "펌웨어", "fw_sub": "· 제공 펌웨어", "kind": "종류", "version": "버전", "date": "날짜", "fw_note": "파일은 제품 페이지(QR)에서 받습니다.",
                "setup": "설치 및 설정", "params": "· 비행 컨트롤러 파라미터", "pname": "파라미터", "pvalue": "값", "pnote": "설명",
                "pin": "핀", "signal": "신호", "function": "기능"})
T["en"].update({"overview": "Overview", "pinout": "Pinout", "pins": "Pin Definition", "pin_sub": "· Pinout", "dim_sub": "· Dimensions", "notes_sub": "· Pinout Notes",
                "fw": "Firmware", "fw_sub": "· Available Firmware", "kind": "Type", "version": "Version", "date": "Date", "fw_note": "Download files from the product page (QR).",
                "setup": "Setup", "params": "· Flight Controller Parameters", "pname": "Parameter", "pvalue": "Value", "pnote": "Description",
                "pin": "Pin", "signal": "Signal", "function": "Function"})


def image_size(path):
    """그림 원래 크기(px) — PNG/JPG 는 헤더, SVG 는 viewBox."""
    p = Path(path)
    if p.suffix.lower() == ".svg":
        m = re.search(r'viewBox="[\d.\-]+\s+[\d.\-]+\s+([\d.]+)\s+([\d.]+)"', p.read_text(encoding="utf-8", errors="ignore")[:4000])
        return (float(m.group(1)), float(m.group(2))) if m else (None, None)
    from PIL import Image
    with Image.open(p) as im:
        return im.size


def ko_val(slug, v):
    return MP.KO_VALUE.get(slug, {}).get(v) or MP.KO_COMMON.get(v) or spec_value(v, "ko")


def product(d, lang, work, h):
    L, slug, name = T[lang], d["_slug"], d["name"]
    ko = lang == "ko"
    title = lambda sec: "%s %s" % (name, sec)
    pages = []
    cover_src = h["root"] / MP.COVER[slug] if slug in MP.COVER else (h["root"] / "public" / d["image"].lstrip("/") if d.get("image") else None)
    cover = h["white_background"](cover_src, work / "cover.png") if cover_src else None
    art = h["root"] / "tools" / "manual" / "art" / (slug + ".png")
    over = MP.OVERVIEW.get(slug, {}).get(lang) or d.get("tagline", "")
    body = ('<div class="fig" style="height:148pt"><img src="%s"></div><div class="gap"></div>' % h["fit"](art, 1300).as_uri()) if art.exists() else ""
    pages.append((title(L["overview"]), body + '<p style="margin:0">%s</p>' % e(over)))
    trs = "".join("<tr><th>%s</th><td>%s</td></tr>" % (e(SPEC_KO.get(s["key"], s["key"]) if ko else s["key"]), e(ko_val(slug, s["value"]) if ko else s["value"]))
                  for s in d.get("specs", []))
    if trs:
        pages.append((title(L["specs"]), '<div><div class="sub">%s</div><table class="t">%s</table></div>' % (L["basic"], trs)))
    for src in (d.get("pinoutImages") or ([d["pinoutImage"]] if d.get("pinoutImage") else [])):
        sub = L["dim_sub"] if "dimension" in src else L["pin_sub"]
        path = h["fit"](h["root"] / "public" / src.lstrip("/"), 1800)
        w, hh = image_size(path)
        if w and hh and w / hh > 1.12:                                      # 가로로 긴 그림은 90° 돌려 쪽 높이를 씀(읽을 때 책을 돌림)
            s = min(205.0 / w, 171.4 / hh)
            fig = '<div class="rot"><img src="%s" style="width:%.1fpt;height:%.1fpt"></div>' % (path.as_uri(), w * s, hh * s)
        else:
            fig = '<div class="fig" style="height:205pt"><img src="%s"></div>' % path.as_uri()
        pages.append((title(L["pinout"]), '<div><div class="sub">%s</div>%s</div>' % (sub, fig)))
    notes = (MP.PINOUT_NOTES_KO.get(slug) if ko else d.get("pinoutNotes")) or ""
    if notes.strip():
        paras = "".join('<p style="margin:0 0 4pt;font-size:6.9pt">%s</p>' % e(p) for p in notes.strip().split("\n\n"))
        pages.append((title(L["pinout"]), '<div class="sub">%s</div>%s' % (L["notes_sub"], paras)))
    if d.get("pinTable"):
        fn = lambda p: MP.PIN_KO.get(p["function"], p["function"]) if ko else p["function"]
        blocks = []
        for c in d["pinTable"]:
            meta = " · ".join(x for x in (c.get("type"), MP.PIN_KO.get(c.get("mapping"), c.get("mapping")) if ko else c.get("mapping")) if x)
            trs = "".join("<tr><td>%s</td><td>%s</td><td style=\"text-align:left\">%s</td></tr>" % (e(p["pin"]), e(p["signal"]), e(fn(p))) for p in c["pins"])
            blocks.append('<div><div class="sub">· %s</div><div class="note">%s</div><table class="g"><colgroup><col style="width:16%%"><col style="width:22%%"><col></colgroup>'
                          '<tr><th>%s</th><th>%s</th><th>%s</th></tr>%s</table></div>' % (e(c["name"]), e(meta), L["pin"], L["signal"], L["function"], trs))
        pages.append((title(L["pins"]), "".join(blocks)))
    if slug == "AP-RTK-X20D":
        trs = "".join("<tr><td><b>%s</b></td><td>%s</td><td style=\"text-align:left\">%s</td></tr>"
                      % (e(p["name"]), e(p["value"]), e(MP.X20D_PARAM_KO.get(p["name"], p.get("note", "")) if ko else p.get("note", ""))) for p in d.get("configParams", []))
        pages.append((title(L["setup"]), steps_html(MP.X20D_STEPS[lang]) +
                      '<div><div class="sub" style="margin-top:4pt">%s</div><table class="g k"><colgroup><col style="width:40%%"><col style="width:8%%"><col></colgroup>'
                      '<tr><th>%s</th><th>%s</th><th>%s</th></tr>%s</table></div>' % (L["params"], L["pname"], L["pvalue"], L["pnote"], trs)))
    else:
        steps = MP.CAT_SETUP(d["_cat"], slug, d, lang)
        if steps:
            pages.append((title(L["setup"]), steps_html(steps)))
    fw = d.get("firmware") or []
    if fw:
        trs = "".join("<tr><td style=\"text-align:left\">%s</td><td>%s</td><td>%s</td></tr>" % (e(f["kind"]), e(f["version"]), e(f.get("date", "—"))) for f in fw)
        pages.append((title(L["fw"]), '<div><div class="sub">%s</div><table class="g"><colgroup><col><col style="width:22%%"><col style="width:22%%"></colgroup>'
                                      '<tr><th>%s</th><th>%s</th><th>%s</th></tr>%s</table></div><div class="note">%s</div>'
                                      % (L["fw_sub"], L["kind"], L["version"], L["date"], trs, L["fw_note"])))
    pages.append((title(L["safety"]), notes_html(MP.CAT_NOTES(d["_cat"], slug, d, lang)) + qr_block(d, lang)))
    return {"cover": cover, "pages": pages}

BUILDERS = {"motor": motor, "fc": product, "esc": product, "gnss": product, "camera": product}


def spec_for(d, lang, work, helpers):
    if d["_cat"] not in BUILDERS:
        raise NotImplementedError("제품군 %s 매뉴얼 구성은 아직 없음" % d["_cat"])
    return BUILDERS[d["_cat"]](d, lang, Path(work), helpers)
