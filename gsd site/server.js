const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const app = express();
const PORT = 3000;

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

// Inicializar o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});