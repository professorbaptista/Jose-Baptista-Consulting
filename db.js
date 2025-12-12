
// db.js – SQLite compatível com Render
const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");

// Caminho da pasta de dados PERSISTENTES
// No Render, process.cwd() → /opt/render/project/src
// A pasta /data/ é criada no diretório do projeto (persistente)
const dataDir = path.join(process.cwd(), "data");

// Criar pasta /data se não existir
if (!fs.existsSync(dataDir)) {
    console.log("📁 Pasta /data não existe — criando...");
    fs.mkdirSync(dataDir, { recursive: true });
}

// Caminho completo para a base de dados
const dbPath = path.join(dataDir, "contactos.db");

console.log("📌 Base de dados carregada em:", dbPath);

// Criar/abrir a base de dados
const db = new Database(dbPath, { verbose: console.log });

// Criar tabela se não existir
db.exec(`
    CREATE TABLE IF NOT EXISTS contactos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT NOT NULL,
        assunto TEXT,
        mensagem TEXT NOT NULL,
        ip TEXT,
        data_envio DATETIME DEFAULT CURRENT_TIMESTAMP
    );
`);

console.log("✅ Tabela contactos verificada/criada.");

module.exports = db;
