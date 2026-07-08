#!/usr/bin/env bash
# WSL2 USB/IP + DFU 셋업 — novaX 보드 시리얼(/dev/ttyACM*)·STM32 ROM DFU 접근용.
# 사전조건: Windows에 usbipd-win 설치 + 보드 attach (아래 README 주석 참고).
# 실행:  sudo bash repos/parts-catalog/tools/wsl_usb_setup.sh
set -euo pipefail

if [ "$(id -u)" -ne 0 ]; then
  echo "❌ sudo로 실행하세요:  sudo bash $0"; exit 1
fi
REAL_USER="${SUDO_USER:-$USER}"

echo "==> 1) apt 패키지 설치 (usbip 클라이언트 / dfu-util / pyusb / lsusb)"
apt-get update
apt-get install -y linux-tools-virtual hwdata dfu-util python3-usb usbutils

echo "==> 2) usbip 명령 등록 (실행 중인 WSL 커널 버전에 매칭)"
USBIP_BIN="$(ls /usr/lib/linux-tools/*/usbip 2>/dev/null | tail -n1 || true)"
if [ -n "$USBIP_BIN" ]; then
  update-alternatives --install /usr/local/bin/usbip usbip "$USBIP_BIN" 20
  echo "    usbip -> $USBIP_BIN"
else
  echo "    (경고) /usr/lib/linux-tools/*/usbip 없음 — linux-tools-virtual 설치 확인"
fi

echo "==> 3) vhci-hcd 커널 모듈 로드"
modprobe vhci-hcd && echo "    vhci-hcd 로드됨" || echo "    (경고) vhci-hcd 로드 실패"

echo "==> 4) udev 규칙: STM32 ROM DFU(0483:df11) + 시리얼 비루트 접근"
cat > /etc/udev/rules.d/49-novax-fc.rules <<'EOF'
# STM32 system DFU bootloader (ROM)
SUBSYSTEM=="usb", ATTRS{idVendor}=="0483", ATTRS{idProduct}=="df11", MODE="0666", TAG+="uaccess"
# ArduPilot/PX4 등 ACM 시리얼 (VID는 보드에 맞게 추가/수정)
SUBSYSTEM=="tty", ATTRS{idVendor}=="0483", MODE="0666"
SUBSYSTEM=="tty", ATTRS{idVendor}=="1209", MODE="0666"
EOF
udevadm control --reload-rules && udevadm trigger || true
echo "    /etc/udev/rules.d/49-novax-fc.rules 작성"

echo "==> 5) $REAL_USER 를 dialout 그룹에 추가 (시리얼 접근)"
usermod -aG dialout "$REAL_USER" || true

echo
echo "✅ WSL 쪽 셋업 완료."
echo "   - dialout 그룹 반영은 WSL 재시작 후 (Windows에서: wsl --shutdown)"
echo "   - 이제 Windows 관리자에서 usbipd attach → WSL에서 'lsusb'로 보드 확인"
