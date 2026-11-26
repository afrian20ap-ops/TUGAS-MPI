# Panduan Presentasi & Laporan Lengkap: Cyberlaw Compliance Audit Checklist
**Objek Audit:** Aplikasi **SIPLA** (*Sistem Informasi Pusat Layanan dan Aspirasi Masyarakat*) — Kelurahan Serua Indah, Kec. Ciputat, Kota Tangerang Selatan  
**Cakupan Audit:** End-to-End (**Frontend** React/Vite, **Backend** Go/Gin/GORM, **Database** MySQL `pengaduan_masyarakat3.sql`, & **File Storage** `backend/assets/`)  
**Standar Acuan:**
1. **UU ITE** (UU No. 11 Tahun 2008 jo. UU No. 19 Tahun 2016 jo. UU No. 1 Tahun 2024 & PP No. 71 Tahun 2019 tentang PSTE)
2. **UU PDP** (UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi)
3. **Kode Etik ACM** (*ACM Code of Ethics and Professional Conduct*, 2018)

**File Slide Presentasi (5 Slide Siap Pakai):** `Cyberlaw_Compliance_Audit_SIPLA.pptx`

---

## 1. Pembagian Tugas Presentasi Kelompok (5 Slide)

Setiap slide sudah dilengkapi **Speaker Notes** di PowerPoint. Jika kelompok beranggotakan 5 orang, pembagiannya 1 orang = 1 slide (~1,5–2 menit per orang). Jika 4 orang, Slide 1 & 5 dapat digabung atau dibagi pembukaan/penutup.

| Slide | Fokus Pembahasan | Pembicara | Poin Kunci yang Wajib Ditekankan |
| :---: | :--- | :---: | :--- |
| **1** | Sampul, Profil Arsitektur & Executive Summary | Anggota 1 | Profil stack FE/BE/DB, jenis data sensitif (KTP/KK/NIK/Foto Rumah SKTM), skor akhir **10% (High Risk / Belum Laik Produksi)**. |
| **2** | Audit Checklist **UU ITE** (5 Kontrol) | Anggota 2 | Eksposur publik `/assets` (KTP/KK), IDOR hapus permohonan, RBAC `AdminOnly`, bug `rune()` JWT, Stored XSS di Export PDF, tanpa TTE & ToS. |
| **3** | Audit Checklist **UU PDP** (5 Kontrol) | Anggota 3 | Nol Privacy Notice & Consent, NIK sebagai Primary Key/URL/JWT, nol Hak Subjek Data, enumerasi NIK+Nama di `/public/lupa-password`, reset PW manual, file fisik tak terhapus, tanpa DPO/SOP breach 3×24 jam. |
| **4** | Audit Checklist **Kode Etik ACM** (5 Kontrol) | Anggota 4 | Kontras tujuan mulia (1.1) vs bahaya kebocoran data (1.2), **silent data loss** (Surat RT/RW & Foto Rumah diupload FE tapi hilang di BE), mismatch schema SQL, aksesibilitas WCAG, duplikasi codebase & nol test. |
| **5** | Peta Jalan Mitigasi (P0/P1/P2) & Kesimpulan | Anggota 5 | Langkah konkret jangka segera (P0), pendek (P1), tata kelola (P2), dan kesimpulan bahwa sistem **belum laik rilis publik**. |

---

## 2. Rumus & Rekap Skor Kepatuhan

- **Patuh Penuh** = `1,0` poin | **Patuh Parsial** = `0,5` poin | **Tidak Patuh** = `0,0` poin

| Standar Audit | Jumlah Kontrol | Patuh Penuh | Patuh Parsial | Tidak Patuh | Skor Kepatuhan |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **UU ITE** | 5 | 0 | 1 | 4 | **10%** |
| **UU PDP** | 5 | 0 | 0 | 5 | **0%** |
| **Kode Etik ACM** | 5 | 0 | 2 | 3 | **20%** |
| **TOTAL** | **15** | **0 (0%)** | **3 (20%)** | **12 (80%)** | **10% (HIGH RISK)** |

---

## 3. Rincian Bukti Teknis (Bekal Sesi Tanya Jawab dengan Dosen)

### A. Temuan UU ITE
1. **Eksposur File Publik (`backend/main.go:27`)**  
   `r.Static("/assets", "./assets")` membuka akses langsung ke 51 file upload nyata (termasuk KTP, KK, surat RT/RW, foto pengaduan, bukti penanganan) via URL tanpa autentikasi.
2. **IDOR Hapus Permohonan (`backend/controllers/permohonan.go:119-132`)**  
   `DeletePermohonan` langsung mengeksekusi `config.DB.Delete(&p)` tanpa memeriksa `if role == "masyarakat" && p.NIK != userID.(string)`. Bandingkan dengan `GetPermohonanByID` (`permohonan.go:44`) yang memiliki cek tersebut.
3. **RBAC Hanya di Frontend (`backend/middleware/auth.go:48-58` & `backend/routes/routes.go:44-67`)**  
   `AdminOnly()` mengizinkan `role == "admin" || role == "petugas"`. Akibatnya, `petugas` dapat memanggil langsung API `GET /api/masyarakat`, `POST /api/petugas`, `DELETE /api/petugas/:id`, `PUT /api/reset-password/masyarakat/:nik`, dan `DELETE /api/admin/*`, padahal menu tersebut disembunyikan di `AdminLayout.jsx:10-11`.
4. **Bug Kritis Konversi ID JWT Petugas (`backend/controllers/auth.go:78`)**  
   `generateToken(string(rune(petugas.IDPetugas)), ...)` mengubah angka `1` menjadi karakter ASCII `\x01`, bukan `"1"` (`strconv.FormatUint`).
5. **Validasi JWT & Secret Lemah (`backend/middleware/auth.go:31-33`)**  
   Tidak memverifikasi metode signing HMAC (`t.Method.(*jwt.SigningMethodHMAC)`), dan tidak menolak startup jika `JWT_SECRET` kosong.
6. **Transmisi HTTP, CORS Wildcard, Unrestricted File Upload & Stored XSS**
   - `backend/main.go:20`: `AllowAllOrigins: true`.
   - `frontend/src/services/api.js:3`: hardcoded `http://localhost:8080/api`.
   - `controllers/pengaduan.go:67-74`, `permohonan.go:51-62`, `tanggapan.go:15-26`: tidak ada cek MIME type, ekstensi whitelist, maupun batas ukuran file di backend.
   - `frontend/src/pages/admin/Aspirasi.jsx:163-218`, `Permohonan.jsx:152-207`, `Masyarakat.jsx:68-109`: Stored XSS karena field input pengguna (`judul_laporan`, `isi_laporan`, `name`, `alamat`) ditulis mentah ke `w.document.write(html)`.
7. **Kelebihan yang Ditemukan (Parsial):** Password sudah di-hash dengan `bcrypt` (`auth.go:51,105`), JWT memiliki `ExpiresAt` 24 jam (`auth.go:29`), dan query DB memakai GORM parameterized queries.

### B. Temuan UU PDP
1. **Tanpa Persetujuan & Pemberitahuan Privasi (Pasal 20–22):** `Register.jsx` dan `user/Permohonan.jsx` mengumpulkan NIK, email, alamat, KTP, KK, dan Foto Rumah (data kondisi ekonomi untuk SKTM) tanpa Privacy Policy maupun checkbox persetujuan eksplisit.
2. **Gagal Minimalisasi Data (Pasal 16):** NIK menjadi Primary Key (`models.go:6`), masuk payload JWT (`auth.go:55`), masuk URL (`/reset-password/masyarakat/:nik`), serta seluruh profil warga ikut dikirim pada `Preload("Masyarakat")` di daftar aspirasi/permohonan/dashboard (`pengaduan.go:19,179`, `permohonan.go:24`). Selain itu, 51 file upload nyata dan dump SQL ikut tersimpan di repositori.
3. **Nol Hak Subjek Data (Pasal 5–13):** Tidak ada endpoint maupun halaman bagi warga untuk melihat/mengubah profil, menghapus akun/data, menarik persetujuan, atau mengunduh salinan data pribadi.
4. **Enumerasi PII & Reset Password Tidak Aman (Pasal 35–39):**
   - `POST /api/public/lupa-password` (`password.go:18-65`) tanpa autentikasi & tanpa rate limit membedakan error `"NIK tidak ditemukan"` vs `"No. HP tidak sesuai"`, lalu mengembalikan `"nama": user.Name` saat cocok.
   - Admin/petugas menetapkan langsung password baru warga dan mengirimkannya secara manual via HP/WA (`password.go:102-165`, `Dashboard.jsx:439`), sehingga kerahasiaan kredensial dilanggar.
5. **Retensi, File Yatim, Breach & DPO (Pasal 43–46, 53):** `DeletePengaduan`, `DeletePermohonan`, dan `AdminDeletePermohonan` hanya menghapus baris DB tanpa `os.Remove` file fisik di `assets/`. Belum ada kebijakan retensi, SOP notifikasi kebocoran 3×24 jam, maupun informasi kontak DPO/PPDP.

### C. Temuan Kode Etik ACM (2018)
1. **Prinsip 1.1 & 1.2 (Avoid Harm):** Niat aplikasi positif untuk layanan publik, namun celah kebocoran KTP/KK & XSS berpotensi memicu pencurian identitas (*identity theft*) dan penipuan finansial terhadap warga.
2. **Prinsip 1.3 (Be Honest and Trustworthy) — *Silent Data Loss* & Inkonsistensi:**
   - `frontend/src/pages/user/Permohonan.jsx:26-30` mewajibkan upload `file_surat_rtrw` dan `file_foto_rumah`, **tetapi `backend/controllers/permohonan.go:72-82` sama sekali tidak membaca atau menyimpan kedua field tersebut!**
   - `frontend/src/pages/Landing.jsx:52`: Tombol `"Buat Akun"` mengarah ke `/login` bukan `/register`.
   - `pengaduan_masyarakat3.sql:14576`: Kolom `masyarakat.alamat` hanya `varchar(13)`, `pengaduan.status` & `permohonan.status` masih enum lama (`'0','proses','selesai'`), dan tabel `permintaan_reset_password` tidak ada di file SQL dump.
   - `frontend/src/pages/user/Aspirasi.jsx:176`: Tombol Hapus warga hanya muncul jika `p.status === '0'`, padahal status awal baru adalah `'verifikasi_lapangan'`.
3. **Prinsip 1.4 (Fairness & Accessibility):** Responsif untuk mobile, namun minim dukungan WCAG (`aria-label`, navigasi keyboard modal, kontras teks `text-white/40`) untuk lansia dan disabilitas.
4. **Prinsip 1.6 & 1.7 (Privacy & Confidentiality):** Export PDF massal data masyarakat (`AdminMasyarakat.jsx:66-112`) mencetak seluruh NIK, email, HP, alamat tanpa masking dan tanpa jejak audit.
5. **Prinsip 2.1, 2.5, 2.9 (Quality, Risk Evaluation & Secure Design):** Duplikasi folder bersarang (`frontend/frontend/`, `frontend/src/frontend/`), file backup (`Aspirasi-.jsx`, `Permohonan-.jsx`, `Petugas-.jsx`), kode mati (`_unused`), nol automated testing, dan kredensial default terbuka di `README.md:112-116`.

---

## 4. Antisipasi Pertanyaan Dosen (Q&A Cheat Sheet)

1. **Tanya:** *Mengapa skor UU PDP bisa 0%?*  
   **Jawab:** Karena 5 pilar utama UU PDP—persetujuan eksplisit (Psl 20), minimalisasi data (Psl 16), hak subjek data (Psl 5–13), pengamanan data KTP/KK & anti-enumerasi (Psl 35–39), serta retensi/penghapusan fisik/DPO (Psl 43–53)—seluruhnya belum terpenuhi di kode frontend maupun backend.
2. **Tanya:** *Bukankah password sudah di-hash bcrypt, kenapa UU ITE tetap rendah?*  
   **Jawab:** Betul, hashing bcrypt & JWT 24 jam kami beri nilai **Parsial** pada kontrol Autentikasi & Audit Trail. Namun kontrol keamanan lainnya gagal secara kritis: file KTP/KK dapat diakses publik lewat `r.Static("/assets")`, ada IDOR hapus permohonan, RBAC admin bocor ke petugas, dan ada celah Stored XSS di fitur Export PDF.
3. **Tanya:** *Apa temuan paling unik dari sisi Etika Profesi (ACM) yang tidak sekadar masalah keamanan?*  
   **Jawab:** Temuan **silent data loss** (ACM 1.3): warga diminta dan diwajibkan mengunggah Surat RT/RW dan Foto Rumah di UI `Permohonan.jsx`, tetapi backend `permohonan.go` sama sekali tidak menangkap/menyimpan kedua file tersebut—aplikasi memberi kesan seolah dokumen sudah diterima padahal hilang diam-diam.
