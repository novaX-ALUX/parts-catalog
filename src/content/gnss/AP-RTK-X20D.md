---
name: AP-RTK X20D
tagline: Dual-Antenna RTK GNSS with u-blox ZED-X20D
image: /images/products/gnss_AP-RTK-X20D.png
order: 22
manuals:
  - { label: "한국어", file: /manuals/gnss_AP-RTK-X20D_manual_ko.pdf }
  - { label: English, file: /manuals/gnss_AP-RTK-X20D_manual_en.pdf }
comingSoon: true
specs:
  - { key: Receiver, value: "u-blox ZED-X20D — single module, dual antenna, HDG 2.00" }
  - { key: GNSS Bands, value: "All-band GNSS on both antennas (L1 / L2 / L5 / L6)" }
  - { key: MCU, value: "STM32F412Rx, ARM Cortex-M4, 512 KB flash" }
  - { key: Compass, value: "PNI RM3100 on I2C3 — axis qualification pending" }
  - { key: Heading, value: "Receiver ANT1-to-ANT2 baseline (UBX-NAV-DAHEADING v2) sent as RelPosHeading; the autopilot computes heading with GPS1_MB_OFS as for AP-RTK dual (firmware v1.0.6+)" }
  - { key: Update Rate, value: "Firmware requests 5 Hz navigation at 230400 baud; end-to-end CAN rate requires measurement" }
  - { key: Comm. Protocol, value: "DroneCAN — position, ardupilot.gnss.RelPosHeading (v1.0.6+) and separate magnetometer data" }
  - { key: I/O Ports, value: "2× MMCX antenna · CAN · UART (RTCM input) · DEBUG (SWD + console) · PPS/EVENT · USB-C (MCU)" }
  - { key: PCB, value: "R3 · 33.00 × 45.17 mm · 4 layers · 0.8 mm" }
  - { key: Firmware, value: "AP_Periph · novaX 1.0.6 engineering release · board ID 6205" }
  - { key: Validation Status, value: "Bench hardware checks passed 2026-09-22 (230400 save, USB and CAN update, heading through the flight controller); outdoor RTK and flight qualification pending" }
description: |
  AP-RTK X20D uses one u-blox ZED-X20D all-band receiver and two antennas for RTK positioning and heading. The STM32 forwards the receiver's position and heading plus separate RM3100 compass measurements over DroneCAN to the flight controller; yaw fusion belongs to the flight controller, not the peripheral MCU. Product images are renders of the enclosure design fitted with the R3 PCB, with engraved port and LED names; the gallery also shows the R3 PCB CAD renders. Firmware 1.0.6 is supplied for engineering evaluation, not as production or flight-qualified firmware.
pinoutImage: /images/products/gnss_AP-RTK-X20D_pinout.png
pinoutNotes: '① UART (5V · RX · TX · GND) · ② CAN (5V · CAN_H · CAN_L · GND) · ③ DEBUG (GND · TX · RX · SWCLK · SWDIO · 5V) · ④ PPS (PPS · GND · EVENT · GND) · ANT1 · ANT2 (MMCX).'
firmware:
  - kind: "AP_Periph (DroneCAN update)"
    file: /firmware/gnss/AP-RTK-X20D/AP-RTK_X20D-v1.0.6.bin
    version: "1.0.6"
    date: "2026-09-22"
    size: "202 KB"
    sha256: "a3cebac9e31272eb0211065c70c1568d9af6bc13549abb8e1cc6bc519ed315b1"
    notes: "Application binary for a DroneCAN update. Bench: 202 KB in about 50 s through the flight controller's SLCAN port (Mission Planner SLCAN → Update firmware)."
  - kind: "AP_Periph (.apj package)"
    file: /firmware/gnss/AP-RTK-X20D/AP-RTK_X20D-v1.0.6.apj
    version: "1.0.6"
    date: "2026-09-22"
    size: "202 KB"
    sha256: "cb5dd563e7402711ab647a65e19e84fa42de9965196d94ab82c38868ed6d35b8"
    notes: "Board ID 6205 application package for the catalog Web Updater → Firmware Update, or any ArduPilot-compatible uploader, over the X20D USB-C port (bench: about 6 s). The peripheral answers the MAVLink reboot-to-bootloader command, so no button is needed."
    method: ardupilot
    webPath: /firmware/gnss/AP-RTK-X20D/AP-RTK_X20D-v1.0.6.apj
  - kind: "Bootloader + App (merged HEX)"
    file: /firmware/gnss/AP-RTK-X20D/AP-RTK_X20D-v1.0.6_with_bl.hex
    version: "1.0.6"
    date: "2026-09-22"
    size: "731 KB"
    sha256: "2ead38ac0865ab67d1c5db27fcaf67ccad5aa4f86a657feb463f38429619d5de"
    notes: "First-article image at 0x08000000 with the v1.0.5 bootloader, for the catalog Web Updater → DFU Recovery (🛠 Enter DFU works buttonless on this board) or SWD/ST-Link on a blank board. Raw DFU/SWD does not enforce board ID; verify X20D R3 hardware before programming."
    method: dfu
    webPath: /firmware/gnss/AP-RTK-X20D/AP-RTK_X20D-v1.0.6_with_bl.hex
  - kind: "Release verification (JSON)"
    file: /firmware/gnss/AP-RTK-X20D/AP-RTK_X20D-v1.0.6-verification.json
    version: "1.0.6"
    date: "2026-09-22"
    size: "8 KB"
    sha256: "11fac41410e6fc7a6ee122c8e07fc1bfe923e2c9c17c8a7c2980d34169fd2460"
    notes: "File sizes and SHA-256 hashes, source patches, bench results (heading through the flight controller moving-baseline path) and Windows build provenance. Not a flashable image."
firmwareNotes: |
  v1.0.6 is an engineering release, not hardware/flight approval. Heading works like AP-RTK dual: the X20D sends its ANT1 → ANT2 baseline (RelPosHeading) and the autopilot computes the heading from GPS1_MB_OFS — see Configuration (ANT1 front, the AP-RTK dual parameters). Earlier versions (v1.0.5 and before) reported heading with ANT1 at the rear. The receiver is moved to 230400 baud once and saved; boards with an older bootloader get the new one from Mission Planner's bootloader update over the X20D USB port. Native Windows GCC 10.2.1 build (Cygwin, no WSL). Product firmware string: novaX AP-RTK X20D v1.0.6; the upstream AP_Periph numeric version remains 1.8.0-dev, so DroneCAN GetNodeInfo can show 1.8. Board ID 6205; never substitute dual (1085) or G5H (6206) images. Raw DFU/SWD does not enforce board ID. Release history and source patches: https://github.com/novaX-ALUX/gnss/releases/tag/AP-RTK_X20D-v1.0.6. Outdoor RTK fixed, compass fallback and flight are not yet verified. The catalog Web Updater is enabled for this target over the USB-C port: Firmware Update takes the .apj (bench 2026-09-22: MAVLink reboot to bootloader, program, CRC match, 40 parameters preserved) and DFU Recovery takes the merged .hex (bench: buttonless 🛠 Enter DFU reached 0483:DF11 in 2.1 s, then erase, write and verify). A DroneCAN update with the .bin over the flight controller's SLCAN port stays the field path (about 46 s).
configImages:
  - { src: /images/products/gnss_AP-RTK-X20D_antenna-setup.png, caption: "Antenna placement & wiring — Master (ANT1) front, Slave (ANT2) rear, ≥ 500 mm apart" }
  - { src: /images/products/gnss_AP-RTK-dual_offset-convention.png, caption: "Moving-baseline offset sign convention (X / Y / Z)" }
configParams:
  - { name: CAN_P1_DRIVER, value: "1", section: "DroneCAN connection & heading", note: "Enable the autopilot (H7E) CAN1 port (reboot required after change)" }
  - { name: CAN_D1_PROTOCOL, value: "1", section: "DroneCAN connection & heading", note: "DroneCAN protocol on the CAN1 driver" }
  - { name: GPS1_TYPE, value: "9", section: "DroneCAN connection & heading", note: "DroneCAN GPS. On firmware older than 4.6 the parameter is GPS_TYPE = 9" }
  - { name: GPS_AUTO_CONFIG, value: "2", section: "DroneCAN connection & heading", note: "Automatically configure the DroneCAN GPS" }
  - { name: GPS1_MB_TYPE, value: "1", section: "DroneCAN connection & heading", note: "Enable dual-antenna moving baseline (unlocks the offsets below). Pre-4.6: GPS_MB1_TYPE = 1" }
  - { name: GPS1_MB_OFS_X, value: "0.50", section: "DroneCAN connection & heading", note: "Master(ANT1) is 0.50 m in front of Slave(ANT2) → +0.50 (positive = Master in front). Set to your measured separation. Pre-4.6: GPS_MB1_OFS_X" }
  - { name: GPS1_MB_OFS_Y, value: "0", section: "DroneCAN connection & heading", note: "0 on the centerline (positive = Master to the right of Slave). Pre-4.6: GPS_MB1_OFS_Y" }
  - { name: GPS1_MB_OFS_Z, value: "0", section: "DroneCAN connection & heading", note: "0 at equal height (positive = Master below Slave). Pre-4.6: GPS_MB1_OFS_Z" }
  - { name: EK3_SRC1_YAW, value: "3", section: "DroneCAN connection & heading", note: "GPS yaw with compass fallback (use 2 for GPS-only yaw)" }
  - { name: AHRS_EKF_TYPE, value: "3", section: "DroneCAN connection & heading", note: "Heading works only when AHRS uses EKF3" }
  - { name: EK3_ENABLE, value: "1", section: "DroneCAN connection & heading", note: "Enable EKF3" }
  - { name: GPS1_POS_X, value: "0.25", section: "Position offset · Master antenna → vehicle CoG (example — measure on your airframe)", note: "Master antenna fore/aft offset from the center of gravity in meters (positive = in front of CoG). Example: with the CoG at the midpoint of the 500 mm baseline, the front Master antenna is half the baseline ahead → +0.25 m. Pre-4.6: GPS_POS1_X" }
  - { name: GPS1_POS_Y, value: "0.00", section: "Position offset · Master antenna → vehicle CoG (example — measure on your airframe)", note: "Lateral offset (positive = to the right of CoG). Example: the Master antenna sits on the airframe centerline (Figure 1), so 0. Pre-4.6: GPS_POS1_Y" }
  - { name: GPS1_POS_Z, value: "-0.10", section: "Position offset · Master antenna → vehicle CoG (example — measure on your airframe)", note: "Vertical offset (positive = below CoG). Example: the antenna is mounted 0.10 m above the CoG → −0.10 m. Pre-4.6: GPS_POS1_Z" }
configNotes: |
  Recommended layout (Figure 1): ANT1 Master at the front, ANT2 Slave at the rear, both on the airframe centerline at equal height, with the baseline parallel to the flight direction (heading). The example below uses a 500 mm (0.50 m) separation. Parameter names follow ArduPilot 4.6+ (GPS1_…); the equivalent pre-4.6 names are noted in each row. Layout and parameters are the same as AP-RTK dual from X20D firmware v1.0.6: the X20D sends its ANT1 → ANT2 baseline (RelPosHeading) and the autopilot computes the heading from the offsets below. X20D firmware v1.0.5 and earlier reports heading with ANT1 at the rear and ignores these offsets.

  1. Wiring — Connect the module's CAN port to the autopilot (H7E) CAN1 port with the supplied cable, as shown in Figure 1. The module is powered from the same connector (5 V).
  2. Antenna mounting — Following Figure 1, mount ANT1 (Master) toward the nose and ANT2 (Slave) toward the tail on the centerline. Connect the cables by the port names engraved on the case — on the X20D the ANT1 port is the other MMCX connector than on AP-RTK dual. Keep at least 500 mm between antennas at equal height with a clear, unobstructed sky view (avoid windows and obstructions). A longer baseline gives a more accurate heading.
  3. Offset parameters — Offsets run from the Slave to the Master antenna in body frame: +X = Master in front, +Y = Master to the right, +Z = Master below the Slave (see Figure 2 for the sign convention). For the recommended layout: GPS1_MB_OFS_X = 0.50, GPS1_MB_OFS_Y = 0, GPS1_MB_OFS_Z = 0. Set GPS1_MB_OFS_X to the separation you actually measured (in meters), then reboot the autopilot. If the offsets differ from the measured antenna separation by more than 20 %, the autopilot rejects the heading.
  4. Heading check — In Mission Planner's flight data screen watch the gpsyaw value: rotate the airframe and confirm the reported heading follows. The onboard RM3100 compass is detected automatically over DroneCAN and serves as fallback (EK3_SRC1_YAW = 3); calibrate it in Mission Planner.
  5. RTK corrections — Inject RTCM corrections from an RTK base station or an NTRIP (CORS) service via the ground station. Wait for the GPS status to reach RTK Fixed for centimeter-level positioning.
  6. Antenna position offset (Position offset table) — The X20D reports its position at ANT1. Measure the Master (ANT1) antenna position relative to the vehicle's center of gravity and enter it in GPS1_POS_X/Y/Z (pre-4.6: GPS_POS1_X/Y/Z): +X forward, +Y right, +Z below the CoG. The table values (0.25 / 0.00 / −0.10) are only an example for the Figure 1 layout — Master on the centerline, 0.25 m (half the 500 mm baseline) ahead of a CoG at the baseline midpoint, antenna 0.10 m above it — so measure your own airframe. This improves position accuracy and is independent of the heading offsets in step 3.
gallery:
  - /images/products/gnss_AP-RTK-X20D.png
  - /images/products/gnss_AP-RTK-X20D_ports.png
  - /images/products/gnss_AP-RTK-X20D_leds.png
  - /images/products/gnss_AP-RTK-X20D_R3_top_isometric.png
  - /images/products/gnss_AP-RTK-X20D_R3_bottom_isometric.png
  - /images/products/gnss_AP-RTK-X20D_R3_top.png
  - /images/products/gnss_AP-RTK-X20D_R3_bottom.png
---
