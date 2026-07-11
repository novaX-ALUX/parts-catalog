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
  - kind: "ArduPilot (.apj package)"
    file: https://github.com/novaX-ALUX/flight_controller/releases/download/AF-F7_mini-v1.2.4/AF-F7_mini-v1.2.4.apj
    version: "1.2.4"
    date: "2026-07-11"
    size: "1.4 MB"
    sha256: "89ea37adf770b2823e660e333f15840af36a0c49437970f5603c0bf191142d14"
    notes: "ArduPilot Copter app (board_id 6201). Adds verified buttonless software DFU. Upload via the USB-C bootloader (Mission Planner) or the catalog Web Updater → Firmware Update."
    method: ardupilot
    webPath: /firmware/AF-F7_mini-v1.2.4.apj
  - kind: "Bootloader + App (merged HEX · DFU / SWD)"
    file: https://github.com/novaX-ALUX/flight_controller/releases/download/AF-F7_mini-v1.2.4/AF-F7_mini-v1.2.4_with_bl.hex
    version: "1.2.4"
    date: "2026-07-11"
    size: "4.6 MB"
    sha256: "6d71164c975fd7b63699901d1b35ac757f63befa64c3f48e20c8ea52ee2c9e43"
    notes: "Bootloader + application combined image based at 0x08000000 (board_id 6201, ENABLE_DFU_BOOT). Flash via the Web Updater → DFU Recovery (buttonless: Enter DFU sends the app into ROM DFU; Windows needs a one-time WinUSB/Zadig on the 0483:df11 device), or SWD/ST-Link for a blank board."
    method: dfu
    webPath: /firmware/AF-F7_mini-v1.2.4_with_bl.hex
firmwareNotes: 'All firmware releases are published on GitHub: https://github.com/novaX-ALUX/flight_controller/releases'
---
