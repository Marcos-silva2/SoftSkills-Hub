const SVG_EMPRESA = '<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>';

function estrelas(media) {
    const n = Math.round(media);
    const cor = media <= 2 ? '#e74c3c' : media <= 3 ? '#f39c12' : '#27ae60';
    return `<span style="color:${cor}">${'★'.repeat(n)}</span><span style="color:#ccc">${'☆'.repeat(5 - n)}</span>`;
}

function skeletonEmpresa(n = 3) {
    return Array.from({ length: n }, () => `
        <div class="empresa-row">
            <span class="skeleton" style="height:15px;width:55%;display:block;margin-bottom:10px;"></span>
            <span class="skeleton" style="height:12px;width:75%;display:block;margin-bottom:8px;"></span>
            <span class="skeleton" style="height:30px;width:100%;display:block;border-radius:8px;"></span>
        </div>
    `).join('');
}

async function carregarSatisfacaoEmpresas() {
    const lista = document.getElementById('listaEmpresas');
    lista.innerHTML = skeletonEmpresa(3);
    try {
        const ano = document.getElementById('filtroAnoEmpresas').value;
        const q   = ano ? `?ano=${ano}` : '';
        const [dados, efetivacao] = await Promise.all([
            apiFetch('/dashboard/satisfacao-por-empresa' + q),
            apiFetch('/dashboard/efetivacao-por-empresa' + q),
        ]);
        const mapEfet = {};
        efetivacao.forEach(e => { mapEfet[e.empresa] = e; });

        if (!dados.length) { lista.innerHTML = emptyState(SVG_EMPRESA, 'Nenhuma empresa com dados', 'As empresas aparecerão aqui após receberem respostas.'); return; }

        dados.sort((a, b) => b.media_satisfacao - a.media_satisfacao);
        lista.innerHTML = dados.map(e => {
            const ef = mapEfet[e.empresa];
            const ratingCor = e.media_satisfacao >= 4 ? '#27ae60' : e.media_satisfacao >= 3 ? '#f39c12' : '#e74c3c';
            const ratingPct = (e.media_satisfacao / 5 * 100).toFixed(1);
            return `
                <div class="empresa-row">
                    <div class="nome">${escapeHtml(e.empresa)}</div>
                    <div class="detalhe">
                        <span class="estrelas">${estrelas(e.media_satisfacao)}</span>
                        <strong>${e.media_satisfacao.toFixed(1)}</strong>/5
                        · ${e.total_respostas} resposta${e.total_respostas > 1 ? 's' : ''}
                    </div>
                    <div style="height:5px;border-radius:5px;background:#eee;margin:6px 0 2px;overflow:hidden;">
                        <div style="width:${ratingPct}%;height:100%;background:${ratingCor};border-radius:5px;transition:width 0.7s ease;"></div>
                    </div>
                    ${ef ? `<div class="detalhe">Efetivação: ✅ ${ef.sim_perc}% · ❌ ${ef.nao_perc}% · 🤔 ${ef.talvez_perc}%</div>` : ''}
                    <button class="btn-detalhe" onclick="abrirDetalheEmpresa(${e.empresa_id}, '${escapeHtml(e.empresa).replace(/'/g, "\\'")}')">
                        Ver detalhes →
                    </button>
                </div>
            `;
        }).join('');
    } catch (e) {
        lista.innerHTML = `<div class="loading">Erro: ${e.message}</div>`;
    }
}

const LABEL_GENERO = {
    feminino:          '♀ Mulheres',
    masculino:         '♂ Homens',
    prefiro_nao_dizer: '🔒 Pref. não dizer',
};

const LABEL_POSITIVO = {
    aprendizado:     'Boa oportunidade de aprendizado',
    clima_bom:       'Bom clima com a equipe',
    lideranca_apoio: 'Liderança prestativa',
    beneficios:      'Bons benefícios',
    flexibilidade:   'Flexibilidade de horários',
    nenhum_pos:      'Nenhum ponto positivo',
};

const LABEL_NEGATIVO = {
    comunicacao_ruim:     'Falta de comunicação interna',
    desorganizacao:       'Desorganização nos processos',
    clima_tenso:          'Clima organizacional tenso',
    falta_reconhecimento: 'Falta de reconhecimento',
    distancia_lideranca:  'Liderança distante ou ausente',
    nenhum_neg:           'Nenhum ponto negativo',
};

async function abrirDetalheEmpresa(id, nome) {
    document.getElementById('detalheNomeEmpresa').textContent = nome;
    document.getElementById('detalheTotalRespostas').textContent = 'Carregando...';
    ['detalheGeneroLista','detalheProblemasLista','detalhePositivosLista','detalheNegativosLista']
        .forEach(el => document.getElementById(el).innerHTML = '<div class="loading">Carregando...</div>');
    navegarApp('viewDetalheEmpresa');

    try {
        const d = await apiFetch(`/dashboard/empresa/${id}/detalhes`);
        document.getElementById('detalheTotalRespostas').textContent =
            `${d.total_respostas} resposta${d.total_respostas !== 1 ? 's' : ''} registradas`;

        if (!d.efetivacao_genero.length) {
            document.getElementById('detalheGeneroLista').innerHTML = '<div class="loading">Sem dados.</div>';
        } else {
            const totSim    = d.efetivacao_genero.reduce((a,r) => a + r.sim, 0);
            const totTalvez = d.efetivacao_genero.reduce((a,r) => a + r.talvez, 0);
            const totNao    = d.efetivacao_genero.reduce((a,r) => a + r.nao, 0);
            const totGeral  = totSim + totTalvez + totNao;

            const linhas = d.efetivacao_genero
                .sort((a,b) => b.total - a.total)
                .map(g => `
                    <div class="genero-row">
                        <span class="genero-label">${LABEL_GENERO[g.genero] || g.genero}</span>
                        <span class="badge badge-sim">${g.sim}</span>
                        <span class="badge badge-talvez">${g.talvez}</span>
                        <span class="badge badge-nao">${g.nao}</span>
                    </div>
                `).join('');
            const totalRow = `
                <div class="genero-row" style="font-weight:bold;margin-top:6px;border-top:2px solid #eee;padding-top:8px;">
                    <span class="genero-label">Total (${totGeral})</span>
                    <span class="badge badge-sim">${totSim}</span>
                    <span class="badge badge-talvez">${totTalvez}</span>
                    <span class="badge badge-nao">${totNao}</span>
                </div>`;
            document.getElementById('detalheGeneroLista').innerHTML = linhas + totalRow;
        }

        const probSemNenhum = d.problemas.filter(p => p.problema !== 'nenhum');
        document.getElementById('detalheProblemasLista').innerHTML = probSemNenhum.length
            ? probSemNenhum.map((p, i) => `
                <div class="ponto-item">
                    <span class="ponto-nome">${i+1}º ${labelProblema[p.problema] || p.problema}</span>
                    <span class="ponto-qtd">${p.total}</span>
                </div>`).join('')
            : '<div class="loading">Nenhum problema relatado. 🎉</div>';

        document.getElementById('detalhePositivosLista').innerHTML = d.pontos_positivos.length
            ? d.pontos_positivos.map(p => `
                <div class="ponto-item">
                    <span class="ponto-nome">${LABEL_POSITIVO[p.valor] || p.valor}</span>
                    <span class="ponto-qtd" style="color:var(--verde);">${p.total}</span>
                </div>`).join('')
            : '<div class="loading">Sem dados.</div>';

        document.getElementById('detalheNegativosLista').innerHTML = d.pontos_negativos.length
            ? d.pontos_negativos.map(p => `
                <div class="ponto-item">
                    <span class="ponto-nome">${LABEL_NEGATIVO[p.valor] || p.valor}</span>
                    <span class="ponto-qtd" style="color:#e74c3c;">${p.total}</span>
                </div>`).join('')
            : '<div class="loading">Sem dados.</div>';

    } catch (e) {
        document.getElementById('detalheTotalRespostas').textContent = 'Erro ao carregar dados.';
    }
}
