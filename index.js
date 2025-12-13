const express = require ('express');

const exhbs = require('express-handlebars')

const cors = require("cors");

require("dotenv").config();

const session = require('express-session');

const path = require ('path');
const contactRoutes = require('./routes/contacts');
const adminRouter = require('./routes/admin');

const app = express();
// ESTA LINHA É CRÍTICA NO RENDER!
app.set('trust proxy', 1);
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors());
app.use("/contact", contactRoutes);

// session (colocar antes das rotas)
const SQLiteStore = require("connect-sqlite3")(session);

app.use(
  session({
    store: new SQLiteStore({
      db: "sessions.db",
      dir: "./data"  // mesma pasta da base de dados contactos
    }),
    secret: process.env.SESSION_SECRET || "segredo-maximo",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,        // No Render: app é HTTP atrás de proxy
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 2, // 2 horas
    },
  })
);

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

// Configuração do handlebars (com partials)
const viewsPath = path.join(__dirname, 'views')
const layoutsDir = path.join(viewsPath, 'layouts')
const partialsDir = path.join(viewsPath, 'partials')

app.engine('handlebars', exhbs.engine({
    extname: '.handlebars',
    defaultLayout: 'main',
    layoutsDir,
    partialsDir
}))

app.set('view engine', 'handlebars')
// Chamando as rotas
const mainRoutes = require('./routes/main');

// const hbs = exhbs.create({});
// hbs.handlebars.registerHelper('inc', v => v+1);
// hbs.handlebars.registerHelper('dec', v => Math.max(1, v-1));
// hbs.handlebars.registerHelper('ifEq', (a,b,opts) => (String(a)===String(b)) ? opts.fn(this) : opts.inverse(this));
// hbs.handlebars.registerHelper('gt', (a,b,opts) => a > b);
// hbs.handlebars.registerHelper('lt', (a,b,opts) => a < b);
// app.engine('handlebars', hbs.engine);


const db = require('./db');

app.use('/admin', adminRouter);


app.use('/', mainRoutes)

app.listen(PORT, () => {
    console.log(`Aplicativo dos serviços web rodando na porta ${PORT}`);
}); 