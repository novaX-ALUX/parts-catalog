---
name: AF-F4 nano v2
tagline: Compact F4 Flight Controller · External GPS/Compass Port · ArduPilot
image: /images/products/fc_F4_nano_v2.png
pictureKey: fc_F4_nano_v2
order: 12
manuals:
  - { label: "한국어", file: /manuals/fc_AF-F4-nano-v2_manual_ko.pdf }
  - { label: English, file: /manuals/fc_AF-F4-nano-v2_manual_en.pdf }
specs:
  - { key: MCU, value: "STM32F405" }
  - { key: IMU, value: "ICM-42688-P" }
  - { key: Barometer, value: "DPS368" }
  - { key: GNSS, value: "MAX-M10S — via external GPS module (not onboard)" }
  - { key: Compass, value: "QMC5883P — on external GPS module (not onboard)" }
  - { key: GPS Port, value: "6-pin connector (UART TX/RX + I2C SCL/SDA)" }
  - { key: Operating Voltage, value: "9 – 25 V DC" }
  - { key: Output Voltage, value: "3.3V/1A · 5V/3A · 10V/3A" }
  - { key: PWM Output, value: "5 channels in current novaX ArduPilot configuration" }
  - { key: Serial Ports, value: "3 hardware UARTs + USB in current novaX ArduPilot configuration" }
  - { key: Serial Mapping, value: "SERIAL1 = USART3 · SERIAL2 = USART1 · SERIAL3 = USART2 (USB = SERIAL0)" }
  - { key: Blackbox, value: "microSD card" }
  - { key: RC Input, value: "PWM / PPM / S.Bus" }
  - { key: Size, value: "39.4 × 39.4 mm" }
  - { key: Mount Hole, value: "30.5 × 30.5 mm / M4" }
  - { key: Weight, value: "9.3 g" }
  - { key: Supported F/W, value: "ArduPilot" }
description: |
  AF-F4 nano v2 is a compact F4-class flight controller built around the STM32F405, with an ICM-42688-P IMU and a DPS368 barometer onboard. GNSS and compass are external: the 6-pin GPS port carries USART1 and I2C1 for a module with MAX-M10S and QMC5883P. Without an external positioning or heading source those measurements are unavailable. The current novaX ArduPilot definition enables five PWM outputs, three hardware UARTs plus USB, and microSD logging. Board ID 6204 allows compatible APJ uploaders to check the target; raw DFU and SWD flashing do not provide that protection. Use only the matching AF-F4_nano_v2 image.
pinoutImages:
  - /images/products/fc_F4_nano_v2_pinout_top.png
  - /images/products/fc_F4_nano_v2_pinout_bottom.png
firmware:
  - kind: "ArduPilot (.apj package)"
    file: /firmware/AF-F4_nano_v2-v1.0.12.apj
    version: "1.0.12"
    date: "2026-09-23"
    size: "688 KB"
    sha256: "86adf85f8dc9d2d70d8103e8190a4b3756a57c0ca2cac242c957009a2fabcc8c"
    notes: "ArduPilot Copter app. v1.0.12 bakes in the T10 field-validated common parameter set (2026-09-22): maximum lean angle 30 deg to 20 deg, arming 22.2 V with 21 / 20.4 V low and critical thresholds, SRTL_POINTS disabled, motor output order SERVO1-4 = Motor 4/3/2/1 with DShot ESC telemetry and BLHeli passthrough, and a 105 Hz harmonic notch. Per-airframe calibration (accel, gyro, compass, level trim) is deliberately not baked and must be performed after flashing. v1.0.11 pins the external MAX-M10S module's internal LNA to NORMAL (full gain): the u-blox default differs by module firmware (SPG 5.10 = NORMAL, SPG 5.20 = LOWGAIN). v1.0.10 fixes signing-timestamp flash writes that caused GPS UART overruns and stalled loops; signing remains available. Upload via the USB-C bootloader (Mission Planner) or the catalog Web Updater -> Firmware Update."
    method: ardupilot
    webPath: /firmware/AF-F4_nano_v2-v1.0.12.apj
  - kind: "Bootloader + App (merged HEX · DFU / SWD)"
    file: /firmware/AF-F4_nano_v2-v1.0.12_with_bl.hex
    version: "1.0.12"
    date: "2026-09-23"
    size: "2.2 MB"
    sha256: "fcfebe5ce749ce1ade49c24e67f5ace8a36de19f85acec45eda5c1ce2e8e9b86"
    notes: "Bootloader + application combined image based at 0x08000000. Flash via the catalog Web Updater → DFU Recovery (🛠 Enter DFU works buttonless on this board) or SWD/ST-Link for a blank/bricked board."
    method: dfu
    webPath: /firmware/AF-F4_nano_v2-v1.0.12_with_bl.hex
firmwareNotes: 'Every published image is downloadable here; the build sources stay in the private FC repository.'
---
