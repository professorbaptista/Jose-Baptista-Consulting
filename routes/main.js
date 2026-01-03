
const express = require('express');

const router = express.Router();
const nodemailer = require("nodemailer");
const path = require('path');

router.get('/', (req, res) => {
    res.render('home', { title: 'Soluções Profissionais em Apoio Administrativo', subtitle: 'Apoio dedicado para imigrantes em Portugal.'})    
});

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
});

router.get('/termos-condicoes', (req, res) => {
    res.render('termos')
})


router.get('/pageNotFound', (req, res) => {
    res.status(404)
    res.render('404', {title: 'Pagina não encontrada'})
})

// Rota do blogue
router.get('/blogue', (req, res) => {
    
    res.render('blogues/blogue', {title: 'Chegou, Recentemente, à Portugal?', subtitle: 'Saiba o que Fazer Primeiro!'})
});

// Rota blogue artigo sobre o NIF
router.get('/blogue-nif', (req, res)=> {
  res.render('blogues/conteudo-blogue/como-tirar-nif', {title: 'Como Tirar o NIF em Portugal em 2026?', subtitle: 'Guia completo para estrangeiros'})
});  

// Rota blogue do artigo sobre o NISS
router.get('/blogue-niss', (re, res) =>{
  res.render('blogues/conteudo-blogue/como-tirar-niss', {title: 'Como Obter o NISS em Portugal', subtitle: 'Guia Completo para Trabalhadores e Imigrantes' })
});


// Rota blogue do artigo sobre o currículos
router.get('/blogue-curriculo', (req, res) => {

  res.render('blogues/conteudo-blogue/curriculo', {title: 'Currículos Profissionais', subtitle: 'Preparação para Entrevistas'})
})

router.get('/blogue-erros-curriculo', (req, res) =>{

  res.render('blogues/conteudo-blogue/erros-curriculo', {title: '5 Erros Críticos que Fazem o seu Currículo ser Descartado em 6 Segundos'});
});


const geoip = require('geoip-lite');

router.get('/obrigado', async (req, res) => {
    // 1. Obter o IP do visitante (considerando o proxy do Render)
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const geo = geoip.lookup(ip);
    const pais = geo ? geo.country : 'Desconhecido';

    // 2. Se o país for Portugal (PT), enviamos um alerta imediato
    if (pais === 'PT') {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'josejbbaptista@gmail.com',
                pass: process.env.EMAIL_PASS // A sua App Password de 16 caracteres
            }
        });

        await transporter.sendMail({
            from: 'Sistema de Alertas <josejbbaptista@gmail.com>',
            to: 'josejbbaptista@gmail.com',
            subject: '🚩 NOVA LEAD DE PORTUGAL!',
            text: `Um utilizador de Portugal acabou de chegar à página de agradecimento. Verifique o seu painel de admin ou o seu email para ver os detalhes do contacto.`
        });
    }

    res.render('obrigado', { title: 'Obrigado pelo seu Contacto!'})

    // res.sendFile(path.join(__dirname, '../views/obrigado.html'));
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
        user: "josejbbaptista@gmail.com",
        pass: "ifdorhkcyksdeuqw"
      },

      // ADICIONE ISTO AQUI:
      tls: {
        rejectUnauthorized: false
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