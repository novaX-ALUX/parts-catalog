---
name: AF-F7 nano
tagline: F722 Flight Controller · 3–8S LiPo · BMI270 · 16 MB Blackbox · 6 UARTs · 10 V 2 A + 5 V 3 A
image: /images/products/fc_AF-F7-nano.png
order: 31
comingSoon: true
specs:
  - { key: MCU, value: "STM32F722RET6, 216 MHz (256 KB RAM, 512 KB Flash)" }
  - { key: IMU, value: "BMI270 (Bosch)" }
  - { key: Barometer, value: "BMP390 (Bosch)" }
  - { key: OSD, value: "AT7456E analog OSD — camera in, VTX out" }
  - { key: Blackbox, value: "16 MB flash" }
  - { key: UARTs, value: "6" }
  - { key: Operating Voltage, value: "3–8S LiPo (8S HV up to 34.8 V) · 65 V regulators and a 36 V TVS on the battery input" }
  - { key: Output Voltage, value: "10 V / 2 A for the VTX ports · 5 V / 3 A for the camera, receiver, GPS and buzzer — the 10 V output follows the battery when the pack drops below 10 V · receiver and GPS 5 V also run from USB alone" }
  - { key: PWM Output, value: "6 motor outputs (M1–M4 on the ESC port and pads, M5–M6 on pads) + 1 LED strip pad" }
  - { key: Ports, value: "ESC 8-pin · analog VTX · HD VTX (DJI) · receiver · GPS · camera — JST-SH 1.0 mm, plus a solder pad beside every port" }
  - { key: Firmware, value: "Betaflight and INAV" }
  - { key: USB Input, value: "USB-C" }
  - { key: Size, value: "37 × 37 mm" }
  - { key: Mount Hole, value: "30.5 × 30.5 mm / Ø4 mm (holes open to the corners)" }
  - { key: Weight, value: "8 g (design target)" }
  - { key: Validation Status, value: "Design stage — schematic and component placement checked (2026-11-24). Routing and samples come next; the Betaflight build for this board is in the Firmware tab." }
description: |
  AF-F7 nano is a 30.5 × 30.5 mm F722 flight controller for 3–8S builds. It carries a BMI270 IMU, a BMP390 barometer, an analog OSD and 16 MB of blackbox flash, and gives six UARTs for the receiver, GPS, analog and HD video transmitters and ESC telemetry. Two regulators supply 10 V at 2 A for the video transmitter and 5 V at 3 A for the camera, receiver and GPS. Every port is a JST-SH plug with a solder pad beside it, and the A of the ALUX logo on the top points to the front of the board.
pinoutImages:
  - /images/products/fc_AF-F7-nano_pinout.png
pinoutNotes: |
  The A of the ALUX logo on the top points forward — toward the ESC port edge. Pin 1 is the first signal listed for each port; the connector pin order is the same as the Ewing F7, and the Ewing F7 Betaflight target (RRIOT_F722) runs on this board.
  The solder pads around the edge carry the same names and order as the Ewing F7 pads, printed on the bottom: E1–E6 motors, AC current, GD / G ground, VIN battery, BEEP buzzer −. The JMP pad beside the analog VTX pads is a spare VTX power pad, set by the 3-pad solder jumper on the bottom as on the Ewing F7: bridge 1–2 for 10 V, 2–3 for battery voltage, or leave it open for no power. Bridge only one pair — never all three pads: that puts the battery voltage on the 10 V rail and damages the 10 V output and the video transmitters on it.
  The battery voltage divider matches the Ewing F7, so the Ewing setting vbat_scale 101 reads the pack voltage correctly (up to 33 V; this board's own firmware sets 101 by default).
  The receiver and GPS 5 V comes from the 5 V regulator or from USB through an OR diode, so they work on USB alone; the camera 5 V and both 10 V pins come only from the battery.
pinTable:
  - name: ESC
    type: JST-SH 1.0 mm 8P
    mapping: M1–M4 motor outputs · ESC telemetry to UART5 RX · ESC current sense to the ADC
    pins:
      - { pin: 1, signal: M1, function: "Motor 1" }
      - { pin: 2, signal: M2, function: "Motor 2" }
      - { pin: 3, signal: M3, function: "Motor 3" }
      - { pin: 4, signal: M4, function: "Motor 4" }
      - { pin: 5, signal: R5, function: "ESC telemetry — UART5 RX" }
      - { pin: 6, signal: CUR, function: "ESC current sense" }
      - { pin: 7, signal: GND, function: "Ground" }
      - { pin: 8, signal: VBAT, function: "Battery input (3–8S)" }
  - name: HD VTX
    type: JST-SH 1.0 mm 6P
    mapping: UART4 (MSP / DisplayPort) · SBUS from the air unit on UART6 RX
    pins:
      - { pin: 1, signal: 10V, function: "10 V" }
      - { pin: 2, signal: GND, function: "Ground" }
      - { pin: 3, signal: T4, function: "UART4 TX — to the air unit RX" }
      - { pin: 4, signal: R4, function: "UART4 RX — from the air unit TX" }
      - { pin: 5, signal: GND, function: "Ground" }
      - { pin: 6, signal: R6, function: "UART6 RX — SBUS from the air unit" }
  - name: Analog VTX
    type: JST-SH 1.0 mm 5P
    mapping: OSD video out · UART2 for SmartAudio / Tramp
    pins:
      - { pin: 1, signal: 10V, function: "10 V" }
      - { pin: 2, signal: GND, function: "Ground" }
      - { pin: 3, signal: VO, function: "Video out (with OSD)" }
      - { pin: 4, signal: R2, function: "UART2 RX" }
      - { pin: 5, signal: T2, function: "UART2 TX — VTX control" }
  - name: Receiver
    type: JST-SH 1.0 mm 4P
    mapping: UART1 — ELRS / CRSF receiver
    pins:
      - { pin: 1, signal: T1, function: "UART1 TX — to the receiver RX" }
      - { pin: 2, signal: R1, function: "UART1 RX — from the receiver TX" }
      - { pin: 3, signal: GND, function: "Ground" }
      - { pin: 4, signal: 5V, function: "5 V (also on USB alone)" }
  - name: GPS
    type: JST-SH 1.0 mm 6P
    mapping: UART3 + I2C1 — GPS with compass
    pins:
      - { pin: 1, signal: SCL, function: "I2C1 clock (compass)" }
      - { pin: 2, signal: SDA, function: "I2C1 data (compass)" }
      - { pin: 3, signal: T3, function: "UART3 TX — to the GPS RX" }
      - { pin: 4, signal: R3, function: "UART3 RX — from the GPS TX" }
      - { pin: 5, signal: GND, function: "Ground" }
      - { pin: 6, signal: 5V, function: "5 V (also on USB alone)" }
  - name: Camera
    type: JST-SH 1.0 mm 5P
    mapping: Analog camera in — the OSD overlays it · camera control
    pins:
      - { pin: 1, signal: 5V, function: "5 V (battery only)" }
      - { pin: 2, signal: GND, function: "Ground" }
      - { pin: 3, signal: VI, function: "Camera video in" }
      - { pin: 4, signal: CC, function: "Camera control" }
      - { pin: 5, signal: GND, function: "Ground" }
  - name: Extra pads
    type: Solder pads (names printed on the bottom, same as the Ewing F7 pads)
    mapping: Right edge AC · E5 · E6 · BEEP, inner 5V · GND, and an LED pad above the camera pads
    pins:
      - { pin: AC, signal: AC, function: "ESC current sense (same signal as ESC pin 6)" }
      - { pin: E5, signal: E5, function: "Motor 5" }
      - { pin: E6, signal: E6, function: "Motor 6" }
      - { pin: BEEP, signal: BEEP, function: "Buzzer − (switched to ground)" }
      - { pin: 5V, signal: 5V, function: "5 V for the buzzer +" }
      - { pin: GND, signal: GND, function: "Ground" }
      - { pin: LED, signal: LED, function: "WS2812 LED strip (INAV)" }
firmware:
  - kind: "Betaflight (.hex for Betaflight Configurator)"
    file: /firmware/fc/af-f7-nano/AF-F7_nano-v0.1.0-Betaflight.hex
    version: "0.1.0"
    date: "2026-11-25"
    size: "1.1 MB"
    sha256: "baddeb7674b1da040e969c7e431735b42ebd17f1eb4c71b1f26f71f50f03c93c"
    notes: "Betaflight 2026.6.0-alpha (source 3c879a0) with the AF-F7_nano target config (BOARD_NAME AF-F7_nano · manufacturer NOVX). Full image from 0x08000000 - flash it with Betaflight Configurator → Firmware Flasher → Load Firmware [Local]."
firmwareNotes: |
  Betaflight for AF-F7 nano, built on Windows from the pinned Betaflight source with this board's target config: pins as the Betaflight RRIOT_F722 (Ewing F7) target, BMI270 gyro, BMP390 barometer, AT7456E OSD, blackbox on the 16 MB flash, LED strip on the LED pad, vbat_scale 101. To flash, hold the BOOT button on the top while plugging in USB (DFU), then load the .hex in Betaflight Configurator → Firmware Flasher → Load Firmware [Local]. The board is not built yet, so this image has not run on hardware. INAV images will be listed here later.
gallery:
  - { src: /images/products/fc_AF-F7-nano_iso.png, caption: "Isometric — 3D render, design stage (before routing)" }
  - { src: /images/products/fc_AF-F7-nano_front.png, caption: Front }
  - { src: /images/products/fc_AF-F7-nano_back.png, caption: Back }
  - { src: /images/products/fc_AF-F7-nano_left.png, caption: Left }
  - { src: /images/products/fc_AF-F7-nano_right.png, caption: Right }
  - { src: /images/products/fc_AF-F7-nano_top.png, caption: "Top — the A of the ALUX logo points forward" }
  - { src: /images/products/fc_AF-F7-nano_bottom.png, caption: Bottom }
---
