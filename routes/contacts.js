// routes/contact.js
const express = require('express');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { body, validationResult } = require('express-validator');
const sanitizeHtml = require('sanitize-html');
const nodemailer = require('nodemailer');

const router = express.Router();

router.post("/contact", async (req, res) => {
  const { token } = req.body;

  const response = await fetch(
    `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_6LcmYxksAAAAABP3oZXVxB14UyftRl_jaa-rlNDX}&response=${token}`,
    { method: "POST" }
  );

  const data = await response.json();

  if (!data.success) {
    return res.status(400).json({ message: "Falha no reCAPTCHA" });
  }

  res.json({ message: "OK" });
});

// --- segurança adicional para esta router (podes aplicar globalmente em index.js) ---
router.use(helmet());

// --- Rate limiter para evitar spam: ajustar conforme necessário ---
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: parseInt(process.env.RATE_LIMIT_MAX || '10', 10), // 10 requests por IP por hora
  message: { ok: false, message: 'Demasiadas submissões. Tenta novamente mais tarde.' },
  standardHeaders: true,
  legacyHeaders: false,
});
router.use(limiter);

// --- Helper: verificar recaptcha v3 ---
async function verifyRecaptcha(token, remoteip) {
  const secret = process.env.RECAPTCHA_SECRET;
  if (!secret) return { ok: false, error: 'no-recaptcha-secret' };

  const params = new URLSearchParams();
  params.append('secret', secret);
  params.append('response', token);
  if (remoteip) params.append('remoteip', remoteip);

  const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    body: params
  });
  const data = await res.json();
  return data; // contains success, score, action, etc.
}

// --- Transporter nodemailer (configurar com SMTP do domínio) ---
function createTransporter() {
  return nodemailer.createTransport({
    host: 'smtp.josebaptistaconsulting.pt',
    port: 465,
    secure: true,
    auth: {
      user: 'info@josebaptistaconsulting.pt',
      pass: process.env.SMTP_CONSULTINGPORTUGAL2025,
    },
  });
}

// --- POST / (submeter contacto) ---
// 1) Honeypot: campo 'website' invisível deve estar vazio
// 2) recaptchaToken: token do reCAPTCHA v3 enviado do cliente
// 3) validação e sanitização com express-validator + sanitize-html
router.post(
  '/',
  // validação/ sanitização básica
  body('nome').trim().isLength({ min: 2, max: 80 }).withMessage('Nome inválido'),
  body('email').trim().isEmail().withMessage('Email inválido'),
  body('mensagem').trim().isLength({ min: 5, max: 5000 }).withMessage('Mensagem inválida'),
  body('website').optional().trim().escape(), // honeypot -> deve estar vazio
  body('recaptchaToken').optional().trim(),
  async (req, res) => {
    try {
      // validação
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ ok: false, errors: errors.array() });
      }

      const { nome, email, mensagem, website, recaptchaToken } = req.body;

      // --- HONEYPOT check ---
      if (website && website.length > 0) {
        // Provável bot
        return res.status(400).json({ ok: false, message: 'Spam detetado (honeypot).' });
      }

      // --- reCAPTCHA v3 verification (invisible) ---
      if (!recaptchaToken) {
        return res.status(400).json({ ok: false, message: 'reCAPTCHA não enviado.' });
      }
      const recaptchaResp = await verifyRecaptcha(recaptchaToken, req.ip);

      // recaptchaResp e.g. { success: true, score: 0.9, action: 'contact' }
      if (!recaptchaResp.success) {
        return res.status(400).json({ ok: false, message: 'Falha no reCAPTCHA.' });
      }
      // Ajusta este limiar conforme o teu tráfego; 0.5 é razoável
      const MIN_SCORE = 0.5;
      if ((recaptchaResp.score || 0) < MIN_SCORE) {
        return res.status(400).json({ ok: false, message: 'Atividade suspeita detetada.' });
      }

      // --- Sanitizar campos para evitar XSS e conteúdo HTML indesejado ---
      const cleanName = sanitizeHtml(nome, { allowedTags: [], allowedAttributes: {} }).trim();
      const cleanEmail = sanitizeHtml(email, { allowedTags: [], allowedAttributes: {} }).trim();
      const cleanMessage = sanitizeHtml(mensagem, {
        allowedTags: ['br', 'p'],
        allowedAttributes: {}
      }).trim();

      // --- Limpeza extra de conteúdo (remover URLs longas, etc) opcional ---
      // se quiseres truncar: cleanMessage = cleanMessage.slice(0, 4000);

      // --- Enviar email usando nodemailer ---
      const transporter = createTransporter();
      const mailOptions = {
        from: `"Website - Contacto" <info@josebaptistaconsulting.pt>`,
        to: 'info@josebaptistaconsulting.pt',
        replyTo: cleanEmail,
        subject: 'Novo contacto do website',
        html: `
          <h3>Novo contacto recebido</h3>
          <p><strong>Nome:</strong> ${cleanName}</p>
          <p><strong>Email:</strong> ${cleanEmail}</p>
          <p><strong>IP:</strong> ${req.ip}</p>
          <p><strong>Mensagem:</strong><br>${cleanMessage.replace(/\n/g, '<br>')}</p>
          <hr>
          <p>reCAPTCHA score: ${recaptchaResp.score || 'n/a'}</p>
        `
      };

      await transporter.sendMail(mailOptions);

      // opcional: resposta automática ao cliente
      // await transporter.sendMail({ from: ..., to: cleanEmail, subject: 'Recebemos a sua mensagem', ... });

      return res.json({ ok: true, message: 'Mensagem enviada com sucesso.' });

    } catch (err) {
      console.error('Contact route error:', err);
      return res.status(500).json({ ok: false, message: 'Erro interno.' });
    }
  }
);

module.exports = router;
