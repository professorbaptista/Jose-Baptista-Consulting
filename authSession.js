
// authSession.js
module.exports = function (req, res, next) {
  if (req.session && req.session.admin && req.session.admin.user === 'admin') {
    return next();
  }
  // Se for chamada XHR, devolve 401 JSON
  if (req.xhr || req.headers.accept.indexOf('json') > -1) {
    return res.status(401).json({ ok: false, message: 'Autenticação necessária' });
  }
  res.redirect('/admin/login');
};
