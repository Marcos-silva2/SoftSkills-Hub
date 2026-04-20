const TERMOS_JOGO = [
    { emoji: '🤝', termo: 'Networking',       def: 'Sua rede de contatos profissionais que pode abrir portas no futuro.' },
    { emoji: '🚀', termo: 'Proatividade',      def: 'Agir com iniciativa antes de ser solicitado.' },
    { emoji: '🛡️', termo: 'Resiliência',       def: 'Capacidade de se recuperar rápido após dificuldades.' },
    { emoji: '🧠', termo: 'Mindset',           def: 'Sua mentalidade e forma de enxergar desafios e oportunidades.' },
    { emoji: '🎭', termo: 'Soft Skill',        def: 'Habilidade comportamental como empatia e trabalho em equipe.' },
    { emoji: '💖', termo: 'Empatia',           def: 'Colocar-se no lugar do outro antes de julgar.' },
    { emoji: '🎯', termo: 'Assertividade',     def: 'Comunicar-se com clareza, firmeza e respeito.' },
    { emoji: '🧘', termo: 'Int. Emocional',    def: 'Controlar emoções e lidar bem com as dos outros.' },
    { emoji: '🦎', termo: 'Adaptabilidade',    def: 'Ajustar-se rapidamente a mudanças no ambiente.' },
    { emoji: '🗣️', termo: 'Feedback',          def: 'Retorno construtivo sobre o desempenho no trabalho.' },
    { emoji: '🌩️', termo: 'Brainstorming',     def: 'Reunião de geração livre de ideias em grupo.' },
    { emoji: '⏰', termo: 'Deadline',          def: 'Data limite para entrega de uma tarefa ou projeto.' },
    { emoji: '📋', termo: 'Briefing',          def: 'Instruções iniciais para começar um projeto.' },
    { emoji: '🚪', termo: 'Onboarding',        def: 'Processo de integração e boas-vindas na empresa.' },
];

let jogoMovimentos = 0, jogoPares = 0;
let jogoViradas = [], jogoTravado = false;
let jogoAcertados = new Set();

function jogoEmbaralhrar(arr) {
    return arr.slice().sort(() => Math.random() - 0.5);
}

function sparkleEmCarta(el) {
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width  / 2;
    const cy = rect.top  + rect.height / 2;
    const cores = ['#ffd700','#ff9f43','#6c5ce7','#00b894','#fd79a8','#74b9ff'];
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
    for (let i = 0; i < 48; i++) {
        const p = document.createElement('div');
        const size = 6 + Math.random() * 7;
        p.className = 'confetti-piece';
        p.style.cssText = `
            left:${Math.random()*100}%;
            top:-${10 + Math.random()*20}px;
            width:${size}px; height:${size}px;
            background:${cores[Math.floor(Math.random()*cores.length)]};
            border-radius:${Math.random()>0.5?'50%':'2px'};
            animation:confettiFall ${0.8+Math.random()*0.9}s ease-in forwards;
            animation-delay:${Math.random()*0.6}s;
        `;
        wrap.appendChild(p);
    }
    setTimeout(() => wrap.remove(), 2200);
}

function iniciarJogo() {
    jogoMovimentos = 0; jogoPares = 0;
    jogoViradas = []; jogoTravado = false; jogoAcertados = new Set();

    document.getElementById('jogoMovimentos').textContent = '0';
    document.getElementById('jogoPares').textContent = '0/6';
    document.getElementById('jogoVitoria').style.display = 'none';
    document.getElementById('dicionarioJogo').style.display = 'none';

    const selecionados = jogoEmbaralhrar(TERMOS_JOGO).slice(0, 6);
    const cartas = jogoEmbaralhrar([...selecionados, ...selecionados]);

    document.getElementById('boardJogo').innerHTML = cartas.map(t => `
        <div class="carta" data-termo="${escapeHtml(t.termo)}" onclick="jogoClicar(this)">
            <div class="carta-inner">
                <div class="carta-capa">💼</div>
                <div class="carta-face">
                    <span class="carta-emoji">${t.emoji}</span>
                    <span class="carta-termo">${escapeHtml(t.termo)}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function jogoClicar(el) {
    if (jogoTravado || el.classList.contains('virada') || el.classList.contains('acertada')) return;

    el.classList.add('virada');
    jogoViradas.push(el);

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
        document.getElementById('jogoPares').textContent = `${jogoPares}/6`;
        sparkleEmCarta(a); sparkleEmCarta(b);
        jogoViradas = [];
        jogoTravado = false;
        if (jogoPares === 6) jogoVitoria();
    } else {
        setTimeout(() => {
            a.classList.remove('virada');
            b.classList.remove('virada');
            jogoViradas = [];
            jogoTravado = false;
        }, 900);
    }
}

function jogoVitoria() {
    let msg;
    if (jogoMovimentos <= 8)       msg = `Incrível! Apenas ${jogoMovimentos} movimentos. Memória de elefante! 🐘`;
    else if (jogoMovimentos <= 14) msg = `Muito bem! ${jogoMovimentos} movimentos. Continue treinando! 💪`;
    else                           msg = `Conseguiu! ${jogoMovimentos} movimentos. Da próxima será mais fácil! 😄`;

    document.getElementById('jogoVitoriaMensagem').textContent = msg;
    document.getElementById('jogoVitoria').style.display = 'flex';

    document.getElementById('dicionarioLista').innerHTML = [...jogoAcertados].map(termo => {
        const t = TERMOS_JOGO.find(x => x.termo === termo);
        return `<div class="def-item">
            <div class="def-header">${t.emoji} <strong>${escapeHtml(t.termo)}</strong></div>
            <div class="def-texto">${escapeHtml(t.def)}</div>
        </div>`;
    }).join('');
    document.getElementById('dicionarioJogo').style.display = 'block';
}
