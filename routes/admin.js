const express = require('express');
const db = require('../db');
const authSession = require('../authSession');

const router = express.Router();

// --- ADICIONAR ROTAS DE LOGIN / LOGOUT AQUI (antes do middleware) ---
router.get('/login', (req, res) => {
  res.render('admin/login', { error: null });
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin';

  if (username === 'admin' && password === adminPassword) {
    req.session.admin = { user: 'admin' };
    return res.redirect('/admin/');
  }
  res.status(401).render('admin/login', { error: 'Credenciais inválidas' });
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/admin/login'));
});

router.use(authSession);

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
