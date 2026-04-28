let _donutFiltro = null;
let _donutState  = null;

function toggleFiltros(header) {
    header.closest('.filtros-card').classList.toggle('aberto');
}

function toggleDonutFiltro(label) {
    _donutFiltro = _donutFiltro === label ? null : label;
    if (!_donutState) return;
    const { sim, nao, talvez, total } = _donutState;
    document.getElementById('barrasEfetivacao').innerHTML = donutChart(sim, nao, talvez, total);
    setTimeout(() => {
        document.querySelectorAll('#barrasEfetivacao .donut-arco[data-len]').forEach(el => {
            const len = +el.dataset.len, circ = +el.dataset.circ;
            el.setAttribute('stroke-dasharray', `${len} ${circ - len}`);
        });
    }, 60);
}

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
    _donutState = { sim, nao, talvez, total };

    const r = 44, cx = 62, cy = 62;
    const circ = 2 * Math.PI * r;
    const gap  = circ * 0.012;
    const dark = document.documentElement.classList.contains('tema-escuro');

    const nSim    = Math.round(sim    / 100 * total);
    const nNao    = Math.round(nao    / 100 * total);
    const nTalvez = Math.round(talvez / 100 * total);

    const segs = [
        { perc: sim,    cor: '#27ae60', n: nSim,    emoji: '✅', label: 'sim'    },
        { perc: talvez, cor: '#f39c12', n: nTalvez, emoji: '🤔', label: 'talvez' },
        { perc: nao,    cor: '#e74c3c', n: nNao,    emoji: '❌', label: 'não'    },
    ];

    let cum = 0;
    const arcos = segs.map(s => {
        const len     = Math.max(0, s.perc / 100 * circ - gap);
        const opacity = _donutFiltro ? (_donutFiltro === s.label ? '1' : '0.22') : '1';
        const arc = `<circle class="donut-arco"
            data-len="${len.toFixed(2)}" data-circ="${circ.toFixed(2)}" data-label="${s.label}"
            cx="${cx}" cy="${cy}" r="${r}" fill="none"
            stroke="${s.cor}" stroke-width="15"
            stroke-dasharray="0 ${circ.toFixed(2)}"
            stroke-dashoffset="${(-cum).toFixed(2)}"
            style="cursor:pointer;opacity:${opacity};transition:opacity 0.25s;"
            onclick="toggleDonutFiltro('${s.label}')"/>`;
        cum += len + gap;
        return arc;
    });

    let badge, badgeColor, badgeBg;
    if (sim >= 60) {
        badge = '🎯 Boa retenção de talentos';
        badgeColor = dark ? '#86efac' : '#2e7d32';
        badgeBg    = dark ? '#0f2d14' : '#e8f5e9';
    } else if (sim >= 35) {
        badge = '📊 Retenção moderada';
        badgeColor = dark ? '#fcd34d' : '#856404';
        badgeBg    = dark ? '#2d2200' : '#fff8e1';
    } else {
        badge = '⚠️ Atenção: baixa retenção';
        badgeColor = dark ? '#f87171' : '#c0392b';
        badgeBg    = dark ? '#3b1010' : '#fdecea';
    }

    const ringStroke = dark ? '#3a3a3a' : '#f0f0f0';
    const textFill   = dark ? '#e4e4e4' : '#333333';
    const mutedFill  = dark ? '#9e9e9e' : '#777777';

    const legenda = segs.map(s => {
        const isActive = !_donutFiltro || _donutFiltro === s.label;
        const displayLabel = s.label.charAt(0).toUpperCase() + s.label.slice(1);
        return `
        <div style="display:flex;align-items:center;gap:8px;cursor:pointer;
            opacity:${isActive ? '1' : '0.35'};transition:opacity 0.25s;padding:4px 6px;border-radius:8px;"
            onclick="toggleDonutFiltro('${s.label}')">
            <div style="width:10px;height:10px;border-radius:50%;background:${s.cor};flex-shrink:0;"></div>
            <span style="font-size:0.8rem;font-weight:600;color:var(--texto);flex:1;">${s.emoji} ${displayLabel}</span>
            <span style="font-size:0.82rem;font-weight:700;color:${s.cor};">${s.perc}%</span>
            <span style="font-size:0.72rem;color:var(--muted);">${s.n}</span>
        </div>`;
    }).join('');

    const filtroLabel = _donutFiltro
        ? `<div style="font-size:0.74rem;color:${badgeColor};background:${badgeBg};border-radius:8px;padding:4px 10px;border:1px solid ${badgeColor}22;display:inline-block;">
               Filtrando: ${_donutFiltro.charAt(0).toUpperCase() + _donutFiltro.slice(1)} — toque novamente para limpar
           </div>`
        : '';

    return `
        <div style="display:flex;flex-direction:column;gap:14px;">
            <div style="display:flex;align-items:center;gap:18px;flex-wrap:wrap;">
                <svg width="124" height="124" viewBox="0 0 124 124" style="flex-shrink:0;">
                    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${ringStroke}" stroke-width="15"/>
                    <g transform="rotate(-90 ${cx} ${cy})">${arcos.join('')}</g>
                    <text x="${cx}" y="${cy-7}" text-anchor="middle" font-size="20" font-weight="700" fill="${textFill}">${total}</text>
                    <text x="${cx}" y="${cy+9}" text-anchor="middle" font-size="9" fill="${mutedFill}">respostas</text>
                </svg>
                <div style="display:flex;flex-direction:column;gap:4px;flex:1;">${legenda}</div>
            </div>
            ${filtroLabel}
            <div style="background:${badgeBg};color:${badgeColor};border-radius:10px;padding:8px 14px;font-size:0.8rem;font-weight:600;text-align:center;border:1px solid ${badgeColor}22;">${badge}</div>
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
    document.getElementById('cardAvaliacoes').style.display = 'none';

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

        const sat  = resumo.media_satisfacao;
        const perc = resumo.perc_quer_efetivacao;
        const kpiDados = [
            { alvo: resumo.total_respostas, sufixo: '',   decimais: 0, label: `Total de respostas${labelAno}`, icon: '📊', cor: null },
            { alvo: sat,  sufixo: ' ★', decimais: 1, label: 'Média de satisfação',   icon: '⭐',
              cor: sat  >= 4 ? '#27ae60' : sat  >= 2.5 ? '#f39c12' : '#e74c3c' },
            { alvo: perc, sufixo: '%',  decimais: 0, label: 'Querem ser efetivados', icon: '🎯',
              cor: perc >= 50 ? '#27ae60' : perc >= 30 ? '#f39c12' : '#e74c3c' },
            { alvo: efetivacao.length, sufixo: '', decimais: 0, label: 'Empresas com dados', icon: '🏢', cor: null },
        ];
        document.getElementById('kpiGrid').innerHTML = kpiDados.map(k => `
            <div class="kpi kpi-interativo">
                <div class="kpi-icon">${k.icon}</div>
                <div class="valor" data-alvo="${k.alvo}" data-sufixo="${k.sufixo}" data-decimais="${k.decimais}"
                    ${k.cor ? `style="color:${k.cor}"` : ''}>0${k.sufixo}</div>
                <div class="label">${k.label}</div>
            </div>
        `).join('');
        document.querySelectorAll('#kpiGrid .valor[data-alvo]').forEach(el => {
            animarContagem(el, +el.dataset.alvo, el.dataset.sufixo, +el.dataset.decimais, 800);
        });

        if (resumo.top_positivos?.length || resumo.top_negativos?.length) {
            const maxPos = Math.max(...(resumo.top_positivos || []).map(i => i.total), 1);
            const maxNeg = Math.max(...(resumo.top_negativos || []).map(i => i.total), 1);
            const _avalRow = (item, cor, maxVal, rank) => {
                const pct    = Math.round(item.total / maxVal * 100);
                const label  = escapeHtml(item.valor.replace(/_/g, ' '));
                const bg     = cor === '#27ae60' ? 'rgba(39,174,96,0.09)' : 'rgba(231,76,60,0.08)';
                const border = cor === '#27ae60' ? 'rgba(39,174,96,0.22)' : 'rgba(231,76,60,0.2)';
                return `
                <div class="aval-row" style="border:1px solid ${border};"
                     onclick="this.classList.toggle('aval-ativo')">
                    <div class="aval-barra" data-pct="${pct}" style="background:${bg};"></div>
                    <div class="aval-conteudo">
                        <span class="aval-rank">${rank}</span>
                        <div class="aval-label">${label}</div>
                        <div class="aval-nums">
                            <span class="aval-total" style="color:${cor};">${item.total}</span>
                            <span class="aval-pct">${pct}%</span>
                        </div>
                    </div>
                </div>`;
            };
            const posHtml = (resumo.top_positivos || []).map((i, idx) => _avalRow(i, '#27ae60', maxPos, idx + 1)).join('');
            const negHtml = (resumo.top_negativos || []).map((i, idx) => _avalRow(i, '#e74c3c', maxNeg, idx + 1)).join('');
            document.getElementById('gridAvaliacoes').innerHTML = `
                <div>
                    <p class="aval-secao-titulo" style="color:#27ae60;border-left:3px solid #27ae60;">✅ Pontos Positivos</p>
                    ${posHtml || '<p style="font-size:0.82rem;color:var(--muted);padding:6px 0;">Sem dados</p>'}
                </div>
                <div>
                    <p class="aval-secao-titulo" style="color:#e74c3c;border-left:3px solid #e74c3c;">❌ Pontos Negativos</p>
                    ${negHtml || '<p style="font-size:0.82rem;color:var(--muted);padding:6px 0;">Sem dados</p>'}
                </div>`;
            document.getElementById('cardAvaliacoes').style.display = 'block';
            setTimeout(() => {
                document.querySelectorAll('#gridAvaliacoes .aval-barra[data-pct]').forEach(el => {
                    el.style.width = el.dataset.pct + '%';
                });
            }, 80);
        }

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
