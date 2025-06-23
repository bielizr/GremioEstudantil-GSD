const express = require("express");
const path = require("path");
const { Pool } = require("pg"); // Importa o Pool do pg
const cors = require("cors");
const app = express();
const fs = require("fs"); // Import fs module
const multer = require("multer");

// Garante que os diretórios de uploads existam
const uploadsDir = path.join(__dirname, 'public', 'uploads'); // Ajustado para estar dentro de public
const audioUploadsDir = path.join(__dirname, 'public', 'uploads', 'audios'); // Ajustado para estar dentro de public

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(audioUploadsDir)) {
  fs.mkdirSync(audioUploadsDir, { recursive: true });
}

// Configuração do CORS
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:3000", // Permitir requisições do frontend
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions ));
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
app.use(express.static(path.join(__dirname, "public")));
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

// Rota para obter relatórios
app.get("/api/relatorios", async (req, res) => {
  if (!pool) {
    return res.status(500).json({ error: "Banco de dados não configurado." });
  }
  try {
    const { rows } = await pool.query("SELECT * FROM relatorios ORDER BY data_envio DESC");
    res.json(rows);
  } catch (err) {
    console.error("Erro ao buscar relatórios:", err);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});

// Rota para enviar relatório
app.post("/api/relatorios", async (req, res) => {
  if (!pool) {
    return res.status(500).json({ error: "Banco de dados não configurado." });
  }
  const { tipo, projeto, coordenador, status, conteudo, observacao, usuario_email } = req.body;
  try {
    const { rows } = await pool.query(
      "INSERT INTO relatorios (tipo, projeto, coordenador, status, conteudo, observacao, usuario_email) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [tipo, projeto, coordenador, status, conteudo, observacao, usuario_email]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("Erro ao enviar relatório:", err);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});

// Rota para atualizar status do relatório
app.put("/api/relatorios/:id/status", async (req, res) => {
  if (!pool) {
    return res.status(500).json({ error: "Banco de dados não configurado." });
  }
  const { id } = req.params;
  const { status, observacao } = req.body;
  try {
    const { rows } = await pool.query(
      "UPDATE relatorios SET status = $1, observacao = $2 WHERE id = $3 RETURNING *",
      [status, observacao, id]
    );
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ message: "Relatório não encontrado." });
    }
  } catch (err) {
    console.error("Erro ao atualizar status do relatório:", err);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});

// Rota para deletar relatório
app.delete("/api/relatorios/:id", async (req, res) => {
  if (!pool) {
    return res.status(500).json({ error: "Banco de dados não configurado." });
  }
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM relatorios WHERE id = $1", [id]);
    res.status(204).send();
  } catch (err) {
    console.error("Erro ao deletar relatório:", err);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});

// Rotas para Comissões
app.get("/api/comissoes", async (req, res) => {
  if (!pool) {
    return res.status(500).json({ error: "Banco de dados não configurado." });
  }
  try {
    const { rows } = await pool.query("SELECT * FROM comissoes ORDER BY data_criacao DESC");
    res.json(rows);
  } catch (err) {
    console.error("Erro ao buscar comissões:", err);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});

app.post("/api/comissoes", async (req, res) => {
  if (!pool) {
    return res.status(500).json({ error: "Banco de dados não configurado." });
  }
  const { nome, tipo, coordenador_id, coordenador_nome, membros } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO comissoes (nome, tipo, coordenador_id, coordenador_nome) VALUES ($1, $2, $3, $4) RETURNING id",
      [nome, tipo, coordenador_id, coordenador_nome]
    );
    const comissaoId = result.rows[0].id;

    for (const membro of membros) {
      await pool.query(
        "INSERT INTO membros_comissao (comissao_id, usuario_id, nome, email, funcao) VALUES ($1, $2, $3, $4, $5)",
        [comissaoId, membro.id, membro.nome, membro.email, membro.funcao]
      );
    }
    res.status(201).json({ message: "Comissão criada com sucesso!" });
  } catch (err) {
    console.error("Erro ao criar comissão:", err);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});

app.get("/api/comissoes/:id/membros", async (req, res) => {
  if (!pool) {
    return res.status(500).json({ error: "Banco de dados não configurado." });
  }
  const { id } = req.params;
  try {
    const { rows } = await pool.query(
      "SELECT * FROM membros_comissao WHERE comissao_id = $1",
      [id]
    );
    res.json(rows);
  } catch (err) {
    console.error("Erro ao buscar membros da comissão:", err);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});

app.delete("/api/comissoes/:id", async (req, res) => {
  if (!pool) {
    return res.status(500).json({ error: "Banco de dados não configurado." });
  }
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM membros_comissao WHERE comissao_id = $1", [id]);
    await pool.query("DELETE FROM comissoes WHERE id = $1", [id]);
    res.status(204).send();
  } catch (err) {
    console.error("Erro ao deletar comissão:", err);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});

// Rotas para Tarefas
app.get("/api/tarefas", async (req, res) => {
  if (!pool) {
    return res.status(500).json({ error: "Banco de dados não configurado." });
  }
  try {
    const { rows } = await pool.query("SELECT * FROM tarefas ORDER BY data_criacao DESC");
    res.json(rows);
  } catch (err) {
    console.error("Erro ao buscar tarefas:", err);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});

app.post("/api/tarefas", async (req, res) => {
  if (!pool) {
    return res.status(500).json({ error: "Banco de dados não configurado." });
  }
  const { titulo, descricao, data_limite, status, tipo_destinatario, destinatario_id } = req.body;
  try {
    const { rows } = await pool.query(
      "INSERT INTO tarefas (titulo, descricao, data_limite, status, tipo_destinatario, destinatario_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [titulo, descricao, data_limite, status, tipo_destinatario, destinatario_id]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("Erro ao criar tarefa:", err);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});

app.put("/api/tarefas/:id", async (req, res) => {
  if (!pool) {
    return res.status(500).json({ error: "Banco de dados não configurado." });
  }
  const { id } = req.params;
  const { titulo, descricao, data_limite, status, tipo_destinatario, destinatario_id } = req.body;
  try {
    const { rows } = await pool.query(
      "UPDATE tarefas SET titulo = $1, descricao = $2, data_limite = $3, status = $4, tipo_destinatario = $5, destinatario_id = $6 WHERE id = $7 RETURNING *",
      [titulo, descricao, data_limite, status, tipo_destinatario, destinatario_id, id]
    );
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ message: "Tarefa não encontrada." });
    }
  } catch (err) {
    console.error("Erro ao atualizar tarefa:", err);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});

app.delete("/api/tarefas/:id", async (req, res) => {
  if (!pool) {
    return res.status(500).json({ error: "Banco de dados não configurado." });
  }
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM tarefas WHERE id = $1", [id]);
    res.status(204).send();
  } catch (err) {
    console.error("Erro ao deletar tarefa:", err);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});

// Rotas para Arquivos
const upload = multer({ dest: uploadsDir }); // Usar o caminho completo

app.post("/api/upload", upload.single("arquivo"), async (req, res) => {
  if (!pool) {
    return res.status(500).json({ error: "Banco de dados não configurado." });
  }
  try {
    const { originalname, mimetype, filename } = req.file;
    const { categoria } = req.body; // Categoria do arquivo (ex: 'documentos', 'imagens')

    // Mover o arquivo para um local permanente se necessário, ou processá-lo
    // Por simplicidade, vamos apenas salvar os metadados no DB por enquanto

    const { rows } = await pool.query(
      "INSERT INTO arquivos (nome_original, nome_armazenado, tipo, categoria) VALUES ($1, $2, $3, $4) RETURNING *",
      [originalname, filename, mimetype, categoria]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Erro ao fazer upload do arquivo:", error);
    res.status(500).json({ error: "Erro ao fazer upload do arquivo." });
  }
});

app.get("/api/arquivos", async (req, res) => {
  if (!pool) {
    return res.status(500).json({ error: "Banco de dados não configurado." });
  }
  try {
    const { rows } = await pool.query("SELECT * FROM arquivos ORDER BY data_upload DESC");
    res.json(rows);
  } catch (error) {
    console.error("Erro ao buscar arquivos:", error);
    res.status(500).json({ error: "Erro ao buscar arquivos." });
  }
});

app.delete("/api/arquivos/:id", async (req, res) => {
  if (!pool) {
    return res.status(500).json({ error: "Banco de dados não configurado." });
  }
  const { id } = req.params;
  try {
    // Opcional: deletar o arquivo físico do sistema de arquivos se ele foi salvo
    // const { rows: fileRows } = await pool.query('SELECT nome_armazenado FROM arquivos WHERE id = $1', [id]);
    // if (fileRows.length > 0) {
    //   fs.unlinkSync(path.join(__dirname, 'uploads', fileRows[0].nome_armazenado));
    // }

    await pool.query("DELETE FROM arquivos WHERE id = $1", [id]);
    res.status(204).send();
  } catch (error) {
    console.error("Erro ao deletar arquivo:", error);
    res.status(500).json({ error: "Erro ao deletar arquivo." });
  }
});

// Rotas para Eventos (Calendário)
app.get("/api/eventos", async (req, res) => {
  if (!pool) {
    return res.status(500).json({ error: "Banco de dados não configurado." });
  }
  try {
    const { rows } = await pool.query("SELECT * FROM eventos ORDER BY inicio DESC");
    res.json(rows);
  } catch (err) {
    console.error("Erro ao buscar eventos:", err);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});

app.post("/api/eventos", async (req, res) => {
  if (!pool) {
    return res.status(500).json({ error: "Banco de dados não configurado." });
  }
  const { titulo, descricao, inicio, fim, tipo, criado_por } = req.body;
  try {
    const { rows } = await pool.query(
      "INSERT INTO eventos (titulo, descricao, inicio, fim, tipo, criado_por) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [titulo, descricao, inicio, fim, tipo, criado_por]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("Erro ao criar evento:", err);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});

app.put("/api/eventos/:id", async (req, res) => {
  if (!pool) {
    return res.status(500).json({ error: "Banco de dados não configurado." });
  }
  const { id } = req.params;
  const { titulo, descricao, inicio, fim, tipo, criado_por } = req.body;
  try {
    const { rows } = await pool.query(
      "UPDATE eventos SET titulo = $1, descricao = $2, inicio = $3, fim = $4, tipo = $5, criado_por = $6 WHERE id = $7 RETURNING *",
      [titulo, descricao, inicio, fim, tipo, criado_por, id]
    );
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ message: "Evento não encontrado." });
    }
  } catch (err) {
    console.error("Erro ao atualizar evento:", err);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});

app.delete("/api/eventos/:id", async (req, res) => {
  if (!pool) {
    return res.status(500).json({ error: "Banco de dados não configurado." });
  }
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM eventos WHERE id = $1", [id]);
    res.status(204).send();
  } catch (err) {
    console.error("Erro ao deletar evento:", err);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});

// Rotas para Produtos (Cantina)
app.get("/api/produtos", async (req, res) => {
  if (!pool) {
    return res.status(500).json({ error: "Banco de dados não configurado." });
  }
  try {
    const { rows } = await pool.query("SELECT * FROM produtos ORDER BY nome ASC");
    res.json(rows);
  } catch (err) {
    console.error("Erro ao buscar produtos:", err);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});

app.post("/api/produtos", async (req, res) => {
  if (!pool) {
    return res.status(500).json({ error: "Banco de dados não configurado." });
  }
  const { nome, preco, quantidade } = req.body;
  try {
    const { rows } = await pool.query(
      "INSERT INTO produtos (nome, preco, quantidade) VALUES ($1, $2, $3) RETURNING *",
      [nome, preco, quantidade]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("Erro ao adicionar produto:", err);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});

app.put("/api/produtos/:id", async (req, res) => {
  if (!pool) {
    return res.status(500).json({ error: "Banco de dados não configurado." });
  }
  const { id } = req.params;
  const { nome, preco, quantidade } = req.body;
  try {
    const { rows } = await pool.query(
      "UPDATE produtos SET nome = $1, preco = $2, quantidade = $3 WHERE id = $4 RETURNING *",
      [nome, preco, quantidade, id]
    );
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ message: "Produto não encontrado." });
    }
  } catch (err) {
    console.error("Erro ao atualizar produto:", err);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});

app.delete("/api/produtos/:id", async (req, res) => {
  if (!pool) {
    return res.status(500).json({ error: "Banco de dados não configurado." });
  }
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM produtos WHERE id = $1", [id]);
    res.status(204).send();
  } catch (err) {
    console.error("Erro ao deletar produto:", err);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});

// Rotas para Vendas (Cantina)
app.get("/api/vendas", async (req, res) => {
  if (!pool) {
    return res.status(500).json({ error: "Banco de dados não configurado." });
  }
  try {
    const { rows } = await pool.query("SELECT * FROM vendas ORDER BY data_venda DESC");
    res.json(rows);
  } catch (err) {
    console.error("Erro ao buscar vendas:", err);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});

app.post("/api/vendas", async (req, res) => {
  if (!pool) {
    return res.status(500).json({ error: "Banco de dados não configurado." });
  }
  const { produtos, total, valorRecebido, troco } = req.body;
  try {
    const { rows } = await pool.query(
      "INSERT INTO vendas (produtos, total, valorRecebido, troco) VALUES ($1, $2, $3, $4) RETURNING *",
      [JSON.stringify(produtos), total, valorRecebido, troco]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("Erro ao registrar venda:", err);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});

// Rotas para Rádio GSD Mix (Áudios)
const uploadAudio = multer({ dest: audioUploadsDir }); // Usar o caminho completo

app.post("/api/audios", uploadAudio.single("audio"), async (req, res) => {
  if (!pool) {
    return res.status(500).json({ error: "Banco de dados não configurado." });
  }
  try {
    const { originalname, mimetype, filename } = req.file;
    const { descricao } = req.body;

    const { rows } = await pool.query(
      "INSERT INTO audios (nome_original, nome_armazenado, tipo, descricao) VALUES ($1, $2, $3, $4) RETURNING *",
      [originalname, filename, mimetype, descricao]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Erro ao fazer upload do áudio:", error);
    res.status(500).json({ error: "Erro ao fazer upload do áudio." });
  }
});

app.get("/api/audios", async (req, res) => {
  if (!pool) {
    return res.status(500).json({ error: "Banco de dados não configurado." });
  }
  try {
    const { rows } = await pool.query("SELECT * FROM audios ORDER BY data_upload DESC");
    res.json(rows);
  } catch (error) {
    console.error("Erro ao buscar áudios:", error);
    res.status(500).json({ error: "Erro ao buscar áudios." });
  }
});

app.delete("/api/audios/:id", async (req, res) => {
  if (!pool) {
    return res.status(500).json({ error: "Banco de dados não configurado." });
  }
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM audios WHERE id = $1", [id]);
    res.status(204).send();
  } catch (error) {
    console.error("Erro ao deletar áudio:", error);
    res.status(500).json({ error: "Erro ao deletar áudio." });
  }
});

// Rotas para Comunicados da Rádio
app.get("/api/comunicados", async (req, res) => {
  if (!pool) {
    return res.status(500).json({ error: "Banco de dados não configurado." });
  }
  try {
    const { rows } = await pool.query("SELECT * FROM comunicados ORDER BY data_envio DESC");
    res.json(rows);
  } catch (err) {
    console.error("Erro ao buscar comunicados:", err);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});

app.post("/api/comunicados", async (req, res) => {
  if (!pool) {
    return res.status(500).json({ error: "Banco de dados não configurado." });
  }
  const { mensagem } = req.body;
  try {
    const { rows } = await pool.query(
      "INSERT INTO comunicados (mensagem) VALUES ($1) RETURNING *",
      [mensagem]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("Erro ao enviar comunicado:", err);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});

app.delete("/api/comunicados/:id", async (req, res) => {
  if (!pool) {
    return res.status(500).json({ error: "Banco de dados não configurado." });
  }
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM comunicados WHERE id = $1", [id]);
    res.status(204).send();
  } catch (err) {
    console.error("Erro ao deletar comunicado:", err);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});

// Rotas para Eventos da Rádio
app.get("/api/eventos-radio", async (req, res) => {
  if (!pool) {
    return res.status(500).json({ error: "Banco de dados não configurado." });
  }
  try {
    const { rows } = await pool.query("SELECT * FROM eventos_radio ORDER BY inicio DESC");
    res.json(rows);
  } catch (err) {
    console.error("Erro ao buscar eventos da rádio:", err);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});

app.post("/api/eventos-radio", async (req, res) => {
  if (!pool) {
    return res.status(500).json({ error: "Banco de dados não configurado." });
  }
  const { titulo, inicio, fim, descricao } = req.body;
  try {
    const { rows } = await pool.query(
      "INSERT INTO eventos_radio (titulo, inicio, fim, descricao) VALUES ($1, $2, $3, $4) RETURNING *",
      [titulo, inicio, fim, descricao]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("Erro ao criar evento da rádio:", err);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});

app.put("/api/eventos-radio/:id", async (req, res) => {
  if (!pool) {
    return res.status(500).json({ error: "Banco de dados não configurado." });
  }
  const { id } = req.params;
  const { titulo, inicio, fim, descricao } = req.body;
  try {
    const { rows } = await pool.query(
      "UPDATE eventos_radio SET titulo = $1, inicio = $2, fim = $3, descricao = $4 WHERE id = $5 RETURNING *",
      [titulo, inicio, fim, descricao, id]
    );
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ message: "Evento da rádio não encontrado." });
    }
  } catch (err) {
    console.error("Erro ao atualizar evento da rádio:", err);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});

app.delete("/api/eventos-radio/:id", async (req, res) => {
  if (!pool) {
    return res.status(500).json({ error: "Banco de dados não configurado." });
  }
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM eventos_radio WHERE id = $1", [id]);
    res.status(204).send();
  } catch (err) {
    console.error("Erro ao deletar evento da rádio:", err);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});

// Iniciar o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
