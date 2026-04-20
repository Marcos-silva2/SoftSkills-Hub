const CAT_LABEL = {
    inteligencia_emocional: 'Int. Emocional',
    comunicacao:            'Comunicação',
    postura_profissional:   'Postura Profissional',
    saude_mental:           'Saúde Mental',
};

let _artigosFiltro = '';

async function carregarTrilhas() {
    const container = document.getElementById('listaTrilhas');
    container.innerHTML = '<div class="loading" style="padding:30px 20px;text-align:center;">Carregando...</div>';
    try {
        const q = _artigosFiltro ? `?categoria=${_artigosFiltro}` : '';
        const artigos = await apiFetch('/artigos' + q);
        if (!artigos.length) {
            container.innerHTML = emptyState(
                '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
                'Nenhum artigo encontrado',
                'Clique em "+ Novo artigo" para criar o primeiro.'
            );
            return;
        }
        container.innerHTML = artigos.map(a => `
            <div class="card" style="padding:0;overflow:hidden;">
                <div class="artigo-item" style="border:none;margin:0;border-radius:0;">
                    <div class="artigo-item-titulo">
                        ${escapeHtml(a.titulo)}
                        <span class="cat-badge cat-${a.categoria}">${CAT_LABEL[a.categoria] || a.categoria}</span>
                    </div>
                    <div class="artigo-item-meta">${escapeHtml(a.resumo)}</div>
                    <div class="artigo-item-meta" style="margin-top:4px;">
                        ${a.tempo_leitura ? `⏱ ${a.tempo_leitura} min · ` : ''}
                        📅 ${new Date(a.created_at).toLocaleDateString('pt-BR')}
                    </div>
                    <div class="artigo-item-acoes">
                        <button class="btn-artigo btn-artigo-editar" onclick='abrirModalArtigo(${JSON.stringify(a)})'>✏️ Editar</button>
                        <button class="btn-artigo btn-artigo-apagar" onclick="confirmarApagarArtigo(${a.id}, '${escapeHtml(a.titulo).replace(/'/g,"\\'")}')">🗑️ Apagar</button>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (e) {
        container.innerHTML = `<div class="loading" style="padding:20px;text-align:center;">Erro: ${e.message}</div>`;
    }
}

function filtrarTrilhas(cat) {
    _artigosFiltro = cat;
    document.querySelectorAll('#filtroCatTrilhas button').forEach(btn => {
        btn.style.opacity = btn.dataset.cat === cat ? '1' : '0.55';
    });
    carregarTrilhas();
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

    if (!titulo)   { erroEl.textContent = 'Informe o título.';    erroEl.style.display = 'block'; return; }
    if (!resumo)   { erroEl.textContent = 'Informe o resumo.';    erroEl.style.display = 'block'; return; }
    if (!conteudo) { erroEl.textContent = 'Informe o conteúdo.';  erroEl.style.display = 'block'; return; }

    const payload = { titulo, resumo, conteudo, categoria: cat };
    if (tempo) payload.tempo_leitura = parseInt(tempo);

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
    }
}

async function confirmarApagarArtigo(id, titulo) {
    if (!confirm(`Apagar o artigo "${titulo}"? Essa ação não pode ser desfeita.`)) return;
    try {
        await apiFetch(`/artigos/${id}`, { method: 'DELETE' });
        mostrarToast('🗑️ Artigo removido.', 'info');
        carregarTrilhas();
    } catch (e) {
        mostrarToast(`Erro: ${e.message}`, 'erro');
    }
}
