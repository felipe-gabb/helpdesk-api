const express = require("express");
const userRoutes = require("./routes/userRoutes");

const app = express();
app.use(express.json());
app.use(userRoutes);

app.use((erro, req, res, next) => {
  if (!erro.status) {
    console.error(erro);
  }

  res.status(erro.status || 500).json({
    erro: erro.status ? erro.message : "Erro interno no servidor.",
  });
});

module.exports = app;