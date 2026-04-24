const TERMOS_JOGO = [
    { emoji: '🤝', termo: 'Networking',      def: 'Sua rede de contatos profissionais que pode abrir portas no futuro.' },
    { emoji: '🚀', termo: 'Proatividade',     def: 'Agir com iniciativa antes de ser solicitado.' },
    { emoji: '🛡️', termo: 'Resiliência',      def: 'Capacidade de se recuperar rápido após dificuldades.' },
    { emoji: '🧠', termo: 'Mindset',          def: 'Sua mentalidade e forma de enxergar desafios e oportunidades.' },
    { emoji: '🎭', termo: 'Soft Skill',       def: 'Habilidade comportamental como empatia e trabalho em equipe.' },
    { emoji: '💖', termo: 'Empatia',          def: 'Colocar-se no lugar do outro antes de julgar.' },
    { emoji: '🎯', termo: 'Assertividade',    def: 'Comunicar-se com clareza, firmeza e respeito.' },
    { emoji: '🧘', termo: 'Int. Emocional',   def: 'Controlar emoções e lidar bem com as dos outros.' },
    { emoji: '🦎', termo: 'Adaptabilidade',   def: 'Ajustar-se rapidamente a mudanças no ambiente.' },
    { emoji: '🗣️', termo: 'Feedback',         def: 'Retorno construtivo sobre o desempenho no trabalho.' },
    { emoji: '🌩️', termo: 'Brainstorming',    def: 'Reunião de geração livre de ideias em grupo.' },
    { emoji: '⏰', termo: 'Deadline',         def: 'Data limite para entrega de uma tarefa ou projeto.' },
    { emoji: '📋', termo: 'Briefing',         def: 'Instruções iniciais para começar um projeto.' },
    { emoji: '🚪', termo: 'Onboarding',       def: 'Processo de integração e boas-vindas na empresa.' },
];

// ── Estado do jogo ────────────────────────────────────────────────
let jogoMovimentos = 0, jogoPares = 0;
let jogoViradas = [], jogoTravado = false;
let jogoAcertados = new Set();

// ── Timer ─────────────────────────────────────────────────────────
let _timerInterval = null, _timerSeg = 0;

function _iniciarTimer() {
    clearInterval(_timerInterval);
    _timerSeg = 0;
    document.getElementById('jogoTimer').textContent = '0:00';
    _timerInterval = setInterval(() => {
        _timerSeg++;
        const m = Math.floor(_timerSeg / 60);
        const s = String(_timerSeg % 60).padStart(2, '0');
        document.getElementById('jogoTimer').textContent = `${m}:${s}`;
    }, 1000);
}

function pararTimer() {
    clearInterval(_timerInterval);
    _timerInterval = null;
}

function _formatarTempo(seg) {
    const m = Math.floor(seg / 60), s = seg % 60;
    return m > 0 ? `${m}m${String(s).padStart(2, '0')}s` : `${s}s`;
}

// ── Recordes locais ───────────────────────────────────────────────
function _obterRecord() {
    try { return JSON.parse(localStorage.getItem('ssh_jogo_record') || 'null'); } catch { return null; }
}

function _salvarRecord(moves, tempo) {
    const atual = _obterRecord();
    if (!atual || moves < atual.moves || (moves === atual.moves && tempo < atual.tempo)) {
        localStorage.setItem('ssh_jogo_record', JSON.stringify({ moves, tempo }));
        return true;
    }
    return false;
}

// ── Sons via Web Audio API ────────────────────────────────────────
let _audioCtx = null;
function _ctx() {
    if (!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return _audioCtx;
}

function tocarSomAcerto() {
    try {
        const ctx = _ctx();
        [[523, 0], [659, 0.1]].forEach(([freq, delay]) => {
            const osc = ctx.createOscillator(), g = ctx.createGain();
            osc.connect(g); g.connect(ctx.destination);
            osc.type = 'sine'; osc.frequency.value = freq;
            const t = ctx.currentTime + delay;
            g.gain.setValueAtTime(0.12, t);
            g.gain.exponentialRampToValueAtTime(0.001, t + 0.38);
            osc.start(t); osc.stop(t + 0.38);
        });
    } catch (_) {}
}

function tocarSomErro() {
    try {
        const ctx = _ctx();
        const osc = ctx.createOscillator(), g = ctx.createGain();
        osc.connect(g); g.connect(ctx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.22);
        g.gain.setValueAtTime(0.07, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
        osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.22);
    } catch (_) {}
}

function tocarSomVitoria() {
    try {
        const ctx = _ctx();
        [523, 659, 784, 1047].forEach((freq, i) => {
            const osc = ctx.createOscillator(), g = ctx.createGain();
            osc.connect(g); g.connect(ctx.destination);
            osc.type = 'sine'; osc.frequency.value = freq;
            const t = ctx.currentTime + i * 0.13;
            g.gain.setValueAtTime(0, t);
            g.gain.linearRampToValueAtTime(0.13, t + 0.04);
            g.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
            osc.start(t); osc.stop(t + 0.5);
        });
    } catch (_) {}
}

// ── Barra de progresso (6 bolinhas) ──────────────────────────────
function _atualizarPares(pares) {
    document.querySelectorAll('.jogo-par-seg').forEach((seg, i) => {
        if (i < pares && !seg.classList.contains('preenchido')) {
            seg.classList.add('preenchido');
            if (typeof gsap !== 'undefined') {
                gsap.from(seg, { scale: 0, duration: 0.4, ease: 'elastic.out(1, 0.5)', overwrite: true });
            }
        } else if (i >= pares) {
            seg.classList.remove('preenchido');
        }
    });
}

// ── Hint bar (cicla os termos da rodada) ──────────────────────────
let _hintInterval = null, _hintIdx = 0, _hintTermos = [];

function _iniciarHint(termos) {
    _hintTermos = termos;
    _hintIdx = 0;
    if (_hintInterval) clearInterval(_hintInterval);
    _mostrarHint(0);
    _hintInterval = setInterval(() => {
        _hintIdx = (_hintIdx + 1) % _hintTermos.length;
        const body = document.querySelector('.hint-body');
        if (!body) return;
        body.style.opacity = '0';
        setTimeout(() => { _mostrarHint(_hintIdx); body.style.opacity = '1'; }, 280);
    }, 6000);
}

function _mostrarHint(idx) {
    const t = _hintTermos[idx];
    if (!t) return;
    const emoji = document.getElementById('hintEmoji');
    const termo = document.getElementById('hintTermo');
    const def   = document.getElementById('hintDef');
    if (emoji) emoji.textContent = t.emoji + ' ';
    if (termo) termo.textContent = t.termo;
    if (def)   def.textContent   = t.def;
}

// Chamado por navegarApp ao sair do jogo
function jogoLimpar() {
    pararTimer();
    if (_hintInterval) { clearInterval(_hintInterval); _hintInterval = null; }
}

// ── Efeitos visuais ───────────────────────────────────────────────
function sparkleEmCarta(el) {
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width  / 2;
    const cy = rect.top  + rect.height / 2;
    const cores = ['#ffd700', '#ff9f43', '#6c5ce7', '#00b894', '#fd79a8', '#74b9ff'];
    for (let i = 0; i < 6; i++) {
        const dot = document.createElement('div');
        dot.className = 'sparkle-dot';
        const angle = (i / 6) * 2 * Math.PI;
        const dist  = 18 + Math.random() * 14;
        dot.style.cssText = `
            left:${cx + Math.cos(angle) * dist}px;
            top:${cy  + Math.sin(angle) * dist}px;
            background:${cores[i]};
            animation-delay:${i * 0.035}s;
        `;
        document.body.appendChild(dot);
        setTimeout(() => dot.remove(), 700);
    }
}

function dispararConfetti() {
    const cores = ['#367a28','#56c240','#f39c12','#e74c3c','#3498db','#9b59b6','#ffd700','#e67e22'];
    const wrap = document.createElement('div');
    wrap.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9999;overflow:hidden;';
    document.body.appendChild(wrap);
    for (let i = 0; i < 60; i++) {
        const p = document.createElement('div');
        const size = 6 + Math.random() * 7;
        p.className = 'confetti-piece';
        p.style.cssText = `
            left:${Math.random() * 100}%;
            top:-${10 + Math.random() * 20}px;
            width:${size}px; height:${size}px;
            background:${cores[Math.floor(Math.random() * cores.length)]};
            border-radius:${Math.random() > 0.5 ? '50%' : '2px'};
            animation:confettiFall ${0.8 + Math.random() * 0.9}s ease-in forwards;
            animation-delay:${Math.random() * 0.6}s;
        `;
        wrap.appendChild(p);
    }
    setTimeout(() => wrap.remove(), 2400);
}

// ── Shuffle ───────────────────────────────────────────────────────
function jogoEmbaralhrar(arr) {
    return arr.slice().sort(() => Math.random() - 0.5);
}

// ── Iniciar jogo ──────────────────────────────────────────────────
function iniciarJogo() {
    jogoMovimentos = 0; jogoPares = 0;
    jogoViradas = []; jogoTravado = false; jogoAcertados = new Set();

    document.getElementById('jogoMovimentos').textContent = '0';
    document.getElementById('jogoTimer').textContent = '0:00';
    document.getElementById('jogoVitoria').style.display = 'none';
    document.getElementById('dicionarioJogo').style.display = 'none';

    // Gerar 6 bolinhas de progresso
    document.getElementById('jogoProgress').innerHTML =
        Array.from({ length: 6 }, () => '<div class="jogo-par-seg"></div>').join('');

    const selecionados = jogoEmbaralhrar(TERMOS_JOGO).slice(0, 6);
    const cartas = jogoEmbaralhrar([...selecionados, ...selecionados]);

    document.getElementById('boardJogo').innerHTML = cartas.map(t => `
        <div class="carta" data-termo="${escapeHtml(t.termo)}" onclick="jogoClicar(this)">
            <div class="carta-inner">
                <div class="carta-capa">
                    <span class="capa-icone">🎴</span>
                    <span class="capa-label">soft skills</span>
                </div>
                <div class="carta-face">
                    <span class="carta-emoji">${t.emoji}</span>
                    <span class="carta-termo">${escapeHtml(t.termo)}</span>
                </div>
            </div>
        </div>
    `).join('');

    // Animação de entrada escalonada
    document.querySelectorAll('.carta').forEach((carta, i) => {
        carta.style.animationDelay = `${i * 0.055}s`;
    });

    _iniciarTimer();
    _iniciarHint(selecionados);
}

// ── Clique na carta ───────────────────────────────────────────────
function jogoClicar(el) {
    if (jogoTravado || el.classList.contains('virada') || el.classList.contains('acertada')) return;

    el.classList.add('virada');
    jogoViradas.push(el);
    vibrar([8]);

    if (jogoViradas.length < 2) return;

    jogoMovimentos++;
    document.getElementById('jogoMovimentos').textContent = jogoMovimentos;
    jogoTravado = true;

    const [a, b] = jogoViradas;

    if (a.dataset.termo === b.dataset.termo) {
        a.classList.add('acertada');
        b.classList.add('acertada');
        jogoAcertados.add(a.dataset.termo);
        jogoPares++;
        _atualizarPares(jogoPares);
        sparkleEmCarta(a); sparkleEmCarta(b);
        tocarSomAcerto();
        vibrar([15, 30, 15]);
        jogoViradas = [];
        jogoTravado = false;
        if (jogoPares === 6) jogoVitoria();
    } else {
        a.classList.add('erro');
        b.classList.add('erro');
        tocarSomErro();
        vibrar([40]);
        setTimeout(() => {
            a.classList.remove('virada', 'erro');
            b.classList.remove('virada', 'erro');
            jogoViradas = [];
            jogoTravado = false;
        }, 900);
    }
}

// ── Vitória ───────────────────────────────────────────────────────
function jogoVitoria() {
    pararTimer();
    const tempo = _timerSeg;
    const estrelas = jogoMovimentos <= 8 ? 3 : jogoMovimentos <= 14 ? 2 : 1;

    const msgs = {
        3: `Incrível! Apenas ${jogoMovimentos} jogadas. Memória de elefante! 🐘`,
        2: `Muito bem! ${jogoMovimentos} jogadas em ${_formatarTempo(tempo)}. Continue treinando! 💪`,
        1: `Conseguiu em ${jogoMovimentos} jogadas. Da próxima será mais fácil! 😄`,
    };

    document.getElementById('jogoVitoriaMensagem').textContent = msgs[estrelas];
    document.getElementById('jogoVitoria').style.display = 'flex';

    // Estrelas
    [1, 2, 3].forEach(i => {
        document.getElementById(`estrela${i}`).classList.toggle('ativa', i <= estrelas);
    });
    if (typeof gsap !== 'undefined') {
        const ativas = document.querySelectorAll('.estrela.ativa');
        gsap.from(ativas, {
            scale: 0, rotation: -30, duration: 0.5,
            stagger: 0.14, ease: 'elastic.out(1, 0.5)', delay: 0.25,
        });
    }

    // Recorde
    const novoRecord = _salvarRecord(jogoMovimentos, tempo);
    const recordEl = document.getElementById('jogoRecordMsg');
    if (novoRecord) {
        recordEl.textContent = `🏅 Novo recorde! ${jogoMovimentos} jogadas em ${_formatarTempo(tempo)}`;
        recordEl.style.display = 'block';
    } else {
        const rec = _obterRecord();
        if (rec) {
            recordEl.textContent = `Recorde atual: ${rec.moves} jogadas em ${_formatarTempo(rec.tempo)}`;
            recordEl.style.display = 'block';
        } else {
            recordEl.style.display = 'none';
        }
    }

    dispararConfetti();
    tocarSomVitoria();
    vibrar([50, 80, 50, 80, 100]);

    // Dicionário
    document.getElementById('dicionarioLista').innerHTML = [...jogoAcertados].map(termo => {
        const t = TERMOS_JOGO.find(x => x.termo === termo);
        return `<div class="def-item">
            <div class="def-header">${t.emoji} <strong>${escapeHtml(t.termo)}</strong></div>
            <div class="def-texto">${escapeHtml(t.def)}</div>
        </div>`;
    }).join('');
    document.getElementById('dicionarioJogo').style.display = 'block';
}
