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
    value: None while the flight firmware runs (from v1.0.3), so no ground station connects over USB; USB exists only in the secure bootloader for 10 s after plug-in (USB name AF-H7E-CR-Secure-BL-v10), for signed updates
  - key: Disabled Update Paths
    value: DFU entry from the flight firmware, firmware from the SD card
description: AF-H7E CR (Coastal Reconnaissance) is the secure-boot firmware for the AF-H7E flight controller. The hardware is the AF-H7E unchanged; its bootloader is replaced by a secure bootloader that holds only the novaX public key and verifies the signature of the flight firmware every time the board powers up and every time firmware is uploaded, so only firmware signed by novaX runs. An unsigned image, an image with even one byte changed, or an image signed with any other key is refused — the upload tool reports the failure and the board stays in the bootloader until the genuine signed firmware is uploaded again. From v1.0.3 the flight firmware has no USB at all — no ground station can connect over USB — and the secure bootloader keeps USB for 10 s after plug-in for signed updates; entering DFU from the flight firmware and loading firmware from the SD card are disabled, so the signed upload is the only way in. Pinout, connectors and specifications are those of the AF-H7E.
firmware:
  - kind: "ArduPilot Plane (.apj package, signed)"
    file: /firmware/AF-H7E_CR-v1.0.3-Plane.apj
    version: "1.0.3"
    date: "2026-10-14"
    size: "1.7 MB"
    sha256: "dc51e2ece21c380ccfb29dbabdcfd2211e83289f79bf1fda6bf02cfda035d802"
    notes: "Signed ArduPilot Plane (VTOL) app for a board that already runs the AF-H7E CR secure bootloader. v1.0.3: no USB in the flight firmware (no ground station over USB), bootloader USB window 10 s; includes the CVE-2026-38971 (SERIAL_CONTROL) and FatFs (CVE-2026-6682/6683/6686/6688) fixes. Update in the catalog Web Updater -> Firmware Update: pick this file, click ⏳ Update on plug-in, then unplug and re-plug USB. Any unsigned or modified image is refused with a failure message."
    method: ardupilot
    webPath: /firmware/AF-H7E_CR-v1.0.3-Plane.apj
  - kind: "ArduPilot Plane - Secure Bootloader + App (merged HEX / DFU / SWD)"
    file: /firmware/AF-H7E_CR-v1.0.3-Plane_with_bl.hex
    version: "1.0.3"
    date: "2026-10-14"
    size: "5.5 MB"
    sha256: "0f9ca8eb4b048c4a0b7d121f42550ec6579422addf9820c08c85dd3d7275de62"
    notes: "Turns a standard AF-H7E into an AF-H7E CR once: secure bootloader + signed app based at 0x08000000. While the board still runs the standard AF-H7E firmware, use the catalog Web Updater -> DFU Recovery, click Enter DFU, then flash this file. Unplug and re-plug USB afterwards; if the board comes back as the STM32 DFU device instead of AF-H7E-CR, restore the boot address with STM32CubeProgrammer (STM32_Programmer_CLI -c port=USB1 -ob BOOT_CM7_ADD0=0x0800) and re-plug. Once converted, DFU is refused, so later updates use the signed .apj. A blank board is flashed via SWD/ST-Link."
    method: dfu
    webPath: /firmware/AF-H7E_CR-v1.0.3-Plane_with_bl.hex
firmwareNotes: 'AF-H7E CR runs only firmware signed by novaX. From v1.0.3 the running board shows no USB port, so updates run in the secure bootloader during the 10 s after plug-in: open the catalog Web Updater, stay on Firmware Update, pick the AF-H7E CR .apj, click ⏳ Update on plug-in, then unplug and re-plug USB (the first time, pick "ArduPilot (COMxx)" in the popup right after plugging in). The first conversion of a standard AF-H7E uses DFU Recovery with the _with_bl.hex (see its notes); after that, DFU from the firmware is refused by design. Copter images and standard AF-H7E images do not run on an AF-H7E CR.'
configNotes: ''
---
