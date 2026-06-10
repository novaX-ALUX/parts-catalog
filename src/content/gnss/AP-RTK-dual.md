---
name: AP-RTK dual
tagline: Dual-Antenna High-Precision RTK GNSS
image: /images/products/gnss_X_RTK2.png
pictureKey: gnss_X_RTK2
order: 20
specs:
  - { key: MCU, value: "STM32F4, ARM Cortex-M4, 180 MHz" }
  - { key: Compass, value: "RM3100" }
  - { key: Receiver, value: "High-precision GNSS SoC" }
  - { key: Satellite Systems, value: "BDS / GPS / GLONASS / Galileo / QZSS" }
  - { key: Antenna 1 (Master), value: "BDS B1I/B2I/B3I · GPS L1C/A/L2/L5 · GLONASS L1/L2 · Galileo E1/E5a/E5b · QZSS L1/L2/L5" }
  - { key: Antenna 2 (Slave), value: "BDS B1I/B2I/B3I · GPS L1C/A/L2C · GLONASS L1/L2 · Galileo E1/E5b · QZSS L1/L2" }
  - { key: Single-Point Accuracy, value: "H 1.5 m / V 2.5 m (RMS)" }
  - { key: DGPS Accuracy, value: "H 0.4 m + 1PPM / V 0.8 m + 1PPM" }
  - { key: RTK Accuracy, value: "H 0.8 cm + 1PPM / V 1.5 cm + 1PPM" }
  - { key: Cold Start, value: "< 30 sec" }
  - { key: Hot Start, value: "< 5 sec" }
  - { key: Update Rate, value: "Max. 20 Hz (Default 5 Hz)" }
  - { key: Data Format, value: "RTCM 3.X" }
  - { key: Comm. Protocol, value: "DroneCAN / NMEA" }
  - { key: I/O Ports, value: "2× Antenna · 1× CAN · 1× UART · 1× USB-C" }
  - { key: Size, value: "49.2 × 37.1 × 16.3 mm" }
  - { key: Weight, value: "36 g" }
  - { key: Operating Temp, value: "-20 ~ +85 ℃" }
  - { key: Operating Voltage, value: "4.7 – 5.2 V" }
description: |
  AP-RTK dual is a high-precision dual-antenna RTK GNSS receiver built on an STM32F4 processor. Centimeter-level positioning and dual-antenna heading make it ideal for survey-grade autonomous platforms and applications that demand reliable yaw determination independent of magnetic interference.
firmware:
  - kind: "AP_Periph (DroneCAN OTA)"
    file: https://github.com/novaX-ALUX/flight_controller/releases/download/AP-RTK_dual-v0.1.0/AP-RTK_dual-v0.1.0.bin
    version: "0.1.0"
    date: "2026-06-04"
    size: "157 KB"
    sha256: "d77268b9d9bb3638eea0749cc5a937a11394d00d20b9dd57ee99df2f1f4c4e74"
    notes: "Update over DroneCAN: Mission Planner → Optional Hardware → DroneCAN → select node → Update. No cable change needed."
  - kind: "AP_Periph (.apj package)"
    file: https://github.com/novaX-ALUX/flight_controller/releases/download/AP-RTK_dual-v0.1.0/AP-RTK_dual-v0.1.0.apj
    version: "0.1.0"
    date: "2026-06-04"
    size: "157 KB"
    sha256: "886c19a1bb251f0168bca72744c26f743261d3fcb6262488513226e785df4ac3"
    notes: "ArduPilot firmware package for upload via the USB-C bootloader (e.g. Mission Planner custom firmware)."
firmwareNotes: 'All firmware releases are published on GitHub: https://github.com/novaX-ALUX/flight_controller/releases'
configImages:
  - /images/products/gnss_AP-RTK-dual_antenna-setup.svg
configParams:
  - { name: CAN_P1_DRIVER, value: "1", note: "Enable the autopilot CAN1 port (reboot required after change)" }
  - { name: GPS1_TYPE, value: "9", note: "DroneCAN GPS (GPS_TYPE on firmware older than 4.6)" }
  - { name: GPS_AUTO_CONFIG, value: "2", note: "Auto-configure DroneCAN GPS" }
  - { name: GPS_MB1_TYPE, value: "1", note: "Enable dual-antenna moving baseline; unlocks the offset parameters below" }
  - { name: GPS_MB1_OFS_X, value: "0.30", note: "ANT1 (Master) position forward of ANT2 (Slave) in meters — set to your measured antenna separation" }
  - { name: "GPS_MB1_OFS_Y / Z", value: "0", note: "Keep 0 when both antennas sit on the centerline at equal height" }
  - { name: EK3_SRC1_YAW, value: "3", note: "GPS yaw with compass fallback (use 2 for GPS-only yaw)" }
  - { name: AHRS_EKF_TYPE, value: "3", note: "EKF3 attitude estimation (default on current firmware)" }
  - { name: EK3_ENABLE, value: "1", note: "Enable EKF3 (default on current firmware)" }
configNotes: |
  1. Wiring — Connect the module's CAN port to the autopilot CAN1 port with the supplied cable. The module is powered from the same connector (4.7–5.2 V).
  2. Antenna mounting — Fix both antennas on the airframe centerline with ANT1 (Master) toward the nose and at least 300 mm between antennas, mounted at equal height with a clear sky view (see diagram above).
  3. Parameters — Set the parameters in the table above, then reboot the autopilot. Set GPS_MB1_OFS_X to the antenna separation you actually measured (in meters).
  4. Heading check — In Mission Planner's flight data screen watch the gpsyaw value: rotate the airframe and confirm the reported heading follows. The onboard RM3100 compass is detected automatically over DroneCAN and serves as fallback.
  5. RTK corrections — Inject RTCM corrections from an RTK base station or an NTRIP (CORS) service via the ground station. Wait for the GPS status to reach RTK Fixed for centimeter-level positioning.
  6. Antenna position offset (optional) — If ANT1 is far from the vehicle's center of gravity, set GPS_POS1_X/Y/Z to the ANT1 position relative to the CG for best position accuracy.
---
