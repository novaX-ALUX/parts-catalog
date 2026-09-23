---
name: APMU-12S 140A
tagline: 12S Power Management Unit — 140 A (1 min) Switched ESC Bus with Precharge, 5 V · 7.4 V · 12 V · 16 V · 24 V Rails
image: /images/products/pmu_APMU-12S-140A.png
model3d: /models/pmu/APMU-12S-140A.glb
order: 11
comingSoon: true
specs:
  - { key: Battery Input, value: "12S LiPo / LiHV (36–52.2 V) · Amass AS150U male, right angle on the top edge (AS150UPW-M) — 70 A rated, 140 A for 1 min" }
  - { key: Peak Current (1 min), value: "140 A — the number in the name. Set by the AS150U battery connector's 1-minute rating (Amass spec, main contacts 140 A, 1 min, < 80 °C); the board itself would take 294 A for a minute. At 140 A for a minute the PCB reaches 55 °C and the FET junctions 57 °C (calculated)" }
  - { key: Continuous Current, value: "70–75 A — again the AS150U battery connector (70 A UL1977 with 8 AWG, 4 h < 60 °C; 75 A max, ΔT < 85 °C). The board's own copper and FETs allow 125 A continuous with the finned aluminium heat-sink case; the hover design point is 120 A (PCB 53 °C). To be confirmed by thermal test" }
  - { key: Main Switch, value: "10 × Infineon IAUT300N10S5N015 (100 V) driven by ADI LTC7001 — switched by the button circuit, no firmware" }
  - { key: Precharge, value: "ESC capacitors are charged through 10 Ω to 70 % of the battery voltage before the main switch closes; a short or overload stops it — up to 7.5 mF total ESC capacitance" }
  - { key: ESC Outputs, value: "5× XT90 female (Amass XT90PW-F) — switched battery voltage, 30 A each (UL1977), 60 A for 1 min" }
  - { key: ESC Direct-Solder Holes, value: "The four side outputs (ESC1–ESC4) also have a pair of Ø5.3 mm plated holes under the XT90 housing, + and −, the same hole as the AS150U power pins — solder the ESC wire straight to the board when no XT90 is fitted, so on a VTOL the heavy cable branches at the wing tip instead of at the PMU. Use the connector or the holes, not both" }
  - { key: Servo Output, value: "7.4 V · 20 A · XT60 female (TI LM5146) — on with the main switch" }
  - { key: Payload Outputs, value: "16 V · 10 A and 24 V · 10 A · XT30 female (TI LM5146) — on with the main switch; 24 V needs a battery above 36 V" }
  - { key: Aux 12 V Output, value: "12 V · 0.5 A · XT30 female (TI TPS560430, fed from the 24 V rail) — on with the main switch" }
  - { key: Navigation Lights, value: "Left white strobe + red, right white strobe + blue · 2× JST-GH 4P, 5 V common anode (TI LM5146 5 V · 5 A rail), up to 1 A per colour · white flashes 59 times a minute for 0.1 s, left and right together (14 CFR 25.1401: 40–100 per minute) · on / off from one flight-controller servo PWM — no MCU" }
  - { key: CAN Hub, value: "7× JST-GH 4P in parallel (5V · CAN_H · CAN_L · GND), passive — shares the flight controller's CAN bus · 5 V from the FC rail · 120 Ω termination by solder jumper JP301, open by default" }
  - { key: FC Power Port, value: "5 V · 4.5 A, always on with the battery (TI LM5146) · Molex Micro-Lock Plus 6P, AF-H7E POWER pin order" }
  - { key: Digital Monitor, value: "TI INA228 20-bit on the FC port I2C, address 0x40 · 0.1 mΩ Vishay WSLP5931 shunt — ArduPilot BATT_MONITOR 21" }
  - { key: Button & LEDs, value: "JST-GH 7P button / 4-LED cable: tap, then press and hold ~2 s to switch on or off · AUTO-ON plug (pins 6–7, BTN–GND, looped) switches on with the battery" }
  - { key: Button Cable, value: "Straight 1:1 JST-GH 7P harness to the APMU-BTN1 button board — JST GHR-07V-S housing at both ends, SGHD-002T-P0.2 contacts, 28 AWG, 300 mm as standard. Pin 1 LED common (+), pins 2–5 the four LED cathodes, pin 6 the button contact, pin 7 GND; never a reversed harness. The AUTO-ON plug is the same housing with only pins 6 and 7 bridged, and replaces the cable" }
  - { key: PCB, value: "200 × 100 mm · 4 layers · 1.6 mm · 3 oz outer / 2 oz inner · parts on the top only (bottom = heat-sink face) · 4× M3, 4 mm from the edges" }
  - { key: Validation Status, value: "Design stage — schematic verified, PCB in routing; not yet built or tested" }
description: |
  APMU-12S 140A is the power management unit for a 12S VTOL: the battery plugs into a board-mounted AS150U connector on the top edge, passes a 0.1 mΩ current shunt and a main switch of ten 100 V MOSFETs, and leaves on five board-mounted XT90 connectors for the lift and cruise ESCs — two on each side and one at the bottom. The switch has no microcontroller and no firmware — a small circuit of logic chips turns it on and off from the button: tap, then press and hold for about two seconds while the four LEDs fill (on) or empty (off). A single long press, a stuck button or a pulled button cable change nothing. Before the switch closes, the ESC capacitors are charged through a 10 Ω path to 70 % of the battery voltage, so connecting a battery or switching on never sparks, and a shorted or overloaded output stops the precharge instead of closing the switch. Five TI LM5146 converters supply the servos (7.4 V, 20 A), payloads (16 V and 24 V, 10 A each), navigation lights (5 V, 5 A) and the flight controller (5 V, 4.5 A), and a TI TPS560430 makes a 12 V, 0.5 A auxiliary rail from the 24 V rail; everything but the flight-controller rail follows the main switch, the flight-controller rail is always on while the battery is connected. The navigation lights plug straight into the board: a white strobe with a red (left) or blue (right) position light, the two strobes flashing together once a second, all switched on and off by one servo PWM line from the flight controller — again without a microcontroller. A passive seven-plug CAN hub shares the flight controller's CAN bus with the ESCs, GPS and other CAN devices. The flight controller reads battery voltage and current directly from a TI INA228 on its power-port I2C. Coming soon: the 140 A in the name is what the board will take for one minute, which is where the AS150U battery connector runs out; continuously the same connector allows 70-75 A, while the copper and the ten MOSFETs would carry 120 A all day with the finned aluminium heat-sink case. None of it is measured yet. Images are renders of the CAD design, not photos of a built board.
pinoutImages:
  - /images/products/pmu_APMU-12S-140A_pinout.png
  - /images/products/pmu_APMU-BTN1_cable.png
pinoutNotes: |
  Figure 1 is the main board, figure 2 the button harness. Figure 2 is drawn from the two netlists, so the cable in
  it is the cable the boards expect: a straight 1:1 JST-GH 7P harness, GHR-07V-S housings and SGHD-002T-P0.2
  contacts on 28 AWG, 300 mm as standard, and the AUTO-ON plug is the same housing with only pins 6 and 7 bridged.
  Top view: the battery connector (AS150U) and the 24 V, 16 V and 7.4 V outputs on the top edge, the 12 V output on the left edge, two ESC outputs on each side and one at the bottom, next to the NAV LEFT, BUTTON, NAV RIGHT and NAV PWM plugs; the seven CAN plugs are at the top right beside the FC power port. On every XT connector the flat side of the housing is positive, as marked on the board (+ / −). The AUTO-ON plug is a JST-GH 7P housing with pins 6 and 7 (BTN and GND) looped: with it in place the unit switches on when the battery is connected, and pulling it out later changes nothing. Holding the button while connecting the battery also switches the unit on. Under each of the four side XT90 housings (ESC1-ESC4) there is a pair of 5.3 mm holes marked + and -: if the XT90 is not fitted, the ESC wire is soldered straight into them.
pinTable:
  - name: BATTERY IN
    type: AS150U male, right angle (J101)
    mapping: Battery input — through the 0.1 mΩ shunt to the main switch and the converters
    pins:
      - { pin: "+", signal: VBAT, function: "Battery positive" }
      - { pin: "−", signal: GND, function: "Battery negative" }
      - { pin: "S1–S4", signal: "—", function: "Smart-battery signal pins, not connected" }
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
  - name: 16V
    type: XT30 female (J601)
    mapping: 16 V · 10 A, on with the main switch
    pins:
      - { pin: "+", signal: 16V, function: "Payload supply" }
      - { pin: "−", signal: GND, function: "Ground" }
  - name: 24V
    type: XT30 female (J701)
    mapping: 24 V · 10 A, on with the main switch (battery above 36 V)
    pins:
      - { pin: "+", signal: 24V, function: "Payload supply" }
      - { pin: "−", signal: GND, function: "Ground" }
  - name: 12V
    type: XT30 female (J1101)
    mapping: 12 V · 0.5 A from the 24 V rail, on with the main switch
    pins:
      - { pin: "+", signal: 12V, function: "Auxiliary supply" }
      - { pin: "−", signal: GND, function: "Ground" }
  - name: CAN ×7
    type: JST-GH 4P (J302 – J308, in parallel)
    mapping: Passive CAN hub — the flight controller's CAN bus for ESCs, GPS and other CAN devices · JP301 closed = 120 Ω termination
    pins:
      - { pin: 1, signal: 5V, function: "5 V from the FC rail" }
      - { pin: 2, signal: CAN_H, function: "CAN high" }
      - { pin: 3, signal: CAN_L, function: "CAN low" }
      - { pin: 4, signal: GND, function: "Ground" }
  - name: NAV LEFT
    type: JST-GH 4P (J1201)
    mapping: Left navigation light — common-anode LEDs, up to 1 A per colour
    pins:
      - { pin: 1, signal: 5V_LED, function: "Light supply (common anode)" }
      - { pin: 2, signal: 5V_LED, function: "Light supply (common anode)" }
      - { pin: 3, signal: WHITE, function: "White strobe cathode — flashes 0.1 s once a second" }
      - { pin: 4, signal: RED, function: "Red position light cathode — steady" }
  - name: NAV RIGHT
    type: JST-GH 4P (J1202)
    mapping: Right navigation light — common-anode LEDs, up to 1 A per colour
    pins:
      - { pin: 1, signal: 5V_LED, function: "Light supply (common anode)" }
      - { pin: 2, signal: 5V_LED, function: "Light supply (common anode)" }
      - { pin: 3, signal: WHITE, function: "White strobe cathode — flashes with the left one" }
      - { pin: 4, signal: BLUE, function: "Blue position light cathode — steady" }
  - name: NAV PWM IN
    type: JST-GH 2P (J1203)
    mapping: Lights on / off from one flight-controller servo output (3.3 V PWM) — lights on at power-up until pulses arrive
    pins:
      - { pin: 1, signal: PWM, function: "≥ 1.7 ms = lights on, ≤ 1.3 ms = off" }
      - { pin: 2, signal: GND, function: "Ground" }
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
    mapping: Power button and 4 LEDs — or the AUTO-ON plug (pins 6–7 looped)
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
  - { section: "Navigation lights (NAV PWM IN)", name: SERVOn_FUNCTION, value: "51–66", note: "RC pass-through (RCIN1–16) of a 2-position switch on the servo output wired to NAV PWM IN: 1.0 ms off, 2.0 ms on" }
configNotes: |
  After the first power-up compare the reported voltage and current with a meter and fine-tune BATT_SHUNT. The navigation lights need a servo PWM signal (not a relay / GPIO level): a steady level cannot switch them off. The INA228 measures up to about ±1600 A across the 0.1 mΩ shunt; BATT_MAX_AMPS only sets the reporting full scale and resolution.
gallery:
  - { src: /images/products/pmu_APMU-12S-140A_iso.png, caption: Isometric }
  - { src: /images/products/pmu_APMU-12S-140A_front.png, caption: Front }
  - { src: /images/products/pmu_APMU-12S-140A_back.png, caption: Back }
  - { src: /images/products/pmu_APMU-12S-140A_left.png, caption: Left }
  - { src: /images/products/pmu_APMU-12S-140A_right.png, caption: Right }
  - { src: /images/products/pmu_APMU-12S-140A_top.png, caption: Top }
  - { src: /images/products/pmu_APMU-12S-140A_bottom.png, caption: Bottom }
  - { src: /images/products/pmu_APMU-BTN1_iso.png, caption: Button board APMU-BTN1 — isometric }
  - { src: /images/products/pmu_APMU-BTN1_top.png, caption: Button board APMU-BTN1 — top }
  - { src: /images/products/pmu_APMU-BTN1_bottom.png, caption: Button board APMU-BTN1 — bottom }
---
