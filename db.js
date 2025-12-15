
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
