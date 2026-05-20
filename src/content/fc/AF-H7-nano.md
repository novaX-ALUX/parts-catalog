---
name: AF-H7 nano
tagline: High-Performance H7 Flight Controller · 2–8S LiPo
image: /images/products/fc_Matek_H743_Slim_V4.png
pictureKey: fc_Matek_H743_Slim_V4
pinoutImage: /images/products/fc_H743_nano_pinout.png
order: 20
firmware:
  - kind: "DFU (Boot+App)"
    file: /firmware/fc/af-h7-nano/v1.2.0/af-h7-nano_bootapp_v1.2.0.hex
    version: "1.2.0"
    date: "2026-05-10"
    size: "896 KB"
    sha256: "placeholder-replace-with-real-sha256-on-release"
    notes: "Flash via USB DFU mode (Boot0 high). Includes bootloader."
  - kind: "App update (USB)"
    file: /firmware/fc/af-h7-nano/v1.2.0/af-h7-nano_app_v1.2.0.bin
    version: "1.2.0"
    date: "2026-05-10"
    size: "612 KB"
    sha256: "placeholder-replace-with-real-sha256-on-release"
    notes: "Application-only binary uploaded over USB via on-board bootloader."
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
  Supports Betaflight, INAV, and ArduPilot out of the box. Recommended targets: Betaflight MATEKH743 / ArduPilot MatekH743. Enter USB-C DFU bootloader by holding the BOOT button during power-up.
---
