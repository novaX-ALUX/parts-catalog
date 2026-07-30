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
    file: https://github.com/novaX-ALUX/flight_controller/releases/download/AF-F4_nano_v2-v1.0.9/AF-F4_nano_v2-v1.0.9.apj
    version: "1.0.9"
    date: "2026-07-31"
    size: "686 KB"
    sha256: "f7a04700b1b9da75bda6ae656b1fc5937f515db229000a55a9753ca347a44613"
    notes: "ArduPilot Copter app. v1.0.9 adds BRAKE mode and EKF3 wind estimation (drag fusion), corrects board orientation (AHRS_ORIENTATION none) and raises the log buffer to 8 KB; battery calibration, baro wind compensation and DShot300 output are baked into the defaults. Upload via the USB-C bootloader (Mission Planner) or the catalog Web Updater → Firmware Update."
    method: ardupilot
    webPath: /firmware/AF-F4_nano_v2-v1.0.9.apj
  - kind: "Bootloader + App (merged HEX · DFU / SWD)"
    file: https://github.com/novaX-ALUX/flight_controller/releases/download/AF-F4_nano_v2-v1.0.9/AF-F4_nano_v2-v1.0.9_with_bl.hex
    version: "1.0.9"
    date: "2026-07-31"
    size: "2.2 MB"
    sha256: "474b116a06adb6db020024cf82fe4e99044f3807a0982dd72045e6a5b0386e34"
    notes: "Bootloader + application combined image based at 0x08000000. Flash via the catalog Web Updater → DFU Recovery (🛠 Enter DFU works buttonless on this board) or SWD/ST-Link for a blank/bricked board."
    method: dfu
    webPath: /firmware/AF-F4_nano_v2-v1.0.9_with_bl.hex
firmwareNotes: 'All firmware releases are published on GitHub: https://github.com/novaX-ALUX/flight_controller/releases'
---
