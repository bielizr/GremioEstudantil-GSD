document.getElementById('login-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    try {
        const response = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            alert('Credenciais inválidas.');
            return;
        }

        const data = await response.json();

        // Redirecionar conforme papel do usuário
        if (data.user.role === 'presidente') {
            window.location.href = '/presidente/index_presidente.html';
        } else if (data.user.role === 'coordenador') {
            window.location.href = '/coordenador/index_coordenador.html';
        } else if (data.user.role === 'membro') {
            window.location.href = '/membro/index_membro.html';
        } else {
            alert('Perfil de usuário desconhecido.');
        }

    } catch (err) {
        console.error(err);
        alert('Erro ao conectar ao servidor.');
    }
});