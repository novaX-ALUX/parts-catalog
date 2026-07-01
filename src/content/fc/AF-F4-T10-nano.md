---
name: AF-F4 T10 nano
tagline: AF-F4 nano + CADDX Gimbal · ArduPilot
image: /images/products/fc_F405_nano.png
pictureKey: fc_F405_nano
pinoutImage: /images/products/fc_F405_nano_pinout.png
order: 11
hidden: true   # 공개 카탈로그(카드 + /fc/af-f4-t10-nano/ 제품페이지)에서 제외. update 탭 펌웨어 목록은 유지.
specs:
  - { key: MCU, value: "STM32F405" }
  - { key: IMU, value: "ICM-42688-P" }
  - { key: Barometer, value: "DPS-310" }
  - { key: Gimbal, value: "CADDX (MNT_TYPE 13)" }
  - { key: Operating Voltage, value: "9 – 25 V DC" }
  - { key: USB Input, value: "USB Type-C (Firmware & Power)" }
  - { key: PWM Output, value: "9 Channel" }
  - { key: Serial Ports, value: "5 Port" }
  - { key: RC Input, value: "PWM / PPM / S.Bus" }
  - { key: Size, value: "39.4 × 39.4 mm" }
  - { key: Weight, value: "9.3 g" }
  - { key: Supported F/W, value: "ArduPilot" }
description: |
  AF-F4 T10 nano is the AF-F4 nano (STM32F405) with the CADDX gimbal mount enabled in firmware (ArduPilot MNT_TYPE 13). Same hardware and board ID as AF-F4 nano, so an existing AF-F4 nano accepts this firmware over the normal .apj updater. Feature set mirrors the curated novaX build with the CADDX camera-mount backend added.
firmware:
  - kind: "ArduPilot (.apj package)"
    file: https://github.com/novaX-ALUX/flight_controller/releases/download/AF-F4_T10_nano-v0.3.4/AF-F4_T10_nano-v0.3.4.apj
    version: "0.3.4"
    date: "2026-06-28"
    size: "780 KB"
    sha256: "79d3d6c3969d9b13404e1e065f93dc6736d8a45e5f2ac0a7ec90f29fea86fa55"
    notes: "ArduPilot Copter app with CADDX gimbal (MNT_TYPE 13). v0.3.4 restores SD-card dataflash logging (FATFS re-enabled). Upload via the USB-C bootloader (Mission Planner) or the catalog Web Updater → Firmware Update."
    method: ardupilot
    webPath: /firmware/AF-F4_T10_nano-v0.3.4.apj
  - kind: "Bootloader + App (merged HEX · DFU / SWD)"
    file: https://github.com/novaX-ALUX/flight_controller/releases/download/AF-F4_T10_nano-v0.3.4/AF-F4_T10_nano-v0.3.4_with_bl.hex
    version: "0.3.4"
    date: "2026-06-28"
    size: "2.4 MB"
    sha256: "80da2ed80b58a03c2ca275800336b8a1894c649807e672268a8a5a50533605b1"
    notes: "Bootloader + application combined image based at 0x08000000. Flash via the catalog Web Updater → DFU Recovery (hold BOOT0) or SWD/ST-Link for a blank/bricked board."
    method: dfu
    webPath: /firmware/AF-F4_T10_nano-v0.3.4_with_bl.hex
firmwareNotes: 'All firmware releases are published on GitHub: https://github.com/novaX-ALUX/flight_controller/releases'
---
