import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import fs from "fs";
import path from "path";
import cors from "cors";

const app = express();
const port = 3001; // Configurando o backend para rodar na porta 3001

// Middleware CORS (se o frontend e o backend estiverem em portas diferentes)
app.use(cors());

// Middleware para fazer o parse do corpo da requisição (json)
app.use(bodyParser.json());

// Função para ler o arquivo de dados
const readDataFile = (): any[] => {
  const filePath = path.join(__dirname, "data.json");
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data);
  }
  return [];
};

// Função para salvar os dados no arquivo JSON
const saveDataFile = (data: any[]): void => {
  const filePath = path.join(__dirname, "data.json");
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
};

// Rota para receber os dados do formulário
app.post("/api/form", (req: any, res: any) => {
  const { nome, email, empresa } = req.body;

  // Validação simples
  if (!nome || !email || !empresa) {
    return res
      .status(400)
      .json({ message: "Nome, email e empresa são obrigatórios" });
  }

  const newData = { nome, email, empresa };

  // Lê os dados do arquivo e adiciona os novos dados
  const data = readDataFile();
  data.push(newData);

  // Salva os dados de volta no arquivo
  saveDataFile(data);

  return res.status(200).json({ message: "Dados recebidos com sucesso!" });
});

app.get("/", (req: Request, res: Response) => {
  res.send("Backend está funcionando! Acesse /api/form para enviar dados.");
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor backend rodando em http://localhost:${port}`);
});
