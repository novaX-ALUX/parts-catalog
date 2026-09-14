# -*- coding: utf-8 -*-
"""제품 사용자 매뉴얼 PDF(한국어·영어) — 카탈로그 md(제품 데이터 정본) → 제품군별 쪽 구성 → HTML → Chrome PDF → Manual 탭 미리보기 PNG.

실행: python tools/manual/build_manual.py fc/AF-H7E [gnss/AP-RTK-X20D ...] [--lang ko,en]   (모터는 매뉴얼 없음)
출력: public/manuals/<제품군>_<slug>_manual_<lang>.pdf (+ 같은 이름 .png), 작업물 tools/manual/.build/<slug>/
서식 = AP-RTK dual 사용자 매뉴얼 260714 실측(PyMuPDF): 판형 198.425 × 274.961 pt · 제목 띠 #231F20 (x 10.3, y 11.0, 177.8 × 18.9 pt)
       본문 Pretendard Light 7.8 pt · 소제목 Bold 8.8 pt · 표 머리칸 #DCDDDE, 선 0.3 pt · 쪽번호 Light 6.9 pt #77787B
       표지 GmarketSans Bold 23.5 / Medium 17.6 pt · 뒷표지 novaX 로고 = AF-F7 mini 매뉴얼 8쪽 채움 경로(벡터 그대로, #939599)
글꼴: tools/manual/.fonts/ (Pretendard OFL · GmarketSans, 저장소에 넣지 않음 — README.md 의 받는 곳 참고)
쪽 구성: manual_content.py · 제품별 문구: manual_products.py · 그림: 원격 PC AI 먹선(photo_lineart.py → art/)
"""
import argparse
import html
import json
import re
import subprocess
import sys
from pathlib import Path

import cv2
import fitz
import numpy as np
import yaml

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
sys.path.insert(0, str(HERE))
import manual_content as MC  # noqa: E402

CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
SITE = "https://novax-alux.github.io/parts-catalog"
LOGO_PDF = ROOT / "public" / "manuals" / "fc_AF-F7-mini_manual_en.pdf"      # novaX 로고 원본 벡터가 있는 쪽(8쪽)


def load_product(key):
    cat, slug = key.split("/")
    text = (ROOT / "src" / "content" / cat / (slug + ".md")).read_text(encoding="utf-8")
    data = yaml.safe_load(re.match(r"^---\r?\n([\s\S]*?)\r?\n---", text).group(1))
    data["_cat"], data["_slug"] = cat, slug
    data["_url"] = "%s/%s/%s/" % (SITE, cat, slug.lower())
    return data


def logo_svg(fill="#939599"):
    """F7 mini 매뉴얼 8쪽 novaX 채움 경로 → SVG(좌표·곡선 그대로, 짝홀 채움)."""
    page = fitz.open(LOGO_PDF)[7]
    paths, box = [], None
    for g in page.get_drawings():
        if g["type"] != "f":
            continue
        box = g["rect"] if box is None else box | g["rect"]
        d, cur = [], None
        for it in g["items"]:
            if it[0] == "re":
                r = it[1]
                d.append("M%.3f %.3fH%.3fV%.3fH%.3fZ" % (r.x0, r.y0, r.x1, r.y1, r.x0))
                cur = None
                continue
            if it[0] == "qu":
                q = it[1]
                d.append("M%.3f %.3fL%.3f %.3fL%.3f %.3fL%.3f %.3fZ" % (q.ul.x, q.ul.y, q.ur.x, q.ur.y, q.lr.x, q.lr.y, q.ll.x, q.ll.y))
                cur = None
                continue
            p0 = it[1]
            if cur is None or abs(cur.x - p0.x) > 1e-3 or abs(cur.y - p0.y) > 1e-3:
                d.append("M%.3f %.3f" % (p0.x, p0.y))
            if it[0] == "l":
                d.append("L%.3f %.3f" % (it[2].x, it[2].y))
                cur = it[2]
            elif it[0] == "c":
                d.append("C%.3f %.3f %.3f %.3f %.3f %.3f" % (it[2].x, it[2].y, it[3].x, it[3].y, it[4].x, it[4].y))
                cur = it[4]
        paths.append('<path fill-rule="evenodd" d="%sZ"/>' % "".join(d))
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="%.3f %.3f %.3f %.3f" fill="%s">%s</svg>' % (
        box.x0, box.y0, box.width, box.height, fill, "".join(paths))


def fit_image(src, work, max_px=1400):
    """PDF 에 넣을 그림을 인쇄 판형에 맞는 크기로(긴 변 max_px) — 흑백 그림은 8비트 회색 PNG. SVG 는 그대로."""
    src = Path(src)
    if src.suffix.lower() == ".svg":
        return src
    im = cv2.imread(str(src), cv2.IMREAD_UNCHANGED)
    if im.ndim == 3 and im.shape[2] == 4:
        a = im[:, :, 3:4].astype(np.float32) / 255
        im = (im[:, :, :3] * a + 255 * (1 - a)).astype(np.uint8)
    if im.ndim == 3 and float(np.abs(im[:, :, 0].astype(int) - im[:, :, 2]).mean()) < 2.0:
        im = cv2.cvtColor(im, cv2.COLOR_BGR2GRAY)
    h, w = im.shape[:2]
    s = min(1.0, max_px / max(h, w))
    if s < 1:
        im = cv2.resize(im, (int(w * s), int(h * s)), interpolation=cv2.INTER_AREA)
    if im.ndim == 3:                                                      # 컬러(사진·색 핀맵) = JPEG, 흑백 그림 = PNG
        dst = Path(work) / ("fit_%s.jpg" % src.stem)
        cv2.imwrite(str(dst), im, [cv2.IMWRITE_JPEG_QUALITY, 88])
    else:
        dst = Path(work) / ("fit_%s.png" % src.stem)
        cv2.imwrite(str(dst), im, [cv2.IMWRITE_PNG_COMPRESSION, 9])
    return dst


def white_background(src, dst, long_side=1200):
    """사진 바탕을 순백으로(표지용) — GrabCut: 가장자리 띠 = 확실한 배경, 가장자리 색과 가까운 화소 = 배경 후보."""
    im = cv2.imread(str(src), cv2.IMREAD_UNCHANGED)
    if im.ndim == 3 and im.shape[2] == 4:
        a = im[:, :, 3:4].astype(np.float32) / 255
        im = (im[:, :, :3] * a + 255 * (1 - a)).astype(np.uint8)
    h, w = im.shape[:2]
    s = min(1.0, long_side / max(h, w))
    im = cv2.resize(im, (int(w * s), int(h * s)), interpolation=cv2.INTER_AREA) if s < 1 else im
    h, w = im.shape[:2]
    k = 700 / max(h, w)
    small = cv2.resize(im, (int(w * k), int(h * k)), interpolation=cv2.INTER_AREA)
    lab = cv2.cvtColor(small, cv2.COLOR_BGR2LAB).astype(np.float32)
    b = max(4, int(0.02 * max(small.shape[:2])))
    border = np.concatenate([lab[:b].reshape(-1, 3), lab[-b:].reshape(-1, 3), lab[:, :b].reshape(-1, 3), lab[:, -b:].reshape(-1, 3)])
    dist = np.linalg.norm(lab - np.median(border, axis=0), axis=2)
    mask = np.full(small.shape[:2], cv2.GC_PR_FGD, np.uint8)
    mask[dist < 9] = cv2.GC_PR_BGD
    mask[:b], mask[-b:], mask[:, :b], mask[:, -b:] = cv2.GC_BGD, cv2.GC_BGD, cv2.GC_BGD, cv2.GC_BGD
    cv2.grabCut(small, mask, None, np.zeros((1, 65)), np.zeros((1, 65)), 6, cv2.GC_INIT_WITH_MASK)
    fg = ((mask == cv2.GC_FGD) | (mask == cv2.GC_PR_FGD)).astype(np.float32)
    fg = cv2.resize(fg, (w, h), interpolation=cv2.INTER_LINEAR)
    fg = cv2.GaussianBlur((fg > 0.5).astype(np.float32), (0, 0), 1.2)[:, :, None]
    out = (im.astype(np.float32) * fg + 255 * (1 - fg)).astype(np.uint8)
    ys, xs = np.nonzero(fg[:, :, 0] > 0.5)
    pad = 12
    out = out[max(ys.min() - pad, 0):ys.max() + pad, max(xs.min() - pad, 0):xs.max() + pad]
    dst = Path(dst).with_suffix(".jpg")                                  # 표지 사진은 JPEG(용량)
    cv2.imwrite(str(dst), out, [cv2.IMWRITE_JPEG_QUALITY, 90])
    return dst


def esc(s):
    return html.escape(str(s))


CSS = """
@font-face{font-family:Pretendard;font-weight:300;src:url('{F}/Pretendard-Light.woff2')}
@font-face{font-family:Pretendard;font-weight:400;src:url('{F}/Pretendard-Regular.woff2')}
@font-face{font-family:Pretendard;font-weight:500;src:url('{F}/Pretendard-Medium.woff2')}
@font-face{font-family:Pretendard;font-weight:600;src:url('{F}/Pretendard-SemiBold.woff2')}
@font-face{font-family:Pretendard;font-weight:700;src:url('{F}/Pretendard-Bold.woff2')}
@font-face{font-family:GmarketSans;font-weight:500;src:url('{F}/GmarketSansMedium.woff')}
@font-face{font-family:GmarketSans;font-weight:700;src:url('{F}/GmarketSansBold.woff')}
@page{size:198.425pt 274.961pt;margin:0}
*{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}
html,body{margin:0;padding:0;background:#fff}
body{font-family:Pretendard,sans-serif;color:#231f20;font-weight:300;font-size:7.8pt;line-height:1.23;word-break:keep-all;overflow-wrap:anywhere}
.page{width:198.425pt;height:274.961pt;position:relative;overflow:hidden;break-after:page;page-break-after:always}
.bar{position:absolute;left:10.3pt;top:11pt;width:177.8pt;height:18.9pt;background:#231f20}
.bar h1{margin:0;padding-left:7.2pt;font-weight:700;font-size:12.7pt;line-height:18.9pt;color:#fff;white-space:nowrap;letter-spacing:-0.2pt}
.body{position:absolute;left:13.5pt;right:13.5pt;top:34.6pt;bottom:19pt;display:flex;flex-direction:column}
.body > *{flex-shrink:0}
.sub{font-weight:700;font-size:8.8pt;margin:0 0 2pt;line-height:1.35}
.sub + .sub{margin-top:0}
.gap{height:7pt}
.pno{position:absolute;left:0;right:0;top:258.7pt;text-align:center;font-size:6.9pt;color:#77787b}
table.t{width:100%;border-collapse:collapse;margin:0 0 6pt}
table.t th,table.t td{border-top:0.3pt solid #231f20;border-bottom:0.3pt solid #231f20;padding:2pt 2pt;text-align:center;vertical-align:middle}
table.k td:first-child{overflow-wrap:normal;word-break:keep-all;white-space:nowrap;font-size:6.2pt}
.rot{position:relative;width:100%;height:205pt}
.rot img{position:absolute;left:50%;top:50%;max-width:none;max-height:none;transform:translate(-50%,-50%) rotate(-90deg)}
table.t th{background:#dcddde;font-weight:500;width:36%}
table.t td{font-weight:300}
table.g{width:100%;border-collapse:collapse;margin:1pt 0 5pt;font-size:6.6pt}
table.g{table-layout:fixed}
table.g th{background:#dcddde;font-weight:500;padding:1.6pt 0.3pt;border-top:0.3pt solid #231f20;border-bottom:0.3pt solid #231f20;overflow-wrap:normal;word-break:keep-all;line-height:1.15}
table.g td{padding:0.9pt 0.3pt;text-align:center;border-bottom:0.3pt solid #231f20;line-height:1.15}
.note{font-size:6.3pt;color:#231f20;margin:0 0 2.5pt;line-height:1.2}
.fig{display:flex;justify-content:center;align-items:center}
.fig img{display:block;max-width:100%;max-height:100%}
.cap{text-align:center;font-size:6.9pt;margin-top:1.5pt}
ol.steps{margin:0;padding-left:10pt}
ol.steps li{margin:0 0 3.2pt}
ul.dots{list-style:none;margin:0;padding:0}
ul.dots li{position:relative;padding-left:6pt;margin:0 0 3.6pt}
ul.dots li:before{content:'·';position:absolute;left:0;font-weight:700}
.cover-title{position:absolute;left:0;right:0;top:22pt;text-align:center;font-family:GmarketSans,sans-serif;font-weight:700;font-size:23.5pt;line-height:1.25;letter-spacing:-0.3pt}
.cover-sub{position:absolute;left:0;right:0;top:56pt;text-align:center;font-family:GmarketSans,sans-serif;font-weight:500;font-size:17.6pt}
.cover-img{position:absolute;left:18pt;right:18pt;top:92pt;bottom:22pt;display:flex;align-items:center;justify-content:center}
.cover-img img{max-width:100%;max-height:100%}
.back-logo{position:absolute;left:74pt;width:50.4pt;top:130.7pt}
.qr{margin-top:auto;align-self:flex-end;width:66pt;background:#dcddde;padding:5pt 6pt 3pt;text-align:center}
.qr .code{background:#fff;padding:3pt}
.qr .code svg{display:block;width:100%;height:auto}
.qr .lbl{font-weight:500;font-size:6.6pt;margin-top:2.5pt;white-space:nowrap}
"""


def page(title, body):
    width = sum(0.98 if "가" <= ch <= "힣" else 0.58 for ch in title)          # 굵은 글자 폭(em) 어림 — 띠(170 pt) 안에 들게 글자 크기 조절
    size = min(12.7, 168.0 / max(width, 1))
    return ('<section class="page" data-flow="1"><div class="bar"><h1 style="font-size:%.1fpt">%s</h1></div><div class="body">%s</div><div class="pno"></div></section>'
            % (size, esc(title), body))


# 쪽 나누기는 크롬이 실제 배치로 한다: 본문 블록(.body 의 자식)을 차례로 넣다가 넘치면 다음 쪽으로,
# 빈 쪽에도 안 들어가는 표는 행 단위로 이어 쪽에 나눈다(머리 행 반복). 마지막에 쪽번호(표지·뒷표지 제외).
FLOW_JS = r"""
function flowPages(){
  const fits = b => b.scrollHeight <= b.clientHeight + 0.5;
  for (const pg of [...document.querySelectorAll('section.page[data-flow]')]) {
    const blocks = [...pg.querySelector('.body').children];
    pg.querySelector('.body').innerHTML = '';
    let cur = pg, body = pg.querySelector('.body');
    const fresh = () => { const p = pg.cloneNode(true); p.querySelector('.body').innerHTML = ''; cur.after(p); cur = p; body = p.querySelector('.body'); };
    const queue = blocks.slice();
    while (queue.length) {
      const b = queue.shift();
      const had = body.children.length > 0;
      body.appendChild(b);
      if (fits(body)) continue;
      if (had) { b.remove(); fresh(); body.appendChild(b); if (fits(body)) continue; }
      const t = b.tagName === 'TABLE' ? b : b.querySelector('table');
      if (!t) continue;
      const head = [...t.rows].filter(r => !r.querySelector('td')).length;
      const cont = b.cloneNode(true);
      const ct = cont.tagName === 'TABLE' ? cont : cont.querySelector('table');
      [...ct.rows].slice(head).forEach(r => r.remove());
      const tb = ct.tBodies[0] || ct;
      let moved = 0;
      while (!fits(body) && t.rows.length > head + 1) {
        const r = t.rows[t.rows.length - 1];
        const first = [...tb.rows].find(x => x.querySelector('td'));
        tb.insertBefore(r, first || null);
        moved++;
      }
      if (moved) queue.unshift(cont);
    }
  }
  const all = [...document.querySelectorAll('section.page')];
  all.forEach((p, i) => { const n = p.querySelector('.pno'); if (n && i > 0 && i < all.length - 1) n.textContent = '- ' + i + ' -'; });
  document.body.dataset.flowDone = all.length;
}
document.querySelectorAll('.qr .code').forEach(function(e){var q=qrcode(0,'M');q.addData(e.dataset.url);q.make();e.innerHTML=q.createSvgTag({scalable:true,margin:0});});
document.fonts.ready.then(flowPages);
"""


def build(key, lang, fonts_url, logo):
    d = load_product(key)
    work = HERE / ".build" / d["_slug"]
    work.mkdir(parents=True, exist_ok=True)
    spec = MC.spec_for(d, lang, work, helpers={"white_background": white_background, "root": ROOT,
                                               "fit": lambda p, max_px=1400: fit_image(p, work, max_px)})
    cover_img = '<div class="cover-img"><img src="%s"></div>' % spec["cover"].as_uri() if spec.get("cover") else ""
    pages = ['<section class="page"><div class="cover-title">%s</div><div class="cover-sub">User Guide</div>%s</section>' % (esc(d["name"]), cover_img)]
    for title, body in spec["pages"]:
        pages.append(page(title, body))
    pages.append('<section class="page"><div class="back-logo">%s</div></section>' % logo)
    qr_js = '<script src="https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.js"></script><script>%s</script>' % FLOW_JS
    doc = ('<!doctype html><html lang="%s"><head><meta charset="utf-8"><title>%s User Guide</title><style>%s</style></head><body>%s%s</body></html>'
           % (lang, esc(d["name"]), CSS.replace("{F}", fonts_url), "".join(pages), qr_js))
    src = work / ("manual_%s.html" % lang)
    src.write_text(doc, encoding="utf-8")
    pdf = ROOT / "public" / "manuals" / ("%s_%s_manual_%s.pdf" % (d["_cat"], d["_slug"], lang))
    subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--no-pdf-header-footer", "--run-all-compositor-stages-before-draw",
                    "--virtual-time-budget=15000", "--print-to-pdf=" + str(pdf), src.as_uri()], check=True, capture_output=True)
    out = fitz.open(pdf)
    fonts = sorted({f[3].split("+")[-1] for p in out for f in p.get_fonts()})
    sizes = {tuple(round(v, 1) for v in p.rect[2:]) for p in out}
    problems = overflow(out)
    subprocess.run([sys.executable, str(HERE / "manual_preview.py"), str(pdf)], check=True, capture_output=True)
    return {"pdf": str(pdf), "pages": out.page_count, "page_size_pt": sorted(sizes), "fonts": fonts, "kb": pdf.stat().st_size // 1024,
            "overflow": problems}


def overflow(doc, bottom=256.0, right=186.5):
    """넘침 검사: 본문 쪽(표지·뒷표지 제외)에서 쪽번호 영역(y > 256 pt)이나 오른쪽 여백을 침범한 글자·그림·선."""
    bad = []
    for n in range(1, doc.page_count - 1):
        p = doc[n]
        for b in p.get_text("dict")["blocks"]:
            for ln in b.get("lines", []):
                for s in ln["spans"]:
                    t = s["text"].strip()
                    if t and not re.fullmatch(r"- \d+ -", t) and (s["bbox"][3] > bottom or s["bbox"][2] > right):
                        bad.append("p%d text %r" % (n, t[:20]))
        for im in p.get_image_info():
            if im["bbox"][3] > bottom + 0.5 or im["bbox"][2] > right + 0.5:
                bad.append("p%d image" % n)
        for g in p.get_drawings():
            if g["rect"].y1 > bottom + 0.5 and g["rect"].height < 200:
                bad.append("p%d line/box" % n)
    return sorted(set(bad))


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("products", nargs="+")
    ap.add_argument("--lang", default="ko,en")
    a = ap.parse_args()
    fonts_url = (HERE / ".fonts").as_uri()
    logo = logo_svg()
    failed = False
    for key in a.products:
        for lang in a.lang.split(","):
            r = build(key, lang, fonts_url, logo)
            failed |= bool(r["overflow"])
            print(key, lang, json.dumps(r, ensure_ascii=False))
    sys.exit(1 if failed else 0)
