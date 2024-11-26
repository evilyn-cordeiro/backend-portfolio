import { VercelRequest, VercelResponse } from "@vercel/node"; // Importação correta para Vercel
import express from "express";
import bodyParser from "body-parser";
import fs from "fs";
import path from "path";

const app = express();
app.use(bodyParser.json());

const readDataFile = () => {
  const filePath = path.join(__dirname, "data.json");
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data);
  }
  return [];
};

const saveDataFile = (
  data: { nome: string; email: string; empresa: string }[]
) => {
  const filePath = path.join(__dirname, "data.json");
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
};

app.post("/api/form", (req: any, res: any) => {
  const { nome, email, empresa } = req.body;

  if (!nome || !email || !empresa) {
    return res
      .status(400)
      .json({ message: "Nome, email e empresa são obrigatórios" });
  }

  const newData = { nome, email, empresa };
  const data = readDataFile();
  data.push(newData);
  saveDataFile(data);

  return res.status(200).json({ message: "Dados recebidos com sucesso!" });
});

// Exportação correta para o Vercel
export default (req: VercelRequest, res: VercelResponse) => {
  return app(req, res);
};
