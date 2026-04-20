async function carregarPerfilGestor() {
    try {
        const p = await apiFetch('/auth/gestor/me');
        document.getElementById('perfilGestorNome').textContent = p.nome || p.username;
        document.getElementById('perfilGestorUser').textContent = `@${p.username}`;
        document.getElementById('gestorNovoNome').placeholder = p.nome || 'Nome de exibição';
    } catch { /* silencioso */ }
}

function mostrarAlertaGestor(id, msg, tipo) {
    const el = document.getElementById(id);
    el.textContent = msg; el.className = `alerta-g ${tipo}`; el.style.display = 'block';
}

async function salvarNomeGestor() {
    const novoNome  = document.getElementById('gestorNovoNome').value.trim();
    const senhaAtual = document.getElementById('gestorSenhaNome').value;
    document.getElementById('erroNomeGestor').style.display = 'none';

    if (!novoNome)   { mostrarAlertaGestor('erroNomeGestor', 'Informe o novo nome.', 'erro'); return; }
    if (!senhaAtual) { mostrarAlertaGestor('erroNomeGestor', 'Confirme sua senha atual.', 'erro'); return; }

    try {
        await apiFetch('/auth/gestor/perfil', {
            method: 'PUT',
            body: JSON.stringify({ nome: novoNome, senha_atual: senhaAtual }),
        });
        localStorage.setItem('ssh_gestor', novoNome);
        document.getElementById('saudacaoGestor').textContent = `Olá, ${novoNome}!`;
        document.getElementById('perfilGestorNome').textContent = novoNome;
        document.getElementById('gestorNovoNome').value = '';
        document.getElementById('gestorSenhaNome').value = '';
        mostrarToast('✅ Nome atualizado com sucesso!', 'sucesso');
    } catch (e) {
        mostrarAlertaGestor('erroNomeGestor', e.message, 'erro');
    }
}

async function salvarSenhaGestor() {
    const senhaAtual    = document.getElementById('gestorSenhaAtual').value;
    const novaSenha     = document.getElementById('gestorNovaSenha').value;
    const confirmaSenha = document.getElementById('gestorConfirmaSenha').value;
    document.getElementById('erroSenhaGestor').style.display = 'none';

    if (!senhaAtual) { mostrarAlertaGestor('erroSenhaGestor', 'Informe sua senha atual.', 'erro'); return; }
    if (!novaSenha)  { mostrarAlertaGestor('erroSenhaGestor', 'Informe a nova senha.', 'erro'); return; }
    if (novaSenha.length < 6) { mostrarAlertaGestor('erroSenhaGestor', 'Nova senha deve ter ao menos 6 caracteres.', 'erro'); return; }
    if (novaSenha !== confirmaSenha) { mostrarAlertaGestor('erroSenhaGestor', 'As senhas não coincidem.', 'erro'); return; }

    try {
        await apiFetch('/auth/gestor/perfil', {
            method: 'PUT',
            body: JSON.stringify({ senha_atual: senhaAtual, nova_senha: novaSenha }),
        });
        document.getElementById('gestorSenhaAtual').value = '';
        document.getElementById('gestorNovaSenha').value = '';
        document.getElementById('gestorConfirmaSenha').value = '';
        mostrarToast('✅ Senha alterada com sucesso!', 'sucesso');
    } catch (e) {
        mostrarAlertaGestor('erroSenhaGestor', e.message, 'erro');
    }
}
