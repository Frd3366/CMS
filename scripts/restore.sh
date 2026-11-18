#!/bin/bash
# Restore CMS PostgreSQL Database from Backup
set -euo pipefail

if [[ $# -eq 0 ]]; then
    echo "Usage: sudo bash restore.sh /path/to/backup_file.sql.gz"
    exit 1
fi

BACKUP_FILE="$1"
DB_NAME="cms_db"

if [[ ! -f "$BACKUP_FILE" ]]; then
    echo "[ERROR] Backup file not found: $BACKUP_FILE"
    exit 1
fi

echo "[WARNING] This will restore $DB_NAME from $BACKUP_FILE and overwrite current data."
read -p "Are you sure? (y/N): " confirm
if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
    echo "Restore cancelled."
    exit 0
fi

echo "[INFO] Stopping CMS service..."
systemctl stop cms-backend || true

echo "[INFO] Restoring database..."
gunzip -c "$BACKUP_FILE" | sudo -u postgres psql -d "$DB_NAME"

echo "[INFO] Restarting CMS service..."
systemctl start cms-backend
echo "[SUCCESS] Restore finished successfully."
