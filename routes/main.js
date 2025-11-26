
const express = require('express');

const router = express.Router();
const nodemailer = require("nodemailer");

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
});

// Rota para envio e tratamento dos dados dos clientes

router.post("/", async (req, res) => {
  const { nome, email, mensagem, rgpd } = req.body;

  if (!rgpd) {
    return res.status(400).json({ success: false, message: "RGPD não aceite" });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",         // ou o SMTP do teu hosting (melhor)
      port: 587,
      secure: false,
      auth: {
        user: "info@josebaptistaconsulting.pt",
        pass: "AQUI_A_PASSWORD_DO_EMAIL"
      }
    });

    await transporter.sendMail({
      from: `"Website - Contacto" <info@josebaptistaconsulting.pt>`,
      to: "info@josebaptistaconsulting.pt",
      subject: "Novo contacto do website",
      html: `
        <h2>Novo contacto do formulário</h2>
        <p><strong>Nome:</strong> ${nome}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Mensagem:</strong><br>${mensagem}</p>
      `
    });

    res.json({ success: true, message: "Mensagem enviada com sucesso!" });

  } catch (error) {
    console.error("Erro ao enviar email:", error);
    res.status(500).json({ success: false, message: "Erro ao enviar email" });
  }
});


// Para guardar as mensagens


module.exports = router;