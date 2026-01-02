
const db = require('../db');
const nodemailer = require('nodemailer');

async function runBackup() {
  try {
    // 1. Ir buscar todos os contactos
    const result = await db.query('SELECT * FROM contactos ORDER BY data_envio DESC');
    const csvContent = "Nome,Email,Assunto,Mensagem,Data\n" + 
      result.rows.map(r => `"${r.nome}","${r.email}","${r.assunto}","${r.mensagem}","${r.data_envio}"`).join("\n");

    // 2. Configurar o transporte (usando a sua App Password de 16 caracteres)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'josejbbaptista@gmail.com',
        pass: process.env.EMAIL_PASS // Já configurada no Render [cite: 1, 11]
      }
    });

    // 3. Enviar o email com o backup
    await transporter.sendMail({
      from: 'josejbbaptista@gmail.com',
      to: 'josejbbaptista@gmail.com',
      subject: `Backup Semanal - José Baptista Consulting - ${new Date().toLocaleDateString()}`,
      text: 'Em anexo segue o backup semanal dos seus contactos.',
      attachments: [{ filename: 'backup_contactos.csv', content: csvContent }]
    });

    console.log("Backup enviado com sucesso!");
    process.exit(0);
  } catch (err) {
    console.error("Erro no backup:", err);
    process.exit(1);
  }
}

runBackup();