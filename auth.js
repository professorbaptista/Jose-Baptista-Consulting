
// auth.js
// Middleware simples de autenticação básica para o painel admin.
// Usage: app.use('/admin', require('./auth'), adminRouter);

module.exports = function adminAuth(req, res, next) {
  const senha = process.env.ADMIN_PASSWORD;

  if (!senha) {
    return res.status(500).send("ERRO: ADMIN_PASSWORD não definida.");
  }

  const auth = req.headers.authorization;
  if (!auth) {
    res.set('WWW-Authenticate', 'Basic realm="Área Administrativa"');
    return res.status(401).send("Autenticação necessária.");
  }

  // auth tem formato: "Basic base64(user:pass)"
  const parts = auth.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Basic') {
    res.set('WWW-Authenticate', 'Basic realm="Área Administrativa"');
    return res.status(401).send("Autenticação necessária.");
  }

  try {
    const base64 = parts[1];
    const [user, pass] = Buffer.from(base64, 'base64').toString().split(':');

    // user fixo "admin" e pass = ADMIN_PASSWORD
    if (user === "admin" && pass === senha) {
      return next();
    }

    res.set('WWW-Authenticate', 'Basic realm="Área Administrativa"');
    return res.status(401).send("Credenciais inválidas.");
  } catch (err) {
    res.set('WWW-Authenticate', 'Basic realm="Área Administrativa"');
    return res.status(401).send("Credenciais inválidas.");
  }
};
