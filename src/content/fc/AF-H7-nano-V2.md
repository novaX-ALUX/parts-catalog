---
name: AF-H7 nano V2
ndaa: true
tagline: H7 Flight Controller · 2–8S LiPo · 10-pin ESC Port with Current and Telemetry · 5 V / 12 V 2 A
image: /images/products/fc_AF-H7-nano-V2.png
order: 21
comingSoon: true
manuals:
  - { label: "User Guide (booklet)", file: /manuals/fc_AF-H7-nano-V2_user_guide.pdf }
specs:
  - { key: MCU, value: "STM32H743VIH6, 480 MHz (1 MB RAM, 2 MB Flash)" }
  - { key: IMU, value: "2× ICM-42688-P" }
  - { key: Barometer, value: "DPS368" }
  - { key: Compass, value: "IST8310 (onboard)" }
  - { key: OSD, value: "AT7456E analog OSD — camera in, VTX out" }
  - { key: Operating Voltage, value: "2–8S LiPo (up to 33.6 V) · both regulators rated 60 V, 36 V TVS on the battery input" }
  - { key: Output Voltage, value: "5 V / 2 A · 12 V / 2 A (VTX, DJI O3) · 5 V port rail for GPS, receiver and CAN that also runs from USB alone" }
  - { key: ESC Port, value: "10-pin JST-SH: GND · GND · VBAT · VBAT · M1–M4 · CUR · TEL — straight 1:1 cable to the novaX AE-8S-60A 4-in-1 V2 ESC" }
  - { key: Current & Telemetry, value: "ESC current on the ESC port (PC1, 40 A per volt, same scale as the ESC) · ESC telemetry on SERIAL7 (UART7 RX)" }
  - { key: PWM Output, value: "10 motor/servo channels (M1–M4 on the ESC port and pads, S5–S10 on pads) + 1 WS2812 LED pad" }
  - { key: Motor Order, value: "Betaflight order out of the box — 1 rear right · 2 front right · 3 rear left · 4 front left; ArduPilot default FRAME_TYPE 12 (BetaFlightX), so the 1:1 ESC cable needs no remapping" }
  - { key: Power Select Pads, value: "Camera 5 V or VBAT · VTX 12 V or VBAT — 3-pad solder jumpers on the bottom (cut and bridge); VBAT only for devices rated for the pack" }
  - { key: Buzzer / Switch, value: "BZ+ pad (5 V or 12 V by solder jumper) and BZ− on a 30 V 5.8 A MOSFET — a buzzer, or on/off for another device (ArduPilot relay · Betaflight PINIO)" }
  - { key: Production Pads, value: "VBUS · D+ · D− · GND · BOOT0 · 3V3 test pads on a 2.54 mm row — flashing jigs program several boards over one USB hub, no button" }
  - { key: Serial Mapping, value: "SERIAL1 = USART1 · SERIAL2 = USART2 · SERIAL3 = USART3 · SERIAL4 = UART4 · SERIAL6 = USART6 · SERIAL7 = UART7 · SERIAL8 = UART8 (USB = SERIAL0)" }
  - { key: Ports, value: "GPS + compass · ELRS/RC · analog VTX · analog camera · DJI O3 · OpenIPC · CAN (JST-GH, Pixhawk order) · SWD pads" }
  - { key: CAN, value: "1 port · TI TCAN3413 3.3 V CAN FD transceiver — works on USB power" }
  - { key: USB Input, value: "USB-C (firmware & power) · 5.1 kΩ CC resistors, so C-to-C cables and chargers power it" }
  - { key: Blackbox, value: "microSD card" }
  - { key: Size, value: "38.5 × 38.5 mm" }
  - { key: Mount Hole, value: "30.5 × 30.5 mm / Ø4 mm" }
  - { key: Core Chips, value: "MCU ST · IMU TDK · barometer Infineon · regulators MPS (USA) · LDOs and CAN TI — non-Chinese makers; the analog OSD chip is the exception" }
  - { key: Validation Status, value: "Design stage — schematic and part placement done and checked (all nets pin for pin, 3 identical passes); routing and samples next. No firmware release yet." }
description: |
  AF-H7 nano V2 is the next revision of AF-H7 nano. It keeps the STM32H743 core, the two ICM-42688-P IMUs and the 30.5 mm mounting, and replaces the ESC wiring with one 10-pin connector: battery, four motor signals, ESC current and ESC telemetry on a straight 1:1 cable, the same pin numbers as the novaX AE-8S-60A 4-in-1 V2 ESC. Both regulators are now rated 60 V for 8S and give 2 A each (5 V and 12 V). The GPS, receiver and CAN ports also run from USB alone, so the aircraft can be set up on the bench without a battery, and the CAN port uses a 3.3 V CAN FD transceiver for the same reason. Every port follows the common pin order (Betaflight connector standard, Pixhawk CAN).
pinoutImages:
  - /images/products/fc_AF-H7-nano-V2_pinout.png
pinoutNotes: |
  Figure: top connectors, then the bottom solder pads seen from below (left and right swapped). Pin numbers are the connector's own pin 1, marked with a red 1.
  The 5 V on GPS, RC and CAN is the USB-or-battery rail; the camera 5 V is the battery 5 V regulator; 12 V and VBAT come only from the battery. The camera and VTX supplies can be moved to VBAT with their bottom solder jumpers. UART4 goes to both the DJI O3 and OpenIPC connectors — use one of them. Motor pads M1–M4 are the ESC port's M1–M4 (Betaflight order).
pinTable:
  - name: ESC
    type: JST-SH 1.0 mm 10P (JST SM10B-SRSS-TB)
    mapping: Straight 1:1 cable to the AE-8S-60A 4-in-1 V2 ESC · M1–M4 = PWM1–4 · CUR to PC1 (40 A per volt) · TEL to SERIAL7 (UART7 RX)
    pins:
      - { pin: 1, signal: GND, function: "Ground" }
      - { pin: 2, signal: GND, function: "Ground" }
      - { pin: 3, signal: VBAT, function: "Battery voltage from the ESC" }
      - { pin: 4, signal: VBAT, function: "Battery voltage from the ESC" }
      - { pin: 5, signal: M1, function: "Motor 1 (PWM1 · PB0)" }
      - { pin: 6, signal: M2, function: "Motor 2 (PWM2 · PB1)" }
      - { pin: 7, signal: M3, function: "Motor 3 (PWM3 · PA0)" }
      - { pin: 8, signal: M4, function: "Motor 4 (PWM4 · PA1)" }
      - { pin: 9, signal: CUR, function: "ESC current sense to PC1" }
      - { pin: 10, signal: TEL, function: "ESC telemetry to UART7 RX (SERIAL7_PROTOCOL 16)" }
  - name: GPS
    type: JST-SH 1.0 mm 6P
    mapping: SERIAL3 (USART3) + I2C1 — GPS with compass, novaX AP-M10 order
    pins:
      - { pin: 1, signal: SDA, function: "I2C1 data (compass)" }
      - { pin: 2, signal: SCL, function: "I2C1 clock (compass)" }
      - { pin: 3, signal: RX, function: "USART3 RX — from the GPS TX" }
      - { pin: 4, signal: TX, function: "USART3 TX — to the GPS RX" }
      - { pin: 5, signal: 5V, function: "5 V (on with USB alone)" }
      - { pin: 6, signal: GND, function: "Ground" }
  - name: RC
    type: JST-SH 1.0 mm 4P
    mapping: SERIAL6 (USART6) — ELRS / CRSF or SBUS receiver
    pins:
      - { pin: 1, signal: 5V, function: "5 V (on with USB alone)" }
      - { pin: 2, signal: GND, function: "Ground" }
      - { pin: 3, signal: RX, function: "USART6 RX — receiver TX / SBUS" }
      - { pin: 4, signal: TX, function: "USART6 TX — receiver RX" }
  - name: VTX
    type: JST-SH 1.0 mm 4P
    mapping: SERIAL1 TX (USART1) — 12 V analog VTX, OSD video out and VTX control
    pins:
      - { pin: 1, signal: 12V, function: "12 V by default, or VBAT with solder jumper JP2" }
      - { pin: 2, signal: GND, function: "Ground" }
      - { pin: 3, signal: VIDEO, function: "Video out (with OSD)" }
      - { pin: 4, signal: TX, function: "USART1 TX — SmartAudio / Tramp" }
  - name: CAMERA
    type: JST-SH 1.0 mm 3P
    mapping: Analog camera in — the OSD overlays it
    pins:
      - { pin: 1, signal: 5V, function: "5 V by default (battery 5 V regulator), or VBAT with solder jumper JP1" }
      - { pin: 2, signal: GND, function: "Ground" }
      - { pin: 3, signal: VIDEO, function: "Camera video in" }
  - name: DJI O3
    type: JST-SH 1.0 mm 6P
    mapping: SERIAL4 (UART4) MSP · SBUS = SERIAL2 RX (USART2) — 12 V digital VTX
    pins:
      - { pin: 1, signal: 12V, function: "12 V (battery only)" }
      - { pin: 2, signal: GND, function: "Ground" }
      - { pin: 3, signal: TX, function: "UART4 TX — to the air unit RX" }
      - { pin: 4, signal: RX, function: "UART4 RX — from the air unit TX" }
      - { pin: 5, signal: GND, function: "Ground" }
      - { pin: 6, signal: SBUS, function: "SBUS from the air unit — USART2 RX" }
  - name: OpenIPC
    type: JST-GH 1.25 mm 6P
    mapping: SERIAL4 (UART4) — battery voltage for the camera; UART4 is shared with DJI O3
    pins:
      - { pin: 1, signal: VBAT, function: "Battery voltage" }
      - { pin: 2, signal: VBAT, function: "Battery voltage" }
      - { pin: 3, signal: TX, function: "UART4 TX" }
      - { pin: 4, signal: RX, function: "UART4 RX" }
      - { pin: 5, signal: GND, function: "Ground" }
      - { pin: 6, signal: GND, function: "Ground" }
  - name: CAN
    type: JST-GH 1.25 mm 4P
    mapping: CAN1 (FDCAN1) — Pixhawk CAN order, TI TCAN3413
    pins:
      - { pin: 1, signal: 5V, function: "5 V (on with USB alone)" }
      - { pin: 2, signal: CAN_H, function: "CAN high" }
      - { pin: 3, signal: CAN_L, function: "CAN low" }
      - { pin: 4, signal: GND, function: "Ground" }
  - name: SWD
    type: 4 solder pads (top, beside USB-C)
    mapping: Debug and recovery — Betaflight SWD pad order
    pins:
      - { pin: 1, signal: 3V3, function: "MCU 3.3 V" }
      - { pin: 2, signal: GND, function: "Ground" }
      - { pin: 3, signal: SWDIO, function: "SWD data" }
      - { pin: 4, signal: SWCLK, function: "SWD clock" }
firmwareNotes: |
  No firmware release yet — V2 images will be listed here with the board. V2 keeps the AF-H7 nano serial mapping above, adds the ESC current (PC1) and telemetry (SERIAL7) inputs, and defaults to the Betaflight motor order (FRAME_TYPE 12).
gallery:
  - { src: /images/products/fc_AF-H7-nano-V2_iso.png, caption: "Isometric — 3D render, design stage" }
  - { src: /images/products/fc_AF-H7-nano-V2_front.png, caption: Front }
  - { src: /images/products/fc_AF-H7-nano-V2_back.png, caption: Back }
  - { src: /images/products/fc_AF-H7-nano-V2_left.png, caption: Left }
  - { src: /images/products/fc_AF-H7-nano-V2_right.png, caption: Right }
  - { src: /images/products/fc_AF-H7-nano-V2_top.png, caption: Top }
  - { src: /images/products/fc_AF-H7-nano-V2_bottom.png, caption: Bottom }
---
