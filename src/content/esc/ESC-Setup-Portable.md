---
name: ESC Setup Portable
tagline: Handheld DroneCAN ESC setup · AF-H7 nano + OLED + 4 buttons
order: 41
hidden: true
specs:
  - { key: MCU, value: "STM32H743 (AF-H7 nano)" }
  - { key: Interface, value: "DroneCAN (CAN 2.0 · 1 Mbit) · USB-C serial" }
firmware:
  - kind: "ESC Setup firmware (.bin · USB serial, no DFU driver)"
    file: /firmware/esc/esc-setup-portable/ESC-Setup-Portable_v0.0.20.bin
    version: "0.0.20"
    date: "2026-11-06"
    size: "65.2 KB"
    sha256: "ce260807781a63a81f4a6748d4cedc2ffe3c78b1a2162596aa99d0541270ecb4"
    notes: "The device stages it, checks CRC-32 and the vector table, then copies it over itself (about 3 s). Needs device 0.0.20 or later; older ones or a cut-off copy: BOOT-button DFU. Source: esc/ESC-Setup-Portable commit 3d1dace."
    method: esc-setup-self
    webPath: /firmware/esc/esc-setup-portable/ESC-Setup-Portable_v0.0.20.bin
---
