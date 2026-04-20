function filtrosQuery() {
    const ano     = document.getElementById('filtroAno').value;
    const empresa = document.getElementById('filtroEmpresa').value;
    const genero  = document.getElementById('filtroGenero').value;
    const faixa   = document.getElementById('filtroFaixa').value;
    const params  = new URLSearchParams();
    if (ano)     params.set('ano', ano);
    if (empresa) params.set('empresa_id', empresa);
    if (genero)  params.set('genero', genero);
    if (faixa)   params.set('faixa_etaria', faixa);
    return params.toString() ? '?' + params.toString() : '';
}

function popularFiltroAnos() {
    const anoAtual = new Date().getFullYear();
    ['filtroAno', 'filtroAnoEmpresas', 'filtroAnoProb'].forEach(id => {
        const sel = document.getElementById(id);
        for (let a = anoAtual; a >= 2024; a--) {
            const opt = document.createElement('option');
            opt.value = a; opt.textContent = a;
            sel.appendChild(opt);
        }
    });
}

async function carregarFiltroEmpresas() {
    try {
        const lista = await apiFetch('/empresas');
        ['filtroEmpresa', 'filtroEmpresaProb'].forEach(id => {
            const sel = document.getElementById(id);
            lista.forEach(e => {
                const opt = document.createElement('option');
                opt.value = e.id; opt.textContent = e.nome;
                sel.appendChild(opt);
            });
        });
    } catch { /* silencioso */ }
}

const SVG_GRAFICO = '<line x1="18" x2="18" y1="20" y2="10"/><line x1="12" x2="12" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/>';

function skeletonKpi(n = 4) {
    return Array.from({ length: n }, () => `
        <div class="kpi">
            <span class="skeleton" style="height:36px;width:70px;margin:0 auto 10px;display:block;border-radius:6px;"></span>
            <span class="skeleton" style="height:13px;width:90%;display:block;margin:0 auto;"></span>
        </div>
    `).join('');
}

function animarContagem(el, alvo, sufixo = '', decimais = 0, duracao = 800) {
    const inicio = performance.now();
    function step(ts) {
        const t = Math.min((ts - inicio) / duracao, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        const val = eased * alvo;
        el.textContent = (decimais ? val.toFixed(decimais) : Math.round(val)) + sufixo;
        if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}

function donutChart(sim, nao, talvez, total) {
    const r = 44, cx = 62, cy = 62;
    const circ = 2 * Math.PI * r;
    const gap  = circ * 0.012;

    const nSim    = Math.round(sim    / 100 * total);
    const nNao    = Math.round(nao    / 100 * total);
    const nTalvez = Math.round(talvez / 100 * total);

    const segs = [
        { perc: sim,    cor: '#27ae60', n: nSim,    emoji: '✅', label: 'Sim'    },
        { perc: talvez, cor: '#f39c12', n: nTalvez, emoji: '🤔', label: 'Talvez' },
        { perc: nao,    cor: '#e74c3c', n: nNao,    emoji: '❌', label: 'Não'    },
    ];

    let cum = 0;
    const arcos = segs.map(s => {
        const len = Math.max(0, s.perc / 100 * circ - gap);
        const arc = `<circle class="donut-arco"
            data-len="${len.toFixed(2)}" data-circ="${circ.toFixed(2)}"
            cx="${cx}" cy="${cy}" r="${r}" fill="none"
            stroke="${s.cor}" stroke-width="15"
            stroke-dasharray="0 ${circ.toFixed(2)}"
            stroke-dashoffset="${(-cum).toFixed(2)}"/>`;
        cum += len + gap;
        return arc;
    });

    let badge, badgeColor, badgeBg;
    if (sim >= 60)      { badge = '🎯 Boa retenção de talentos'; badgeColor = '#2e7d32'; badgeBg = '#e8f5e9'; }
    else if (sim >= 35) { badge = '📊 Retenção moderada';         badgeColor = '#856404'; badgeBg = '#fff8e1'; }
    else                { badge = '⚠️ Atenção: baixa retenção';  badgeColor = '#c0392b'; badgeBg = '#fdecea'; }

    const legenda = segs.map(s => `
        <div style="display:flex;align-items:flex-start;gap:8px;">
            <div style="width:11px;height:11px;border-radius:50%;background:${s.cor};flex-shrink:0;margin-top:3px;"></div>
            <div>
                <div style="font-size:0.83rem;font-weight:600;color:var(--texto);">${s.emoji} ${s.label} — <span style="color:${s.cor};">${s.perc}%</span></div>
                <div style="font-size:0.72rem;color:var(--muted);">${s.n} pessoa${s.n !== 1 ? 's' : ''}</div>
            </div>
        </div>`).join('');

    return `
        <div style="display:flex;flex-direction:column;gap:16px;">
            <div style="display:flex;align-items:center;gap:20px;flex-wrap:wrap;">
                <svg width="124" height="124" viewBox="0 0 124 124" style="flex-shrink:0;">
                    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#f0f0f0" stroke-width="15"/>
                    <g transform="rotate(-90 ${cx} ${cy})">${arcos.join('')}</g>
                    <text x="${cx}" y="${cy-7}" text-anchor="middle" font-size="20" font-weight="700" fill="currentColor">${total}</text>
                    <text x="${cx}" y="${cy+9}" text-anchor="middle" font-size="9" fill="currentColor" opacity=".5">respostas</text>
                </svg>
                <div style="display:flex;flex-direction:column;gap:12px;flex:1;">${legenda}</div>
            </div>
            <div style="background:${badgeBg};color:${badgeColor};border-radius:10px;padding:9px 14px;font-size:0.8rem;font-weight:600;text-align:center;border:1px solid ${badgeColor}22;">${badge}</div>
        </div>`;
}

async function exportarCSV() {
    const token = getToken();
    const q = filtrosQuery();
    try {
        const res = await fetch(`${API}/dashboard/export${q}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) { mostrarToast('Erro ao exportar dados', 'erro'); return; }
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `softskills-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        mostrarToast('CSV exportado com sucesso!', 'sucesso');
    } catch (e) {
        mostrarToast('Erro: ' + e.message, 'erro');
    }
}

async function carregarResumo() {
    document.getElementById('kpiGrid').innerHTML = skeletonKpi(4);
    document.getElementById('cardEfetivacao').style.display = 'none';

    try {
        const q = filtrosQuery();
        const [resumo, efetivacao] = await Promise.all([
            apiFetch('/dashboard/resumo' + q),
            apiFetch('/dashboard/efetivacao-por-empresa' + q),
        ]);

        const anoSel = document.getElementById('filtroAno').value;
        const labelAno = anoSel ? ` (${anoSel})` : '';

        if (resumo.total_respostas === 0) {
            document.getElementById('kpiGrid').innerHTML =
                `<div style="grid-column:1/-1;">${emptyState(SVG_GRAFICO, 'Nenhuma resposta encontrada', 'Tente ajustar os filtros acima.')}</div>`;
            return;
        }

        const kpiDados = [
            { alvo: resumo.total_respostas,      sufixo: '',   decimais: 0, label: `Total de respostas${labelAno}` },
            { alvo: resumo.media_satisfacao,     sufixo: ' ★', decimais: 1, label: 'Média de satisfação' },
            { alvo: resumo.perc_quer_efetivacao, sufixo: '%',  decimais: 0, label: 'Querem ser efetivados' },
            { alvo: efetivacao.length,           sufixo: '',   decimais: 0, label: 'Empresas com dados' },
        ];
        document.getElementById('kpiGrid').innerHTML = kpiDados.map(k => `
            <div class="kpi">
                <div class="valor" data-alvo="${k.alvo}" data-sufixo="${k.sufixo}" data-decimais="${k.decimais}">0${k.sufixo}</div>
                <div class="label">${k.label}</div>
            </div>
        `).join('');
        document.querySelectorAll('#kpiGrid .valor[data-alvo]').forEach(el => {
            animarContagem(el, +el.dataset.alvo, el.dataset.sufixo, +el.dataset.decimais, 800);
        });

        if (efetivacao.length > 0) {
            let sim = 0, nao = 0, talvez = 0, total = 0;
            efetivacao.forEach(e => {
                sim    += e.sim_perc    * e.total / 100;
                nao    += e.nao_perc    * e.total / 100;
                talvez += e.talvez_perc * e.total / 100;
                total  += e.total;
            });
            const pSim    = total ? Math.round(sim    / total * 100) : 0;
            const pNao    = total ? Math.round(nao    / total * 100) : 0;
            const pTalvez = total ? Math.round(talvez / total * 100) : 0;

            document.getElementById('cardEfetivacao').style.display = 'block';
            document.getElementById('barrasEfetivacao').innerHTML = donutChart(pSim, pNao, pTalvez, Math.round(total));
            setTimeout(() => {
                document.querySelectorAll('#barrasEfetivacao .donut-arco[data-len]').forEach(el => {
                    const len = +el.dataset.len, circ = +el.dataset.circ;
                    el.setAttribute('stroke-dasharray', `${len} ${circ - len}`);
                });
            }, 60);
        }
    } catch (e) {
        document.getElementById('kpiGrid').innerHTML =
            `<div class="loading" style="grid-column:1/-1;">Erro: ${e.message}</div>`;
    }
}
