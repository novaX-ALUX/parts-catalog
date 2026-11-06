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
    file: /firmware/esc/esc-setup-portable/ESC-Setup-Portable_v0.0.22.bin
    version: "0.0.22"
    date: "2026-11-06"
    size: "68.6 KB"
    sha256: "0fb8f6a8b4155334d387e8e458aaee679efe094913a15deec3ffab6ca9dd3570"
    notes: "The device stages it, checks CRC-32 and the vector table, then copies it over itself (about 3 s). Needs device 0.0.20 or later; older ones or a cut-off copy: BOOT-button DFU. Adds auto_cal on its own screen (stop with any button) and checks a write again when the ESC answers late (prop_align). Source: esc/ESC-Setup-Portable commit 5461892."
    method: esc-setup-self
    webPath: /firmware/esc/esc-setup-portable/ESC-Setup-Portable_v0.0.22.bin
---
