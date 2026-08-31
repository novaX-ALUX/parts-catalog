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
  - kind: "ArduPilot Copter (.apj package)"
    file: https://github.com/novaX-ALUX/flight_controller/releases/download/AF-F7_mini-v1.3.0/AF-F7_mini-v1.3.0-Copter.apj
    version: "1.3.0"
    date: "2026-08-31"
    size: "1.5 MB"
    sha256: "8fec7e3bfeb618735e1b33d69477a28eef764643a33edbfa309f27ffd83fbc15"
    notes: "ArduPilot Copter app (board_id 6201). Copter and Plane share the same board_id - select by file name; the GCS banner also shows the vehicle (novaX Copter v1.3.0). Upload via the USB-C bootloader (Mission Planner) or the catalog Web Updater -> Firmware Update. Buttonless software DFU works once the matching _with_bl.hex has been flashed at least once."
    method: ardupilot
    webPath: /firmware/AF-F7_mini-v1.3.0-Copter.apj
  - kind: "ArduPilot Copter - Bootloader + App (merged HEX / DFU / SWD)"
    file: https://github.com/novaX-ALUX/flight_controller/releases/download/AF-F7_mini-v1.3.0/AF-F7_mini-v1.3.0-Copter_with_bl.hex
    version: "1.3.0"
    date: "2026-08-31"
    size: "4.8 MB"
    sha256: "d4b5c6ec782cac58e1aa7de088c8219f8531af1bca79f5167c09d0957325ef4a"
    notes: "Bootloader + application combined image based at 0x08000000 (board_id 6201, ENABLE_DFU_BOOT). Flash via the Web Updater -> DFU Recovery (buttonless: Enter DFU sends the app into ROM DFU; Windows needs a one-time WinUSB/Zadig on the 0483:df11 device), or SWD/ST-Link for a blank board. On F7 the ROM jump lives in the BOOTLOADER, so this merged image is what ENABLES buttonless DFU - a .apj alone cannot turn it on. Copter and Plane share board_id 6201 - select by file name."
    method: dfu
    webPath: /firmware/AF-F7_mini-v1.3.0-Copter_with_bl.hex
  - kind: "ArduPilot Plane (.apj package)"
    file: https://github.com/novaX-ALUX/flight_controller/releases/download/AF-F7_mini-v1.3.0/AF-F7_mini-v1.3.0-Plane.apj
    version: "1.3.0"
    date: "2026-08-31"
    size: "1.5 MB"
    sha256: "dda4b56f0c40f3f5d1a8d68192066ac0826439019a044cc150f8b6cee4313750"
    notes: "ArduPilot Plane app (board_id 6201). Copter and Plane share the same board_id - select by file name; the GCS banner also shows the vehicle (novaX Plane v1.3.0). Upload via the USB-C bootloader (Mission Planner) or the catalog Web Updater -> Firmware Update. Buttonless software DFU works once the matching _with_bl.hex has been flashed at least once."
    method: ardupilot
    webPath: /firmware/AF-F7_mini-v1.3.0-Plane.apj
  - kind: "ArduPilot Plane - Bootloader + App (merged HEX / DFU / SWD)"
    file: https://github.com/novaX-ALUX/flight_controller/releases/download/AF-F7_mini-v1.3.0/AF-F7_mini-v1.3.0-Plane_with_bl.hex
    version: "1.3.0"
    date: "2026-08-31"
    size: "4.8 MB"
    sha256: "2b3b8cb2dbe813d84fa152e5d0c4b27838ee0093cc8cee8dcdabca5a97755abd"
    notes: "Bootloader + application combined image based at 0x08000000 (board_id 6201, ENABLE_DFU_BOOT). Flash via the Web Updater -> DFU Recovery (buttonless: Enter DFU sends the app into ROM DFU; Windows needs a one-time WinUSB/Zadig on the 0483:df11 device), or SWD/ST-Link for a blank board. On F7 the ROM jump lives in the BOOTLOADER, so this merged image is what ENABLES buttonless DFU - a .apj alone cannot turn it on. Copter and Plane share board_id 6201 - select by file name."
    method: dfu
    webPath: /firmware/AF-F7_mini-v1.3.0-Plane_with_bl.hex
firmwareNotes: 'All firmware releases are published on GitHub: https://github.com/novaX-ALUX/flight_controller/releases'
---
