
const express = require('express');
const db = require('../db');
const axios = require('axios');
const nodemailer = require('nodemailer');
const router = express.Router();

// router.post('/', async (req, res) => {
//     const { website, nome, email, assunto, mensagem } = req.body;

//     // 1. Honeypot para Bots
//     if (website) {
//         return res.redirect('/contactos');
//     }

//     try {
//         const token = req.body['g-recaptcha-response'];
//         const secretKey = process.env.RECAPTCHA_SECRET_KEY;

//         // 2. Gravação Obrigatória na Base de Dados (Para aparecer no Admin)
//         await db.query(
//             `INSERT INTO contactos (nome, email, assunto, mensagem, ip)
//              VALUES ($1, $2, $3, $4, $5)`,
//             [nome, email, assunto || null, mensagem, req.ip]
//         );

//         // 3. Envio de Notificação por E-mail (Opcional)
//         const transporter = nodemailer.createTransport({
//             service: 'gmail',
//             auth: {
//                 user: 'josejbbaptista@gmail.com', // Endereço atualizado conforme solicitado
//                 pass: process.env.EMAIL_PASS
//             }
//         });

//         await transporter.sendMail({
//             from: 'josejbbaptista@gmail.com',
//             to: 'josejbbaptista@gmail.com',
//             subject: `Novo Contacto: ${assunto}`,
//             text: `Nome: ${nome}\nEmail: ${email}\nMensagem: ${mensagem}`
//         });

//         // 4. Redirecionamento de Sucesso (Sem JSON)
//         return res.redirect('/obrigado');

//     } catch (err) {
//         console.error('Erro no processamento:', err);
//         return res.redirect('/contactos?erro=true');
//     }
// });

module.exports = router;
