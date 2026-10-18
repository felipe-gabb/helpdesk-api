const express = require("express");
const db = require("../config/database");

const router = express.Router();

function validarId(id) {
  const numero = Number(id);

  if (!Number.isSafeInteger(numero) || numero <= 0) {
    return null;
  }

  return numero;
}

function validarSolicitante(dados) {
  if (!dados || typeof dados !== "object" || Array.isArray(dados)) {
    return false;
  }

  if (
    typeof dados.nome !== "string" ||
    dados.nome.trim() === "" ||
    typeof dados.email !== "string" ||
    dados.email.trim() === "" ||
    typeof dados.setor !== "string" ||
    dados.setor.trim() === ""
  ) {
    return false;
  }

  if (dados.nome.trim().length > 100 || dados.setor.trim().length > 100) {
    return false;
  }

  if (
    dados.email.trim().length > 150 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email.trim())
  ) {
    return false;
  }

  return true;
}

function validarChamado(dados) {
  if (!dados || typeof dados !== "object" || Array.isArray(dados)) {
    return false;
  }

  if (
    typeof dados.titulo !== "string" ||
    dados.titulo.trim() === "" ||
    typeof dados.descricao !== "string" ||
    dados.descricao.trim() === ""
  ) {
    return false;
  }

  if (dados.titulo.trim().length > 150) {
    return false;
  }

  if (
    typeof dados.prioridade !== "string" ||
    !["BAIXA", "MEDIA", "ALTA"].includes(dados.prioridade.trim().toUpperCase())
  ) {
    return false;
  }

  if (!validarId(dados.solicitante_id) || !validarId(dados.categoria_id)) {
    return false;
  }

  return true;
}

async function buscarChamado(id) {
  const [chamados] = await db.query(
    `SELECT chamados.id, chamados.titulo, chamados.descricao,
            chamados.prioridade, chamados.status,
            solicitantes.id AS solicitante_id,
            solicitantes.nome AS solicitante,
            solicitantes.setor,
            categorias.id AS categoria_id,
            categorias.nome AS categoria,
            tecnicos.id AS tecnico_id,
            tecnicos.nome AS tecnico_responsavel
     FROM chamados
     JOIN solicitantes ON chamados.solicitante_id = solicitantes.id
     JOIN categorias ON chamados.categoria_id = categorias.id
     LEFT JOIN tecnicos ON chamados.tecnico_id = tecnicos.id
     WHERE chamados.id = ?`,
    [id],
  );

  return chamados[0];
}

router.get("/categorias", async (req, res) => {
  const [categorias] = await db.query(
    "SELECT id, nome, descricao FROM categorias ORDER BY id",
  );

  res.json(categorias);
});

router.get("/tecnicos", async (req, res) => {
  const [tecnicos] = await db.query(
    "SELECT id, nome, email FROM tecnicos ORDER BY id",
  );

  res.json(tecnicos);
});

router.get("/solicitantes", async (req, res) => {
  const [solicitantes] = await db.query(
    "SELECT id, nome, email, setor FROM solicitantes ORDER BY id",
  );

  res.json(solicitantes);
});

router.get("/solicitantes/:id", async (req, res) => {
  const id = validarId(req.params.id);

  if (!id) {
    return res.status(400).json({ erro: "O id deve ser um número positivo." });
  }

  const [solicitantes] = await db.query(
    "SELECT id, nome, email, setor FROM solicitantes WHERE id = ?",
    [id],
  );

  if (solicitantes.length === 0) {
    return res.status(404).json({ erro: "Solicitante não encontrado." });
  }

  res.json(solicitantes[0]);
});

router.post("/solicitantes", async (req, res) => {
  if (!validarSolicitante(req.body)) {
    return res.status(400).json({
      erro: "Informe nome, e-mail válido e setor do solicitante.",
    });
  }

  const nome = req.body.nome.trim();
  const email = req.body.email.trim();
  const setor = req.body.setor.trim();

  const [resultado] = await db.query(
    "INSERT INTO solicitantes (nome, email, setor) VALUES (?, ?, ?)",
    [nome, email, setor],
  );

  res.status(201).json({
    id: resultado.insertId,
    nome: nome,
    email: email,
    setor: setor,
  });
});

router.put("/solicitantes/:id", async (req, res) => {
  const id = validarId(req.params.id);

  if (!id) {
    return res.status(400).json({ erro: "O id deve ser um número positivo." });
  }

  if (!validarSolicitante(req.body)) {
    return res.status(400).json({
      erro: "Informe nome, e-mail válido e setor do solicitante.",
    });
  }

  const nome = req.body.nome.trim();
  const email = req.body.email.trim();
  const setor = req.body.setor.trim();

  const [resultado] = await db.query(
    "UPDATE solicitantes SET nome = ?, email = ?, setor = ? WHERE id = ?",
    [nome, email, setor, id],
  );

  if (resultado.affectedRows === 0) {
    const [solicitantes] = await db.query(
      "SELECT id FROM solicitantes WHERE id = ?",
      [id],
    );

    if (solicitantes.length === 0) {
      return res.status(404).json({ erro: "Solicitante não encontrado." });
    }
  }

  res.json({
    id: id,
    nome: nome,
    email: email,
    setor: setor,
  });
});

router.delete("/solicitantes/:id", async (req, res) => {
  const id = validarId(req.params.id);

  if (!id) {
    return res.status(400).json({ erro: "O id deve ser um número positivo." });
  }

  const [resultado] = await db.query("DELETE FROM solicitantes WHERE id = ?", [
    id,
  ]);

  if (resultado.affectedRows === 0) {
    return res.status(404).json({ erro: "Solicitante não encontrado." });
  }

  res.status(204).end();
});

router.post("/chamados", async (req, res) => {
  if (!validarChamado(req.body)) {
    return res.status(400).json({
      erro: "Informe título, descrição, prioridade, solicitante e categoria.",
    });
  }

  const titulo = req.body.titulo.trim();
  const descricao = req.body.descricao.trim();
  const prioridade = req.body.prioridade.trim().toUpperCase();
  const solicitanteId = validarId(req.body.solicitante_id);
  const categoriaId = validarId(req.body.categoria_id);

  const [solicitantes] = await db.query(
    "SELECT id FROM solicitantes WHERE id = ?",
    [solicitanteId],
  );

  if (solicitantes.length === 0) {
    return res.status(404).json({ erro: "Solicitante não encontrado." });
  }

  const [categorias] = await db.query(
    "SELECT id FROM categorias WHERE id = ?",
    [categoriaId],
  );

  if (categorias.length === 0) {
    return res.status(404).json({ erro: "Categoria não encontrada." });
  }

  const [resultado] = await db.query(
    `INSERT INTO chamados
      (titulo, descricao, prioridade, status, solicitante_id, categoria_id)
     VALUES (?, ?, ?, 'ABERTO', ?, ?)`,
    [titulo, descricao, prioridade, solicitanteId, categoriaId],
  );

  const chamado = await buscarChamado(resultado.insertId);

  res.status(201).json(chamado);
});

router.get("/chamados", async (req, res) => {
  const [chamados] = await db.query(
    `SELECT chamados.id, chamados.titulo, chamados.descricao,
            chamados.prioridade, chamados.status,
            solicitantes.id AS solicitante_id,
            solicitantes.nome AS solicitante,
            solicitantes.setor,
            categorias.id AS categoria_id,
            categorias.nome AS categoria,
            tecnicos.id AS tecnico_id,
            tecnicos.nome AS tecnico_responsavel
     FROM chamados
     JOIN solicitantes ON chamados.solicitante_id = solicitantes.id
     JOIN categorias ON chamados.categoria_id = categorias.id
     LEFT JOIN tecnicos ON chamados.tecnico_id = tecnicos.id
     ORDER BY chamados.id`,
  );

  res.json(chamados);
});

router.get("/chamados/:id", async (req, res) => {
  const id = validarId(req.params.id);

  if (!id) {
    return res.status(400).json({ erro: "O id deve ser um número positivo." });
  }

  const chamado = await buscarChamado(id);

  if (!chamado) {
    return res.status(404).json({ erro: "Chamado não encontrado." });
  }

  res.json(chamado);
});

module.exports = router;
