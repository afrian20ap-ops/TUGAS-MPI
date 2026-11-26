# Panduan Hosting Gratis SIPLA (100% Tanpa Kartu Kredit)

Arsitektur hosting gratis permanen untuk aplikasi *full-stack* SIPLA:

| Komponen | Layanan Gratis | Peran |
|----------|----------------|-------|
| **Database MySQL** | **TiDB Cloud Serverless** (5 GB gratis) | Menyimpan database `pengaduan_masyarakat3` |
| **Backend Go API** | **Render.com** (Free Web Service) | Menjalankan API Go melalui `backend/Dockerfile` & `render.yaml` |
| **Frontend React** | **Vercel** (Hobby Free) | Menampilkan antarmuka web dengan HTTPS & CDN otomatis |

---

## Langkah 1 — Buat Database MySQL Gratis di TiDB Cloud

1. Buka [https://tidbcloud.com](https://tidbcloud.com) dan login menggunakan akun **GitHub** (tidak perlu kartu kredit).
2. Klik **Create Cluster** → pilih paket **Serverless (Free)** → pilih region terdekat (**Singapore / ap-southeast-1**) → klik **Create**.
3. Setelah cluster aktif, klik tombol **Connect** → klik **Generate Password**, lalu catat kredensial berikut:
   - `Host` (contoh: `gateway01.ap-southeast-1.prod.aws.tidbcloud.com`)
   - `Port` (`4000`)
   - `User` (contoh: `3abcXYZ.root`)
   - `Password` (hasil generate)
4. Buka menu **SQL Editor** di TiDB Cloud lalu jalankan:
   ```sql
   CREATE DATABASE IF NOT EXISTS pengaduan_masyarakat3;
   ```
5. Impor file `pengaduan_masyarakat3.sql` ke TiDB Cloud:
   - **Cara A (CLI MySQL dari terminal laptop / XAMPP):**
     ```bash
     "C:\xampp\mysql\bin\mysql.exe" --host=<HOST_TIDB> --port=4000 --user=<USER_TIDB> --password=<PASSWORD_TIDB> --ssl-mode=REQUIRED pengaduan_masyarakat3 < pengaduan_masyarakat3.sql
     ```
   - **Cara B (Menu Import di TiDB Cloud):** Pilih database `pengaduan_masyarakat3` → menu **Import** → unggah file `pengaduan_masyarakat3.sql`.
6. Jalankan sinkronisasi skema tambahan di SQL Editor TiDB Cloud agar seluruh fitur terbaru (lupa password, bukti tambahan, & akun `admin`) berjalan mulus:
   ```sql
   USE pengaduan_masyarakat3;

   CREATE TABLE IF NOT EXISTS permintaan_reset_password (
     id INT AUTO_INCREMENT PRIMARY KEY,
     username VARCHAR(100) NOT NULL,
     nama VARCHAR(150) DEFAULT '',
     role VARCHAR(20) NOT NULL DEFAULT 'masyarakat',
     keterangan TEXT,
     status VARCHAR(20) NOT NULL DEFAULT 'baru',
     created_at DATETIME DEFAULT CURRENT_TIMESTAMP
   );

   ALTER TABLE pengaduan MODIFY COLUMN status VARCHAR(50) NOT NULL DEFAULT 'verifikasi_lapangan';
   ALTER TABLE permohonan MODIFY COLUMN status VARCHAR(50) NOT NULL DEFAULT 'verifikasi_persyaratan';
   ALTER TABLE masyarakat MODIFY COLUMN alamat TEXT;
   ```
   *(Jika kolom `pengaduan.tipe_aspirasi`, `tanggapan.file_bukti_2`, `tanggapan.file_bukti_3`, `permohonan.file_surat_rtrw`, atau `permohonan.file_foto_rumah` belum ada di tabel, tambahkan dengan `ALTER TABLE ... ADD COLUMN ... VARCHAR(255) DEFAULT '';`.)*

---

## Langkah 2 — Deploy Backend Go Gratis di Render

1. Buka [https://render.com](https://render.com) dan login menggunakan akun **GitHub**.
2. Klik **New +** → pilih **Blueprint** (direkomendasikan, otomatis membaca `render.yaml`) **atau** pilih **Web Service**.
3. Hubungkan repositori **`afrian20ap-ops/TUGAS-MPI`** (branch `main`).
4. Jika memakai **Web Service** manual, isi pengaturan berikut:
   - **Root Directory:** `backend`
   - **Runtime:** `Docker`
   - **Instance Type:** `Free`
   - **Health Check Path:** `/health`
5. Masukkan **Environment Variables** berikut di Render:

   | Key | Value |
   |-----|-------|
   | `DB_HOST` | `<HOST_TIDB>` |
   | `DB_PORT` | `4000` |
   | `DB_USER` | `<USER_TIDB>` |
   | `DB_PASSWORD` | `<PASSWORD_TIDB>` |
   | `DB_NAME` | `pengaduan_masyarakat3` |
   | `DB_TLS` | `true` |
   | `JWT_SECRET` | *(isi teks acak panjang minimal 32 karakter)* |
   | `GIN_MODE` | `release` |

6. Klik **Deploy Web Service** dan tunggu hingga status menjadi **Live**.
7. Uji endpoint health check di browser:
   ```text
   https://<nama-service-anda>.onrender.com/health
   ```
   Jika muncul `{"status":"ok"}`, backend sudah aktif. **Salin URL Render tersebut** (tanpa garis miring di akhir).

---

## Langkah 3 — Deploy Frontend React Gratis di Vercel

1. Buka [https://vercel.com](https://vercel.com) dan login menggunakan akun **GitHub**.
2. Klik **Add New…** → **Project** → pilih repositori **`afrian20ap-ops/TUGAS-MPI`**.
3. Pada bagian konfigurasi project:
   - **Framework Preset:** `Vite`
   - **Root Directory:** klik **Edit** lalu pilih **`frontend`**
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Buka bagian **Environment Variables** dan tambahkan:

   | Name | Value |
   |------|-------|
   | `VITE_API_URL` | `https://<nama-service-anda>.onrender.com` |

5. Klik **Deploy**. Dalam ±1 menit, aplikasi SIPLA akan online dengan URL HTTPS gratis dari Vercel (`https://<nama-project>.vercel.app`).

---

## Catatan Penting Paket Gratis

- **Cold Start Render Free:** Server backend gratis akan *sleep* setelah 15 menit tanpa aktivitas. Saat pertama kali dibuka setelah *sleep*, permintaan pertama membutuhkan waktu sekitar 30–50 detik untuk bangun kembali, lalu selanjutnya berjalan normal.
- **Penyimpanan File Upload di Render Free:** Filesystem container Render Free bersifat *ephemeral* (file foto/dokumen yang diunggah setelah deploy dapat ter-reset saat container restart/redeploy). Untuk kebutuhan produksi jangka panjang, disarankan memindahkan penyimpanan upload ke object storage gratis seperti **Cloudflare R2** atau **Cloudinary**.
- **SPA Routing:** File `frontend/vercel.json` sudah disiapkan agar reload halaman di route seperti `/login`, `/admin/dashboard`, atau `/aspirasi` tidak menghasilkan error `404`.
