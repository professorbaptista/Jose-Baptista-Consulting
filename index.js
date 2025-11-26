const express = require ('express');

const exhbs = require('express-handlebars')

const cors = require("cors");

require("dotenv").config();

const path = require ('path');
const contactRoutes = require('./routes/contacts');

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors());
app.use("/api/contact", contactRoutes);

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

app.use('/', mainRoutes)

app.listen(PORT, () => {
    console.log(`Aplicativo dos serviços web rodando na porta ${PORT}`);
}); 