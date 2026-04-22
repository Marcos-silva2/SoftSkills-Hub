const labelProblema = {
    nenhum:'🟢 Nenhum problema', assedio_moral:'Assédio moral',
    favorecimento:'Favorecimento indevido', machismo:'Machismo',
    assedio_sexual:'Assédio sexual', desvio_funcao:'Desvio de função',
    carga_excessiva:'Carga horária excessiva', falta_orientacao:'Falta de orientação',
    sobrecarga:'Sobrecarga de tarefas', preconceito_etario:'Preconceito etário',
    discriminacao_racial:'Discriminação racial', homofobia:'Homofobia / Transfobia',
    intolerancia_religiosa:'Intolerância religiosa', atraso_pagamento:'Atraso no pagamento',
    falta_feedback:'Falta de feedback', pressao_psicologica:'Pressão psicológica',
    condicoes_inseguras:'Condições inseguras', exclusao_equipe:'Exclusão da equipe',
    desvalorizacao_ideias:'Desvalorização de ideias', microgerenciamento:'Microgerenciamento',
    tarefas_repetitivas:'Tarefas repetitivas', ameacas_demissao:'Ameaças de demissão',
    falta_estrutura:'Falta de estrutura', desrespeito_direitos:'Desrespeito à Lei da Aprendizagem',
    ausencia_intervalo:'Ausência de intervalo', proibicao_cursos:'Proibição de cursos',
};

function filtrosQueryProblemas() {
    const ano     = document.getElementById('filtroAnoProb').value;
    const empresa = document.getElementById('filtroEmpresaProb').value;
    const genero  = document.getElementById('filtroGeneroProb').value;
    const faixa   = document.getElementById('filtroFaixaProb').value;
    const params  = new URLSearchParams();
    if (ano)     params.set('ano', ano);
    if (empresa) params.set('empresa_id', empresa);
    if (genero)  params.set('genero', genero);
    if (faixa)   params.set('faixa_etaria', faixa);
    return params.toString() ? '?' + params.toString() : '';
}

function skeletonRank(n = 5) {
    return Array.from({ length: n }, () => `
        <div class="rank-item">
            <span class="skeleton" style="height:14px;width:22px;flex-shrink:0;"></span>
            <span class="skeleton" style="height:14px;flex:1;"></span>
            <span class="skeleton" style="height:14px;width:60px;flex-shrink:0;"></span>
        </div>
    `).join('');
}

async function carregarProblemas() {
    const lista = document.getElementById('listaProblemas');
    lista.innerHTML = skeletonRank(5);
    try {
        const dados = await apiFetch('/dashboard/problemas' + filtrosQueryProblemas());
        if (!dados.length) { lista.innerHTML = emptyState(SVG_GRAFICO, 'Nenhum dado encontrado', 'Ajuste os filtros ou aguarde novas respostas.'); return; }
        const medalhas  = ['🥇','🥈','🥉'];
        const bgPodio   = ['#fffbea','#f5f5f5','#fff4ee'];
        lista.innerHTML = dados.map((p, i) => `
            <div class="rank-item" style="${i < 3 ? `background:${bgPodio[i]};border-radius:10px;padding:12px 4px;` : ''}">
                <span class="rank-num" style="${i < 3 ? 'font-size:1.3rem;' : ''}">${i < 3 ? medalhas[i] : (i+1)+'º'}</span>
                <span class="rank-label" style="${i === 0 ? 'font-weight:700;' : ''}">${labelProblema[p.problema] || p.problema}</span>
                <span class="rank-val">${p.total} relato${p.total > 1 ? 's' : ''}</span>
            </div>
        `).join('');
        animarListaComScroll(lista);
    } catch (e) {
        lista.innerHTML = `<div class="loading">Erro: ${e.message}</div>`;
    }
}
