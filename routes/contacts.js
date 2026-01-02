
const express = require('express');
const db = require('../db');
const axios = require('axios');
const router = express.Router();

router.post('/', async (req, res) => {

      // Se o campo 'website' estiver preenchido, é um BOT (Honeypot)
if (website) {
    console.warn("Bot detectado via Honeypot");
    return res.status(400).send("Spam detectado.");
}

  try {
    const { nome, email, assunto, mensagem } = req.body;
    const token = req.body['g-recaptcha-response'];
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;

    // 1. Validação básica de campos

    if (!nome || !email || !mensagem) {
      req.session.flash = { type: 'error', message: 'Preencha os campos obrigatórios.' };
      return res.redirect('/contactos');
    }

    // 2. Verificar reCAPTCHA junto do Google
    const recaptchaRes = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`
    );

    // 3. Decidir se é humano (score > 0.5)
    // O v3 retorna um score de 0.0 (bot) a 1.0 (humano)
    if (!recaptchaRes.data.success || recaptchaRes.data.score < 0.5) {
      console.warn(`Spam bloqueado: ${email} [Score: ${recaptchaRes.data.score}]`);
      return res.status(403).send("Falha na verificação de segurança (Spam detectado).");
    }

    // 4. Se for humano, grava na base de dados
    await db.query(
      `INSERT INTO contactos (nome, email, assunto, mensagem, ip)
       VALUES ($1, $2, $3, $4, $5)`,
      [nome, email, assunto || null, mensagem, req.ip]
    );

    req.session.flash = { type: 'message', message: 'Formulário enviado com sucesso.' };
    res.redirect('/contactos');

  } catch (err) {
    console.error('Erro no processamento do contacto:', err);
    res.status(500).send('Erro interno ao processar a mensagem.');
  }
});

module.exports = router;