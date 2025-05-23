// Função para carregar a interface de Registro de Reuniões
function carregarRegistroReunioes() {
  document.getElementById('content').innerHTML = `
    <h2 class="text-xl font-bold mb-4">Registro de Reuniões</h2>
    <form id="form-reuniao" class="space-y-4">
      <!-- Nome da Reunião -->
      <div>
        <label for="nome-reuniao" class="block text-sm font-medium text-gray-700">Nome da Reunião</label>
        <input type="text" id="nome-reuniao" name="nome-reuniao" class="mt-1 block w-full p-2 border border-gray-300 rounded-md" placeholder="Digite o nome da reunião" required>
      </div>

      <!-- Descrição -->
      <div>
        <label for="descricao-reuniao" class="block text-sm font-medium text-gray-700">Descrição</label>
        <textarea id="descricao-reuniao" name="descricao-reuniao" class="mt-1 block w-full p-2 border border-gray-300 rounded-md" placeholder="Digite uma breve descrição" required></textarea>
      </div>

      <!-- Lista de Chamada -->
      <div>
        <label class="block text-sm font-medium text-gray-700">Lista de Chamada</label>
        <div id="lista-chamada" class="space-y-2">
          <!-- Aqui será gerada a lista de usuários dinamicamente -->
        </div>
      </div>

      <!-- Botão Salvar -->
      <button type="submit" class="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">Salvar Reunião</button>
    </form>
  `;
  carregarListaChamada(); // Carregar a lista de usuários dinamicamente
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
        <div class="flex items-center space-x-2">
          <input type="checkbox" id="usuario-${usuario.id}" name="presenca" value="${usuario.id}" class="h-4 w-4">
          <label for="usuario-${usuario.id}" class="text-sm text-gray-700">${usuario.name}</label>
        </div>
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
                      <div class="mt-4 flex space-x-2">
                          <button onclick="editarReuniao(${reuniao.id})" class="bg-yellow-500 text-white py-1 px-3 rounded hover:bg-yellow-600">Editar</button>
                          <button onclick="excluirReuniao(${reuniao.id})" class="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600">Excluir</button>
                      </div>
                  </div>
              `).join('')}
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

async function carregarRelatorios() {
  document.getElementById('content').innerHTML = `
    <h2 class="text-xl font-bold mb-4">Relatórios Recebidos</h2>
    <p class="mb-4">Aqui você poderá visualizar, aprovar, recusar ou solicitar ajustes nos relatórios enviados pelos coordenadores e membros.</p>
    <div id="lista-relatorios" class="bg-white rounded shadow p-4">
      <p class="text-gray-500">Carregando relatórios...</p>
    </div>
  `;

  try {
    const response = await fetch('/api/relatorios');
    if (!response.ok) throw new Error('Erro ao buscar relatórios.');

    const relatorios = await response.json();
    const lista = document.getElementById('lista-relatorios');

    if (relatorios.length === 0) {
      lista.innerHTML = `<p class="text-gray-500">Nenhum relatório recebido ainda.</p>`;
      return;
    }

    lista.innerHTML = `
      <table class="min-w-full text-sm">
        <thead>
          <tr>
            <th class="px-2 py-1 text-left">Projeto</th>
            <th class="px-2 py-1 text-left">Tipo</th>
            <th class="px-2 py-1 text-left">Coordenador</th>
            <th class="px-2 py-1 text-left">Status</th>
            <th class="px-2 py-1 text-left">Data</th>
            <th class="px-2 py-1">Ações</th>
          </tr>
        </thead>
        <tbody>
          ${relatorios.map(r => `
            <tr>
              <td class="border-t px-2 py-1">${r.projeto}</td>
              <td class="border-t px-2 py-1">${r.tipo}</td>
              <td class="border-t px-2 py-1">${r.coordenador}</td>
              <td class="border-t px-2 py-1">${r.status}</td>
              <td class="border-t px-2 py-1">${new Date(r.data_envio).toLocaleDateString()}</td>
              <td class="border-t px-2 py-1">
                <button class="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700" onclick="visualizarRelatorio(${r.id})">Ver</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } catch (error) {
    document.getElementById('lista-relatorios').innerHTML = `<p class="text-red-500">Erro ao carregar relatórios.</p>`;
    console.error(error);
  }
}

// ...existing code...

// função para visualizar aprovar recursar ou solicitar ajustes nos relatorios
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
    <h2 class="text-xl font-bold mb-4">Detalhes do Relatório</h2>
    <div class="bg-white rounded shadow p-4 mb-4">
      <p><strong>Projeto:</strong> ${relatorio.projeto}</p>
      <p><strong>Tipo:</strong> ${relatorio.tipo}</p>
      <p><strong>Coordenador:</strong> ${relatorio.coordenador}</p>
      <p><strong>Status:</strong> ${relatorio.status}</p>
      <p><strong>Conteúdo:</strong> ${relatorio.conteudo}</p>
      <p><strong>Observação:</strong> ${relatorio.observacao || '-'}</p>
    </div>
    <div class="flex gap-2">
      <button onclick="atualizarStatusRelatorio(${id}, 'Aprovado')" class="bg-green-600 text-white px-4 py-2 rounded">Aprovar</button>
      <button onclick="atualizarStatusRelatorio(${id}, 'Recusado')" class="bg-red-600 text-white px-4 py-2 rounded">Recusar</button>
      <button onclick="mostrarCampoObservacao(${id})" class="bg-yellow-500 text-white px-4 py-2 rounded">Solicitar Ajustes</button>
      <button onclick="carregarRelatorios()" class="bg-gray-400 text-white px-4 py-2 rounded">Voltar</button>
    </div>
    <div id="campo-observacao"></div>
  `;
}

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
