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

## 🚀 Cara Cepat Pasang di Debian Server (`/root/project2`)

### 1. Upload ke Server Debian
Dari terminal komputer Mac Anda:
```bash
scp -r /Users/ferdi/.gemini/antigravity/scratch/cms/* root@IP_SERVER_DEBIAN:/root/project2/
```

### 2. Eksekusi Installer di Server
Login SSH ke server Debian Anda:
```bash
ssh root@IP_SERVER_DEBIAN
cd /root/project2/scripts
chmod +x *.sh
bash install.sh
```

Aplikasi langsung online di:
```
http://IP_SERVER_DEBIAN:8080
```
- **Login Admin**: `admin@ctso.net`
- **Password**: `admin`
- **Database**: PostgreSQL (`cms_db`) dalam kondisi **BERSIH / KOSONG**, siap pakai!

---

## 📦 Cakupan Fitur Utama

### 1. Dashboard Operasional (PRD Section 4)
- **Sinkronisasi Tanggal Global**: Tanggal acuan harian (default: 15 November 2026 WITA). Mengubah tanggal menyelaraskan seluruh komponen di halaman.
- **Filter Lokasi Cepat**: `Semua Lokasi`, `Badung`, `Denpasar`.
- **5 Kartu KPI Ringkasan (PRD 4.1)**:
  1. *Total Karyawan*: Total master karyawan aktif dan nonaktif.
  2. *Bekerja Hari Ini*: Karyawan aktif dengan shift kerja (bukan OFF).
  3. *Off Day*: Jumlah personel libur (kode OFF).
  4. *Badung Shift*: Headcount shift kerja di Hub Sunset Road Badung.
  5. *Denpasar Shift*: Headcount shift kerja di Hub Teuku Umar Denpasar.
- **Kanban Jobdesk Hari Ini (PRD 4.2)**: 3 kolom `CT1`, `CT2`, dan `CT4` dengan kartu personel (nama, kode shift, lokasi, jam kerja).
- **Today Shift List (PRD 4.3)**: Rekap jumlah personel per kode shift aktif (`Pagi 7`, `Pagi 8`, `Siang`, `Sore`, `Malam`, `OFF`).
- **Tabel Roster Karyawan Simple View (PRD 4.4)**: Pencarian nama/ID, filter shift, filter jobdesk, status publikasi.
- **Interaksi Modal Detail (PRD 4.5)**: Klik kartu KPI atau kartu shift membuka dialog daftar personel terkait.

### 2. Schedule / Jadwal (PRD Section 5)
- **Sumber Data Tunggal (Single Source of Truth)**: Schedule dan Jobdesk membaca tabel `schedule_assignments` yang sama (PRD 1.3 & 19.2).
- **Tiga Tampilan Roster Terintegrasi**:
  - *Daily Kanban View (5.2)*: Kolom per kode shift, kartu personel, dan aksi assignment.
  - *Weekly Table View (5.3)*: Baris nama karyawan, kolom tanggal 7 hari (Sen-Min), sel kode shift & jobdesk, sticky column nama karyawan.
  - *Monthly Table View (5.4)*: Matriks bulanan 30/31 hari dengan horizontal scroll.
- **Fitur Pembuatan Jadwal Lengkap (PRD 5.6)**:
  - *Manual Assignment*: Tambah/edit penugasan per karyawan, shift, jobdesk, lokasi, dan status Draft/Published.
  - *Bulk Assignment*: Tetapkan shift & lokasi untuk banyak karyawan sekaligus dalam rentang tanggal, otomatis tersimpan sebagai Draft.
  - *Copy Previous Schedule*: Salin roster dari hari kemarin (D-1) atau minggu lalu (D-7) ke Draft tanggal target.
  - *Automatic Schedule Generation*: Algoritma rotasi shift bebas konflik penugasan ganda menghasilkan Draft siap review.
- **Validasi Bisnis 8 Aturan (PRD 5.7)**:
  - Tidak ada dua assignment untuk karyawan yang sama pada tanggal yang sama.
  - Konflik jam kerja shift malam lintas hari divalidasi.
  - Karyawan OFF tidak memiliki jobdesk dan tidak dihitung bekerja.
  - Shift kerja wajib memiliki lokasi kerja dan tepat satu jobdesk sebelum Published.
  - Karyawan nonaktif tidak dapat diberi roster baru.
  - Cuti/izin Approved divalidasi dan memblokir shift kerja yang bertentangan.
- **Status & Publikasi (PRD 5.8)**: Draft hanya dapat dilihat Admin & SPV. Tombol **Publish Schedule** merilis roster ke seluruh Employee, memicu Schedule History, Activity Log, dan notifikasi internal.

### 3. Jobdesk Operasional (PRD Section 6)
- **Kode Master**: `CT1` (First-Line Incident & Dispatch), `CT2` (Network Surveillance & Quality), `CT4` (Field Escalation & Coordinator).
- **Kartu Jobdesk (PRD 6.1)**: Rekap headcount dan rincian distribusi shift per jobdesk.
- **Daily, Weekly, Monthly View (PRD 6.2)**: Tampilan visualisasi alokasi tugas personel, bukan tiket issue.

### 4. Modul Management (PRD Section 7, 8, 9, 10, 11)
- **Employee Management (7.1)**: CRUD data karyawan, NIK/Employee ID, jabatan, team, lokasi base, kontak, toggle aktif/nonaktif, ekspor CSV.
- **Account Management (7.2)**: Relasi 1:0..1 akun pengguna dengan karyawan, role assignment (`Admin`, `SPV`, `Employee`), reset password.
- **Shift Code Management (7.3)**: Katalog kode shift, jam mulai/selesai, offset hari selesai (+1 hari untuk shift malam), warna badge, status aktif/arsip.
- **Jobdesk Code Management (7.4)**: Katalog kode jobdesk (`CT1`, `CT2`, `CT4`), deskripsi fungsi, warna badge, status aktif.
- **Permission Management (7.5 & 7.6)**: Matriks izin operasional SPV (View Draft, Edit Schedule, Publish, Manage Jobdesk, Approve Request/Leave, Export Report) dan pembatasan **Team Scope**.
- **Request Shifting & Alur Tukar Shift (PRD Section 8)**:
  - 4 Jenis Request: *Shift Exchange (Tukar Shift)*, *Change Shift*, *Location Change*, *Jobdesk Change*.
  - Alur Multi-Step Tukar Shift (8.2): Pemohon (A) menunjuk Pengganti (B) &rarr; Rekan (B) menerima/menolak (Pending Replacement) &rarr; Jika diterima, diteruskan ke Admin/SPV (Pending Approval) &rarr; Admin/SPV menyetujui &rarr; **ATOMIC SWAP** menukar jadwal kedua belah pihak secara otomatis di tabel roster, mencatat before/after ke Schedule History, dan mencatat log audit!
- **Cuti dan Izin (PRD Section 9)**: Pengajuan Cuti Tahunan, Izin Sakit, Izin Khusus. Persetujuan cuti otomatis menyesuaikan roster menjadi `OFF` pada rentang tanggal tersebut.
- **Notification Center & Announcement (PRD Section 10)**:
  - Bell notifikasi di bar atas dengan unread counter dan drawer riwayat.
  - Broadcast pengumuman internal di bar atas dan notification feed.
- **Audit & Histori (PRD Section 11)**:
  - *Activity Log (11.1)*: Immutable audit trail (login, perubahan jadwal, approval, modifikasi master). **Tidak dapat dihapus** oleh siapapun demi kepatuhan audit.
  - *Schedule History (11.2)*: Snapshot diff before/after setiap perubahan jadwal (shift, jobdesk, lokasi, status).
  - *Permanent Delete Schedule History (11.3)*: Fitur khusus Admin untuk memangkas riwayat lama dengan konfirmasi teks, filter rentang tanggal/karyawan, dan otomatis mencatat tindakan penghapusan ke Activity Log.
- **Pusat Laporan & Ekspor (PRD Section 12.3)**: Ekspor CSV dan cetak/PDF untuk Daily Schedule, Weekly Matrix, Jobdesk Matrix, Individual Employee Roster, Request Report, dan Leave Report.
- **Profil Mandiri & Ganti Password (PRD 3.1 & 7.2)**: Pembaruan data kontak dan ganti password akun.

---

## 🛠️ Panduan Menjalankan Aplikasi

Aplikasi dibangun dengan **React 18 + TypeScript + Vite + Tailwind CSS** dan siap dijalankan langsung di lingkungan lokal:

### 1. Buka Direktori Project
```bash
cd "/Users/ferdi/.gemini/antigravity/scratch/CMS - CTSO Management System"
```

### 2. Jalankan Server Preview / Development
```bash
# Development mode (Hot-reload)
npm run dev

# Atau jalankan bundle produksi terverifikasi
npm run preview
```

Buka URL di browser:
👉 **`http://localhost:4173/`** atau **`http://localhost:5173/`**

### 3. Akun Demo untuk Pengujian Cepat:
- **Admin**: `budi.santoso@ctso.internal` (Akses administratif penuh, generator, publikasi, penghapusan histori)
- **SPV**: `wayan.sudirta@ctso.internal` (Supervisor Hub Badung, approval tukar shift & cuti, team scope)
- **Employee**: `putu.wijaya@ctso.internal` (Staff teknis, melihat roster Published, pengajuan tukar shift & cuti)

*(Tersedia tombol satu klik pada halaman Login dan Role Switcher langsung di Top Bar untuk beralih persona tanpa repot logout-login).*
