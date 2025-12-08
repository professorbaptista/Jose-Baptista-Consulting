
// auth.js — proteção com password simples (admin)

module.exports = function adminAuth(req, res, next) {
    const senha = process.env.ADMIN_PASSWORD;

    if (!senha) {
        return res.status(500).send("ERRO: ADMIN_PASSWORD não definida.");
    }

    // autenticação básica
    const auth = req.headers.authorization;

    if (!auth) {
        res.set('WWW-Authenticate', 'Basic realm="Área Administrativa"');
        return res.status(401).send("Autenticação necessária.");
    }

    const base64 = auth.split(' ')[1];
    const [user, pass] = Buffer.from(base64, 'base64').toString().split(':');

    if (user === "admin" && pass === senha) {
        return next();
    }

    res.set('WWW-Authenticate', 'Basic realm="Área Administrativa"');
    return res.status(401).send("Credenciais inválidas.");
};
