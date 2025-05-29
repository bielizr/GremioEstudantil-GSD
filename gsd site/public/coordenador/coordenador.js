// Recebe o setor dinamicamente, por exemplo, via localStorage ou query string

// ...existing code...

function inicializarMenuCoordenador(setor) {
  if (!setor) setor = "Outro"; // Valor padrão para evitar erro

  document.getElementById('coordenador-setor').textContent = `Coordenador - ${setor}`;
  document.getElementById('coordenador-avatar').textContent = setor.substring(0, 2).toUpperCase();

  const menu = [
    {
      nome: "Início",
      href: "#inicio",
      icone: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-width="1.5" d="M3 12l9-9 9 9M4 10v10h16V10"></path>
              </svg>`
    },
    {
      nome: "Arquivos",
      href: "#arquivos",
      icone: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-width="1.5" d="M6.75 3A2.25 2.25 0 004.5 5.25v13.5A2.25 2.25 0 006.75 21h10.5A2.25 2.25 0 0019.5 18.75V8.25a2.25 2.25 0 00-.659-1.591l-4.5-4.5A2.25 2.25 0 0012.75 2.25H6.75z"></path>
              </svg>`
    },
    {
      nome: "Tarefas",
      href: "#tarefas",
      icone: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-width="1.5" d="M9 12h6m-6 4h6m-7.5-8.25A2.25 2.25 0 016.75 5.25h10.5A2.25 2.25 0 0119.5 7.5v11.25A2.25 2.25 0 0117.25 21H6.75A2.25 2.25 0 014.5 18.75V7.5A2.25 2.25 0 016.75 5.25z"></path>
              </svg>`
    },
    {
      nome: "Comissões",
      href: "#comissoes",
      icone: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-width="1.5" d="M17 20h5v-2a4 4 0 00-4-4h-1m-6 6v-2a4 4 0 014-4h1m-6 6H2v-2a4 4 0 014-4h1m6-6a4 4 0 11-8 0 4 4 0 018 0zm6 4a4 4 0 11-8 0 4 4 0 018 0z"></path>
              </svg>`
    },
    {
      nome: "Relatórios",
      href: "#relatorios",
      icone: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-width="1.5" d="M9 12h6m-6 4h6m-7.5-8.25A2.25 2.25 0 016.75 5.25h10.5A2.25 2.25 0 0119.5 7.5v11.25A2.25 2.25 0 0117.25 21H6.75A2.25 2.25 0 014.5 18.75V7.5A2.25 2.25 0 016.75 5.25z"></path>
              </svg>`
    },
    {
      nome: "Ranking",
      href: "#ranking",
      icone: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-width="1.5" d="M3 3v18h18"></path>
                <path stroke-width="1.5" d="M9 17V9m4 8V5m4 12v-4"></path>
              </svg>`
    }
  ];

  // Ajuste na verificação do setor para exibir Cantina
  if (setor && setor.toLowerCase() === "finanças") {
    menu.push({
      nome: "Cantina",
      href: "#cantina",
      icone: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-width="1.5" d="M3 3h18v18H3z"></path>
                <path stroke-width="1.5" d="M8 8h8v8H8z"></path>
              </svg>`
    });
  }

  const ul = document.getElementById('menu-coordenador');
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

// Exemplo: pegar setor do localStorage (ajuste conforme seu fluxo de login)
window.addEventListener('DOMContentLoaded', () => {
  const setor = localStorage.getItem('setor'); // Salve o setor no login!
  inicializarMenuCoordenador(setor);
});

// Funções para carregar conteúdo dinâmico
async function carregarArquivos() {
  const container = document.getElementById('content');
  container.innerHTML = ""; // Limpa o conteúdo anterior
  container.innerHTML = "<h2 class='text-xl font-bold mb-4'>Arquivos enviados pelo presidente</h2>";

  try {
    const res = await fetch('http://localhost:3000/api/arquivos');
    const arquivos = await res.json();

    if (arquivos.length === 0) {
      container.innerHTML += "<p>Nenhum arquivo disponível.</p>";
      return;
    }

    const lista = arquivos.map(arq => `
      <div class="bg-white shadow rounded-lg p-4 mb-4">
        <h3 class="font-semibold text-blue-800">${arq.nome_original}</h3>
        <p class="text-gray-600 text-sm">Data de upload: ${new Date(arq.data_upload).toLocaleString()}</p>
        <a href="http://localhost:3000/uploads/${arq.nome_armazenado}" class="text-blue-600 hover:underline" download>Baixar</a>
      </div>
    `).join('');

    container.innerHTML += lista;
  } catch (err) {
    container.innerHTML += "<p class='text-red-600'>Erro ao carregar arquivos.</p>";
  }
}

async function carregarTarefas() {
  const container = document.getElementById('content');
  container.innerHTML = ""; // Limpa o conteúdo anterior
  container.innerHTML = "<h2 class='text-xl font-bold mb-4'>Minhas Tarefas</h2>";

  const userId = localStorage.getItem('userId');
  if (!userId) {
    container.innerHTML += "<p class='text-red-600'>Usuário não identificado.</p>";
    return;
  }

  try {
    const res = await fetch('http://localhost:3000/api/tarefas');
    const tarefas = await res.json();

    const lista = tarefas.map(tarefa => `
      <div class="bg-white shadow rounded-lg p-4 mb-4">
        <h3 class="font-semibold text-blue-800">${tarefa.titulo}</h3>
        <p class="text-gray-600 text-sm">${tarefa.descricao}</p>
        <p class="text-gray-500 text-xs">Data limite: ${tarefa.data_limite}</p>
        <button class="concluir-tarefa bg-green-600 text-white px-4 py-2 rounded-lg mt-2" data-id="${tarefa.id}">Concluir</button>
      </div>
    `).join('');

    container.innerHTML += lista || "<p class='text-gray-500'>Nenhuma tarefa disponível.</p>";
  } catch (err) {
    container.innerHTML += "<p class='text-red-600'>Erro ao carregar tarefas.</p>";
  }
}

async function carregarComissoes() {
  const container = document.getElementById('content');
  container.innerHTML = ""; // Limpa o conteúdo anterior
  container.innerHTML = "<h2 class='text-xl font-bold mb-4'>Minhas Comissões</h2>";

  try {
    const res = await fetch('http://localhost:3000/api/comissoes');
    const comissoes = await res.json();

    const lista = comissoes.map(comissao => `
      <div class="bg-white shadow rounded-lg p-4 mb-4">
        <h3 class="font-semibold text-blue-800">${comissao.nome}</h3>
        <p class="text-gray-600 text-sm">${comissao.descricao}</p>
        <button class="lancar-tarefa bg-blue-600 text-white px-4 py-2 rounded-lg mt-2" data-id="${comissao.id}">Lançar Tarefa</button>
      </div>
    `).join('');

    container.innerHTML += lista || "<p class='text-gray-500'>Nenhuma comissão disponível.</p>";
  } catch (err) {
    container.innerHTML += "<p class='text-red-600'>Erro ao carregar comissões.</p>";
  }
}

async function carregarRelatorios() {
  const container = document.getElementById('content');
  container.innerHTML = ""; // Limpa o conteúdo anterior
  container.innerHTML = "<h2 class='text-xl font-bold mb-4'>Relatórios</h2>";

  try {
    const res = await fetch('http://localhost:3000/api/relatorios');
    const relatorios = await res.json();

    const lista = relatorios.map(relatorio => `
      <div class="bg-white shadow rounded-lg p-4 mb-4">
        <h3 class="font-semibold text-blue-800">${relatorio.tipo}</h3>
        <p class="text-gray-600 text-sm">${relatorio.projeto}</p>
        <p class="text-gray-500 text-xs">Status: ${relatorio.status}</p>
      </div>
    `).join('');

    container.innerHTML += lista || "<p class='text-gray-500'>Nenhum relatório disponível.</p>";
  } catch (err) {
    container.innerHTML += "<p class='text-red-600'>Erro ao carregar relatórios.</p>";
  }
}

// Adiciona eventos de clique para o menu
document.addEventListener('click', function (e) {
  const target = e.target.closest('a');
  if (!target) return;

  const href = target.getAttribute('href');
  if (href === '#arquivos') carregarArquivos();
  else if (href === '#tarefas') carregarTarefas();
  else if (href === '#comissoes') carregarComissoes();
  else if (href === '#relatorios') carregarRelatorios();
});