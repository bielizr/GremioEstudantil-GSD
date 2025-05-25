// Recebe o setor dinamicamente, por exemplo, via localStorage ou query string
function inicializarMenuCoordenador(setor) {
  if (!setor) setor = "Outro"; // Valor padrão para evitar erro

  document.getElementById('coordenador-setor').textContent = `Coordenador - ${setor}`;
  document.getElementById('coordenador-avatar').textContent = setor.substring(0, 2).toUpperCase();

  const menu = [
    { nome: "Início", href: "#inicio", icone: "🏠" },
    { nome: "Arquivos", href: "#arquivos", icone: "📁" },
    { nome: "Tarefas", href: "#tarefas", icone: "✅" },
    { nome: "Comissões", href: "#comissoes", icone: "👥" },
    { nome: "Relatórios", href: "#relatorios", icone: "📝" },
    { nome: "Ranking", href: "#ranking", icone: "🏆" }
  ];

  // Só mostra "Cantina" se o setor for Finanças
  if (
    setor &&
    setor.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase() === "financas"
  ) {
    menu.push({ nome: "Cantina", href: "#cantina", icone: "🍔" });
  }
  const ul = document.getElementById('menu-coordenador');
  ul.innerHTML = "";
  menu.forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = `
      <a href="${item.href}" class="flex items-center gap-3 px-4 py-2 rounded hover:bg-blue-700 transition">
        <span>${item.icone}</span>
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

//arquivos
async function carregarArquivos() {
  const container = document.getElementById('arquivos-container');
  container.innerHTML = "<h2 class='text-xl font-bold mb-4'>Arquivos enviados pelo presidente</h2>";

  try {
    const res = await fetch('http://localhost:3000/api/arquivos');
    const arquivos = await res.json();

    if (arquivos.length === 0) {
      container.innerHTML += "<p>Nenhum arquivo disponível.</p>";
      return;
    }

    const lista = document.createElement('ul');
    lista.className = "space-y-2";
    arquivos.forEach(arq => {
      const li = document.createElement('li');
      li.innerHTML = `
        <a href="http://localhost:3000/uploads/${arq.nome_armazenado}" target="_blank" class="text-blue-700 underline">
          ${arq.nome_original}
        </a>
        <span class="text-xs text-gray-500 ml-2">${new Date(arq.data_upload).toLocaleString()}</span>
      `;
      lista.appendChild(li);
    });
    container.appendChild(lista);
  } catch (err) {
    container.innerHTML += "<p class='text-red-600'>Erro ao carregar arquivos.</p>";
  }
}
document.addEventListener('click', function (e) {
  if (e.target.closest('a') && e.target.closest('a').getAttribute('href') === '#arquivos') {
    e.preventDefault();
    document.getElementById('arquivos-container').style.display = 'block';
    // Esconda outros containers se tiver
    carregarArquivos();
  }
});

//tarefas

async function carregarTarefas() {
  const container = document.getElementById('tarefas-container');
  container.style.display = 'block';
  container.innerHTML = "<h2 class='text-xl font-bold mb-4'>Minhas Tarefas</h2>";

  const userId = localStorage.getItem('userId');
  if (!userId) {
    container.innerHTML += "<p class='text-red-600'>Usuário não identificado.</p>";
    return;
  }

  try {
    // Busca tarefas e comissões
    const [resTarefas, resComissoes] = await Promise.all([
      fetch('http://localhost:3000/api/tarefas'),
      fetch('http://localhost:3000/api/comissoes')
    ]);
    const tarefas = await resTarefas.json();
    const comissoes = await resComissoes.json();

    // Para cada comissão, busca os membros
    const comissoesComMembros = await Promise.all(comissoes.map(async c => {
      const resMembros = await fetch(`http://localhost:3000/api/comissoes/${c.id}/membros`);
      const membros = await resMembros.json();
      return { ...c, membros };
    }));

    // Descobre as comissões que o usuário participa OU é responsável
    const minhasComissoes = comissoesComMembros
      .filter(c =>
        c.membros.some(m => m.usuario_id == userId) ||
        c.responsavel_id == userId
      )
      .map(c => c.id);

    // Filtra tarefas destinadas ao usuário OU às comissões que ele participa
    const minhasTarefas = tarefas.filter(t =>
      (t.tipo_destinatario === 'usuario' && t.destinatario_id == userId) ||
      (t.tipo_destinatario === 'comissao' && minhasComissoes.includes(Number(t.destinatario_id)))
    );

    if (minhasTarefas.length === 0) {
      container.innerHTML += "<p>Nenhuma tarefa atribuída a você ou às suas comissões.</p>";
      return;
    }

    const lista = document.createElement('ul');
    lista.className = "space-y-2";
    minhasTarefas.forEach(tarefa => {
      const li = document.createElement('li');
      li.className = "p-3 bg-white rounded shadow flex items-center justify-between";
      li.innerHTML = `
        <div>
          <span class="font-semibold">${tarefa.titulo}</span>
          <span class="text-xs text-gray-500 ml-2">${tarefa.data_limite ? 'Até: ' + tarefa.data_limite : ''}</span>
          <div class="text-sm text-gray-600">${tarefa.descricao || ''}</div>
          ${tarefa.tipo_destinatario === 'comissao' ? `<div class="text-xs text-blue-600 mt-1">[Tarefa da Comissão]</div>` : ''}
        </div>
        <div>
          <span class="mr-2 ${tarefa.status === 'Concluída' ? 'text-green-600' : 'text-yellow-600'}">${tarefa.status}</span>
          ${tarefa.status !== 'Concluída' ? `<button class="concluir-tarefa px-2 py-1 bg-blue-600 text-white rounded" data-id="${tarefa.id}">Concluir</button>` : ''}
        </div>
      `;
      lista.appendChild(li);
    });
    container.appendChild(lista);
  } catch (err) {
    container.innerHTML += "<p class='text-red-600'>Erro ao carregar tarefas.</p>";
  }
}

document.addEventListener('click', async function (e) {
  if (e.target.closest('a') && e.target.closest('a').getAttribute('href') === '#tarefas') {
    e.preventDefault();
    document.getElementById('tarefas-container').style.display = 'block';
    carregarTarefas();
  }

  // Botão de concluir tarefa
  if (e.target.classList.contains('concluir-tarefa')) {
    const tarefaId = e.target.getAttribute('data-id');

    // Buscar a tarefa completa antes de atualizar
    const res = await fetch('http://localhost:3000/api/tarefas');
    const tarefas = await res.json();
    const tarefa = tarefas.find(t => t.id == tarefaId);

    if (!tarefa) return alert('Tarefa não encontrada!');

    // Atualizar status para "Concluída"
    await fetch(`http://localhost:3000/api/tarefas/${tarefaId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        titulo: tarefa.titulo,
        descricao: tarefa.descricao,
        data_limite: tarefa.data_limite,
        tipo_destinatario: tarefa.tipo_destinatario,
        destinatario_id: tarefa.destinatario_id,
        status: 'Concluída'
      })
    });

    carregarTarefas();
  }
});

//comissoes

async function carregarComissoes() {
  const container = document.getElementById('comissoes-container');
  container.style.display = 'block';
  container.innerHTML = "<h2 class='text-xl font-bold mb-4'>Minhas Comissões</h2>";

  const userId = localStorage.getItem('userId');
  if (!userId) {
    container.innerHTML += "<p class='text-red-600'>Usuário não identificado.</p>";
    return;
  }

  try {
    const res = await fetch('http://localhost:3000/api/comissoes');
    const comissoes = await res.json();

    // Para cada comissão, busca os membros
    const comissoesComMembros = await Promise.all(comissoes.map(async c => {
      const resMembros = await fetch(`http://localhost:3000/api/comissoes/${c.id}/membros`);
      const membros = await resMembros.json();
      return { ...c, membros };
    }));

    // Filtra comissões onde o usuário participa OU é responsável
    const minhasComissoes = comissoesComMembros.filter(c =>
      c.membros.some(m => m.usuario_id == userId) ||
      c.responsavel_id == userId // ou c.coordenador_id == userId, dependendo do campo usado
    );

    if (minhasComissoes.length === 0) {
      container.innerHTML += "<p>Você não participa de nenhuma comissão.</p>";
      return;
    }

    const lista = document.createElement('ul');
    lista.className = "space-y-2";
    minhasComissoes.forEach(comissao => {
      const isResponsavel = comissao.responsavel_id == userId || comissao.coordenador_id == userId;
      const li = document.createElement('li');
      li.className = "p-3 bg-white rounded shadow";
      li.innerHTML = `
        <div class="flex items-center justify-between">
          <div>
            <span class="font-semibold">${comissao.nome}</span>
            <span class="text-xs text-gray-500 ml-2">${comissao.descricao || ''}</span>
          </div>
          ${isResponsavel ? `<button class="lancar-tarefa-comissao px-2 py-1 bg-blue-600 text-white rounded" data-id="${comissao.id}">Lançar Tarefa</button>` : ''}
        </div>
      `;
      lista.appendChild(li);
    });
    container.appendChild(lista);
  } catch (err) {
    container.innerHTML += "<p class='text-red-600'>Erro ao carregar comissões.</p>";
  }
}

document.addEventListener('click', function (e) {
  if (e.target.closest('a') && e.target.closest('a').getAttribute('href') === '#comissoes') {
    e.preventDefault();
    document.getElementById('comissoes-container').style.display = 'block';
    carregarComissoes();
  }
});

document.addEventListener('click', function (e) {
  // Abrir formulário ao clicar em "Lançar Tarefa"
  if (e.target.classList.contains('lancar-tarefa-comissao')) {
    const comissaoId = e.target.getAttribute('data-id');
    mostrarFormularioTarefaComissao(comissaoId);
  }
});

function mostrarFormularioTarefaComissao(comissaoId) {
  // Cria um modal simples
  let modal = document.createElement('div');
  modal.id = 'modal-tarefa-comissao';
  modal.className = 'fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50';
  modal.innerHTML = `
    <div class="bg-white p-6 rounded shadow-lg w-full max-w-md">
      <h2 class="text-xl font-bold mb-4">Lançar Tarefa para Comissão</h2>
      <form id="form-tarefa-comissao">
        <input type="hidden" name="comissaoId" value="${comissaoId}">
        <div class="mb-2">
          <label class="block text-sm font-medium">Título</label>
          <input type="text" name="titulo" required class="w-full border rounded px-2 py-1">
        </div>
        <div class="mb-2">
          <label class="block text-sm font-medium">Descrição</label>
          <textarea name="descricao" class="w-full border rounded px-2 py-1"></textarea>
        </div>
        <div class="mb-2">
          <label class="block text-sm font-medium">Data Limite</label>
          <input type="date" name="data_limite" class="w-full border rounded px-2 py-1">
        </div>
        <div class="flex justify-end gap-2 mt-4">
          <button type="button" id="cancelar-tarefa-comissao" class="px-3 py-1 bg-gray-300 rounded">Cancelar</button>
          <button type="submit" class="px-3 py-1 bg-blue-600 text-white rounded">Lançar</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(modal);

  // Fechar modal
  document.getElementById('cancelar-tarefa-comissao').onclick = () => modal.remove();

  // Submeter tarefa
  document.getElementById('form-tarefa-comissao').onsubmit = async function (ev) {
    ev.preventDefault();
    const form = ev.target;
    const titulo = form.titulo.value.trim();
    const descricao = form.descricao.value.trim();
    const data_limite = form.data_limite.value;
    const comissaoId = form.comissaoId.value;

    // Envia para o backend
    await fetch('http://localhost:3000/api/tarefas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        titulo,
        descricao,
        data_limite,
        tipo_destinatario: 'comissao',
        destinatario_id: comissaoId,
        status: 'Pendente'
      })
    });

    modal.remove();
    alert('Tarefa lançada para a comissão!');
  };
}

//relatorios

async function carregarRelatorios() {
  const container = document.getElementById('relatorios-container');
  container.style.display = 'block';
  container.innerHTML = `
    <h2 class="text-xl font-bold mb-4">Enviar Relatório ao Presidente</h2>
    <form id="form-relatorio" class="space-y-4 bg-white p-4 rounded shadow max-w-lg">
      <div>
        <label class="block text-sm font-medium">Tipo</label>
        <input type="text" name="tipo" required class="w-full border rounded px-2 py-1" placeholder="Ex: Relatório de Andamento">
      </div>
      <div>
        <label class="block text-sm font-medium">Projeto</label>
        <input type="text" name="projeto" required class="w-full border rounded px-2 py-1">
      </div>
      <div>
        <label class="block text-sm font-medium">Coordenador</label>
        <input type="text" name="coordenador" required class="w-full border rounded px-2 py-1" value="${localStorage.getItem('setor') || ''}">
      </div>
      <div>
        <label class="block text-sm font-medium">Conteúdo</label>
        <textarea name="conteudo" required class="w-full border rounded px-2 py-1"></textarea>
      </div>
      <div>
        <label class="block text-sm font-medium">Observação</label>
        <textarea name="observacao" class="w-full border rounded px-2 py-1"></textarea>
      </div>
      <div>
        <label class="block text-sm font-medium">Seu e-mail</label>
        <input type="email" name="usuario_email" required class="w-full border rounded px-2 py-1" value="">
      </div>
      <div class="flex justify-end">
        <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded">Enviar</button>
      </div>
    </form>
    <div id="relatorio-msg" class="mt-4"></div>
  `;

  document.getElementById('form-relatorio').onsubmit = async function (ev) {
    ev.preventDefault();
    const form = ev.target;
    const dados = {
      tipo: form.tipo.value.trim(),
      projeto: form.projeto.value.trim(),
      coordenador: form.coordenador.value.trim(),
      conteudo: form.conteudo.value.trim(),
      observacao: form.observacao.value.trim(),
      usuario_email: form.usuario_email.value.trim()
    };

    const res = await fetch('http://localhost:3000/api/relatorios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    });

    if (res.ok) {
      document.getElementById('relatorio-msg').innerHTML = '<span class="text-green-600">Relatório enviado com sucesso!</span>';
      form.reset();
      await listarRelatoriosEnviados(); // Atualiza a lista após envio
    } else {
      document.getElementById('relatorio-msg').innerHTML = '<span class="text-red-600">Erro ao enviar relatório.</span>';
    }
  };
  await listarRelatoriosEnviados(); // <-- Adicione esta linha aqui!
}

document.addEventListener('click', function (e) {
  if (e.target.closest('a') && e.target.closest('a').getAttribute('href') === '#relatorios') {
    e.preventDefault();
    document.getElementById('relatorios-container').style.display = 'block';
    carregarRelatorios();
  }
});


async function listarRelatoriosEnviados() {
  const container = document.getElementById('relatorios-container');
  const userEmail = localStorage.getItem('userEmail'); // Salve o e-mail do usuário no login.js!
  if (!userEmail) return;

  // Busca todos os relatórios enviados por este coordenador
  const res = await fetch('http://localhost:3000/api/relatorios');
  const relatorios = await res.json();

  // Filtra só os do usuário logado
  const meusRelatorios = relatorios.filter(r => r.usuario_email === userEmail);

  let html = `<h3 class="text-lg font-bold mt-8 mb-2">Meus Relatórios Enviados</h3>`;
  if (meusRelatorios.length === 0) {
    html += `<p>Nenhum relatório enviado ainda.</p>`;
  } else {
    html += `<ul class="space-y-2">`;
    meusRelatorios.forEach(r => {
      html += `
        <li class="bg-white rounded shadow p-3">
          <div class="flex justify-between items-center">
            <div>
              <span class="font-semibold">${r.tipo || '(Sem título)'}</span>
              <span class="text-xs text-gray-500 ml-2">${r.projeto || ''}</span>
              <div class="text-sm text-gray-600">${r.conteudo || ''}</div>
            </div>
            <span class="px-2 py-1 rounded text-xs font-bold
              ${r.status === 'Aprovado' ? 'bg-green-100 text-green-700' :
          r.status === 'Recusado' ? 'bg-red-100 text-red-700' :
            r.status === 'Ajustes' ? 'bg-yellow-100 text-yellow-700' :
              'bg-gray-100 text-gray-700'}">
              ${r.status}
            </span>
          </div>
          ${r.observacao ? `<div class="text-xs text-blue-700 mt-1">Obs: ${r.observacao}</div>` : ''}
        </li>
      `;
    });
    html += `</ul>`;
  }

  // Adiciona a lista ao container (sem apagar o formulário)
  const formHtml = container.innerHTML.split('<h3')[0];
  container.innerHTML = formHtml + html;
}

