const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Configuração do pool de conexão com o PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Middleware para interpretar JSON
app.use(express.json());

// Rota de teste
app.get('/', (req, res) => {
  res.send('API de Currículos está funcionando!');
});

// CREATE - Adicionar novo currículo
app.post('/curriculos', async (req, res) => {
  const { nome, email, telefone, habilidades } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO curriculos (nome, email, telefone, habilidades) VALUES ($1, $2, $3, $4) RETURNING *',
      [nome, email, telefone, habilidades]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ - Obter todos os currículos
app.get('/curriculos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM curriculos');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE - Atualizar currículo por ID
app.put('/curriculos/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, email, telefone, habilidades } = req.body;
  try {
    const result = await pool.query(
      'UPDATE curriculos SET nome = $1, email = $2, telefone = $3, habilidades = $4 WHERE id = $5 RETURNING *',
      [nome, email, telefone, habilidades, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Currículo não encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE - Remover currículo por ID
app.delete('/curriculos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM curriculos WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Currículo não encontrado' });
    }
    res.json({ message: 'Currículo removido com sucesso' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em:${port}`);
});
