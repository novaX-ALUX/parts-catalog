---
name: AF-H7E Lite
tagline: Compact Pixhawk FMUv6x Flight Controller
image: /images/products/fc_AF-H7E-Lite.png
order: 41
manuals:
  - { label: "한국어", file: /manuals/fc_AF-H7E-Lite_manual_ko.pdf }
  - { label: English, file: /manuals/fc_AF-H7E-Lite_manual_en.pdf }
comingSoon: true
specs: []
pinoutImage: /images/products/fc_AF-H7E-Lite_pinout.png
pinoutNotes: |
  Preliminary pin definition — AF-H7E Lite is in development and connectors may change before release. On every JST connector pin 1 is the supply pin and the last pin is GND, following the Pixhawk connector standard. UART n maps to ArduPilot SERIALn: UART 1–2 default to MAVLink telemetry and UART 3–4 default to GPS. GPS modules connect to any UART or over DroneCAN; there is no dedicated GPS/safety port and no safety switch. RC IN takes an SBUS, PPM or DSM receiver directly on pin 2 (protocol auto-detected, wired to the flight-controller MCU, no IO board needed); the connector supplies 5 V, so a 3.3 V-only DSM satellite receiver needs a 3.3 V adapter. On-board without a connector: microSD card slot (logging), buzzer and RGB status LED.

  The + rail of the PWM header is not powered by the flight controller. The 13th header column, SB, is an SBUS output, not a PWM channel: it carries servo channels 1–16 on one wire from USART6 (SERIAL8) with the signal inversion done inside the STM32H7, so SBUS servos, SBUS-to-PWM decoders and gimbals plug in with a standard servo lead and take power from the servo rail. DShot is available on M1–M6; M7–M8 run on a timer without DMA (PWM and OneShot only), and the MCU pins for M9–M12 are still to be confirmed.

  As on AF-H7E, the PWM signal row (S) is the rearmost row: the case has a keyed comb behind it so servo plugs only fit with S at the rear, and a wall separates POWER 1 · POWER 2 · RC IN from the PWM header. The pinout image is a top view of the concept carrier: side connectors are mounted on the bottom side and plug in from the edges, and each table lists pins in the order they sit when seen from above. POWER 1 and POWER 2 use the same Molex Micro-Lock Plus connector as AF-H7E; their pin-1 end is still to be confirmed.
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
    type: JST-GH 4P
    mapping: RC input · SBUS / PPM / DSM (auto-detected)
    pins:
      - { pin: 1, signal: VCC, function: "5 V receiver supply" }
      - { pin: 2, signal: RC_IN, function: "SBUS / PPM / DSM receiver input (protocol auto-detected)" }
      - { pin: 3, signal: RSSI, function: "RSSI input (analog or PWM)" }
      - { pin: 4, signal: GND, function: "Ground" }
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
      - { pin: S, signal: M1 … M12, function: "Motor / servo output signal, one per channel (PWM · OneShot; DShot on M1–M6)" }
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
---
