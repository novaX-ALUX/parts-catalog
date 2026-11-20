---
name: ELRS 2.4G Diversity Receiver
tagline: ExpressLRS 2.4 GHz · True Diversity (2× SX1280) · PA/LNA on Both Antennas · ESP32-S3 Wi-Fi
image: /images/products/rc_ELRS-Diversity-RX.png
gallery:
  - { src: /images/products/rc_ELRS-Diversity-RX_iso.png, caption: Isometric }
  - { src: /images/products/rc_ELRS-Diversity-RX_front.png, caption: Front }
  - { src: /images/products/rc_ELRS-Diversity-RX_back.png, caption: Back }
  - { src: /images/products/rc_ELRS-Diversity-RX_left.png, caption: Left }
  - { src: /images/products/rc_ELRS-Diversity-RX_right.png, caption: Right }
  - { src: /images/products/rc_ELRS-Diversity-RX_top.png, caption: Top }
  - { src: /images/products/rc_ELRS-Diversity-RX_bottom.png, caption: Bottom }
order: 2
comingSoon: true
specs:
  - { key: MCU, value: "ESP32-S3FN8, dual-core 240 MHz, 8 MB flash in package" }
  - { key: RF Chips, value: "2× Semtech SX1280 — one complete receiver per antenna" }
  - { key: RF Front End, value: "2× AT2401C 2.4 GHz PA/LNA" }
  - { key: Frequency, value: "2.400–2.480 GHz ISM" }
  - { key: Firmware, value: "ExpressLRS (ESP32-S3 2.4 GHz receiver target)" }
  - { key: Output Protocol, value: "CRSF over UART" }
  - { key: Antenna Connectors, value: "2× IPEX (U.FL compatible)" }
  - { key: Wi-Fi, value: "ESP32-S3 Wi-Fi with on-board chip antenna, for firmware updates and settings" }
  - { key: Power Input, value: "5 V pad, on-board 3.3 V buck regulator" }
  - { key: Pads, value: "5V · RX · TX · GND" }
  - { key: Status, value: "RGB status LED · bind button" }
  - { key: Size, value: "16.7 × 23.7 mm board (preliminary layout)" }
  - { key: Weight, value: "To be confirmed" }
  - { key: Validation Status, value: "Preliminary layout (2026-11-20), routing in progress. Specifications are preliminary and may change. Pictures are renders of the preliminary layout." }
features:
  - { title: "True diversity — two complete receivers", text: "Each antenna feeds its own SX1280 radio. When the frame, a battery or your body shadows one antenna, the other keeps the link.", image: /images/products/rc_ELRS-Diversity-RX_iso.png }
  - { title: "A PA/LNA on every antenna", text: "An AT2401C front end amplifies the weak incoming signal before each radio and boosts telemetry on the way back.", image: /images/products/rc_ELRS-Diversity-RX_top.png }
  - { title: "ESP32-S3 with Wi-Fi updates", text: "Update ExpressLRS and change settings over Wi-Fi from a phone or laptop, or through the flight controller.", image: /images/products/rc_ELRS-Diversity-RX.png }
  - { title: "Antennas at one end, pads at the other", text: "Both antenna connectors sit on one short edge and the 5V, RX, TX and GND pads on the other, so the slim board slips into heat-shrink. CRSF to any flight controller UART.", image: /images/products/rc_ELRS-Diversity-RX_bottom.png }
description: |
  A 2.4 GHz ExpressLRS receiver with true diversity: two SX1280 radios, each with its own AT2401C PA/LNA and IPEX antenna connector, run by an ESP32-S3 that also gives Wi-Fi updates. It connects to the flight controller over CRSF with four solder pads and is made to pair with the AT-14 radio.
firmwareNotes: 'Firmware downloads will be posted here when the receiver is released.'
---
