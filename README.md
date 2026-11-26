# SIPLA — Sistem Informasi Pusat Layanan & Aspirasi Masyarakat

Aplikasi web *full-stack* untuk pengelolaan **aspirasi/pengaduan masyarakat** dan **permohonan surat administrasi** pada tingkat kelurahan (**Kelurahan Serua Indah**), dilengkapi antarmuka modern-minimal berbasis sistem desain Hallmark (*Dose*), interaksi animasi 3D, navigasi KPI interaktif, serta dokumen **Audit Kepatuhan Cyberlaw & Etika Profesi**.

---

## Fitur Utama

### 1. Antarmuka Modern, Motion 3D & Interaksi Responsif
- **Sistem Desain Hallmark (*Dose*):** Menggunakan palet *chromatic-green* berbasis token OKLCH (`tokens.css` & `base.css`), tipografi **Schibsted Grotesk**, **Instrument Sans**, dan **DM Mono**, serta ikon vektor `lucide-react`.
- **Animasi 3D Berakselerasi GPU (`Motion3D.jsx`):** Efek perspektif *tilt* 3D interaktif (`Tilt3D`), transisi masuk (`Reveal3D`), dan bilah progres (`ProgressBar3D`) di halaman *Landing* serta dashboard pengguna dan admin, dengan dukungan aksesibilitas `prefers-reduced-motion`.
- **Umpan Balik Hover Hijau & Kartu KPI Klik-Langsung:** Setiap kartu statistik, baris layanan, dan kolom input memberikan sorotan hijau (*emerald highlight*) saat diarahkan kursor. Kartu KPI di dashboard (Total Aspirasi, Aspirasi Selesai, Permohonan Surat, dll.) dapat diklik untuk langsung berpindah ke halaman tujuan dengan filter status tersinkronisasi di URL (`?status=aktif`, `?status=selesai`).
- **Autentikasi & Navigasi Terstruktur:** Pemilih peran **Masyarakat / Petugas** yang jelas pada halaman Login, alur pengajuan lupa password, serta tombol **Keluar** yang konsisten pada portal Masyarakat maupun konsol Admin.

### 2. Portal Publik & Masyarakat
- **Halaman Landing:** Informasi profil kelurahan, katalog layanan administrasi dengan pencarian langsung, dan statistik transparansi publik.
- **Aspirasi & Pengaduan Warga:** Pengajuan laporan disertai kategori, unggah foto bukti, dan penandaan lokasi menggunakan peta interaktif **Leaflet**.
- **Permohonan Surat Online:** Pengajuan surat administrasi dengan unggah berkas persyaratan (KTP, KK, surat RT/RW, dokumen pendukung) dan pengunduhan hasil surat.
- **Pelacakan Status:** Ringkasan kartu filter 3D interaktif untuk memantau status laporan (*Menunggu*, *Diproses*, *Selesai*).

### 3. Konsol Admin & Petugas
- **Dashboard Analitik:** Ringkasan metrik aspirasi, permohonan surat, dan data warga dengan navigasi cepat ke data terfilter.
- **Tindak Lanjut Aspirasi:** Pemberian tanggapan resmi, pembaruan status, serta unggah hingga 3 foto bukti penyelesaian.
- **Pemrosesan Permohonan Surat:** Verifikasi berkas pemohon, pembaruan status, dan unggah dokumen surat hasil.
- **Manajemen Akun & Notifikasi Reset Password:** Kelola data masyarakat, akun petugas, permintaan lupa password dari warga, serta pembaruan profil kelurahan.

---

## Tech Stack

| Lapisan | Teknologi |
|---------|-----------|
| **Backend** | Go 1.21+, Gin, GORM, JWT (`golang-jwt/jwt/v5`), `bcrypt`, `godotenv` |
| **Frontend** | React 18, Vite 5, Tailwind CSS 3, React Router 6, Axios, Leaflet (`react-leaflet`), `lucide-react` |
| **Database** | MySQL / MariaDB (XAMPP) |
| **Design System** | Hallmark *Dose* (`tokens.css`, `base.css`, `Motion3D.jsx`) |

---

## Struktur Folder

```text
aspirasimasyarakat-main/
├── backend/
│   ├── main.go
│   ├── go.mod
│   ├── .env.example
│   ├── config/
│   │   └── database.go
│   ├── middleware/
│   │   └── auth.go
│   ├── models/
│   │   ├── models.go
│   │   └── reset_password.go
│   ├── controllers/
│   │   ├── auth.go
│   │   ├── kelurahan.go
│   │   ├── password.go
│   │   ├── pengaduan.go
│   │   ├── permohonan.go
│   │   ├── tanggapan.go
│   │   └── wilayah.go
│   ├── routes/
│   │   └── routes.go
│   └── assets/
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── tokens.css
│       ├── base.css
│       ├── index.css
│       ├── context/AuthContext.jsx
│       ├── services/api.js
│       ├── components/
│       │   ├── AdminLayout.jsx
│       │   ├── UserLayout.jsx
│       │   └── Motion3D.jsx
│       └── pages/
│           ├── Landing.jsx
│           ├── Login.jsx
│           ├── Register.jsx
│           ├── user/
│           │   ├── Aspirasi.jsx
│           │   └── Permohonan.jsx
│           └── admin/
│               ├── Dashboard.jsx
│               ├── Aspirasi.jsx
│               ├── Permohonan.jsx
│               ├── Masyarakat.jsx
│               ├── Petugas.jsx
│               └── Kelurahan.jsx
├── pengaduan_masyarakat3.sql
├── Cyberlaw_Compliance_Audit_SIPLA.pptx
├── Panduan_Presentasi_Audit_Cyberlaw.md
└── README.md
```

---

## Cara Menjalankan Aplikasi

### Prasyarat
- **Go** 1.21 atau lebih baru
- **Node.js** 18 atau lebih baru
- **MySQL** (atau **XAMPP**)

### 1. Setup Database MySQL
Buat database `pengaduan_masyarakat3` lalu impor file `pengaduan_masyarakat3.sql` melalui phpMyAdmin atau CLI MySQL:

```sql
CREATE DATABASE IF NOT EXISTS pengaduan_masyarakat3;
```

```bash
mysql -u root pengaduan_masyarakat3 < pengaduan_masyarakat3.sql
```

> **Catatan Skema Tambahan:** Jika setelah impor muncul error kolom/tabel belum tersedia pada fitur terbaru (notifikasi lupa password, `tipe_aspirasi`, atau bukti tanggapan tambahan), pastikan tabel `permintaan_reset_password` dan kolom pelengkap (`pengaduan.tipe_aspirasi`, `tanggapan.file_bukti_2`, `tanggapan.file_bukti_3`, `permohonan.file_surat_rtrw`, `permohonan.file_foto_rumah`) sudah dibuat sesuai definisi struct di `backend/models/`.

### 2. Konfigurasi & Jalankan Backend (Go)

```bash
cd backend

# Salin template environment lalu sesuaikan kredensial MySQL & JWT_SECRET
cp .env.example .env

# Unduh dependencies Go
go mod tidy

# Jalankan server API
go run main.go
```

Backend akan berjalan di `http://localhost:8080`.

### 3. Jalankan Frontend (React + Vite)

```bash
cd frontend

# Install dependencies
npm install

# Jalankan development server
npm run dev
```

Frontend dapat diakses melalui `http://localhost:5173`.

---

## Akun Default

| Role | Username | Password |
|------|----------|----------|
| **Admin** | `admin` | `petugas` |
| **Petugas** | `petugas` | `petugas` |
| **Masyarakat** | `user` | `user1234` |

> **Catatan:** Password di database disimpan menggunakan hash `bcrypt`. Apabila login akun `admin` gagal pada database hasil impor baru, perbarui hash password `admin` di tabel `petugas` menggunakan hash `bcrypt` yang valid untuk password `petugas` (atau gunakan akun `petugas` / fitur reset password admin).

---

## Daftar API Endpoints

### Public
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `POST` | `/api/auth/login` | Login masyarakat / petugas |
| `POST` | `/api/auth/register` | Registrasi akun masyarakat |
| `GET` | `/api/kelurahan` | Informasi profil kelurahan |
| `GET` | `/api/jenis-layanan` | Katalog jenis layanan administrasi |
| `GET` | `/api/public/statistik` | Statistik transparansi publik |
| `POST` | `/api/public/lupa-password` | Ajukan permintaan reset password |
| `GET` | `/api/provinces` | Daftar provinsi |
| `GET` | `/api/regencies?province_id=` | Daftar kabupaten/kota |
| `GET` | `/api/districts?regency_id=` | Daftar kecamatan |
| `GET` | `/api/villages?district_id=` | Daftar kelurahan/desa |

### Authenticated (Masyarakat & Petugas — Bearer JWT)
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `GET` | `/api/auth/me` | Profil pengguna yang sedang login |
| `PUT` | `/api/auth/change-password` | Ubah password akun |
| `GET` | `/api/aspirasi` | Daftar aspirasi / pengaduan |
| `GET` | `/api/aspirasi/:id` | Detail aspirasi |
| `POST` | `/api/aspirasi` | Buat aspirasi baru (`multipart/form-data`) |
| `PUT` | `/api/aspirasi/:id` | Ubah aspirasi |
| `DELETE` | `/api/aspirasi/:id` | Hapus aspirasi |
| `GET` | `/api/permohonan` | Daftar permohonan surat |
| `GET` | `/api/permohonan/:id` | Detail permohonan surat |
| `POST` | `/api/permohonan` | Ajukan permohonan surat (`multipart/form-data`) |
| `DELETE` | `/api/permohonan/:id` | Hapus permohonan surat |

### Admin / Petugas Only
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `GET` | `/api/dashboard` | Statistik dashboard admin |
| `POST` | `/api/tanggapan` | Kirim tanggapan & bukti penyelesaian |
| `PUT` | `/api/tanggapan/:id` | Perbarui tanggapan |
| `DELETE` | `/api/tanggapan/:id` | Hapus tanggapan |
| `PUT` | `/api/permohonan/:id/proses` | Proses permohonan & unggah hasil surat |
| `PUT` | `/api/kelurahan` | Perbarui informasi profil kelurahan |
| `GET` | `/api/masyarakat` | Daftar masyarakat terdaftar |
| `GET` / `POST` / `DELETE` | `/api/petugas` | Manajemen akun petugas |
| `PUT` | `/api/reset-password/masyarakat/:nik` | Reset password masyarakat |
| `PUT` | `/api/reset-password/petugas/:id` | Reset password petugas |
| `DELETE` | `/api/admin/aspirasi/:id` | Hapus aspirasi (Admin) |
| `DELETE` | `/api/admin/permohonan/:id` | Hapus permohonan (Admin) |
| `GET` / `PUT` | `/api/lupa-password` | Kelola notifikasi permintaan reset password |

---

## Audit Kepatuhan Cyberlaw & Etika Profesi

Repositori ini juga menyertakan dokumen hasil audit kepatuhan aplikasi terhadap **UU ITE**, **UU PDP (UU No. 27 Tahun 2022)**, dan **ACM Code of Ethics (2018)**:
- `Cyberlaw_Compliance_Audit_SIPLA.pptx` — Slide presentasi audit (5 slide).
- `Panduan_Presentasi_Audit_Cyberlaw.md` — Naskah presenter dan panduan tanya-jawab audit.

---

## Update Terbaru (`redesign SIPLA UI`)

- **Redesign Antarmuka Modern & Profesional:** Pembaruan menyeluruh seluruh halaman Landing, Login, Register, Portal Masyarakat, dan Konsol Admin menggunakan sistem desain Hallmark (*Dose*) dengan palet *chromatic-green*, tipografi Schibsted Grotesk / Instrument Sans / DM Mono, serta ikon `lucide-react`.
- **Animasi & Motion 3D:** Penambahan efek perspektif 3D (`Tilt3D`, `Reveal3D`, `ProgressBar3D`) pada halaman Landing dan dashboard pengguna maupun admin.
- **Efek Hover Hijau & Navigasi Kartu Interaktif:** Penambahan sorotan warna hijau saat kursor mendekati kartu metrik, daftar layanan, maupun kolom input, serta fungsi klik langsung pada kartu statistik (Total Aspirasi, Aspirasi Selesai, Permohonan Surat, dll.) untuk berpindah ke halaman tujuan dengan filter status otomatis.
- **Perbaikan Halaman Login & Tombol Keluar:** Peningkatan tampilan pemilih peran login (**Masyarakat** / **Petugas**) serta penegasan tombol **Keluar** pada seluruh layout pengguna dan admin.

