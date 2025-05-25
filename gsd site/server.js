const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const app = express();
const PORT = 3000;
const fs = require('fs');

app.use(cors()); // Para facilitar testes locais
app.use(express.json());

// Serve arquivos estáticos
app.use('/login', express.static(path.join(__dirname, 'public', 'login')));
app.use('/presidente', express.static(path.join(__dirname, 'public', 'presidente')));
app.use('/coordenador', express.static(path.join(__dirname, 'public', 'coordenador')));
app.use('/membro', express.static(path.join(__dirname, 'public', 'membro')));

// Redireciona para login
app.get('/', (req, res) => {
    res.redirect('/login/index_login.html');
});

// Banco SQLite
const db = new sqlite3.Database(':memory:');

// Criando tabelas no banco de dados
db.serialize(() => {
    // Tabela de Reuniões
    db.run(`
        CREATE TABLE IF NOT EXISTS reunioes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            descricao TEXT NOT NULL,
            data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Tabela de Presenças
    db.run(`
        CREATE TABLE IF NOT EXISTS presencas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            reuniao_id INTEGER NOT NULL,
            usuario_id INTEGER NOT NULL,
            status TEXT NOT NULL, -- 'presente' ou 'ausente'
            FOREIGN KEY (reuniao_id) REFERENCES reunioes (id)
        )
    `);

    // Tabela de Usuários
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            role TEXT NOT NULL,
            sector TEXT NOT NULL,
            password TEXT NOT NULL
        )
    `);


    // ...outras criações de tabela...

    // Tabela de Relatórios (apenas UMA VEZ!)
    db.run(`
    CREATE TABLE IF NOT EXISTS relatorios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tipo TEXT NOT NULL,
        projeto TEXT NOT NULL,
        coordenador TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Pendente',
        data_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        conteudo TEXT,
        observacao TEXT,
        usuario_email TEXT
    )
`);

    // Tabela de Comissões
    db.run(`
  CREATE TABLE IF NOT EXISTS comissoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    tipo TEXT NOT NULL, -- 'Fixa' ou 'Temporária'
    coordenador_id INTEGER, -- pode ser null se for um novo coordenador
    coordenador_nome TEXT,  -- nome do coordenador (caso não seja usuário fixo)
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

    // Tabela de Membros da Comissão
    db.run(`
  CREATE TABLE IF NOT EXISTS membros_comissao (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    comissao_id INTEGER NOT NULL,
    usuario_id INTEGER,         -- se for usuário fixo
    nome TEXT NOT NULL,         -- nome do membro (sempre preenchido)
    email TEXT,                 -- email do membro (opcional)
    funcao TEXT,                -- função na comissão (opcional)
    FOREIGN KEY (comissao_id) REFERENCES comissoes(id)
  )
`);

    //tabela tarefas
    db.run(`
  CREATE TABLE IF NOT EXISTS tarefas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    descricao TEXT,
    data_limite TEXT,
    status TEXT DEFAULT 'Pendente',
    tipo_destinatario TEXT, -- 'usuario' ou 'comissao'
    destinatario_id INTEGER, -- id do usuário ou da comissão
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

    const multer = require('multer');
    const upload = multer({ dest: 'uploads/' }); // pasta onde os arquivos ficarão

    // Tabela para registrar arquivos
    db.run(`
  CREATE TABLE IF NOT EXISTS arquivos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome_original TEXT,
    nome_armazenado TEXT,
    tipo TEXT,
    categoria TEXT,
    data_upload TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

    // Upload de arquivo
    app.post('/api/arquivos', upload.single('arquivo'), (req, res) => {
        const { originalname, filename, mimetype } = req.file;
        const { categoria } = req.body;
        db.run(
            `INSERT INTO arquivos (nome_original, nome_armazenado, tipo, categoria) VALUES (?, ?, ?, ?)`,
            [originalname, filename, mimetype, categoria],
            function (err) {
                if (err) {
                    console.error('Erro ao salvar arquivo:', err);
                    return res.status(500).json({ error: 'Erro ao salvar arquivo.' });
                }
                res.json({ id: this.lastID });
            }
        );
    });

    // Listar arquivos
    app.get('/api/arquivos', (req, res) => {
        db.all(`SELECT * FROM arquivos ORDER BY data_upload DESC`, [], (err, rows) => {
            if (err) {
                console.error('Erro ao buscar arquivos:', err);
                return res.status(500).json({ error: 'Erro ao buscar arquivos.' });
            }
            res.json(rows);
        });
    });

    // Download de arquivo
    app.get('/uploads/:nome', (req, res) => {
        const filePath = path.join(__dirname, 'uploads', req.params.nome);
        res.sendFile(filePath);
    });
    app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


    //tabela eventos
    db.run(`
  CREATE TABLE IF NOT EXISTS eventos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    descricao TEXT,
    inicio TEXT NOT NULL,
    fim TEXT,
    tipo TEXT, -- Ex: Reunião, Evento, Outro
    criado_por TEXT,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

    // Relatórios de exemplo
    const relatoriosExemplo = [
        {
            tipo: "Criação de Projeto",
            projeto: "Feira de Ciências",
            coordenador: "João Silva",
            status: "Pendente",
            conteudo: "Descrição detalhada da Feira de Ciências.",
            observacao: "",
            usuario_email: "joao@gsd.com"
        },
        {
            tipo: "Relatório de Andamento",
            projeto: "Gincana Escolar",
            coordenador: "Maria Eduarda",
            status: "Aprovado",
            conteudo: "A gincana está em andamento, tudo conforme o planejado.",
            observacao: "",
            usuario_email: "mariaeduarda@gsd.com"
        }
    ];
    const stmtRel = db.prepare("INSERT INTO relatorios (tipo, projeto, coordenador, status, conteudo, observacao, usuario_email) VALUES (?, ?, ?, ?, ?, ?, ?)");
    relatoriosExemplo.forEach(r => {
        stmtRel.run(r.tipo, r.projeto, r.coordenador, r.status, r.conteudo, r.observacao, r.usuario_email);
    });
    stmtRel.finalize();



    // Definição dos usuários fixos
    const users = [
        { name: 'Gabriel Callegari', email: 'gabrielcallegari@gsd.com', role: 'presidente', sector: 'Diretoria Geral', password: 'senha123' },
        { name: 'Maxine', email: 'maxine@gsd.com', role: 'vice-presidente', sector: 'Diretoria Geral', password: 'senha123' },
        { name: 'Maria Eduarda', email: 'mariaeduarda@gsd.com', role: 'coordenador', sector: 'Finanças', password: 'senha123' },
        { name: 'Arthur', email: 'arthur@gsd.com', role: 'coordenador', sector: 'Finanças', password: 'senha123' },
        { name: 'Mavi', email: 'mavi@gsd.com', role: 'coordenador', sector: 'Eventos', password: 'senha123' },
        { name: 'Estephani', email: 'estephani@gsd.com', role: 'coordenador', sector: 'Eventos', password: 'senha123' },
        { name: 'Isaque', email: 'isaque@gsd.com', role: 'coordenador', sector: 'Esportes', password: 'senha123' },
        { name: 'Muralha', email: 'muralha@gsd.com', role: 'coordenador', sector: 'Esportes', password: 'senha123' },
        { name: 'Suyane', email: 'suyane@gsd.com', role: 'coordenador', sector: 'Relações Sociais', password: 'senha123' },
        { name: 'Heloisa', email: 'heloisa@gsd.com', role: 'coordenador', sector: 'Relações Sociais', password: 'senha123' },
        { name: 'Vitoria', email: 'vitoria@gsd.com', role: 'membro', sector: 'Rádio GSD Mix', password: 'senha123' },
        { name: 'Yan', email: 'yan@gsd.com', role: 'membro', sector: 'Rádio GSD Mix', password: 'senha123' },
        { name: 'Wesley', email: 'wesley@gsd.com', role: 'membro', sector: 'Rádio GSD Mix', password: 'senha123' },
        { name: 'Davi', email: 'davi@gsd.com', role: 'membro', sector: 'Direitos Humanos', password: 'senha123' },
        { name: 'Lorrany', email: 'lorrany@gsd.com', role: 'membro', sector: 'Direitos Humanos', password: 'senha123' },
        { name: 'Isabela', email: 'isabela@gsd.com', role: 'membro', sector: 'Direitos Humanos', password: 'senha123' }
    ];

    const stmt = db.prepare("INSERT INTO users (name, email, role, sector, password) VALUES (?, ?, ?, ?, ?)");
    users.forEach(user => {
        stmt.run(user.name, user.email, user.role, user.sector, user.password);
    });
    stmt.finalize();
});

// Rota para salvar uma reunião
app.post('/api/reunioes', (req, res) => {
    const { nome, descricao, presencas } = req.body;

    console.log('Dados recebidos:', { nome, descricao, presencas });

    if (!nome || !descricao || !presencas) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    const query = `INSERT INTO reunioes (nome, descricao) VALUES (?, ?)`;
    db.run(query, [nome, descricao], function (err) {
        if (err) {
            console.error('Erro ao salvar reunião:', err);
            return res.status(500).json({ error: 'Erro ao salvar a reunião.' });
        }

        const reuniaoId = this.lastID;

        const presencaQuery = `INSERT INTO presencas (reuniao_id, usuario_id, status) VALUES (?, ?, ?)`;
        const stmt = db.prepare(presencaQuery);

        presencas.forEach(usuario => {
            stmt.run(reuniaoId, usuario.id, usuario.status, (err) => {
                if (err) {
                    console.error('Erro ao salvar presença:', err);
                }
            });
        });

        stmt.finalize();

        res.status(201).json({ message: 'Reunião salva com sucesso!' });
    });
});

// Rota para listar todas as reuniões
app.get('/api/reunioes', (req, res) => {
    const queryReunioes = `
        SELECT r.id, r.nome, r.descricao, r.data_criacao,
               p.usuario_id, p.status, u.name AS usuario_nome
        FROM reunioes r
        LEFT JOIN presencas p ON r.id = p.reuniao_id
        LEFT JOIN users u ON p.usuario_id = u.id
        ORDER BY r.data_criacao DESC
    `;

    db.all(queryReunioes, [], (err, rows) => {
        if (err) {
            console.error('Erro ao buscar reuniões:', err);
            return res.status(500).json({ error: 'Erro ao buscar reuniões.' });
        }

        // Agrupar reuniões e presenças
        const reunioes = rows.reduce((acc, row) => {
            const { id, nome, descricao, data_criacao, usuario_id, status, usuario_nome } = row;

            if (!acc[id]) {
                acc[id] = {
                    id,
                    nome,
                    descricao,
                    data_criacao,
                    presencas: []
                };
            }

            if (usuario_id) {
                acc[id].presencas.push({ usuario_id, usuario_nome, status });
            }

            return acc;
        }, {});

        res.json(Object.values(reunioes));
    });
});

// Rota para atualizar uma reunião
app.put('/api/reunioes/:id', (req, res) => {
    const { id } = req.params;
    const { nome, descricao, presencas } = req.body;

    console.log('Atualizando reunião:', { id, nome, descricao, presencas });

    if (!nome || !descricao || !presencas) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    // Atualizar a reunião
    const query = `UPDATE reunioes SET nome = ?, descricao = ? WHERE id = ?`;
    db.run(query, [nome, descricao, id], function (err) {
        if (err) {
            console.error('Erro ao atualizar reunião:', err);
            return res.status(500).json({ error: 'Erro ao atualizar a reunião.' });
        }

        // Atualizar as presenças
        const deletePresencasQuery = `DELETE FROM presencas WHERE reuniao_id = ?`;
        db.run(deletePresencasQuery, [id], (err) => {
            if (err) {
                console.error('Erro ao deletar presenças antigas:', err);
                return res.status(500).json({ error: 'Erro ao atualizar as presenças.' });
            }

            const insertPresencasQuery = `INSERT INTO presencas (reuniao_id, usuario_id, status) VALUES (?, ?, ?)`;
            const stmt = db.prepare(insertPresencasQuery);

            presencas.forEach(usuario => {
                stmt.run(id, usuario.id, usuario.status, (err) => {
                    if (err) {
                        console.error('Erro ao inserir presença:', err);
                    }
                });
            });

            stmt.finalize();
            res.status(200).json({ message: 'Reunião atualizada com sucesso!' });
        });
    });
});

// Rota para excluir uma reunião
app.delete('/api/reunioes/:id', (req, res) => {
    const { id } = req.params;

    console.log('Excluindo reunião:', id);

    const deletePresencasQuery = `DELETE FROM presencas WHERE reuniao_id = ?`;
    db.run(deletePresencasQuery, [id], (err) => {
        if (err) {
            console.error('Erro ao deletar presenças:', err);
            return res.status(500).json({ error: 'Erro ao excluir as presenças.' });
        }

        const deleteReuniaoQuery = `DELETE FROM reunioes WHERE id = ?`;
        db.run(deleteReuniaoQuery, [id], (err) => {
            if (err) {
                console.error('Erro ao deletar reunião:', err);
                return res.status(500).json({ error: 'Erro ao excluir a reunião.' });
            }

            res.status(200).json({ message: 'Reunião excluída com sucesso!' });
        });
    });
});

// Rota para buscar uma reunião por ID
app.get('/api/reunioes/:id', (req, res) => {
    const { id } = req.params;

    const queryReuniao = `
        SELECT r.id, r.nome, r.descricao, r.data_criacao,
               p.usuario_id, p.status, u.name AS usuario_nome
        FROM reunioes r
        LEFT JOIN presencas p ON r.id = p.reuniao_id
        LEFT JOIN users u ON p.usuario_id = u.id
        WHERE r.id = ?
    `;

    db.all(queryReuniao, [id], (err, rows) => {
        if (err) {
            console.error('Erro ao buscar reunião:', err);
            return res.status(500).json({ error: 'Erro ao buscar reunião.' });
        }

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Reunião não encontrada.' });
        }

        // Agrupar os dados da reunião
        const { nome, descricao, data_criacao } = rows[0];
        const presencas = rows.map(row => ({
            usuario_id: row.usuario_id,
            usuario_nome: row.usuario_nome,
            status: row.status
        }));

        res.json({ id, nome, descricao, data_criacao, presencas });
    });
});

// Rota para listar usuários
app.get('/api/usuarios', (req, res) => {
    db.all(`SELECT id, name FROM users`, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao buscar usuários.' });
        }
        res.json(rows);
    });
});

// Rota de Login
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    console.log('E-mail recebido:', email);
    console.log('Senha recebida:', password);

    if (!email || !password) {
        return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
    }

    const query = `SELECT * FROM users WHERE email = ?`;
    db.get(query, [email], (err, user) => {
        if (err) {
            console.error('Erro ao buscar usuário:', err);
            return res.status(500).json({ error: 'Erro ao buscar usuário.' });
        }

        if (!user) {
            console.log('Usuário não encontrado.');
            return res.status(401).json({ error: 'Credenciais inválidas.' });
        }

        console.log('Usuário encontrado:', user);

        if (user.password !== password) {
            console.log('Senha incorreta.');
            return res.status(401).json({ error: 'Credenciais inválidas.' });
        }

        console.log('Login bem-sucedido.');
        res.status(200).json({ message: 'Login realizado com sucesso!', user });
    });
});


//end point relatorio
app.get('/api/relatorios', (req, res) => {
    db.all(`SELECT * FROM relatorios ORDER BY data_envio DESC`, [], (err, rows) => {
        if (err) {
            console.error('Erro ao buscar relatórios:', err);
            return res.status(500).json({ error: 'Erro ao buscar relatórios.' });
        }
        res.json(rows);
    });
});

// Rota para atualizar status e observação do relatório
app.put('/api/relatorios/:id', (req, res) => {
    const { id } = req.params;
    const { status, observacao } = req.body;

    db.run(
        `UPDATE relatorios SET status = ?, observacao = ? WHERE id = ?`,
        [status, observacao, id],
        function (err) {
            if (err) {
                console.error('Erro ao atualizar relatório:', err);
                return res.status(500).json({ error: 'Erro ao atualizar relatório.' });
            }
            res.json({ message: 'Relatório atualizado com sucesso!' });
        }
    );
});

// Rota comissões
// Cadastrar uma nova comissão
app.post('/api/comissoes', (req, res) => {
    const { nome, tipo, coordenador_id, coordenador_nome } = req.body;
    db.run(
        `INSERT INTO comissoes (nome, tipo, coordenador_id, coordenador_nome) VALUES (?, ?, ?, ?)`,
        [nome, tipo, coordenador_id, coordenador_nome],
        function (err) {
            if (err) {
                console.error('Erro ao cadastrar comissão:', err);
                return res.status(500).json({ error: 'Erro ao cadastrar comissão.' });
            }
            res.json({ id: this.lastID });
        }
    );
});

// Listar todas as comissões
app.get('/api/comissoes', (req, res) => {
    db.all(`SELECT * FROM comissoes ORDER BY data_criacao DESC`, [], (err, rows) => {
        if (err) {
            console.error('Erro ao buscar comissões:', err);
            return res.status(500).json({ error: 'Erro ao buscar comissões.' });
        }
        res.json(rows);
    });
});

// Adicionar membro à comissão
app.post('/api/membros_comissao', (req, res) => {
    const { comissao_id, usuario_id, nome, email, funcao, senha } = req.body;

    function inserirMembro(usuarioId) {
        db.run(
            `INSERT INTO membros_comissao (comissao_id, usuario_id, nome, email, funcao) VALUES (?, ?, ?, ?, ?)`,
            [comissao_id, usuarioId, nome, email, funcao],
            function (err) {
                if (err) {
                    console.error('Erro ao adicionar membro:', err);
                    return res.status(500).json({ error: 'Erro ao adicionar membro.' });
                }
                res.json({ id: this.lastID });
            }
        );
    }

    if (!usuario_id) {
        // Cria novo usuário fixo
        db.run(
            `INSERT INTO users (name, email, role, sector, password) VALUES (?, ?, ?, ?, ?)`,
            [nome, email, 'membro', 'Comissão', senha],
            function (err) {
                if (err) {
                    console.error('Erro ao criar usuário:', err);
                    return res.status(500).json({ error: 'Erro ao criar usuário.' });
                }
                inserirMembro(this.lastID);
            }
        );
    } else {
        inserirMembro(usuario_id);
    }
});

// Listar membros de uma comissão
app.get('/api/comissoes/:id/membros', (req, res) => {
    const { id } = req.params;
    db.all(
        `SELECT * FROM membros_comissao WHERE comissao_id = ?`,
        [id],
        (err, rows) => {
            if (err) {
                console.error('Erro ao buscar membros:', err);
                return res.status(500).json({ error: 'Erro ao buscar membros.' });
            }
            res.json(rows);
        }
    );
});

// Editar comissão
app.put('/api/comissoes/:id', (req, res) => {
    const { id } = req.params;
    const { nome, tipo, coordenador_id, coordenador_nome } = req.body;
    db.run(
        `UPDATE comissoes SET nome = ?, tipo = ?, coordenador_id = ?, coordenador_nome = ? WHERE id = ?`,
        [nome, tipo, coordenador_id, coordenador_nome, id],
        function (err) {
            if (err) {
                console.error('Erro ao editar comissão:', err);
                return res.status(500).json({ error: 'Erro ao editar comissão.' });
            }
            res.json({ message: 'Comissão atualizada com sucesso!' });
        }
    );
});

// Remover comissão
app.delete('/api/comissoes/:id', (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM comissoes WHERE id = ?`, [id], function (err) {
        if (err) {
            console.error('Erro ao remover comissão:', err);
            return res.status(500).json({ error: 'Erro ao remover comissão.' });
        }
        // Remove também os membros dessa comissão
        db.run(`DELETE FROM membros_comissao WHERE comissao_id = ?`, [id], function (err2) {
            if (err2) {
                console.error('Erro ao remover membros da comissão:', err2);
            }
            res.json({ message: 'Comissão removida com sucesso!' });
        });
    });
});

// Editar membro da comissão
app.put('/api/membros_comissao/:id', (req, res) => {
    const { id } = req.params;
    const { nome, email, funcao } = req.body;
    db.run(
        `UPDATE membros_comissao SET nome = ?, email = ?, funcao = ? WHERE id = ?`,
        [nome, email, funcao, id],
        function (err) {
            if (err) {
                console.error('Erro ao editar membro:', err);
                return res.status(500).json({ error: 'Erro ao editar membro.' });
            }
            res.json({ message: 'Membro atualizado com sucesso!' });
        }
    );
});

// Remover membro da comissão
app.delete('/api/membros_comissao/:id', (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM membros_comissao WHERE id = ?`, [id], function (err) {
        if (err) {
            console.error('Erro ao remover membro:', err);
            return res.status(500).json({ error: 'Erro ao remover membro.' });
        }
        res.json({ message: 'Membro removido com sucesso!' });
    });
});

// Criar tarefa
app.post('/api/tarefas', (req, res) => {
    const { titulo, descricao, data_limite, tipo_destinatario, destinatario_id } = req.body;
    db.run(
        `INSERT INTO tarefas (titulo, descricao, data_limite, tipo_destinatario, destinatario_id) VALUES (?, ?, ?, ?, ?)`,
        [titulo, descricao, data_limite, tipo_destinatario, destinatario_id],
        function (err) {
            if (err) {
                console.error('Erro ao criar tarefa:', err);
                return res.status(500).json({ error: 'Erro ao criar tarefa.' });
            }
            res.json({ id: this.lastID });
        }
    );
});

// Listar tarefas
app.get('/api/tarefas', (req, res) => {
    db.all(`SELECT * FROM tarefas ORDER BY data_criacao DESC`, [], (err, rows) => {
        if (err) {
            console.error('Erro ao buscar tarefas:', err);
            return res.status(500).json({ error: 'Erro ao buscar tarefas.' });
        }
        res.json(rows);
    });
});

// Atualizar status ou editar tarefa
app.put('/api/tarefas/:id', (req, res) => {
    const { id } = req.params;
    const { titulo, descricao, data_limite, status } = req.body;
    db.run(
        `UPDATE tarefas SET titulo = ?, descricao = ?, data_limite = ?, status = ? WHERE id = ?`,
        [titulo, descricao, data_limite, status, id],
        function (err) {
            if (err) {
                console.error('Erro ao editar tarefa:', err);
                return res.status(500).json({ error: 'Erro ao editar tarefa.' });
            }
            res.json({ message: 'Tarefa atualizada com sucesso!' });
        }
    );
});

// Remover tarefa
app.delete('/api/tarefas/:id', (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM tarefas WHERE id = ?`, [id], function (err) {
        if (err) {
            console.error('Erro ao remover tarefa:', err);
            return res.status(500).json({ error: 'Erro ao remover tarefa.' });
        }
        res.json({ message: 'Tarefa removida com sucesso!' });
    });
});

// Editar tarefa
app.put('/api/tarefas/:id', (req, res) => {
    const { id } = req.params;
    const { titulo, descricao, data_limite, tipo_destinatario, destinatario_id, status } = req.body;
    db.run(
        `UPDATE tarefas SET titulo = ?, descricao = ?, data_limite = ?, tipo_destinatario = ?, destinatario_id = ?, status = ? WHERE id = ?`,
        [titulo, descricao, data_limite, tipo_destinatario, destinatario_id, status, id],
        function (err) {
            if (err) {
                console.error('Erro ao editar tarefa:', err);
                return res.status(500).json({ error: 'Erro ao editar tarefa.' });
            }
            res.json({ message: 'Tarefa atualizada com sucesso!' });
        }
    );
});

// Remover tarefa
app.delete('/api/tarefas/:id', (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM tarefas WHERE id = ?`, [id], function (err) {
        if (err) {
            console.error('Erro ao remover tarefa:', err);
            return res.status(500).json({ error: 'Erro ao remover tarefa.' });
        }
        res.json({ message: 'Tarefa removida com sucesso!' });
    });
});

//rota para excluir arquivo 

app.delete('/api/arquivos/:id', (req, res) => {
    const { id } = req.params;
    db.get(`SELECT nome_armazenado FROM arquivos WHERE id = ?`, [id], (err, row) => {
        if (err || !row) return res.status(404).json({ error: 'Arquivo não encontrado.' });
        const filePath = path.join(__dirname, 'uploads', row.nome_armazenado);
        fs.unlink(filePath, () => {
            db.run(`DELETE FROM arquivos WHERE id = ?`, [id], function (err2) {
                if (err2) return res.status(500).json({ error: 'Erro ao excluir do banco.' });
                res.json({ message: 'Arquivo excluído com sucesso!' });
            });
        });
    });
});

// Criar evento
app.post('/api/eventos', (req, res) => {
  const { titulo, descricao, inicio, fim, tipo, criado_por } = req.body;
  db.run(
    `INSERT INTO eventos (titulo, descricao, inicio, fim, tipo, criado_por) VALUES (?, ?, ?, ?, ?, ?)`,
    [titulo, descricao, inicio, fim, tipo, criado_por],
    function (err) {
      if (err) {
        console.error('Erro ao criar evento:', err);
        return res.status(500).json({ error: 'Erro ao criar evento.' });
      }
      res.json({ id: this.lastID });
    }
  );
});

// Listar eventos
app.get('/api/eventos', (req, res) => {
  db.all(`SELECT * FROM eventos ORDER BY inicio ASC`, [], (err, rows) => {
    if (err) {
      console.error('Erro ao buscar eventos:', err);
      return res.status(500).json({ error: 'Erro ao buscar eventos.' });
    }
    res.json(rows);
  });
});

// Editar evento
app.put('/api/eventos/:id', (req, res) => {
  const { id } = req.params;
  const { titulo, descricao, inicio, fim, tipo } = req.body;
  db.run(
    `UPDATE eventos SET titulo = ?, descricao = ?, inicio = ?, fim = ?, tipo = ? WHERE id = ?`,
    [titulo, descricao, inicio, fim, tipo, id],
    function (err) {
      if (err) {
        console.error('Erro ao editar evento:', err);
        return res.status(500).json({ error: 'Erro ao editar evento.' });
      }
      res.json({ message: 'Evento atualizado com sucesso!' });
    }
  );
});

// Remover evento
app.delete('/api/eventos/:id', (req, res) => {
  const { id } = req.params;
  db.run(`DELETE FROM eventos WHERE id = ?`, [id], function (err) {
    if (err) {
      console.error('Erro ao remover evento:', err);
      return res.status(500).json({ error: 'Erro ao remover evento.' });
    }
    res.json({ message: 'Evento removido com sucesso!' });
  });
});

app.get('/api/ranking', (req, res) => {
  db.all(`
    SELECT u.id, u.name,
      (SELECT COUNT(*) FROM presencas WHERE usuario_id = u.id) AS presencas,
      (SELECT COUNT(*) FROM tarefas WHERE destinatario_id = u.id AND status = 'Concluída') AS tarefas_concluidas,
      ((SELECT COUNT(*) FROM presencas WHERE usuario_id = u.id) +
       (SELECT COUNT(*) FROM tarefas WHERE destinatario_id = u.id AND status = 'Concluída')) AS pontos
    FROM users u
    ORDER BY pontos DESC, u.name ASC
  `, [], (err, rows) => {
    if (err) {
      console.error('Erro ao buscar ranking:', err);
      return res.status(500).json({ error: 'Erro ao buscar ranking.' });
    }
    res.json(rows);
  });
});


// Inicializar o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});