---
name: AE-6S 60A BC
tagline: 32-bit ESC for X-Blade 10/15 · 6S LiPo
image: /images/products/esc_32-6S-60A-BC.png
pictureKey: esc_32-6S-60A-BC
pinoutImage: /images/products/esc_32-6S-60A-BC_pinout.png
order: 25
specs:
  - { key: MCU, value: "AT32F415KBU7 (128 KB Flash)" }
  - { key: Mounting Hole, value: "45 × 52 mm / Φ 4 mm" }
  - { key: Weight, value: "18.5 g" }
  - { key: Voltage Range, value: "4 – 6S LiPo (16.8 – 25.2 V)" }
  - { key: Constant Current, value: "60 A" }
  - { key: Burst Current, value: "75 A" }
  - { key: BDShot, value: "Supported" }
  - { key: Current Sensor, value: "Supported" }
  - { key: BEC Output, value: "None" }
  - { key: Capacitor, value: "1000 µF / 63 V" }
  - { key: PWM Frequency, value: "24 / 48 / 96 kHz" }
  - { key: Supported Protocols, value: "DShot150 / 300 / 600, MultiShot, OneShot" }
  - { key: Firmware, value: "AM32, novaX ef 1.0" }
description: |
  AE-6S 60A BC is a 32-bit ESC rated for 6S LiPo and 60 A continuous current. The "BC" suffix stands for Battery Connector — this variant ships with a battery connector fitted for a solderless battery hookup. Supports DShot150 / 300 / 600, MultiShot and OneShot protocols with BDShot telemetry. Compatible with AM32 and novaX ef 1.0 firmware. Designed for X-Blade 10/15 class platforms.
firmware:
  - kind: "Bootloader (AT32F415 · SWD)"
    file: https://github.com/novaX-ALUX/esc-am32/releases/download/novaX_12S_F415-v2.29/novaX_12S_F415_2.29_Bootloader_PB4_32K_V16.hex
    version: "V16"
    date: "2026-07-30"
    size: "10.3 KB"
    sha256: "b0a1993a7df91152838780a71f2b38f2e9e9570fe668ea7079b44ccdede27915"
    notes: "AM32 bootloader V16, built for the 32K memory layout with PB4 as the signal pin — matching the boards as shipped. The \"32K\" is the layout the bootloader assumes, not its own size: the bootloader occupies 0x0000–0x0FFF (about 3.7 KB) and the application starts at 0x1000. This layout places the settings EEPROM at 0x7C00 and needs no 4-way address shift, so the configurator talks to it directly. Byte-identical to the verified 2.27 bootloader and never rebuilt. Flash on a blank or bricked board via SWD/ST-Link, then load the application over 4-way passthrough."
  - kind: "Application (AM32 · 4-way passthrough)"
    file: https://github.com/novaX-ALUX/esc-am32/releases/download/novaX_12S_F415-v2.29/novaX_12S_F415_2.29.hex
    version: "2.29"
    date: "2026-07-30"
    size: "56.4 KB"
    sha256: "2562669ef1f1df3927ce05b8808a74706e846c1ffcfafd14de0a4770c4bc2a91"
    notes: "AM32 application v2.29 (novaX_12S_F415) with the do-mi-sol startup chime, played on arming. The motor coasts when throttle is cut, and that is now a stored setting rather than a hard-coded one — ticking Complementary PWM in the configurator's Motor section enables deceleration braking and makes Running brake level and Brake strength effective, while leaving it clear lets the motor freewheel. Low-throttle startup follows the Startup power setting: at 24 kHz the startup duty is 9.0% and the slider spans 6.5–11.5%. Keep Running brake level at 10 — lowering it adds dead-time compensation to the startup duty and doubles it. Occupies flash pages 4–23 plus 30 only, so it never touches the bootloader or the settings EEPROM, and it reads the bootloader devinfo at boot so the same image works under a 32K / 64K / 128K bootloader. Flash over an existing bootloader via the AM32 configurator / 4-way passthrough."
  - kind: "Bootloader + App (merged HEX · SWD)"
    file: https://github.com/novaX-ALUX/esc-am32/releases/download/novaX_12S_F415-v2.29/novaX_12S_F415_2.29_BootApp_PB4_32K_V16.hex
    version: "2.29 / V16"
    date: "2026-07-30"
    size: "67.2 KB"
    sha256: "5eecca4ea7ba0249a0e3dccd10de4c8fae79afdb94fb8a57d3c98623cadfe487"
    notes: "V16 bootloader (32K layout) + application v2.29 + a factory settings EEPROM at 0x7C00, in one image for a single SWD/ST-Link flash on a blank or bricked board. The EEPROM carries Motor KV 1140 to match the actual motors, coasting enabled, Startup power 100, 24–48 kHz variable PWM and protocol AUTO — so flashing this also resets every setting to those defaults. Include the EEPROM block: a Mass Erase leaves that area at 0xFF and the firmware then reads input_type as 255, which selects no input protocol at all (main.c gates it on input_type < 10). SWD only: do not flash a BootApp image over 4-way passthrough, whose 16-bit addressing truncates the EEPROM address and writes it to the wrong place."
firmwareNotes: 'All firmware releases are published on GitHub: https://github.com/novaX-ALUX/esc-am32/releases'
---
