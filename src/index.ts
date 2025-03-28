import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import validator from "validator";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseKey = process.env.SUPABASE_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

const app = express();

app.use(
  cors({
    origin: ["https://evacod.vercel.app", "http://localhost:3000"],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

const messages: any = {
  en: {
    missingFields: "The fields 'name', 'email' and 'company' are required.",
    invalidEmail: "The provided email is invalid.",
    success: "Data saved and email sent successfully!",
    emailSubject: "Curriculum Request | Evilyn Cordeiro",
    emailText:
      "Dear {name},\n\nI hope this message finds you well.\n\nPlease find attached my resume for your review.\n\nIf you have any questions or need further information, feel free to reach out.\n\nBest regards,\nEvilyn Cordeiro",
    errorSavingData: "Error saving data or sending email.",
  },
  pt: {
    missingFields: "Os campos 'nome', 'email' e 'empresa' são obrigatórios.",
    invalidEmail: "O e-mail fornecido é inválido.",
    success: "Dados salvos e e-mail enviado com sucesso!",
    emailSubject: "Solicitação de Currículo | Evilyn Cordeiro",
    emailText:
      "Olá {name},\n\nEspero que esta mensagem o encontre bem.\n\nSegue em anexo o meu currículo para sua análise.\n\nSe tiver alguma dúvida ou precisar de mais informações, fique à vontade para entrar em contato.\n\nAtenciosamente,\nEvilyn Cordeiro",
    errorSavingData: "Erro ao salvar dados ou enviar o e-mail.",
  },
};

async function sendEmail(to: string, nome: string, idioma: string) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const attachmentPath =
    idioma === "en"
      ? "./public/cv-evilyndev-en.pdf"
      : "./public/curriculo-evilyndev.pdf";

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: to,
    subject: messages[idioma].emailSubject,
    text: messages[idioma].emailText.replace("{name}", nome),
    attachments: [
      {
        filename:
          idioma === "en" ? "cv-evilyndev-en.pdf" : "curriculo-evilyndev.pdf",
        path: attachmentPath,
      },
    ],
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("E-mail enviado com sucesso!");
  } catch (error) {
    console.error("Erro ao enviar e-mail:", error);
    throw new Error(messages[idioma].errorSavingData);
  }
}

app.post("/api/form", async (req: Request, res: Response) => {
  const { nome, email, empresa, idioma } = req.body;

  if (!nome || !email || !empresa) {
    return res.status(400).json({
      message: messages[idioma].missingFields,
    });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({
      message: messages[idioma].invalidEmail,
    });
  }

  try {
    const { data, error } = await supabase
      .from("data_visitants")
      .insert([{ nome, email, empresa, idioma }])
      .select();

    if (error) {
      throw error;
    }

    await sendEmail(email, nome, idioma);

    return res.status(201).json({ message: messages[idioma].success, data });
  } catch (error: any) {
    console.error("Erro ao salvar dados ou enviar o e-mail:", error.message);
    return res.status(500).json({ message: messages[idioma].errorSavingData });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

export default app;
