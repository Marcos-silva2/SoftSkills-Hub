const CAT_LABEL = {
    inteligencia_emocional: 'Int. Emocional',
    comunicacao:            'Comunicação',
    postura_profissional:   'Postura Profissional',
    saude_mental:           'Saúde Mental',
};

let _artigosFiltro = '';
let _todosArtigos  = []; // artigos em memória — evita JSON.stringify no onclick

// ── Listagem ──────────────────────────────────────────────────────

async function carregarTrilhas() {
    const container = document.getElementById('listaTrilhas');
    container.innerHTML = '<div class="loading" style="padding:30px 20px;text-align:center;">Carregando...</div>';
    try {
        const q = _artigosFiltro ? `?categoria=${_artigosFiltro}` : '';
        _todosArtigos = await apiFetch('/artigos' + q);

        if (!_todosArtigos.length) {
            container.innerHTML = emptyState(
                '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
                'Nenhum artigo encontrado',
                'Clique em "+ Novo artigo" para criar o primeiro.'
            );
            return;
        }

        container.innerHTML = _todosArtigos.map(a => _renderCard(a)).join('');

        if (typeof animarListaComScroll === 'function') {
            animarListaComScroll(container, '.artigo-admin-card');
        }
    } catch (e) {
        container.innerHTML = `<div class="loading" style="padding:20px;text-align:center;color:#e74c3c;">Erro: ${escapeHtml(e.message)}</div>`;
    }
}

function _renderCard(a) {
    const data = new Date(a.created_at).toLocaleDateString('pt-BR');
    const tempo = a.tempo_leitura ? `<span class="artigo-admin-tempo">⏱ ${a.tempo_leitura} min</span>` : '';
    return `
        <div class="artigo-admin-card cat-borda-${a.categoria}">
            <div class="artigo-admin-topo">
                <span class="cat-badge cat-${a.categoria}">${CAT_LABEL[a.categoria] || a.categoria}</span>
                ${tempo}
            </div>
            <h4 class="artigo-admin-titulo">${escapeHtml(a.titulo)}</h4>
            <p class="artigo-admin-resumo">${escapeHtml(a.resumo)}</p>
            <div class="artigo-admin-rodape">
                <span class="artigo-admin-data">📅 ${data}</span>
                <div class="artigo-admin-acoes">
                    <button class="btn-artigo-ico btn-editar-ico" onclick="editarArtigo(${a.id})" aria-label="Editar artigo">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        Editar
                    </button>
                    <button class="btn-artigo-ico btn-apagar-ico" onclick="confirmarApagarArtigo(${a.id}, this)" aria-label="Apagar artigo">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                        Apagar
                    </button>
                </div>
            </div>
        </div>`;
}

// ── Filtros ───────────────────────────────────────────────────────

function filtrarTrilhas(cat) {
    _artigosFiltro = cat;
    document.querySelectorAll('#filtroCatTrilhas button').forEach(btn => {
        btn.classList.toggle('ativo', btn.dataset.cat === cat);
    });
    carregarTrilhas();
}

// ── Modal criar/editar ────────────────────────────────────────────

function editarArtigo(id) {
    // Busca da memória — evita passar JSON na string do onclick
    const artigo = _todosArtigos.find(a => a.id === id);
    if (artigo) abrirModalArtigo(artigo);
}

function abrirModalArtigo(artigo = null) {
    document.getElementById('erroModalArtigo').style.display = 'none';

    if (artigo) {
        document.getElementById('modalArtigoTitulo').textContent = 'Editar artigo';
        document.getElementById('modalArtigoId').value    = artigo.id;
        document.getElementById('artigoTitulo').value     = artigo.titulo;
        document.getElementById('artigoResumo').value     = artigo.resumo;
        document.getElementById('artigoCategoria').value  = artigo.categoria;
        document.getElementById('artigoTempo').value      = artigo.tempo_leitura || '';
        document.getElementById('artigoConteudo').value   = artigo.conteudo;
    } else {
        document.getElementById('modalArtigoTitulo').textContent = 'Novo artigo';
        document.getElementById('modalArtigoId').value    = '';
        document.getElementById('artigoTitulo').value     = '';
        document.getElementById('artigoResumo').value     = '';
        document.getElementById('artigoCategoria').value  = 'inteligencia_emocional';
        document.getElementById('artigoTempo').value      = '';
        document.getElementById('artigoConteudo').value   = '';
    }

    document.getElementById('modalArtigo').classList.add('aberto');
}

function fecharModalArtigo() {
    document.getElementById('modalArtigo').classList.remove('aberto');
}

function fecharModalSeClicouFora(e) {
    if (e.target === document.getElementById('modalArtigo')) fecharModalArtigo();
}

async function salvarArtigo() {
    const id       = document.getElementById('modalArtigoId').value;
    const titulo   = document.getElementById('artigoTitulo').value.trim();
    const resumo   = document.getElementById('artigoResumo').value.trim();
    const cat      = document.getElementById('artigoCategoria').value;
    const tempo    = document.getElementById('artigoTempo').value;
    const conteudo = document.getElementById('artigoConteudo').value.trim();
    const erroEl   = document.getElementById('erroModalArtigo');
    erroEl.style.display = 'none';

    if (!titulo)   { erroEl.textContent = 'Informe o título.';   erroEl.style.display = 'block'; return; }
    if (!resumo)   { erroEl.textContent = 'Informe o resumo.';   erroEl.style.display = 'block'; return; }
    if (!conteudo) { erroEl.textContent = 'Informe o conteúdo.'; erroEl.style.display = 'block'; return; }

    const payload = { titulo, resumo, conteudo, categoria: cat };
    if (tempo) payload.tempo_leitura = parseInt(tempo);

    const btnSalvar = document.querySelector('.btn-modal-salvar');
    btnSalvar.disabled = true;
    btnSalvar.textContent = 'Salvando...';

    try {
        if (id) {
            await apiFetch(`/artigos/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
            mostrarToast('✅ Artigo atualizado!', 'sucesso');
        } else {
            await apiFetch('/artigos', { method: 'POST', body: JSON.stringify(payload) });
            mostrarToast('✅ Artigo criado!', 'sucesso');
        }
        fecharModalArtigo();
        carregarTrilhas();
    } catch (e) {
        erroEl.textContent = e.message;
        erroEl.style.display = 'block';
    } finally {
        btnSalvar.disabled = false;
        btnSalvar.textContent = 'Salvar artigo';
    }
}

// ── Apagar ────────────────────────────────────────────────────────

async function confirmarApagarArtigo(id, btnEl) {
    const artigo = _todosArtigos.find(a => a.id === id);
    const titulo = artigo ? artigo.titulo : 'este artigo';
    if (!confirm(`Apagar "${titulo}"? Essa ação não pode ser desfeita.`)) return;

    btnEl.disabled = true;
    try {
        await apiFetch(`/artigos/${id}`, { method: 'DELETE' });
        mostrarToast('🗑️ Artigo removido.', 'info');
        carregarTrilhas();
    } catch (e) {
        mostrarToast(`Erro: ${e.message}`, 'erro');
        btnEl.disabled = false;
    }
}
