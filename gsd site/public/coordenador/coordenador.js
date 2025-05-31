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
      nome: "Relatórios Enviados",
      href: "#relatoriosEnviados",
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
        carregarTarefas(); // Atualiza a lista de tarefas
      } catch (err) {
        console.error('Erro ao concluir tarefa:', err);
        alert('Erro ao concluir tarefa.');
      }
    });
  });
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


//relatorios 
async function exibirFormularioRelatorio() {
  const container = document.getElementById('content');
  container.innerHTML = ""; // Limpa o conteúdo anterior
  container.innerHTML = `
    <h2 class='text-xl font-bold mb-4'>Enviar Relatório</h2>
    <form id="form-relatorio" class="space-y-4">
      <div>
        <label class="block mb-1 font-semibold text-gray-700">Tipo</label>
        <select name="tipo" class="border rounded-lg w-full p-2" required>
          <option value="">Selecione</option>
          <option value="Criação de Projeto">Criação de Projeto</option>
          <option value="Relatório de Andamento">Relatório de Andamento</option>
        </select>
      </div>
      <div>
        <label class="block mb-1 font-semibold text-gray-700">Projeto</label>
        <input type="text" name="projeto" class="border rounded-lg w-full p-2" required>
      </div>
      <div>
        <label class="block mb-1 font-semibold text-gray-700">Conteúdo</label>
        <textarea name="conteudo" class="border rounded-lg w-full p-2" required></textarea>
      </div>
      <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition">Enviar</button>
    </form>
  `;

  document.getElementById('form-relatorio').onsubmit = async function (e) {
    e.preventDefault();
    const form = e.target;
    const userEmail = localStorage.getItem('userEmail'); // Certifique-se de salvar o email do coordenador no localStorage durante o login

    try {
      await fetch('http://localhost:3000/api/relatorios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: form.tipo.value,
          projeto: form.projeto.value,
          coordenador: userEmail, // Email do coordenador
          conteudo: form.conteudo.value,
          observacao: "", // Inicialmente vazio
          usuario_email: userEmail
        })
      });
      alert('Relatório enviado com sucesso!');
      exibirFormularioRelatorio(); // Limpa o formulário após envio
    } catch (err) {
      console.error('Erro ao enviar relatório:', err);
      alert('Erro ao enviar relatório.');
    }
  };
}

async function carregarRelatoriosAtualizados() {
  const container = document.getElementById('content');
  container.innerHTML = ""; // Limpa o conteúdo anterior
  container.innerHTML = "<h2 class='text-xl font-bold mb-4'>Relatórios Enviados</h2>";

  try {
    const res = await fetch('http://localhost:3000/api/relatorios');
    const relatorios = await res.json();

    const userEmail = localStorage.getItem('userEmail'); // Email do coordenador logado

    // Filtra os relatórios que pertencem ao coordenador logado
    const relatoriosFiltrados = relatorios.filter(relatorio => relatorio.usuario_email === userEmail);

    const lista = relatoriosFiltrados.map(relatorio => `
      <div class="bg-white shadow rounded-lg p-4 mb-4">
        <h3 class="font-semibold text-blue-800">${relatorio.tipo}</h3>
        <p class="text-gray-600 text-sm">${relatorio.projeto}</p>
        <p class="text-gray-500 text-xs">Status: ${relatorio.status}</p>
        <p class="text-gray-500 text-xs">Observação: ${relatorio.observacao || 'Nenhuma'}</p>
      </div>
    `).join('');

    container.innerHTML += lista || "<p class='text-gray-500'>Nenhum relatório disponível.</p>";
  } catch (err) {
    container.innerHTML += "<p class='text-red-600'>Erro ao carregar relatórios.</p>";
  }
}

//ranking
async function carregarRanking() {
  document.getElementById('content').innerHTML = `
    <div class="max-w-3xl mx-auto bg-white rounded-xl shadow p-8">
      <h2 class="text-2xl font-bold mb-6 text-blue-800 flex items-center gap-2">
        <svg class="w-7 h-7 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-width="1.5" d="M12 17.5l-5.09 2.68 1-5.82-4.22-4.11 5.84-.85L12 4.5l2.47 5.01 5.84.85-4.22 4.11 1 5.82z"></path>
        </svg>
        Ranking de Engajamento
      </h2>
      <div id="lista-ranking"></div>
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
    <div class="overflow-x-auto">
      <table class="min-w-full text-sm bg-white rounded-xl overflow-hidden shadow">
        <thead>
          <tr class="bg-blue-50">
            <th class="px-4 py-2 text-left">Posição</th>
            <th class="px-4 py-2 text-left">Nome</th>
            <th class="px-4 py-2 text-left">Presenças</th>
            <th class="px-4 py-2 text-left">Tarefas Concluídas</th>
            <th class="px-4 py-2 text-left">Pontos</th>
          </tr>
        </thead>
        <tbody>
          ${ranking.map((u, i) => `
            <tr class="${i === 0 ? 'bg-yellow-50 font-bold' : ''}">
              <td class="border-t px-4 py-2">${i + 1} ${i === 0 ? '🏆' : i === 1 ? '🥈' : i === 2 ? '🥉' : ''}</td>
              <td class="border-t px-4 py-2">${u.name}</td>
              <td class="border-t px-4 py-2">${u.presencas}</td>
              <td class="border-t px-4 py-2">${u.tarefas_concluidas}</td>
              <td class="border-t px-4 py-2 text-blue-800">${u.pontos}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

//cantina

async function carregarCantina() {
  const container = document.getElementById('content');
  container.innerHTML = ""; // Limpa o conteúdo anterior

  container.innerHTML = `
    <h2 class='text-xl font-bold mb-4'>PDV - Cantina</h2>
    <div class="space-y-6">
      <!-- Cadastro de Produtos -->
      <div>
        <h3 class="text-lg font-semibold mb-2">Cadastrar Produto</h3>
        <form id="form-produto" class="space-y-4">
          <div>
            <label class="block mb-1 font-semibold text-gray-700">Nome do Produto</label>
            <input type="text" name="nome" class="border rounded-lg w-full p-2" required>
          </div>
          <div>
            <label class="block mb-1 font-semibold text-gray-700">Preço</label>
            <input type="number" name="preco" class="border rounded-lg w-full p-2" required>
          </div>
          <div>
            <label class="block mb-1 font-semibold text-gray-700">Quantidade</label>
            <input type="number" name="quantidade" class="border rounded-lg w-full p-2" required>
          </div>
          <button type="submit" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition">Cadastrar</button>
        </form>
      </div>

      <!-- Estoque -->
      <div>
        <h3 class="text-lg font-semibold mb-2">Estoque</h3>
        <div id="estoque"></div>
      </div>

      <!-- Painel de Venda -->
      <div>
        <h3 class="text-lg font-semibold mb-2">Painel de Venda</h3>
        <div id="painel-venda"></div>
        <div class="mt-4">
          <label class="block mb-1 font-semibold text-gray-700">Valor Recebido</label>
          <input type="number" id="valor-recebido" class="border rounded-lg w-full p-2">
          <button id="finalizar-venda" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition mt-2">Finalizar Venda</button>
        </div>
        <p id="troco" class="text-lg font-bold mt-4"></p>
      </div>
    </div>
  `;

  // Configura o formulário de cadastro de produtos
  document.getElementById('form-produto').addEventListener('submit', async function (e) {
    e.preventDefault();
    const form = e.target;

    try {
      await fetch('http://localhost:3000/api/produtos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: form.nome.value,
          preco: parseFloat(form.preco.value),
          quantidade: parseInt(form.quantidade.value)
        })
      });
      alert('Produto cadastrado com sucesso!');
      carregarCantina(); // Atualiza a tela
    } catch (err) {
      console.error('Erro ao cadastrar produto:', err);
      alert('Erro ao cadastrar produto.');
    }
  });

  // Carrega o estoque
  try {
    const res = await fetch('http://localhost:3000/api/produtos');
    const produtos = await res.json();

    const estoque = produtos.map(produto => `
      <div class="bg-white shadow rounded-lg p-4 mb-4">
        <h3 class="font-semibold text-blue-800">${produto.nome}</h3>
        <p class="text-gray-600 text-sm">Preço: R$ ${produto.preco.toFixed(2)}</p>
        <p class="text-gray-500 text-xs">Quantidade: ${produto.quantidade}</p>
      </div>
    `).join('');

    document.getElementById('estoque').innerHTML = estoque || "<p class='text-gray-500'>Nenhum produto disponível.</p>";
  } catch (err) {
    document.getElementById('estoque').innerHTML = "<p class='text-red-600'>Erro ao carregar estoque.</p>";
  }

  // Configura o painel de venda
  try {
    const res = await fetch('http://localhost:3000/api/produtos');
    const produtos = await res.json();

    const painelVenda = produtos.map(produto => `
      <button class="produto-venda bg-gray-200 hover:bg-gray-300 text-black px-4 py-2 rounded-lg font-semibold transition" data-id="${produto.id}" data-preco="${produto.preco}">
        ${produto.nome} - R$ ${produto.preco.toFixed(2)}
      </button>
    `).join('');

    document.getElementById('painel-venda').innerHTML = painelVenda || "<p class='text-gray-500'>Nenhum produto disponível.</p>";

    let total = 0;
    document.querySelectorAll('.produto-venda').forEach(button => {
      button.addEventListener('click', function () {
        const preco = parseFloat(this.getAttribute('data-preco'));
        total += preco;
        document.getElementById('troco').textContent = `Total: R$ ${total.toFixed(2)}`;
      });
    });

    document.getElementById('finalizar-venda').addEventListener('click', async function () {
      const valorRecebido = parseFloat(document.getElementById('valor-recebido').value);
      const troco = valorRecebido - total;

      if (troco < 0) {
        alert('Valor recebido insuficiente!');
        return;
      }

      alert(`Venda finalizada! Troco: R$ ${troco.toFixed(2)}`);
      total = 0; // Reseta o total
      document.getElementById('troco').textContent = "";
      document.getElementById('valor-recebido').value = "";
      carregarCantina(); // Atualiza a tela
    });
  } catch (err) {
    document.getElementById('painel-venda').innerHTML = "<p class='text-red-600'>Erro ao carregar painel de venda.</p>";
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
  else if (href === '#relatorios') exibirFormularioRelatorio(); // Chama o formulário de envio
  else if (href === '#relatoriosEnviados') carregarRelatoriosAtualizados(); // Carrega relatórios enviados
  else if (href === '#ranking')  carregarRanking(); // Carrega ranking
  else if (href === '#cantina') carregarCantina(); // Carrega a aba Cantina
});