// db.js — SQLite compatível com Render
const path = require("path");
const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();

const dataDir = path.join(process.cwd(), "data");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "contactos.db");

console.log("📌 DB path:", dbPath);

const db = new sqlite3.Database(dbPath, err => {
  if (err) {
    console.error("❌ Erro ao abrir DB:", err);
  } else {
    console.log("✅ SQLite ligado com sucesso");
  }
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS contactos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT NOT NULL,
      assunto TEXT,
      mensagem TEXT NOT NULL,
      ip TEXT,
      data_envio DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

module.exports = db;
