const express = require ('express');

const exhbs = require('express-handlebars')

const cors = require("cors");

require("dotenv").config();

const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);

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
app.use(session({
  store: new SQLiteStore({ db: 'sessions.sqlite', dir: './' }),
  secret: process.env.SESSION_SECRET || 'dev_secret_change_me',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 dia
}));



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

const hbs = exhbs.create({});
hbs.handlebars.registerHelper('inc', v => v+1);
hbs.handlebars.registerHelper('dec', v => Math.max(1, v-1));
hbs.handlebars.registerHelper('ifEq', (a,b,opts) => (String(a)===String(b)) ? opts.fn(this) : opts.inverse(this));
hbs.handlebars.registerHelper('gt', (a,b,opts) => a > b);
hbs.handlebars.registerHelper('lt', (a,b,opts) => a < b);
app.engine('handlebars', hbs.engine);


const db = require('./db');

app.use('/admin', adminRouter);


app.use('/', mainRoutes)

app.listen(PORT, () => {
    console.log(`Aplicativo dos serviços web rodando na porta ${PORT}`);
}); 