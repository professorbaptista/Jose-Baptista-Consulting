
const express = require('express');
const exhbs = require('express-handlebars');
const cors = require('cors');
const session = require('express-session');
const path = require('path');

require('dotenv').config();

const contactRoutes = require('./routes/contacts');
const adminRouter = require('./routes/admin');
const mainRoutes = require('./routes/main');

const app = express();

// Render usa proxy
app.set('trust proxy', 1);

// Middlewares base
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Sessões (SEM SQLite)
app.use(
  session({
    name: 'admin-session',
    secret: process.env.SESSION_SECRET || 'segredo-muito-forte',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Render termina SSL no proxy
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 2 // 2 horas
    }
  })
);

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Handlebars
const viewsPath = path.join(__dirname, 'views');
const layoutsDir = path.join(viewsPath, 'layouts');
const partialsDir = path.join(viewsPath, 'partials');

const hbs = exhbs.create({
  extname: '.handlebars',
  defaultLayout: 'main',
  layoutsDir,
  partialsDir,
  helpers: {
    inc: v => Number(v) + 1,
    dec: v => Math.max(1, Number(v) - 1),

    ifEq: function (a, b, options) {
      if (options && options.fn) {
        return String(a) === String(b)
          ? options.fn(this)
          : options.inverse(this);
      }
      return String(a) === String(b);
    },

    gt: function (a, b, options) {
      if (options && options.fn) {
        return a > b ? options.fn(this) : options.inverse(this);
      }
      return a > b;
    },

    lt: function (a, b, options) {
      if (options && options.fn) {
        return a < b ? options.fn(this) : options.inverse(this);
      }
      return a < b;
    }
  }
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');


app.use((req, res, next) => {
  res.locals.flash = req.session.flash || null;
  delete req.session.flash;
  next();
});

// Rotas
app.use('/contact', contactRoutes);
app.use('/admin', adminRouter);
app.use('/', mainRoutes);

// Porta
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Aplicação a correr na porta ${PORT}`);
});
