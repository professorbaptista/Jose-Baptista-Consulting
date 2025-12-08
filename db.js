const Database = require('better-sqlite3');

// Cria ou abre a base (ficheiro)
const db = new Database('./database.sqlite');

// Cria a tabela se não existir
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

module.exports = db;
