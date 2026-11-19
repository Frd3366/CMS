# CTSO Management System (CMS) — Enterprise Operational Platform

Platform manajemen operasional dan penjadwalan roster terpusat untuk tim **CTSO (Central Technical Service Operations)**.

---

## 🏗️ Arsitektur Stack (Full Stack Native — Mirip RMS)

| Komponen | Teknologi | Keterangan |
|---|---|---|
| **Frontend** | React 18 + TypeScript + Tailwind CSS | Vite build di Port **8080** |
| **Backend API** | Python FastAPI + Uvicorn | Port **8001** (Systemd service) |
| **Database** | PostgreSQL (`cms_db`) | Localhost:5432 (Clean / Kosong awal) |
| **Web Server** | Nginx Reverse Proxy | Static SPA + Reverse Proxy `/api/` |
| **Service Manager** | systemd (`cms-backend.service`) | Auto-restart on failure |
| **Target OS** | Debian GNU/Linux 11/12/13 | Siap jalan berdampingan dengan RMS |

---

## 📁 Struktur Direktori

```
cms/
├── backend/               # FastAPI Backend Application
│   ├── app/
│   │   ├── config.py      # App settings & environment vars
│   │   ├── database.py    # SQLAlchemy connection engine
│   │   ├── models.py      # Database models (PostgreSQL)
│   │   ├── schemas.py     # Pydantic request/response schemas
│   │   ├── security.py    # Password hashing (bcrypt) & JWT
│   │   ├── routers/       # API endpoints (/api/...)
│   │   └── main.py        # FastAPI entry point
│   ├── init_db.py         # Skrip inisialisasi database bersih (clean state)
│   ├── requirements.txt   # Python dependencies
│   └── .env.example
├── frontend/              # React.js TypeScript Application
│   ├── src/               # UI components, pages, context, and state
│   ├── package.json
│   └── vite.config.ts
├── deploy/                # Konfigurasi deployment Debian
│   ├── cms-backend.service # Systemd service unit (Port 8001)
│   └── nginx-cms.conf     # Nginx reverse proxy (Port 8080)
├── scripts/               # Shell automation scripts
│   ├── install.sh         # Skrip instalasi otomatis Debian
│   ├── backup.sh          # PostgreSQL automated backup
│   ├── restore.sh         # PostgreSQL restore helper
│   └── update_cms.sh      # Update aplikasi tanpa hapus database
└── INSTALL.md             # Panduan instalasi langkah-demi-langkah
```

---
