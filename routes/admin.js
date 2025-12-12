
const express = require('express');
const db = require('../db');
const authSession = require('../authSession');
const { stringify } = require('csv-stringify/sync');
const moment = require('moment');

const router = express.Router();


// ===============================
// 🔓 1. ROTAS LIVRES (login)
// ===============================
router.get('/login', (req, res) => {
  res.render('admin/login', { error: null });
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username === "admin" && password === process.env.ADMIN_PASSWORD) {
      req.session.admin = { user: "admin" };
      return res.redirect('/admin');
  }

  res.render('admin/login', { error: "Credenciais inválidas" });
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.redirect('/admin/login');
  });
});


// ===============================
// 🔐 2. PROTEÇÃO DAS ROTAS ADMIN
// ===============================
router.use(authSession);


// ===============================
// 📊 3. DASHBOARD
// ===============================
router.get('/', (req, res) => {
  try {
    const totalStmt = db.prepare("SELECT COUNT(*) as total FROM contactos");
    const total = totalStmt.get().total;

    const today = moment().format('YYYY-MM-DD');
    const todayStmt = db.prepare("SELECT COUNT(*) as total FROM contactos WHERE date(data_envio) = ?");
    const todayCount = todayStmt.get(today).total;

    const last7 = db.prepare(`
      SELECT date(data_envio) as day, COUNT(*) as cnt
      FROM contactos
      WHERE date(data_envio) >= date('now','-6 days')
      GROUP BY day
      ORDER BY day DESC
    `).all();

    res.render('admin/dashboard', {
      total,
      todayCount,
      last7
    });

  } catch (err) {
    console.error(err);
    res.status(500).send('Erro interno.');
  }
});


// ===============================
// 📩 4. LISTA DE CONTACTOS + FILTROS
// ===============================
router.get('/contactos', (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const per = Math.max(5, parseInt(req.query.per || '15', 10));
    const offset = (page - 1) * per;

    const { q, email, nome, date_from, date_to } = req.query;

    const where = [];
    const params = [];

    if (q) {
      const like = `%${q}%`;
      where.push("(nome LIKE ? OR email LIKE ? OR mensagem LIKE ? OR assunto LIKE ?)");
      params.push(like, like, like, like);
    }
    if (email) { where.push("email = ?"); params.push(email); }
    if (nome) { where.push("nome LIKE ?"); params.push(`%${nome}%`); }
    if (date_from) { where.push("date(data_envio) >= date(?)"); params.push(date_from); }
    if (date_to) { where.push("date(data_envio) <= date(?)"); params.push(date_to); }

    const whereSql = where.length ? "WHERE " + where.join(" AND ") : "";

    const total = db.prepare(`SELECT COUNT(*) as total FROM contactos ${whereSql}`).get(...params).total;

    const rows = db.prepare(`
      SELECT * FROM contactos 
      ${whereSql} 
      ORDER BY data_envio DESC 
      LIMIT ? OFFSET ?
    `).all(...params, per, offset);

    const pages = Math.ceil(total / per);

    res.render('admin/contactos', {
      contactos: rows,
      total,
      page,
      per,
      pages,
      query: { q, email, nome, date_from, date_to }
    });

  } catch (err) {
    console.error(err);
    res.status(500).send('Erro interno.');
  }
});


// ===============================
// 📨 5. VER UM CONTACTO
// ===============================
router.get('/contacto/:id', (req, res) => {
  try {
    const contacto = db.prepare("SELECT * FROM contactos WHERE id = ?").get(req.params.id);

    if (!contacto) return res.status(404).send("Contacto não encontrado.");

    res.render('admin/ver-contacto', contacto);

  } catch (err) {
    console.error(err);
    res.status(500).send("Erro interno.");
  }
});


// ===============================
// 📤 6. EXPORTAÇÃO CSV
// ===============================
router.get('/export', (req, res) => {
  try {
    const { q, email, nome, date_from, date_to } = req.query;
    const where = [];
    const params = [];

    if (q) {
      const like = `%${q}%`;
      where.push("(nome LIKE ? OR email LIKE ? OR mensagem LIKE ? OR assunto LIKE ?)");
      params.push(like, like, like, like);
    }
    if (email) { where.push("email = ?"); params.push(email); }
    if (nome) { where.push("nome LIKE ?"); params.push(`%${nome}%`); }
    if (date_from) { where.push("date(data_envio) >= date(?)"); params.push(date_from); }
    if (date_to) { where.push("date(data_envio) <= date(?)"); params.push(date_to); }

    const whereSql = where.length ? "WHERE " + where.join(" AND ") : "";
    const rows = db.prepare(
      `SELECT * FROM contactos ${whereSql} ORDER BY data_envio DESC`
    ).all(...params);

    const csv = stringify(rows, { header: true });

    res.header('Content-Type', 'text/csv');
    res.attachment(`contactos-${moment().format('YYYYMMDD')}.csv`);
    res.send(csv);

  } catch (err) {
    console.error(err);
    res.status(500).send("Erro interno.");
  }
});


module.exports = router;
