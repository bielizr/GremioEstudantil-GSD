// Função para aplicar responsividade dinâmica
function aplicarResponsividade() {
  // Detectar largura da tela
  const larguraTela = window.innerWidth;
  
  // Aplicar classes responsivas baseadas na largura
  if (larguraTela <= 480) {
    document.body.classList.add('mobile-pequeno');
    document.body.classList.remove('mobile', 'tablet');
  } else if (larguraTela <= 768) {
    document.body.classList.add('mobile');
    document.body.classList.remove('mobile-pequeno', 'tablet');
  } else if (larguraTela <= 1024) {
    document.body.classList.add('tablet');
    document.body.classList.remove('mobile', 'mobile-pequeno');
  } else {
    document.body.classList.remove('mobile', 'mobile-pequeno', 'tablet');
  }
  
  // Ajustar elementos gerados dinamicamente
  ajustarElementosDinamicos();
}

// Função para ajustar elementos gerados dinamicamente
function ajustarElementosDinamicos() {
  const larguraTela = window.innerWidth;
  
  // Ajustar containers principais
  const containers = document.querySelectorAll('.bg-gray-100.min-h-screen');
  containers.forEach(container => {
    if (larguraTela <= 480) {
      container.style.padding = '6px 2px';
    } else if (larguraTela <= 768) {
      container.style.padding = '8px 4px';
    } else if (larguraTela <= 1024) {
      container.style.padding = '12px 6px';
    } else {
      container.style.padding = '16px 8px';
    }
  });
  
  // Ajustar headers
  const headers = document.querySelectorAll('.bg-gradient-to-r');
  headers.forEach(header => {
    if (larguraTela <= 768) {
      header.style.flexDirection = 'column';
      header.style.alignItems = 'flex-start';
      header.style.gap = '8px';
      header.style.padding = '12px 8px';
    } else {
      header.style.flexDirection = 'row';
      header.style.alignItems = 'center';
      header.style.gap = '16px';
      header.style.padding = '16px 12px';
    }
  });
  
  // Ajustar grids
  const grids = document.querySelectorAll('.grid');
  grids.forEach(grid => {
    if (larguraTela <= 768) {
      grid.style.gridTemplateColumns = '1fr';
      grid.style.gap = '8px';
    } else if (larguraTela <= 1024) {
      grid.style.gridTemplateColumns = 'repeat(2, 1fr)';
      grid.style.gap = '12px';
    } else {
      grid.style.gridTemplateColumns = 'repeat(3, 1fr)';
      grid.style.gap = '16px';
    }
  });
  
  // Ajustar títulos
  const titulos3xl = document.querySelectorAll('.text-3xl');
  titulos3xl.forEach(titulo => {
    if (larguraTela <= 480) {
      titulo.style.fontSize = '1.25rem';
    } else if (larguraTela <= 768) {
      titulo.style.fontSize = '1.5rem';
    } else if (larguraTela <= 1024) {
      titulo.style.fontSize = '1.75rem';
    } else {
      titulo.style.fontSize = '1.875rem';
    }
  });
  
  const titulos2xl = document.querySelectorAll('.text-2xl');
  titulos2xl.forEach(titulo => {
    if (larguraTela <= 480) {
      titulo.style.fontSize = '1.125rem';
    } else if (larguraTela <= 768) {
      titulo.style.fontSize = '1.25rem';
    } else if (larguraTela <= 1024) {
      titulo.style.fontSize = '1.5rem';
    } else {
      titulo.style.fontSize = '1.5rem';
    }
  });
  
  // Ajustar botões
  const botoes = document.querySelectorAll('button');
  botoes.forEach(botao => {
    if (larguraTela <= 480) {
      botao.style.padding = '6px 8px';
      botao.style.fontSize = '0.75rem';
    } else if (larguraTela <= 768) {
      botao.style.padding = '8px 12px';
      botao.style.fontSize = '0.875rem';
    } else {
      botao.style.padding = '12px 16px';
      botao.style.fontSize = '1rem';
    }
  });
  
  // Ajustar tabelas
  const tabelasContainer = document.querySelectorAll('.overflow-x-auto');
  tabelasContainer.forEach(container => {
    if (larguraTela <= 768) {
      container.style.overflowX = 'auto';
      container.style.webkitOverflowScrolling = 'touch';
    }
  });
  
  // Ajustar max-width containers
  const maxWidthContainers = document.querySelectorAll('.max-w-2xl, .max-w-4xl');
  maxWidthContainers.forEach(container => {
    if (larguraTela <= 768) {
      container.style.maxWidth = '100%';
      container.style.margin = '0';
    }
  });
  
  // Ajustar flex containers
  const flexContainers = document.querySelectorAll('.flex');
  flexContainers.forEach(container => {
    if (larguraTela <= 768 && container.classList.contains('sm:flex-row')) {
      container.style.flexDirection = 'column';
    }
  });
}

// Função para observar mudanças no DOM e aplicar responsividade
function observarMudancasDOM() {
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        // Aguardar um pouco para que o DOM seja totalmente renderizado
        setTimeout(ajustarElementosDinamicos, 100);
      }
    });
  });
  
  // Observar mudanças no elemento #content
  const contentElement = document.getElementById('content');
  if (contentElement) {
    observer.observe(contentElement, {
      childList: true,
      subtree: true
    });
  }
  
  // Observar mudanças no body também
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Aplicar responsividade quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
  aplicarResponsividade();
  observarMudancasDOM();
});

// Aplicar responsividade quando a janela for redimensionada
window.addEventListener('resize', function() {
  aplicarResponsividade();
});

// Aplicar responsividade quando o conteúdo for carregado dinamicamente
document.addEventListener('click', function(e) {
  // Se o clique foi em um link de navegação, aguardar e aplicar responsividade
  if (e.target.closest('nav a')) {
    setTimeout(ajustarElementosDinamicos, 200);
  }
});

// Função específica para calendário
function ajustarCalendario() {
  const larguraTela = window.innerWidth;
  
  if (larguraTela <= 768) {
    // Aguardar o calendário ser renderizado
    setTimeout(() => {
      const toolbar = document.querySelector('.fc-toolbar');
      if (toolbar) {
        toolbar.style.flexDirection = 'column';
        toolbar.style.gap = '8px';
      }
      
      const toolbarChunks = document.querySelectorAll('.fc-toolbar-chunk');
      toolbarChunks.forEach(chunk => {
        chunk.style.display = 'flex';
        chunk.style.justifyContent = 'center';
        chunk.style.flexWrap = 'wrap';
      });
      
      const buttons = document.querySelectorAll('.fc-button');
      buttons.forEach(button => {
        button.style.padding = '4px 8px';
        button.style.fontSize = '0.875rem';
      });
    }, 500);
  }
}

// Interceptar carregamento do calendário
const originalCarregarCalendario = window.carregarCalendario;
if (typeof originalCarregarCalendario === 'function') {
  window.carregarCalendario = function() {
    originalCarregarCalendario.apply(this, arguments);
    ajustarCalendario();
  };
}

// Aplicar estilos CSS adicionais via JavaScript
function aplicarEstilosAdicionais() {
  const style = document.createElement('style');
  style.textContent = `
    /* Estilos adicionais para garantir responsividade */
    @media (max-width: 768px) {
      .flex.h-screen {
        flex-direction: column !important;
        height: auto !important;
      }
      
      aside.w-72 {
        width: 100% !important;
        min-width: 100% !important;
        height: auto !important;
        order: 1 !important;
      }
      
      .flex-1.flex.flex-col {
        width: 100% !important;
        max-width: 100% !important;
        order: 2 !important;
      }
      
      nav ul.space-y-2 {
        display: flex !important;
        flex-wrap: wrap !important;
        gap: 8px !important;
        justify-content: center !important;
      }
      
      nav ul.space-y-2 li {
        margin: 0 !important;
        flex: 1 !important;
        min-width: 120px !important;
      }
      
      nav ul.space-y-2 li a {
        padding: 8px 12px !important;
        font-size: 0.875rem !important;
        text-align: center !important;
        justify-content: center !important;
      }
    }
    
    @media (max-width: 480px) {
      nav ul.space-y-2 li {
        min-width: 100px !important;
      }
      
      nav ul.space-y-2 li a {
        padding: 6px 8px !important;
        font-size: 0.75rem !important;
      }
    }
  `;
  document.head.appendChild(style);
}

// Aplicar estilos adicionais quando a página carregar
document.addEventListener('DOMContentLoaded', aplicarEstilosAdicionais);

