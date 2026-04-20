const SVG_ARTIGO = '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>';

const categoriaLabel = {
    inteligencia_emocional: 'Inteligência Emocional',
    comunicacao: 'Comunicação',
    postura_profissional: 'Postura Profissional',
    saude_mental: 'Saúde Mental',
};

let _categoriaAtiva = '';

function skeletonArtigo(n = 3) {
    return Array.from({ length: n }, () => `
        <div class="artigo-card" style="pointer-events:none;">
            <div class="artigo-meta">
                <span class="skeleton" style="height:18px;width:100px;border-radius:20px;"></span>
            </div>
            <span class="skeleton" style="height:15px;width:75%;margin-bottom:8px;"></span>
            <span class="skeleton" style="height:12px;width:90%;margin-bottom:4px;"></span>
            <span class="skeleton" style="height:12px;width:65%;"></span>
        </div>
    `).join('');
}

function filtrarCategoria(btn, categoria) {
    document.querySelectorAll('.btn-categoria').forEach(b => b.classList.remove('ativo'));
    btn.classList.add('ativo');
    _categoriaAtiva = categoria;
    carregarArtigos();
}

async function carregarArtigos() {
    const lista = document.getElementById('listaArtigos');
    lista.innerHTML = skeletonArtigo(3);
    try {
        const qs = _categoriaAtiva ? `?categoria=${_categoriaAtiva}` : '';
        const artigos = await apiFetch('/artigos' + qs);
        if (!artigos?.length) {
            lista.innerHTML = emptyState(SVG_ARTIGO, 'Nenhum artigo aqui', 'Tente selecionar outra categoria.');
            return;
        }
        lista.innerHTML = artigos.map((a, i) => `
            <div class="artigo-card" onclick="toggleArtigo(this)" style="animation:cardEnter 0.3s ease both;animation-delay:${i*0.06}s;">
                <div class="artigo-meta">
                    <span class="tag">${escapeHtml(categoriaLabel[a.categoria] || a.categoria)}</span>
                    ${a.tempo_leitura ? `<span class="tag tag-cinza">⏱ ${a.tempo_leitura} min</span>` : ''}
                </div>
                <h4>${escapeHtml(a.titulo)}</h4>
                <p class="resumo">${escapeHtml(a.resumo)}</p>
                <div class="artigo-body">${marked.parse(a.conteudo)}</div>
            </div>
        `).join('');
    } catch {
        lista.innerHTML = '<div class="loading">Erro ao carregar artigos.</div>';
    }
}

function toggleArtigo(card) {
    card.querySelector('.artigo-body').classList.toggle('aberto');
}

async function carregarDicaDia() {
    try {
        const artigos = await apiFetch('/artigos');
        if (artigos?.length) {
            document.getElementById('dicaResumo').textContent = artigos[0].resumo;
        }
    } catch {
        document.getElementById('dicaResumo').textContent =
            'Confira as trilhas de soft skills para crescer profissionalmente.';
    }
}
