const express = require('express');
const db = require('../db');
const authSession = require('../authSession');

const router = express.Router();

// --- ADICIONAR ROTAS DE LOGIN / LOGOUT AQUI (antes do middleware) ---

// rota base /admin
router.get('/', (req, res) => {
  // se já estiver autenticado, vai para dashboard
  if (req.session.admin) {
    return res.redirect('/admin/dashboard');
  }
  // senão, vai para login
  res.redirect('/admin/login');
});


router.get('/login', (req, res) => {
  res.render('admin/login', { error: null });
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin';

  if (username === 'admin' && password === adminPassword) {
    req.session.admin = { user: 'admin' };
    return res.redirect('/admin/dashboard');

  }
  res.status(401).render('admin/login', { error: 'Credenciais inválidas' });
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/admin/login'));
});

router.use(authSession);

/* =========================
   DASHBOARD
========================= */

router.get('/dashboard', async (req, res) => {
  try {
    const total = await db.query(
      'SELECT COUNT(*) FROM contactos'
    );

    const porDia = await db.query(`
      SELECT 
        DATE(data_envio) AS dia,
        COUNT(*) AS total
      FROM contactos
      GROUP BY dia
      ORDER BY dia DESC
      LIMIT 7
    `);

    res.render('admin/dashboard', {
      total: total.rows[0].count,
      dias: porDia.rows
      
    });

  } catch (err) {
    console.error('Erro dashboard:', err);
    res.status(500).send('Erro ao carregar dashboard');
  }
});


// LISTAR CONTACTOS
router.get('/contactos', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM contactos ORDER BY data_envio DESC'
    );

    res.render('admin/contactos', {
      contactos: result.rows,
      total: result.rowCount
    });

  } catch (err) {
    console.error('Erro admin:', err);
    res.status(500).send('Erro interno');
  }
});

// VER CONTACTO
router.get('/contacto/:id', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM contactos WHERE id = $1',
      [req.params.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).send('Contacto não encontrado');
    }

    res.render('admin/ver-contacto', result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).send('Erro interno');
  }
});

module.exports = router;
