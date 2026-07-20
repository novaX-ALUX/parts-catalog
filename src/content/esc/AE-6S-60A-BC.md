---
name: AE-6S 60A BC
tagline: 32-bit ESC for X-Blade 10/15 · 6S LiPo
image: /images/products/esc_32-6S-60A-BC.png
pictureKey: esc_32-6S-60A-BC
pinoutImage: /images/products/esc_32-6S-60A-BC_pinout.png
order: 25
specs:
  - { key: Mounting Hole, value: "45 × 52 mm / Φ 4 mm" }
  - { key: Weight, value: "18.5 g" }
  - { key: Voltage Range, value: "4 – 6S LiPo (16.8 – 25.2 V)" }
  - { key: Constant Current, value: "60 A" }
  - { key: Burst Current, value: "75 A" }
  - { key: BDShot, value: "Supported" }
  - { key: Current Sensor, value: "Supported" }
  - { key: BEC Output, value: "None" }
  - { key: Capacitor, value: "1000 µF / 63 V" }
  - { key: PWM Frequency, value: "24 – 48 kHz (Bluejay 96 kHz)" }
  - { key: Supported Protocols, value: "DShot150 / 300 / 600, MultiShot, OneShot" }
  - { key: Firmware, value: "AM32, novaX ef 1.0" }
description: |
  AE-6S 60A BC is a 32-bit ESC rated for 6S LiPo and 60 A continuous current. The "BC" suffix stands for Battery Connector — this variant ships with a battery connector fitted for a solderless battery hookup. Supports DShot150 / 300 / 600, MultiShot and OneShot protocols with BDShot telemetry. Compatible with AM32 and novaX ef 1.0 firmware. Designed for X-Blade 10/15 class platforms.
firmware:
  - kind: "Bootloader (AT32F415 · SWD)"
    file: https://github.com/novaX-ALUX/esc-am32/releases/download/TBS_12S_F415-v2.20/AM32_F415_BOOTLOADER_PB4_128K_V17.hex
    version: "V17"
    notes: "AM32 bootloader for the AT32F415 (PB4, 128K). Flash on a blank board via SWD/ST-Link, then load the application over 4-way passthrough."
  - kind: "Application (AM32 · 4-way passthrough)"
    file: https://github.com/novaX-ALUX/esc-am32/releases/download/TBS_12S_F415-v2.20/AM32_TBS_12S_F415_2.20.hex
    version: "2.20"
    notes: "AM32 application v2.20 (TBS_12S_F415). Flash over an existing bootloader via the AM32 configurator / 4-way passthrough."
  - kind: "Bootloader + App (merged HEX · SWD)"
    file: https://github.com/novaX-ALUX/esc-am32/releases/download/TBS_12S_F415-v2.20/AM32_TBS_12S_F415_2.20_BootApp_V17.hex
    version: "2.20 / V17"
    notes: "Combined bootloader + application image for a single SWD/ST-Link flash on a blank or bricked board."
firmwareNotes: 'All firmware releases are published on GitHub: https://github.com/novaX-ALUX/esc-am32/releases'
---
