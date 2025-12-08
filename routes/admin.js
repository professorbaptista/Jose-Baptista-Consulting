
const express = require('express');
const db = require('../db');
const adminAuth = require('../auth');

const router = express.Router();

// Todas as rotas admin exigem password
router.use(adminAuth);

// Página principal: lista todos os contactos
router.get('/contactos', (req, res) => {
    const stmt = db.prepare("SELECT * FROM contactos ORDER BY data_envio DESC");
    const contactos = stmt.all();

    let html = `
        <h1>Painel de Contactos</h1>
        <p>Total: ${contactos.length}</p>
        <table border="1" cellpadding="10" style="border-collapse: collapse; width:100%;">
        <thead>
            <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Email</th>
                <th>Assunto</th>
                <th>Data</th>
                <th>Abrir</th>
            </tr>
        </thead>
        <tbody>
    `;

    contactos.forEach(c => {
        html += `
            <tr>
                <td>${c.id}</td>
                <td>${c.nome}</td>
                <td>${c.email}</td>
                <td>${c.assunto || "-"}</td>
                <td>${c.data_envio}</td>
                <td><a href="/admin/contacto/${c.id}">Ver</a></td>
            </tr>
        `;
    });

    html += "</tbody></table>";

    res.send(html);
});

// Página individual
router.get('/contacto/:id', (req, res) => {
    const stmt = db.prepare("SELECT * FROM contactos WHERE id = ?");
    const c = stmt.get(req.params.id);

    if (!c) return res.status(404).send("Contacto não encontrado.");

    res.send(`
        <h1>Contacto #${c.id}</h1>
        <p><strong>Nome:</strong> ${c.nome}</p>
        <p><strong>Email:</strong> ${c.email}</p>
        <p><strong>Assunto:</strong> ${c.assunto || "-"}</p>
        <p><strong>IP:</strong> ${c.ip || "-"}</p>
        <p><strong>Data:</strong> ${c.data_envio}</p>
        <hr>
        <h3>Mensagem:</h3>
        <p>${c.mensagem.replace(/\n/g, '<br>')}</p>
        <p><a href="/admin/contactos">Voltar</a></p>
    `);
});

module.exports = router;
