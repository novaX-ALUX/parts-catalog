---
name: AF-F7 mini
tagline: F7 Mini Flight Controller
image: /images/products/fc_F7_mini.png
pictureKey: fc_F7_mini
order: 30
specs:
  - { key: MCU, value: "STM32F765, ARM Cortex-M7, 216 MHz" }
  - { key: RAM / Flash, value: "512 KB / 2 MB" }
  - { key: IMU, value: "ICM-20689 (Accel/Gyro)" }
  - { key: Secondary IMU, value: "ICM-20602, BMI055" }
  - { key: Magnetometer, value: "IST8310" }
  - { key: Barometer, value: "MS5611" }
  - { key: Operating Voltage, value: "4.75 – 5.5 V (Rated 5 V)" }
  - { key: USB Input, value: "4.75 – 5.25 V" }
  - { key: Servo Rail, value: "Max. 36 V (No Internal Regulator)" }
  - { key: PWM Output, value: "8 CH" }
  - { key: PWM / Capture Input, value: "3 CH" }
  - { key: RC Input, value: "S.Bus, PPM, DSM/DSM2/DSMX, CPPM" }
  - { key: RSSI Input, value: "Analog / PWM" }
  - { key: UART, value: "4 Port" }
  - { key: I²C, value: "3 Port" }
  - { key: CAN, value: "2 Port" }
  - { key: ADC, value: "VBat/Current + Aux Analog Input 2Ch" }
  - { key: Size, value: "64.2 × 42.3 × 14.6 mm" }
  - { key: Weight, value: "39.7 g" }
  - { key: Operating Temp, value: "-20 ~ +85 ℃" }
  - { key: Supported F/W, value: "ArduPilot, PX4" }
description: |
  AF-F7 mini is an F7-class flight controller powered by the STM32F765 running at 216 MHz. Dual IMUs (ICM-20689 primary, ICM-20602 / BMI055 secondary), an IST8310 magnetometer and an MS5611 barometer deliver redundant attitude, heading and altitude sensing. 8 PWM outputs, 4 UARTs, 3 I²C ports and 2 CAN buses cover mid-range UAV payload stacks running ArduPilot or PX4.
firmware:
  - kind: "ArduPilot (Copter)"
    file: https://github.com/novaX-ALUX/flight_controller/releases/download/v0.1.4/AF-F7_mini_v0.1.4.zip
    version: "0.1.4"
    date: "2026-06-04"
    size: "4.0 MB"
    sha256: "b042be8e695c2467c9938c9e265561069a5a25d52da603f47dcffbfafd283d0e"
    notes: "ZIP — arducopter_with_bl.hex (full flash), arducopter.apj (Mission Planner upload), bootloader. Build 92b0cd788e."
firmwareNotes: 'All firmware releases are published on GitHub: https://github.com/novaX-ALUX/flight_controller/releases'
---
