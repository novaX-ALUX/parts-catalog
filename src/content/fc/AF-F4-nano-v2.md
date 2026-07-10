---
name: AF-F4 nano v2
tagline: Compact F4 Flight Controller · Onboard GNSS + Compass · ArduPilot
order: 12
specs:
  - { key: MCU, value: "STM32F405" }
  - { key: IMU, value: "ICM-42688-P" }
  - { key: Barometer, value: "DPS368" }
  - { key: GNSS, value: "MAX-M10S (onboard)" }
  - { key: Compass, value: "QMC5883P" }
  - { key: Operating Voltage, value: "9 – 25 V DC" }
  - { key: Output Voltage, value: "3.3V/1A · 5V/3A · 10V/3A" }
  - { key: PWM Output, value: "6 Channel" }
  - { key: Serial Ports, value: "5 Port" }
  - { key: Blackbox, value: "microSD card" }
  - { key: RC Input, value: "PWM / PPM / S.Bus" }
  - { key: Size, value: "39.4 × 39.4 mm" }
  - { key: Mount Hole, value: "30.5 × 30.5 mm / M4" }
  - { key: Weight, value: "9.3 g" }
  - { key: Supported F/W, value: "ArduPilot" }
description: |
  AF-F4 nano v2 is a compact F4-class flight controller built around the STM32F405, with an ICM-42688-P IMU and a DPS368 barometer. An onboard MAX-M10S GNSS module and QMC5883P compass are wired to the first serial port and the I2C bus, so the board flies without an external GPS unit. Six PWM outputs, five serial ports and microSD blackbox logging round out the feature set. The board carries its own board ID (6204) and bootloader, so firmware for other novaX F4 boards cannot be flashed onto it by mistake.
firmware:
  - kind: "ArduPilot (.apj package)"
    file: https://github.com/novaX-ALUX/flight_controller/releases/download/AF-F4_nano_v2-v1.0.1/AF-F4_nano_v2-v1.0.1.apj
    version: "1.0.1"
    date: "2026-07-10"
    size: "766 KB"
    sha256: "17e21ecdae2def03698bfca035e46d6a0b6a6abf7ae89814a62248cbdc91ae7b"
    notes: "ArduPilot Copter app. Upload via the USB-C bootloader (Mission Planner) or the catalog Web Updater → Firmware Update."
    method: ardupilot
    webPath: /firmware/AF-F4_nano_v2-v1.0.1.apj
  - kind: "Bootloader + App (merged HEX · DFU / SWD)"
    file: https://github.com/novaX-ALUX/flight_controller/releases/download/AF-F4_nano_v2-v1.0.1/AF-F4_nano_v2-v1.0.1_with_bl.hex
    version: "1.0.1"
    date: "2026-07-10"
    size: "2.4 MB"
    sha256: "73da3ffafd5568061b651679300f9863d0ed4da45515e8b6623d30d8b12c2969"
    notes: "Bootloader + application combined image based at 0x08000000. Flash via the catalog Web Updater → DFU Recovery (🛠 Enter DFU works buttonless on this board) or SWD/ST-Link for a blank/bricked board."
    method: dfu
    webPath: /firmware/AF-F4_nano_v2-v1.0.1_with_bl.hex
firmwareNotes: 'All firmware releases are published on GitHub: https://github.com/novaX-ALUX/flight_controller/releases'
---
