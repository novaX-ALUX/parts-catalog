---
name: AF-H7 nano
tagline: High-Performance H7 Flight Controller · 2–8S LiPo
image: /images/products/fc_Matek_H743_Slim_V4.png
pictureKey: fc_Matek_H743_Slim_V4
pinoutImage: /images/products/fc_AF-H7_nano_firmware_ports.svg
order: 20
firmware:
  - kind: "ArduPilot (.apj package)"
    file: https://github.com/novaX-ALUX/fc/releases/download/AF-H7_nano-v1.2.3/AF-H7_nano-v1.2.3.apj
    version: "1.2.3"
    date: "2026-07-11"
    size: "1.3 MB"
    sha256: "90561a56ab947b194f339e7727f96ae6bc8e12a5f4b6c1f9f446548fbc3f553b"
    notes: "ArduPilot Copter app. Upload via the USB-C bootloader (Mission Planner) or the catalog Web Updater → Firmware Update."
    method: ardupilot
    webPath: /firmware/AF-H7_nano-v1.2.3.apj
  - kind: "Bootloader + App (merged HEX · DFU / SWD)"
    file: https://github.com/novaX-ALUX/fc/releases/download/AF-H7_nano-v1.2.3/AF-H7_nano-v1.2.3_with_bl.hex
    version: "1.2.3"
    date: "2026-07-11"
    size: "5.2 MB"
    sha256: "be382fe05d7403d89fbaa1f98a9cebc5f6b07395e9d2943d46b1ee3b44aac4d1"
    notes: "Bootloader + application combined image based at 0x08000000. Flash via the catalog Web Updater → DFU Recovery (hold BOOT0) or SWD/ST-Link for a blank/bricked board."
    method: dfu
    webPath: /firmware/AF-H7_nano-v1.2.3_with_bl.hex
specs:
  - { key: MCU, value: "STM32H743VIH6, 480 MHz (1MB RAM, 2MB Flash)" }
  - { key: IMU, value: "2× ICM-42688-P" }
  - { key: Barometer, value: "DPS-368" }
  - { key: Operating Voltage, value: "6 – 36 V DC (2–8S LiPo)" }
  - { key: Output Voltage, value: "BEC 5V @ 2.5A" }
  - { key: USB Input, value: "USB-C (Firmware & Power)" }
  - { key: PWM Output, value: "10 motor/servo channels + 1 WS2812 LED channel" }
  - { key: UART, value: "7 Port" }
  - { key: CAN, value: "1 Port" }
  - { key: RC Input, value: "S.Bus, PPM, CRSF, DSM" }
  - { key: Size, value: "36 × 36 × 5 mm" }
  - { key: Mount Hole, value: "30.5 × 30.5 mm / M4" }
  - { key: Weight, value: "7 g" }
  - { key: Operating Temp, value: "-20 ~ +85 ℃" }
  - { key: Supported F/W, value: "novaX ArduPilot (released); Betaflight board configuration available" }
description: |
  AF-H7 nano is a compact STM32H743 flight controller with two ICM-42688-P IMUs. The current novaX ArduPilot definition enables ten motor/servo PWM channels, one WS2812 LED channel and seven hardware UARTs. Use the AF-H7_nano board definition and its matching released images; another H743 board's firmware is not interchangeable. The catalog barometer label is DPS368; the schematic symbol is DPS310 and the firmware uses the compatible SPL06/DPS310 driver, so confirm the fitted component against the board revision.
pinoutNotes: |
  Pinout follows novaX AF-H7_nano, not a generic H7 target. PWM1–10 are motor/servo outputs; PWM11 is the WS2812 LED line. The GPS connector is USART3 (SERIAL3, PD8/PD9), the ELRS/RC connector is USART6 (SERIAL6, PC6/PC7), and UART7/8 are spare pads. UART4 is assigned to DJI O3 MSP.

  VBat input is routed through a 4-pin connector accepting 2S–8S LiPo. The on-board 5 V / 2.5 A regulator powers the FC, receiver and low-current peripherals. Servo rail is unregulated — feed it directly from a BEC or motor PDB.
firmwareNotes: |
  Use the released novaX AF-H7_nano ArduPilot image (board ID 6200). Do not substitute Matek firmware. Betaflight configuration exists in the FC repository, but an INAV or PX4 release for this board is not provided here. For USB DFU recovery hold BOOT during power-up and select the matching AF-H7_nano merged HEX. All firmware releases: https://github.com/novaX-ALUX/fc/releases
---
