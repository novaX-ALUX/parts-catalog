---
name: APMU-12S 120A
tagline: 12S Power Management Unit — 120 A Switched ESC Bus with Precharge, 7.4 V · 12 V · 24 V · FC 5 V Rails
image: /images/products/pmu_APMU-12S-120A.png
model3d: /models/pmu/APMU-12S-120A.glb
order: 11
comingSoon: true
specs:
  - { key: Battery Input, value: "12S LiPo / LiHV (36–52.2 V) · two 6 AWG pigtail pads (BAT+ / BAT−) for the battery connector" }
  - { key: Continuous Current, value: "120 A design target (25 °C, still air, 3 oz copper, finned aluminium heat-sink case) — to be confirmed by thermal test" }
  - { key: Main Switch, value: "10 × Infineon IAUT300N10S5N015 (100 V) driven by ADI LTC7001 — switched by the button circuit, no firmware" }
  - { key: Precharge, value: "ESC capacitors are charged through 10 Ω to 70 % of the battery voltage before the main switch closes; a short or overload stops it — up to 7.5 mF total ESC capacitance" }
  - { key: ESC Outputs, value: "5× XT90 female (Amass XT90PW-F) — switched battery voltage, 30 A each (UL1977), 60 A for 1 min" }
  - { key: Servo Output, value: "7.4 V · 20 A · XT60 female (TI LM5146) — on with the main switch" }
  - { key: Payload Outputs, value: "12 V · 10 A and 24 V · 10 A · XT30 female (TI LM5146) — on with the main switch; 24 V needs a battery above 36 V" }
  - { key: FC Power Port, value: "5 V · 4.5 A, always on with the battery (TI LM5146) · Molex Micro-Lock Plus 6P, AF-H7E POWER pin order" }
  - { key: Digital Monitor, value: "TI INA228 20-bit on the FC port I2C, address 0x40 · 0.1 mΩ Vishay WSLP5931 shunt — ArduPilot BATT_MONITOR 21" }
  - { key: Button & LEDs, value: "JST-GH 7P button / 4-LED cable: tap, then press and hold ~2 s to switch on or off · AUTO-ON plug (pins 1–2 looped) switches on with the battery" }
  - { key: PCB, value: "120 × 140 mm · 4 layers · 1.6 mm · 3 oz outer / 2 oz inner · parts on the top only (bottom = heat-sink face) · 4× M3" }
  - { key: Validation Status, value: "Design stage — schematic verified, PCB in layout; not yet built or tested" }
description: |
  APMU-12S 120A is the power management unit for a 12S VTOL: the battery enters on two 6 AWG pigtails, passes a 0.1 mΩ current shunt and a main switch of ten 100 V MOSFETs, and leaves on five board-mounted XT90 connectors for the lift and cruise ESCs. The switch has no microcontroller and no firmware — a small circuit of logic chips turns it on and off from the button: tap, then press and hold for about two seconds while the four LEDs fill (on) or empty (off). A single long press, a stuck button or a pulled button cable change nothing. Before the switch closes, the ESC capacitors are charged through a 10 Ω path to 70 % of the battery voltage, so connecting a battery or switching on never sparks, and a shorted or overloaded output stops the precharge instead of closing the switch. Four TI LM5146 converters supply the servos (7.4 V, 20 A), payloads (12 V and 24 V, 10 A each) and the flight controller (5 V, 4.5 A); the servo and payload rails follow the main switch, the flight-controller rail is always on while the battery is connected. The flight controller reads battery voltage and current directly from a TI INA228 on its power-port I2C. Coming soon: 120 A continuous is the design target with the finned aluminium heat-sink case and is not yet measured. Images are renders of the CAD design, not photos of a built board.
pinoutImages:
  - /images/products/pmu_APMU-12S-120A_pinout.png
pinoutNotes: |
  Top view with the ESC outputs along the top edge. On every XT connector the flat side of the housing is positive, as marked on the board (+ / −). The AUTO-ON plug is a JST-GH 7P housing with pins 1 and 2 looped: with it in place the unit switches on when the battery is connected, and pulling it out later changes nothing. Holding the button while connecting the battery also switches the unit on.
pinTable:
  - name: BATTERY IN
    type: 6 AWG pigtail pads (J101 · J102)
    mapping: Battery input — through the 0.1 mΩ shunt to the main switch and the converters
    pins:
      - { pin: "BAT+", signal: VBAT, function: "Battery positive" }
      - { pin: "BAT−", signal: GND, function: "Battery negative" }
  - name: ESC OUT ×5
    type: XT90 female (J103 · J104 · J105 · J106 · J107)
    mapping: Switched battery voltage after the main switch — 30 A per connector
    pins:
      - { pin: "+", signal: OUT, function: "Switched battery voltage" }
      - { pin: "−", signal: GND, function: "Ground" }
  - name: SERVO 7.4V
    type: XT60 female (J501)
    mapping: 7.4 V · 20 A, on with the main switch
    pins:
      - { pin: "+", signal: 7V4, function: "Servo supply" }
      - { pin: "−", signal: GND, function: "Ground" }
  - name: 12V
    type: XT30 female (J601)
    mapping: 12 V · 10 A, on with the main switch
    pins:
      - { pin: "+", signal: 12V, function: "Payload supply" }
      - { pin: "−", signal: GND, function: "Ground" }
  - name: 24V
    type: XT30 female (J701)
    mapping: 24 V · 10 A, on with the main switch (battery above 36 V)
    pins:
      - { pin: "+", signal: 24V, function: "Payload supply" }
      - { pin: "−", signal: GND, function: "Ground" }
  - name: POWER I2C
    type: Molex Micro-Lock Plus 6P (J301)
    mapping: ArduPilot BATT_MONITOR 21 · INA228 at 0x40 · 5 V always on
    pins:
      - { pin: 1, signal: 5V, function: "5 V supply to the flight controller" }
      - { pin: 2, signal: 5V, function: "5 V supply to the flight controller" }
      - { pin: 3, signal: SCL, function: "I2C clock — INA228 battery monitor" }
      - { pin: 4, signal: SDA, function: "I2C data — INA228 battery monitor" }
      - { pin: 5, signal: GND, function: "Ground" }
      - { pin: 6, signal: GND, function: "Ground" }
  - name: BUTTON
    type: JST-GH 7P (J901)
    mapping: Power button and 4 LEDs — or the AUTO-ON plug (pins 1–2 looped)
    pins:
      - { pin: 1, signal: BTN, function: "Button to GND (loop to pin 2 = AUTO-ON)" }
      - { pin: 2, signal: GND, function: "Ground" }
      - { pin: 3, signal: LED_A, function: "LED common anode, 24 mA current limit" }
      - { pin: 4, signal: LED1, function: "LED 1 cathode" }
      - { pin: 5, signal: LED2, function: "LED 2 cathode" }
      - { pin: 6, signal: LED3, function: "LED 3 cathode" }
      - { pin: 7, signal: LED4, function: "LED 4 cathode" }
configParams:
  - { section: "POWER I2C port (INA228)", name: BATT_MONITOR, value: "21", note: "INA2xx I2C battery monitor" }
  - { section: "POWER I2C port (INA228)", name: BATT_I2C_BUS, value: "FC-specific", note: "I2C bus of the flight-controller port the cable is plugged into" }
  - { section: "POWER I2C port (INA228)", name: BATT_I2C_ADDR, value: "64", note: "0x40 — required: with the default 0 ArduPilot only probes 0x41, 0x44 and 0x45" }
  - { section: "POWER I2C port (INA228)", name: BATT_SHUNT, value: "0.0001", note: "0.1 mΩ shunt (default 0.0005)" }
  - { section: "POWER I2C port (INA228)", name: BATT_MAX_AMPS, value: "300", note: "Reporting full scale — the default 90 clips readings above 90 A" }
configNotes: |
  After the first power-up compare the reported voltage and current with a meter and fine-tune BATT_SHUNT. The INA228 measures up to about ±1600 A across the 0.1 mΩ shunt; BATT_MAX_AMPS only sets the reporting full scale and resolution.
gallery:
  - { src: /images/products/pmu_APMU-12S-120A_iso.png, caption: Isometric }
  - { src: /images/products/pmu_APMU-12S-120A_front.png, caption: Front }
  - { src: /images/products/pmu_APMU-12S-120A_back.png, caption: Back }
  - { src: /images/products/pmu_APMU-12S-120A_left.png, caption: Left }
  - { src: /images/products/pmu_APMU-12S-120A_right.png, caption: Right }
  - { src: /images/products/pmu_APMU-12S-120A_top.png, caption: Top }
  - { src: /images/products/pmu_APMU-12S-120A_bottom.png, caption: Bottom }
---
