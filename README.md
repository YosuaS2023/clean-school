# Clean School - Aplikasi Pelaporan Lingkungan Sekolah

Clean School adalah aplikasi mobile berbasis Android/iOS yang dirancang untuk membantu warga sekolah (Murid, Petugas, dan Admin) dalam melaporkan masalah kebersihan atau fasilitas di lingkungan sekolah. 

Aplikasi ini dibangun menggunakan **Expo React Native** untuk sisi *frontend* (mobile) dan **Express.js** dengan **SQLite** untuk sisi *backend*.

---

## 🚀 Fitur Utama

* **Sistem Multi-Role:** Akses masuk terpisah untuk **Admin**, **Petugas**, dan **Murid**.
* **Pelaporan Berfoto:** Murid dapat membuat laporan dengan mengunggah beberapa foto sekaligus dari galeri/kamera.
* **Pelacakan Status (Tracking):** Riwayat laporan yang statusnya dapat diperbarui oleh Admin atau Petugas (e.g., *Pending*, *Proses*, *Selesai*).
* **Pengaturan Akun:** Fitur untuk mengubah nama lengkap, username, foto profil, serta mengganti password.
* **Database Ringan:** Backend menggunakan SQLite (`better-sqlite3`) yang efisien dan berbasis file lokal.

---

## 🛠️ Tech Stack

* **Frontend (Mobile):** Expo React Native
* **Backend (API):** Node.js, Express.js
* **Database:** SQLite (`better-sqlite3`)
* **File Handling:** Multer (untuk upload foto laporan & profil)

---

## 📂 Struktur Folder

```text
clean-school/
├── backend/               # Source code Express.js & SQLite
│   ├── uploads/           # Folder penyimpanan foto yang di-upload
│   ├── database.db        # File database SQLite (Otomatis dibuat)
│   ├── database.js        # Konfigurasi koneksi SQLite
│   ├── server.js          # File utama Express.js
│   └── .env               # Konfigurasi port backend
└── frontend/              # Source code Expo React Native
    ├── assets/            # Gambar dan aset aplikasi
    ├── src/               # Komponen, screen, dan logika app
    ├── app.json           # Konfigurasi aplikasi seperti images dan API
    └── App.js             # Entry point Expo
