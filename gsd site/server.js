const express = require("express");
const path = require("path");
const { Pool } = require("pg"); // Importa o Pool do pg
const cors = require("cors");
const app = express();
const fs = require("fs");
const multer = require("multer");

// Configuração do CORS
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:3000", // Permitir requisições do frontend
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());

let pool; // Declarar pool fora do bloco condicional

// Configuração do Pool de Conexões PostgreSQL (apenas se DATABASE_URL estiver definida)
if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL, // DATABASE_URL será fornecida pela Railway
    ssl: {
      rejectUnauthorized: false, // Necessário para conexões SSL com alguns provedores
    },
  });

  // Testar a conexão com o PostgreSQL
  pool.connect((err, client, release) => {
    if (err) {
      console.error("Erro ao adquirir cliente do pool (teste de conexão):", err.stack);
      return;
    }
    client.query("SELECT NOW()", (err, result) => {
      release();
      if (err) {
        console.error("Erro ao executar query de teste:", err.stack);
        return;
      }
      console.log("Conectado ao PostgreSQL! Hora atual do DB:", result.rows[0].now);
    });
  });
} else {
  console.log("Variável de ambiente DATABASE_URL não definida. O backend não se conectará a um banco de dados PostgreSQL localmente.");
}

// Função para inicializar o banco de dados com tabelas e dados iniciais
async function initializeDatabase() {
  if (!pool) {
    console.log("DATABASE_URL não definida. Pulando inicialização do banco de dados.");
    return;
  }
  let client = null; // Declarar client fora do bloco try
  try {
    client = await pool.connect();
    console.log("Iniciando inicialização do banco de dados...");

    // Tabela de Reuniões
    await client.query(`
      CREATE TABLE IF NOT EXISTS reunioes (
        id SERIAL PRIMARY KEY,
        nome TEXT NOT NULL,
        descricao TEXT NOT NULL,
        data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabela de Presenças
    await client.query(`
      CREATE TABLE IF NOT EXISTS presencas (
        id SERIAL PRIMARY KEY,
        reuniao_id INTEGER NOT NULL REFERENCES reunioes(id) ON DELETE CASCADE,
        usuario_id INTEGER NOT NULL,
        status TEXT NOT NULL
      );
    `);

    // Tabela de Usuários
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        role TEXT NOT NULL,
        sector TEXT NOT NULL,
        password TEXT NOT NULL
      );
    `);

    // Tabela de Relatórios
    await client.query(`
      CREATE TABLE IF NOT EXISTS relatorios (
        id SERIAL PRIMARY KEY,
        tipo TEXT NOT NULL,
        projeto TEXT NOT NULL,
        coordenador TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Pendente',
        data_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        conteudo TEXT,
        observacao TEXT,
        usuario_email TEXT
      );
    `);

    // Tabela de Comissões
    await client.query(`
      CREATE TABLE IF NOT EXISTS comissoes (
        id SERIAL PRIMARY KEY,
        nome TEXT NOT NULL,
        tipo TEXT NOT NULL,
        coordenador_id INTEGER,
        coordenador_nome TEXT,
        data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabela de Membros da Comissão
    await client.query(`
      CREATE TABLE IF NOT EXISTS membros_comissao (
        id SERIAL PRIMARY KEY,
        comissao_id INTEGER NOT NULL REFERENCES comissoes(id) ON DELETE CASCADE,
        usuario_id INTEGER,
        nome TEXT NOT NULL,
        email TEXT,
        funcao TEXT
      );
    `);

    // Tabela de Tarefas
    await client.query(`
      CREATE TABLE IF NOT EXISTS tarefas (
        id SERIAL PRIMARY KEY,
        titulo TEXT NOT NULL,
        descricao TEXT,
        data_limite TEXT,
        status TEXT DEFAULT 'Pendente',
        tipo_destinatario TEXT,
        destinatario_id INTEGER,
        data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabela de Arquivos
    await client.query(`
      CREATE TABLE IF NOT EXISTS arquivos (
        id SERIAL PRIMARY KEY,
        nome_original TEXT,
        nome_armazenado TEXT,
        tipo TEXT,
        categoria TEXT,
        data_upload TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabela de Eventos
    await client.query(`
      CREATE TABLE IF NOT EXISTS eventos (
        id SERIAL PRIMARY KEY,
        titulo TEXT NOT NULL,
        descricao TEXT,
        inicio TEXT NOT NULL,
        fim TEXT,
        tipo TEXT,
        criado_por TEXT,
        data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabela de Produtos
    await client.query(`
      CREATE TABLE IF NOT EXISTS produtos (
        id SERIAL PRIMARY KEY,
        nome TEXT NOT NULL,
        preco REAL NOT NULL,
        quantidade INTEGER NOT NULL
      );
    `);

    // Tabela de Vendas
    await client.query(`
      CREATE TABLE IF NOT EXISTS vendas (
        id SERIAL PRIMARY KEY,
        produtos TEXT NOT NULL,
        total REAL NOT NULL,
        valorRecebido REAL NOT NULL,
        troco REAL NOT NULL,
        data_venda TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabela de Áudios da Rádio
    await client.query(`
      CREATE TABLE IF NOT EXISTS audios (
        id SERIAL PRIMARY KEY,
        nome_original TEXT,
        nome_armazenado TEXT,
        tipo TEXT,
        descricao TEXT,
        data_upload TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabela de Comunicados da Rádio
    await client.query(`
      CREATE TABLE IF NOT EXISTS comunicados (
        id SERIAL PRIMARY KEY,
        mensagem TEXT NOT NULL,
        data_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabela de Eventos da Rádio
    await client.query(`
      CREATE TABLE IF NOT EXISTS eventos_radio (
        id SERIAL PRIMARY KEY,
        titulo TEXT NOT NULL,
        inicio TEXT NOT NULL,
        fim TEXT,
        descricao TEXT
      );
    `);

    // Inserir dados de exemplo (se as tabelas estiverem vazias)
    const { rowCount: usersCount } = await client.query("SELECT COUNT(*) FROM users");
    if (usersCount === 0) {
      const users = [
        { name: 'Gabriel Callegari', email: 'gabrielcallegari@gsd.com', role: 'presidente', sector: 'Diretoria Geral', password: '@Gsd2025' },
        { name: 'Maxine', email: 'maxine@gsd.com', role: 'vice-presidente', sector: 'Diretoria Geral', password: '@Gsd2025' },
        { name: 'Maria Eduarda', email: 'mariaeduarda@gsd.com', role: 'coordenador', sector: 'Finanças', password: '@Gsd2025' },
        { name: 'Arthur', email: 'arthur@gsd.com', role: 'membro', sector: 'Rádio GSD Mix', password: '@Gsd2025' },
        { name: 'Mavi', email: 'mavi@gsd.com', role: 'coordenador', sector: 'Eventos', password: '@Gsd2025' },
        { name: 'Estephani', email: 'estephani@gsd.com', role: 'coordenador', sector: 'Eventos', password: '@Gsd2025' },
        { name: 'Ana Julia', email: 'anajulia@gsd.com', role: 'coordenador', sector: 'Esportes', password: '@Gsd2025' },
        { name: 'Yasmin', email: 'yasmin@gsd.com', role: 'coordenador', sector: 'Esportes', password: '@Gsd2025' },
        { name: 'Suyane', email: 'suyane@gsd.com', role: 'coordenador', sector: 'Relações Sociais', password: '@Gsd2025' },
        { name: 'Heloisa', email: 'heloisa@gsd.com', role: 'coordenador', sector: 'Relações Sociais', password: '@Gsd2025' },
        { name: 'Vitoria', email: 'vitoria@gsd.com', role: 'membro', sector: 'Direitos Humanos', password: '@Gsd2025' },
        { name: 'Yan', email: 'yan@gsd.com', role: 'membro', sector: 'Rádio GSD Mix', password: '@Gsd2025' },
        { name: 'Wesley', email: 'wesley@gsd.com', role: 'membro', sector: 'Direitos Humanos', password: '@Gsd2025' },
        { name: 'Davi', email: 'davi@gsd.com', role: 'membro', sector: 'Direitos Humanos', password: '@Gsd2025' },
        { name: 'Lorrany', email: 'lorrany@gsd.com', role: 'membro', sector: 'Direitos Humanos', password: '@Gsd2025' },
        { name: 'Isabela', email: 'isabela@gsd.com', role: 'membro', sector: 'Direitos Humanos', password: '@Gsd2025' }
      ];
      for (const user of users) {
        await client.query(
          "INSERT INTO users (name, email, role, sector, password) VALUES ($1, $2, $3, $4, $5)",
          [user.name, user.email, user.role, user.sector, user.password]
        );
      }
      console.log("Usuários de exemplo inseridos.");
    }

    const { rowCount: relatoriosCount } = await client.query("SELECT COUNT(*) FROM relatorios");
    if (relatoriosCount === 0) {
      const relatoriosExemplo = [
        {
          tipo: "Criação de Projeto",
          projeto: "Feira de Ciências",
          coordenador: "João Silva",
          status: "Pendente",
          conteudo: "Descrição detalhada da Feira de Ciências.",
          observacao: "",
          usuario_email: "joao@gsd.com",
        },
        {
          tipo: "Relatório de Andamento",
          projeto: "Gincana Escolar",
          coordenador: "Maria Eduarda",
          status: "Aprovado",
          conteudo: "A gincana está em andamento, tudo conforme o planejado.",
          observacao: "",
          usuario_email: "mariaeduarda@gsd.com",
        },
      ];
      for (const r of relatoriosExemplo) {
        await client.query(
          "INSERT INTO relatorios (tipo, projeto, coordenador, status, conteudo, observacao, usuario_email) VALUES ($1, $2, $3, $4, $5, $6, $7)",
          [r.tipo, r.projeto, r.coordenador, r.status, r.conteudo, r.observacao, r.usuario_email]
        );
      }
      console.log("Relatórios de exemplo inseridos.");
    }

    console.log("Banco de dados inicializado com sucesso!");
  } catch (error) {
    console.error("Erro na inicialização do banco de dados:", error);
  } finally {
    if (client) client.release();
  }
}

// Chamar a função de inicialização do banco de dados ao iniciar o servidor
initializeDatabase();

// Serve arquivos estáticos
app.use("/login", express.static(path.join(__dirname, "public", "login")));
app.use("/presidente", express.static(path.join(__dirname, "public", "presidente")));
app.use("/coordenador", express.static(path.join(__dirname, "public", "coordenador")));
app.use("/membro", express.static(path.join(__dirname, "public", "membro")));

// Redireciona para login
app.get("/", (req, res) => {
  res.redirect("/login/index_login.html");
});

// Rotas de API

// Rota de Login
app.post("/api/login", async (req, res) => {
  if (!pool) {
    return res.status(500).json({ error: "Banco de dados não configurado." });
  }
  const { email, password } = req.body;
  try {
    const { rows } = await pool.query(
      "SELECT * FROM users WHERE email = $1 AND password = $2",
      [email, password]
    );
    if (rows.length > 0) {
      const user = rows[0];
      res.json({ success: true, role: user.role, name: user.name, email: user.email, sector: user.sector });
    } else {
      res.status(401).json({ success: false, message: "Credenciais inválidas." });
    }
  } catch (err) {
    console.error("Erro no login:", err);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});

// Rota para obter todos os usuários
app.get("/api/users", async (req, res) => {
  if (!pool) {
    return res.status(500).json({ error: "Banco de dados não configurado." });
  }
  try {
    const { rows } = await pool.query("SELECT id, name, email, role, sector FROM users");
    res.json(rows);
  } catch (err) {
    console.error("Erro ao buscar usuários:", err);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});

// Rota para salvar uma reunião
app.post("/api/reunioes", async (req, res) => {
  if (!pool) {
    return res.status(500).json({ error: "Banco de dados não configurado." });
  }
  const { nome, descricao, presencas } = req.body;

  console.log("Dados recebidos para reunião:", { nome, descricao, presencas });

  if (!nome || !descricao || !presencas) {
    return res.status(400).json({ error: "Todos os campos são obrigatórios." });
  }
  try {
    const resultReuniao = await pool.query(
      "INSERT INTO reunioes (nome, descricao) VALUES ($1, $2) RETURNING id",
      [nome, descricao]
    );
    const reuniaoId = resultReuniao.rows[0].id;

    for (const usuario of presencas) {
      await pool.query(
        "INSERT INTO presencas (reuniao_id, usuario_id, status) VALUES ($1, $2, $3)",
        [reuniaoId, usuario.id, usuario.status]
      );
    }

    res.status(201).json({ message: "Reunião salva com sucesso!" });
  } catch (err) {
    console.error("Erro ao salvar reunião:", err);
    res.status(500).json({ error: "Erro ao salvar a reunião." });
  }
});

// Rota para listar todas as reuniões
app.get("/api/reunioes", async (req, res) => {
  if (!pool) {
    return res.status(500).json({ error: "Banco de dados não configurado." });
  }
  try {
    const { rows: reunioesRows } = await pool.query(
      "SELECT id, nome, descricao, data_criacao FROM reunioes ORDER BY data_criacao DESC"
    );

    const reunioesComPresencas = [];
    for (const reuniao of reunioesRows) {
      const { rows: presencasRows } = await pool.query(
        "SELECT p.usuario_id, p.status, u.name AS usuario_nome FROM presencas p JOIN users u ON p.usuario_id = u.id WHERE p.reuniao_id = $1",
        [reuniao.id]
      );
      reunioesComPresencas.push({ ...reuniao, presencas: presencasRows });
    }

    res.json(reunioesComPresencas);
  } catch (err) {
    console.error("Erro ao buscar reuniões:", err);
    res.status(500).json({ error: "Erro ao buscar reuniões." });
  }
});

// Rota para atualizar uma reunião
app.put("/api/reunioes/:id", async (req, res) => {
  if (!pool) {
    return res.status(500).json({ error: "Banco de dados não configurado." });
  }
  const { id } = req.params;
  const { nome, descricao, presencas } = req.body;

  console.log("Atualizando reunião:", { id, nome, descricao, presencas });

  if (!nome || !descricao || !presencas) {
    return res.status(400).json({ error: "Todos os campos são obrigatórios." });
  }
  try {
    await pool.query("UPDATE reunioes SET nome = $1, descricao = $2 WHERE id = $3", [nome, descricao, id]);

    await pool.query("DELETE FROM presencas WHERE reuniao_id = $1", [id]);

    for (const usuario of presencas) {
      await pool.query(
        "INSERT INTO presencas (reuniao_id, usuario_id, status) VALUES ($1, $2, $3)",
        [id, usuario.id, usuario.status]
      );
    }

    res.json({ message: "Reunião atualizada com sucesso!" });
  } catch (err) {
    console.error("Erro ao atualizar reunião:", err);
    res.status(500).json({ error: "Erro ao atualizar a reunião." });
  }
});

// Rota para deletar uma reunião
app.delete("/api/reunioes/:id", async (req, res) => {
  if (!pool) {
    return res.status(500).json({ error: "Banco de dados não configurado." });
  }
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM presencas WHERE reuniao_id = $1", [id]);
    await pool.query("DELETE FROM reunioes WHERE id = $1", [id]);
    res.json({ message: "Reunião deletada com sucesso!" });
  } catch (err) {
    console.error("Erro ao deletar reunião:", err);
    res.status(500).json({ error: "Erro ao deletar a reunião." });
  }
});

// Rotas de Relatórios
app.post("/api/relatorios", async (req, res) => {
  if (!pool) {
    return res.status(500).json({ error: "Banco de dados não configurado." });
  }
  const { tipo, projeto, coordenador, status, conteudo, observacao, usuario_email } = req.body;
  try {
    const { rows } = await pool.query(
      "INSERT INTO relatorios (tipo, projeto, coordenador, status, conteudo, observacao, usuario_email) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id",
      [tipo, projeto, coordenador, status, conteudo, observacao, usuario_email]
    );
    res.status(201).json({ id: rows[0].id });
  } catch (err) {
    console.error("Erro ao salvar relatório:", err);
    res.status(500).json({ error: "Erro ao salvar relatório." });
  }
});

app.get("/api/relatorios", async (req, res) => {
  if (!pool) {
    return res.status(500).json({ error: "Banco de dados não configurado." });
  }
  try {
    const { rows } = await pool.query("SELECT * FROM relatorios ORDER BY data_envio DESC");
    res.json(rows);
  } catch (err) {
    console.error("Erro ao buscar relatórios:", err);
    res.status(500).json({ error: "Erro ao buscar relatórios." });
  }
});

app.put("/api/relatorios/:id", async (req, res) => {
  if (!pool) {
    return res.status(500).json({ error: "Banco de dados não configurado." });
  }
  const { id } = req.params;
  const { status, observacao } = req.body;
  try {
    await pool.query(
      "UPDATE relatorios SET status = $1, observacao = $2 WHERE id = $3",
      [status, observacao, id]
    );
    res.json({ message: "Status do relatório atualizado com sucesso!" });
  } catch (err) {
    console.error("Erro ao atualizar status do relatório:", err);
    res.status(500).json({ error: "Erro ao atualizar status do relatório." });
  }
});

// Rotas de Comissões
app.post("/api/comissoes", async (req, res) => {
  if (!pool) {
    return res.status(500).json({ error: "Banco de dados não configurado." });
  }
  const { nome, tipo, coordenador_id, coordenador_nome } = req.body;
  try {
    const { rows } = await pool.query(
      "INSERT INTO comissoes (nome, tipo, coordenador_id, coordenador_nome) VALUES ($1, $2, $3, $4) RETURNING id",
      [nome, tipo, coordenador_id, coordenador_nome]
    );
    res.status(201).json({ id: rows[0].id });
  } catch (err) {
    console.error("Erro ao salvar comissão:", err);
    res.status(500).json({ error: "Erro ao salvar comissão." });
  }
});

app.get("/api/comissoes", async (req, res) => {
  if (!pool) {
    return res.status(500).json({ error: "Banco de dados não configurado." });
  }
  try {
    const { rows } = await pool.query("SELECT * FROM comissoes ORDER BY data_criacao DESC");
    res.json(rows);
  } catch (err) {
    console.error("Erro ao buscar comissões:", err);
    res.status(500).json({ error: "Erro ao buscar comissões." });
  }
});

app.put("/api/comissoes/:id", async (req, res) => {
  if (!pool) {
    return res.status(500).json({ error: "Banco de dados não configurado." });
  }
  const { id } = req.params;
  const { nome, tipo, coordenador_id, coordenador_nome } = req.body;
  try {
    await pool.query(
      "UPDATE comissoes SET nome = $1, tipo = $2, coordenador_id = $3, coordenador_nome = $4 WHERE id = $5",
      [nome, tipo, coordenador_id, coordenador_nome, id]
    );
    res.json({ message: "Comissão atualizada com sucesso!" });
  } catch (err) {
    console.error("Erro ao atualizar comissão:", err);
    res.status(500).json({ error: "Erro ao atualizar comissão." });
  }
});

app.delete("/api/comissoes/:id", async (req, res) => {
  if (!pool) {
    return res.status(500).json({ error: "Banco de dados não configurado." });
  }
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM comissoes WHERE id = $1", [id]);
    res.json({ message: "Comissão deletada com sucesso!" });
  } catch (err) {
    console.error("Erro ao deletar comissão:", err);
    res.status(500).json({ error: "Erro ao deletar comissão." });
  }
});

// Rotas de Tarefas
app.post("/api/tarefas", async (req, res) => {
  if (!pool) {
    return res.status(500).json({ error: "Banco de dados não configurado." });
  }
  const { titulo, descricao, data_limite, tipo_destinatario, destinatario_id } = req.body;
  try {
    const { rows } = await pool.query(
      "INSERT INTO tarefas (titulo, descricao, data_limite, tipo_destinatario, destinatario_id) VALUES ($1, $2, $3, $4, $5) RETURNING id",
      [titulo, descricao, data_limite, tipo_destinatario, destinatario_id]
    );
    res.status(201).json({ id: rows[0].id });
  } catch (err) {
    console.error("Erro ao salvar tarefa:", err);
    res.status(500).json({ error: "Erro ao salvar tarefa." });
  }
});

app.get("/api/tarefas", async (req, res) => {
  if (!pool) {
    return res.status(500).json({ error: "Banco de dados não configurado." });
  }
  try {
    const { rows } = await pool.query("SELECT * FROM tarefas ORDER BY data_criacao DESC");
    res.json(rows);
  } catch (err) {
    console.error("Erro ao buscar tarefas:", err);
    res.status(500).json({ error: "Erro ao buscar tarefas." });
  }
});

app.put("/api/tarefas/:id", async (req, res) => {
  if (!pool) {
    return res.status(500).json({ error: "Banco de dados não configurado." });
  }
  const { id } = req.params;
  const { status } = req.body;
  try {
    await pool.query("UPDATE tarefas SET status = $1 WHERE id = $2", [status, id]);
    res.json({ message: "Status da tarefa atualizado com sucesso!" });
  } catch (err) {
    console.error("Erro ao atualizar status da tarefa:", err);
    res.status(500).json({ error: "Erro ao atualizar status da tarefa." });
  }
});

app.delete("/api/tarefas/:id", async (req, res) => {
  if (!pool) {
    return res.status(500).json({ error: "Banco de dados não configurado." });
  }
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM tarefas WHERE id = $1", [id]);
    res.json({ message: "Tarefa deletada com sucesso!" });
  } catch (err) {
    console.error("Erro ao deletar tarefa:", err);
    res.status(500).json({ error: "Erro ao deletar tarefa." });
  }
});

// Rotas de Arquivos
const upload = multer({ dest: "uploads/" });

app.post("/api/arquivos", upload.single("arquivo"), async (req, res) => {
  if (!pool) {
    return res.status(500).json({ error: "Banco de dados não configurado." });
  }
  const { originalname, mimetype, filename } = req.file;
  const { categoria } = req.body;
  try {
    const { rows } = await pool.query(
      "INSERT INTO arquivos (nome_original, nome_armazenado, tipo, categoria) VALUES ($1, $2, $3, $4) RETURNING id",
      [originalname, filename, mimetype, categoria]
    );
    res.status(201).json({ id: rows[0].id, message: "Arquivo enviado com sucesso!" });
  } catch (err) {
    console.error("Erro ao salvar arquivo:", err);
    res.status(500).json({ error: "Erro ao salvar arquivo." });
  }
});

app.get("/api/arquivos", async (req, res) => {
  if (!pool) {
    return res.status(500).json({ error: "Banco de dados não configurado." });
  }
  try {
    const { rows } = await pool.query("SELECT * FROM arquivos ORDER BY data_upload DESC");
    res.json(rows);
  } catch (err) {
    console.error("Erro ao buscar arquivos:", err);
    res.status(500).json({ error: "Erro ao buscar arquivos." });
  }
});

app.delete("/api/arquivos/:id", async (req, res) => {
  if (!pool) {
    return res.status(500).json({ error: "Banco de dados não configurado." });
  }
  const { id } = req.params;
  try {
    // Primeiro, obtenha o nome do arquivo armazenado para deletá-lo do sistema de arquivos
    const { rows } = await pool.query("SELECT nome_armazenado FROM arquivos WHERE id = $1", [id]);
    if (rows.length > 0) {
      const filePath = path.join(__dirname, "uploads", rows[0].nome_armazenado);
      fs.unlink(filePath, (err) => {
        if (err) console.error("Erro ao deletar arquivo do sistema de arquivos:", err);
      });
    }
    await pool.query("DELETE FROM arquivos WHERE id = $1", [id]);
    res.json({ message: "Arquivo deletado com sucesso!" });
  } catch (err) {
    console.error("Erro ao deletar arquivo:", err);
    res.status(500).json({ error: "Erro ao deletar arquivo." });
  }
});

// Rotas de Eventos
app.post("/api/eventos", async (req, res) => {
  if (!pool) {
    return res.status(500).json({ error: "Banco de dados não configurado." });
  }
  const { titulo, descricao, inicio, fim, tipo, criado_por } = req.body;
  try {
    const { rows } = await pool.query(
      "INSERT INTO eventos (titulo, descricao, inicio, fim, tipo, criado_por) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
      [titulo, descricao, inicio, fim, tipo, criado_por]
    );
    res.status(201).json({ id: rows[0].id });
  } catch (err) {
    console.error("Erro ao salvar evento:", err);
    res.status(500).json({ error: "Erro ao salvar evento." });
  }
});

app.get("/api/eventos", async (req, res) => {
  if (!pool) {
    return res.status(500).json({ error: "Banco de dados não configurado." });
  }
  try {
    const { rows } = await pool.query("SELECT * FROM eventos ORDER BY data_criacao DESC");
    res.json(rows);
  } catch (err) {
    console.error("Erro ao buscar eventos:", err);
    res.status(500).json({ error: "Erro ao buscar eventos." });
  }
});

app.put("/api/eventos/:id", async (req, res) => {
  if (!pool) {
    return res.status(500).json({ error: "Banco de dados não configurado." });
  }
  const { id } = req.params;
  const { titulo, descricao, inicio, fim, tipo, criado_por } = req.body;
  try {
    await pool.query(
      "UPDATE eventos SET titulo = $1, descricao = $2, inicio = $3, fim = $4, tipo = $5, criado_por = $6 WHERE id = $7",
      [titulo, descricao, inicio, fim, tipo, criado_por, id]
    );
    res.json({ message: "Evento atualizado com sucesso!" });
  } catch (err) {
    console.error("Erro ao atualizar evento:", err);
    res.status(500).json({ error: "Erro ao atualizar evento." });
  }
});

app.delete("/api/eventos/:id", async (req, res) => {
  if (!pool) {
    return res.status(500).json({ error: "Banco de dados não configurado." });
  }
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM eventos WHERE id = $1", [id]);
    res.json({ message: "Evento deletado com sucesso!" });
  } catch (err) {
    console.error("Erro ao deletar evento:", err);
    res.status(500).json({ error: "Erro ao deletar evento." });
  }
});

// Rotas de Produtos (Cantina)
app.post("/api/produtos", async (req, res) => {
  if (!pool) {
    return res.status(500).json({ error: "Banco de dados não configurado." });
  }
  const { nome, preco, quantidade } = req.body;
  try {
    const { rows } = await pool.query(
      "INSERT INTO produtos (nome, preco, quantidade) VALUES ($1, $2, $3) RETURNING id",
      [nome, preco, quantidade]
    );
    res.status(201).json({ id: rows[0].id });
  } catch (err) {
    console.error("Erro ao salvar produto:", err);
    res.status(500).json({ error: "Erro ao salvar produto." });
  }
});

app.get("/api/produtos", async (req, res) => {
  if (!pool) {
    return res.status(500).json({ error: "Banco de dados não configurado." });
  }
  try {
    const { rows } = await pool.query("SELECT * FROM produtos ORDER BY nome ASC");
    res.json(rows);
  } catch (err) {
    console.error("Erro ao buscar produtos:", err);
    res.status(500).json({ error: "Erro ao buscar produtos." });
  }
});

app.put("/api/produtos/:id", async (req, res) => {
  if (!pool) {
    return res.status(500).json({ error: "Banco de dados não configurado." });
  }
  const { id } = req.params;
  const { nome, preco, quantidade } = req.body;
  try {
    await pool.query(
      "UPDATE produtos SET nome = $1, preco = $2, quantidade = $3 WHERE id = $4",
      [nome, preco, quantidade, id]
    );
    res.json({ message: "Produto atualizado com sucesso!" });
  } catch (err) {
    console.error("Erro ao atualizar produto:", err);
    res.status(500).json({ error: "Erro ao atualizar produto." });
  }
});

app.delete("/api/produtos/:id", async (req, res) => {
  if (!pool) {
    return res.status(500).json({ error: "Banco de dados não configurado." });
  }
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM produtos WHERE id = $1", [id]);
    res.json({ message: "Produto deletado com sucesso!" });
  } catch (err) {
    console.error("Erro ao deletar produto:", err);
    res.status(500).json({ error: "Erro ao deletar produto." });
  }
});

// Rotas de Vendas (Cantina)
app.post("/api/vendas", async (req, res) => {
  if (!pool) {
    return res.status(500).json({ error: "Banco de dados não configurado." });
  }
  const { produtos, total, valorRecebido, troco } = req.body;
  try {
    const { rows } = await pool.query(
      "INSERT INTO vendas (produtos, total, valorRecebido, troco) VALUES ($1, $2, $3, $4) RETURNING id",
      [JSON.stringify(produtos), total, valorRecebido, troco]
    );
    res.status(201).json({ id: rows[0].id });
  } catch (err) {
    console.error("Erro ao registrar venda:", err);
    res.status(500).json({ error: "Erro ao registrar venda." });
  }
});

app.get("/api/vendas", async (req, res) => {
  if (!pool) {
    return res.status(500).json({ error: "Banco de dados não configurado." });
  }
  try {
    const { rows } = await pool.query("SELECT * FROM vendas ORDER BY data_venda DESC");
    res.json(rows);
  } catch (err) {
    console.error("Erro ao buscar vendas:", err);
    res.status(500).json({ error: "Erro ao buscar vendas." });
  }
});

// Rotas de Áudios (Rádio GSD Mix)
app.post("/api/audios", upload.single("audio"), async (req, res) => {
  if (!pool) {
    return res.status(500).json({ error: "Banco de dados não configurado." });
  }
  const { originalname, mimetype, filename } = req.file;
  const { descricao } = req.body;
  try {
    const { rows } = await pool.query(
      "INSERT INTO audios (nome_original, nome_armazenado, tipo, descricao) VALUES ($1, $2, $3, $4) RETURNING id",
      [originalname, filename, mimetype, descricao]
    );
    res.status(201).json({ id: rows[0].id, message: "Áudio enviado com sucesso!" });
  } catch (err) {
    console.error("Erro ao salvar áudio:", err);
    res.status(500).json({ error: "Erro ao salvar áudio." });
  }
});

app.get("/api/audios", async (req, res) => {
  if (!pool) {
    return res.status(500).json({ error: "Banco de dados não configurado." });
  }
  try {
    const { rows } = await pool.query("SELECT * FROM audios ORDER BY data_upload DESC");
    res.json(rows);
  } catch (err) {
    console.error("Erro ao buscar áudios:", err);
    res.status(500).json({ error: "Erro ao buscar áudios." });
  }
});

app.delete("/api/audios/:id", async (req, res) => {
  if (!pool) {
    return res.status(500).json({ error: "Banco de dados não configurado." });
  }
  const { id } = req.params;
  try {
    const { rows } = await pool.query("SELECT nome_armazenado FROM audios WHERE id = $1", [id]);
    if (rows.length > 0) {
      const filePath = path.join(__dirname, "uploads", rows[0].nome_armazenado);
      fs.unlink(filePath, (err) => {
        if (err) console.error("Erro ao deletar arquivo de áudio do sistema de arquivos:", err);
      });
    }
    await pool.query("DELETE FROM audios WHERE id = $1", [id]);
    res.json({ message: "Áudio deletado com sucesso!" });
  } catch (err) {
    console.error("Erro ao deletar áudio:", err);
    res.status(500).json({ error: "Erro ao deletar áudio." });
  }
});

// Rotas de Comunicados (Rádio GSD Mix)
app.post("/api/comunicados", async (req, res) => {
  if (!pool) {
    return res.status(500).json({ error: "Banco de dados não configurado." });
  }
  const { mensagem } = req.body;
  try {
    const { rows } = await pool.query(
      "INSERT INTO comunicados (mensagem) VALUES ($1) RETURNING id",
      [mensagem]
    );
    res.status(201).json({ id: rows[0].id });
  } catch (err) {
    console.error("Erro ao salvar comunicado:", err);
    res.status(500).json({ error: "Erro ao salvar comunicado." });
  }
});

app.get("/api/comunicados", async (req, res) => {
  if (!pool) {
    return res.status(500).json({ error: "Banco de dados não configurado." });
  }
  try {
    const { rows } = await pool.query("SELECT * FROM comunicados ORDER BY data_envio DESC");
    res.json(rows);
  } catch (err) {
    console.error("Erro ao buscar comunicados:", err);
    res.status(500).json({ error: "Erro ao buscar comunicados." });
  }
});

app.delete("/api/comunicados/:id", async (req, res) => {
  if (!pool) {
    return res.status(500).json({ error: "Banco de dados não configurado." });
  }
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM comunicados WHERE id = $1", [id]);
    res.json({ message: "Comunicado deletado com sucesso!" });
  } catch (err) {
    console.error("Erro ao deletar comunicado:", err);
    res.status(500).json({ error: "Erro ao deletar comunicado." });
  }
});

// Rotas de Eventos da Rádio (Rádio GSD Mix)
app.post("/api/eventos-radio", async (req, res) => {
  if (!pool) {
    return res.status(500).json({ error: "Banco de dados não configurado." });
  }
  const { titulo, inicio, fim, descricao } = req.body;
  try {
    const { rows } = await pool.query(
      "INSERT INTO eventos_radio (titulo, inicio, fim, descricao) VALUES ($1, $2, $3, $4) RETURNING id",
      [titulo, inicio, fim, descricao]
    );
    res.status(201).json({ id: rows[0].id });
  } catch (err) {
    console.error("Erro ao salvar evento da rádio:", err);
    res.status(500).json({ error: "Erro ao salvar evento da rádio." });
  }
});

app.get("/api/eventos-radio", async (req, res) => {
  if (!pool) {
    return res.status(500).json({ error: "Banco de dados não configurado." });
  }
  try {
    const { rows } = await pool.query("SELECT * FROM eventos_radio ORDER BY inicio DESC");
    res.json(rows);
  } catch (err) {
    console.error("Erro ao buscar eventos da rádio:", err);
    res.status(500).json({ error: "Erro ao buscar eventos da rádio." });
  }
});

app.put("/api/eventos-radio/:id", async (req, res) => {
  if (!pool) {
    return res.status(500).json({ error: "Banco de dados não configurado." });
  }
  const { id } = req.params;
  const { titulo, inicio, fim, descricao } = req.body;
  try {
    await pool.query(
      "UPDATE eventos_radio SET titulo = $1, inicio = $2, fim = $3, descricao = $4 WHERE id = $5",
      [titulo, inicio, fim, descricao, id]
    );
    res.json({ message: "Evento da rádio atualizado com sucesso!" });
  } catch (err) {
    console.error("Erro ao atualizar evento da rádio:", err);
    res.status(500).json({ error: "Erro ao atualizar evento da rádio." });
  }
});

app.delete("/api/eventos-radio/:id", async (req, res) => {
  if (!pool) {
    return res.status(500).json({ error: "Banco de dados não configurado." });
  }
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM eventos_radio WHERE id = $1", [id]);
    res.json({ message: "Evento da rádio deletado com sucesso!" });
  } catch (err) {
    console.error("Erro ao deletar evento da rádio:", err);
    res.status(500).json({ error: "Erro ao deletar evento da rádio." });
  }
});

// Rota para upload de foto de perfil
app.post("/api/usuarios/foto", upload.single("foto"), async (req, res) => {
  if (!pool) {
    return res.status(500).json({ error: "Banco de dados não configurado." });
  }
  const { email } = req.body;
  const foto_url = `/uploads/${req.file.filename}`;
  try {
    await pool.query("UPDATE users SET foto_url = $1 WHERE email = $2", [foto_url, email]);
    res.json({ message: "Foto de perfil atualizada com sucesso!", foto_url });
  } catch (err) {
    console.error("Erro ao atualizar foto de perfil:", err);
    res.status(500).json({ error: "Erro ao atualizar foto de perfil." });
  }
});

// Rota para obter usuário por email (para carregar foto de perfil)
app.get("/api/usuarios", async (req, res) => {
  if (!pool) {
    return res.status(500).json({ error: "Banco de dados não configurado." });
  }
  const { email } = req.query;
  try {
    const { rows } = await pool.query("SELECT id, name, email, role, sector, foto_url FROM users WHERE email = $1", [email]);
    res.json(rows);
  } catch (err) {
    console.error("Erro ao buscar usuário por email:", err);
    res.status(500).json({ error: "Erro ao buscar usuário por email." });
  }
});

// Iniciar o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});


