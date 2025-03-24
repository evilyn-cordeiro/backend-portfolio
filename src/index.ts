import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import validator from "validator"; // Para validação do e-mail

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseKey = process.env.SUPABASE_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

const app = express();

console.log("SUPABASE_URL:", process.env.SUPABASE_URL);
console.log("SUPABASE_KEY:", process.env.SUPABASE_KEY);

app.use(
  cors({
    origin: ["https://evacod.vercel.app", "http://localhost:3000"],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

// Função para enviar o e-mail com o currículo
async function sendEmail(to: string, nome: string) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: to,
    subject: "Curriculum Request | Evilyn Cordeiro",
    text: `Dear ${nome},\n\nI hope this message finds you well.\n\nPlease find attached my resume for your review.\n\nIf you have any questions or need further information, feel free to reach out.\n\nBest regards,\nEvilyn Cordeiro`,
    attachments: [
      {
        filename: "curriculo-evilyndev.pdf",
        path: "./public/curriculo-evilyndev.pdf",
      },
    ],
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("E-mail enviado com sucesso!");
  } catch (error) {
    console.error("Erro ao enviar e-mail:", error);
    throw new Error("Erro ao enviar o e-mail.");
  }
}

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

app.post("/api/form", async (req: Request, res: Response) => {
  const { nome, email, empresa } = req.body;

  // Validação de entrada
  if (!nome || !email || !empresa) {
    return res.status(400).json({
      message: "Os campos 'nome', 'email' e 'empresa' são obrigatórios.",
    });
  }

  // Validação de e-mail
  if (!validator.isEmail(email)) {
    return res.status(400).json({
      message: "O e-mail fornecido é inválido.",
    });
  }

  try {
    // Salvar os dados no Supabase
    const { data, error } = await supabase
      .from("data_visitants")
      .insert([{ nome, email, empresa }])
      .select();

    if (error) {
      throw error;
    }

    // Enviar o e-mail com o currículo após salvar os dados
    await sendEmail(email, nome);

    return res
      .status(201)
      .json({ message: "Dados salvos e e-mail enviado com sucesso!", data });
  } catch (error: any) {
    console.error("Erro ao salvar dados ou enviar o e-mail:", error.message);
    return res
      .status(500)
      .json({ message: "Erro ao salvar dados ou enviar o e-mail." });
  }
});

export default app;
