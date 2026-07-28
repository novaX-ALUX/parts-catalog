---
name: AE-8S 60A
tagline: 32-bit ESC for X-Blade 10/15 · 8S LiPo
image: /images/products/esc_32-8S-60A.png
pictureKey: esc_32-8S-60A
order: 30
specs:
  - key: MCU
    value: AT32F415KBU7 (128 KB Flash)
  - key: Mounting Hole
    value: 56 × 57 mm / Φ 4 mm
  - key: Weight
    value: 28 g
  - key: Voltage Range
    value: 4 – 8S LiPo (16.8 – 33.6 V)
  - key: Constant Current
    value: 60 A
  - key: Burst Current
    value: 70 A
  - key: BDShot
    value: Supported
  - key: Current Sensor
    value: Supported
  - key: BEC Output
    value: None
  - key: Capacitor
    value: 1000 µF / 63 V
  - key: PWM Frequency
    value: 24 / 48 / 96 kHz
  - key: Supported Protocols
    value: DShot150 / 300 / 600, MultiShot, OneShot
  - key: Firmware
    value: AM32, novaX ef 1.0
description: AE-8S 60A is a high-voltage 32-bit ESC rated for 8S LiPo at 60 A continuous. Shares the DShot / AM32 firmware stack with the 6S variant and adds an enlarged 56 × 57 mm footprint for sustained high-current heat dissipation.
pinoutNotes: ''
configNotes: ''
firmware:
  - kind: "Bootloader (AT32F415 · SWD)"
    file: https://github.com/novaX-ALUX/esc-am32/releases/download/TBS_12S_F415-v2.27/novaX_TBS_12S_F415_2.27_Bootloader_PB4_32K_V16.hex
    version: "V16"
    date: "2026-07-28"
    size: "10.3 KB"
    sha256: "b0a1993a7df91152838780a71f2b38f2e9e9570fe668ea7079b44ccdede27915"
    notes: "AM32 bootloader V16, built for the 32K memory layout with PB4 as the signal pin — matching the boards as shipped. The \"32K\" is the layout the bootloader assumes, not its own size: the bootloader occupies 0x0000–0x0FFF (about 3.7 KB) and the application starts at 0x1000. This layout places the settings EEPROM at 0x7C00 and needs no 4-way address shift, so the configurator talks to it directly. Verified on hardware 2026-07-28. Flash on a blank or bricked board via SWD/ST-Link, then load the application over 4-way passthrough."
  - kind: "Application (AM32 · 4-way passthrough)"
    file: https://github.com/novaX-ALUX/esc-am32/releases/download/TBS_12S_F415-v2.27/novaX_TBS_12S_F415_2.27.hex
    version: "2.27"
    date: "2026-07-28"
    size: "56.5 KB"
    sha256: "8369bcfacb127c7e415ff970ccbbd9c3536bd1e7014679911d3796ad44239f40"
    notes: "AM32 application v2.27 (TBS_12S_F415) with the do-mi-sol startup chime, played on arming. Parameter handling matches stock AM32, so settings are preserved across updates. Occupies flash pages 4–24 plus 61 only — it never touches the bootloader or the settings EEPROM, and it reads the bootloader devinfo at boot so the same image works under a 32K / 64K / 128K bootloader. Flash over an existing bootloader via the AM32 configurator / 4-way passthrough."
  - kind: "Bootloader + App (merged HEX · SWD)"
    file: https://github.com/novaX-ALUX/esc-am32/releases/download/TBS_12S_F415-v2.27/novaX_TBS_12S_F415_2.27_BootApp_PB4_32K_V16.hex
    version: "2.27 / V16"
    date: "2026-07-28"
    size: "67.2 KB"
    sha256: "b79cfe4c9944bea776239a04977caa17ebd298db6e6fa96aac9d70ea8cf428d8"
    notes: "V16 bootloader (32K layout) + application v2.27 + a factory settings EEPROM at 0x7C00, in one image for a single SWD/ST-Link flash on a blank or bricked board. Verified on hardware 2026-07-28: the ESC comes up, plays the startup chime and is recognised by the configurator. Include the EEPROM block — a Mass Erase leaves that area at 0xFF and the firmware then reads input_type as 255, which selects no input protocol at all (main.c gates it on input_type < 10). SWD only: do not flash a BootApp image over 4-way passthrough."
firmwareNotes: 'All firmware releases are published on GitHub: https://github.com/novaX-ALUX/esc-am32/releases'
---
