# # Tododay - Aplikasi Manajemen Tugas 📝

Tododay adalah aplikasi berbasis web untuk mencatat dan mengelola tugas harian (To-Do List). Aplikasi ini dibangun dengan fokus pada keamanan (mencegah manipulasi data), validasi ganda (frontend & backend), dan pengalaman pengguna yang interaktif.

🌐 **Live Demo:** [https://tododay.rakit.icu/](https://tododay.rakit.icu/)

## ✨ Fitur Utama
* **Autentikasi Pengguna:** Sistem registrasi, login, dan proteksi rute agar hanya pengguna sah yang dapat mengakses sistem.
* **Manajemen Tugas (CRUD):** Tambah, lihat, ubah, dan hapus tugas secara *real-time* atau persisten.
* **Keamanan Data Berbasis Sesi:** Data tugas diisolasi per akun. Kepemilikan data diikat menggunakan *User ID* dari sesi/token *backend*, mencegah kerentanan IDOR (memanipulasi tugas milik orang lain).
* **Validasi Ketat:** Penolakan form kosong, nilai berupa spasi (*whitespace*), dan input data melebihi batas yang diizinkan (Boundary Limits).
* **UI/UX Adaptif:** Menampilkan pesan informatif pada kondisi *Empty State* (tidak ada tugas) dan penanganan *error* jaringan saat gagal berkomunikasi dengan server.

## 🚀 Instalasi dan Menjalankan Lokal

Ikuti langkah-langkah berikut untuk menjalankan Tododay di perangkat lokal Anda dengan menggunakan *database* kosong (Sesuai TC-12).

### Prasyarat
* [Tuliskan bahasa/framework utama, misal: PHP ^8.1 & Composer / Node.js & NPM]
* Database Server (MySQL / PostgreSQL)
* Git

### Langkah-langkah Menjalankan
1. **Clone Repositori:**
   ```bash
   git clone [https://github.com/ricmania/Mini_project_Ric.git](https://github.com/ricmania/Mini_project_Ric.git)
   cd Mini_project_Ric
