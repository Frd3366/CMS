#!/bin/bash
# Update CMS files and reload services without touching the database
set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "[INFO] Updating application in $APP_DIR..."

# Check if pre-built dist exists from local machine
if [ -d "$APP_DIR/frontend/dist" ] && [ -f "$APP_DIR/frontend/dist/index.html" ]; then
    echo "[INFO] Pre-built frontend bundle detected in $APP_DIR/frontend/dist."
    echo "[INFO] Skipping npm build to avoid external network/internet dependency."
else
    echo "[INFO] Building frontend bundle..."
    cd "$APP_DIR/frontend"
    npm run build
fi

echo "[INFO] Restarting backend service..."
systemctl restart cms-backend

echo "[INFO] Reloading Nginx..."
systemctl reload nginx

echo "[SUCCESS] CMS update completed and live at http://localhost:8080!"
