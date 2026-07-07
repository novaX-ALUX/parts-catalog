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
    file: https://github.com/novaX-ALUX/flight_controller/releases/download/v0.2.9/AF-H7E-v0.2.9-Copter.apj
    version: "0.2.9"
    date: "2026-07-07"
    size: "1.7 MB"
    sha256: "d5463fdb8b81aefe2b4afb6c9e230e7229f8f1e1c2d05efeddd9a7e577f37ecd"
    notes: "ArduPilot Copter app. Copter and Plane share the same board_id (6202) - select by file name. Upload via the USB-C bootloader (Mission Planner) or the catalog Web Updater -> Firmware Update. Buttonless software DFU is also supported (see the update guide)."
    method: ardupilot
    webPath: /firmware/AF-H7E-v0.2.9-Copter.apj
  - kind: "ArduPilot Copter - Bootloader + App (merged HEX / DFU / SWD)"
    file: https://github.com/novaX-ALUX/flight_controller/releases/download/v0.2.9/AF-H7E-v0.2.9-Copter_with_bl.hex
    version: "0.2.9"
    date: "2026-07-07"
    size: "5.7 MB"
    sha256: "ac1a86dd7f33f520bfe597b4aa8e702a3ae883a629e060caeae8eeb249492e22"
    notes: "Copter bootloader + application combined image based at 0x08000000. Flash via the catalog Web Updater -> DFU Recovery or SWD/ST-Link for a blank board. The v0.2.9 bootloader self-heals after a DFU flash, so the app auto-boots with no power cycle. Copter and Plane share board_id 6202 - select by file name."
    method: dfu
    webPath: /firmware/AF-H7E-v0.2.9-Copter_with_bl.hex
  - kind: "ArduPilot Plane (.apj package)"
    file: https://github.com/novaX-ALUX/flight_controller/releases/download/v0.2.9/AF-H7E-v0.2.9-Plane.apj
    version: "0.2.9"
    date: "2026-07-07"
    size: "1.7 MB"
    sha256: "78392db17bf77d497750ff8d89a1ffab22fa22490fa2514a61e42a50a4c99e50"
    notes: "ArduPilot Plane app. Copter and Plane share the same board_id (6202) - select by file name. Upload via the USB-C bootloader (Mission Planner) or the catalog Web Updater -> Firmware Update. Buttonless software DFU is also supported (see the update guide)."
    method: ardupilot
    webPath: /firmware/AF-H7E-v0.2.9-Plane.apj
  - kind: "ArduPilot Plane - Bootloader + App (merged HEX / DFU / SWD)"
    file: https://github.com/novaX-ALUX/flight_controller/releases/download/v0.2.9/AF-H7E-v0.2.9-Plane_with_bl.hex
    version: "0.2.9"
    date: "2026-07-07"
    size: "5.6 MB"
    sha256: "4fef092ecea4157257e83a68fa76c06173de498ae06421d267d6549f44de25c6"
    notes: "Plane bootloader + application combined image based at 0x08000000. Flash via the catalog Web Updater -> DFU Recovery or SWD/ST-Link for a blank board. The v0.2.9 bootloader self-heals after a DFU flash, so the app auto-boots with no power cycle. Copter and Plane share board_id 6202 - select by file name."
    method: dfu
    webPath: /firmware/AF-H7E-v0.2.9-Plane_with_bl.hex
firmwareNotes: 'Update over USB-C, no jumper: open the catalog Web Updater, stay on Firmware Update, click Connect, pick the Copter or Plane .apj, then Update firmware. For a blank or non-booting board use DFU Recovery with the matching _with_bl.hex — unlike the BOOT0-button AF-F4 flow, AF-H7E enters DFU by software (click Enter DFU, no button) and the v0.2.9 bootloader self-heals so the app auto-boots after a DFU flash with no power cycle. On Windows the DFU device needs a one-time WinUSB driver (Zadig). All releases: https://github.com/novaX-ALUX/flight_controller/releases'
configNotes: ''
---
