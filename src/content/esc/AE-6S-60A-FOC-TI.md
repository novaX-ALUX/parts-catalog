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
  Firmware is flashed over SWD/JTAG (UniFlash / Code Composer Studio) — not over 4-way
  passthrough.
firmware:
  - kind: "Application (TI-TXT · SWD/JTAG)"
    file: /firmware/esc/ae-6s-60a-foc-ti/novaX_AE-6S-60A-FOC-TI_v1.0.46_App_SWD.txt
    version: "1.0.46"
    date: "2026-09-01"
    size: "314.7 KB"
    sha256: "0475dd3da154eaecf1ec6734ba4f35fb3ffc0235e929e572beaf15bad3f1421c"
    notes: "CRC-stamped application image (TI-TXT) for Bank1. Includes the 25 V high-duty stability package (est_freq_sf 1.5 + 2 A flux-weakening floor, bench-verified 95% staircase completion). Flash via UniFlash / CCS over SWD/JTAG together with the bootloader below in ONE flash operation — boards with the pre-2026-08-31 flash map must take both images together (Bank0/Bank1 map revision)."
  - kind: "Bootloader (TI-TXT · SWD/JTAG)"
    file: /firmware/esc/ae-6s-60a-foc-ti/novaX_AE-6S-60A-FOC-TI_v1.0.46_Bootloader_SWD.txt
    version: "1.0.46"
    date: "2026-09-01"
    size: "76.0 KB"
    sha256: "7f8bba3feb463ae03bedd4cde00ac3cba806189e84072488ac1c39b44e62cced"
    notes: "Bank0 resident bootloader (TI-TXT): DroneCAN OTA firmware update, app CRC validation, journal. Flash together with the application in one UniFlash / CCS session."
  - kind: "Bootloader (CCS .out · SWD/JTAG)"
    file: /firmware/esc/ae-6s-60a-foc-ti/novaX_AE-6S-60A-FOC-TI_v1.0.46_Bootloader_CCS.out
    version: "1.0.46"
    date: "2026-09-01"
    size: "270.2 KB"
    sha256: "61cd1eaa8a14c6cfb039d1547725539ba5f3be187138ee817bb5b053c2805337"
    notes: "Same bootloader as an ELF (.out) for Code Composer Studio users."
firmwareNotes: 'Firmware downloads are hosted on this site (the source repository is private); the internal release archive lives at novaX-ALUX/esc-f280049c.'
---
