import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
// Carregar as variáveis do arquivo .env
dotenv.config();
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
const app = express();
app.use(cors({
    origin: "http://localhost:3001", // Altere para a URL do seu front-end
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(bodyParser.json());
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
app.post("/api/form", async (req, res) => {
    const { nome, email, empresa } = req.body;
    if (!nome || !email || !empresa) {
        return res.status(400).json({
            message: "Os campos 'nome', 'email' e 'empresa' são obrigatórios.",
        });
    }
    try {
        const { data, error } = await supabase
            .from("data_visitants")
            .insert([{ nome, email, empresa }])
            .select();
        if (error) {
            throw error;
        }
        return res.status(201).json({ message: "Dados salvos com sucesso!", data });
    }
    catch (error) {
        console.error("Erro ao salvar dados no Supabase:", error.message);
        return res.status(500).json({ message: "Erro ao salvar dados." });
    }
});
export default app;
