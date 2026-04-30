const SVG_ARTIGO = '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>';

const categoriaLabel = {
    inteligencia_emocional: 'Inteligência Emocional',
    comunicacao: 'Comunicação',
    postura_profissional: 'Postura Profissional',
    saude_mental: 'Saúde Mental',
};

let _categoriaAtiva = '';
let _filtroEspecial = '';
let _artigos        = [];
let _artigoAtual    = null;
let _queryBusca     = '';
let _buscaTimer     = null;

if (typeof marked !== 'undefined') {
    marked.use({ breaks: true, gfm: true });
}

// ── localStorage ───────────────────────────────────────────
const _KEY_FAV  = 'ssh_favoritos';
const _KEY_LIDO = 'ssh_lidos';

function _getFavoritos() {
    try { return new Set(JSON.parse(localStorage.getItem(_KEY_FAV)  || '[]')); } catch { return new Set(); }
}
function _getLidos() {
    try { return new Set(JSON.parse(localStorage.getItem(_KEY_LIDO) || '[]')); } catch { return new Set(); }
}
function _salvarFavoritos(set) { localStorage.setItem(_KEY_FAV,  JSON.stringify([...set])); }
function _salvarLidos(set)     { localStorage.setItem(_KEY_LIDO, JSON.stringify([...set])); }

// ── Tempo de leitura ───────────────────────────────────────
function _tempoLeitura(a) {
    if (a.tempo_leitura) return a.tempo_leitura;
    return Math.max(1, Math.round(a.conteudo.trim().split(/\s+/).length / 200));
}

// ── Skeleton ───────────────────────────────────────────────
function skeletonArtigo(n = 3) {
    return Array.from({ length: n }, () => `
        <div class="artigo-card" style="pointer-events:none;">
            <div class="artigo-meta">
                <span class="skeleton" style="height:18px;width:100px;border-radius:20px;"></span>
            </div>
            <span class="skeleton" style="height:15px;width:75%;margin-bottom:8px;display:block;"></span>
            <span class="skeleton" style="height:12px;width:90%;margin-bottom:4px;display:block;"></span>
            <span class="skeleton" style="height:12px;width:65%;display:block;"></span>
        </div>
    `).join('');
}

// ── Render de card ─────────────────────────────────────────
function _renderArtigoCard(a, i) {
    const isFav  = _getFavoritos().has(a.id);
    const isLido = _getLidos().has(a.id);
    const tempo  = _tempoLeitura(a);
    return `
        <div class="artigo-card cat-borda-${a.categoria}" style="animation:cardEnter 0.3s ease both;animation-delay:${i * 0.06}s;" onclick="abrirLeitura(${a.id})">
            <div class="artigo-card-header">
                <div class="artigo-meta">
                    <span class="tag">${escapeHtml(categoriaLabel[a.categoria] || a.categoria)}</span>
                    <span class="tag tag-cinza">⏱ ${tempo} min</span>
                    ${isLido ? '<span class="tag tag-lido">✓ Lido</span>' : ''}
                </div>
                <button class="btn-fav${isFav ? ' ativo' : ''}"
                    onclick="toggleFavorito(${a.id}, event)"
                    aria-label="${isFav ? 'Remover favorito' : 'Favoritar'}">${isFav ? '❤️' : '🤍'}</button>
            </div>
            <h4>${escapeHtml(a.titulo)}</h4>
            <p class="resumo">${escapeHtml(a.resumo)}</p>
        </div>`;
}

// ── Filtro e render da lista ───────────────────────────────
function _artigosFiltrados() {
    const favs  = _getFavoritos();
    const lidos = _getLidos();
    let lista   = _artigos;

    if (_categoriaAtiva) lista = lista.filter(a => a.categoria === _categoriaAtiva);
    if (_filtroEspecial === 'favoritos') lista = lista.filter(a => favs.has(a.id));
    if (_filtroEspecial === 'lidos')     lista = lista.filter(a => lidos.has(a.id));
    if (_queryBusca) {
        const q = _queryBusca.toLowerCase();
        lista = lista.filter(a =>
            a.titulo.toLowerCase().includes(q) || a.resumo.toLowerCase().includes(q)
        );
    }
    return lista;
}

function _renderLista() {
    const lista     = document.getElementById('listaArtigos');
    const filtrados = _artigosFiltrados();
    const elTotal   = document.getElementById('totalArtigos');
    if (elTotal) elTotal.textContent = `${filtrados.length} artigo${filtrados.length !== 1 ? 's' : ''}`;

    if (!filtrados.length) {
        lista.innerHTML = emptyState(SVG_ARTIGO, 'Nenhum artigo encontrado', 'Tente outro filtro ou termos de busca.');
        return;
    }
    lista.innerHTML = filtrados.map((a, i) => _renderArtigoCard(a, i)).join('');
    animarListaComScroll(lista, '.artigo-card');
}

// ── Carregamento ───────────────────────────────────────────
async function carregarArtigos(forcar = false) {
    if (_artigos.length && !forcar) { _renderLista(); return; }
    const lista = document.getElementById('listaArtigos');
    lista.innerHTML = skeletonArtigo(3);
    try {
        _artigos = await apiFetch('/artigos');
        _renderLista();
    } catch {
        lista.innerHTML = `
            <div style="text-align:center;padding:36px 20px;">
                <p style="color:var(--muted);font-size:0.88rem;margin-bottom:16px;">
                    Não foi possível carregar os artigos.<br>Verifique sua conexão e tente novamente.
                </p>
                <button class="btn btn-verde" onclick="carregarArtigos(true)">↺ Tentar novamente</button>
            </div>`;
    }
}

// ── Filtros por categoria ──────────────────────────────────
function filtrarCategoria(btn, categoria) {
    document.querySelectorAll('.btn-cat').forEach(b => b.classList.remove('ativo'));
    btn.classList.add('ativo');
    _categoriaAtiva = categoria;
    _renderLista();
}

function filtrarEspecial(btn, tipo) {
    if (_filtroEspecial === tipo) {
        btn.classList.remove('ativo');
        _filtroEspecial = '';
    } else {
        document.querySelectorAll('.btn-filtro-especial').forEach(b => b.classList.remove('ativo'));
        btn.classList.add('ativo');
        _filtroEspecial = tipo;
    }
    _renderLista();
}

// ── Busca ──────────────────────────────────────────────────
function onBuscaArtigos(input) {
    clearTimeout(_buscaTimer);
    _buscaTimer = setTimeout(() => {
        _queryBusca = input.value.trim();
        _renderLista();
    }, 280);
}

// ── Favoritos ──────────────────────────────────────────────
function toggleFavorito(id, event) {
    event.stopPropagation();
    const favs = _getFavoritos();
    if (favs.has(id)) { favs.delete(id); mostrarToast('Removido dos favoritos', 'info', 2000); }
    else              { favs.add(id);    mostrarToast('❤️ Adicionado aos favoritos!', 'sucesso', 2000); }
    _salvarFavoritos(favs);
    _renderLista();
    if (_artigoAtual?.id === id) _atualizarBotoesModal();
}

function toggleFavoritoModal() {
    if (!_artigoAtual) return;
    const favs = _getFavoritos();
    if (favs.has(_artigoAtual.id)) { favs.delete(_artigoAtual.id); mostrarToast('Removido dos favoritos', 'info', 2000); }
    else                           { favs.add(_artigoAtual.id);    mostrarToast('❤️ Adicionado aos favoritos!', 'sucesso', 2000); }
    _salvarFavoritos(favs);
    _atualizarBotoesModal();
    _renderLista();
}

// ── Lidos ──────────────────────────────────────────────────
function _marcarLido(id) {
    const lidos = _getLidos();
    if (!lidos.has(id)) { lidos.add(id); _salvarLidos(lidos); }
}

// ── Surpreenda-me ──────────────────────────────────────────
function surpreendaMe() {
    const pool = _artigosFiltrados().length ? _artigosFiltrados() : _artigos;
    if (!pool.length) { mostrarToast('Nenhum artigo disponível.', 'info'); return; }
    abrirLeitura(pool[Math.floor(Math.random() * pool.length)].id);
    vibrar([15, 10, 15]);
}

// ── Modal de leitura ───────────────────────────────────────
function abrirLeitura(id) {
    _artigoAtual = _artigos.find(a => a.id === id);
    if (!_artigoAtual) return;

    const a = _artigoAtual;
    document.getElementById('leituraMeta').innerHTML =
        `<span class="tag">${escapeHtml(categoriaLabel[a.categoria] || a.categoria)}</span>
         <span class="tag tag-cinza">⏱ ${_tempoLeitura(a)} min</span>`;
    document.getElementById('leituraTitulo').textContent = a.titulo;
    document.getElementById('leituraConteudo').innerHTML = typeof marked !== 'undefined'
        ? marked.parse(a.conteudo)
        : '<pre style="white-space:pre-wrap;font-family:inherit;font-size:0.93rem;line-height:1.85;">'
          + escapeHtml(a.conteudo) + '</pre>';

    const corpo = document.getElementById('leituraCorpo');
    corpo.scrollTop = 0;
    _atualizarProgressoLeitura(0);
    _atualizarBotoesModal();

    document.getElementById('modalLeitura').classList.add('aberto');
    document.body.style.overflow = 'hidden';

    _marcarLido(id);
    setTimeout(() => _renderLista(), 0);
    vibrar([12]);
}

function fecharLeitura() {
    document.getElementById('modalLeitura').classList.remove('aberto');
    document.body.style.overflow = '';
    _artigoAtual = null;
}

function _atualizarBotoesModal() {
    if (!_artigoAtual) return;
    const isFav  = _getFavoritos().has(_artigoAtual.id);
    const btnFav = document.getElementById('btnFavLeitura');
    if (btnFav) {
        btnFav.textContent = isFav ? '❤️' : '🤍';
        btnFav.setAttribute('aria-label', isFav ? 'Remover favorito' : 'Favoritar');
    }
}

// ── Progresso de leitura ───────────────────────────────────
function _atualizarProgressoLeitura(perc) {
    const fill = document.getElementById('leituraProgressFill');
    if (fill) fill.style.width = perc + '%';
}

function onScrollLeitura(el) {
    const max = el.scrollHeight - el.clientHeight;
    if (!max) return;
    _atualizarProgressoLeitura(Math.round((el.scrollTop / max) * 100));
}

// ── Compartilhar ───────────────────────────────────────────
async function compartilharArtigoModal() {
    if (!_artigoAtual) return;
    const texto = `${_artigoAtual.titulo}\n\n${_artigoAtual.resumo}\n\n— via SoftSkills Hub`;
    if (navigator.share) {
        try { await navigator.share({ title: _artigoAtual.titulo, text: texto }); return; }
        catch (e) { if (e.name === 'AbortError') return; }
    }
    try {
        await navigator.clipboard.writeText(texto);
        mostrarToast('Artigo copiado para área de transferência!', 'sucesso', 2500);
    } catch {
        mostrarToast('Não foi possível copiar.', 'erro');
    }
}

// ── ESC fecha modal ────────────────────────────────────────
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') fecharLeitura();
});

// ── Dica do dia ────────────────────────────────────────────
async function carregarDicaDia() {
    try {
        const artigos = _artigos.length ? _artigos : await apiFetch('/artigos');
        if (artigos?.length) {
            const idx = Math.floor(Math.random() * Math.min(artigos.length, 5));
            document.getElementById('dicaResumo').textContent = artigos[idx].resumo;
        }
    } catch {
        document.getElementById('dicaResumo').textContent =
            'Confira as trilhas de soft skills para crescer profissionalmente.';
    }
}
