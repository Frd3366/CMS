# Panduan Instalasi & Deployment CMS CTSO di Debian Server

Dokumen ini berisi panduan instalasi lengkap **CTSO Management System (CMS)** pada server **Debian GNU/Linux** (arsitektur full native dengan PostgreSQL & FastAPI seperti project RMS).

---

## 1. Arsitektur Stack

| Komponen | Spesifikasi | Keterangan |
|---|---|---|
| **Frontend** | React 18 + TypeScript + Vite | Port **8080** via Nginx |
| **Backend API** | Python FastAPI + Uvicorn | Port **8001** (Systemd Service) |
| **Database** | PostgreSQL (`cms_db`) | Localhost:5432 (User: `cms_user`) |
| **Web Server** | Nginx Reverse Proxy | Menangani static web + proxy `/api/` |
| **Direktori Server** | `/root/project2` | Berjalan mandiri langsung di folder project2 |

> **Catatan Port (Berdampingan dengan RMS):**  
> - Project **RMS** menggunakan Port **80** (Web) & **8000** (API).  
> - Project **CMS** menggunakan Port **8080** (Web) & **8001** (API).  
> Kedua sistem dapat berjalan bersamaan secara simultan tanpa konflik.

---

## 2. Status Awal Database (Clean State)

Saat pertama kali diinstal via `install.sh`, database PostgreSQL `cms_db` dibuat dengan status **BERSIH / KOSONG**:
- **Daftar Karyawan**: 0 (Kosong, siap diinput baru)
- **Jadwal Shift**: 0 (Kosong, siap dialokasikan)
- **Permohonan & Cuti**: 0 (Kosong)
- **Pengumuman & Log Audit**: 0 (Kosong)
- **Master Shift & Jobdesk**: Telah disiapkan kode standar (*Pagi 7, Pagi 8, Siang, Sore, Malam, Middle, OFF* dan *CT1, CT2, CT4*)
- **Akun Super Admin Default**:
  - **Email**: `admin@ctso.net`
  - **Password**: `admin`

---

## 3. Langkah Upload & Instalasi

### Langkah 1: Upload File ke Debian Server
Dari terminal Mac Anda, kirim seluruh folder proyek CMS ke folder `/root/project2` di Debian:

```bash
scp -r /Users/ferdi/.gemini/antigravity/scratch/cms/* root@IP_SERVER_DEBIAN:/root/project2/
```
*(Ganti `IP_SERVER_DEBIAN` dengan alamat IP server Debian Anda, misalnya `192.168.1.100`)*

---

### Langkah 2: Jalankan Installer Otomatis di Debian
Login ke server Debian Anda melalui SSH:

```bash
ssh root@IP_SERVER_DEBIAN
```

Masuk ke folder installer dan jalankan script:

```bash
cd /root/project2/scripts
chmod +x *.sh
bash install.sh
```

### Apa yang Dilakukan oleh `install.sh`?
1. Menginstal paket sistem: `postgresql`, `nginx`, `python3-venv`, `nodejs`, dsb.
2. Membuat database PostgreSQL `cms_db` dan user `cms_user` secara otomatis.
3. Menyiapkan Python virtualenv di `/root/project2/backend/venv`.
4. Menginisialisasi skema tabel database dan membuat akun Administrator default.
5. Melakukan kompilasi bundle frontend React (`npm run build`).
6. Memasang systemd service `/etc/systemd/system/cms-backend.service` dan menjalankannya di port 8001.
7. Mengaktifkan konfigurasi Nginx di port 8080 dan me-reload Nginx.

---

## 4. Mengakses Aplikasi

Setelah instalasi selesai, buka browser dari komputer/laptop mana saja di jaringan kantor Anda:

```
http://IP_SERVER_DEBIAN:8080
```

- **Login**: `admin@ctso.net`
- **Password**: `admin`

---

## 5. Perintah Pengelolaan Server

### Cek Status Backend Service:
```bash
systemctl status cms-backend
```

### Melihat Log Backend Real-time:
```bash
journalctl -u cms-backend -f
```

### Restart / Stop / Start Backend:
```bash
systemctl restart cms-backend
systemctl stop cms-backend
systemctl start cms-backend
```

### Backup Database PostgreSQL:
```bash
bash /root/project2/scripts/backup.sh
```
*(File backup otomatis tersimpan di `/root/project2/backups/cms_backup_YYYYMMDD_HHMMSS.sql.gz`)*

### Restore Database dari Backup:
```bash
bash /root/project2/scripts/restore.sh /root/project2/backups/cms_backup_namafile.sql.gz
```

### Update Kode Aplikasi di Masa Depan:
Jika Anda melakukan perubahan tampilan di frontend atau backend, upload perubahannya ke `/root/project2` lalu jalankan:
```bash
cd /root/project2/scripts
bash update_cms.sh
```
*(Script ini akan memperbarui file dan me-rebuild tanpa menghapus database).*
