const os = require('os');

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const db = require('./sqlite');
const fs = require('fs');

require('dotenv').config();
const app = express();


app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, 'REPORT-' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

app.get('/api/reports', (req, res) => {
  const sql = 'SELECT * FROM reports ORDER BY created_at DESC';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post('/api/reports', upload.array('images', 10), (req, res) => {
  const { lokasi, deskripsi } = req.body;
  
  const files = req.files; 
  
  if (!lokasi) {
    return res.status(400).json({ error: 'Lokasi wajib diisi!' });
  }

  // Ambil semua filename dan gabungkan menjadi string (misal: "file1.jpg,file2.jpg")
  const filenames = files ? files.map(file => file.filename).join(',') : null;

  const sql = 'INSERT INTO reports (lokasi, deskripsi, foto_url) VALUES (?, ?, ?)';
  db.query(sql, [lokasi, deskripsi, filenames], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ 
      message: 'Laporan berhasil disimpan!', 
      id: result.insertId,
      files: filenames
    });
  });
});

app.post('/api/register', (req, res) => {
  const { nama_lengkap, username, password } = req.body;

  if (!nama_lengkap || !username || !password) {
    return res.status(400).json({ message: "Semua data harus diisi" });
  }

  const checkUser = "SELECT username FROM users WHERE username = ?";
  db.query(checkUser, [username], (err, results) => {
    if (results.length > 0) {
      return res.status(400).json({ message: "Username sudah digunakan" });
    }

    const sql = "INSERT INTO users (nama_lengkap, username, password) VALUES (?, ?, ?)";
    db.query(sql, [nama_lengkap, username, password], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: "Registrasi berhasil" });
    });
  });
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username dan password wajib diisi!" });
    }

    const sql = "SELECT id, username, nama_lengkap, role, foto_profil FROM users WHERE username = ? AND password = ?";
    
    db.query(sql, [username, password], (err, results) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).json({ message: "Terjadi kesalahan pada server" });
        }

        if (results.length > 0) {
            const user = results[0];
            
            res.json({
                message: "Login Berhasil!",
                user: user,
                token: `token_${user.id}_${Date.now()}` 
            });
        } else {
            res.status(401).json({ message: "Username atau password salah!" });
        }
    });
});

app.get('/api/profile-picture/:username', (req, res) => {
    const { username } = req.params;
    const customPath = path.join(__dirname, 'uploads/profile', `${username}_custom.jpg`);
    const defaultPath = path.join(__dirname, 'uploads/profile/defaults', `${username}.jpg`);
    const fallbackPath = path.join(__dirname, 'uploads/profile/defaults', 'profil_default.jpg');

    if (fs.existsSync(customPath)) {
        return res.sendFile(customPath);
    } 
    else if (fs.existsSync(defaultPath)) {
        return res.sendFile(defaultPath);
    } 
    else {
        return res.sendFile(fallbackPath);
    }
});

// Konfigurasi penyimpanan file
const storageProfil = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = './uploads/profile';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        // Nama file: user_id + timestamp agar tidak duplikat
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'pp-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const uploadProfil = multer({ storage: storageProfil });

app.post('/api/update-photo', uploadProfil.single('foto'), (req, res) => {
    const { userId } = req.body;
    const fileName = req.file.filename;

    if (!req.file) return res.status(400).json({ message: "Gagal upload file" });

    const sql = "UPDATE users SET foto_profil = ? WHERE id = ?";
    db.query(sql, [fileName, userId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        
        res.json({ 
            message: "Foto berhasil diperbarui", 
            foto_profil: fileName 
        });
    });
});

app.post('/api/reset-photo', (req, res) => {
    const { userId, action } = req.body;
    
    // Jika 'default', kita set NULL agar helper lari ke username.jpg
    // Jika 'remove', kita set 'deleted' agar helper lari ke profil_default.jpg
    const value = (action === 'default') ? null : 'deleted';

    const sql = "UPDATE users SET foto_profil = ? WHERE id = ?";
    db.query(sql, [value, userId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Update berhasil", foto_profil: value });
    });
});

app.post('/api/update-profile', (req, res) => {
    const { userId, nama_lengkap, username } = req.body;

    if (!nama_lengkap || !username) {
        return res.status(400).json({ message: "Nama dan Username wajib diisi!" });
    }

    const sql = "UPDATE users SET nama_lengkap = ?, username = ? WHERE id = ?";
    db.query(sql, [nama_lengkap, username, userId], (err, result) => {
        if (err) {
            if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
                return res.status(400).json({ message: "Username sudah digunakan" });
            }
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: "Profil berhasil diperbarui" });
    });
});

app.post('/api/change-password', (req, res) => {
    const { userId, oldPassword, newPassword } = req.body;

    const checkSql = "SELECT id FROM users WHERE id = ? AND password = ?";
    db.query(checkSql, [userId, oldPassword], (err, results) => {
        if (results.length === 0) {
            return res.status(401).json({ message: "Password lama salah!" });
        }

        const updateSql = "UPDATE users SET password = ? WHERE id = ?";
        db.query(updateSql, [newPassword, userId], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Password berhasil diganti" });
        });
    });
});

app.put('/api/report/check/:id', (req, res) => {

    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
        return res.status(400).json({
            message: 'Status wajib diisi'
        });
    }

    const sql = `
        UPDATE reports 
        SET status = ?
        WHERE id = ?
    `;

    db.query(sql, [status, id], (err, result) => {

        if (err) {
            console.log(err);

            return res.status(500).json({
                error: err.message
            });
        }

        res.json({
            message: 'Status berhasil diperbarui'
        });
    });
});

const PORT = process.env.PORT || 3000;
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  const networkInterfaces = os.networkInterfaces();
  let localIp = 'localhost';

  for (const interfaceName in networkInterfaces) {
    for (const iface of networkInterfaces[interfaceName]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        localIp = iface.address;
        break;
      }
    }
  }

  console.log(`\n🚀 Server berjalan di jaringan lokal!`);
  console.log(`🏠 Lokal:  http://localhost:${PORT}`);
  console.log(`🌐 Wi-Fi:  http://${localIp}:${PORT}\n`);
  console.log(`💡 Masukkan alamat Wi-Fi di atas ke file config.js Expo React Native kamu.`);
});