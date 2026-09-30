---
name: AF-H7E
tagline: Pixhawk FMUv6x Flight Controller · Modular Design
image: /images/products/fc_CUAV_V6X.jpg
pictureKey: fc_CUAV_V6X
order: 40
manuals:
  - { label: "한국어", file: /manuals/fc_AF-H7E_manual_ko.pdf }
  - { label: English, file: /manuals/fc_AF-H7E_manual_en.pdf }
specs:
  - key: MCU
    value: STM32H753, ARM Cortex-M7, 480 MHz
  - key: RAM / Flash
    value: 1 MB / 2 MB
  - key: IMU
    value: BMI088 (Bosch, accel / gyro)
  - key: Secondary IMU
    value: ICM-42688-P, ICM-20649 (TDK InvenSense)
  - key: IMU Heater
    value: Built-in heater on the IMU board, held at 45 °C (BRD_HEAT_TARG)
  - key: Magnetometer
    value: RM3100 (PNI)
  - key: Barometer
    value: 2× ICP-20100 (TDK InvenSense)
  - key: Operating Voltage
    value: 4.75 – 5.7 V (Rated 5 V)
  - key: USB Input
    value: 4.75 – 5.25 V
  - key: Servo Rail
    value: 0 – 9.9 V
  - key: PWM Output
    value: 8 FMU + 8 IOMCU channels
  - key: RC Input
    value: S.Bus, PPM, DSM / Spektrum
  - key: RSSI Input
    value: Analog / PWM
  - key: UART
    value: 7 peripheral serial interfaces + dedicated IOMCU link
  - key: Serial Mapping
    value: SERIAL1 = UART7 · SERIAL2 = UART5 · SERIAL3 = USART1 · SERIAL4 = UART8 · SERIAL5 = USART2 · SERIAL6 = UART4 · SERIAL7 = USART3 (USB = SERIAL0)
  - key: I²C
    value: 4 configured buses including internal sensors; 3 exposed on multifunction ports
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
    value: novaX ArduPilot (Copter and Plane releases)
  - key: Ethernet
    value: 100 Mbps x 1 Port
description: AF-H7E is a modular STM32H753 flight controller based on the Pixhawk FMUv6x architecture. The CUAV variant configures BMI088, ICM-42688-P and ICM-20649 IMUs, an RM3100 compass and two ICP-20100 barometers. A heater on the IMU board holds the sensors at 45 °C (BRD_HEAT_TARG), keeping gyro and accelerometer bias steady from a cold start to a hot day; the RM3100 compass reading is corrected for the heater current. Eight FMU outputs and eight IOMCU outputs provide 16 channels. Seven peripheral serial interfaces, a dedicated IOMCU link, four I2C buses including internal sensors, and two CAN buses are configured. Published firmware here is novaX ArduPilot Copter and Plane; PX4 compatibility is not verified by this catalog.
pinoutImage: /images/products/fc_AF-H7E_pinout.png
pinoutImages:
  - /images/products/fc_AF-H7E_pinout.png
  - /images/products/fc_AF-H7E_dimensions.png
pinoutNotes: 'I2C bus numbering on the multi-function ports: the GPS & Safety port carries I2C1, the GPS2 port carries I2C2, and the UART4 port carries I2C3.'
pinTable:
  - name: POWER 1
    type: Molex Micro-Lock Plus 6P (1.25 mm) · top, left of the FMU
    mapping: Primary power input · I2C1 power monitor
    pins:
      - { pin: 1, signal: VCC_IN, function: "5 V supply input from the power module" }
      - { pin: 2, signal: VCC_IN, function: "5 V supply input from the power module" }
      - { pin: 3, signal: SCL, function: "Power-module I2C clock (voltage / current monitor)" }
      - { pin: 4, signal: SDA, function: "Power-module I2C data (voltage / current monitor)" }
      - { pin: 5, signal: GND, function: "Ground" }
      - { pin: 6, signal: GND, function: "Ground" }
  - name: POWER 2
    type: Molex Micro-Lock Plus 6P (1.25 mm) · top, right of the FMU
    mapping: Redundant power input · I2C2 power monitor
    pins:
      - { pin: 1, signal: VCC_IN, function: "5 V supply input from the second power module" }
      - { pin: 2, signal: VCC_IN, function: "5 V supply input from the second power module" }
      - { pin: 3, signal: SCL, function: "Power-module I2C clock (voltage / current monitor)" }
      - { pin: 4, signal: SDA, function: "Power-module I2C data (voltage / current monitor)" }
      - { pin: 5, signal: GND, function: "Ground" }
      - { pin: 6, signal: GND, function: "Ground" }
  - name: POWER C1
    type: 6P · top, rear left (on the PWM header block)
    mapping: CAN power module input · CAN1
    pins:
      - { pin: 1, signal: GND, function: "Ground" }
      - { pin: 2, signal: GND, function: "Ground" }
      - { pin: 3, signal: CAN_L, function: "CAN1 bus low (same bus as the CAN 1 port)" }
      - { pin: 4, signal: CAN_H, function: "CAN1 bus high" }
      - { pin: 5, signal: VCC_IN, function: "5 V supply input from the CAN power module" }
      - { pin: 6, signal: VCC_IN, function: "5 V supply input from the CAN power module" }
  - name: POWER C2
    type: 6P · top, rear right (on the PWM header block)
    mapping: CAN power module input · CAN2
    pins:
      - { pin: 1, signal: GND, function: "Ground" }
      - { pin: 2, signal: GND, function: "Ground" }
      - { pin: 3, signal: CAN_L, function: "CAN2 bus low (same bus as the CAN 2 port)" }
      - { pin: 4, signal: CAN_H, function: "CAN2 bus high" }
      - { pin: 5, signal: VCC_IN, function: "5 V supply input from the second CAN power module" }
      - { pin: 6, signal: VCC_IN, function: "5 V supply input from the second CAN power module" }
  - name: TELEM 1
    type: JST-GH 6P · front, lower row
    mapping: SERIAL1 · UART7 · default MAVLink2
    pins:
      - { pin: 1, signal: VCC, function: "5 V output" }
      - { pin: 2, signal: TX, function: "UART transmit (FC → device)" }
      - { pin: 3, signal: RX, function: "UART receive (device → FC)" }
      - { pin: 4, signal: CTS, function: "Clear to send — hardware flow control input" }
      - { pin: 5, signal: RTS, function: "Request to send — hardware flow control output" }
      - { pin: 6, signal: GND, function: "Ground" }
  - name: TELEM 2
    type: JST-GH 6P · front, lower row
    mapping: SERIAL2 · UART5 · default MAVLink2
    pins:
      - { pin: 1, signal: VCC, function: "5 V output" }
      - { pin: 2, signal: TX, function: "UART transmit (FC → device)" }
      - { pin: 3, signal: RX, function: "UART receive (device → FC)" }
      - { pin: 4, signal: CTS, function: "Clear to send — hardware flow control input" }
      - { pin: 5, signal: RTS, function: "Request to send — hardware flow control output" }
      - { pin: 6, signal: GND, function: "Ground" }
  - name: TELEM 3
    type: JST-GH 6P · front, upper row
    mapping: SERIAL5 · USART2
    pins:
      - { pin: 1, signal: VCC, function: "5 V output" }
      - { pin: 2, signal: TX, function: "UART transmit (FC → device)" }
      - { pin: 3, signal: RX, function: "UART receive (device → FC)" }
      - { pin: 4, signal: CTS, function: "Clear to send — hardware flow control input" }
      - { pin: 5, signal: RTS, function: "Request to send — hardware flow control output" }
      - { pin: 6, signal: GND, function: "Ground" }
  - name: GPS & SAFETY
    type: JST-GH 10P · front, upper row
    mapping: SERIAL3 · USART1 + I2C1 · default GPS
    pins:
      - { pin: 1, signal: VCC, function: "5 V output" }
      - { pin: 2, signal: TX, function: "UART transmit (FC → GPS)" }
      - { pin: 3, signal: RX, function: "UART receive (GPS → FC)" }
      - { pin: 4, signal: SCL, function: "I2C1 clock — compass in the GPS module" }
      - { pin: 5, signal: SDA, function: "I2C1 data" }
      - { pin: 6, signal: SAFETY_SW, function: "Safety switch input" }
      - { pin: 7, signal: SAFETY_LED, function: "Safety switch LED output" }
      - { pin: 8, signal: VCC_3V3, function: "3.3 V supply for the safety switch" }
      - { pin: 9, signal: BUZZER, function: "Buzzer output" }
      - { pin: 10, signal: GND, function: "Ground" }
  - name: GPS 2
    type: JST-GH 6P · front, upper row
    mapping: SERIAL4 · UART8 + I2C2 · default GPS
    pins:
      - { pin: 1, signal: VCC, function: "5 V output" }
      - { pin: 2, signal: TX, function: "UART transmit (FC → GPS)" }
      - { pin: 3, signal: RX, function: "UART receive (GPS → FC)" }
      - { pin: 4, signal: SCL, function: "I2C2 clock — compass in the GPS module" }
      - { pin: 5, signal: SDA, function: "I2C2 data" }
      - { pin: 6, signal: GND, function: "Ground" }
  - name: UART 4
    type: JST-GH 7P · right side, front
    mapping: SERIAL6 · UART4 + I2C3
    pins:
      - { pin: 1, signal: VCC, function: "5 V output" }
      - { pin: 2, signal: TX, function: "UART transmit (FC → device)" }
      - { pin: 3, signal: RX, function: "UART receive (device → FC)" }
      - { pin: 4, signal: SCL, function: "I2C3 clock" }
      - { pin: 5, signal: SDA, function: "I2C3 data" }
      - { pin: 6, signal: NFC_GPIO, function: "General-purpose I/O" }
      - { pin: 7, signal: GND, function: "Ground" }
  - name: CAN 1
    type: JST-GH 4P · front, lower row
    mapping: CAN1 · DroneCAN
    pins:
      - { pin: 1, signal: VCC, function: "5 V output to CAN peripherals (not a power input)" }
      - { pin: 2, signal: CAN_H, function: "CAN bus high" }
      - { pin: 3, signal: CAN_L, function: "CAN bus low" }
      - { pin: 4, signal: GND, function: "Ground" }
  - name: CAN 2
    type: JST-GH 4P · front, lower row
    mapping: CAN2 · DroneCAN
    pins:
      - { pin: 1, signal: VCC, function: "5 V output to CAN peripherals (not a power input)" }
      - { pin: 2, signal: CAN_H, function: "CAN bus high" }
      - { pin: 3, signal: CAN_L, function: "CAN bus low" }
      - { pin: 4, signal: GND, function: "Ground" }
  - name: DSM / SBUS RC
    type: JST-GH 5P · right side
    mapping: RC input through the IOMCU · SBUS / DSM
    pins:
      - { pin: 1, signal: VCC, function: "5 V receiver supply" }
      - { pin: 2, signal: RC_IN, function: "SBUS / DSM receiver input" }
      - { pin: 3, signal: RSSI, function: "Analog RSSI input" }
      - { pin: 4, signal: VCC_3V3, function: "3.3 V supply for DSM / Spektrum satellite receivers" }
      - { pin: 5, signal: GND, function: "Ground" }
  - name: PPM IN
    type: JST-GH 3P · right side
    mapping: PPM receiver input
    pins:
      - { pin: 1, signal: VCC, function: "5 V receiver supply" }
      - { pin: 2, signal: PPM, function: "PPM receiver input" }
      - { pin: 3, signal: GND, function: "Ground" }
  - name: SBUS OUT
    type: JST-GH 3P · right side, rear
    mapping: SBUS output from the IOMCU
    pins:
      - { pin: 1, signal: NC, function: "Not connected" }
      - { pin: 2, signal: SBUS_OUT, function: "SBUS servo output" }
      - { pin: 3, signal: GND, function: "Ground" }
  - name: PWM OUT M1–M8
    type: 3 × 16 pin header · rows about 2.54 mm (servo plug S · + · −), channels 2.6 mm apart on the base PCB · columns 1–8 (left)
    mapping: MAIN outputs from the IOMCU · SERVO1–8
    pins:
      - { pin: S, signal: M1 … M8, function: "Motor / servo output signal, one per channel (rear row)" }
      - { pin: +, signal: V_SERVO, function: "Servo rail 0 – 9.9 V, bussed across all channels — supplied externally (e.g. BEC)" }
      - { pin: −, signal: GND, function: "Ground (front row)" }
  - name: PWM OUT A1–A8
    type: 3 × 16 pin header · rows about 2.54 mm (servo plug S · + · −), channels 2.6 mm apart on the base PCB · columns 9–16 (right)
    mapping: AUX outputs from the FMU · SERVO9–16
    pins:
      - { pin: S, signal: A1 … A8, function: "Motor / servo output signal, one per channel (rear row)" }
      - { pin: +, signal: V_SERVO, function: "Servo rail 0 – 9.9 V, bussed across all channels — supplied externally (e.g. BEC)" }
      - { pin: −, signal: GND, function: "Ground (front row)" }
  - name: ETHERNET
    type: JST-GH 4P · left side
    mapping: 100BASE-T
    pins:
      - { pin: 1, signal: RX−, function: "Ethernet receive pair −" }
      - { pin: 2, signal: RX+, function: "Ethernet receive pair +" }
      - { pin: 3, signal: TX−, function: "Ethernet transmit pair −" }
      - { pin: 4, signal: TX+, function: "Ethernet transmit pair +" }
  - name: USB-C
    type: USB Type-C · left side, rear
    mapping: SERIAL0 · USB 2.0 Full Speed
    pins:
      - { pin: "A4 B4 A9 B9", signal: VBUS, function: "5 V from USB — configuration and firmware update on the bench" }
      - { pin: "A6 B6", signal: D+, function: "USB data +" }
      - { pin: "A7 B7", signal: D−, function: "USB data −" }
      - { pin: "A5 B5", signal: CC1 / CC2, function: "Configuration channel (device role)" }
      - { pin: "A1 B1 A12 B12", signal: GND, function: "Ground" }
  - name: USB
    type: JST-GH 4P · front end, middle
    mapping: USB 2.0 — same data lines as the USB-C port (use one at a time)
    pins:
      - { pin: 1, signal: VBUS, function: "5 V USB supply" }
      - { pin: 2, signal: D−, function: "USB data −" }
      - { pin: 3, signal: D+, function: "USB data +" }
      - { pin: 4, signal: GND, function: "Ground" }
  - name: AD & IO
    type: JST-GH 8P · left side, front
    mapping: FMU auxiliary inputs and outputs
    pins:
      - { pin: 1, signal: VCC, function: "5 V output" }
      - { pin: 2, signal: CAP1, function: "FMU timer capture input" }
      - { pin: 3, signal: BOOTLOADER, function: "FMU bootloader request input" }
      - { pin: 4, signal: RST_REQ, function: "FMU reset request input" }
      - { pin: 5, signal: nARMED, function: "Armed status output (low = armed)" }
      - { pin: 6, signal: ADC_3V3, function: "Analog input, 0 – 3.3 V" }
      - { pin: 7, signal: ADC_6V6, function: "Analog input, 0 – 6.6 V (divided)" }
      - { pin: 8, signal: GND, function: "Ground" }
  - name: SPI 6
    type: JST-GH 11P · right side
    mapping: External SPI6 — not enabled in novaX firmware
    pins:
      - { pin: 1, signal: VCC, function: "5 V output" }
      - { pin: 2, signal: SCK, function: "SPI clock" }
      - { pin: 3, signal: MISO, function: "SPI data in" }
      - { pin: 4, signal: MOSI, function: "SPI data out" }
      - { pin: 5, signal: CS1, function: "Chip select 1" }
      - { pin: 6, signal: CS2, function: "Chip select 2" }
      - { pin: 7, signal: SYNC, function: "Sync output" }
      - { pin: 8, signal: DRDY1, function: "Data-ready input 1" }
      - { pin: 9, signal: DRDY2, function: "Data-ready input 2" }
      - { pin: 10, signal: nRESET, function: "Reset output" }
      - { pin: 11, signal: GND, function: "Ground" }
  - name: FMU DEBUG
    type: JST-SH 10P · front end, left · Pixhawk Debug Full
    mapping: SERIAL7 · USART3 · console + SWD
    pins:
      - { pin: 1, signal: VCC_3V3, function: "3.3 V reference for the debug probe" }
      - { pin: 2, signal: CONSOLE_TX, function: "Debug console transmit (FC → probe)" }
      - { pin: 3, signal: CONSOLE_RX, function: "Debug console receive (probe → FC)" }
      - { pin: 4, signal: SWDIO, function: "SWD data — bootloader programming and firmware recovery" }
      - { pin: 5, signal: SWCLK, function: "SWD clock" }
      - { pin: 6, signal: SWO, function: "Trace output (shared with SPI6 SCK)" }
      - { pin: 7, signal: NFC_GPIO, function: "General-purpose I/O" }
      - { pin: 8, signal: PH11, function: "General-purpose I/O" }
      - { pin: 9, signal: nRST, function: "FMU reset" }
      - { pin: 10, signal: GND, function: "Ground" }
  - name: IO DEBUG
    type: JST-SH 10P · front end, right
    mapping: IOMCU console + SWD
    pins:
      - { pin: 1, signal: VCC_3V3, function: "3.3 V reference for the debug probe" }
      - { pin: 2, signal: IO_TX, function: "IOMCU console transmit" }
      - { pin: 3, signal: NC, function: "Not connected" }
      - { pin: 4, signal: SWDIO, function: "IOMCU SWD data" }
      - { pin: 5, signal: SWCLK, function: "IOMCU SWD clock" }
      - { pin: 6, signal: SWO, function: "IOMCU trace output" }
      - { pin: 7, signal: GPIO1, function: "IOMCU spare I/O" }
      - { pin: 8, signal: GPIO2, function: "IOMCU spare I/O" }
      - { pin: 9, signal: nRST, function: "IOMCU reset" }
      - { pin: 10, signal: GND, function: "Ground" }
firmware:
  - kind: "ArduPilot Copter (.apj package)"
    file: /firmware/AF-H7E-v1.3.0-Copter.apj
    version: "1.3.0"
    date: "2026-08-20"
    size: "1.7 MB"
    sha256: "f22af5b791f3d85de3337e13b5977914847ddb01e6e53ad6ff615703209da69d"
    notes: "ArduPilot Copter app. Copter and Plane share the same board_id (6202) - select by file name. Upload via the USB-C bootloader (Mission Planner) or the catalog Web Updater -> Firmware Update. Buttonless software DFU is also supported (see the update guide)."
    method: ardupilot
    webPath: /firmware/AF-H7E-v1.3.0-Copter.apj
  - kind: "ArduPilot Copter - Bootloader + App (merged HEX / DFU / SWD)"
    file: /firmware/AF-H7E-v1.3.0-Copter_with_bl.hex
    version: "1.3.0"
    date: "2026-08-20"
    size: "5.7 MB"
    sha256: "d9a0e2f5ba127e42eb4d12b33c31f76dd0e669f0a4ccb4871715b4d3d41317fd"
    notes: "Copter bootloader + application combined image based at 0x08000000. Flash a running board via the catalog Web Updater -> DFU Recovery (click Enter DFU, buttonless — the AF-H7E has no BOOT0 button); the v0.2.9 bootloader self-heals so the app auto-boots after the flash with no power cycle. A blank / non-booting board is flashed via SWD/ST-Link. Copter and Plane share board_id 6202 - select by file name."
    method: dfu
    webPath: /firmware/AF-H7E-v1.3.0-Copter_with_bl.hex
  - kind: "ArduPilot Plane (.apj package)"
    file: /firmware/AF-H7E-v1.3.0-Plane.apj
    version: "1.3.0"
    date: "2026-08-20"
    size: "1.7 MB"
    sha256: "a04ad3d884c0550d0980d765ffa5d4f5c09db702e5edfc93e3ceba0c3bd8cb28"
    notes: "ArduPilot Plane app. Copter and Plane share the same board_id (6202) - select by file name. Upload via the USB-C bootloader (Mission Planner) or the catalog Web Updater -> Firmware Update. Buttonless software DFU is also supported (see the update guide)."
    method: ardupilot
    webPath: /firmware/AF-H7E-v1.3.0-Plane.apj
  - kind: "ArduPilot Plane - Bootloader + App (merged HEX / DFU / SWD)"
    file: /firmware/AF-H7E-v1.3.0-Plane_with_bl.hex
    version: "1.3.0"
    date: "2026-08-20"
    size: "5.6 MB"
    sha256: "a659cbbc4275d7f39663b529b92d8e69d502b4d142c39fdc382a29ac929d43b3"
    notes: "Plane bootloader + application combined image based at 0x08000000. Flash a running board via the catalog Web Updater -> DFU Recovery (click Enter DFU, buttonless — the AF-H7E has no BOOT0 button); the v0.2.9 bootloader self-heals so the app auto-boots after the flash with no power cycle. A blank / non-booting board is flashed via SWD/ST-Link. Copter and Plane share board_id 6202 - select by file name."
    method: dfu
    webPath: /firmware/AF-H7E-v1.3.0-Plane_with_bl.hex
firmwareNotes: 'Update over USB-C, no jumper: open the catalog Web Updater, stay on Firmware Update, click Connect, pick the Copter or Plane .apj, then Update firmware. To reflash a running board over USB DFU, use DFU Recovery, click Enter DFU (buttonless software DFU — the AF-H7E has no BOOT0 button), then flash the matching _with_bl.hex; the v0.2.9 bootloader self-heals so the app auto-boots after the flash with no power cycle. A truly blank or non-booting board (Enter DFU cannot run) is recovered via SWD/ST-Link. On Windows the DFU device needs a one-time WinUSB driver (Zadig). All published images are in the download list above'
configNotes: ''
---
