const SVG_MENSAGEM = '<path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/>';

function skeletonMensagem(n = 3) {
    return Array.from({ length: n }, () => `
        <div class="msg-card">
            <span class="skeleton" style="height:14px;width:85%;margin-bottom:8px;"></span>
            <span class="skeleton" style="height:14px;width:60%;margin-bottom:8px;"></span>
            <span class="skeleton" style="height:10px;width:35%;"></span>
        </div>
    `).join('');
}

async function carregarMural() {
    const lista = document.getElementById('listaMensagens');
    lista.innerHTML = skeletonMensagem(3);
    try {
        const msgs = await apiFetch('/mural');
        if (!msgs?.length) {
            lista.innerHTML = emptyState(SVG_MENSAGEM, 'Nenhuma mensagem ainda', 'Seja o primeiro a compartilhar algo com a comunidade!');
            return;
        }
        lista.innerHTML = msgs.map((m, i) => `
            <div class="msg-card" style="animation:cardEnter 0.3s ease both;animation-delay:${i*0.05}s;">
                ${_isAdmin ? `<button class="btn-apagar-msg" onclick="apagarMensagem(${m.id}, this)" title="Apagar mensagem">✕</button>` : ''}
                <p>${escapeHtml(m.conteudo)}</p>
                <small>${tempoRelativo(m.created_at)}</small>
            </div>
        `).join('');
        const badge = document.getElementById('muralBadge');
        const navMural = document.getElementById('navMural');
        if (badge && !navMural.classList.contains('active')) {
            badge.textContent = msgs.length > 99 ? '99+' : msgs.length;
            badge.classList.add('visivel');
        }
    } catch {
        lista.innerHTML = '<div class="loading">Erro ao carregar mensagens.</div>';
    }
}

async function apagarMensagem(id, btn) {
    btn.disabled = true;
    try {
        await apiFetch(`/mural/${id}`, { method: 'DELETE' });
        btn.closest('.msg-card').style.animation = 'toastOut 0.25s ease forwards';
        setTimeout(() => btn.closest('.msg-card').remove(), 250);
    } catch (e) {
        mostrarToast('Erro ao apagar: ' + e.message, 'erro');
        btn.disabled = false;
    }
}

async function postarMensagem() {
    ocultar('erroMural');
    const txt = document.getElementById('txtMensagem');
    const conteudo = txt.value.trim();

    if (conteudo.length < 5) {
        mostrar('erroMural', 'Mensagem muito curta (mínimo 5 caracteres).', 'erro'); return;
    }

    const btn = document.getElementById('btnPostar');
    btn.disabled = true; btn.textContent = 'Publicando...';

    try {
        await apiFetch('/mural', { method: 'POST', body: JSON.stringify({ conteudo }) });
        txt.value = '';
        atualizarContadorMural();
        mostrarToast('Mensagem publicada! 🎉', 'sucesso');
        carregarMural();
    } catch (e) {
        mostrar('erroMural', e.message, 'erro');
    } finally {
        btn.disabled = false; btn.textContent = 'Publicar anonimamente';
    }
}

function atualizarContadorMural() {
    const txt = document.getElementById('txtMensagem');
    const n = txt.value.length;
    const contador = document.getElementById('contadorMural');
    contador.textContent = `${n} / 500`;
    contador.style.color = n > 450 ? '#e74c3c' : 'var(--muted)';
}
