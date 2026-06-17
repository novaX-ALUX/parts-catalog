---
name: AF-F4 nano
tagline: Compact F4 Flight Controller · Compatible Model X Blade
image: /images/products/fc_F405_nano.png
pictureKey: fc_F405_nano
pinoutImage: /images/products/fc_F405_nano_pinout.png
order: 10
specs:
  - { key: MCU, value: "STM32F405" }
  - { key: IMU, value: "ICM-42688-P" }
  - { key: Barometer, value: "DPS-310" }
  - { key: Operating Voltage, value: "9 – 25 V DC" }
  - { key: Output Voltage, value: "3.3V/1A · 5V/3A · 10V/3A" }
  - { key: USB Input, value: "USB Type-C (Firmware & Power)" }
  - { key: PWM Output, value: "9 Channel" }
  - { key: Serial Ports, value: "5 Port" }
  - { key: Servo Output, value: "2 Port" }
  - { key: RC Input, value: "PWM / PPM / S.Bus" }
  - { key: Size, value: "39.4 × 39.4 mm" }
  - { key: Mount Hole, value: "30.5 × 30.5 mm / M4" }
  - { key: Weight, value: "9.3 g" }
  - { key: Operating Temp, value: "-20 ~ +70 ℃" }
  - { key: Supported F/W, value: "Betaflight, ArduPilot, PX4" }
description: |
  AF-F4 nano is a compact F4-class flight controller built around the STM32F405. Equipped with an ICM-42688-P IMU and DPS-310 barometer, it delivers reliable attitude and altitude sensing in a 39.4×39.4 mm form factor at just 9.3 g. Wide 9–25 V DC input with regulated 3.3 / 5 / 10 V rails and 9 PWM outputs make it suitable for compact 3"–5" multirotors running Betaflight, ArduPilot or PX4.
firmware:
  - kind: "ArduPilot (.apj package)"
    file: https://github.com/novaX-ALUX/flight_controller/releases/download/v0.2.0/AF-F4_nano-v0.2.0.apj
    version: "0.2.0"
    date: "2026-06-17"
    size: "815 KB"
    sha256: "d4d85573249660044606e72542c025b11cddbf19ffa76b33c95d788454d0b877"
    notes: "ArduPilot Copter app. Upload via the USB-C bootloader (Mission Planner) or the catalog Web Updater → Firmware Update."
    method: ardupilot
    webPath: /firmware/AF-F4_nano-v0.2.0.apj
  - kind: "Bootloader + App (merged HEX · DFU / SWD)"
    file: https://github.com/novaX-ALUX/flight_controller/releases/download/v0.2.0/AF-F4_nano-v0.2.0_with_bl.hex
    version: "0.2.0"
    date: "2026-06-17"
    size: "2.5 MB"
    sha256: "fd0a6751addaf31248ad3d0be68de921d358c4a3d137e2f9bae74a5c2f462d95"
    notes: "Bootloader + application combined image based at 0x08000000. Flash via the catalog Web Updater → DFU Recovery (hold BOOT0) or SWD/ST-Link for a blank/bricked board."
    method: dfu
    webPath: /firmware/AF-F4_nano-v0.2.0_with_bl.hex
firmwareNotes: 'All firmware releases are published on GitHub: https://github.com/novaX-ALUX/flight_controller/releases'
---
