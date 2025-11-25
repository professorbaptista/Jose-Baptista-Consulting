
const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
    res.render('home', { title: 'Soluções Profissionais em Apoio Administrativo', subtitle: 'Apoio dedicado para imigrantes em Portugal.'})    
})

router.get('/about', (req, res) => {
    res.render('about', {title: 'Saiba mais Sobre Mim'})
})

router.get('/servicos', (req, res) => {
    res.render('servicos', {title: 'Serviços Burocraticos',  sectionTitle: 'Apoio NIF, NISS e Actividade'})
})

router.post('/depoimento_deixado', (req, res) => {
    res.render('depoimento_deixado', {title: 'Desenvolvimento Web'})
})
router.get('/depoimentos', (req, res) => {
    res.render('depoimentos', {title: 'Meu Blogue'})
})

router.get('/contactos', (req, res) => {
    res.render('contactos', {title: 'Meus contactos'})
})

router.get('/politica-privacidade', (req, res) => {
    res.render('politica')
})

router.get('/termos-condicoes', (req, res) => {
    res.render('termos')
})


router.use('/pageNotFound', (req, res) => {
    res.status(404)
    res.render('404', {title: 'Pagina não encontrada'})
})

router.use('/serverError', (req, res) => {
    res.status(500)
    res.render('500', {title: 'Erro de servidor'})
})

module.exports = router;