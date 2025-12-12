
// routes/contact.js
const express = require('express');
const db = require('../db');
const nodemailer = require('nodemailer');

const router = express.Router();

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '465', 10),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

router.post('/', async (req, res) => {
  try {
    const { nome, email, assunto, mensagem } = req.body;
    if (!nome || !email || !mensagem) {
      return res.status(400).json({ ok: false, message: "Todos os campos obrigatórios devem ser preenchidos." });
    }

    const stmt = db.prepare(`
      INSERT INTO contactos (nome, email, assunto, mensagem, ip)
      VALUES (?, ?, ?, ?, ?)
    `);
    const info = stmt.run(nome, email, assunto || null, mensagem, req.ip || req.connection.remoteAddress);

    // enviar email automático ao cliente (opcional)
    try {
      const transporter = createTransporter();
      const from = process.env.FROM_EMAIL || process.env.SMTP_USER;
      await transporter.sendMail({
        from,
        to: email,
        subject: `Recebemos a sua mensagem — ${process.env.SITE_NAME || 'José Baptista Consulting'}`,
        html: `
          <p>Olá ${nome},</p>
          <p>Recebemos a sua mensagem e vamos responder o mais breve possível.</p>
          <hr>
          <p><strong>Resumo da sua mensagem:</strong></p>
          <p><em>${assunto || 'Sem assunto'}</em></p>
          <p>${mensagem.replace(/\n/g, '<br>')}</p>
          <p>— José Baptista Consulting</p>
        `
      });
    } catch (mailErr) {
      console.error("Erro a enviar email de confirmação:", mailErr);
      // não falhar a requisição principal — só log
    }

    return res.json({ ok: true, message: "Mensagem recebida com sucesso." });
  } catch (error) {
    console.error("Erro /contact:", error);
    return res.status(500).json({ ok: false, message: "Erro interno." });
  }
});

module.exports = router;
