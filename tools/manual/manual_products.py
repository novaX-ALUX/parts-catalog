# -*- coding: utf-8 -*-
"""매뉴얼 문구(제품별·제품군별, 한국어/영어). 수치·핀 정의는 카탈로그 md 가 정본 — 여기에는 번역과 사용 안내만 둔다.

KO_VALUE[제품][영문 값] = 한국어 값 (스펙 값 중 문장형만. 기술 표기는 영어 그대로)
OVERVIEW[제품] = {"ko", "en"}   · EXTRA[제품] = {"ko": [주의], "en": [...]} 제품 전용 주의
CAT_SETUP/CAT_NOTES[제품군](d) = 제품군 공통 설치 단계·주의(스펙 값을 md 에서 읽어 넣음)
PIN_KO = 핀 기능 영문 → 한국어(Lite pinTable)
"""


def spec(d, key):
    return next((s["value"] for s in d.get("specs", []) if s["key"] == key), None)


KO_VALUE = {
    "AE-6S-60A-FOC-TI": {
        "Sensorless FOC (InstaSPIN-FAST)": "센서리스 FOC (InstaSPIN-FAST)", "6S LiPo (max 25.2 V)": "6S LiPo (최대 25.2 V)",
        "JSM6288T half-bridge modules": "JSM6288T 하프브리지 모듈", "MT6701 magnetic encoder (prop parking)": "MT6701 자기 엔코더 (프로펠러 정위치 정지)",
        "DroneCAN ESC status + flight recorder (on-board flash)": "DroneCAN ESC 상태 + 비행 기록 (보드 내장 플래시)",
        "CMPSS hardware overcurrent, trip-zone safe-off, stall supervision": "CMPSS 하드웨어 과전류 보호 · 트립존 안전 차단 · 멈춤 감시"},
    "AC-C2M104L": {"M12 S mount": "M12 S 마운트"},
    "AC-GM1X": {"19 mm FPV Camera": "19 mm FPV 카메라", "Pitch ±120°": "피치 ±120°"},
    "AC-THE02F": {"Typ. 30 Hz": "일반 30 Hz"},
    "AF-F4-nano-v2": {
        "MAX-M10S — via external GPS module (not onboard)": "MAX-M10S — 외장 GPS 모듈 (보드에 없음)",
        "QMC5883P — on external GPS module (not onboard)": "QMC5883P — 외장 GPS 모듈 (보드에 없음)",
        "6-pin connector (UART TX/RX + I2C SCL/SDA)": "6핀 커넥터 (UART TX/RX + I2C SCL/SDA)",
        "5 channels in current novaX ArduPilot configuration": "5채널 (현재 novaX ArduPilot 설정)",
        "3 hardware UARTs + USB in current novaX ArduPilot configuration": "하드웨어 UART 3개 + USB (현재 novaX ArduPilot 설정)",
        "microSD card": "microSD 카드"},
    "AF-F4-nano": {
        "SPL06 (current novaX hardware definition)": "SPL06 (현재 novaX 하드웨어 정의)", "USB Type-C (Firmware & Power)": "USB Type-C (펌웨어 · 전원)",
        "8 motor/servo channels + 1 LED channel": "모터/서보 8채널 + LED 1채널",
        "6 hardware UARTs + USB configured; verify connector pinout": "하드웨어 UART 6개 + USB (커넥터 핀맵 확인 필요)",
        "novaX ArduPilot (released); Betaflight board configuration available": "novaX ArduPilot (배포) · Betaflight 보드 설정 제공"},
    "AF-H7-nano": {
        "USB-C (Firmware & Power)": "USB-C (펌웨어 · 전원)", "10 motor/servo channels + 1 WS2812 LED channel": "모터/서보 10채널 + WS2812 LED 1채널",
        "novaX ArduPilot (released); Betaflight board configuration available": "novaX ArduPilot (배포) · Betaflight 보드 설정 제공"},
    "AF-H7E": {
        "BMI088 (Accel/Gyro)": "BMI088 (가속도/자이로)", "4.75 – 5.7 V (Rated 5 V)": "4.75 – 5.7 V (정격 5 V)",
        "8 FMU + 8 IOMCU channels": "FMU 8 + IOMCU 8 채널", "Analog / PWM": "아날로그 / PWM",
        "7 peripheral serial interfaces + dedicated IOMCU link": "주변장치 시리얼 7개 + IOMCU 전용 링크",
        "4 configured buses including internal sensors; 3 exposed on multifunction ports": "내부 센서 포함 4개 버스 · 다기능 포트에 3개",
        "VBat/Current + Aux Analog Input": "배터리 전압/전류 + 보조 아날로그 입력", "Pixhawk FMUv6x Standard": "Pixhawk FMUv6x 표준",
        "99 g (Core 43g + Baseboard 56g)": "99 g (코어 43 g + 베이스보드 56 g)",
        "novaX ArduPilot (Copter and Plane releases)": "novaX ArduPilot (Copter · Plane 배포)", "100 Mbps x 1 Port": "100 Mbps × 1 포트"},
    "AP-M10": {
        "u-blox M10 Series": "u-blox M10 시리즈", "L1 Band Only": "L1 대역 전용", "Built-in Ceramic Patch": "내장 세라믹 패치",
        "H 1.5 m / V 2.5 m (RMS)": "수평 1.5 m / 수직 2.5 m (RMS)", "< 27 sec": "27초 미만", "< 1 sec": "1초 미만",
        "1 – 18 Hz (Default 10 Hz)": "1 – 18 Hz (기본 10 Hz)"},
    "AP-RTK-X20D": {
        "u-blox ZED-X20D — single module, dual antenna, HDG 2.00": "u-blox ZED-X20D — 단일 모듈 · 듀얼 안테나 · HDG 2.00",
        "All-band GNSS on both antennas (L1 / L2 / L5 / L6)": "두 안테나 모두 전 대역 GNSS (L1 / L2 / L5 / L6)",
        "PNI RM3100 on I2C3 — axis qualification pending": "PNI RM3100 (I2C3) — 축 검증 진행 중",
        "Receiver-computed ANT1-to-ANT2 heading; UBX-NAV-DAHEADING v2": "수신기가 계산한 ANT1→ANT2 헤딩 · UBX-NAV-DAHEADING v2",
        "Firmware requests 5 Hz navigation at 230400 baud; end-to-end CAN rate requires measurement": "5 Hz 항법 설정 (230400 baud) · CAN 종단 갱신율은 측정 필요",
        "DroneCAN — position, ardupilot.gnss.Heading and separate magnetometer data": "DroneCAN — 위치 · ardupilot.gnss.Heading · 별도 나침반 데이터",
        "2× MMCX antenna · CAN · UART (RTCM input) · DEBUG (SWD + console) · PPS/EVENT · USB-C (MCU)": "MMCX 안테나 2 · CAN · UART (RTCM 입력) · DEBUG (SWD + 콘솔) · PPS/EVENT · USB-C (MCU)",
        "R3 · 33.00 × 45.17 mm · 4 layers · 0.8 mm": "R3 · 33.00 × 45.17 mm · 4층 · 0.8 mm",
        "AP_Periph · novaX 1.0.1 engineering release · board ID 6205": "AP_Periph · novaX 1.0.1 엔지니어링 릴리스 · 보드 ID 6205",
        "Windows GCC 10.2.1 build verified; first-article hardware and flight qualification pending": "Windows GCC 10.2.1 빌드 검증 · 초도품 하드웨어·비행 검증 대기"},
}
KO_COMMON = {"Supported": "지원", "None": "없음"}

# 표지 그림을 카탈로그 image 대신 쓸 때(저장소 기준 경로) — X20D = 케이스 렌더(원격 PC 블렌더)에서 따로 뽑은 표지
COVER = {"AP-RTK-X20D": "tools/manual/art/AP-RTK-X20D_cover.jpg"}

OVERVIEW = {
    "AE-4S-50A": {"ko": "4S 32비트 ESC 로 45.5 × 52.2 mm 크기에 연속 50 A 를 냅니다. BLHeli-S · novaX ef 1.0 펌웨어를 지원하며 Blade8 급 기체용입니다.",
                  "en": "Compact 4S 32-bit ESC delivering 50 A continuous in a 45.5 × 52.2 mm footprint. Supports BLHeli-S and novaX ef 1.0 firmware for Blade8-class platforms."},
    "AE-4S-55A": {"ko": "4S 32비트 ESC 로 45.5 × 52.2 mm 크기에 연속 55 A 를 냅니다. BLHeli-S · novaX ef 1.0 펌웨어를 지원하며 Blade8 급 기체용입니다.",
                  "en": "Compact 4S 32-bit ESC delivering 55 A continuous in a 45.5 × 52.2 mm footprint. Supports BLHeli-S and novaX ef 1.0 firmware for Blade8-class platforms."},
    "AE-6S-60A": {"ko": "6S LiPo · 연속 60 A 32비트 ESC 입니다. DShot150/300/600 · MultiShot · OneShot 과 BDShot 텔레메트리를 지원하고 AM32 · novaX ef 1.0 펌웨어로 동작합니다.",
                  "en": "32-bit ESC rated for 6S LiPo and 60 A continuous. Supports DShot150/300/600, MultiShot and OneShot with BDShot telemetry, running AM32 or novaX ef 1.0 firmware."},
    "AE-6S-60A-BC": {"ko": "6S LiPo · 연속 60 A 32비트 ESC 로, BC(Battery Connector) 모델은 배터리 커넥터가 달려 있어 납땜 없이 배터리를 연결합니다. BDShot 텔레메트리와 AM32 · novaX ef 1.0 펌웨어를 지원합니다.",
                     "en": "32-bit ESC rated for 6S LiPo and 60 A continuous. The BC (Battery Connector) variant ships with a battery connector for solderless hookup. Supports BDShot telemetry and AM32 / novaX ef 1.0 firmware."},
    "AE-8S-60A": {"ko": "8S LiPo · 연속 60 A 고전압 32비트 ESC 입니다. 6S 모델과 같은 DShot / AM32 펌웨어를 쓰며, 56 × 57 mm 로 넓혀 대전류 방열을 늘렸습니다.",
                  "en": "High-voltage 32-bit ESC rated for 8S LiPo at 60 A continuous. Shares the DShot / AM32 firmware stack with the 6S model on an enlarged 56 × 57 mm board for heat dissipation."},
    "AE-6S-60A-FOC-TI": {"ko": "TI C2000 실시간 MCU(TMS320F280049C) 기반 센서리스 FOC ESC 입니다. DroneCAN 으로 스로틀과 텔레메트리를 주고받고, MT6701 자기 엔코더로 프로펠러를 정위치에 세웁니다.",
                         "en": "Field-oriented-control ESC on the TI C2000 real-time MCU (TMS320F280049C). Runs sensorless FOC, uses DroneCAN for throttle and telemetry, and parks the propeller with an MT6701 magnetic encoder."},
    "AC-C2M104L": {"ko": "1920 × 1080 FPV 카메라 모듈로, 이미지 센서 · ISP · 통신 인터페이스를 한 모듈에 넣었습니다.",
                   "en": "1920 × 1080 FPV camera module with the image sensor, ISP and communication interface integrated in one compact unit."},
    "AC-GM1X": {"ko": "19 mm 카메라용 FPV 짐벌입니다. ±0.005° 안정화와 피치 ±120° 구동으로 FPV · 점검 영상을 흔들림 없이 촬영합니다.",
                "en": "FPV gimbal for 19 mm cameras, providing ±0.005° stabilization and ±120° pitch travel for FPV and inspection footage."},
    "AC-THE02F": {"ko": "VOx 검출기 기반 열화상 모듈로, 용도에 맞게 SoC(USB 출력) · FPGA(CVBS 출력) 두 가지가 있습니다.",
                  "en": "Thermal imaging module based on a VOx detector, available in SoC (USB output) and FPGA (CVBS output) variants."},
    "AF-F4-nano-v2": {"ko": "STM32F405 · ICM-42688-P · DPS368 을 올린 소형 F4 비행 컨트롤러입니다. GNSS 와 나침반은 외장이며 6핀 GPS 포트(USART1 + I2C1)로 연결합니다.",
                      "en": "Compact F4 flight controller with STM32F405, ICM-42688-P and DPS368. GNSS and compass are external, connected through the 6-pin GPS port (USART1 + I2C1)."},
    "AF-F4-nano": {"ko": "STM32F405 · ICM-42688-P 소형 비행 컨트롤러입니다. novaX 하드웨어 정의로 SPL06 기압계, 모터/서보 8채널, LED 1채널, UART 6개 + USB 를 씁니다.",
                   "en": "Compact STM32F405 flight controller with an ICM-42688-P IMU. The novaX hardware definition configures an SPL06 barometer, 8 motor/servo outputs, 1 LED output and 6 UARTs plus USB."},
    "AF-H7-nano": {"ko": "STM32H743 · ICM-42688-P 2개를 올린 소형 비행 컨트롤러입니다. 모터/서보 10채널, WS2812 LED 1채널, UART 7개를 쓰며 2–8S 입력을 받습니다.",
                   "en": "Compact STM32H743 flight controller with two ICM-42688-P IMUs. Provides 10 motor/servo outputs, 1 WS2812 LED output and 7 UARTs with 2–8S input."},
    "AF-H7E": {"ko": "Pixhawk FMUv6x 구조의 모듈형 STM32H753 비행 컨트롤러입니다. IMU 3종 · RM3100 나침반 · ICP-20100 기압계 2개, FMU 8 + IOMCU 8 출력, CAN 2 · 이더넷을 갖췄습니다.",
               "en": "Modular STM32H753 flight controller on the Pixhawk FMUv6x architecture with three IMUs, an RM3100 compass, two ICP-20100 barometers, 8 FMU + 8 IOMCU outputs, 2 CAN ports and Ethernet."},
    "AF-H7E-Lite": {"ko": "AF-H7E 센서 모듈을 그대로 쓰는 소형 캐리어 비행 컨트롤러입니다(개발 중). 핀 정의는 출시 전 바뀔 수 있습니다.",
                    "en": "Compact carrier flight controller that reuses the AF-H7E sensor module (in development). The pin definition may change before release."},
    "AP-M10": {"ko": "u-blox M10 시리즈 GNSS 모듈로 BMM350 나침반과 세라믹 패치 안테나가 들어 있습니다. 다중 위성(BDS/GPS/GLONASS/Galileo/QZSS)을 수신합니다.",
               "en": "Compact u-blox M10 GNSS module with an integrated BMM350 compass and ceramic patch antenna, tracking BDS / GPS / GLONASS / Galileo / QZSS."},
    "AP-RTK-X20D": {"ko": "u-blox ZED-X20D 전 대역 수신기 하나와 안테나 2개로 RTK 위치와 헤딩을 냅니다. 위치 · 헤딩 · RM3100 나침반 값을 DroneCAN 으로 FC 에 보냅니다(엔지니어링 평가용).",
                    "en": "One u-blox ZED-X20D all-band receiver and two antennas provide RTK position and heading, forwarded with RM3100 compass data to the flight controller over DroneCAN (engineering evaluation)."},
}

EXTRA = {
    "AE-6S-60A-BC": {"ko": ["T10 설정 이미지는 모든 ESC 를 정방향으로 두므로, 반대로 돌 모터는 FC 의 SERVO_BLH_RVMASK 로 뒤집습니다."],
                     "en": ["The T10 preset image sets every ESC to normal rotation; reverse the motors that need it with the flight controller's SERVO_BLH_RVMASK."]},
    "AE-6S-60A-FOC-TI": {"ko": ["처음 한 번은 BootApp .hex 를 SWD/JTAG(UniFlash)로 굽고, 그다음부터는 앱 .bin 을 DroneCAN 으로 갱신합니다."],
                         "en": ["Flash the BootApp .hex once over SWD/JTAG (UniFlash); after that update the application .bin over DroneCAN."]},
    "AF-H7E": {"ko": ["서보 레일(0 – 9.9 V)은 외부 BEC 로 공급합니다.", "Copter 와 Plane 은 같은 보드 ID(6202)이므로 파일 이름으로 골라 올립니다."],
               "en": ["Supply the servo rail (0 – 9.9 V) from an external BEC.", "Copter and Plane share board ID 6202 — pick the image by file name."]},
    "AF-H7E-Lite": {"ko": ["개발 중인 제품입니다. 핀 정의는 출시 전에 바뀔 수 있으니 최신 카탈로그를 확인하십시오.", "PWM 서보 레일(+)은 외부 BEC 로 공급합니다."],
                    "en": ["Product in development — the pin definition may change before release; check the latest catalog.", "Supply the PWM servo rail (+) from an external BEC."]},
    "AF-H7-nano": {"ko": ["서보 레일은 조정되지 않은 전원입니다. BEC 나 PDB 에서 직접 공급하십시오.", "보드 ID 6200 전용 novaX 펌웨어만 쓰십시오(Matek 펌웨어 대체 금지)."],
                   "en": ["The servo rail is unregulated — feed it directly from a BEC or PDB.", "Use only the novaX image for board ID 6200 (do not substitute Matek firmware)."]},
    "AF-F4-nano-v2": {"ko": ["외장 GPS/나침반이 없으면 위치·방향 기반 비행 모드를 쓸 수 없습니다."],
                      "en": ["Without the external GPS / compass, position- and heading-based flight modes are unavailable."]},
    "AP-RTK-X20D": {"ko": ["엔지니어링 평가용 펌웨어(1.0.1)입니다. 초도품 하드웨어·비행 검증 전에는 비행에 쓰지 마십시오.",
                           "안테나 방향이 AP-RTK dual 과 반대입니다(ANT1 뒤, ANT2 앞). 케이블을 바꿔 끼우면 헤딩이 180° 틀어집니다.",
                           "보드 ID 6205 전용입니다. dual(1085) · G5H(6206) 이미지를 올리지 마십시오."],
                    "en": ["Firmware 1.0.1 is an engineering release — do not fly before first-article hardware and flight qualification.",
                           "Antenna direction is opposite to AP-RTK dual (ANT1 rear, ANT2 front); swapped cables give a 180° heading error.",
                           "Board ID 6205 only — never flash dual (1085) or G5H (6206) images."]},
    "AC-THE02F": {"ko": ["태양이나 용접 불꽃 같은 강한 열원을 직접 비추지 마십시오. 검출기가 손상될 수 있습니다."],
                  "en": ["Never point the camera at the sun or intense heat sources such as welding arcs; the detector can be damaged."]},
}

X20D_STEPS = {
    "ko": ["<b>안테나 방향</b> — ANT1(RF_IN_1)을 뒤, ANT2(RF_IN_2)를 앞에 둡니다. 두 안테나는 기체 중심선 위 같은 높이에 두고 기선 길이를 잽니다.",
           "<b>H7E 연결</b> — DroneCAN 으로 연결하고 아래 파라미터를 넣습니다. X20D 용 H7E 펌웨어를 따로 빌드할 필요는 없습니다.",
           "<b>위치 오프셋</b> — 무게중심 기준 ANT1 위치를 재서 GPS1_POS_X/Y/Z 에 넣습니다(+X 앞, +Y 오른쪽, +Z 아래).",
           "<b>초도품 점검</b> — 수신기 기동, RTK 보정, 위치, 알려진 방향에서의 헤딩, 신호 재획득, RM3100 축, 전원·업데이트 경로를 벤치에서 먼저 확인합니다."],
    "en": ["<b>Antenna direction</b> — ANT1 (RF_IN_1) at the rear, ANT2 (RF_IN_2) at the front, on the centerline at equal height; measure the baseline.",
           "<b>H7E connection</b> — Connect over DroneCAN and set the parameters below. No X20D-specific H7E firmware build is needed.",
           "<b>Position offset</b> — Measure ANT1 relative to the centre of gravity and enter GPS1_POS_X/Y/Z (+X forward, +Y right, +Z down).",
           "<b>First-article checks</b> — On the bench, confirm receiver startup, RTK corrections, position, heading at known directions, reacquisition, RM3100 axes, power and update paths."],
}


_LANG = {"lang": "en", "slug": ""}


def _v(d, key, fmt):
    """스펙 값을 문구에 넣음 — 한국어판은 값도 번역(KO_VALUE)."""
    v = spec(d, key)
    if not v:
        return ""
    if _LANG["lang"] == "ko":
        v = KO_VALUE.get(_LANG["slug"], {}).get(v) or KO_COMMON.get(v) or v
    return fmt % v


def CAT_SETUP(cat, slug, d, lang):
    ko = lang == "ko"
    _LANG.update(lang=lang, slug=slug)
    if cat == "fc":
        return ([f"<b>장착</b> — 보드 앞 방향을 기체 앞쪽에 맞춰 방진 마운트로 고정합니다. 다르게 달면 AHRS_ORIENTATION 으로 맞춥니다.{_v(d, 'Mount Hole', ' 고정 구멍: %s.')}",
                 f"<b>전원</b> — 동작 전압 범위의 전원을 연결하고 극성을 먼저 확인합니다.{_v(d, 'Operating Voltage', ' 동작 전압: %s.')}",
                 "<b>주변장치</b> — 수신기 · GPS/나침반 · ESC 를 핀맵에 맞게 연결합니다.",
                 "<b>펌웨어</b> — 카탈로그 웹 업데이트에서 이 제품 전용 novaX ArduPilot 펌웨어를 올립니다. 다른 보드 펌웨어는 쓰지 않습니다.",
                 "<b>초기 설정</b> — Mission Planner 등에서 기체 형식, 가속도계·나침반·조종기 보정, 비행 모드와 페일세이프를 설정합니다."] if ko else
                [f"<b>Mounting</b> — Align the board's forward direction with the vehicle nose on a vibration-damped mount; otherwise set AHRS_ORIENTATION.{_v(d, 'Mount Hole', ' Mounting: %s.')}",
                 f"<b>Power</b> — Supply power within the operating range and check polarity first.{_v(d, 'Operating Voltage', ' Operating voltage: %s.')}",
                 "<b>Peripherals</b> — Connect the receiver, GPS / compass and ESCs according to the pinout.",
                 "<b>Firmware</b> — Load this product's novaX ArduPilot image from the catalog Web Updater; never use another board's firmware.",
                 "<b>Setup</b> — In Mission Planner or similar, choose the frame, calibrate accelerometer, compass and radio, and set flight modes and failsafes."])
    if cat == "esc":
        if slug == "AE-6S-60A-FOC-TI":
            return (["<b>장착</b> — 모터 가까이 고정하고 방열이 되게 공기 흐름을 확보합니다.",
                     f"<b>배선</b> — 배터리(+/−)는 극성을 확인해 연결하고 모터 3선을 연결합니다.{_v(d, 'Voltage Range', ' 입력: %s.')}",
                     "<b>통신</b> — CAN 선을 FC CAN 포트에 연결하고 FC 에서 DroneCAN 과 ESC 출력 설정을 켭니다.",
                     "<b>펌웨어</b> — 빈 보드는 BootApp .hex 를 SWD/JTAG 로 한 번 굽고, 이후에는 앱 .bin 을 DroneCAN 으로 갱신합니다.",
                     "<b>회전 확인</b> — 프로펠러 없이 낮은 스로틀로 회전 방향을 확인합니다."] if ko else
                    ["<b>Mounting</b> — Mount close to the motor with airflow for cooling.",
                     f"<b>Wiring</b> — Connect the battery (+/−) observing polarity and the three motor wires.{_v(d, 'Voltage Range', ' Input: %s.')}",
                     "<b>Communication</b> — Connect CAN to the flight controller and enable DroneCAN and the ESC outputs there.",
                     "<b>Firmware</b> — Flash the BootApp .hex once over SWD/JTAG on a blank board; afterwards update the .bin over DroneCAN.",
                     "<b>Spin check</b> — Without a propeller, check the direction at low throttle."])
        fw = spec(d, "Firmware") or ""
        am32 = "AM32" in fw
        return ([f"<b>장착</b> — 고정 구멍에 방진 그로밋을 끼워 고정하고, 부품면이 탄소 프레임에 닿지 않게 절연합니다.{_v(d, 'Mounting Hole', ' 고정 구멍: %s.')}",
                 f"<b>배선</b> — 배터리 +/− 를 극성에 맞게 연결하고, 모터 선을 각 모터 출력에, 신호 커넥터를 FC ESC 포트에 연결합니다. 핀 순서는 핀맵과 보드 표시를 따릅니다." + _v(d, 'Voltage Range', ' 입력: %s.'),
                 "<b>프로토콜</b> — FC 에서 지원 프로토콜(DShot150/300/600 · MultiShot · OneShot) 중 하나를 고릅니다.",
                 "<b>회전 확인</b> — 프로펠러 없이 모터 순서와 회전 방향을 확인하고, 반대면 모터 선 2가닥을 바꾸거나 설정에서 뒤집습니다.",
                 ("<b>펌웨어</b> — AM32 앱은 AM32 설정기의 4-way 패스스루로 갱신하고, 빈 보드는 SWD 로 BootApp 이미지를 굽습니다." if am32 else
                  "<b>펌웨어</b> — BLHeli-S 설정기(FC 패스스루)로 설정·갱신합니다.")] if ko else
                [f"<b>Mounting</b> — Mount with anti-vibration grommets and insulate the component side from carbon frames.{_v(d, 'Mounting Hole', ' Mounting: %s.')}",
                 f"<b>Wiring</b> — Connect the battery +/− observing polarity, the motor wires to each output and the signal connector to the flight controller ESC port, following the pinout and board markings." + _v(d, 'Voltage Range', ' Input: %s.'),
                 "<b>Protocol</b> — Select a supported protocol (DShot150/300/600, MultiShot, OneShot) on the flight controller.",
                 "<b>Spin check</b> — Without propellers, check motor order and direction; swap two motor wires or reverse it in the settings if needed.",
                 ("<b>Firmware</b> — Update the AM32 application through the AM32 configurator's 4-way passthrough; flash the BootApp image over SWD on a blank board." if am32 else
                  "<b>Firmware</b> — Configure and update with the BLHeli-S configurator through flight-controller passthrough.")])
    if cat == "gnss":
        return (["<b>장착</b> — 하늘이 트인 곳, 전원선 · 영상 송신기 · 모터에서 떨어진 곳에 고정합니다. 나침반이 들어 있으니 방향을 기체 앞쪽에 맞추고, 다르게 달면 COMPASS_ORIENT 로 맞춥니다.",
                 f"<b>연결</b> — 6핀 커넥터(SDA · SCL · TXD · RXD · 5V · GND)를 FC GPS 포트에 연결합니다. GPS 는 UART, 나침반은 I2C 입니다.{_v(d, 'Operating Voltage', ' 동작 전압: %s.')}",
                 "<b>ArduPilot</b> — 연결한 시리얼의 SERIALn_PROTOCOL 을 5(GPS), GPS1_TYPE 을 1(자동)로 둡니다.",
                 "<b>보정</b> — 금속·자석에서 떨어진 곳에서 나침반 보정을 하고, 첫 비행 전 위성 수와 위치를 확인합니다."] if ko else
                ["<b>Mounting</b> — Mount with a clear sky view, away from power wires, video transmitters and motors. It contains a compass: align it with the vehicle nose or set COMPASS_ORIENT.",
                 f"<b>Connection</b> — Connect the 6-pin connector (SDA, SCL, TXD, RXD, 5V, GND) to the flight controller GPS port. GPS uses UART; the compass uses I2C.{_v(d, 'Operating Voltage', ' Supply: %s.')}",
                 "<b>ArduPilot</b> — Set SERIALn_PROTOCOL of that port to 5 (GPS) and GPS1_TYPE to 1 (Auto).",
                 "<b>Calibration</b> — Calibrate the compass away from metal and magnets; check satellite count and position before the first flight."])
    if cat == "camera":
        if slug == "AC-GM1X":
            return ([f"<b>장착</b> — 짐벌이 움직이는 범위에 걸리는 것이 없게 고정합니다.", f"<b>전원</b> — {spec(d, 'Voltage') or ''} 전원을 연결합니다.",
                     f"<b>제어</b> — FC 의 PWM 출력 또는 UART 로 제어합니다.", "<b>확인</b> — 전원을 켤 때 짐벌이 막히지 않았는지 확인하고, 켜진 상태에서 손으로 억지로 돌리지 않습니다."] if ko else
                    ["<b>Mounting</b> — Mount so nothing blocks the gimbal's range of motion.", f"<b>Power</b> — Supply {spec(d, 'Voltage') or ''}.",
                     f"<b>Control</b> — Control it from a flight-controller PWM output or UART.", "<b>Check</b> — Keep the gimbal free at power-on and do not force it by hand while powered."])
        if slug == "AC-THE02F":
            return (["<b>변형 확인</b> — SoC 모델은 USB 2.0, FPGA 모델은 CVBS 영상 출력입니다. 사용하는 모델의 출력에 맞게 연결합니다.",
                     "<b>렌즈</b> — 필요한 화각에 맞는 렌즈 옵션을 고릅니다(스펙 참고).", "<b>장착</b> — 방열이 되게 고정하고 렌즈 앞을 가리지 않습니다."] if ko else
                    ["<b>Variant</b> — The SoC variant outputs USB 2.0 and the FPGA variant CVBS video; connect to the matching input.",
                     "<b>Lens</b> — Choose the lens option for the required field of view (see specifications).", "<b>Mounting</b> — Mount with cooling and keep the lens unobstructed."])
        return ([f"<b>연결</b> — 호스트 보드의 {spec(d, 'Interface') or ''} 커넥터에 연결합니다.", f"<b>렌즈</b> — {spec(d, 'Lens Mount') or ''} 렌즈를 쓰며, 초점은 고정 후 조정합니다.",
                 "<b>장착</b> — 진동이 적은 곳에 고정하고 렌즈 앞을 가리지 않습니다."] if ko else
                [f"<b>Connection</b> — Connect to the host board's {spec(d, 'Interface') or ''} connector.", f"<b>Lens</b> — Uses {spec(d, 'Lens Mount') or ''} lenses; adjust focus after mounting.",
                 "<b>Mounting</b> — Mount where vibration is low and keep the lens unobstructed."])
    return []


def CAT_NOTES(cat, slug, d, lang):
    ko = lang == "ko"
    common = (["연결 · 설정 · 펌웨어 작업 중에는 프로펠러를 반드시 분리하십시오.", "커넥터를 뽑을 때는 선이 아니라 커넥터 몸체를 잡으십시오.",
               "정전기에 주의하고, 젖거나 먼지 많은 곳에서 쓰지 마십시오."] if ko else
              ["Always remove propellers while wiring, configuring or updating firmware.", "Pull connectors by the housing, never by the wires.",
               "Beware of static discharge; do not operate in wet or dusty conditions."])
    if cat == "esc":
        v, c, b = spec(d, "Voltage Range"), spec(d, "Constant Current"), spec(d, "Burst Current")
        extra = ([f"입력 전압 범위를 넘기지 마십시오 — {v}." if v else "입력 전압 범위를 넘기지 마십시오.",
                  f"연속 {c} / 순간 {b} 을 넘기지 말고 방열을 확보하십시오." if c and b else "정격 전류를 넘기지 말고 방열을 확보하십시오.",
                  "배터리 극성이 바뀌면 즉시 손상됩니다. 연결 전에 반드시 확인하십시오.", "배터리 선을 길게 늘이면 전압 스파이크가 커집니다. 짧게 유지하십시오."] if ko else
                 [f"Do not exceed the input voltage range — {v}." if v else "Do not exceed the input voltage range.",
                  f"Do not exceed {c} continuous / {b} burst; provide cooling." if c and b else "Do not exceed the rated current; provide cooling.",
                  "Reverse battery polarity destroys the ESC instantly — check before connecting.", "Long battery leads raise voltage spikes; keep them short."])
        return extra + common[:1] + EXTRA.get(slug, {}).get(lang, [])
    if cat == "camera":
        base = (["렌즈를 손으로 만지지 말고 부드러운 천으로 닦으십시오.", "정격 전압 범위를 지키고 전원 극성을 확인하십시오."] if ko else
                ["Do not touch the lens; clean it with a soft cloth.", "Stay within the rated voltage and check polarity."])
        return base + common[1:] + EXTRA.get(slug, {}).get(lang, [])
    return common + EXTRA.get(slug, {}).get(lang, [])


PINOUT_NOTES_KO = {
    "AF-H7E-Lite": "잠정 핀 정의입니다 — AF-H7E Lite 는 개발 중이라 출시 전에 커넥터가 바뀔 수 있습니다. 모든 JST 커넥터는 Pixhawk 표준처럼 1번 핀이 전원, 마지막 핀이 GND 입니다. "
                   "UART n 은 ArduPilot SERIALn 이며 UART 1–2 는 MAVLink 텔레메트리, UART 3–4 는 GPS 가 기본입니다. GPS 는 아무 UART 나 DroneCAN 으로 연결하며 전용 GPS/세이프티 포트와 세이프티 스위치는 없습니다. "
                   "RC IN 2번 핀에 SBUS · PPM · DSM 수신기를 바로 연결합니다(프로토콜 자동 인식, FC 메인 MCU 직결이라 IO 보드가 필요 없음). 커넥터 전원은 5 V 라 3.3 V 전용 DSM 위성 수신기는 3.3 V 변환 케이블이 필요합니다. "
                   "보드에는 커넥터 없이 microSD 슬롯(로그) · 부저 · RGB 상태 LED 가 있습니다. PWM 헤더의 + 레일은 FC 가 전원을 주지 않습니다. "
                   "헤더 13번째 칸 SB 는 PWM 채널이 아니라 SBUS 출력입니다 — USART6(SERIAL8)에서 서보 채널 1–16 을 선 하나로 내보내고 신호 반전은 STM32H7 안에서 하므로, SBUS 서보 · SBUS→PWM 디코더 · 짐벌을 일반 서보 선으로 꽂고 전원은 서보 레일에서 받습니다. "
                   "DShot 은 M1–M6 에서 되고, M7–M8 은 DMA 없는 타이머라 PWM · OneShot 만 되며, M9–M12 의 MCU 핀은 아직 확정 전입니다. "
                   "AF-H7E 와 같이 PWM 신호 줄(S)이 가장 뒤쪽이며, 케이스 빗살 홈 때문에 서보 플러그는 S 가 뒤로 가야만 꽂히고, POWER 1 · POWER 2 · RC IN 과 PWM 헤더 사이는 벽으로 나뉩니다. "
                   "핀맵 그림은 개념 캐리어를 위에서 본 것입니다(옆 커넥터는 아랫면에 달려 가장자리로 꽂힘). POWER 1 · 2 는 AF-H7E 와 같은 Molex Micro-Lock Plus 이며 1번 핀 방향은 확인 중입니다.",
    "AF-H7-nano": "핀맵은 일반 H7 보드가 아니라 novaX AF-H7_nano 기준입니다. PWM1–10 은 모터/서보 출력, PWM11 은 WS2812 LED 선입니다. GPS 커넥터는 USART3(SERIAL3, PD8/PD9), ELRS/RC 커넥터는 USART6(SERIAL6, PC6/PC7), UART7/8 은 예비 패드이고 UART4 는 DJI O3 MSP 용입니다. "
                  "배터리 입력은 2S–8S 를 받는 4핀 커넥터이며, 보드 5 V / 2.5 A 레귤레이터가 FC · 수신기 · 저전력 주변장치에 전원을 줍니다. 서보 레일은 조정되지 않으므로 BEC 나 모터 PDB 에서 직접 공급하십시오.",
    "AF-H7E": "다기능 포트의 I2C 번호: GPS & Safety 포트 = I2C1, GPS2 포트 = I2C2, UART4 포트 = I2C3.",
    "AP-RTK-X20D": "핀 정의는 R3 회로 넷리스트와 핀 단위로 대조했습니다. CAN · UART 는 1번 = GND, 4번 = 5 V 로 Pixhawk 번호(1번 = 5 V)와 반대입니다. DEBUG 는 1번 = 5 V, 6번 = GND, PPS 는 1 · 3번이 GND 입니다. "
                   "핀 순서와 케이블은 AP-RTK dual 과 같으니 일반 1:1 Pixhawk 케이블은 양 끝 핀 배열을 확인한 뒤 쓰십시오. 전원은 CAN/UART 5 V · DEBUG 5 V · USB VBUS 어디로도 들어오며 입력마다 2 A PPTC 퓨즈와 쇼트키 다이오드가 있습니다. "
                   "USB-C 는 STM32F412(서비스 · 부트로더 · DFU)에 연결되며 ZED-X20D 의 USB 가 아닙니다. 수신기는 USART2(GPS 포트 4)로 MCU 와 통신합니다. "
                   "ANT1 은 헤딩 기준으로 뒤, ANT2 는 앞에 둡니다. AP-RTK dual 과 반대이며 케이블을 바꿔 끼우면 헤딩이 180° 틀어집니다. "
                   "케이스 옆면 LED: PWR 빨강 = 전원, STAT 초록 = AP_Periph 상태, SAFE 빨강 = 세이프티, HDG 초록 = 헤딩 유효, RTK 파랑 = RTK fixed. 그림은 포트 · LED 이름을 각인한 케이스 설계 렌더입니다.",
}
X20D_PARAM_KO = {
    "CAN_P1_DRIVER": "CAN1 사용 — 바꾼 뒤 재부팅", "CAN_D1_PROTOCOL": "DroneCAN", "GPS1_TYPE": "DroneCAN GPS (구버전 펌웨어는 GPS_TYPE)",
    "GPS1_MB_TYPE": "무빙 베이스라인 오프셋 변환 안 함 — 수신기가 이미 전방 헤딩을 줌", "AHRS_EKF_TYPE": "EKF3 사용", "EK3_ENABLE": "EKF3 켜기",
    "EK3_SRC1_YAW": "GPS 요 — RM3100 축·보정 검증 뒤에만 3(나침반 대체) 사용",
}
PIN_KO = {
    "5 V supply input from the power module": "전원 모듈 5 V 입력", "5 V supply input from the second power module": "두 번째 전원 모듈 5 V 입력",
    "Power-module I2C clock (voltage / current monitor)": "전원 모듈 I2C 클럭 (전압/전류 측정)", "Power-module I2C data (voltage / current monitor)": "전원 모듈 I2C 데이터 (전압/전류 측정)",
    "Ground": "접지", "5 V output": "5 V 출력", "UART transmit (FC → device)": "UART 송신 (FC → 장치)", "UART receive (device → FC)": "UART 수신 (장치 → FC)",
    "Clear to send — hardware flow control input": "CTS — 하드웨어 흐름 제어 입력", "Request to send — hardware flow control output": "RTS — 하드웨어 흐름 제어 출력",
    "I2C clock — external compass, rangefinder, airspeed …": "I2C 클럭 — 외장 나침반 · 거리계 · 대기속도계 …", "I2C data": "I2C 데이터",
    "5 V output to CAN peripherals (not a power input)": "CAN 주변장치용 5 V 출력 (전원 입력 아님)", "CAN bus high": "CAN 버스 High", "CAN bus low": "CAN 버스 Low",
    "5 V receiver supply": "수신기 5 V 전원", "SBUS / PPM / DSM receiver input (protocol auto-detected)": "SBUS / PPM / DSM 수신기 입력 (자동 인식)",
    "RSSI input (analog or PWM)": "RSSI 입력 (아날로그 또는 PWM)", "Ethernet transmit pair +": "이더넷 송신 +", "Ethernet transmit pair −": "이더넷 송신 −",
    "Ethernet receive pair +": "이더넷 수신 +", "Ethernet receive pair −": "이더넷 수신 −", "3.3 V reference for the debug probe": "디버그 프로브용 3.3 V 기준",
    "Debug console transmit (FC → probe)": "디버그 콘솔 송신 (FC → 프로브)", "Debug console receive (probe → FC)": "디버그 콘솔 수신 (프로브 → FC)",
    "SWD data — bootloader programming and firmware recovery": "SWD 데이터 — 부트로더 기록 · 펌웨어 복구", "SWD clock": "SWD 클럭",
    "5 V from USB — configuration and firmware update on the bench": "USB 5 V — 벤치 설정 · 펌웨어 갱신", "USB data +": "USB 데이터 +", "USB data −": "USB 데이터 −",
    "Configuration channel (device role)": "설정 채널 (장치 역할)",
    "Motor / servo output signal, one per channel (PWM · OneShot; DShot on M1–M6)": "채널별 모터/서보 신호 (PWM · OneShot, DShot 은 M1–M6)",
    "SERIAL8 · USART6 · SBus servo out": "SERIAL8 · USART6 · SBUS 서보 출력",
    "SBUS output — servo channels 1–16 on one wire (SERIAL8_PROTOCOL 15, SERIAL8_OPTIONS 2 inverts TX inside the MCU)": "SBUS 출력 — 서보 채널 1–16 을 선 하나로 (SERIAL8_PROTOCOL 15, SERIAL8_OPTIONS 2 로 MCU 안에서 송신 반전)",
    "Servo rail, bussed across all channels — supplied externally (e.g. BEC)": "모든 채널 공통 서보 레일 — 외부 공급 (예: BEC)",
    "Primary power input": "주 전원 입력", "Redundant power input": "보조 전원 입력", "RC input · SBUS / PPM / DSM (auto-detected)": "RC 입력 · SBUS / PPM / DSM (자동 인식)", "Main outputs 1–12": "메인 출력 1–12",
    # AP-RTK X20D
    "DroneCAN to the flight controller · power input": "FC 와 DroneCAN · 전원 입력", "RTCM correction input · power input": "RTCM 보정 입력 · 전원 입력",
    "SWD programming · MCU debug console": "SWD 기록 · MCU 디버그 콘솔", "Receiver timing — PPS output · EVENT input": "수신기 타이밍 — PPS 출력 · EVENT 입력",
    "GNSS antenna inputs · 3.3 V antenna bias · ESD protected": "GNSS 안테나 입력 · 3.3 V 안테나 바이어스 · ESD 보호",
    "5 V supply input — shared with UART pin 4": "5 V 전원 입력 — UART 4번과 공통", "5 V supply input — shared with CAN pin 4": "5 V 전원 입력 — CAN 4번과 공통",
    "MCU transmit (PC6, USART6_TX) — not used by firmware 1.0.1": "MCU 송신 (PC6, USART6_TX) — 펌웨어 1.0.1 은 사용 안 함",
    "RTCM corrections into the ZED-X20D UART2 (also MCU PC7, USART6_RX)": "RTCM 보정 → ZED-X20D UART2 입력 (MCU PC7 USART6_RX 에도 연결)",
    "5 V supply input": "5 V 전원 입력", "SWD data (PA13) — bootloader programming and firmware recovery": "SWD 데이터 (PA13) — 부트로더 기록 · 펌웨어 복구",
    "SWD clock (PA14)": "SWD 클럭 (PA14)", "Debug console receive (PB7, USART1_RX)": "디버그 콘솔 수신 (PB7, USART1_RX)",
    "Debug console transmit (PB6, USART1_TX)": "디버그 콘솔 송신 (PB6, USART1_TX)",
    "External event input to the receiver (EXTINT) — e.g. camera trigger time stamps": "수신기 외부 이벤트 입력 (EXTINT) — 카메라 트리거 시각 기록 등",
    "Pulse-per-second output from the receiver (TIMEPULSE, also MCU PA7)": "수신기 초당 1펄스 출력 (TIMEPULSE, MCU PA7 에도 연결)",
    "Heading reference antenna — mount at the rear of the vehicle": "헤딩 기준 안테나 — 기체 뒤쪽에 장착",
    "Mount at the front — heading = direction from ANT1 to ANT2": "기체 앞쪽에 장착 — 헤딩 = ANT1 → ANT2 방향",
}
