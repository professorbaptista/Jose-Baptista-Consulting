
// routes/admin.js
const express = require('express');
const db = require('../db');
const authSession = require('../authSession');

const router = express.Router();

// proteger rotas admin
router.use(authSession);

/**
 * GET /admin/contactos
 * Lista contactos
 */
router.get('/contactos', (req, res) => {
  const sql = `
    SELECT * 
    FROM contactos 
    ORDER BY data_envio DESC
  `;

  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('Erro DB:', err);
      return res.status(500).send('Erro ao carregar contactos');
    }

    res.render('admin/contactos', {
      contactos: rows,
      total: rows.length
    });
  });
});

router.get('/contacto/:id', (req, res) => {
  db.get(
    "SELECT * FROM contactos WHERE id = ?",
    [req.params.id],
    (err, row) => {
      if (err) return res.status(500).send('Erro DB');
      if (!row) return res.status(404).send('Contacto não encontrado');

      res.render('admin/ver-contacto', row);
    }
  );
});

module.exports = router;
