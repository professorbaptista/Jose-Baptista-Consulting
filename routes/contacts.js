
const express = require('express');
const db = require('../db');
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { nome, email, assunto, mensagem } = req.body;

    if (!nome || !email || !mensagem) {
       req.session.flash = {
        type: 'error',
        message: 'Preencha todos os campos obrigatórios.'
      };
    }

    await db.query(
      `INSERT INTO contactos (nome, email, assunto, mensagem, ip)
       VALUES ($1, $2, $3, $4, $5)`,
      [nome, email, assunto || null, mensagem, req.ip]
    );

     req.session.flash = {
        type: 'message',
        message: 'Formulário enviado com sucesso.'
      };
      res.redirect('/contactos')

  } catch (err) {
    console.error('Erro contacto:', err);
    res.status(500).json({ ok: false, message: 'Erro interno' });
  }
});

module.exports = router;

