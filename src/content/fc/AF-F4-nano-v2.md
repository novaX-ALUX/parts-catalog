---
name: AF-F4 nano v2
tagline: Compact F4 Flight Controller · External GPS/Compass Port · ArduPilot
image: /images/products/fc_F4_nano_v2.png
pictureKey: fc_F4_nano_v2
order: 12
specs:
  - { key: MCU, value: "STM32F405" }
  - { key: IMU, value: "ICM-42688-P" }
  - { key: Barometer, value: "DPS368" }
  - { key: GNSS, value: "MAX-M10S — via external GPS module (not onboard)" }
  - { key: Compass, value: "QMC5883P — on external GPS module (not onboard)" }
  - { key: GPS Port, value: "6-pin connector (UART TX/RX + I2C SCL/SDA)" }
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
  AF-F4 nano v2 is a compact F4-class flight controller built around the STM32F405, with an ICM-42688-P IMU and a DPS368 barometer onboard. GNSS and compass are NOT onboard: the board exposes a 6-pin GPS port (UART on USART1 + I2C on I2C1) for an external GPS module that carries the MAX-M10S GNSS receiver and QMC5883P compass. Without that module the board has no positioning or heading, and it is configured to arm with no compass. Six PWM outputs, five serial ports and microSD blackbox logging round out the feature set. The board carries its own board ID (6204) and bootloader, so firmware for other novaX F4 boards cannot be flashed onto it by mistake.
pinoutImages:
  - /images/products/fc_F4_nano_v2_pinout_top.png
  - /images/products/fc_F4_nano_v2_pinout_bottom.png
firmware:
  - kind: "ArduPilot (.apj package)"
    file: https://github.com/novaX-ALUX/flight_controller/releases/download/AF-F4_nano_v2-v1.0.10/AF-F4_nano_v2-v1.0.10.apj
    version: "1.0.10"
    date: "2026-07-31"
    size: "686 KB"
    sha256: "0877db40912e1a23981ff49a58a3eee0ee5fb000146cb0cfd4d6e1bde45ec0d4"
    notes: "ArduPilot Copter app. v1.0.10 fixes the MAVLink2 signing side effect that flooded the flash-emulated storage with signing-timestamp writes (GPS UART overruns, stalled loops); signing stays fully usable. v1.0.9 added BRAKE mode, EKF3 wind estimation (drag fusion), corrected board orientation and an 8 KB log buffer; battery calibration, baro wind compensation and DShot300 output are baked into the defaults. Upload via the USB-C bootloader (Mission Planner) or the catalog Web Updater → Firmware Update."
    method: ardupilot
    webPath: /firmware/AF-F4_nano_v2-v1.0.10.apj
  - kind: "Bootloader + App (merged HEX · DFU / SWD)"
    file: https://github.com/novaX-ALUX/flight_controller/releases/download/AF-F4_nano_v2-v1.0.10/AF-F4_nano_v2-v1.0.10_with_bl.hex
    version: "1.0.10"
    date: "2026-07-31"
    size: "2.2 MB"
    sha256: "d8205a68d995b4e0ac63ef354944e90c84dfae632c3500dd799de7281f9927ef"
    notes: "Bootloader + application combined image based at 0x08000000. Flash via the catalog Web Updater → DFU Recovery (🛠 Enter DFU works buttonless on this board) or SWD/ST-Link for a blank/bricked board."
    method: dfu
    webPath: /firmware/AF-F4_nano_v2-v1.0.10_with_bl.hex
firmwareNotes: 'All firmware releases are published on GitHub: https://github.com/novaX-ALUX/flight_controller/releases'
---
