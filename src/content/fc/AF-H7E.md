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
pinoutNotes: 'I2C bus numbering on the multi-function ports: the GPS & Safety port carries I2C1, the GPS2 port carries I2C2, and the UART4 port carries I2C3.'
firmware:
  - kind: "ArduPilot Copter (.apj package)"
    file: https://github.com/novaX-ALUX/flight_controller/releases/download/AF-H7E-v1.2.9/AF-H7E-v1.2.9-Copter.apj
    version: "1.2.9"
    date: "2026-07-11"
    size: "1.7 MB"
    sha256: "4499511848c91a8e670f955de0464b829942c033069d65a43509386ad28cfdcb"
    notes: "ArduPilot Copter app. Copter and Plane share the same board_id (6202) - select by file name. Upload via the USB-C bootloader (Mission Planner) or the catalog Web Updater -> Firmware Update. Buttonless software DFU is also supported (see the update guide)."
    method: ardupilot
    webPath: /firmware/AF-H7E-v1.2.9-Copter.apj
  - kind: "ArduPilot Copter - Bootloader + App (merged HEX / DFU / SWD)"
    file: https://github.com/novaX-ALUX/flight_controller/releases/download/AF-H7E-v1.2.9/AF-H7E-v1.2.9-Copter_with_bl.hex
    version: "1.2.9"
    date: "2026-07-11"
    size: "5.7 MB"
    sha256: "d9597b5a4d570ea5d5022301c11c9677aba80cb03efa0d06a9afc9741067b11d"
    notes: "Copter bootloader + application combined image based at 0x08000000. Flash a running board via the catalog Web Updater -> DFU Recovery (click Enter DFU, buttonless — the AF-H7E has no BOOT0 button); the v0.2.9 bootloader self-heals so the app auto-boots after the flash with no power cycle. A blank / non-booting board is flashed via SWD/ST-Link. Copter and Plane share board_id 6202 - select by file name."
    method: dfu
    webPath: /firmware/AF-H7E-v1.2.9-Copter_with_bl.hex
  - kind: "ArduPilot Plane (.apj package)"
    file: https://github.com/novaX-ALUX/flight_controller/releases/download/AF-H7E-v1.2.9/AF-H7E-v1.2.9-Plane.apj
    version: "1.2.9"
    date: "2026-07-11"
    size: "1.7 MB"
    sha256: "41b356a1c66fb9df655977b2926739d66027a278d479c454fa9dbfc3abb223e2"
    notes: "ArduPilot Plane app. Copter and Plane share the same board_id (6202) - select by file name. Upload via the USB-C bootloader (Mission Planner) or the catalog Web Updater -> Firmware Update. Buttonless software DFU is also supported (see the update guide)."
    method: ardupilot
    webPath: /firmware/AF-H7E-v1.2.9-Plane.apj
  - kind: "ArduPilot Plane - Bootloader + App (merged HEX / DFU / SWD)"
    file: https://github.com/novaX-ALUX/flight_controller/releases/download/AF-H7E-v1.2.9/AF-H7E-v1.2.9-Plane_with_bl.hex
    version: "1.2.9"
    date: "2026-07-11"
    size: "5.6 MB"
    sha256: "eaedc9ba639e3cfce72107ba557c9dd5ce9499ba46646e21f7198cc002aa2139"
    notes: "Plane bootloader + application combined image based at 0x08000000. Flash a running board via the catalog Web Updater -> DFU Recovery (click Enter DFU, buttonless — the AF-H7E has no BOOT0 button); the v0.2.9 bootloader self-heals so the app auto-boots after the flash with no power cycle. A blank / non-booting board is flashed via SWD/ST-Link. Copter and Plane share board_id 6202 - select by file name."
    method: dfu
    webPath: /firmware/AF-H7E-v1.2.9-Plane_with_bl.hex
firmwareNotes: 'Update over USB-C, no jumper: open the catalog Web Updater, stay on Firmware Update, click Connect, pick the Copter or Plane .apj, then Update firmware. To reflash a running board over USB DFU, use DFU Recovery, click Enter DFU (buttonless software DFU — the AF-H7E has no BOOT0 button), then flash the matching _with_bl.hex; the v0.2.9 bootloader self-heals so the app auto-boots after the flash with no power cycle. A truly blank or non-booting board (Enter DFU cannot run) is recovered via SWD/ST-Link. On Windows the DFU device needs a one-time WinUSB driver (Zadig). All releases: https://github.com/novaX-ALUX/flight_controller/releases'
configNotes: ''
---
