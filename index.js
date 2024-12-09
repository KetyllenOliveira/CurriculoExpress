const express = require("express");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
app.use(express.json());

// Configuração do banco de dados
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Ajuste para Render
});

// Rota para criar um currículo (POST)
app.post("/curriculos", async (req, res) => {
  const { nome, email, telefone, experiencia, habilidades } = req.body;

  if (!nome || !email || !telefone || !experiencia || !habilidades) {
    return res.status(400).json({ error: "Todos os campos são obrigatórios." });
  }

  try {
    const result = await pool.query(
      "INSERT INTO curriculos (nome, email, telefone, experiencia, habilidades) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [nome, email, telefone, experiencia, habilidades]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao criar currículo" });
  }
});

// Rota para atualizar um currículo (PUT)
app.put("/curriculos/:id", async (req, res) => {
  const { id } = req.params;
  const { nome, email, telefone, experiencia, habilidades } = req.body;

  if (!nome || !email || !telefone || !experiencia || !habilidades) {
    return res.status(400).json({ error: "Todos os campos são obrigatórios." });
  }

  try {
    const result = await pool.query(
      "UPDATE curriculos SET nome = $1, email = $2, telefone = $3, experiencia = $4, habilidades = $5 WHERE id = $6 RETURNING *",
      [nome, email, telefone, experiencia, habilidades, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Currículo não encontrado." });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao atualizar currículo" });
  }
});

// Rota para obter todos os currículos (GET)
app.get("/curriculos", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM curriculos");
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar currículos" });
  }
});

// Rota para deletar um currículo (DELETE)
app.delete("/curriculos/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM curriculos WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Currículo não encontrado." });
    }

    res.status(200).json({ message: "Currículo deletado com sucesso." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao deletar currículo" });
  }
});

// Inicialização do servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
