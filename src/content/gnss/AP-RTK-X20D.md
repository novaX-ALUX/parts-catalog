---
name: AP-RTK X20D
tagline: Dual-Antenna RTK GNSS with u-blox ZED-X20D
image: /images/products/gnss_AP-RTK-X20D_R3_top_isometric.png
order: 22
specs:
  - { key: Receiver, value: "u-blox ZED-X20D — single module, dual antenna, HDG 2.00" }
  - { key: GNSS Bands, value: "All-band GNSS on both antennas (L1 / L2 / L5 / L6)" }
  - { key: MCU, value: "STM32F412Rx, ARM Cortex-M4, 512 KB flash" }
  - { key: Compass, value: "PNI RM3100 on I2C3 — axis qualification pending" }
  - { key: Heading, value: "Receiver-computed ANT1-to-ANT2 heading; UBX-NAV-DAHEADING v2" }
  - { key: Update Rate, value: "Firmware requests 5 Hz navigation at 230400 baud; end-to-end CAN rate requires measurement" }
  - { key: Comm. Protocol, value: "DroneCAN — position, ardupilot.gnss.Heading and separate magnetometer data" }
  - { key: I/O Ports, value: "2× MMCX antenna · CAN · USB-C (MCU) · external receiver UART" }
  - { key: PCB, value: "R3 · 33.00 × 45.17 mm · 4 layers · 0.8 mm" }
  - { key: Firmware, value: "AP_Periph · novaX 1.0.1 engineering release · board ID 6205" }
  - { key: Validation Status, value: "Windows GCC 10.2.1 build verified; first-article hardware and flight qualification pending" }
description: |
  AP-RTK X20D uses one u-blox ZED-X20D all-band receiver and two antennas for RTK positioning and heading. The STM32 forwards the receiver's position and heading plus separate RM3100 compass measurements over DroneCAN to the flight controller; yaw fusion belongs to the flight controller, not the peripheral MCU. Images show the actual R3 PCB CAD model, not a finished enclosure. Firmware 1.0.1 is supplied for engineering evaluation, not as production or flight-qualified firmware.
pinoutImages:
  - /images/products/gnss_AP-RTK-X20D_R3_top.png
  - /images/products/gnss_AP-RTK-X20D_R3_bottom.png
pinoutNotes: |
  R3 PCB connector-location renders, top and bottom. USB-C connects to STM32F412 OTG_FS for MCU service / bootloader / DFU; it is not the ZED-X20D USB port. The receiver communicates with the MCU through USART2 (GPS port index 4). PC6/PC7 external UART MCU TX/monitor is not implemented in v1.0.1. Use the R3 schematic to verify connector pin numbering and supply before first power-on; do not infer the pinout from AP-RTK dual or G5H.
firmware:
  - kind: "AP_Periph (DroneCAN OTA)"
    file: /firmware/gnss/AP-RTK-X20D/AP-RTK_X20D-v1.0.1.bin
    version: "1.0.1"
    date: "2026-09-07"
    size: "196 KB"
    sha256: "d83dacf71278302587b3fc6e42c9c7e2d5eeab3d308bc7dc85302b4e9407f452"
    notes: "Application binary for DroneCAN OTA. Bench update and recovery qualification is pending."
  - kind: "AP_Periph (.apj package)"
    file: /firmware/gnss/AP-RTK-X20D/AP-RTK_X20D-v1.0.1.apj
    version: "1.0.1"
    date: "2026-09-07"
    size: "197 KB"
    sha256: "e896e08ee87b92bc930ebd737ad5196fe2973cf6ef569962d2d067d2c94d21e0"
    notes: "Board ID 6205 application package for ArduPilot-compatible uploaders over the MCU USB bootloader. Not offered in this catalog's Web Updater."
  - kind: "Bootloader + App (merged HEX)"
    file: /firmware/gnss/AP-RTK-X20D/AP-RTK_X20D-v1.0.1_with_bl.hex
    version: "1.0.1"
    date: "2026-09-07"
    size: "714 KB"
    sha256: "2c843e66707e2843c5364f9f82a821954192b20ba6020b3f252d686b97733b36"
    notes: "First-article SWD / STM32 ROM USB DFU image at 0x08000000. Raw DFU/SWD does not enforce board ID; verify X20D R3 hardware before programming."
  - kind: "Release verification (JSON)"
    file: /firmware/gnss/AP-RTK-X20D/AP-RTK_X20D-v1.0.1-verification.json
    version: "1.0.1"
    date: "2026-09-07"
    size: "3 KB"
    sha256: "a2f054d1672cd6afc6fc220d10d97b8a3e8b9735e764ee4c6daa8bc4a12311eb"
    notes: "File sizes and SHA-256 hashes, committed source and patch validation, binary/HEX consistency and Windows build tool provenance. Not a flashable image."
firmwareNotes: |
  v1.0.1 is an engineering release, not hardware/flight approval. Native Windows GCC 10.2.1 build (Cygwin, no WSL). Product firmware string: novaX AP-RTK X20D v1.0.1; upstream AP_Periph numeric version remains 1.8.0-dev, so DroneCAN GetNodeInfo major/minor can show 1.8. Board ID 6205; never substitute dual (1085) or G5H (6206) images. Raw DFU/SWD does not enforce board ID. Downloads are available here without access to the private GNSS source repository. Live GNSS, heading, compass axes and USB/DFU/CAN update/recovery still need first-article testing. The catalog Web Updater is not enabled for this unqualified target.
configParams:
  - { name: CAN_P1_DRIVER, value: "1", section: "AF-H7E flight controller — DroneCAN and EKF3", note: "Enable CAN1; reboot after changes" }
  - { name: CAN_D1_PROTOCOL, value: "1", section: "AF-H7E flight controller — DroneCAN and EKF3", note: "DroneCAN" }
  - { name: GPS1_TYPE, value: "9", section: "AF-H7E flight controller — DroneCAN and EKF3", note: "DroneCAN GPS (GPS_TYPE on older firmware)" }
  - { name: GPS1_MB_TYPE, value: "0", section: "AF-H7E flight controller — DroneCAN and EKF3", note: "No moving-baseline offset conversion; receiver already supplies forward heading" }
  - { name: AHRS_EKF_TYPE, value: "3", section: "AF-H7E flight controller — DroneCAN and EKF3", note: "Use EKF3" }
  - { name: EK3_ENABLE, value: "1", section: "AF-H7E flight controller — DroneCAN and EKF3", note: "Enable EKF3" }
  - { name: EK3_SRC1_YAW, value: "2", section: "AF-H7E flight controller — DroneCAN and EKF3", note: "GPS yaw; use 3 for compass fallback only after the RM3100 axes and calibration have been qualified" }
configNotes: |
  1. Antenna direction — ANT1 / RF_IN_1 at the rear; ANT2 / RF_IN_2 at the front. The receiver reports the ANT1-to-ANT2 vector, so the firmware sets CFG-NAVSPG-DAHEADING_OFFSET to 0. Keep antennas on the centerline at equal height and measure the baseline. This direction is opposite to the AP-RTK dual artwork; swapping cables produces a 180° heading error.
  2. H7E connection — Use DroneCAN and the flight-controller parameters above. X20D needs only its AP_Periph image; no X20D-specific H7E firmware rebuild is required. Do not copy G5H GPS1_MB_* offsets onto this node.
  3. Position offset — Measure ANT1 relative to the vehicle center of gravity and enter GPS1_POS_X/Y/Z on H7E (+X forward, +Y right, +Z down). Do not reuse example offsets without measurement.
  4. First-article checks — Confirm factory receiver startup, RTK corrections, live position, yaw at known headings, loss/reacquisition, RM3100 axes, power and all update/recovery paths on a bench before any flight use.
  5. Receiver reference — u-blox ZED-X20D official product information: https://www.u-blox.com/en/product/zed-x20d-module
gallery:
  - /images/products/gnss_AP-RTK-X20D_R3_top_isometric.png
  - /images/products/gnss_AP-RTK-X20D_R3_bottom_isometric.png
  - /images/products/gnss_AP-RTK-X20D_R3_top.png
  - /images/products/gnss_AP-RTK-X20D_R3_bottom.png
---
