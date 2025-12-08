
// routes/contact.js
const express = require('express');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { body, validationResult } = require('express-validator');
const sanitizeHtml = require('sanitize-html');
const nodemailer = require('nodemailer');

const router = express.Router();

// --- segurança adicional para esta router ---
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
    // ATENÇÃO: A variável de ambiente deve ser RECAPTCHA_SECRET (o valor é a chave secreta)
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
    return data;
}

// --- Transporter nodemailer (configurar com SMTP do domínio) ---
function createTransporter() {
    return nodemailer.createTransport({
        host: 'smtp.josebaptistaconsulting.pt', // Host do seu email profissional
        port: 465,
        secure: true, // Use SSL/TLS
        auth: {
            user: 'info@josejbbaptista@gmail.com', // Seu email completo
            // VARIÁVEL DE AMBIENTE CORRIGIDA E MAIS GENÉRICA
            pass: process.env.SMTP_PASSWORD, 
        },
    });
}

// --- POST / (submeter contacto) ---
router.post(
    '/', // A rota é só '/' porque será montada em '/api/contact' no app.js
    // Validação
    body('nome').trim().isLength({ min: 2, max: 80 }).withMessage('Nome inválido'),
    body('email').trim().isEmail().withMessage('Email inválido'),
    body('mensagem').trim().isLength({ min: 5, max: 5000 }).withMessage('Mensagem inválida'),
    body('website').optional().trim().escape(), // Honeypot
    body('recaptchaToken').optional().trim(),
    async (req, res) => {
        try {
            // 1. Validação (express-validator)
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ ok: false, message: errors.array()[0].msg });
            }

            const { nome, email, mensagem, website, recaptchaToken } = req.body;

            // 2. HONEYPOT check
            if (website && website.length > 0) {
                return res.status(400).json({ ok: false, message: 'Spam detetado.' });
            }

            // 3. reCAPTCHA v3 verification
            if (!recaptchaToken) {
                return res.status(400).json({ ok: false, message: 'reCAPTCHA não enviado.' });
            }
            // Usa req.ip, que agora está correto graças ao 'trust proxy'
            const recaptchaResp = await verifyRecaptcha(recaptchaToken, req.ip); 

            if (!recaptchaResp.success || (recaptchaResp.score || 0) < 0.5) {
                return res.status(400).json({ ok: false, message: 'Falha no reCAPTCHA ou atividade suspeita detetada.' });
            }

            // 4. Sanitizar campos
            const cleanName = sanitizeHtml(nome, { allowedTags: [], allowedAttributes: {} }).trim();
            const cleanEmail = sanitizeHtml(email, { allowedTags: [], allowedAttributes: {} }).trim();
            const cleanMessage = sanitizeHtml(mensagem, {
                allowedTags: ['br', 'p'],
                allowedAttributes: {}
            }).trim();

            // 5. Enviar email usando nodemailer
            const transporter = createTransporter();
            const mailOptions = {
                from: `"Website - Contacto" <info@josebaptistaconsulting.pt>`,
                to: 'info@josebaptistaconsulting.pt', // Onde deseja receber o email
                replyTo: cleanEmail,
                subject: `[Website] Novo Contacto: ${cleanName}`,
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

            return res.json({ ok: true, message: 'Mensagem enviada com sucesso.' });

        } catch (err) {
            console.error('Contact route error:', err);
            return res.status(500).json({ ok: false, message: 'Erro interno do servidor.' });
        }
    }
);

module.exports = router;