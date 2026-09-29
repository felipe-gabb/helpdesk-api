const express = require("express");
const cors = require("cors");
require("dotenv").config();
const db = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

// Endpoint: GET /categorias
app.get("/categorias", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM categorias");
    res.json(rows);
  } catch (error) {
    console.error("Erro ao buscar categorias:", error);
    res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
});

// Endpoint: GET /tecnicos
app.get("/tecnicos", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM tecnicos");
    res.json(rows);
  } catch (error) {
    console.error("Erro ao buscar técnicos:", error);
    res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
