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
    file: https://github.com/novaX-ALUX/flight_controller/releases/download/v0.2.3/AF-F7_mini-v0.2.3.apj
    version: "0.2.3"
    date: "2026-06-19"
    size: "1.4 MB"
    sha256: "7501b268fb9194d23a859f938044628c2c7d02ef3a63547da1d9db5f18dfeac0"
    notes: "ArduPilot Copter app. Upload via the USB-C bootloader (Mission Planner) or the catalog Web Updater → Firmware Update."
    method: ardupilot
    webPath: /firmware/AF-F7_mini-v0.2.3.apj
  - kind: "Bootloader + App (merged HEX · DFU / SWD)"
    file: https://github.com/novaX-ALUX/flight_controller/releases/download/v0.2.3/AF-F7_mini-v0.2.3_with_bl.hex
    version: "0.2.3"
    date: "2026-06-19"
    size: "4.6 MB"
    sha256: "93f5554e80c6a14ad2a3c8245e203ebdeff1eb15a64692a1bae084dfe68006ce"
    notes: "Bootloader + application combined image based at 0x08000000. Flash via the catalog Web Updater → DFU Recovery (hold BOOT0) or SWD/ST-Link for a blank/bricked board."
    method: dfu
    webPath: /firmware/AF-F7_mini-v0.2.3_with_bl.hex
firmwareNotes: 'All firmware releases are published on GitHub: https://github.com/novaX-ALUX/flight_controller/releases'
---
