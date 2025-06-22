// MENU LATERAL DINÂMICO
function inicializarMenuMembro(setor) {
  if (!setor) setor = "Outro";
  const menu = [
    {
      nome: "Início",
      href: "#inicio",
      icone: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="1.5" d="M3 12l9-9 9 9M4 10v10h16V10"></path></svg>`
    },
    {
      nome: "Arquivos",
      href: "#arquivos",
      icone: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="1.5" d="M6.75 3A2.25 2.25 0 004.5 5.25v13.5A2.25 2.25 0 006.75 21h10.5A2.25 2.25 0 0019.5 18.75V8.25a2.25 2.25 0 00-.659-1.591l-4.5-4.5A2.25 2.25 0 0012.75 2.25H6.75z"></path></svg>`
    },
    {
      nome: "Tarefas",
      href: "#tarefas",
      icone: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="1.5" d="M9 12h6m-6 4h6m-7.5-8.25A2.25 2.25 0 016.75 5.25h10.5A2.25 2.25 0 0119.5 7.5v11.25A2.25 2.25 0 0117.25 21H6.75A2.25 2.25 0 014.5 18.75V7.5A2.25 2.25 0 016.75 5.25z"></path></svg>`
    },
    {
      nome: "Comissões",
      href: "#comissoes",
      icone: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="1.5" d="M17 20h5v-2a4 4 0 00-4-4h-1m-6 6v-2a4 4 0 014-4h1m-6 6H2v-2a4 4 0 014-4h1m6-6a4 4 0 11-8 0 4 4 0 018 0zm6 4a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>`
    },
    {
      nome: "Relatórios",
      href: "#relatorios",
      icone: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="1.5" d="M9 12h6m-6 4h6m-7.5-8.25A2.25 2.25 0 016.75 5.25h10.5A2.25 2.25 0 0119.5 7.5v11.25A2.25 2.25 0 0117.25 21H6.75A2.25 2.25 0 014.5 18.75V7.5A2.25 2.25 0 016.75 5.25z"></path></svg>`
    },
    {
      nome: "Relatórios Enviados",
      href: "#relatoriosEnviados",
      icone: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="1.5" d="M9 12h6m-6 4h6m-7.5-8.25A2.25 2.25 0 016.75 5.25h10.5A2.25 2.25 0 0119.5 7.5v11.25A2.25 2.25 0 0117.25 21H6.75A2.25 2.25 0 014.5 18.75V7.5A2.25 2.25 0 016.75 5.25z"></path></svg>`
    },
    {
      nome: "Ranking",
      href: "#ranking",
      icone: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="1.5" d="M3 3v18h18"></path><path stroke-width="1.5" d="M9 17V9m4 8V5m4 12v-4"></path></svg>`
    }
  ];

  // Só mostra a Rádio para quem é do setor Rádio GSD Mix
  if (setor && setor.toLowerCase().includes("rádio")) {
    menu.push({
      nome: "Rádio GSD Mix",
      href: "#radio",
      icone: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-width="1.5"></circle><path stroke-width="1.5" d="M8 12h8m-4-4v8"></path></svg>`
    });
  }

  const ul = document.getElementById('menu-membro');
  ul.innerHTML = "";
  menu.forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = `
      <a href="${item.href}" class="flex items-center gap-3 py-2 px-4 rounded-lg hover:bg-blue-700 transition">
        ${item.icone}
        <span>${item.nome}</span>
      </a>
    `;
    ul.appendChild(li);
  });
}

// Inicialização do menu
window.addEventListener('DOMContentLoaded', () => {
  const setor = localStorage.getItem('setor');
  inicializarMenuMembro(setor);
});

// PERFIL DO MEMBRO (nome, foto, upload e logout)
window.addEventListener('DOMContentLoaded', async () => {
  const nome = localStorage.getItem('nome');
  const email = localStorage.getItem('userEmail');
  if (document.getElementById('nome-membro')) {
    document.getElementById('nome-membro').textContent = nome || 'Membro';
  }
  try {
    const resp = await fetch(`http://localhost:3000/api/usuarios?email=${email}`);
    const usuario = (await resp.json())[0];
    if (usuario && usuario.foto_url && document.getElementById('avatar-membro')) {
      document.getElementById('avatar-membro').src = usuario.foto_url;
    }
  } catch (e) {}
});

if (document.getElementById('input-foto-perfil-membro')) {
  document.getElementById('input-foto-perfil-membro').addEventListener('change', async function () {
    const file = this.files[0];
    if (!file) return;
    const email = localStorage.getItem('userEmail');
    const formData = new FormData();
    formData.append('foto', file);
    formData.append('email', email);
    const resp = await fetch('http://localhost:3000/api/usuarios/foto', {
      method: 'POST',
      body: formData
    });
    const data = await resp.json();
    if (data.foto_url && document.getElementById('avatar-membro')) {
      document.getElementById('avatar-membro').src = data.foto_url;
      alert('Foto atualizada!');
    } else {
      alert('Erro ao atualizar foto.');
    }
  });
}

if (document.getElementById('logout-btn-membro')) {
  document.getElementById('logout-btn-membro').addEventListener('click', function () {
    localStorage.clear();
    window.location.href = '/login/index_login.html';
  });
}

// Funções de conteúdo dinâmico (IDs trocados para "membro")
async function carregarArquivos() {
  const container = document.getElementById('content');
  container.innerHTML = `
    <div class="bg-gray-100 min-h-screen p-6">
      <header class="flex justify-between items-center bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-lg shadow-lg">
        <h1 class="text-3xl font-bold flex items-center gap-2">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2zm2 0h12v16H6V4zm7 9h5v2h-5v-2zm-7 0h5v2H6v-2z"></path></svg>
          Arquivos Disponíveis
        </h1>
        <div class="flex items-center gap-4">
          <span class="text-sm font-medium">Visualize e baixe os arquivos enviados!</span>
        </div>
      </header>
      <div class="mt-8 space-y-6">
        <section class="bg-white p-6 rounded-lg shadow-lg">
          <h2 class="text-2xl font-semibold mb-4 text-gray-800">Arquivos</h2>
          <div id="lista-arquivos" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"></div>
        </section>
      </div>
    </div>
  `;
  try {
    const res = await fetch('http://localhost:3000/api/arquivos');
    const arquivos = await res.json();
    const lista = arquivos.map(arq => `
      <div class="bg-gray-50 border rounded-lg p-4 shadow hover:shadow-lg transition">
        <h3 class="font-semibold text-blue-800">${arq.nome_original}</h3>
        <p class="text-gray-600 text-sm">Data de upload: ${new Date(arq.data_upload).toLocaleString()}</p>
        <a href="http://localhost:3000/uploads/${arq.nome_armazenado}" class="text-blue-600 hover:underline font-semibold" download>
          Baixar Arquivo
        </a>
      </div>
    `).join('');
    document.getElementById('lista-arquivos').innerHTML = lista || "<p class='text-gray-500'>Nenhum arquivo disponível.</p>";
  } catch (err) {
    document.getElementById('lista-arquivos').innerHTML = "<p class='text-red-600'>Erro ao carregar arquivos.</p>";
  }
}

async function carregarTarefas() {
  const container = document.getElementById('content');
  container.innerHTML = `
    <div class="bg-gray-100 min-h-screen p-6">
      <header class="flex justify-between items-center bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-lg shadow-lg">
        <h1 class="text-3xl font-bold flex items-center gap-2">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-3-3v6m-7 4h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          Minhas Tarefas
        </h1>
        <div class="flex items-center gap-4">
          <span class="text-sm font-medium">Gerencie suas tarefas com facilidade!</span>
        </div>
      </header>
      <div class="mt-8 space-y-6">
        <section class="bg-white p-6 rounded-lg shadow-lg">
          <h2 class="text-2xl font-semibold mb-4 text-gray-800">Tarefas Pendentes</h2>
          <div id="tarefas" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"></div>
        </section>
      </div>
    </div>
  `;
  const userId = localStorage.getItem('userId');
  if (!userId) {
    document.getElementById('tarefas').innerHTML = "<p class='text-red-600'>Usuário não identificado.</p>";
    return;
  }
  try {
    const res = await fetch('http://localhost:3000/api/tarefas');
    const tarefas = await res.json();
    const lista = tarefas
      .filter(tarefa => tarefa.destinatario_id == userId && tarefa.status !== 'Concluída')
      .map(tarefa => `
        <div class="bg-gray-50 border rounded-lg p-4 shadow hover:shadow-lg transition">
          <h3 class="font-semibold text-blue-800">${tarefa.titulo}</h3>
          <p class="text-gray-600 text-sm">${tarefa.descricao}</p>
          <p class="text-gray-500 text-xs">Data limite: ${tarefa.data_limite}</p>
          <button class="concluir-tarefa bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg mt-2 transition" data-id="${tarefa.id}">
            Concluir
          </button>
        </div>
      `).join('');
    document.getElementById('tarefas').innerHTML = lista || "<p class='text-gray-500'>Nenhuma tarefa disponível.</p>";
  } catch (err) {
    document.getElementById('tarefas').innerHTML = "<p class='text-red-600'>Erro ao carregar tarefas.</p>";
  }
  document.querySelectorAll('.concluir-tarefa').forEach(button => {
    button.addEventListener('click', async function () {
      const tarefaId = this.getAttribute('data-id');
      try {
        await fetch(`http://localhost:3000/api/tarefas/${tarefaId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'Concluída' })
        });
        alert('Tarefa concluída com sucesso!');
        carregarTarefas();
      } catch (err) {
        alert('Erro ao concluir tarefa.');
      }
    });
  });
}

async function carregarComissoes() {
  const container = document.getElementById('content');
  container.innerHTML = `
    <div class="bg-gray-100 min-h-screen p-6">
      <header class="flex justify-between items-center bg-gradient-to-r from-purple-600 to-purple-800 text-white p-6 rounded-lg shadow-lg">
        <h1 class="text-3xl font-bold flex items-center gap-2">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a4 4 0 00-4-4h-1m-6 6v-2a4 4 0 014-4h1m-6 6H2v-2a4 4 0 014-4h1m6-6a4 4 0 11-8 0 4 4 0 018 0zm6 4a4 4 0 11-8 0 4 4 0 018 0z"></path>
          </svg>
          Minhas Comissões
        </h1>
        <div class="flex items-center gap-4">
          <span class="text-sm font-medium">Veja as comissões que você participa!</span>
        </div>
      </header>
      <div class="mt-8 space-y-6">
        <section class="bg-white p-6 rounded-lg shadow-lg">
          <h2 class="text-2xl font-semibold mb-4 text-gray-800">Comissões</h2>
          <div id="lista-comissoes" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"></div>
        </section>
      </div>
    </div>
  `;
  try {
    const res = await fetch('http://localhost:3000/api/comissoes');
    const comissoes = await res.json();
    const userEmail = localStorage.getItem('userEmail');
    const minhasComissoes = comissoes.filter(comissao =>
      comissao.membros && comissao.membros.includes(userEmail)
    );
    const lista = minhasComissoes.map(comissao => `
      <div class="bg-gray-50 border rounded-lg p-4 shadow hover:shadow-lg transition">
        <h3 class="font-semibold text-purple-800">${comissao.nome}</h3>
        <p class="text-gray-600 text-sm">${comissao.descricao || ''}</p>
      </div>
    `).join('');
    document.getElementById('lista-comissoes').innerHTML = lista || "<p class='text-gray-500'>Você não participa de nenhuma comissão.</p>";
  } catch (err) {
    document.getElementById('lista-comissoes').innerHTML = "<p class='text-red-600'>Erro ao carregar comissões.</p>";
  }
}

async function exibirFormularioRelatorio() {
  const container = document.getElementById('content');
  container.innerHTML = `
    <div class="bg-gray-100 min-h-screen p-6">
      <header class="flex justify-between items-center bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-lg shadow-lg">
        <h1 class="text-3xl font-bold flex items-center gap-2">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-3-3v6m-7 4h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          Enviar Relatório
        </h1>
        <div class="flex items-center gap-4">
          <span class="text-sm font-medium">Envie relatórios com facilidade!</span>
        </div>
      </header>
      <div class="mt-8 space-y-6">
        <section class="bg-white p-6 rounded-lg shadow-lg">
          <h2 class="text-2xl font-semibold mb-4 text-gray-800">Preencha os detalhes do relatório</h2>
          <form id="form-relatorio" class="space-y-6">
            <div>
              <label class="block mb-2 font-semibold text-gray-700">Tipo</label>
              <select name="tipo" class="border rounded-lg w-full p-3 focus:ring focus:ring-blue-300" required>
                <option value="">Selecione</option>
                <option value="Criação de Projeto">Criação de Projeto</option>
                <option value="Relatório de Andamento">Relatório de Andamento</option>
              </select>
            </div>
            <div>
              <label class="block mb-2 font-semibold text-gray-700">Projeto</label>
              <input type="text" name="projeto" class="border rounded-lg w-full p-3 focus:ring focus:ring-blue-300" placeholder="Ex: Feira de Ciências" required>
            </div>
            <div>
              <label class="block mb-2 font-semibold text-gray-700">Conteúdo</label>
              <textarea name="conteudo" class="border rounded-lg w-full p-3 focus:ring focus:ring-blue-300" placeholder="Descreva o relatório..." required></textarea>
            </div>
            <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition shadow-lg">Enviar</button>
          </form>
        </section>
      </div>
    </div>
  `;
  document.getElementById('form-relatorio').onsubmit = async function (e) {
    e.preventDefault();
    const form = e.target;
    const userEmail = localStorage.getItem('userEmail');
    try {
      await fetch('http://localhost:3000/api/relatorios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: form.tipo.value,
          projeto: form.projeto.value,
          coordenador: userEmail,
          conteudo: form.conteudo.value,
          observacao: "",
          usuario_email: userEmail
        })
      });
      alert('Relatório enviado com sucesso!');
      exibirFormularioRelatorio();
    } catch (err) {
      alert('Erro ao enviar relatório.');
    }
  };
}

async function carregarRelatoriosAtualizados() {
  const container = document.getElementById('content');
  container.innerHTML = `
    <div class="bg-gray-100 min-h-screen p-6">
      <header class="flex justify-between items-center bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-lg shadow-lg">
        <h1 class="text-3xl font-bold flex items-center gap-2">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-3-3v6m-7 4h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          Relatórios Enviados
        </h1>
        <div class="flex items-center gap-4">
          <span class="text-sm font-medium">Visualize seus relatórios enviados!</span>
        </div>
      </header>
      <div class="mt-8 space-y-6">
        <section class="bg-white p-6 rounded-lg shadow-lg">
          <h2 class="text-2xl font-semibold mb-4 text-gray-800">Relatórios</h2>
          <div id="relatorios" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"></div>
        </section>
      </div>
    </div>
  `;
  try {
    const res = await fetch('http://localhost:3000/api/relatorios');
    const relatorios = await res.json();
    const userEmail = localStorage.getItem('userEmail');
    const relatoriosFiltrados = relatorios.filter(relatorio => relatorio.usuario_email === userEmail);
    const lista = relatoriosFiltrados.map(relatorio => `
      <div class="bg-gray-50 border rounded-lg p-4 shadow hover:shadow-lg transition">
        <h3 class="font-semibold text-blue-800">${relatorio.tipo}</h3>
        <p class="text-gray-600 text-sm">${relatorio.projeto}</p>
        <p class="text-gray-500 text-xs">Status: ${relatorio.status}</p>
        <p class="text-gray-500 text-xs">Observação: ${relatorio.observacao || 'Nenhuma'}</p>
      </div>
    `).join('');
    document.getElementById('relatorios').innerHTML = lista || "<p class='text-gray-500'>Nenhum relatório disponível.</p>";
  } catch (err) {
    document.getElementById('relatorios').innerHTML = "<p class='text-red-600'>Erro ao carregar relatórios.</p>";
  }
}

async function carregarRanking() {
  const container = document.getElementById('content');
  container.innerHTML = `
    <div class="bg-gray-100 min-h-screen p-6">
      <header class="flex justify-between items-center bg-gradient-to-r from-yellow-500 to-yellow-700 text-white p-6 rounded-lg shadow-lg">
        <h1 class="text-3xl font-bold flex items-center gap-2">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 17.5l-5.09 2.68 1-5.82-4.22-4.11 5.84-.85L12 4.5l2.47 5.01 5.84.85-4.22 4.11 1 5.82z"></path></svg>
          Ranking de Engajamento
        </h1>
        <div class="flex items-center gap-4">
          <span class="text-sm font-medium">Veja os melhores desempenhos!</span>
        </div>
      </header>
      <div class="mt-8 space-y-6">
        <section class="bg-white p-6 rounded-lg shadow-lg">
          <h2 class="text-2xl font-semibold mb-4 text-gray-800">Top Participantes</h2>
          <div id="lista-ranking" class="overflow-x-auto"></div>
        </section>
      </div>
    </div>
  `;
  const resp = await fetch('/api/ranking');
  const ranking = await resp.json();
  const lista = document.getElementById('lista-ranking');
  if (ranking.length === 0) {
    lista.innerHTML = `<p class="text-gray-500 text-center">Nenhum dado de engajamento ainda.</p>`;
    return;
  }
  lista.innerHTML = `
    <table class="min-w-full text-sm bg-white rounded-xl overflow-hidden shadow">
      <thead>
        <tr class="bg-yellow-100">
          <th class="px-4 py-2 text-left font-semibold text-gray-700">Posição</th>
          <th class="px-4 py-2 text-left font-semibold text-gray-700">Nome</th>
          <th class="px-4 py-2 text-left font-semibold text-gray-700">Presenças</th>
          <th class="px-4 py-2 text-left font-semibold text-gray-700">Tarefas Concluídas</th>
          <th class="px-4 py-2 text-left font-semibold text-gray-700">Pontos</th>
        </tr>
      </thead>
      <tbody>
        ${ranking.map((u, i) => `
          <tr class="${i === 0 ? 'bg-yellow-50 font-bold' : ''}">
            <td class="border-t px-4 py-2">${i + 1} ${i === 0 ? '🏆' : i === 1 ? '🥈' : i === 2 ? '🥉' : ''}</td>
            <td class="border-t px-4 py-2">${u.name}</td>
            <td class="border-t px-4 py-2">${u.presencas}</td>
            <td class="border-t px-4 py-2">${u.tarefas_concluidas}</td>
            <td class="border-t px-4 py-2 text-yellow-600">${u.pontos}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

async function carregarInicioMembro() {
  const container = document.getElementById('content');
  container.innerHTML = `<div class="text-center text-gray-500">Carregando...</div>`;
  const [tarefasResp, rankingResp, eventosResp, comissoesResp] = await Promise.all([
    fetch('http://localhost:3000/api/tarefas'),
    fetch('/api/ranking'),
    fetch('/api/eventos'),
    fetch('http://localhost:3000/api/comissoes')
  ]);
  const tarefas = await tarefasResp.json();
  const ranking = await rankingResp.json();
  const eventos = await eventosResp.json();
  const comissoes = await comissoesResp.json();
  const userId = localStorage.getItem('userId');
  const userEmail = localStorage.getItem('userEmail');
  const usuarioRanking = ranking.find(u => u.email === userEmail) || {};
  const minhasComissoes = comissoes.filter(c => c.membros && c.membros.includes(userEmail));
  const minhasTarefasPendentes = tarefas.filter(t => t.status !== 'Concluída' && t.destinatario_id == userId);
  const agora = new Date();
  const eventosDoMes = eventos.filter(e => new Date(e.inicio).getMonth() === agora.getMonth());
  const proximoEvento = eventosDoMes.sort((a, b) => new Date(a.inicio) - new Date(b.inicio))[0];
  container.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div class="bg-white rounded-xl shadow p-6 flex flex-col items-center">
        <span class="text-blue-600 text-3xl font-bold">${minhasTarefasPendentes.length}</span>
        <span class="text-gray-700 mt-2 font-semibold">Tarefas Pendentes</span>
        <span class="text-xs text-gray-500 mt-1">${tarefas.length > 0 ? Math.round(100 * (tarefas.length - minhasTarefasPendentes.length) / tarefas.length) : 0}% concluído</span>
      </div>
      <div class="bg-white rounded-xl shadow p-6 flex flex-col items-center">
        <span class="text-green-600 text-3xl font-bold">${eventosDoMes.length}</span>
        <span class="text-gray-700 mt-2 font-semibold">Eventos do Mês</span>
        <span class="text-xs text-gray-500 mt-1">${proximoEvento ? `Próximo: ${proximoEvento.titulo} (${new Date(proximoEvento.inicio).toLocaleDateString()})` : 'Nenhum evento'}</span>
      </div>
      <div class="bg-white rounded-xl shadow p-6 flex flex-col items-center">
        <span class="text-purple-600 text-3xl font-bold">${minhasComissoes.length}</span>
        <span class="text-gray-700 mt-2 font-semibold">Comissões Ativas</span>
        <span class="text-xs text-gray-500 mt-1">Membros envolvidos: ${minhasComissoes.reduce((acc, c) => acc + (c.membros?.length || 0), 0)}</span>
      </div>
      <div class="bg-white rounded-xl shadow p-6 flex flex-col items-center">
        <span class="text-yellow-500 text-3xl font-bold">${usuarioRanking.posicao || '-'}</span>
        <span class="text-gray-700 mt-2 font-semibold">Seu Ranking</span>
        <span class="text-xs text-gray-500 mt-1">Pontos: ${usuarioRanking.pontos || 0}</span>
      </div>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <h3 class="text-lg font-bold mb-4 text-blue-800">Tarefas Recentes</h3>
        <div class="space-y-3">
          ${minhasTarefasPendentes.slice(0, 5).map(t => `
            <div class="bg-gray-50 rounded-lg p-4 shadow flex items-center justify-between">
              <div>
                <div class="font-semibold text-gray-800">${t.titulo}</div>
                <div class="text-xs text-gray-500">Vence em ${t.data_limite ? Math.ceil((new Date(t.data_limite) - agora) / (1000*60*60*24)) : '-'} dias</div>
              </div>
              <span class="text-xs px-2 py-1 rounded ${t.prioridade === 'Alta' ? 'bg-blue-100 text-blue-700' : t.prioridade === 'Média' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-200 text-gray-700'}">${t.prioridade || 'Pendente'}</span>
            </div>
          `).join('') || `<div class="text-gray-500">Nenhuma tarefa recente.</div>`}
        </div>
      </div>
      <div>
        <h3 class="text-lg font-bold mb-4 text-blue-800">Calendário de Eventos</h3>
        <div id="calendar-membro"></div>
      </div>
    </div>
  `;
  if (window.FullCalendar) {
    const calendarEl = document.getElementById('calendar-membro');
    const calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: 'dayGridMonth',
      height: 500,
      events: eventos.map(e => ({
        id: e.id,
        title: e.titulo,
        start: e.inicio,
        end: e.fim,
        extendedProps: {
          descricao: e.descricao,
          tipo: e.tipo
        }
      }))
    });
    calendar.render();
  }
}

// Rádio GSD Mix
async function carregarRadio() {
  const container = document.getElementById('content');
  container.innerHTML = `
    <div class="bg-gradient-to-br from-blue-100 to-blue-300 min-h-screen p-6">
      <header class="flex justify-between items-center bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-lg shadow-lg">
        <h1 class="text-3xl font-bold flex items-center gap-2">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-width="2"></circle><path stroke-width="2" d="M8 12h8m-4-4v8"></path></svg>
          Rádio GSD Mix
        </h1>
        <div class="flex items-center gap-4">
          <span class="text-sm font-medium">Área exclusiva da equipe da rádio!</span>
        </div>
      </header>
      <div class="mt-8 space-y-10">
        <div class="flex gap-2 border-b mb-4">
          <button class="tab-radio px-4 py-2 font-semibold border-b-2 border-blue-600" data-tab="escala">Escala</button>
          <button class="tab-radio px-4 py-2 font-semibold" data-tab="audios">Biblioteca de Áudios</button>
          <button class="tab-radio px-4 py-2 font-semibold" data-tab="comunicados">Comunicados</button>
          <button class="tab-radio px-4 py-2 font-semibold" data-tab="calendario">Calendário</button>
        </div>
        <div id="conteudo-radio"></div>
      </div>
    </div>
  `;
  renderTabRadio('escala');

  // Troca de abas
  document.querySelectorAll('.tab-radio').forEach(btn => {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.tab-radio').forEach(b => b.classList.remove('border-blue-600'));
      this.classList.add('border-blue-600');
      renderTabRadio(this.dataset.tab);
    });
  });
}

// Função para renderizar o conteúdo de cada aba
async function renderTabRadio(tab) {
  const conteudo = document.getElementById('conteudo-radio');
  if (tab === 'escala') {
    conteudo.innerHTML = `
      <div class="bg-white rounded-lg shadow-lg p-6">
        <h2 class="text-xl font-bold text-blue-800 mb-4">Escala e Programação da Semana</h2>
        <div class="overflow-x-auto">
          <table class="min-w-full text-sm text-center">
            <thead>
              <tr class="bg-blue-100">
                <th class="px-4 py-2">Dia</th>
                <th class="px-4 py-2">Horário</th>
                <th class="px-4 py-2">Quadros</th>
                <th class="px-4 py-2">Responsável</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="border-t px-4 py-2 font-semibold">Segunda</td>
                <td class="border-t px-4 py-2">30-40min</td>
                <td class="border-t px-4 py-2 text-left">
                  <ul class="list-disc ml-4 text-left">
                    <li>Abertura</li>
                    <li>Boletim Escolar</li>
                    <li>Músicas Tocando</li>
                    <li>Recados da Galera</li>
                    <li>Encerramento</li>
                  </ul>
                </td>
                <td class="border-t px-4 py-2">Yan / Arthur</td>
              </tr>
              <tr>
                <td class="border-t px-4 py-2 font-semibold">Terça</td>
                <td class="border-t px-4 py-2">1h30</td>
                <td class="border-t px-4 py-2 text-left">
                  <ul class="list-disc ml-4 text-left">
                    <li>Abertura</li>
                    <li>Top 5 da Semana (#5 ao #3)</li>
                    <li>Músicas Tocando</li>
                    <li>Quiz Interativo</li>
                    <li>Dica Cultural</li>
                    <li>Músicas Tocando</li>
                    <li>Encerramento</li>
                  </ul>
                </td>
                <td class="border-t px-4 py-2">Yan / Arthur</td>
              </tr>
              <tr>
                <td class="border-t px-4 py-2 font-semibold">Quarta</td>
                <td class="border-t px-4 py-2">1h30</td>
                <td class="border-t px-4 py-2 text-left">
                  <ul class="list-disc ml-4 text-left">
                    <li>Abertura</li>
                    <li>Top 5 da Semana (#2 e #1)</li>
                    <li>Desafio Musical</li>
                    <li>Conselhos da Rádio</li>
                    <li>Músicas Tocando</li>
                    <li>Encerramento</li>
                  </ul>
                </td>
                <td class="border-t px-4 py-2">Yan / Arthur</td>
              </tr>
              <tr>
                <td class="border-t px-4 py-2 font-semibold">Quinta</td>
                <td class="border-t px-4 py-2">1h30</td>
                <td class="border-t px-4 py-2 text-left">
                  <ul class="list-disc ml-4 text-left">
                    <li>Abertura</li>
                    <li>Horóscopo Escolar</li>
                    <li>Músicas Tocando</li>
                    <li>Conselhos da Rádio</li>
                    <li>Dica Cultural</li>
                    <li>Músicas Tocando</li>
                    <li>Encerramento</li>
                  </ul>
                </td>
                <td class="border-t px-4 py-2">Yan / Arthur</td>
              </tr>
              <tr>
                <td class="border-t px-4 py-2 font-semibold">Sexta</td>
                <td class="border-t px-4 py-2">30-40min</td>
                <td class="border-t px-4 py-2 text-left">
                  <ul class="list-disc ml-4 text-left">
                    <li>Abertura</li>
                    <li>Recados da Galera</li>
                    <li>Dica Cultural</li>
                    <li>Músicas Tocando</li>
                    <li>Encerramento</li>
                  </ul>
                </td>
                <td class="border-t px-4 py-2">Yan / Arthur</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="mt-6 text-gray-600 text-sm">
          <b>Observação:</b> Os quadros podem ser adaptados conforme a necessidade e criatividade da equipe!
        </div>
      </div>
    `;
  } else if (tab === 'audios') {
    conteudo.innerHTML = `
      <div class="bg-white rounded-lg shadow-lg p-6">
        <h2 class="text-xl font-bold text-blue-800 mb-4">Biblioteca de Áudios e Vinhetas</h2>
        <form id="form-upload-audio" class="flex flex-col md:flex-row gap-4 mb-6">
          <input type="file" name="audio" accept="audio/*" required class="border rounded-lg p-2 flex-1">
          <select name="tipo" required class="border rounded-lg p-2">
            <option value="">Tipo</option>
            <option value="Vinheta">Vinheta</option>
            <option value="Trilha">Trilha</option>
            <option value="Spot">Spot</option>
            <option value="Outro">Outro</option>
          </select>
          <input type="text" name="descricao" placeholder="Descrição" class="border rounded-lg p-2 flex-1">
          <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold">Enviar</button>
        </form>
        <div id="lista-audios" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"></div>
      </div>
    `;
    carregarListaAudios();
    document.getElementById('form-upload-audio').onsubmit = async function (e) {
      e.preventDefault();
      const form = e.target;
      const file = form.audio.files[0];
      if (!file) return alert('Selecione um arquivo de áudio!');
      const formData = new FormData();
      formData.append('audio', file);
      formData.append('tipo', form.tipo.value);
      formData.append('descricao', form.descricao.value);
      try {
        await fetch('http://localhost:3000/api/audios', {
          method: 'POST',
          body: formData
        });
        alert('Áudio enviado com sucesso!');
        carregarListaAudios();
        form.reset();
      } catch (err) {
        alert('Erro ao enviar áudio.');
      }
    };
  } else if (tab === 'comunicados') {
    conteudo.innerHTML = `
      <div class="bg-white rounded-lg shadow-lg p-6">
        <h2 class="text-xl font-bold text-blue-800 mb-4">Comunicados Internos</h2>
        <form id="form-comunicado" class="flex gap-2 mb-6">
          <input type="text" name="mensagem" placeholder="Novo comunicado..." class="border rounded-lg p-2 flex-1" required>
          <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold">Enviar</button>
        </form>
        <ul id="lista-comunicados" class="space-y-3"></ul>
      </div>
    `;
    carregarComunicados();
    document.getElementById('form-comunicado').onsubmit = async function (e) {
      e.preventDefault();
      const form = e.target;
      const mensagem = form.mensagem.value;
      if (!mensagem) return;
      await fetch('http://localhost:3000/api/comunicados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensagem })
      });
      form.reset();
      carregarComunicados();
    };
 } else if (tab === 'calendario') {
  conteudo.innerHTML = `
    <div class="bg-white rounded-lg shadow-lg p-6">
      <h2 class="text-xl font-bold text-blue-800 mb-4">Calendário da Rádio</h2>
      <form id="form-evento-radio" class="flex flex-col md:flex-row gap-2 mb-6">
        <input type="text" name="titulo" placeholder="Título do evento" class="border rounded-lg p-2 flex-1" required>
        <input type="datetime-local" name="inicio" class="border rounded-lg p-2" required>
        <input type="datetime-local" name="fim" class="border rounded-lg p-2">
        <input type="text" name="descricao" placeholder="Descrição" class="border rounded-lg p-2 flex-1">
        <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold">Adicionar</button>
      </form>
      <div id="calendario-radio"></div>
    </div>
  `;
  renderFullCalendarRadio();
  document.getElementById('form-evento-radio').onsubmit = async function (e) {
    e.preventDefault();
    const form = e.target;
    await fetch('http://localhost:3000/api/eventos_radio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        titulo: form.titulo.value,
        inicio: form.inicio.value,
        fim: form.fim.value,
        descricao: form.descricao.value
      })
    });
    form.reset();
    renderFullCalendarRadio();
  };
}
}

// Carregar lista de áudios (mock, adapte para seu backend)
async function carregarListaAudios() {
  const lista = document.getElementById('lista-audios');
  try {
    const res = await fetch('http://localhost:3000/api/audios');
    const audios = await res.json();
    lista.innerHTML = audios.map(audio => `
      <div class="bg-gray-50 border rounded-lg p-4 shadow hover:shadow-lg transition flex flex-col gap-2">
        <div class="font-semibold text-blue-700">${audio.tipo || 'Áudio'}</div>
        <div class="text-gray-700 text-sm">${audio.descricao || ''}</div>
        <audio controls src="http://localhost:3000/uploads/audios/${audio.nome_armazenado}" class="w-full"></audio>
        <a href="http://localhost:3000/uploads/audios/${audio.nome_armazenado}" download class="text-blue-600 hover:underline text-sm">Baixar</a>
        <div class="text-xs text-gray-400">Enviado em: ${new Date(audio.data_upload).toLocaleString()}</div>
      </div>
    `).join('') || "<div class='text-gray-500'>Nenhum áudio enviado ainda.</div>";
  } catch {
    lista.innerHTML = "<div class='text-red-600'>Erro ao carregar áudios.</div>";
  }
}

// Carregar comunicados (mock, adapte para seu backend)
async function carregarComunicados() {
  const lista = document.getElementById('lista-comunicados');
  try {
    const res = await fetch('http://localhost:3000/api/comunicados');
    const comunicados = await res.json();
    lista.innerHTML = comunicados.reverse().map(c => `
      <li class="bg-blue-50 border-l-4 border-blue-400 p-3 rounded">${c.mensagem} <span class="text-xs text-gray-400 float-right">${new Date(c.data_envio).toLocaleString()}</span></li>
    `).join('') || "<li class='text-gray-500'>Nenhum comunicado ainda.</li>";
  } catch {
    lista.innerHTML = "<li class='text-red-600'>Erro ao carregar comunicados.</li>";
  }
}
  

async function renderFullCalendarRadio() {
  const calendarEl = document.getElementById('calendario-radio');
  calendarEl.innerHTML = ""; // Limpa antes de renderizar
  const res = await fetch('http://localhost:3000/api/eventos_radio');
  const eventos = await res.json();
  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    height: 500,
    locale: 'pt-br',
    events: eventos.map(e => ({
      id: e.id,
      title: e.titulo,
      start: e.inicio,
      end: e.fim,
      description: e.descricao
    })),
    eventClick: function(info) {
      if (info.event.extendedProps.description) {
        alert(info.event.title + "\n\n" + info.event.extendedProps.description);
      } else {
        alert(info.event.title);
      }
    }
  });
  calendar.render();
}

// Roteamento dos links do menu
document.addEventListener('click', function (e) {
  const target = e.target.closest('a');
  if (!target) return;
  const href = target.getAttribute('href');
  if (href === '#inicio') carregarInicioMembro();
  else if (href === '#arquivos') carregarArquivos();
  else if (href === '#tarefas') carregarTarefas();
  else if (href === '#comissoes') carregarComissoes();
  else if (href === '#relatorios') exibirFormularioRelatorio();
  else if (href === '#relatoriosEnviados') carregarRelatoriosAtualizados();
  else if (href === '#ranking') carregarRanking();
  else if (href === '#radio') carregarRadio();
});