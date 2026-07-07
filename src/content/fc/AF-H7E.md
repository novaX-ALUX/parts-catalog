---
name: AF-H7E
tagline: Pixhawk FMUv6x Flight Controller · Modular Design
image: /images/products/fc_CUAV_V6X.jpg
pictureKey: fc_CUAV_V6X
order: 40
specs:
  - key: MCU
    value: STM32H753, ARM Cortex-M7, 480 MHz
  - key: RAM / Flash
    value: 1 MB / 2 MB
  - key: IMU
    value: BMI088 (Accel/Gyro)
  - key: Secondary IMU
    value: ICM-42688-P, ICM-20649
  - key: Magnetometer
    value: RM3100
  - key: Barometer
    value: 2× ICP-20100
  - key: Operating Voltage
    value: 4.75 – 5.7 V (Rated 5 V)
  - key: USB Input
    value: 4.75 – 5.25 V
  - key: Servo Rail
    value: 0 – 9.9 V
  - key: PWM Output
    value: 16 CH
  - key: RC Input
    value: S.Bus, PPM, DSM / Spektrum
  - key: RSSI Input
    value: Analog / PWM
  - key: UART
    value: 8 Port
  - key: I²C
    value: 2 Port
  - key: CAN
    value: 2 Port
  - key: ADC
    value: VBat/Current + Aux Analog Input
  - key: Size
    value: 45 × 90 × 29.2 mm
  - key: Mount Hole
    value: Pixhawk FMUv6x Standard
  - key: Weight
    value: 99 g (Core 43g + Baseboard 56g)
  - key: Operating Temp
    value: -20 ~ +85 ℃
  - key: Supported F/W
    value: PX4, ArduPilot
  - key: Ethernet
    value: 100 Mbps x 1 Port
description: AF-H7E is an enterprise-class H7 flight controller based on the Pixhawk FMUv6x standard. An STM32H753 at 480 MHz drives triple-redundant IMUs (BMI088 / ICM-42688-P / ICM-20649), an RM3100 magnetometer and dual ICP-20100 barometers. 16 PWM outputs, 8 UARTs, 2 CAN buses and a modular core / baseboard design support large industrial and commercial UAV platforms with PX4 and ArduPilot.
pinoutImage: /images/products/cuav-pixhawk6x-connectors.png
pinoutImages:
  - /images/products/fc_AF-H7E_dimensions.png
  - /images/products/cuav-pixhawk6x-connectors.png
pinoutNotes: ''
firmware:
  - kind: "ArduPilot Copter (.apj package)"
    file: https://github.com/novaX-ALUX/flight_controller/releases/download/v0.2.4/AF-H7E-v0.2.4-Copter.apj
    version: "0.2.4"
    date: "2026-07-07"
    size: "1.7 MB"
    sha256: "240b30623835134837adc4a3fd4331d7407487fc87cfac81a4128b70085b5433"
    notes: "ArduPilot Copter app. Copter and Plane share the same board_id (6202) — select by file name. Upload via the USB-C bootloader (Mission Planner) or the catalog Web Updater → Firmware Update."
    method: ardupilot
    webPath: /firmware/AF-H7E-v0.2.4-Copter.apj
  - kind: "ArduPilot Copter — Bootloader + App (merged HEX · DFU / SWD)"
    file: https://github.com/novaX-ALUX/flight_controller/releases/download/v0.2.4/AF-H7E-v0.2.4-Copter_with_bl.hex
    version: "0.2.4"
    date: "2026-07-07"
    size: "5.4 MB"
    sha256: "185de1b3f7d21846f15b1a8f3e26d26bfe1e78b7dd839ba84afbecd061a52b1e"
    notes: "Copter bootloader + application combined image based at 0x08000000. Flash via the catalog Web Updater → DFU Recovery (hold BOOT0) or SWD/ST-Link for a blank/bricked board."
    method: dfu
    webPath: /firmware/AF-H7E-v0.2.4-Copter_with_bl.hex
  - kind: "ArduPilot Plane (.apj package)"
    file: https://github.com/novaX-ALUX/flight_controller/releases/download/v0.2.4/AF-H7E-v0.2.4-Plane.apj
    version: "0.2.4"
    date: "2026-07-07"
    size: "1.7 MB"
    sha256: "7958ab45568c71d546b49d0475edb8217e64a7f316ea978ca5b5b6b262c7d9a5"
    notes: "ArduPilot Plane app. Copter and Plane share the same board_id (6202) — select by file name. Upload via the USB-C bootloader (Mission Planner) or the catalog Web Updater → Firmware Update."
    method: ardupilot
    webPath: /firmware/AF-H7E-v0.2.4-Plane.apj
  - kind: "ArduPilot Plane — Bootloader + App (merged HEX · DFU / SWD)"
    file: https://github.com/novaX-ALUX/flight_controller/releases/download/v0.2.4/AF-H7E-v0.2.4-Plane_with_bl.hex
    version: "0.2.4"
    date: "2026-07-07"
    size: "5.4 MB"
    sha256: "78771a0ea34d26cac523d41cccd4541fe62bc35bcedbec0fb335b7334cd41399"
    notes: "Plane bootloader + application combined image based at 0x08000000. Flash via the catalog Web Updater → DFU Recovery (hold BOOT0) or SWD/ST-Link for a blank/bricked board."
    method: dfu
    webPath: /firmware/AF-H7E-v0.2.4-Plane_with_bl.hex
firmwareNotes: 'All firmware releases are published on GitHub: https://github.com/novaX-ALUX/flight_controller/releases'
configNotes: ''
---
