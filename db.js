
const { Pool } = require('pg');

// if (!process.env.DATABASE_URL) {
//   throw new Error('❌ DATABASE_URL não definida no ambiente');
// }


const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.query(`
  CREATE TABLE IF NOT EXISTS contactos (
    id SERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    email TEXT NOT NULL,
    assunto TEXT,
    mensagem TEXT NOT NULL,
    ip TEXT,
    data_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);


// Testar ligação ao arrancar
(async () => {
  try {
    await pool.query('SELECT 1');
    console.log('✅ PostgreSQL ligado com sucesso');
  } catch (err) {
    console.error('❌ Erro PostgreSQL:', err.message);
    console.error(err);
  }
})();

module.exports = pool;
