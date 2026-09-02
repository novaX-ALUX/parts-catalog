---
name: AE-6S 60A FOC TI
tagline: TI C2000 Sensorless-FOC ESC · 6S LiPo
order: 27
specs:
  - { key: MCU, value: "TI TMS320F280049C (C2000 · 100 MHz · FPU/TMU)" }
  - { key: Control, value: "Sensorless FOC (InstaSPIN-FAST)" }
  - { key: Voltage Range, value: "6S LiPo (max 25.2 V)" }
  - { key: Constant Current, value: "60 A" }
  - { key: Power Stage, value: "JSM6288T half-bridge modules" }
  - { key: Interface, value: "DroneCAN (CAN 2.0 · 1 Mbit)" }
  - { key: Position Sensor, value: "MT6701 magnetic encoder (prop parking)" }
  - { key: Telemetry, value: "DroneCAN ESC status + flight recorder (on-board flash)" }
  - { key: Protection, value: "CMPSS hardware overcurrent, trip-zone safe-off, stall supervision" }
  - { key: Firmware, value: "novaX FOC (TI) v1.0.46" }
description: |
  AE-6S 60A FOC TI is a field-oriented-control ESC built on the TI C2000 real-time MCU
  (TMS320F280049C). It runs sensorless FOC (InstaSPIN-FAST) with a 20 kHz current loop,
  speaks DroneCAN for throttle and telemetry, and uses an MT6701 magnetic encoder for
  precision prop parking. Hardware overcurrent protection is handled by the on-chip CMPSS
  comparators driving the ePWM trip-zone. Firmware v1.0.46 carries the 25 V high-duty
  stability package verified on the bench (95% staircase completion at 6S full charge).
  Two firmware files cover every case: the BootApp .hex (bootloader + application, both
  flash banks in one file) is flashed once over SWD/JTAG with UniFlash; after that the
  application-only .bin is updated in the field over DroneCAN by the resident bootloader —
  no 4-way passthrough is involved.
firmware:
  - kind: "BootApp (Intel HEX · SWD/JTAG)"
    file: /firmware/esc/ae-6s-60a-foc-ti/novaX_AE-6S-60A-FOC-TI_v1.0.46_BootApp_JTAG.hex
    version: "1.0.46"
    date: "2026-09-02"
    size: "357.4 KB"
    sha256: "a755fb01d79a79bd7fa9788cc48ec85a144ee181adac1c071e54fc7b273e66d7"
    notes: "Bootloader (Bank0) + CRC-stamped application (Bank1) merged into ONE Intel HEX in the C28x word-addressed form that UniFlash / DSLite programs directly. Flash over SWD/JTAG (XDS110) as a single file — both banks in one program cycle, so a board can never sit half-flashed; disconnect the probe before power-cycling. Ship build of v1.0.46 (25 V high-duty stability package: est_freq_sf 1.5 + 2 A flux-weakening floor, bench-verified 95% staircase completion). Do not flash TI-TXT (.txt) images with UniFlash — the loader reads their byte addresses as word addresses and silently drops them."
  - kind: "Application (flat .bin · DroneCAN OTA)"
    file: /firmware/esc/ae-6s-60a-foc-ti/novaX_AE-6S-60A-FOC-TI_v1.0.46_App_CAN.bin
    version: "1.0.46"
    date: "2026-09-02"
    size: "102.8 KB"
    sha256: "1846884e9c32fbbc41b5e94186ed2514d7e17a2c37cd013dcde5ddaad9b96257"
    notes: "Application-only flat binary for the DroneCAN OTA path: the resident bootloader receives it over CAN, CRC-validates it and reflashes Bank1 — no JTAG needed. Requires a board that already runs a working bootloader + application pair (a blank board takes the BootApp .hex above once)."
firmwareNotes: 'Firmware downloads are hosted on this site (the source repository is private); the internal release archive lives at novaX-ALUX/esc-f280049c.'
---
