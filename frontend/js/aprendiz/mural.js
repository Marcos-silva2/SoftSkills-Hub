const SVG_MENSAGEM = '<path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/>';
const _MURAL_LIMIT = 20;
let _muralSkip = 0;
let _muralTotal = 0;

function skeletonMensagem(n = 3) {
    return Array.from({ length: n }, () => `
        <div class="msg-card">
            <span class="skeleton" style="height:14px;width:85%;margin-bottom:8px;"></span>
            <span class="skeleton" style="height:14px;width:60%;margin-bottom:8px;"></span>
            <span class="skeleton" style="height:10px;width:35%;"></span>
        </div>
    `).join('');
}

function _renderMsgs(msgs, startIndex = 0) {
    return msgs.map((m, i) => `
        <div class="msg-card" style="animation:cardEnter 0.3s ease both;animation-delay:${(startIndex + i) * 0.05}s;">
            ${_isAdmin ? `<button class="btn-apagar-msg" onclick="apagarMensagem(${m.id}, this)" title="Apagar mensagem">✕</button>` : ''}
            <p>${escapeHtml(m.conteudo)}</p>
            <small>${tempoRelativo(m.created_at)}</small>
        </div>
    `).join('');
}

function _atualizarBtnCarregarMais(lista) {
    const btn = document.getElementById('btnCarregarMaisMural');
    const restantes = _muralTotal - _muralSkip;
    if (restantes > 0) {
        if (btn) {
            btn.textContent = `Carregar mais (${restantes} restantes)`;
        } else {
            const novo = document.createElement('button');
            novo.id = 'btnCarregarMaisMural';
            novo.className = 'btn-filtrar';
            novo.style.cssText = 'width:auto;margin:8px 20px 0;padding:8px 16px;font-size:0.82rem;';
            novo.textContent = `Carregar mais (${restantes} restantes)`;
            novo.onclick = carregarMaisMural;
            lista.insertAdjacentElement('afterend', novo);
        }
    } else if (btn) {
        btn.remove();
    }
}

async function carregarMural() {
    _muralSkip = 0;
    const lista = document.getElementById('listaMensagens');
    lista.innerHTML = skeletonMensagem(3);
    const btnExistente = document.getElementById('btnCarregarMaisMural');
    if (btnExistente) btnExistente.remove();

    try {
        const { data: msgs, total } = await apiFetchComTotal(`/mural?skip=0&limit=${_MURAL_LIMIT}`);
        _muralTotal = total;
        _muralSkip = msgs.length;

        if (!msgs?.length) {
            lista.innerHTML = emptyState(SVG_MENSAGEM, 'Nenhuma mensagem ainda', 'Seja o primeiro a compartilhar algo com a comunidade!');
            return;
        }
        lista.innerHTML = _renderMsgs(msgs);

        const badge = document.getElementById('muralBadge');
        const navMural = document.getElementById('navMural');
        if (badge && !navMural.classList.contains('active')) {
            badge.textContent = total > 99 ? '99+' : total;
            badge.classList.add('visivel');
        }

        _atualizarBtnCarregarMais(lista);
    } catch {
        lista.innerHTML = '<div class="loading">Erro ao carregar mensagens.</div>';
    }
}

async function carregarMaisMural() {
    const btn = document.getElementById('btnCarregarMaisMural');
    if (btn) { btn.disabled = true; btn.textContent = 'Carregando...'; }

    try {
        const { data: msgs } = await apiFetchComTotal(`/mural?skip=${_muralSkip}&limit=${_MURAL_LIMIT}`);
        const lista = document.getElementById('listaMensagens');
        lista.insertAdjacentHTML('beforeend', _renderMsgs(msgs, _muralSkip));
        _muralSkip += msgs.length;
        _atualizarBtnCarregarMais(lista);
    } catch (e) {
        mostrarToast('Erro ao carregar: ' + e.message, 'erro');
        if (btn) { btn.disabled = false; btn.textContent = `Carregar mais (${_muralTotal - _muralSkip} restantes)`; }
    }
}

async function apagarMensagem(id, btn) {
    btn.disabled = true;
    try {
        await apiFetch(`/mural/${id}`, { method: 'DELETE' });
        btn.closest('.msg-card').style.animation = 'toastOut 0.25s ease forwards';
        setTimeout(() => btn.closest('.msg-card').remove(), 250);
        _muralTotal = Math.max(0, _muralTotal - 1);
        _muralSkip = Math.max(0, _muralSkip - 1);
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
