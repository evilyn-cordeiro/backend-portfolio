"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// Inicializa o Express
const app = (0, express_1.default)();
const port = 3001;
// Middleware para fazer o parse do corpo da requisição
app.use(body_parser_1.default.json());
// Função para ler o arquivo de dados
const readDataFile = () => {
  const filePath = path_1.default.join(__dirname, "data.json");
  if (fs_1.default.existsSync(filePath)) {
    const data = fs_1.default.readFileSync(filePath, "utf-8");
    return JSON.parse(data);
  }
  return [];
};
// Função para salvar dados no arquivo JSON
const saveDataFile = (data) => {
  const filePath = path_1.default.join(__dirname, "data.json");
  fs_1.default.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
};
// Rota para receber os dados do formulário
app.post("/api/form", (req, res) => {
  const { nome, email, empresa } = req.body;
  // Validação simples
  if (!nome || !email || !empresa) {
    return res
      .status(400)
      .json({ message: "Nome, email e empresa são obrigatórios" });
  }
  const newData = { nome, email, empresa };
  // Lê o arquivo e adiciona os novos dados
  const data = readDataFile();
  data.push(newData);
  // Salva os dados de volta no arquivo
  saveDataFile(data);
  return res.status(200).json({ message: "Dados recebidos com sucesso!" });
});
// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
