const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'database.db'), { verbose: console.log });

db.query = (sql, params, callback) => {
    if (typeof params === 'function') {
        callback = params;
        params = [];
    }

    try {
        const isSelect = sql.trim().toLowerCase().startsWith('select');

        if (isSelect) {
            const stmt = db.prepare(sql);
            const results = stmt.all(params);
            callback(null, results);
        } else {
            const stmt = db.prepare(sql);
            const result = stmt.run(params);
            
            callback(null, {
                insertId: result.lastInsertRowid,
                affectedRows: result.changes
            });
        }
    } catch (err) {
        callback(err, null);
    }
};

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nama_lengkap TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'murid',
    foto_profil TEXT
  );

  CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lokasi TEXT NOT NULL,
    deskripsi TEXT,
    foto_url TEXT,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

module.exports = db;