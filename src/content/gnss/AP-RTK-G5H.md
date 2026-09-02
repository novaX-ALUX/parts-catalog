---
name: AP-RTK G5H
tagline: Dual-Antenna RTK GNSS with Septentrio mosaic-G5 P3H
image: /images/products/gnss_AP-RTK-G5H_device.png
pictureKey: gnss_X_RTK2
pinoutImage: /images/products/gnss_AP-RTK-G5H_pinout.png
pinoutNotes: '① UART (5V · RX · TX · GND — receiver COM2 for RxTools / firmware upgrade) · ② CAN (5V · CAN_H · CAN_L · GND). USB-C connects to the MCU (bootloader / DFU).'
order: 21
specs:
  - { key: MCU, value: "STM32F412, ARM Cortex-M4, 100 MHz" }
  - { key: Compass, value: "PNI RM3100" }
  - { key: Receiver, value: "Septentrio mosaic-G5 P3H (Belgium) — single module, dual antenna" }
  - { key: Satellite Systems, value: "GPS / GLONASS / Galileo / BeiDou / QZSS (789 channels)" }
  - { key: Signals, value: "GPS L1C/A·L1C·L2C·L2P·L5 · GLONASS L1·L2·L3 · Galileo E1·E5a·E5b·E6 · BeiDou B1I·B1C·B2a·B2I·B2b·B3I · QZSS L1·L2·L5·L6" }
  - { key: Heading (dual antenna), value: "0.15° @ 1 m baseline · 0.03° @ 5 m (RMS)" }
  - { key: Pitch / Roll, value: "0.25° @ 1 m · 0.05° @ 5 m (RMS)" }
  - { key: RTK Accuracy, value: "H 0.6 cm + 0.5 ppm / V 1 cm + 1 ppm (RMS)" }
  - { key: RTK Initialization, value: "7 s" }
  - { key: Standalone / DGNSS, value: "H 1.2 m / 0.4 m · V 1.9 m / 0.7 m (RMS)" }
  - { key: Velocity Accuracy, value: "3 cm/s" }
  - { key: Cold / Warm Start, value: "< 35 s / < 10 s · Re-acquisition 1 s" }
  - { key: Update Rate, value: "Max. 20 Hz (10 Hz over DroneCAN)" }
  - { key: Interference Protection, value: "AIM+ jamming / spoofing detection & mitigation, APME+ multipath, LOCK+, IONO+" }
  - { key: Data Format, value: "RTCM 3.x input (MSM)" }
  - { key: Comm. Protocol, value: "DroneCAN (heading via ardupilot.gnss.Heading)" }
  - { key: I/O Ports, value: "2× Antenna (MMCX, 3.3 V bias, 150 mA) · 1× CAN · 1× UART · 1× USB-C" }
  - { key: Operating Temp, value: "-40 ~ +85 ℃ (receiver)" }
  - { key: Operating Voltage, value: "4.7 – 5.2 V" }
description: |
  AP-RTK G5H is the successor to AP-RTK dual with a non-Chinese receiver: a single Septentrio mosaic-G5 P3H module (Belgium) tracks both antennas and computes the heading on-chip, so the autopilot receives position, RTK status and heading over one DroneCAN node. The same carrier design, connectors and cables as AP-RTK dual are used, so it is a drop-in replacement on the airframe. Quad-band, 789-channel tracking with AIM+ interference detection and mitigation.
firmware:
  - kind: "AP_Periph (DroneCAN OTA)"
    file: https://github.com/novaX-ALUX/fc-boards/releases/download/AP-RTK_G5H-v0.1.0/AP-RTK_G5H-v0.1.0.bin
    version: "0.1.0"
    date: "2026-09-02"
    size: "201 KB"
    sha256: "2a5535a9a9f36f0114ccc1990521fb4179c415e31d60a335bb37e9b01a90e5b8"
    notes: "Update over DroneCAN: Mission Planner → Optional Hardware → DroneCAN → select node 'AP-RTK G5H' → Update. The bootloader refuses any file whose board_id is not 6206, so the AP-RTK dual image cannot be flashed by mistake (and vice versa). v0.1.0 = first build (ArduPilot 4.6.3 AP_Periph, SBF dual-antenna driver)."
  - kind: "AP_Periph (.apj package)"
    file: https://github.com/novaX-ALUX/fc-boards/releases/download/AP-RTK_G5H-v0.1.0/AP-RTK_G5H-v0.1.0.apj
    version: "0.1.0"
    date: "2026-09-02"
    size: "202 KB"
    sha256: "44ebc48e64a929050bddc4fe79625ce2596bee9d6b5fc716695914af47aa653e"
    notes: "ArduPilot firmware package — upload with Mission Planner or uploader.py over the USB-C bootloader, or update over DroneCAN (OTA above). Not flashable from the catalog Web Updater."
  - kind: "Bootloader + App (merged HEX · SWD / USB DFU)"
    file: https://github.com/novaX-ALUX/fc-boards/releases/download/AP-RTK_G5H-v0.1.0/AP-RTK_G5H-v0.1.0_with_bl.hex
    version: "0.1.0"
    date: "2026-09-02"
    size: "729 KB"
    sha256: "02ca929e71670dcb685064e36d1e7beddccf3c24803e70df8d7a919832fc04ac"
    notes: "Bootloader + application combined image based at 0x08000000, for factory bring-up or recovery on a blank MCU: SWD/ST-Link, or the STM32 ROM USB DFU (hold BOOT while connecting USB-C → 0483:DF11). For routine updates use the DroneCAN OTA or .apj methods above."
firmwareNotes: 'All firmware releases are published on GitHub: https://github.com/novaX-ALUX/fc-boards/releases'
configImages:
  - { src: /images/products/gnss_AP-RTK-dual_antenna-setup.png, caption: "Antenna placement & wiring — ANT1 (main) front, ANT2 (aux) rear, ≥ 500 mm apart (same layout as AP-RTK dual)" }
  - { src: /images/products/gnss_AP-RTK-dual_offset-convention.png, caption: "Baseline offset sign convention (X / Y / Z) — set on the GNSS node, not on the autopilot" }
configParams:
  - { name: CAN_P1_DRIVER, value: "1", section: "DroneCAN connection & heading", note: "Enable the autopilot CAN1 port (reboot required after change)" }
  - { name: CAN_D1_PROTOCOL, value: "1", section: "DroneCAN connection & heading", note: "DroneCAN protocol on the CAN1 driver" }
  - { name: GPS1_TYPE, value: "9", section: "DroneCAN connection & heading", note: "DroneCAN GPS. On firmware older than 4.6 the parameter is GPS_TYPE = 9" }
  - { name: GPS_AUTO_CONFIG, value: "2", section: "DroneCAN connection & heading", note: "Automatically configure the DroneCAN GPS" }
  - { name: EK3_SRC1_YAW, value: "3", section: "DroneCAN connection & heading", note: "GPS yaw with compass fallback (use 2 for GPS-only yaw)" }
  - { name: AHRS_EKF_TYPE, value: "3", section: "DroneCAN connection & heading", note: "Heading works only when AHRS uses EKF3" }
  - { name: EK3_ENABLE, value: "1", section: "DroneCAN connection & heading", note: "Enable EKF3" }
  - { name: GPS1_MB_TYPE, value: "2", section: "On the GNSS node (Mission Planner → DroneCAN → AP-RTK G5H → Parameters)", note: "Pre-set in the node firmware. Unlike AP-RTK dual, the heading is computed on the node, so the moving-baseline offsets live here — leave the autopilot's GPS1_MB_* at 0" }
  - { name: GPS1_MB_OFS_X, value: "0.50", section: "On the GNSS node (Mission Planner → DroneCAN → AP-RTK G5H → Parameters)", note: "Pre-set to 0.50 m (ANT1 main 0.50 m in front of ANT2 aux, positive = main in front). Change to your measured separation; a reported baseline that differs by more than 20 % is rejected" }
  - { name: GPS1_MB_OFS_Y, value: "0", section: "On the GNSS node (Mission Planner → DroneCAN → AP-RTK G5H → Parameters)", note: "0 on the centerline (positive = main antenna to the right of aux)" }
  - { name: GPS1_MB_OFS_Z, value: "0", section: "On the GNSS node (Mission Planner → DroneCAN → AP-RTK G5H → Parameters)", note: "0 at equal height (positive = main antenna below aux)" }
  - { name: GPS1_POS_X, value: "0.25", section: "Position offset · ANT1 main antenna → vehicle CoG (example — measure on your airframe)", note: "Main antenna fore/aft offset from the center of gravity in meters (positive = in front of CoG). Example for the Figure 1 layout: +0.25 m" }
  - { name: GPS1_POS_Y, value: "0.00", section: "Position offset · ANT1 main antenna → vehicle CoG (example — measure on your airframe)", note: "Lateral offset (positive = to the right of CoG)" }
  - { name: GPS1_POS_Z, value: "-0.10", section: "Position offset · ANT1 main antenna → vehicle CoG (example — measure on your airframe)", note: "Vertical offset (positive = below CoG). Example: antenna 0.10 m above the CoG → −0.10 m" }
configNotes: |
  Recommended layout (Figure 1) is the same as AP-RTK dual: ANT1 (main) at the front, ANT2 (aux) at the rear, both on the airframe centerline at equal height, baseline parallel to the flight direction, 500 mm (0.50 m) apart. Parameter names follow ArduPilot 4.6+.

  1. Wiring — Connect the module's CAN port to the autopilot CAN1 port with the supplied cable (Figure 1). The module is powered from the same connector (4.7–5.2 V).
  2. Antenna mounting — Mount ANT1 (main) toward the nose and ANT2 (aux) toward the tail on the centerline, ≥ 500 mm apart at equal height with clear sky view. Use two antennas of the same type with cables of the same length (the receiver requires the two antenna gains within 5 dB). A longer baseline gives a more accurate heading.
  3. Heading offsets — The heading is computed inside the receiver and on the GNSS node, so the moving-baseline parameters (GPS1_MB_TYPE = 2, GPS1_MB_OFS_X/Y/Z) are set on the node itself (Mission Planner → DroneCAN → AP-RTK G5H → Parameters) and ship pre-set for the 0.50 m layout. Set GPS1_MB_OFS_X to the separation you actually measured (in meters) and reboot the node. The autopilot's own GPS1_MB_* parameters stay at their defaults.
  4. Heading check — In Mission Planner's flight data screen watch the gpsyaw value: rotate the airframe and confirm the heading follows. The onboard RM3100 compass is detected automatically over DroneCAN and serves as fallback (EK3_SRC1_YAW = 3). Heading appears once the receiver has fixed the antenna baseline (typically well under a minute with clear sky); no RTK corrections are needed for the heading itself.
  5. RTK corrections — Inject RTCM 3.x corrections from an RTK base station or an NTRIP (CORS) service via the ground station. Wait for the GPS status to reach RTK Fixed for centimeter-level positioning.
  6. Antenna position offset — Measure the ANT1 (main) antenna position relative to the vehicle's center of gravity and enter it in GPS1_POS_X/Y/Z on the autopilot: +X forward, +Y right, +Z below the CoG. The table values (0.25 / 0.00 / −0.10) are only an example for the Figure 1 layout.
  7. Receiver service — Receiver configuration and Septentrio firmware upgrades are done with RxTools over the UART connector (receiver COM2, up to 4 Mbit/s). The USB-C port is the MCU's bootloader/DFU port, not the receiver.
---
