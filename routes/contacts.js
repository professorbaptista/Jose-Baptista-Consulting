// routes/contact.js
const express = require('express');
const db = require('../db');

const router = express.Router();

router.post('/', (req, res) => {
    try {
        const { nome, email, assunto, mensagem } = req.body;

        if (!nome || !email || !mensagem) {
            return res.status(400).json({ ok: false, message: "Todos os campos obrigatórios devem ser preenchidos." });
        }

        const stmt = db.prepare(`
            INSERT INTO contactos (nome, email, assunto, mensagem, ip)
            VALUES (?, ?, ?, ?, ?)
        `);
        
        stmt.run(nome, email, assunto || null, mensagem, req.ip);

        return res.json({ ok: true, message: "Mensagem recebida com sucesso." });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ ok: false, message: "Erro interno." });
    }
});

module.exports = router;
