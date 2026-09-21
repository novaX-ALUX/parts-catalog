---
name: APMU-12S 100A
tagline: 12S Power Distribution & Monitoring Board — 6 Battery Outputs, 12 V · 5–10 V · 5 V Rails
image: /images/products/pmu_APMU-12S-100A.png
order: 10
comingSoon: true
specs:
  - { key: Battery Input, value: "Up to 12S LiPo (50.4 V) · XT90 male" }
  - { key: Continuous Current, value: "100 A target for the release version (new input stage) — not yet rated" }
  - { key: Battery Outputs, value: "5× XT60 (30 A each) + 1× XT30 (15 A) — battery voltage, unswitched" }
  - { key: 12 V Output, value: "11.9 V · 8 A for the whole 12 V bus (ADI LT8645S) · XT30 — regulated while the battery is above about 12.5 V" }
  - { key: 5–10 V Output, value: "4.9–9.9 V set by trimmer · 5 A converter fed from the 12 V bus · XT30" }
  - { key: FC Power Ports, value: "5.0 V · up to 2 A per port · 2× JST-GH 6P (I2C · analog), Pixhawk pin order" }
  - { key: Current Shunt, value: "0.3 mΩ Vishay WSL5931 (5 W), high side, shared by both ports" }
  - { key: Digital Monitor, value: "TI INA228 20-bit, I2C address 0x40 — ArduPilot BATT_MONITOR 21" }
  - { key: Analog Monitor, value: "Voltage ×21 · current 18 mV/A (55.56 A/V) — ArduPilot BATT_MONITOR 4" }
  - { key: PCB, value: "V2 · 95.3 × 60.6 mm · 4 layers · 1.6 mm · 3 oz copper or heavier · 4× Ø3.5 mm holes" }
  - { key: Validation Status, value: "V2 design — not yet built or tested; weight and temperature limits to be measured" }
description: |
  APMU-12S 100A takes a 12S battery on an XT90 connector and distributes it to six unswitched battery outputs (five XT60, one XT30). A regulated 12 V bus (ADI LT8645S, 8 A) feeds a 12 V output and, from that bus, an adjustable 5–10 V output and the 5 V supply for the flight controller's two power ports. Battery current is measured on a 0.3 mΩ high-side shunt twice: digitally by a TI INA228 on the I2C power port and as analog voltage and current signals on the analog power port, so either ArduPilot battery-monitor type can be used. Because the 5–10 V and 5 V converters draw from the 12 V bus, the 12 V, 5–10 V and 5 V output currents listed above are not available at the same time. Coming soon: 100 A continuous is the target of the release version, which replaces the input stage of the current V2 design; current rating, weight and temperature limits are not yet measured. Images are renders of the V2 CAD design, not photos of a built board.
pinoutImages:
  - /images/products/pmu_APMU-12S-100A_pinout.png
pinoutNotes: |
  Top view with the battery input on the left. The output XT30s are marked VBAT, 12V and 5-10V on the board. On both JST-GH power ports pin 1 is at the right-hand end seen from the top. Both GH ports carry the same 5 V supply (up to 2 A each; GH contacts are rated 1 A per pin, two 5 V pins per port) and read the same shunt. The analog port's current signal is produced by a MAX4080 powered from the board's 5 V rail.
pinTable:
  - name: BATTERY IN
    type: XT90 male (J45)
    mapping: Battery input — through the 0.3 mΩ current shunt to every output
    pins:
      - { pin: "+", signal: BAT+, function: "Battery positive" }
      - { pin: "−", signal: GND, function: "Battery negative" }
  - name: VBAT OUT ×5
    type: XT60 female (J1 · J4 · J5 · J6 · J7)
    mapping: Battery voltage after the shunt — 30 A per connector
    pins:
      - { pin: "+", signal: VBAT, function: "Battery voltage, unswitched" }
      - { pin: "−", signal: GND, function: "Ground" }
  - name: VBAT
    type: XT30 female (J55)
    mapping: Battery voltage after the shunt — 15 A
    pins:
      - { pin: "+", signal: VBAT, function: "Battery voltage, unswitched" }
      - { pin: "−", signal: GND, function: "Ground" }
  - name: 12V
    type: XT30 female (J44)
    mapping: 11.9 V regulated — 8 A shared with the 5–10 V and 5 V converters
    pins:
      - { pin: "+", signal: 12V, function: "12 V output" }
      - { pin: "−", signal: GND, function: "Ground" }
  - name: 5-10V
    type: XT30 female (J66)
    mapping: 4.9–9.9 V adjustable (trimmer R59) — 5 A
    pins:
      - { pin: "+", signal: 5-10V, function: "Adjustable output" }
      - { pin: "−", signal: GND, function: "Ground" }
  - name: POWER I2C
    type: JST-GH 6P (J42)
    mapping: ArduPilot BATT_MONITOR 21 · INA228 at 0x40
    pins:
      - { pin: 1, signal: 5V, function: "5 V supply to the flight controller" }
      - { pin: 2, signal: 5V, function: "5 V supply to the flight controller" }
      - { pin: 3, signal: SCL, function: "I2C clock — INA228 battery monitor" }
      - { pin: 4, signal: SDA, function: "I2C data — INA228 battery monitor" }
      - { pin: 5, signal: GND, function: "Ground" }
      - { pin: 6, signal: GND, function: "Ground" }
  - name: POWER ANALOG
    type: JST-GH 6P (J41)
    mapping: ArduPilot BATT_MONITOR 4
    pins:
      - { pin: 1, signal: 5V, function: "5 V supply to the flight controller" }
      - { pin: 2, signal: 5V, function: "5 V supply to the flight controller" }
      - { pin: 3, signal: CURRENT, function: "Current signal, 18 mV/A (BATT_AMP_PERVLT 55.56)" }
      - { pin: 4, signal: VOLTAGE, function: "Battery voltage ÷ 21 (BATT_VOLT_MULT 21)" }
      - { pin: 5, signal: GND, function: "Ground" }
      - { pin: 6, signal: GND, function: "Ground" }
configParams:
  - { section: "POWER I2C port (INA228)", name: BATT_MONITOR, value: "21", note: "INA2xx I2C battery monitor" }
  - { section: "POWER I2C port (INA228)", name: BATT_I2C_BUS, value: "FC-specific", note: "I2C bus of the flight-controller port the cable is plugged into" }
  - { section: "POWER I2C port (INA228)", name: BATT_I2C_ADDR, value: "64", note: "0x40 — required: with the default 0 ArduPilot only probes 0x41, 0x44 and 0x45" }
  - { section: "POWER I2C port (INA228)", name: BATT_SHUNT, value: "0.0003", note: "0.3 mΩ shunt (default 0.0005)" }
  - { section: "POWER I2C port (INA228)", name: BATT_MAX_AMPS, value: "150", note: "Measurement full scale — the default 90 clips readings above 90 A" }
  - { section: "POWER ANALOG port", name: BATT_MONITOR, value: "4", note: "Analog voltage and current" }
  - { section: "POWER ANALOG port", name: BATT_VOLT_PIN / BATT_CURR_PIN, value: "FC-specific", note: "ADC pins of the flight-controller power port" }
  - { section: "POWER ANALOG port", name: BATT_VOLT_MULT, value: "21.0", note: "20 kΩ / 1 kΩ divider" }
  - { section: "POWER ANALOG port", name: BATT_AMP_PERVLT, value: "55.56", note: "MAX4080S 60 V/V × 0.3 mΩ = 18 mV/A" }
configNotes: |
  Both ports read the same shunt; use one of them, or both as BATT and BATT2. After the first power-up compare the reported voltage and current with a meter and fine-tune BATT_VOLT_MULT and BATT_AMP_PERVLT (analog) or BATT_SHUNT (I2C).
gallery:
  - /images/products/pmu_APMU-12S-100A.png
  - /images/products/pmu_APMU-12S-100A_input.png
  - /images/products/pmu_APMU-12S-100A_top.png
  - /images/products/pmu_APMU-12S-100A_bottom.png
  - /images/products/pmu_APMU-12S-100A_cad_top.png
  - /images/products/pmu_APMU-12S-100A_cad_bottom.png
---
