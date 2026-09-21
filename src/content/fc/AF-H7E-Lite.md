---
name: AF-H7E Lite
tagline: Compact Pixhawk FMUv6x Flight Controller
image: /images/products/fc_AF-H7E-Lite.png
order: 41
manuals:
  - { label: "한국어", file: /manuals/fc_AF-H7E-Lite_manual_ko.pdf }
  - { label: English, file: /manuals/fc_AF-H7E-Lite_manual_en.pdf }
comingSoon: true
specs:
  - key: MCU
    value: STM32H753, ARM Cortex-M7, 480 MHz
  - key: RAM / Flash
    value: 1 MB / 2 MB
  - key: IMU
    value: ICM-42688-P, BMI088
  - key: Secondary IMU
    value: ICM-20649 (optional)
  - key: Magnetometer
    value: RM3100 (optional; use an external compass when not fitted)
  - key: Barometer
    value: 2× ICP-20100
  - key: Operating Voltage
    value: 4.75 – 5.7 V (Rated 5 V)
  - key: USB Input
    value: 4.75 – 5.25 V
  - key: Power Input
    value: POWER 1 + POWER 2 (redundant, I2C power modules)
  - key: PWM Output
    value: 12 FMU channels (DShot except M7–M8) + SBUS out
  - key: RC Input
    value: S.Bus, PPM, DSM / Spektrum (with DSM bind)
  - key: RSSI Input
    value: Analog
  - key: UART
    value: 6 serial ports (2 with flow control) + debug console
  - key: I²C
    value: 2 ports (I2C A, I2C B) + power-module bus on POWER 1 · 2
  - key: CAN
    value: 2 Port
  - key: Ethernet
    value: 100 Mbps x 1 Port
  - key: Size
    value: 43.0 × 62.5 × 29.2 mm (concept case)
  - key: Supported F/W
    value: novaX ArduPilot (Copter and Plane releases)
description: AF-H7E Lite keeps the AF-H7E STM32H753 compute module and sensor module on a compact carrier without the IO co-processor. All 12 PWM outputs and an SBUS output come straight from the flight-controller MCU, with dual CAN, 100 Mbps Ethernet, redundant power inputs and a 5-pin RC input that takes AF-H7E cables. In development - the pin definition may change before release.
pinoutImage: /images/products/fc_AF-H7E-Lite_pinout.png
pinoutNotes: |
  Preliminary pin definition — AF-H7E Lite is in development and connectors may change before release. On every JST connector pin 1 is the supply pin and the last pin is GND, following the Pixhawk connector standard. UART n maps to ArduPilot SERIALn: UART 1–2 default to MAVLink telemetry and UART 3–4 default to GPS. GPS modules connect to any UART or over DroneCAN; there is no dedicated GPS/safety port and no safety switch. RC IN is a 5-pin connector with the same pinout as AF-H7E and takes an SBUS, PPM or DSM receiver directly on pin 2 (protocol auto-detected, wired to the flight-controller MCU, no IO board needed); pin 1 supplies 5 V and pin 4 a switched 3.3 V for DSM / Spektrum satellite receivers, which the flight controller power-cycles to bind them. On-board without a connector: microSD card slot (logging), buzzer and RGB status LED.

  The + rail of the PWM header is not powered by the flight controller. The 13th header column, SB, is an SBUS output, not a PWM channel: it carries servo channels 1–16 on one wire from USART6 (SERIAL8) with the signal inversion done inside the STM32H7, so SBUS servos, SBUS-to-PWM decoders and gimbals plug in with a standard servo lead and take power from the servo rail. Outputs share rate and protocol within the timer groups M1–M4, M5 · M6 · M9 · M10, M7–M8 and M11–M12; DShot works on every group except M7–M8, whose timer has no DMA (PWM and OneShot only).

  POWER 1 and POWER 2 sit on the top side at the rear edge with their latch facing the rear wall, so the plug is released from outside the case through the wall opening; RC IN, UART 4 and UART 6 sit under them on the bottom side and plug in from the rear like the side connectors. The PWM header sits 1.5 mm behind the sensor module: as on AF-H7E the signal row (S) is the rearmost row and the case has a keyed comb behind it, so servo plugs only fit with S at the rear. The pinout image is a top view of the concept carrier: side connectors are mounted on the bottom side and plug in from the edges, and each table lists pins in the order they sit when seen from above. POWER 1 and POWER 2 use the same Molex Micro-Lock Plus connector as AF-H7E; their pin-1 end is still to be confirmed. POWER 1 and POWER 2 take I2C (INA2xx) power modules; a DroneCAN power module (for example 14S / 200 A) reports over CAN 1 or CAN 2 (BATT_MONITOR 8) and needs a split cable that feeds its 5 V into POWER 1, because the CAN connectors supply 5 V rather than accept it.
pinTable:
  - name: POWER 1
    type: Molex Micro-Lock Plus 6P (1.25 mm) · same as AF-H7E
    mapping: Primary power input
    pins:
      - { pin: 1, signal: VCC_IN, function: "5 V supply input from the power module" }
      - { pin: 2, signal: VCC_IN, function: "5 V supply input from the power module" }
      - { pin: 3, signal: SCL, function: "Power-module I2C clock (voltage / current monitor)" }
      - { pin: 4, signal: SDA, function: "Power-module I2C data (voltage / current monitor)" }
      - { pin: 5, signal: GND, function: "Ground" }
      - { pin: 6, signal: GND, function: "Ground" }
  - name: POWER 2
    type: Molex Micro-Lock Plus 6P (1.25 mm) · same as AF-H7E
    mapping: Redundant power input
    pins:
      - { pin: 1, signal: VCC_IN, function: "5 V supply input from the second power module" }
      - { pin: 2, signal: VCC_IN, function: "5 V supply input from the second power module" }
      - { pin: 3, signal: SCL, function: "Power-module I2C clock (voltage / current monitor)" }
      - { pin: 4, signal: SDA, function: "Power-module I2C data (voltage / current monitor)" }
      - { pin: 5, signal: GND, function: "Ground" }
      - { pin: 6, signal: GND, function: "Ground" }
  - name: UART 1
    type: JST-GH 6P
    mapping: SERIAL1 · UART7 · default MAVLink2
    pins:
      - { pin: 1, signal: VCC, function: "5 V output" }
      - { pin: 2, signal: TX, function: "UART transmit (FC → device)" }
      - { pin: 3, signal: RX, function: "UART receive (device → FC)" }
      - { pin: 4, signal: CTS, function: "Clear to send — hardware flow control input" }
      - { pin: 5, signal: RTS, function: "Request to send — hardware flow control output" }
      - { pin: 6, signal: GND, function: "Ground" }
  - name: UART 2
    type: JST-GH 6P
    mapping: SERIAL2 · UART5 · default MAVLink2
    pins:
      - { pin: 1, signal: VCC, function: "5 V output" }
      - { pin: 2, signal: TX, function: "UART transmit (FC → device)" }
      - { pin: 3, signal: RX, function: "UART receive (device → FC)" }
      - { pin: 4, signal: CTS, function: "Clear to send — hardware flow control input" }
      - { pin: 5, signal: RTS, function: "Request to send — hardware flow control output" }
      - { pin: 6, signal: GND, function: "Ground" }
  - name: UART 3
    type: JST-GH 4P
    mapping: SERIAL3 · USART1 · default GPS
    pins:
      - { pin: 1, signal: VCC, function: "5 V output" }
      - { pin: 2, signal: TX, function: "UART transmit (FC → device)" }
      - { pin: 3, signal: RX, function: "UART receive (device → FC)" }
      - { pin: 4, signal: GND, function: "Ground" }
  - name: UART 4
    type: JST-GH 4P
    mapping: SERIAL4 · UART8 · default GPS
    pins:
      - { pin: 1, signal: VCC, function: "5 V output" }
      - { pin: 2, signal: TX, function: "UART transmit (FC → device)" }
      - { pin: 3, signal: RX, function: "UART receive (device → FC)" }
      - { pin: 4, signal: GND, function: "Ground" }
  - name: UART 5
    type: JST-GH 4P
    mapping: SERIAL5 · USART2
    pins:
      - { pin: 1, signal: VCC, function: "5 V output" }
      - { pin: 2, signal: TX, function: "UART transmit (FC → device)" }
      - { pin: 3, signal: RX, function: "UART receive (device → FC)" }
      - { pin: 4, signal: GND, function: "Ground" }
  - name: UART 6
    type: JST-GH 4P
    mapping: SERIAL6 · UART4
    pins:
      - { pin: 1, signal: VCC, function: "5 V output" }
      - { pin: 2, signal: TX, function: "UART transmit (FC → device)" }
      - { pin: 3, signal: RX, function: "UART receive (device → FC)" }
      - { pin: 4, signal: GND, function: "Ground" }
  - name: I2C A
    type: JST-GH 4P
    mapping: I2C2
    pins:
      - { pin: 1, signal: VCC, function: "5 V output" }
      - { pin: 2, signal: SCL, function: "I2C clock — external compass, rangefinder, airspeed …" }
      - { pin: 3, signal: SDA, function: "I2C data" }
      - { pin: 4, signal: GND, function: "Ground" }
  - name: I2C B
    type: JST-GH 4P
    mapping: I2C3
    pins:
      - { pin: 1, signal: VCC, function: "5 V output" }
      - { pin: 2, signal: SCL, function: "I2C clock — external compass, rangefinder, airspeed …" }
      - { pin: 3, signal: SDA, function: "I2C data" }
      - { pin: 4, signal: GND, function: "Ground" }
  - name: CAN 1
    type: JST-GH 4P
    mapping: CAN1 · DroneCAN
    pins:
      - { pin: 1, signal: VCC, function: "5 V output to CAN peripherals (not a power input)" }
      - { pin: 2, signal: CAN_H, function: "CAN bus high" }
      - { pin: 3, signal: CAN_L, function: "CAN bus low" }
      - { pin: 4, signal: GND, function: "Ground" }
  - name: CAN 2
    type: JST-GH 4P
    mapping: CAN2 · DroneCAN
    pins:
      - { pin: 1, signal: VCC, function: "5 V output to CAN peripherals (not a power input)" }
      - { pin: 2, signal: CAN_H, function: "CAN bus high" }
      - { pin: 3, signal: CAN_L, function: "CAN bus low" }
      - { pin: 4, signal: GND, function: "Ground" }
  - name: RC IN
    type: JST-GH 5P · rear edge
    mapping: RC input · SBUS / PPM / DSM (auto-detected)
    pins:
      - { pin: 1, signal: VCC, function: "5 V receiver supply" }
      - { pin: 2, signal: RC_IN, function: "SBUS / PPM / DSM receiver input (protocol auto-detected)" }
      - { pin: 3, signal: RSSI, function: "Analog RSSI input (0–3.3 V)" }
      - { pin: 4, signal: VCC_3V3, function: "Switched 3.3 V supply for DSM / Spektrum satellite receivers (power-cycled to bind)" }
      - { pin: 5, signal: GND, function: "Ground" }
  - name: ETHERNET
    type: JST-GH 4P
    mapping: 100BASE-T
    pins:
      - { pin: 1, signal: TX+, function: "Ethernet transmit pair +" }
      - { pin: 2, signal: TX−, function: "Ethernet transmit pair −" }
      - { pin: 3, signal: RX+, function: "Ethernet receive pair +" }
      - { pin: 4, signal: RX−, function: "Ethernet receive pair −" }
  - name: DEBUG
    type: JST-SH 6P · Pixhawk Debug Mini
    mapping: SERIAL7 · USART3 console
    pins:
      - { pin: 1, signal: VREF, function: "3.3 V reference for the debug probe" }
      - { pin: 2, signal: CONSOLE_TX, function: "Debug console transmit (FC → probe)" }
      - { pin: 3, signal: CONSOLE_RX, function: "Debug console receive (probe → FC)" }
      - { pin: 4, signal: SWDIO, function: "SWD data — bootloader programming and firmware recovery" }
      - { pin: 5, signal: SWCLK, function: "SWD clock" }
      - { pin: 6, signal: GND, function: "Ground" }
  - name: USB
    type: USB Type-C
    mapping: SERIAL0 · USB 2.0 Full Speed
    pins:
      - { pin: "A4 B4 A9 B9", signal: VBUS, function: "5 V from USB — configuration and firmware update on the bench" }
      - { pin: "A6 B6", signal: D+, function: "USB data +" }
      - { pin: "A7 B7", signal: D−, function: "USB data −" }
      - { pin: "A5 B5", signal: CC1 / CC2, function: "Configuration channel (device role)" }
      - { pin: "A1 B1 A12 B12", signal: GND, function: "Ground" }
  - name: PWM OUT M1–M12
    type: 2.54 mm 3 × 13 pin header · columns 1–12
    mapping: Main outputs 1–12
    pins:
      - { pin: S, signal: M1 … M12, function: "Motor / servo output signal, one per channel (PWM · OneShot · DShot; M7–M8 without DShot)" }
      - { pin: +, signal: V_SERVO, function: "Servo rail, bussed across all channels — supplied externally (e.g. BEC)" }
      - { pin: −, signal: GND, function: "Ground" }
  - name: SB (SBUS OUT)
    type: 2.54 mm 3 × 13 pin header · column 13, next to M12
    mapping: SERIAL8 · USART6 · SBus servo out
    pins:
      - { pin: S, signal: SBUS_OUT, function: "SBUS output — servo channels 1–16 on one wire (SERIAL8_PROTOCOL 15, SERIAL8_OPTIONS 2 inverts TX inside the MCU)" }
      - { pin: +, signal: V_SERVO, function: "Servo rail, bussed across all channels — supplied externally (e.g. BEC)" }
      - { pin: −, signal: GND, function: "Ground" }
gallery:
  - /images/products/fc_AF-H7E-Lite.png
  - /images/products/fc_AF-H7E-Lite_flat.png
  - /images/products/fc_AF-H7E-Lite_rear.png
firmware:
  - kind: "ArduPilot Copter (.apj package)"
    file: https://github.com/novaX-ALUX/fc/releases/download/AF-H7E_Lite-v0.1.0/AF-H7E_Lite-v0.1.0-Copter.apj
    version: "0.1.0"
    date: "2026-09-17"
    size: "1.6 MB"
    sha256: "dde356b64f3b0ca20badf501db7b7ef27cf22f44c79e9ef2756c0c00faf13262"
    notes: "ArduPilot Copter app for AF-H7E Lite. Copter and Plane share board_id 6207 - select by file name. Upload via the USB-C bootloader (Mission Planner) or the catalog Web Updater -> Firmware Update. Preliminary: build-verified only, not yet tested on AF-H7E Lite hardware."
    method: ardupilot
    webPath: /firmware/AF-H7E_Lite-v0.1.0-Copter.apj
  - kind: "ArduPilot Copter - Bootloader + App (merged HEX / DFU / SWD)"
    file: https://github.com/novaX-ALUX/fc/releases/download/AF-H7E_Lite-v0.1.0/AF-H7E_Lite-v0.1.0-Copter_with_bl.hex
    version: "0.1.0"
    date: "2026-09-17"
    size: "5.4 MB"
    sha256: "85bb10410a85d97075275cdd5d59677b2e5022f9ac3f34d611d700cd400a41ef"
    notes: "Copter bootloader + application combined image based at 0x08000000. Flash a running board via the catalog Web Updater -> DFU Recovery (Enter DFU, buttonless - same mechanism as AF-H7E); a blank or non-booting board is flashed via SWD/ST-Link on the DEBUG port. Copter and Plane share board_id 6207 - select by file name. Preliminary: not yet tested on AF-H7E Lite hardware."
    method: dfu
    webPath: /firmware/AF-H7E_Lite-v0.1.0-Copter_with_bl.hex
  - kind: "ArduPilot Plane (.apj package)"
    file: https://github.com/novaX-ALUX/fc/releases/download/AF-H7E_Lite-v0.1.0/AF-H7E_Lite-v0.1.0-Plane.apj
    version: "0.1.0"
    date: "2026-09-17"
    size: "1.6 MB"
    sha256: "eac8fc048b2bb5f8588a2d5e79fdaec38751035afb768160ff01717939493f9c"
    notes: "ArduPilot Plane app for AF-H7E Lite. Copter and Plane share board_id 6207 - select by file name. Upload via the USB-C bootloader (Mission Planner) or the catalog Web Updater -> Firmware Update. Preliminary: build-verified only, not yet tested on AF-H7E Lite hardware."
    method: ardupilot
    webPath: /firmware/AF-H7E_Lite-v0.1.0-Plane.apj
  - kind: "ArduPilot Plane - Bootloader + App (merged HEX / DFU / SWD)"
    file: https://github.com/novaX-ALUX/fc/releases/download/AF-H7E_Lite-v0.1.0/AF-H7E_Lite-v0.1.0-Plane_with_bl.hex
    version: "0.1.0"
    date: "2026-09-17"
    size: "5.4 MB"
    sha256: "f4c257c54d840a2f3a07d64825ed1cea0839f2ebf6be4dac6292021c3fcde5f1"
    notes: "Plane bootloader + application combined image based at 0x08000000. Flash a running board via the catalog Web Updater -> DFU Recovery (Enter DFU, buttonless - same mechanism as AF-H7E); a blank or non-booting board is flashed via SWD/ST-Link on the DEBUG port. Copter and Plane share board_id 6207 - select by file name. Preliminary: not yet tested on AF-H7E Lite hardware."
    method: dfu
    webPath: /firmware/AF-H7E_Lite-v0.1.0-Plane_with_bl.hex
firmwareNotes: 'Preliminary release for the AF-H7E Lite in development: build-verified on Windows, not yet bench- or flight-tested on Lite hardware. Update over USB-C like AF-H7E: open the catalog Web Updater, stay on Firmware Update, click Connect, pick the Copter or Plane .apj, then Update firmware. To reflash over USB DFU use DFU Recovery, click Enter DFU, then flash the matching _with_bl.hex; a blank board is recovered via SWD/ST-Link on the DEBUG port. Defaults: the SB header column is SBUS out (SERIAL8), RC IN auto-detects SBUS / PPM / DSM and supports DSM bind, and the battery monitor reads an I2C (INA2xx) power module on POWER 1 - set BATT_MONITOR 8 for a DroneCAN power module. All releases: https://github.com/novaX-ALUX/fc/releases'
---
