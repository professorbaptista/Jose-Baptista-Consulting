// routes/admin.js
const express = require('express');
const db = require('../db');
const adminAuth = require('../auth');

const router = express.Router();

// Todas as rotas admin exigem autenticação básica
router.use(adminAuth);

/**
 * GET /admin/contactos
 * Renderiza view 'admin/contactos' com a lista de contactos
 */
router.get('/contactos', (req, res) => {
  try {
    const stmt = db.prepare("SELECT * FROM contactos ORDER BY data_envio DESC");
    const contactos = stmt.all();

    res.render('admin/contactos', {
      contactos,
      total: contactos.length
    });
  } catch (err) {
    console.error("Erro ao carregar contactos:", err);
    res.status(500).send("Erro interno.");
  }
});

/**
 * GET /admin/contacto/:id
 * Renderiza view 'admin/ver-contacto' com o contacto pedido
 */
router.get('/contacto/:id', (req, res) => {
  try {
    const stmt = db.prepare("SELECT * FROM contactos WHERE id = ?");
    const contacto = stmt.get(req.params.id);

    if (!contacto) {
      return res.status(404).send("Contacto não encontrado.");
    }

    res.render('admin/ver-contacto', contacto);
  } catch (err) {
    console.error("Erro ao carregar contacto:", err);
    res.status(500).send("Erro interno.");
  }
});

module.exports = router;
