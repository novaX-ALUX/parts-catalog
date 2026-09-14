# 제품 사용자 매뉴얼 (Manual 탭 PDF)

카탈로그 md(제품 데이터 정본) → 제품군별 쪽 구성 → HTML → Chrome PDF → `public/manuals/<제품군>_<slug>_manual_<ko|en>.pdf` + 같은 이름 `.png`(Manual 탭 쪽 미리보기).
서식은 AP-RTK dual 사용자 매뉴얼(260714)을 실측해 맞췄다(판형 198.425 × 274.961 pt, 제목 띠, Pretendard 본문, 회색 표 머리칸, 쪽번호, QR, 뒷표지 novaX 로고).

```powershell
python tools/manual/build_manual.py fc/AF-H7E gnss/AP-RTK-X20D --lang ko,en   # 넘침 검사 실패 시 종료 코드 1
python tools/manual/manual_preview.py public/manuals/<이름>.pdf              # 받은 PDF 를 올릴 때 미리보기만 만들 경우
```

| 파일 | 역할 |
|---|---|
| `build_manual.py` | 진입점: md 읽기, 표지·뒷표지, CSS, 크롬 인쇄, 넘침 검사, 미리보기 |
| `manual_content.py` | 쪽 구성(모터 · FC/ESC/GNSS/카메라 공용), 스펙 키 번역 |
| `manual_products.py` | 제품별 문구(소개·주의·스펙 값 번역·핀 기능 번역) |
| `photo_lineart.py` | 사진 → 먹선(원격 PC GPU, Informative Drawings 가중치) |
| `clean_lineart.py` | 먹선 정리 → `art/<slug>.png` (저장소에 보관) |
| `manual_preview.py` | PDF → Manual 탭 쪽 격자 PNG |
| `translate_manual.py` | 받은 매뉴얼의 반대 언어판(AP-RTK dual → 영어, AF-F7 mini → 한국어): 원본 디자인 그대로, 번역할 글자 조각만 지우고 같은 기준선·굵기로 얹음 |

- **쪽 나누기**는 크롬이 실제 배치로 한다(`FLOW_JS`): 본문 블록을 넣다 넘치면 다음 쪽, 긴 표는 행 단위로 이어짐. 파이썬은 넘침 검사만.
- **대상**: FC · ESC · GNSS · 카메라. **모터는 매뉴얼을 만들지 않는다**(사용자 결정 2026-09-15 — Manual 탭도 없음).
- **그림**: 3D 제품 = 블렌더 렌더 → 먹선. 그 밖 = 제품 사진 → 먹선(원격 PC, `D:\remote-work\venvs\lineart` + `D:\remote-work\models\sk_model.pth`).
- **글꼴**(저장소에 넣지 않음): `tools/manual/.fonts/` 에 Pretendard 1.3.9 woff2(Light·Regular·Medium·SemiBold·Bold, `cdn.jsdelivr.net/npm/pretendard@1.3.9/dist/web/static/woff2/`) · GmarketSans Medium·Bold woff.
  번역판용 TTF(`…/dist/public/static/alternative/Pretendard-*.ttf`) — **OTF(CFF)는 PDF 에 넣으면 ( ) - × + & 가 다른 글자로 찍혀 쓰지 않는다.**
- **QR** = 카탈로그 제품 페이지 주소. QR 생성은 `qrcode-generator@1.4.4`(jsDelivr)를 인쇄 때 불러온다.
- 수치·핀 정의는 md 에서만 가져온다. 문구 파일에 수치를 적지 않는다.
