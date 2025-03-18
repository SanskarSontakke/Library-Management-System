#!/bin/bash

echo "🔧 Applying Raspberry Pi 3B Overclock (1350MHz)..."

# Backup existing config.txt just in case
sudo cp /boot/firmware/config.txt /boot/firmware/config_backup.txt

# Append overclock settings to config.txt
sudo bash -c 'cat <<EOF >> /boot/firmware/config.txt

# === Overclock Settings for Raspberry Pi 3B ===
arm_freq=1300
over_voltage=4
gpu_freq=500
sdram_freq=500
force_turbo=1
# =============================================
EOF'

echo "✅ Overclock settings added to /boot/firmware/config.txt"
echo "⚠️ Please ensure you have proper cooling (heatsink/fan) installed."
echo "🔁 Rebooting system to apply settings..."

sleep 3
sudo reboot
