#!/bin/bash
# =============================================================================
# CMS - Installation Script for Debian Server
# Run directly from your project directory (e.g. /root/project2):
# cd /root/project2/scripts && bash install.sh
# =============================================================================

set -euo pipefail

APP_NAME="CMS"
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DB_NAME="cms_db"
DB_USER="cms_user"
API_PORT="8001"
WEB_PORT="8080"
NODE_VERSION="20"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

log()     { echo -e "${GREEN}[$(date '+%H:%M:%S')] ✔ $*${NC}"; }
info()    { echo -e "${BLUE}[$(date '+%H:%M:%S')] ℹ $*${NC}"; }
warn()    { echo -e "${YELLOW}[$(date '+%H:%M:%S')] ⚠ $*${NC}"; }
error()   { echo -e "${RED}[$(date '+%H:%M:%S')] ✘ $*${NC}" >&2; }
step()    { echo -e "\n${BOLD}${CYAN}══════════════════════════════════════════${NC}"; \
            echo -e "${BOLD}${CYAN}  $*${NC}"; \
            echo -e "${BOLD}${CYAN}══════════════════════════════════════════${NC}"; }
die()     { error "$*"; exit 1; }

trap 'error "Installation failed at line $LINENO. Check output above."; exit 1' ERR

gen_password() {
    openssl rand -hex 16
}

# =============================================================================
# STEP 0: Pre-flight checks
# =============================================================================
step "Step 0: Pre-flight Checks"

if [[ $EUID -ne 0 ]]; then
    die "This script must be run as root. Run with: sudo bash install.sh"
fi

if [[ -f /etc/os-release ]]; then
    source /etc/os-release
    log "Operating System detected: $PRETTY_NAME"
fi

info "Project directory: $APP_DIR"
if [[ ! -f "$APP_DIR/backend/requirements.txt" ]] || [[ ! -f "$APP_DIR/frontend/package.json" ]]; then
    die "Source files incomplete in $APP_DIR. Ensure backend and frontend are present."
fi

log "Pre-flight checks passed."

# =============================================================================
# STEP 1: Install System Dependencies
# =============================================================================
step "Step 1: Installing System Dependencies"

export DEBIAN_FRONTEND=noninteractive
info "Updating apt packages..."
apt-get update -qq

info "Installing base dependencies..."
apt-get install -y -qq \
    curl \
    wget \
    git \
    rsync \
    gnupg \
    ca-certificates \
    build-essential \
    postgresql \
    postgresql-contrib \
    python3 \
    python3-pip \
    python3-venv \
    python3-dev \
    libpq-dev \
    nginx \
    openssl

log "System packages installed."

# Node.js check
if ! command -v node &>/dev/null || [[ "$(node -v | cut -d. -f1 | tr -d 'v')" -lt 18 ]]; then
    info "Installing Node.js LTS via NodeSource..."
    curl -fsSL "https://deb.nodesource.com/setup_${NODE_VERSION}.x" -o /tmp/nodesource_setup.sh
    bash /tmp/nodesource_setup.sh >/dev/null 2>&1
    apt-get install -y -qq nodejs
    log "Node.js $(node -v) installed."
else
    log "Node.js $(node -v) already present."
fi

# =============================================================================
# STEP 2: Setting Up Subdirectories in Project Folder
# =============================================================================
step "Step 2: Preparing Subdirectories ($APP_DIR)"

mkdir -p "$APP_DIR/secrets" "$APP_DIR/logs" "$APP_DIR/backups"
chmod 750 "$APP_DIR/secrets" "$APP_DIR/logs" "$APP_DIR/backups"
log "Project subdirectories verified in $APP_DIR."

# =============================================================================
# STEP 3: Setup PostgreSQL (cms_db)
# =============================================================================
step "Step 3: Setting Up PostgreSQL Database ($DB_NAME)"

systemctl start postgresql 2>/dev/null || service postgresql start 2>/dev/null || true
systemctl enable postgresql 2>/dev/null || true

for i in {1..10}; do
    if sudo -u postgres psql -c '\q' 2>/dev/null; then
        break
    fi
    sleep 1
done

if [[ -f "$APP_DIR/secrets/db.pass" ]]; then
    DB_PASS=$(cat "$APP_DIR/secrets/db.pass")
    info "Reusing existing database password."
else
    DB_PASS=$(gen_password)
    echo "$DB_PASS" > "$APP_DIR/secrets/db.pass"
    chmod 600 "$APP_DIR/secrets/db.pass"
    info "Generated new secure password for database user '$DB_USER'."
fi

sudo -u postgres psql <<-EOSQL
    DO \$\$
    BEGIN
        IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '$DB_USER') THEN
            CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';
        ELSE
            ALTER USER $DB_USER WITH PASSWORD '$DB_PASS';
        END IF;
    END
    \$\$;
EOSQL

if ! sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    info "Creating database '$DB_NAME'..."
    sudo -u postgres createdb -O "$DB_USER" "$DB_NAME"
    log "Database '$DB_NAME' created."
else
    log "Database '$DB_NAME' already exists."
fi

# =============================================================================
# STEP 4: Python Backend & Virtualenv Setup
# =============================================================================
step "Step 4: Setting Up Python Virtual Environment"

cd "$APP_DIR/backend"

if [[ ! -d "venv" ]]; then
    info "Creating Python virtualenv..."
    python3 -m venv venv
fi

info "Installing Python dependencies..."
./venv/bin/pip install --upgrade pip -q
./venv/bin/pip install -r requirements.txt -q
./venv/bin/pip install "psycopg[binary]" psycopg2-binary -q

SECRET_KEY=$(gen_password)$(gen_password)
cat > "$APP_DIR/backend/.env" <<EOF
DATABASE_URL=postgresql+psycopg2://${DB_USER}:${DB_PASS}@127.0.0.1:5432/${DB_NAME}
SECRET_KEY=${SECRET_KEY}
PORT=${API_PORT}
CORS_ORIGINS=["*"]
EOF
chmod 600 "$APP_DIR/backend/.env"
log "Backend configuration written to .env."

info "Initializing database schema & seeding clean database..."
./venv/bin/python3 init_db.py
log "Database tables and Super Admin created."

# =============================================================================
# STEP 5: Frontend Build
# =============================================================================
step "Step 5: Building Frontend Application"

cd "$APP_DIR/frontend"

# Check if production dist bundle is already present
if [[ -f "$APP_DIR/frontend/dist/index.html" ]]; then
    log "Frontend production build already present at $APP_DIR/frontend/dist."
else
    info "Installing frontend npm dependencies cleanly..."
    rm -rf node_modules
    npm install
    info "Compiling frontend production bundle..."
    npx vite build
    log "Frontend build generated at $APP_DIR/frontend/dist."
fi

# =============================================================================
# STEP 6: Systemd Service Setup
# =============================================================================
step "Step 6: Setting Up Systemd Service (cms-backend)"

cat > /etc/systemd/system/cms-backend.service <<EOF
[Unit]
Description=CMS Backend API (FastAPI)
After=network.target postgresql.service
Wants=postgresql.service

[Service]
Type=simple
User=root
WorkingDirectory=${APP_DIR}/backend
EnvironmentFile=${APP_DIR}/backend/.env
Environment=PYTHONUNBUFFERED=1
ExecStart=${APP_DIR}/backend/venv/bin/uvicorn app.main:app --host 127.0.0.1 --port ${API_PORT} --workers 2
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal
SyslogIdentifier=cms-backend

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable cms-backend
systemctl restart cms-backend

sleep 2
if systemctl is-active --quiet cms-backend; then
    log "Service cms-backend is running successfully."
else
    error "Service cms-backend failed to start. Logs:"
    journalctl -u cms-backend -n 20 --no-pager
    exit 1
fi

# =============================================================================
# STEP 7: Nginx Web Server Setup (Port 8080)
# =============================================================================
step "Step 7: Configuring Nginx Reverse Proxy (Port $WEB_PORT)"

# Create rate-limit zone in http context
cat > /etc/nginx/conf.d/cms-rate-limit.conf <<EOF
limit_req_zone \$binary_remote_addr zone=cms_login_zone:10m rate=5r/m;
EOF

cat > /etc/nginx/sites-available/cms <<EOF
server {
    listen ${WEB_PORT};
    server_name _;

    root ${APP_DIR}/frontend/dist;
    index index.html;

    client_max_body_size 50M;

    # Security Headers (Hardened)
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;

    location / {
        try_files \$uri \$uri/ /index.html;
        expires 1h;
        add_header Cache-Control "public, no-cache";
    }

    # Login Rate Limiting (Mitigate Brute Force)
    location /api/auth/login {
        limit_req zone=cms_login_zone burst=5 nodelay;
        proxy_pass http://127.0.0.1:${API_PORT};
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:${API_PORT};
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    access_log /var/log/nginx/cms-access.log;
    error_log /var/log/nginx/cms-error.log;
}
EOF

ln -sf /etc/nginx/sites-available/cms /etc/nginx/sites-enabled/cms

nginx -t
systemctl reload nginx
log "Nginx reloaded successfully on port $WEB_PORT with security headers & rate limiting."

# =============================================================================
# SUMMARY
# =============================================================================
SERVER_IP=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "IP_SERVER")

step "🎉 INSTALASI SELESAI DENGAN SUKSES!"

echo -e "${BOLD}${GREEN}Aplikasi CMS siap digunakan di jaringan lokal:${NC}"
echo -e ""
echo -e "  🌐 Web URL         : ${BOLD}${CYAN}http://${SERVER_IP}:${WEB_PORT}${NC}"
echo -e "  ⚙️ Backend API     : ${BOLD}http://${SERVER_IP}:${API_PORT}/api/${NC}"
echo -e ""
echo -e "  🔑 Login Admin     : ${BOLD}admin@ctso.net${NC}"
echo -e "  🔒 Password        : ${BOLD}admin${NC}"
echo -e "  💾 Database        : PostgreSQL (${DB_NAME}) - Clean / Kosong"
echo -e ""
echo -e "  📂 Lokasi Project  : ${APP_DIR}"
echo -e "  📊 Cek Service     : systemctl status cms-backend"
echo -e "  📜 Log Backend     : journalctl -u cms-backend -f"
echo -e "═══════════════════════════════════════════════════════════════"
