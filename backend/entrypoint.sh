#!/bin/bash
set -e

echo "[CMS Backend] Waiting for database connection..."
python3 - << 'EOF'
import time
import os
import sys
from sqlalchemy import create_engine, text

db_url = os.getenv("DATABASE_URL", "postgresql://cms_user:cms_password@db:5432/cms_db")
max_tries = 30
for i in range(max_tries):
    try:
        engine = create_engine(db_url)
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("[CMS Backend] Database connection verified!")
        sys.exit(0)
    except Exception as e:
        print(f"[CMS Backend] Database not ready yet ({i+1}/{max_tries}). Waiting...")
        time.sleep(2)
sys.exit(1)
EOF

echo "[CMS Backend] Initializing database schema & initial setup..."
python3 init_db.py

echo "[CMS Backend] Starting FastAPI production server on port 8001..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8001
