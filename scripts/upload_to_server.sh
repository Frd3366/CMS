#!/bin/bash
# Script untuk upload update CMS dari laptop/mac ke server Debian
set -euo pipefail

if [ -z "${1:-}" ]; then
    echo "Usage: $0 <IP_SERVER_DEBIAN>"
    echo "Contoh: $0 192.168.1.100"
    exit 1
fi

SERVER_IP="$1"
LOCAL_DIR="/Users/ferdi/.gemini/antigravity/scratch/cms/"
TARGET_DIR="/root/project2/"

echo "=================================================="
echo "  MENGIRIM FILE UPDATE CMS KE SERVER: $SERVER_IP"
echo "=================================================="

# Pastikan bundle dist frontend sudah dibuild
if [ ! -d "${LOCAL_DIR}frontend/dist" ]; then
    echo "[INFO] Melakukan build frontend lokal terlebih dahulu..."
    cd "${LOCAL_DIR}frontend" && npm run build
fi

echo "[INFO] Mengirim file proyek (mengecualikan node_modules & venv lokal)..."
rsync -avz --progress \
    --exclude 'frontend/node_modules' \
    --exclude 'backend/venv' \
    --exclude '__pycache__' \
    --exclude '.git' \
    --exclude '.DS_Store' \
    "$LOCAL_DIR" "root@${SERVER_IP}:${TARGET_DIR}"

echo ""
echo "=================================================="
echo "  FILE BERHASIL DIUPLOAD KE SERVER!"
echo "=================================================="
echo "[INFO] Merestart service backend dan me-reload Nginx di server..."

if ssh -o BatchMode=yes -o ConnectTimeout=5 "root@${SERVER_IP}" "bash /root/project2/scripts/update_cms.sh" 2>/dev/null; then
    echo "=================================================="
    echo "  🎉 UPDATE SELESAI & CMS SUDAH LIVE!"
    echo "=================================================="
    echo "Akses di browser: http://${SERVER_IP}:8080"
else
    # Jika perlu input password SSH interaktif
    ssh -t "root@${SERVER_IP}" "bash /root/project2/scripts/update_cms.sh" || {
        echo ""
        echo "[INFO] Jika restart otomatis belum berjalan, jalankan manual di server:"
        echo "  ssh root@${SERVER_IP}"
        echo "  bash /root/project2/scripts/update_cms.sh"
    }
fi
