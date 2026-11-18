#!/bin/bash
# Backup CMS PostgreSQL Database
set -euo pipefail

BACKUP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/backups"
DB_NAME="cms_db"
TIMESTAMP=$(date '+%Y%m%d_%H%M%S')
BACKUP_FILE="${BACKUP_DIR}/cms_backup_${TIMESTAMP}.sql.gz"

mkdir -p "$BACKUP_DIR"
echo "[INFO] Starting database backup: $BACKUP_FILE"
sudo -u postgres pg_dump -d "$DB_NAME" | gzip > "$BACKUP_FILE"
chmod 600 "$BACKUP_FILE"
echo "[SUCCESS] Backup completed successfully: $BACKUP_FILE"

# Keep last 30 days
find "$BACKUP_DIR" -name "cms_backup_*.sql.gz" -mtime +30 -delete
