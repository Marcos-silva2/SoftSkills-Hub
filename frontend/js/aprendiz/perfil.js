const LABEL_GENERO_PERFIL = {
    feminino: 'Feminino', masculino: 'Masculino',
    prefiro_nao_dizer: 'Pref. não dizer',
};

function skeletonPerfilRow(n = 3) {
    return Array.from({ length: n }, () => `
        <div class="perfil-info-row">
            <span class="skeleton" style="height:13px;width:80px;"></span>
            <span class="skeleton" style="height:13px;width:110px;"></span>
        </div>
    `).join('');
}

async function carregarPerfil() {
    document.getElementById('perfilInfos').innerHTML = skeletonPerfilRow(3);
    try {
        const p = await apiFetch('/auth/aprendiz/me');
        document.getElementById('perfilNome').textContent = p.username;
        document.getElementById('perfilNovoUsername').placeholder = p.username;
        const desde = new Date(p.created_at).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
        document.getElementById('perfilDesde').textContent = desde;
        const generoLabel = LABEL_GENERO_PERFIL[p.genero] || p.genero || '—';
        const faixaLabel  = p.faixa_etaria ? p.faixa_etaria + ' anos' : '—';
        const diasMembro  = Math.floor((Date.now() - new Date(p.created_at).getTime()) / 86400000);
        const tempoAqui   = diasMembro === 0 ? 'Hoje mesmo! 🎉' : diasMembro === 1 ? '1 dia' : `${diasMembro} dias`;
        document.getElementById('perfilInfos').innerHTML = `
            <div class="perfil-info-row">
                <span class="label">Usuário</span>
                <span class="valor">${escapeHtml(p.username)}</span>
            </div>
            <div class="perfil-info-row">
                <span class="label">Gênero</span>
                <span class="valor"><span class="badge-roxo">${escapeHtml(generoLabel)}</span></span>
            </div>
            <div class="perfil-info-row">
                <span class="label">Faixa etária</span>
                <span class="valor"><span class="badge-verde-perfil">${escapeHtml(faixaLabel)}</span></span>
            </div>
            <div class="perfil-info-row">
                <span class="label">Tempo aqui</span>
                <span class="valor"><span class="badge-verde-perfil">🗓 ${escapeHtml(tempoAqui)}</span></span>
            </div>`;
    } catch { /* mantém o que foi carregado no init */ }
}

async function salvarUsername() {
    const novoUsername = document.getElementById('perfilNovoUsername').value.trim();
    const senhaAtual   = document.getElementById('perfilSenhaUsername').value;
    const erroEl   = document.getElementById('erroUsername');
    const sucessoEl = document.getElementById('sucessoUsername');
    erroEl.style.display = 'none';
    if (sucessoEl) sucessoEl.style.display = 'none';

    if (!novoUsername) { erroEl.textContent = 'Informe o novo nome de usuário.'; erroEl.style.display = 'block'; return; }
    if (!senhaAtual)   { erroEl.textContent = 'Confirme sua senha atual.'; erroEl.style.display = 'block'; return; }

    try {
        await apiFetch('/auth/aprendiz/perfil', {
            method: 'PUT',
            body: JSON.stringify({ novo_username: novoUsername, senha_atual: senhaAtual }),
        });
        localStorage.setItem('ssh_username', novoUsername);
        document.getElementById('saudacao').textContent = `Olá, ${novoUsername}!`;
        document.getElementById('perfilNome').textContent = novoUsername;
        document.getElementById('perfilNovoUsername').value = '';
        document.getElementById('perfilSenhaUsername').value = '';
        animarBotaoSucesso(document.querySelector('[onclick="salvarUsername()"]'));
        vibrar([30]);
        mostrarToast('Nome atualizado com sucesso!', 'sucesso');
        carregarPerfil();
    } catch (e) {
        erroEl.textContent = e.message;
        erroEl.style.display = 'block';
        adicionarShake(erroEl); vibrar([30, 15, 30]);
    }
}

async function salvarSenha() {
    const senhaAtual    = document.getElementById('perfilSenhaAtual').value;
    const novaSenha     = document.getElementById('perfilNovaSenha').value;
    const confirmaSenha = document.getElementById('perfilConfirmaSenha').value;
    const erroEl    = document.getElementById('erroSenha');
    erroEl.style.display = 'none';

    if (!senhaAtual)  { erroEl.textContent = 'Informe sua senha atual.'; erroEl.style.display = 'block'; return; }
    if (!novaSenha)   { erroEl.textContent = 'Informe a nova senha.'; erroEl.style.display = 'block'; return; }
    if (novaSenha.length < 6) { erroEl.textContent = 'Nova senha deve ter ao menos 6 caracteres.'; erroEl.style.display = 'block'; return; }
    if (novaSenha !== confirmaSenha) { erroEl.textContent = 'As senhas não coincidem.'; erroEl.style.display = 'block'; return; }

    try {
        await apiFetch('/auth/aprendiz/perfil', {
            method: 'PUT',
            body: JSON.stringify({ senha_atual: senhaAtual, nova_senha: novaSenha }),
        });
        document.getElementById('perfilSenhaAtual').value = '';
        document.getElementById('perfilNovaSenha').value = '';
        document.getElementById('perfilConfirmaSenha').value = '';
        animarBotaoSucesso(document.querySelector('[onclick="salvarSenha()"]'));
        vibrar([30]);
        mostrarToast('Senha alterada com sucesso!', 'sucesso');
    } catch (e) {
        erroEl.textContent = e.message;
        erroEl.style.display = 'block';
        adicionarShake(erroEl); vibrar([30, 15, 30]);
    }
}
