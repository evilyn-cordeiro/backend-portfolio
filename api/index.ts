import fs from "fs";
import path from "path";

// Função para ler o arquivo de dados
const readDataFile = () => {
  const filePath = path.join(__dirname, "data.json");
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data);
  }
  return [];
};

// Função para salvar dados no arquivo JSON
const saveDataFile = (
  data: { nome: string; email: string; empresa: string }[]
) => {
  const filePath = path.join(__dirname, "data.json");
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
};

// Função que será chamada para processar as requisições
export default (req: any, res: any) => {
  if (req.method === "POST") {
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
  } else {
    // Caso não seja uma requisição POST
    return res.status(405).json({ message: "Método não permitido" });
  }
};
