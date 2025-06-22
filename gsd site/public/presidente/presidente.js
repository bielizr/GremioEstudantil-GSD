// Função para carregar a interface de Registro de Reuniões
function carregarRegistroReunioes() {
  document.getElementById('content').innerHTML = `
    <div class="max-w-2xl mx-auto bg-white rounded-xl shadow p-8">
      <h2 class="text-2xl font-bold mb-6 text-blue-800 flex items-center gap-2">
        <svg class="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-width="1.5"></circle><path stroke-width="1.5" d="M12 6v6l4 2"></path></svg>
        Registro de Reuniões
      </h2>
      <form id="form-reuniao" class="space-y-6">
        <div>
          <label for="nome-reuniao" class="block text-sm font-semibold text-gray-700 mb-1">Nome da Reunião</label>
          <input type="text" id="nome-reuniao" name="nome-reuniao" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none" placeholder="Digite o nome da reunião" required>
        </div>
        <div>
          <label for="descricao-reuniao" class="block text-sm font-semibold text-gray-700 mb-1">Descrição</label>
          <textarea id="descricao-reuniao" name="descricao-reuniao" rows="3" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none" placeholder="Digite uma breve descrição" required></textarea>
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">Lista de Chamada</label>
          <div id="lista-chamada" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <!-- Usuários serão inseridos aqui -->
          </div>
        </div>
        <button type="submit" class="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 rounded-lg transition">Salvar Reunião</button>
      </form>
    </div>
  `;
  carregarListaChamada();
}

// Função para carregar a lista de chamada (dados do backend)
async function carregarListaChamada() {
  try {
    const response = await fetch('/api/usuarios');
    if (!response.ok) {
      throw new Error('Erro ao buscar usuários.');
    }

    const usuarios = await response.json();
    const listaChamada = document.getElementById('lista-chamada');
    listaChamada.innerHTML = usuarios.map(usuario => `
  <label class="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 shadow-sm hover:bg-blue-50 transition">
    <input type="checkbox" id="usuario-${usuario.id}" name="presenca" value="${usuario.id}" class="accent-blue-600 w-5 h-5 rounded">
    <span class="text-gray-800 font-medium">${usuario.name}</span>
  </label>
`).join('');
  } catch (error) {
    console.error('Erro ao carregar lista de chamada:', error);
    alert('Erro ao carregar lista de chamada.');
  }
}

// Interceptar o envio do formulário de reunião
document.addEventListener('submit', async function (event) {
  if (event.target.id === 'form-reuniao') {
    event.preventDefault(); // Impede o comportamento padrão de recarregar a página

    const nome = document.getElementById('nome-reuniao').value;
    const descricao = document.getElementById('descricao-reuniao').value;

    // Obter as presenças marcadas
    const presencas = Array.from(document.querySelectorAll('#lista-chamada input')).map(input => ({
      id: input.value,
      status: input.checked ? 'presente' : 'ausente',
    }));

    try {
      // Enviar os dados para o backend
      const response = await fetch('/api/reunioes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, descricao, presencas }),
      });

      if (!response.ok) {
        throw new Error('Erro ao salvar a reunião.');
      }

      const data = await response.json();
      alert(data.message || 'Reunião salva com sucesso!');
      carregarRegistroReunioes(); // Recarregar a interface de reuniões
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao salvar a reunião.');
    }
  }
});

// Função para carregar a interface de exibição de reuniões
async function carregarReunioesSalvas() {
  try {
    const response = await fetch('/api/reunioes');
    if (!response.ok) {
      throw new Error('Erro ao buscar reuniões.');
    }

    const reunioes = await response.json();

    // Atualizar o conteúdo da página
    const content = document.getElementById('content');
    content.innerHTML = `
          <h2 class="text-xl font-bold mb-4">Reuniões Salvas</h2>
          <div id="lista-reunioes" class="space-y-4">
              ${reunioes.map(reuniao => `
                  <div class="p-4 border border-gray-300 rounded-md">
                      <h3 class="text-lg font-bold">${reuniao.nome}</h3>
                      <p class="text-sm text-gray-600">${reuniao.descricao}</p>
                      <p class="text-sm text-gray-500">Data: ${new Date(reuniao.data_criacao).toLocaleString()}</p>
                      <h4 class="text-sm font-bold mt-2">Presenças:</h4>
                      <ul class="list-disc pl-5">
                          ${reuniao.presencas.map(presenca => `
                              <li>${presenca.usuario_nome} - ${presenca.status}</li>
                          `).join('')}
                      </ul>
                  </div>
              `).join('')}
          </div>
      `;
  } catch (error) {
    console.error('Erro ao carregar reuniões:', error);
    alert('Erro ao carregar reuniões.');
  }
}

// Função para carregar a interface de exibição de reuniões
async function carregarReunioesSalvas() {
  try {
    const response = await fetch('/api/reunioes');
    if (!response.ok) {
      throw new Error('Erro ao buscar reuniões.');
    }

    const reunioes = await response.json();

    // Atualizar o conteúdo da página
    const content = document.getElementById('content');
content.innerHTML = `
  <div class="max-w-4xl mx-auto">
    <h2 class="text-2xl font-bold mb-6 text-blue-800 flex items-center gap-2">
      <svg class="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-width="1.5"></circle><path stroke-width="1.5" d="M12 6v6l4 2"></path></svg>
      Reuniões Salvas
    </h2>
    <div class="grid gap-6">
      ${reunioes.length === 0 ? `
        <div class="text-gray-500 text-center">Nenhuma reunião salva.</div>
      ` : reunioes.map(r => `
        <div class="bg-white rounded-xl shadow p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div class="text-lg font-semibold text-blue-900">${r.nome}</div>
            <div class="text-gray-600 text-sm mb-2">${r.descricao}</div>
            <div class="text-xs text-gray-400">Data: ${new Date(r.data_criacao).toLocaleString()}</div>
            <div class="mt-2">
              <span class="font-bold text-sm text-gray-700">Presenças:</span>
              <ul class="list-disc pl-5">
                ${r.presencas.map(p => `
                  <li>${p.usuario_nome} - <span class="${p.status === 'presente' ? 'text-green-600' : 'text-red-600'}">${p.status}</span></li>
                `).join('')}
              </ul>
            </div>
          </div>
          <div class="flex gap-2">
            <button onclick="editarReuniao(${r.id})" class="bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-2 rounded transition">Editar</button>
            <button onclick="excluirReuniao(${r.id})" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition">Excluir</button>
          </div>
        </div>
      `).join('')}
    </div>
  </div>
`;
  } catch (error) {
    console.error('Erro ao carregar reuniões:', error);
    alert('Erro ao carregar reuniões.');
  }
}

// Função para excluir uma reunião
async function excluirReuniao(id) {
  if (!confirm('Tem certeza que deseja excluir esta reunião?')) return;

  try {
    const response = await fetch(`/api/reunioes/${id}`, { method: 'DELETE' });
    if (!response.ok) {
      throw new Error('Erro ao excluir reunião.');
    }

    alert('Reunião excluída com sucesso!');
    carregarReunioesSalvas(); // Recarregar a lista de reuniões
  } catch (error) {
    console.error('Erro ao excluir reunião:', error);
    alert('Erro ao excluir reunião.');
  }
}

// Função para editar uma reunião
async function editarReuniao(id) {
  try {
    const response = await fetch(`/api/reunioes/${id}`);
    if (!response.ok) {
      throw new Error('Erro ao buscar dados da reunião.');
    }

    const reuniao = await response.json();

    // Carregar os dados no formulário
    document.getElementById('content').innerHTML = `
          <h2 class="text-xl font-bold mb-4">Editar Reunião</h2>
          <form id="form-editar-reuniao" class="space-y-4">
              <!-- Nome da Reunião -->
              <div>
                  <label for="nome-reuniao" class="block text-sm font-medium text-gray-700">Nome da Reunião</label>
                  <input type="text" id="nome-reuniao" name="nome-reuniao" class="mt-1 block w-full p-2 border border-gray-300 rounded-md" value="${reuniao.nome}" required>
              </div>

              <!-- Descrição -->
              <div>
                  <label for="descricao-reuniao" class="block text-sm font-medium text-gray-700">Descrição</label>
                  <textarea id="descricao-reuniao" name="descricao-reuniao" class="mt-1 block w-full p-2 border border-gray-300 rounded-md" required>${reuniao.descricao}</textarea>
              </div>

              <!-- Lista de Chamada -->
              <div>
                  <label class="block text-sm font-medium text-gray-700">Lista de Chamada</label>
                  <div id="lista-chamada" class="space-y-2">
                      ${reuniao.presencas.map(presenca => `
                          <div class="flex items-center space-x-2">
                              <input type="checkbox" id="usuario-${presenca.usuario_id}" name="presenca" value="${presenca.usuario_id}" class="h-4 w-4" ${presenca.status === 'presente' ? 'checked' : ''}>
                              <label for="usuario-${presenca.usuario_id}" class="text-sm text-gray-700">${presenca.usuario_nome}</label>
                          </div>
                      `).join('')}
                  </div>
              </div>

              <!-- Botão Salvar -->
              <button type="submit" class="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">Salvar Alterações</button>
          </form>
      `;

    // Adicionar evento de envio do formulário
    document.getElementById('form-editar-reuniao').addEventListener('submit', async function (event) {
      event.preventDefault();

      const nome = document.getElementById('nome-reuniao').value;
      const descricao = document.getElementById('descricao-reuniao').value;

      const presencas = Array.from(document.querySelectorAll('#lista-chamada input')).map(input => ({
        id: input.value,
        status: input.checked ? 'presente' : 'ausente',
      }));

      try {
        const response = await fetch(`/api/reunioes/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nome, descricao, presencas }),
        });

        if (!response.ok) {
          throw new Error('Erro ao atualizar reunião.');
        }

        alert('Reunião atualizada com sucesso!');
        carregarReunioesSalvas(); // Voltar para a lista de reuniões
      } catch (error) {
        console.error('Erro ao atualizar reunião:', error);
        alert('Erro ao atualizar reunião.');
      }
    });
  } catch (error) {
    console.error('Erro ao carregar dados da reunião:', error);
    alert('Erro ao carregar dados da reunião.');
  }
}

//relatorios...

// ...existing code...
async function carregarRelatorios() {
  document.getElementById('content').innerHTML = `
    <div class="max-w-4xl mx-auto bg-white rounded-xl shadow p-8">
      <h2 class="text-2xl font-bold mb-6 text-blue-800 flex items-center gap-2">
        <svg class="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke-width="1.5"></circle>
          <path stroke-width="1.5" d="M12 6v6l4 2"></path>
        </svg>
        Relatórios Recebidos
      </h2>
      <p class="mb-6 text-gray-600">Aqui você poderá visualizar, aprovar, recusar ou solicitar ajustes nos relatórios enviados pelos coordenadores e membros.</p>
      <div id="lista-relatorios" class="bg-gray-50 rounded-xl shadow p-4">
        <p class="text-gray-500">Carregando relatórios...</p>
      </div>
    </div>
  `;

  try {
    const response = await fetch('/api/relatorios');
    if (!response.ok) throw new Error('Erro ao buscar relatórios.');

    const relatorios = await response.json();
    const lista = document.getElementById('lista-relatorios');

    if (relatorios.length === 0) {
      lista.innerHTML = `<p class="text-gray-500 text-center">Nenhum relatório recebido ainda.</p>`;
      return;
    }

    lista.innerHTML = `
      <div class="overflow-x-auto">
        <table class="min-w-full text-sm bg-white rounded-xl overflow-hidden shadow">
          <thead>
            <tr class="bg-blue-50">
              <th class="px-4 py-2 text-left">Projeto</th>
              <th class="px-4 py-2 text-left">Tipo</th>
              <th class="px-4 py-2 text-left">Coordenador</th>
              <th class="px-4 py-2 text-left">Status</th>
              <th class="px-4 py-2 text-left">Data</th>
              <th class="px-4 py-2 text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            ${relatorios.map(r => `
              <tr class="border-t">
                <td class="px-4 py-2">${r.projeto}</td>
                <td class="px-4 py-2">${r.tipo}</td>
                <td class="px-4 py-2">${r.coordenador}</td>
                <td class="px-4 py-2">
                  <span class="${r.status === 'Aprovado' ? 'text-green-600 font-semibold' : r.status === 'Recusado' ? 'text-red-600 font-semibold' : r.status === 'Ajustes Necessários' ? 'text-yellow-600 font-semibold' : 'text-gray-700'}">
                    ${r.status}
                  </span>
                </td>
                <td class="px-4 py-2">${new Date(r.data_envio).toLocaleDateString()}</td>
                <td class="px-4 py-2 text-center">
                  <button class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-xs font-semibold transition" onclick="visualizarRelatorio(${r.id})">Ver</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  } catch (error) {
    document.getElementById('lista-relatorios').innerHTML = `<p class="text-red-500">Erro ao carregar relatórios.</p>`;
    console.error(error);
  }
}

// função para visualizar aprovar recursar ou solicitar ajustes nos relatorios
// ...existing code...
async function visualizarRelatorio(id) {
  // Busca detalhes do relatório
  const resp = await fetch(`/api/relatorios`);
  const relatorios = await resp.json();
  const relatorio = relatorios.find(r => r.id === id);

  if (!relatorio) {
    document.getElementById('content').innerHTML = '<p class="text-red-500">Relatório não encontrado.</p>';
    return;
  }

  document.getElementById('content').innerHTML = `
    <div class="max-w-2xl mx-auto bg-white rounded-xl shadow p-8">
      <h2 class="text-2xl font-bold mb-6 text-blue-800 flex items-center gap-2">
        <svg class="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke-width="1.5"></circle>
          <path stroke-width="1.5" d="M12 6v6l4 2"></path>
        </svg>
        Detalhes do Relatório
      </h2>
      <div class="bg-gray-50 rounded-xl shadow p-6 mb-6">
        <div class="mb-2 flex gap-2 items-center">
          <span class="font-semibold text-blue-900 text-lg">${relatorio.projeto}</span>
          <span class="px-2 py-1 rounded text-xs font-semibold ${relatorio.status === 'Aprovado' ? 'bg-green-100 text-green-700' : relatorio.status === 'Recusado' ? 'bg-red-100 text-red-700' : relatorio.status === 'Ajustes Necessários' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-200 text-gray-700'}">
            ${relatorio.status}
          </span>
        </div>
        <div class="mb-2 text-gray-700"><strong>Tipo:</strong> ${relatorio.tipo}</div>
        <div class="mb-2 text-gray-700"><strong>Coordenador:</strong> ${relatorio.coordenador}</div>
        <div class="mb-2 text-gray-700"><strong>Data de envio:</strong> ${relatorio.data_envio ? new Date(relatorio.data_envio).toLocaleString() : '-'}</div>
        <div class="mb-4 text-gray-700"><strong>Conteúdo:</strong><br>
          <span class="whitespace-pre-line">${relatorio.conteudo}</span>
        </div>
        <div class="mb-2 text-gray-700"><strong>Observação:</strong> ${relatorio.observacao || '-'}</div>
      </div>
      <div class="flex flex-wrap gap-2 mb-2">
        <button onclick="atualizarStatusRelatorio(${id}, 'Aprovado')" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition">Aprovar</button>
        <button onclick="atualizarStatusRelatorio(${id}, 'Recusado')" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition">Recusar</button>
        <button onclick="mostrarCampoObservacao(${id})" class="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded transition">Solicitar Ajustes</button>
        <button onclick="carregarRelatorios()" class="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded transition">Voltar</button>
      </div>
      <div id="campo-observacao"></div>
    </div>
  `;
}
// ...existing code...

function mostrarCampoObservacao(id) {
  document.getElementById('campo-observacao').innerHTML = `
    <textarea id="observacao" class="w-full border rounded p-2 mt-2" placeholder="Descreva as alterações necessárias"></textarea>
    <button onclick="atualizarStatusRelatorio(${id}, 'Ajustes Necessários')" class="bg-yellow-600 text-white px-4 py-2 rounded mt-2">Enviar para Ajustes</button>
  `;
}

async function atualizarStatusRelatorio(id, status) {
  let observacao = '';
  if (status === 'Ajustes Necessários') {
    observacao = document.getElementById('observacao').value;
    if (!observacao) {
      alert('Por favor, escreva a observação para ajustes.');
      return;
    }
  }
  await fetch(`/api/relatorios/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, observacao })
  });
  alert('Status atualizado!');
  carregarRelatorios();
}

// função comissões

async function carregarComissoes() {
  document.getElementById('content').innerHTML = `
    <div class="max-w-4xl mx-auto bg-white rounded-xl shadow p-8">
      <h2 class="text-2xl font-bold mb-6 text-blue-800 flex items-center gap-2">
        <svg class="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="1.5" d="M12 6v6l4 2"></path><circle cx="12" cy="12" r="10" stroke-width="1.5"></circle></svg>
        Comissões
      </h2>
      <button onclick="mostrarFormularioComissao()" class="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-4 py-2 rounded-lg mb-6 transition">Nova Comissão</button>
      <div id="lista-comissoes"></div>
      <div id="formulario-comissao"></div>
    </div>
  `;

  // Listar comissões já cadastradas
  try {
    const response = await fetch('/api/comissoes');
    const comissoes = await response.json();
    const lista = document.getElementById('lista-comissoes');
    if (comissoes.length === 0) {
      lista.innerHTML = `<div class="text-gray-500 text-center">Nenhuma comissão cadastrada ainda.</div>`;
      return;
    }
    lista.innerHTML = `
      <div class="grid gap-6">
        ${comissoes.map(c => `
          <div class="bg-gray-50 rounded-xl shadow p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div class="text-lg font-semibold text-blue-900">${c.nome}</div>
              <div class="text-gray-600 text-sm mb-1">Tipo: ${c.tipo}</div>
              <div class="text-gray-600 text-sm mb-1">Coordenador: ${c.coordenador_nome || '-'}</div>
              <div class="text-xs text-gray-400">Data: ${new Date(c.data_criacao).toLocaleDateString()}</div>
            </div>
            <div class="flex gap-2">
              <button class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition" onclick="gerenciarMembrosComissao(${c.id}, '${c.nome}')">Ver/Editar Membros</button>
              <button class="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded transition" onclick="mostrarEditarComissao(${c.id})">Editar</button>
              <button class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition" onclick="removerComissao(${c.id})">Excluir</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  } catch (error) {
    document.getElementById('lista-comissoes').innerHTML = `<div class="text-red-500">Erro ao carregar comissões.</div>`;
  }
}


async function mostrarFormularioComissao() {
  // Busca usuários fixos
  const resp = await fetch('/api/usuarios');
  const usuarios = await resp.json();

  document.getElementById('formulario-comissao').innerHTML = `
    <div class="bg-white rounded-xl shadow p-6 mb-6 max-w-xl mx-auto">
      <h3 class="text-xl font-bold mb-4 text-blue-800 flex items-center gap-2">
        <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-width="1.5"></circle><path stroke-width="1.5" d="M12 6v6l4 2"></path></svg>
        Nova Comissão
      </h3>
      <form id="form-comissao" class="space-y-4">
        <div>
          <label class="block mb-1 font-semibold text-gray-700">Nome da Comissão</label>
          <input type="text" name="nome" class="border rounded-lg w-full p-2 focus:ring-2 focus:ring-blue-400 focus:outline-none" required>
        </div>
        <div>
          <label class="block mb-1 font-semibold text-gray-700">Tipo</label>
          <select name="tipo" class="border rounded-lg w-full p-2" required>
            <option value="Fixa">Fixa</option>
            <option value="Temporária">Temporária</option>
          </select>
        </div>
        <div>
          <label class="block mb-1 font-semibold text-gray-700">Coordenador Responsável</label>
          <select name="coordenador_id" class="border rounded-lg w-full p-2" required>
            <option value="">Selecione um usuário</option>
            ${usuarios.map(u => `<option value="${u.id}">${u.name}</option>`).join('')}
          </select>
        </div>
        <div class="flex gap-2 mt-4">
          <button type="submit" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition">Cadastrar</button>
          <button type="button" onclick="fecharFormularioComissao()" class="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold transition">Cancelar</button>
        </div>
      </form>
    </div>
  `;

  document.getElementById('form-comissao').onsubmit = async function (e) {
    e.preventDefault();
    const form = e.target;
    const dados = {
      nome: form.nome.value,
      tipo: form.tipo.value,
      coordenador_id: form.coordenador_id.value,
      coordenador_nome: form.coordenador_id.selectedOptions[0].text
    };
    await fetch('/api/comissoes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    });
    carregarComissoes();
  };
}

function fecharFormularioComissao() {
  document.getElementById('formulario-comissao').innerHTML = '';
}

// NOVA FUNÇÃO: Gerenciar membros da comissão
// ...existing code...
async function gerenciarMembrosComissao(comissaoId, comissaoNome) {
  // Busca membros atuais
  const resp = await fetch(`/api/comissoes/${comissaoId}/membros`);
  const membros = await resp.json();

  // Busca usuários fixos para opção de adicionar membro existente
  const respUsuarios = await fetch('/api/usuarios');
  const usuarios = await respUsuarios.json();

  document.getElementById('content').innerHTML = `
    <div class="max-w-3xl mx-auto bg-white rounded-xl shadow p-8">
      <h2 class="text-2xl font-bold mb-6 text-blue-800 flex items-center gap-2">
        <svg class="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-width="1.5"></circle><path stroke-width="1.5" d="M12 6v6l4 2"></path></svg>
        Membros da Comissão: ${comissaoNome}
      </h2>
      <button onclick="carregarComissoes()" class="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg mb-6 font-semibold transition">Voltar</button>
      <div class="mb-8">
        <h3 class="font-bold mb-2 text-blue-700">Membros atuais:</h3>
        <ul class="space-y-2">
          ${membros.length === 0 ? '<li class="text-gray-500">Nenhum membro cadastrado.</li>' : membros.map(m => `
            <li class="bg-gray-50 rounded-lg px-4 py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 shadow">
              <span>
                <span class="font-semibold text-blue-900">${m.nome}</span>
                ${m.funcao ? `<span class="text-gray-600">- ${m.funcao}</span>` : ''}
                ${m.email ? `<span class="text-gray-400 text-xs ml-2">(${m.email})</span>` : ''}
              </span>
              <span class="flex gap-2">
                <button class="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded transition" onclick="mostrarEditarMembro(${m.id}, ${comissaoId}, '${comissaoNome}')">Editar</button>
                <button class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition" onclick="removerMembroComissao(${m.id}, ${comissaoId}, '${comissaoNome}')">Remover</button>
              </span>
            </li>
          `).join('')}
        </ul>
      </div>
      <div>
        <h3 class="font-bold mb-2 text-blue-700">Adicionar novo membro</h3>
        <form id="form-membro" class="bg-white rounded-xl shadow p-6 mb-4 space-y-4">
          <div>
            <label class="block mb-1 font-semibold text-gray-700">Selecionar usuário fixo</label>
            <select name="usuario_id" class="border rounded-lg w-full p-2" onchange="toggleCamposNovoMembro(this)">
              <option value="">-- Não selecionar --</option>
              ${usuarios.map(u => `<option value="${u.id}">${u.name}</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="block mb-1 font-semibold text-gray-700">Nome</label>
            <input type="text" name="nome" class="border rounded-lg w-full p-2" required>
          </div>
          <div>
            <label class="block mb-1 font-semibold text-gray-700">E-mail</label>
            <input type="email" name="email" class="border rounded-lg w-full p-2">
          </div>
          <div>
            <label class="block mb-1 font-semibold text-gray-700">Senha</label>
            <input type="password" name="senha" class="border rounded-lg w-full p-2">
          </div>
          <div>
            <label class="block mb-1 font-semibold text-gray-700">Função</label>
            <input type="text" name="funcao" class="border rounded-lg w-full p-2">
          </div>
          <div class="flex gap-2 mt-2">
            <button type="submit" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition">Adicionar</button>
          </div>
        </form>
      </div>
      <div id="formulario-editar-membro"></div>
    </div>
  `;

  document.getElementById('form-membro').onsubmit = async function (e) {
    e.preventDefault();
    const form = e.target;
    await fetch('/api/membros_comissao', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        comissao_id: comissaoId,
        usuario_id: form.usuario_id.value || null,
        nome: form.nome.value,
        email: form.email.value,
        funcao: form.funcao.value,
        senha: form.senha.value // novo campo
      })
    });
    gerenciarMembrosComissao(comissaoId, comissaoNome); // Atualiza a lista
  };
}
function toggleCamposNovoMembro(select) {
  const form = select.form;
  const isNovo = !select.value;
  form.email.required = isNovo;
  form.senha.required = isNovo;
  form.email.parentElement.style.display = isNovo ? '' : 'none';
  form.senha.parentElement.style.display = isNovo ? '' : 'none';
}

// ...existing code...
async function mostrarEditarComissao(id) {
  // Busca dados da comissão
  const resp = await fetch('/api/comissoes');
  const comissoes = await resp.json();
  const comissao = comissoes.find(c => c.id === id);

  // Busca usuários fixos para coordenador
  const respUsuarios = await fetch('/api/usuarios');
  const usuarios = await respUsuarios.json();

  document.getElementById('formulario-comissao').innerHTML = `
    <div class="bg-white rounded-xl shadow p-6 mb-6 max-w-xl mx-auto">
      <h3 class="text-xl font-bold mb-4 text-blue-800 flex items-center gap-2">
        <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-width="1.5"></circle><path stroke-width="1.5" d="M12 6v6l4 2"></path></svg>
        Editar Comissão
      </h3>
      <form id="form-editar-comissao" class="space-y-4">
        <div>
          <label class="block mb-1 font-semibold text-gray-700">Nome da Comissão</label>
          <input type="text" name="nome" class="border rounded-lg w-full p-2 focus:ring-2 focus:ring-blue-400 focus:outline-none" required value="${comissao.nome}">
        </div>
        <div>
          <label class="block mb-1 font-semibold text-gray-700">Tipo</label>
          <select name="tipo" class="border rounded-lg w-full p-2" required>
            <option value="Fixa" ${comissao.tipo === 'Fixa' ? 'selected' : ''}>Fixa</option>
            <option value="Temporária" ${comissao.tipo === 'Temporária' ? 'selected' : ''}>Temporária</option>
          </select>
        </div>
        <div>
          <label class="block mb-1 font-semibold text-gray-700">Coordenador Responsável</label>
          <select name="coordenador_id" class="border rounded-lg w-full p-2" required>
            <option value="">Selecione um usuário</option>
            ${usuarios.map(u => `<option value="${u.id}" ${u.id == comissao.coordenador_id ? 'selected' : ''}>${u.name}</option>`).join('')}
          </select>
        </div>
        <div class="flex gap-2 mt-4">
          <button type="submit" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition">Salvar</button>
          <button type="button" onclick="fecharFormularioComissao()" class="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold transition">Cancelar</button>
        </div>
      </form>
    </div>
  `;

  document.getElementById('form-editar-comissao').onsubmit = async function (e) {
    e.preventDefault();
    const form = e.target;
    const dados = {
      nome: form.nome.value,
      tipo: form.tipo.value,
      coordenador_id: form.coordenador_id.value,
      coordenador_nome: form.coordenador_id.selectedOptions[0].text
    };
    await fetch(`/api/comissoes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    });
    carregarComissoes();
  };
}
async function removerComissao(id) {
  if (!confirm('Tem certeza que deseja excluir esta comissão? Esta ação não pode ser desfeita.')) return;
  await fetch(`/api/comissoes/${id}`, { method: 'DELETE' });
  carregarComissoes();
}

function mostrarEditarMembro(membroId, comissaoId, comissaoNome) {
  fetch(`/api/comissoes/${comissaoId}/membros`)
    .then(resp => resp.json())
    .then(membros => {
      const membro = membros.find(m => m.id === membroId);
      document.getElementById('formulario-editar-membro')?.remove();
      const div = document.createElement('div');
      div.id = 'formulario-editar-membro';
      div.innerHTML = `
        <h4 class="font-bold mb-2">Editar Membro</h4>
        <form id="form-editar-membro" class="bg-white rounded shadow p-4 mb-4">
          <label class="block mb-2">Nome:
            <input type="text" name="nome" class="border rounded w-full p-2" required value="${membro.nome}">
          </label>
          <label class="block mb-2">E-mail:
            <input type="email" name="email" class="border rounded w-full p-2" value="${membro.email || ''}">
          </label>
          <label class="block mb-2">Função:
            <input type="text" name="funcao" class="border rounded w-full p-2" value="${membro.funcao || ''}">
          </label>
          <button type="submit" class="bg-green-600 text-white px-4 py-2 rounded">Salvar</button>
          <button type="button" onclick="document.getElementById('formulario-editar-membro').remove()" class="bg-gray-400 text-white px-4 py-2 rounded ml-2">Cancelar</button>
        </form>
      `;
      document.querySelector('.mb-6').after(div);

      document.getElementById('form-editar-membro').onsubmit = async function (e) {
        e.preventDefault();
        const form = e.target;
        await fetch(`/api/membros_comissao/${membroId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nome: form.nome.value,
            email: form.email.value,
            funcao: form.funcao.value
          })
        });
        gerenciarMembrosComissao(comissaoId, comissaoNome);
      };
    });
}

async function removerMembroComissao(membroId, comissaoId, comissaoNome) {
  if (!confirm('Tem certeza que deseja remover este membro da comissão?')) return;
  await fetch(`/api/membros_comissao/${membroId}`, { method: 'DELETE' });
  gerenciarMembrosComissao(comissaoId, comissaoNome);
}

// funçao tarefas

// ...existing code...
async function carregarTarefas() {
  document.getElementById('content').innerHTML = `
    <div class="max-w-4xl mx-auto bg-white rounded-xl shadow p-8">
      <h2 class="text-2xl font-bold mb-6 text-blue-800 flex items-center gap-2">
        <svg class="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="4" y="4" width="16" height="16" rx="2" stroke-width="1.5"></rect>
          <path stroke-width="1.5" d="M8 10h8M8 14h5"></path>
        </svg>
        Tarefas
      </h2>
      <button onclick="mostrarFormularioTarefa()" class="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-4 py-2 rounded-lg mb-6 transition">Nova Tarefa</button>
      <div id="lista-tarefas" class="space-y-4"></div>
      <div id="formulario-tarefa"></div>
    </div>
  `;

  // Busca tarefas já cadastradas
  try {
    const response = await fetch('/api/tarefas');
    const tarefas = await response.json();
    const lista = document.getElementById('lista-tarefas');
    if (tarefas.length === 0) {
      lista.innerHTML = `<div class="text-gray-500 text-center">Nenhuma tarefa cadastrada ainda.</div>`;
      return;
    }
    lista.innerHTML = tarefas.map(t => `
      <div class="bg-gray-50 rounded-xl shadow p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div class="text-lg font-semibold text-blue-900">${t.titulo}</div>
          <div class="text-gray-600 text-sm mb-1">${t.descricao || '-'}</div>
          <div class="text-xs text-gray-400 mb-1">Data Limite: ${t.data_limite ? new Date(t.data_limite).toLocaleDateString() : '-'}</div>
          <div class="text-xs text-gray-400 mb-1">Destinatário: 
            <span class="font-medium text-blue-700">${t.tipo_destinatario === 'usuario' ? 'Usuário #' + t.destinatario_id : 'Comissão #' + t.destinatario_id}</span>
          </div>
          <div class="mt-1">
            <span class="font-bold text-sm text-gray-700">Status:</span>
            <span class="${t.status === 'Concluída' ? 'text-green-600 font-semibold' : 'text-yellow-700 font-semibold'}">${t.status}</span>
          </div>
        </div>
        <div class="flex gap-2">
          <button class="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded transition" onclick="mostrarEditarTarefa(${t.id})">Editar</button>
          <button class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition" onclick="removerTarefa(${t.id})">Excluir</button>
        </div>
      </div>
    `).join('');
  } catch (error) {
    document.getElementById('lista-tarefas').innerHTML = `<div class="text-red-500">Erro ao carregar tarefas.</div>`;
  }
}

// ...existing code...
async function mostrarFormularioTarefa() {
  // Busca usuários e comissões para seleção
  const respUsuarios = await fetch('/api/usuarios');
  const usuarios = await respUsuarios.json();
  const respComissoes = await fetch('/api/comissoes');
  const comissoes = await respComissoes.json();

  document.getElementById('formulario-tarefa').innerHTML = `
    <div class="bg-white rounded-xl shadow p-6 mb-6 max-w-xl mx-auto">
      <h3 class="text-xl font-bold mb-4 text-blue-800 flex items-center gap-2">
        <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2" stroke-width="1.5"></rect><path stroke-width="1.5" d="M8 10h8M8 14h5"></path></svg>
        Nova Tarefa
      </h3>
      <form id="form-tarefa" class="space-y-4">
        <div>
          <label class="block mb-1 font-semibold text-gray-700">Título</label>
          <input type="text" name="titulo" class="border rounded-lg w-full p-2 focus:ring-2 focus:ring-blue-400 focus:outline-none" required>
        </div>
        <div>
          <label class="block mb-1 font-semibold text-gray-700">Descrição</label>
          <textarea name="descricao" class="border rounded-lg w-full p-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"></textarea>
        </div>
        <div>
          <label class="block mb-1 font-semibold text-gray-700">Data Limite</label>
          <input type="date" name="data_limite" class="border rounded-lg w-full p-2 focus:ring-2 focus:ring-blue-400 focus:outline-none">
        </div>
        <div>
          <label class="block mb-1 font-semibold text-gray-700">Destinatário</label>
          <select name="tipo_destinatario" class="border rounded-lg w-full p-2" onchange="toggleDestinatarioTarefa(this)">
            <option value="">Selecione</option>
            <option value="usuario">Usuário</option>
            <option value="comissao">Comissão</option>
          </select>
        </div>
        <div id="campo-destinatario"></div>
        <div class="flex gap-2 mt-4">
          <button type="submit" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition">Cadastrar</button>
          <button type="button" onclick="fecharFormularioTarefa()" class="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold transition">Cancelar</button>
        </div>
      </form>
    </div>
  `;

  window.toggleDestinatarioTarefa = function (select) {
    const campo = document.getElementById('campo-destinatario');
    if (select.value === 'usuario') {
      campo.innerHTML = `
        <label class="block mb-1 font-semibold text-gray-700">Selecione o usuário</label>
        <select name="destinatario_id" class="border rounded-lg w-full p-2" required>
          <option value="">Selecione</option>
          ${usuarios.map(u => `<option value="${u.id}">${u.name}</option>`).join('')}
        </select>
      `;
    } else if (select.value === 'comissao') {
      campo.innerHTML = `
        <label class="block mb-1 font-semibold text-gray-700">Selecione a comissão</label>
        <select name="destinatario_id" class="border rounded-lg w-full p-2" required>
          <option value="">Selecione</option>
          ${comissoes.map(c => `<option value="${c.id}">${c.nome}</option>`).join('')}
        </select>
      `;
    } else {
      campo.innerHTML = '';
    }
  };

  document.getElementById('form-tarefa').onsubmit = async function (e) {
    e.preventDefault();
    const form = e.target;
    await fetch('/api/tarefas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        titulo: form.titulo.value,
        descricao: form.descricao.value,
        data_limite: form.data_limite.value,
        tipo_destinatario: form.tipo_destinatario.value,
        destinatario_id: form.destinatario_id.value
      })
    });
    carregarTarefas();
  };
}
// ...existing code...

function fecharFormularioTarefa() {
  document.getElementById('formulario-tarefa').innerHTML = '';
}

// ...existing code...
async function carregarTarefas() {
  document.getElementById('content').innerHTML = `
    <div class="max-w-4xl mx-auto bg-white rounded-xl shadow p-8">
      <h2 class="text-2xl font-bold mb-6 text-blue-800 flex items-center gap-2">
        <svg class="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="4" y="4" width="16" height="16" rx="2" stroke-width="1.5"></rect>
          <path stroke-width="1.5" d="M8 10h8M8 14h5"></path>
        </svg>
        Tarefas
      </h2>
      <button onclick="mostrarFormularioTarefa()" class="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-4 py-2 rounded-lg mb-6 transition">Nova Tarefa</button>
      <div id="lista-tarefas" class="space-y-4"></div>
      <div id="formulario-tarefa"></div>
    </div>
  `;

  // Busca tarefas já cadastradas
  try {
    const response = await fetch('/api/tarefas');
    const tarefas = await response.json();
    const lista = document.getElementById('lista-tarefas');
    if (tarefas.length === 0) {
      lista.innerHTML = `<div class="text-gray-500 text-center">Nenhuma tarefa cadastrada ainda.</div>`;
      return;
    }
    lista.innerHTML = tarefas.map(t => `
      <div class="bg-gray-50 rounded-xl shadow p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div class="text-lg font-semibold text-blue-900">${t.titulo}</div>
          <div class="text-gray-600 text-sm mb-1">${t.descricao || '-'}</div>
          <div class="text-xs text-gray-400 mb-1">Data Limite: ${t.data_limite ? new Date(t.data_limite).toLocaleDateString() : '-'}</div>
          <div class="text-xs text-gray-400 mb-1">Destinatário: 
            <span class="font-medium text-blue-700">${t.tipo_destinatario === 'usuario' ? 'Usuário #' + t.destinatario_id : 'Comissão #' + t.destinatario_id}</span>
          </div>
          <div class="mt-1">
            <span class="font-bold text-sm text-gray-700">Status:</span>
            <span class="${t.status === 'Concluída' ? 'text-green-600 font-semibold' : 'text-yellow-700 font-semibold'}">${t.status}</span>
          </div>
        </div>
        <div class="flex gap-2">
          <button class="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded transition" onclick="mostrarEditarTarefa(${t.id})">Editar</button>
          <button class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition" onclick="removerTarefa(${t.id})">Excluir</button>
        </div>
      </div>
    `).join('');
  } catch (error) {
    document.getElementById('lista-tarefas').innerHTML = `<div class="text-red-500">Erro ao carregar tarefas.</div>`;
  }
}
// ...existing code...
async function mostrarFormularioTarefa() {
  // Busca usuários e comissões para seleção
  const respUsuarios = await fetch('/api/usuarios');
  const usuarios = await respUsuarios.json();
  const respComissoes = await fetch('/api/comissoes');
  const comissoes = await respComissoes.json();

  document.getElementById('formulario-tarefa').innerHTML = `
    <h3 class="text-lg font-bold mb-2">Nova Tarefa</h3>
    <form id="form-tarefa" class="bg-white rounded shadow p-4 mb-4">
      <label class="block mb-2">Título:
        <input type="text" name="titulo" class="border rounded w-full p-2" required>
      </label>
      <label class="block mb-2">Descrição:
        <textarea name="descricao" class="border rounded w-full p-2"></textarea>
      </label>
      <label class="block mb-2">Data Limite:
        <input type="date" name="data_limite" class="border rounded w-full p-2">
      </label>
      <label class="block mb-2">Destinatário:
        <select name="tipo_destinatario" class="border rounded w-full p-2" onchange="toggleDestinatarioTarefa(this)">
          <option value="">Selecione</option>
          <option value="usuario">Usuário</option>
          <option value="comissao">Comissão</option>
        </select>
      </label>
      <div id="campo-destinatario"></div>
      <button type="submit" class="bg-green-600 text-white px-4 py-2 rounded">Cadastrar</button>
      <button type="button" onclick="fecharFormularioTarefa()" class="bg-gray-400 text-white px-4 py-2 rounded ml-2">Cancelar</button>
    </form>
  `;

  window.toggleDestinatarioTarefa = function (select) {
    const campo = document.getElementById('campo-destinatario');
    if (select.value === 'usuario') {
      campo.innerHTML = `
        <label class="block mb-2">Selecione o usuário:
          <select name="destinatario_id" class="border rounded w-full p-2" required>
            <option value="">Selecione</option>
            ${usuarios.map(u => `<option value="${u.id}">${u.name}</option>`).join('')}
          </select>
        </label>
      `;
    } else if (select.value === 'comissao') {
      campo.innerHTML = `
        <label class="block mb-2">Selecione a comissão:
          <select name="destinatario_id" class="border rounded w-full p-2" required>
            <option value="">Selecione</option>
            ${comissoes.map(c => `<option value="${c.id}">${c.nome}</option>`).join('')}
          </select>
        </label>
      `;
    } else {
      campo.innerHTML = '';
    }
  };

  document.getElementById('form-tarefa').onsubmit = async function (e) {
    e.preventDefault();
    const form = e.target;
    await fetch('/api/tarefas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        titulo: form.titulo.value,
        descricao: form.descricao.value,
        data_limite: form.data_limite.value,
        tipo_destinatario: form.tipo_destinatario.value,
        destinatario_id: form.destinatario_id.value
      })
    });
    carregarTarefas();
  };
}

function fecharFormularioTarefa() {
  document.getElementById('formulario-tarefa').innerHTML = '';
}

async function mostrarEditarTarefa(id) {
  // Busca tarefa
  const respTarefa = await fetch('/api/tarefas');
  const tarefas = await respTarefa.json();
  const tarefa = tarefas.find(t => t.id === id);

  // Busca usuários e comissões para seleção
  const respUsuarios = await fetch('/api/usuarios');
  const usuarios = await respUsuarios.json();
  const respComissoes = await fetch('/api/comissoes');
  const comissoes = await respComissoes.json();

  document.getElementById('formulario-tarefa').innerHTML = `
    <h3 class="text-lg font-bold mb-2">Editar Tarefa</h3>
    <form id="form-editar-tarefa" class="bg-white rounded shadow p-4 mb-4">
      <label class="block mb-2">Título:
        <input type="text" name="titulo" class="border rounded w-full p-2" required value="${tarefa.titulo}">
      </label>
      <label class="block mb-2">Descrição:
        <textarea name="descricao" class="border rounded w-full p-2">${tarefa.descricao || ''}</textarea>
      </label>
      <label class="block mb-2">Data Limite:
        <input type="date" name="data_limite" class="border rounded w-full p-2" value="${tarefa.data_limite ? tarefa.data_limite.split('T')[0] : ''}">
      </label>
      <label class="block mb-2">Destinatário:
        <select name="tipo_destinatario" class="border rounded w-full p-2" onchange="toggleDestinatarioTarefaEditar(this)">
          <option value="">Selecione</option>
          <option value="usuario" ${tarefa.tipo_destinatario === 'usuario' ? 'selected' : ''}>Usuário</option>
          <option value="comissao" ${tarefa.tipo_destinatario === 'comissao' ? 'selected' : ''}>Comissão</option>
        </select>
      </label>
      <div id="campo-destinatario-editar"></div>
      <label class="block mb-2">Status:
        <select name="status" class="border rounded w-full p-2">
          <option value="Pendente" ${tarefa.status === 'Pendente' ? 'selected' : ''}>Pendente</option>
          <option value="Concluída" ${tarefa.status === 'Concluída' ? 'selected' : ''}>Concluída</option>
        </select>
      </label>
      <button type="submit" class="bg-green-600 text-white px-4 py-2 rounded">Salvar</button>
      <button type="button" onclick="fecharFormularioTarefa()" class="bg-gray-400 text-white px-4 py-2 rounded ml-2">Cancelar</button>
    </form>
  `;

  // Preenche o campo destinatário conforme o tipo
  window.toggleDestinatarioTarefaEditar = function (select) {
    const campo = document.getElementById('campo-destinatario-editar');
    if (select.value === 'usuario') {
      campo.innerHTML = `
        <label class="block mb-2">Selecione o usuário:
          <select name="destinatario_id" class="border rounded w-full p-2" required>
            <option value="">Selecione</option>
            ${usuarios.map(u => `<option value="${u.id}" ${tarefa.tipo_destinatario === 'usuario' && tarefa.destinatario_id == u.id ? 'selected' : ''}>${u.name}</option>`).join('')}
          </select>
        </label>
      `;
    } else if (select.value === 'comissao') {
      campo.innerHTML = `
        <label class="block mb-2">Selecione a comissão:
          <select name="destinatario_id" class="border rounded w-full p-2" required>
            <option value="">Selecione</option>
            ${comissoes.map(c => `<option value="${c.id}" ${tarefa.tipo_destinatario === 'comissao' && tarefa.destinatario_id == c.id ? 'selected' : ''}>${c.nome}</option>`).join('')}
          </select>
        </label>
      `;
    } else {
      campo.innerHTML = '';
    }
  };
  // Chama para preencher ao abrir
  window.toggleDestinatarioTarefaEditar({ value: tarefa.tipo_destinatario });

  document.getElementById('form-editar-tarefa').onsubmit = async function (e) {
    e.preventDefault();
    const form = e.target;
    await fetch(`/api/tarefas/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        titulo: form.titulo.value,
        descricao: form.descricao.value,
        data_limite: form.data_limite.value,
        tipo_destinatario: form.tipo_destinatario.value,
        destinatario_id: form.destinatario_id.value,
        status: form.status.value
      })
    });
    carregarTarefas();
  };
}

async function removerTarefa(id) {
  if (!confirm('Tem certeza que deseja excluir esta tarefa?')) return;
  await fetch(`/api/tarefas/${id}`, { method: 'DELETE' });
  carregarTarefas();
}
window.mostrarEditarTarefa = mostrarEditarTarefa;
window.removerTarefa = removerTarefa;

// ...existing code...
async function carregarArquivos() {
  document.getElementById('content').innerHTML = `
    <div class="max-w-3xl mx-auto bg-white rounded-xl shadow p-8">
      <h2 class="text-2xl font-bold mb-6 text-blue-800 flex items-center gap-2">
        <svg class="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="1.5" d="M12 6v6l4 2"></path><circle cx="12" cy="12" r="10" stroke-width="1.5"></circle></svg>
        Arquivos
      </h2>
      <form id="form-arquivo" class="bg-gray-50 rounded-xl shadow p-6 mb-8 flex flex-col gap-4" enctype="multipart/form-data">
        <div>
          <label class="block mb-1 font-semibold text-gray-700">Categoria</label>
          <select name="categoria" class="border rounded-lg w-full p-2" required>
            <option value="">Selecione</option>
            <option value="Ata">Ata</option>
            <option value="Apresentação">Apresentação</option>
            <option value="Relatório">Relatório</option>
            <option value="Outros">Outros</option>
          </select>
        </div>
        <div>
          <label class="block mb-1 font-semibold text-gray-700">Selecione um arquivo</label>
          <input type="file" name="arquivo" class="border rounded-lg w-full p-2 bg-white" required>
        </div>
        <div class="flex gap-2">
          <button type="submit" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition">Enviar</button>
        </div>
      </form>
      <div id="lista-arquivos"></div>
    </div>
  `;

  document.getElementById('form-arquivo').onsubmit = async function (e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    await fetch('/api/arquivos', {
      method: 'POST',
      body: formData
    });
    carregarArquivos();
  };

  // Listar arquivos já enviados
  const resp = await fetch('/api/arquivos');
  const arquivos = await resp.json();
  const lista = document.getElementById('lista-arquivos');
  if (arquivos.length === 0) {
    lista.innerHTML = `<p class="text-gray-500 text-center mt-6">Nenhum arquivo enviado ainda.</p>`;
    return;
  }
  lista.innerHTML = `
    <div class="mt-6">
      <table class="min-w-full text-sm bg-white rounded-xl overflow-hidden shadow">
        <thead>
          <tr class="bg-blue-50">
            <th class="px-4 py-2 text-left">Nome</th>
            <th class="px-4 py-2 text-left">Tipo</th>
            <th class="px-4 py-2 text-left">Categoria</th>
            <th class="px-4 py-2 text-left">Data</th>
            <th class="px-4 py-2 text-center">Ações</th>
          </tr>
        </thead>
        <tbody>
          ${arquivos.map(a => `
            <tr class="border-t">
              <td class="px-4 py-2">${a.nome_original}</td>
              <td class="px-4 py-2">${a.tipo}</td>
              <td class="px-4 py-2">${a.categoria || '-'}</td>
              <td class="px-4 py-2">${new Date(a.data_upload).toLocaleString()}</td>
              <td class="px-4 py-2 text-center">
                <a href="/uploads/${a.nome_armazenado}" target="_blank" class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-xs font-semibold transition">Baixar</a>
                <button class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-xs font-semibold ml-2 transition" onclick="removerArquivo(${a.id})">Excluir</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}


// Função global para remover arquivo
async function removerArquivo(id) {
  if (!confirm('Tem certeza que deseja excluir este arquivo?')) return;
  await fetch(`/api/arquivos/${id}`, { method: 'DELETE' });
  carregarArquivos();
}
window.removerArquivo = removerArquivo;

async function carregarCalendario() {
  document.getElementById('content').innerHTML = `
    <div class="max-w-4xl mx-auto bg-white rounded-xl shadow p-8">
      <h2 class="text-2xl font-bold mb-6 text-blue-800 flex items-center gap-2">
        <svg class="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke-width="1.5"></circle>
          <path stroke-width="1.5" d="M12 6v6l4 2"></path>
        </svg>
        Calendário de Eventos
      </h2>
      <div id="calendar"></div>
      <div id="form-evento" class="mt-6"></div>
    </div>
  `;

  // Busca eventos do backend
  const resp = await fetch('/api/eventos');
  const eventos = await resp.json();

  // Inicializa o calendário
  const calendarEl = document.getElementById('calendar');
  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    height: 650,
    events: eventos.map(e => ({
      id: e.id,
      title: e.titulo,
      start: e.inicio,
      end: e.fim,
      extendedProps: {
        descricao: e.descricao,
        tipo: e.tipo
      }
    })),
    dateClick: function (info) {
      mostrarFormularioEvento(info.dateStr);
    },
    eventClick: function (info) {
      mostrarEditarEvento(info.event.id);
    }
  });
  calendar.render();

  // Função para mostrar formulário de novo evento
  window.mostrarFormularioEvento = function (data) {
    document.getElementById('form-evento').innerHTML = `
      <h3 class="text-lg font-bold mb-2">Novo Evento</h3>
      <form id="form-novo-evento" class="bg-white rounded shadow p-4 mb-4">
        <label class="block mb-2">Título:
          <input type="text" name="titulo" class="border rounded w-full p-2" required>
        </label>
        <label class="block mb-2">Descrição:
          <textarea name="descricao" class="border rounded w-full p-2"></textarea>
        </label>
        <label class="block mb-2">Data e hora de início:
          <input type="datetime-local" name="inicio" class="border rounded w-full p-2" value="${data}T09:00" required>
        </label>
        <label class="block mb-2">Data e hora de fim:
          <input type="datetime-local" name="fim" class="border rounded w-full p-2" value="${data}T10:00">
        </label>
        <label class="block mb-2">Tipo:
          <select name="tipo" class="border rounded w-full p-2">
            <option value="Reunião">Reunião</option>
            <option value="Evento">Evento</option>
            <option value="Outro">Outro</option>
          </select>
        </label>
        <button type="submit" class="bg-green-600 text-white px-4 py-2 rounded">Salvar</button>
        <button type="button" onclick="document.getElementById('form-evento').innerHTML = ''" class="bg-gray-400 text-white px-4 py-2 rounded ml-2">Cancelar</button>
      </form>
    `;
    document.getElementById('form-novo-evento').onsubmit = async function (e) {
      e.preventDefault();
      const form = e.target;
      await fetch('/api/eventos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: form.titulo.value,
          descricao: form.descricao.value,
          inicio: form.inicio.value,
          fim: form.fim.value,
          tipo: form.tipo.value,
          criado_por: 'presidente'
        })
      });
      carregarCalendario();
    };
  };

  // Função para editar evento
  window.mostrarEditarEvento = async function (id) {
    const evento = eventos.find(e => e.id == id);
    document.getElementById('form-evento').innerHTML = `
      <h3 class="text-lg font-bold mb-2">Editar Evento</h3>
      <form id="form-editar-evento" class="bg-white rounded shadow p-4 mb-4">
        <label class="block mb-2">Título:
          <input type="text" name="titulo" class="border rounded w-full p-2" required value="${evento.titulo}">
        </label>
        <label class="block mb-2">Descrição:
          <textarea name="descricao" class="border rounded w-full p-2">${evento.descricao || ''}</textarea>
        </label>
        <label class="block mb-2">Data e hora de início:
          <input type="datetime-local" name="inicio" class="border rounded w-full p-2" value="${evento.inicio.replace(' ', 'T')}" required>
        </label>
        <label class="block mb-2">Data e hora de fim:
          <input type="datetime-local" name="fim" class="border rounded w-full p-2" value="${evento.fim ? evento.fim.replace(' ', 'T') : ''}">
        </label>
        <label class="block mb-2">Tipo:
          <select name="tipo" class="border rounded w-full p-2">
            <option value="Reunião" ${evento.tipo === 'Reunião' ? 'selected' : ''}>Reunião</option>
            <option value="Evento" ${evento.tipo === 'Evento' ? 'selected' : ''}>Evento</option>
            <option value="Outro" ${evento.tipo === 'Outro' ? 'selected' : ''}>Outro</option>
          </select>
        </label>
        <button type="submit" class="bg-green-600 text-white px-4 py-2 rounded">Salvar</button>
        <button type="button" onclick="removerEvento(${evento.id})" class="bg-red-600 text-white px-4 py-2 rounded ml-2">Excluir</button>
        <button type="button" onclick="document.getElementById('form-evento').innerHTML = ''" class="bg-gray-400 text-white px-4 py-2 rounded ml-2">Cancelar</button>
      </form>
    `;
    document.getElementById('form-editar-evento').onsubmit = async function (e) {
      e.preventDefault();
      const form = e.target;
      await fetch(`/api/eventos/${evento.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: form.titulo.value,
          descricao: form.descricao.value,
          inicio: form.inicio.value,
          fim: form.fim.value,
          tipo: form.tipo.value
        })
      });
      carregarCalendario();
    };
  };
  // Função para remover evento
  window.removerEvento = async function (id) {
    if (!confirm('Tem certeza que deseja excluir este evento?')) return;
    await fetch(`/api/eventos/${id}`, { method: 'DELETE' });
    carregarCalendario();
  };
}

// ...existing code...
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
// ...existing code...
window.carregarRanking = carregarRanking; t

// ...existing code...

// PERFIL DO PRESIDENTE (nome, foto, upload e logout)
window.addEventListener('DOMContentLoaded', async () => {
  const nome = localStorage.getItem('nome'); // Salve o nome no login!
  const email = localStorage.getItem('userEmail');
  if (document.getElementById('nome-presidente')) {
    document.getElementById('nome-presidente').textContent = nome || 'Presidente';
  }

  // Busca foto do backend
  try {
    const resp = await fetch(`http://localhost:3000/api/usuarios?email=${email}`);
    const usuario = (await resp.json())[0];
    if (usuario && usuario.foto_url && document.getElementById('avatar-presidente')) {
      document.getElementById('avatar-presidente').src = usuario.foto_url;
    }
  } catch (e) {
    // Se der erro, mantém o avatar padrão
  }
});

// Upload da foto de perfil
if (document.getElementById('input-foto-perfil-presidente')) {
  document.getElementById('input-foto-perfil-presidente').addEventListener('change', async function () {
    const file = this.files[0];
    if (!file) return;
    const email = localStorage.getItem('userEmail');
    const formData = new FormData();
    formData.append('foto', file);
    formData.append('email', email);

    // Envia para o backend
    const resp = await fetch('http://localhost:3000/api/usuarios/foto', {
      method: 'POST',
      body: formData
    });
    const data = await resp.json();
    if (data.foto_url && document.getElementById('avatar-presidente')) {
      document.getElementById('avatar-presidente').src = data.foto_url;
      alert('Foto atualizada!');
    } else {
      alert('Erro ao atualizar foto.');
    }
  });
}

// Logout
if (document.getElementById('logout-btn-presidente')) {
  document.getElementById('logout-btn-presidente').addEventListener('click', function () {
    localStorage.clear();
    window.location.href = '/index_login.html'; // Ajuste o caminho se necessário
  });
}

// ...existing code...