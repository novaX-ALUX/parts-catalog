---
name: AF-H7 nano
tagline: High-Performance H7 Flight Controller · 2–8S LiPo
image: /images/products/fc_Matek_H743_Slim_V4.png
pictureKey: fc_Matek_H743_Slim_V4
pinoutImage: /images/products/fc_H743_nano_pinout.png
order: 20
firmware:
  - kind: "ArduPilot (.apj package)"
    file: https://github.com/novaX-ALUX/flight_controller/releases/download/v0.2.3/AF-H7_nano-v0.2.3.apj
    version: "0.2.3"
    date: "2026-06-19"
    size: "1.3 MB"
    sha256: "392bd87a3ce8a7f51e5f3409bf7e31a6b330fe9ba8c95892072acb4fd8ddae06"
    notes: "ArduPilot Copter app. Upload via the USB-C bootloader (Mission Planner) or the catalog Web Updater → Firmware Update."
    method: ardupilot
    webPath: /firmware/AF-H7_nano-v0.2.3.apj
  - kind: "Bootloader + App (merged HEX · DFU / SWD)"
    file: https://github.com/novaX-ALUX/flight_controller/releases/download/v0.2.3/AF-H7_nano-v0.2.3_with_bl.hex
    version: "0.2.3"
    date: "2026-06-19"
    size: "5.2 MB"
    sha256: "970be820e885f8ea4761cdfffc9cd8a7e2d5f8aabcddbf4235ef17dc1e08a8ef"
    notes: "Bootloader + application combined image based at 0x08000000. Flash via the catalog Web Updater → DFU Recovery (hold BOOT0) or SWD/ST-Link for a blank/bricked board."
    method: dfu
    webPath: /firmware/AF-H7_nano-v0.2.3_with_bl.hex
specs:
  - { key: MCU, value: "STM32H743VIH6, 480 MHz (1MB RAM, 2MB Flash)" }
  - { key: IMU, value: "2× ICM-42688-P" }
  - { key: Barometer, value: "DPS-368" }
  - { key: Operating Voltage, value: "6 – 36 V DC (2–8S LiPo)" }
  - { key: Output Voltage, value: "BEC 5V @ 2.5A" }
  - { key: USB Input, value: "USB-C (Firmware & Power)" }
  - { key: PWM Output, value: "12 Channel + 1 LED" }
  - { key: UART, value: "7 Port" }
  - { key: CAN, value: "1 Port" }
  - { key: RC Input, value: "S.Bus, PPM, CRSF, DSM" }
  - { key: Size, value: "36 × 36 × 5 mm" }
  - { key: Mount Hole, value: "30.5 × 30.5 mm / M4" }
  - { key: Weight, value: "7 g" }
  - { key: Operating Temp, value: "-20 ~ +85 ℃" }
  - { key: Supported F/W, value: "BetaFlight, INAV, ArduPilot" }
description: |
  AF-H7 nano is a compact H7-class flight controller built around the STM32H743VIH6 running at 480 MHz with 1 MB RAM and 2 MB Flash. Dual ICM-42688-P IMUs and a DPS-368 barometer provide redundant attitude and altitude sensing, while the 30.5 × 30.5 mm mounting footprint and 7 g weight keep it suitable for 3"–7" platforms. Wide 6–36 V input (2S–8S LiPo) and a 5 V / 2.5 A regulator simplify integration without an external BEC. 12 PWM outputs, 7 UARTs and a dedicated CAN port cover modern peripheral stacks.
pinoutNotes: |
  Pinout follows the ArduPilot H7 mainline mapping. Servo rail provides up to 10 PWM channels with one dedicated WS2812 LED line. UART4 and UART7 are recommended for GPS and radio link respectively.

  VBat input is routed through a 4-pin connector accepting 2S–8S LiPo. The on-board 5 V / 2.5 A regulator powers the FC, receiver and low-current peripherals. Servo rail is unregulated — feed it directly from a BEC or motor PDB.
firmwareNotes: |
  Supports Betaflight, INAV, and ArduPilot out of the box. Recommended targets: Betaflight MATEKH743 / ArduPilot MatekH743. Enter USB-C DFU bootloader by holding the BOOT button during power-up. All firmware releases are published on GitHub: https://github.com/novaX-ALUX/flight_controller/releases
---
