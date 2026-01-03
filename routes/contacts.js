
const express = require('express');
const db = require('../db');
const axios = require('axios');
const nodemailer = require('nodemailer'); // ADICIONADO
const router = express.Router();

router.post('/', async (req, res) => {
    // 1. Honeypot (Campo escondido para bots)
    const { website, nome, email, assunto, mensagem } = req.body;
    if (website) {
        console.warn("Bot detectado via Honeypot");
        return res.status(400).send("Spam detectado.");
    }

    try {
        const token = req.body['g-recaptcha-response'];
        const secretKey = process.env.RECAPTCHA_SECRET_KEY;

        // 2. Validação básica
        if (!nome || !email || !mensagem) {
            return res.status(400).json({ success: false, message: 'Preencha os campos obrigatórios.' });
        }

        // 3. Verificar reCAPTCHA v3
        const recaptchaRes = await axios.post(
            `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`
        );

        if (!recaptchaRes.data.success || recaptchaRes.data.score < 0.5) {
            console.warn(`Spam bloqueado: ${email} [Score: ${recaptchaRes.data.score}]`);
            return res.status(403).json({ success: false, message: "Falha na verificação de segurança." });
        }

        // 4. Grava na base de dados (PostgreSQL)
        await db.query(
            `INSERT INTO contactos (nome, email, assunto, mensagem, ip)
             VALUES ($1, $2, $3, $4, $5)`,
            [nome, email, assunto || null, mensagem, req.ip]
        );

        // 5. ENVIO DE E-MAIL (A parte que faltava)
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'josejbbaptista@gmail.com',
                pass: process.env.EMAIL_PASS // A chave de 16 dígitos gerada hoje
            }
        });

        const mailOptions = {
            from: 'josejbbaptista@gmail.com',
            to: 'josejbbaptista@gmail.com',
            subject: `Novo Contacto: ${assunto || 'Sem Assunto'}`,
            text: `Nome: ${nome}\nEmail: ${email}\nMensagem: ${mensagem}`
        };

        await transporter.sendMail(mailOptions);
        console.log("E-mail enviado com sucesso!");

        // 6. Resposta de Sucesso (O Front-end fará o redirecionamento para /obrigado)
        return res.status(200).json({ success: true });

    } catch (err) {
        console.error('Erro detalhado no processamento:', err);
        return res.status(500).json({ success: false, message: 'Erro interno no servidor.' });
    }
});

module.exports = router;