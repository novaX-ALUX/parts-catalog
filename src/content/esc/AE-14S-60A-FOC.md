---
name: AE-14S 60A FOC
tagline: Field-Oriented Control ESC · 6–14S LiPo · DroneCAN · Prop Parking
image: /images/products/esc_AE-14S-60A-FOC.png
gallery:
  - { src: /images/products/esc_AE-14S-60A-FOC_iso.png, caption: Isometric }
  - { src: /images/products/esc_AE-14S-60A-FOC_front.png, caption: Front }
  - { src: /images/products/esc_AE-14S-60A-FOC_back.png, caption: Back }
  - { src: /images/products/esc_AE-14S-60A-FOC_left.png, caption: Battery end }
  - { src: /images/products/esc_AE-14S-60A-FOC_right.png, caption: Motor end }
  - { src: /images/products/esc_AE-14S-60A-FOC_top.png, caption: Top }
  - { src: /images/products/esc_AE-14S-60A-FOC_bottom.png, caption: Bottom }
order: 28
pinoutImage: /images/products/esc_AE-14S-60A-FOC_pinout.png
pinoutNotes: "The battery leads and the CAN cable (JST-GH 4P plug) leave the battery end, the three motor leads and the encoder cable (round 6-pin plug) leave the motor end. CAN carries the throttle, telemetry, parameters and firmware updates."
pinTable:
  - name: Battery leads
    type: 14 AWG · battery end
    pins:
      - { pin: "+", signal: BAT+, function: "Red — battery positive, 6–14S LiPo (18–60 V)" }
      - { pin: "−", signal: BAT−, function: "Black — battery negative" }
  - name: CAN cable
    type: battery end · JST-GH 4P plug
    mapping: DroneCAN · Pixhawk pin order
    pins:
      - { pin: 1, signal: NC, function: "5 V of the autopilot port — not connected: the ESC powers its isolated CAN side itself" }
      - { pin: 2, signal: CAN_H, function: "DroneCAN high" }
      - { pin: 3, signal: CAN_L, function: "DroneCAN low" }
      - { pin: 4, signal: GND, function: "Ground of the isolated CAN side" }
  - name: PWM input (option)
    type: battery end · selected with can_pwm = 1
    pins:
      - { pin: "–", signal: PWM, function: "PWM throttle 1040–1940 µs, optically isolated — used only when can_pwm = 1" }
      - { pin: "–", signal: PWM−, function: "Return of the PWM input — to the ground pin of the same autopilot servo output" }
  - name: Motor leads
    type: orange · 16 AWG · motor end
    pins:
      - { pin: A, signal: MOT_A, function: "Motor phase — any order; after auto_cal keep the order and set the direction with dir" }
      - { pin: B, signal: MOT_B, function: "Motor phase" }
      - { pin: C, signal: MOT_C, function: "Motor phase" }
  - name: Encoder cable
    type: motor end · round 6-pin plug (Ø 8.3 mm) · SPI
    pins:
      - { pin: "–", signal: 3V3, function: "Encoder supply 3.3 V" }
      - { pin: "–", signal: GND, function: "Encoder ground" }
      - { pin: "–", signal: CS, function: "SPI chip select" }
      - { pin: "–", signal: CLK, function: "SPI clock" }
      - { pin: "–", signal: MOSI, function: "SPI data to the encoder" }
      - { pin: "–", signal: MISO, function: "SPI data from the encoder" }
manuals:
  - { label: "User Guide (booklet)", file: /manuals/esc_AE-14S-60A-FOC_user_guide.pdf }
specs:
  - { key: MCU, value: "TI TMS320F28027F (motor control) + ST STM32F103 (DroneCAN)" }
  - { key: Control, value: "Field-oriented control (InstaSPIN-FOC) with the motor's magnetic encoder" }
  - { key: Voltage Range, value: "6–14S LiPo (18–60 V)" }
  - { key: Constant Current, value: "30 A" }
  - { key: Burst Current, value: "60 A (10 s)" }
  - { key: Interface, value: "DroneCAN (CAN 2.0 · 1 Mbit/s · isolated) on a JST-GH 4P cable — throttle, telemetry, settings and firmware updates" }
  - { key: Telemetry, value: "DroneCAN ESC status — voltage, current, rpm, temperature and fault flags" }
  - { key: Prop Parking, value: "Holds the propeller at a stored angle at 0 % throttle (prop_align)" }
  - { key: Protection, value: "Current limited every switching cycle · heat lowers the limit, never below 50 % · short-circuit retry · voltage and throttle-loss flags" }
  - { key: Motors, value: "novaX AM-6212 / AM-6215 with encoder (28 poles), measured on the aircraft with auto_cal" }
  - { key: Wires, value: "Battery 14 AWG · motor 16 AWG · CAN cable with JST-GH 4P plug · encoder cable with round 6-pin plug" }
  - { key: Size, value: "84 × 35 × 20 mm (aluminium case, rubber grommet on every wire)" }
  - { key: Firmware, value: "novaX FOC App V1.62 (motor chip) · DroneCAN 1.14 with CAN bootloader V1.2 (CAN chip), both updated over DroneCAN" }
description: |
  AE-14S 60A FOC is a field-oriented-control ESC for 6–14S heavy-lift aircraft, sealed in an aluminium case. A TI C2000 (TMS320F28027F) runs the motor and an STM32F103 talks DroneCAN to the autopilot. Throttle comes over isolated DroneCAN on a JST-GH 4P cable; voltage, current, rpm, temperature and fault flags go back the same way. A second cable with a round 6-pin plug reads the motor's magnetic encoder, so the ESC measures the motor on the aircraft (auto_cal) and can park the propeller at a stored angle (prop_align). Over-current is limited every switching cycle and heat only lowers the current limit (never below 50 %), so an overloaded or hot ESC keeps the motor turning to land; only a real short circuit switches the motor off, and it is retried. Firmware updates go over DroneCAN with the case closed.
firmware:
  - kind: "Motor chip app (.bin · DroneCAN update)"
    file: /firmware/esc/ae-14s-60a-foc/novaX_AE-14S-60A-FOC_MotorChip_v1.62_App_CAN.bin
    version: "1.62"
    date: "2026-11-05"
    size: "47.9 KB"
    sha256: "c834c9f5446bd6fd4a3d5c125cf5746f7858e28ed507396bb01732b424a5a03f"
    notes: "Motor-control app for the TI F28027F. Send it over DroneCAN with the autopilot disarmed and the motor stopped: the CAN chip reads the file header and hands the file to the motor chip's bootloader (about 45 s). The ESC restarts and its node name shows AE14S_60A_V1.62. Works on every AE-14S 60A FOC."
  - kind: "CAN chip app (.bin · DroneCAN update)"
    file: /firmware/esc/ae-14s-60a-foc/novaX_AE-14S-60A-FOC_CANChip_v1.14_App_CAN.bin
    version: "1.14"
    date: "2026-11-05"
    size: "32.6 KB"
    sha256: "fae1afcec9d9d61d6243167a67e52bf2a17a3892432da5b6f6559b1f4522e001"
    notes: "DroneCAN app for the STM32F103 (the CAN side). Same update path as the motor chip file — the ESC tells the two files apart by their header and refuses any other file without erasing anything. Needs the CAN-chip bootloader V1.2 (ESCs whose DroneCAN software version is 1.14 or newer). An ESC on 1.13 has no CAN bootloader: it takes the SWD file below once. Adds sound_off."
  - kind: "CAN chip bootloader + app (Intel HEX · SWD)"
    file: /firmware/esc/ae-14s-60a-foc/novaX_AE-14S-60A-FOC_CANChip_v1.14_BootApp_SWD.hex
    version: "1.14"
    date: "2026-11-05"
    size: "130.4 KB"
    sha256: "d3eef7659cbdff973c51df2aed7192f602ce66a8893b8e9be5a60e2ad9bf217b"
    notes: "CAN bootloader V1.2 + app V1.14 in one Intel HEX, written once over SWD (ST-LINK) with the case open — for a new board and for an ESC still on 1.13. Parameters start at their defaults (esc_index 0, node_id 0). After this the CAN chip updates over DroneCAN like the motor chip."
firmwareNotes: "Firmware is updated over DroneCAN through the autopilot — the case stays closed. Latest: motor chip app V1.62 and CAN chip 1.14 with CAN bootloader V1.2 (2026-11-05). Disarm the autopilot and stop the motor (the ESC refuses an update otherwise), then send the .bin with a DroneCAN firmware updater — Mission Planner (SETUP → Optional Hardware → DroneCAN/UAVCAN → MAVlink-CAN1 → Start, then the ESC's Menu → Update Firmware) or the novaX PC Throttle tool. One file type per chip; the ESC reads the header and sends it to the right chip. The node name shows the motor app version (AE14S_60A_V1.62). A blank or unbootable motor chip is reflashed by novaX over JTAG."
configNotes: |
  Set the autopilot first (parameters below), then give every ESC its number. ESC parameters are DroneCAN parameters: in Mission Planner open SETUP → Optional Hardware → DroneCAN/UAVCAN, choose MAVlink-CAN1 and press Start. Each ESC appears as AE14S_60A_V1.62 (the motor app version) — Menu → Parameters, change the value, Write. The ESC refuses a change while its motor turns or the autopilot is armed (the old value comes back), so disarm first.

  1. Wiring — Battery leads to the power distribution (red +, black −). The three motor leads to the motor in any order. Plug the encoder cable's round 6-pin plug into the motor's encoder cable and the CAN cable's JST-GH 4P plug into the autopilot CAN1 port (its pin 1, 5 V, is not used: the ESC powers its isolated CAN side itself).
  2. Autopilot — Set the ArduPilot parameters in the table and reboot. CAN_D1_UC_ESC_BM marks the outputs that are sent to DroneCAN ESCs (15 = outputs 1–4); CAN_D1_UC_ESC_OF skips that many outputs, so the first marked output becomes ESC 0 (motors on outputs 5–8: BM 240, OF 4).
  3. ESC number — Give each ESC its esc_index: 0 for the first motor output, 1 for the next, and so on. Number the ESCs one at a time with only that ESC connected, or spin each with the motor test and match the rpm shown.
  4. Motor measurement — Propeller off, motor cold, autopilot disarmed: write auto_cal = 1. The motor turns slowly for about 20 s while the ESC measures resistance, inductance and flux twice and calibrates the encoder. motor_meas = 1 means the values were saved; any other number tells why not (see the user guide).
  5. Direction — Spin the motor with the motor test at 7–10 %. If it turns the wrong way, change dir (0 ↔ 1). Do not swap motor leads after auto_cal: the encoder calibration follows the lead order (after a swap, run auto_cal again).
  6. Prop parking (optional) — Fit the propeller, turn it by hand to the parking angle and write prop_align = 1. At 0 % throttle the ESC holds the propeller there. Write 1 again to store a new angle, 0 to switch it off.
configParams:
  - { name: CAN_P1_DRIVER, value: "1", section: "Autopilot (ArduPilot)", note: "Enable the CAN1 port with driver 1 (reboot after the change)" }
  - { name: CAN_P1_BITRATE, value: "1000000", section: "Autopilot (ArduPilot)", note: "1 Mbit/s (default)" }
  - { name: CAN_D1_PROTOCOL, value: "1", section: "Autopilot (ArduPilot)", note: "DroneCAN" }
  - { name: CAN_D1_UC_ESC_BM, value: "15", section: "Autopilot (ArduPilot)", note: "Outputs sent to DroneCAN ESCs: 15 = outputs 1–4 (motors 1–4). 0 = no CAN throttle at all" }
  - { name: CAN_D1_UC_ESC_OF, value: "0", section: "Autopilot (ArduPilot)", note: "Outputs skipped before ESC 0. Motors on outputs 5–8: CAN_D1_UC_ESC_BM 240 and CAN_D1_UC_ESC_OF 4" }
  - { name: esc_index, value: "0 … 19", section: "ESC (DroneCAN parameters)", note: "Position in the CAN throttle command: 0 = first marked output, 1 = the next … Every ESC needs its own number (default 0)" }
  - { name: node_id, value: "0 / 1 … 125", section: "ESC (DroneCAN parameters)", note: "0 = node number from the autopilot (dynamic allocation, default); 1–125 = fixed number" }
  - { name: dir, value: "0 / 1", section: "ESC (DroneCAN parameters)", note: "Spin direction. Change it here, never by swapping motor leads" }
  - { name: prop_align, value: "0 / 1", section: "ESC (DroneCAN parameters)", note: "1 = store the present propeller angle and hold it at 0 % throttle; 1 again = new angle; 0 = off. Motor stopped, after a passed auto_cal" }
  - { name: auto_cal, value: "1 / 2", section: "ESC (DroneCAN parameters)", note: "1 = measure the motor and calibrate the encoder (about 20 s, slow turn, propeller off, disarmed, cold motor). 2 = forget the measured values (defaults from the next power-up). Reads 0" }
  - { name: can_pwm, value: "0 / 1", section: "ESC (DroneCAN parameters)", note: "Throttle source: 0 = CAN (default), 1 = PWM input (option, see the pinout)" }
  - { name: sound_off, value: "0 / 1", section: "ESC (DroneCAN parameters)", note: "1 = no start-up tones (do-mi-sol) at power-up; 0 = tones on (default). CAN chip 1.14 or newer" }
  - { name: motor_rs_mohm, value: "read only", section: "ESC (DroneCAN parameters)", note: "Phase resistance measured by auto_cal (mΩ, 0 = none)" }
  - { name: motor_ls_uh, value: "read only", section: "ESC (DroneCAN parameters)", note: "Inductance measured by auto_cal (µH, 0 = none)" }
  - { name: motor_flux_vphz, value: "read only", section: "ESC (DroneCAN parameters)", note: "Flux measured by auto_cal (V/Hz, 0 = none)" }
  - { name: motor_meas, value: "read only", section: "ESC (DroneCAN parameters)", note: "Result of the last auto_cal: 1 = saved; 11–23 = not saved, the reason is listed in the user guide" }
  - { name: motor_pole_pairs, value: "read only", section: "ESC (DroneCAN parameters)", note: "Pole pairs found by auto_cal (14 for AM-6212 / AM-6215, 0 = none)" }
---
