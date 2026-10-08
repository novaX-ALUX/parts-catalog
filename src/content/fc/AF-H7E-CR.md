---
name: AF-H7E CR
tagline: Secure-Boot Firmware for AF-H7E · Coastal Reconnaissance
image: /images/products/fc_CUAV_V6X.jpg
pictureKey: fc_CUAV_V6X
order: 42
hidden: true   # 이사님 2026-10-08: 제품으로는 공개하지 않고 펌웨어만 (update 탭 목록은 유지)
specs:
  - key: Hardware
    value: AF-H7E — same boards, connectors, pinout and dimensions (see the AF-H7E page)
  - key: MCU
    value: STM32H753, ARM Cortex-M7, 480 MHz
  - key: Secure Boot
    value: The bootloader checks the firmware signature on every power-up and every upload (EdDSA, Curve25519 + BLAKE2b); only novaX-signed firmware runs
  - key: Signing Key
    value: novaX key only (the ArduPilot public keys are left out)
  - key: Rejected Firmware
    value: Unsigned, modified (even a single byte) or signed with another key — the upload tool reports the failure and the board stays in the bootloader; uploading the genuine firmware again restores it
  - key: Supported F/W
    value: novaX ArduPilot Plane (VTOL / QuadPlane)
  - key: Board ID
    value: 6202 (same as AF-H7E)
  - key: USB
    value: Same as AF-H7E (MAVLink + SLCAN); USB name AF-H7E-CR, bootloader AF-H7E-CR-Secure-BL-v10
  - key: Disabled Update Paths
    value: DFU entry from the flight firmware, firmware from the SD card
description: AF-H7E CR (Coastal Reconnaissance) is the secure-boot firmware for the AF-H7E flight controller. The hardware is the AF-H7E unchanged; its bootloader is replaced by a secure bootloader that holds only the novaX public key and verifies the signature of the flight firmware every time the board powers up and every time firmware is uploaded, so only firmware signed by novaX runs. An unsigned image, an image with even one byte changed, or an image signed with any other key is refused — the upload tool reports the failure and the board stays in the bootloader until the genuine signed firmware is uploaded again. USB works as on the AF-H7E; entering DFU from the flight firmware and loading firmware from the SD card are disabled, so the signed upload is the only way in. Pinout, connectors and specifications are those of the AF-H7E.
firmware:
  - kind: "ArduPilot Plane (.apj package, signed)"
    file: /firmware/AF-H7E_CR-v1.0.1-Plane.apj
    version: "1.0.1"
    date: "2026-10-08"
    size: "1.7 MB"
    sha256: "86f1234136108302ff6ec32f1abf12e1428c236cd720fc180aa9612a8a340b01"
    notes: "Signed ArduPilot Plane (VTOL) app for a board that already runs the AF-H7E CR secure bootloader. v1.0.1 fixes CVE-2026-38971 (SERIAL_CONTROL write length, upstream PR #32587). Upload over USB with Mission Planner or the catalog Web Updater -> Firmware Update, like the AF-H7E. Any unsigned or modified image is refused with a failure message."
    method: ardupilot
    webPath: /firmware/AF-H7E_CR-v1.0.1-Plane.apj
  - kind: "ArduPilot Plane - Secure Bootloader + App (merged HEX / DFU / SWD)"
    file: /firmware/AF-H7E_CR-v1.0.1-Plane_with_bl.hex
    version: "1.0.1"
    date: "2026-10-08"
    size: "5.5 MB"
    sha256: "0682f1144e67acb4f289d66eb7dde67cb683c680e2337237caf507c0985a500f"
    notes: "Turns a standard AF-H7E into an AF-H7E CR once: secure bootloader + signed app based at 0x08000000. While the board still runs the standard AF-H7E firmware, use the catalog Web Updater -> DFU Recovery, click Enter DFU, then flash this file. Unplug and re-plug USB afterwards; if the board comes back as the STM32 DFU device instead of AF-H7E-CR, restore the boot address with STM32CubeProgrammer (STM32_Programmer_CLI -c port=USB1 -ob BOOT_CM7_ADD0=0x0800) and re-plug. Once converted, DFU is refused, so later updates use the signed .apj. A blank board is flashed via SWD/ST-Link."
    method: dfu
    webPath: /firmware/AF-H7E_CR-v1.0.1-Plane_with_bl.hex
firmwareNotes: 'AF-H7E CR runs only firmware signed by novaX. Update over USB-C like the AF-H7E: open the catalog Web Updater, stay on Firmware Update, click Connect, pick the AF-H7E CR .apj, then Update firmware. The first conversion of a standard AF-H7E uses DFU Recovery with the _with_bl.hex (see its notes); after that, DFU from the firmware is refused by design. Copter images and standard AF-H7E images do not run on an AF-H7E CR.'
configNotes: ''
---
