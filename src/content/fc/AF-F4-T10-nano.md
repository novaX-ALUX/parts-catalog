---
name: AF-F4 T10 nano
tagline: AF-F4 nano + CADDX Gimbal · ArduPilot
image: /images/products/fc_F405_nano.png
pictureKey: fc_F405_nano
pinoutImage: /images/products/fc_F405_nano_pinout.png
order: 11
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
    file: https://github.com/novaX-ALUX/flight_controller/releases/download/AF-F4_T10_nano-v0.3.2/AF-F4_T10_nano-v0.3.2.apj
    version: "0.3.2"
    date: "2026-06-19"
    size: "752 KB"
    sha256: "935d10be1d4d1b17365131fe0753651372809de30b0f97eb4c493c2508deb1b5"
    notes: "ArduPilot Copter app with CADDX gimbal (MNT_TYPE 13). Upload via the USB-C bootloader (Mission Planner) or the catalog Web Updater → Firmware Update."
    method: ardupilot
    webPath: /firmware/AF-F4_T10_nano-v0.3.2.apj
  - kind: "Bootloader + App (merged HEX · DFU / SWD)"
    file: https://github.com/novaX-ALUX/flight_controller/releases/download/AF-F4_T10_nano-v0.3.2/AF-F4_T10_nano-v0.3.2_with_bl.hex
    version: "0.3.2"
    date: "2026-06-19"
    size: "2.3 MB"
    sha256: "8e008fe455dea1bfbef43e54fa48de43e54a5d3dacd59c72de55bd6698f8d909"
    notes: "Bootloader + application combined image based at 0x08000000. Flash via the catalog Web Updater → DFU Recovery (hold BOOT0) or SWD/ST-Link for a blank/bricked board."
    method: dfu
    webPath: /firmware/AF-F4_T10_nano-v0.3.2_with_bl.hex
firmwareNotes: 'All firmware releases are published on GitHub: https://github.com/novaX-ALUX/flight_controller/releases'
---
