/**
 * jogo.js — Dicionário de Sobrevivência: O Idiomês Corporativo
 *
 * Jogo de flashcards: o usuário toca em cada card para revelar
 * a definição do termo corporativo. Ao descobrir todos, dispara
 * a tela de conclusão com confetti.
 */

const FLASHCARDS = [
    {
        emoji: '🗣️',
        termo: 'Feedback',
        def: 'O famoso "retorno". Quando alguém avalia o que você fez para dizer o que foi bom e o que pode melhorar.',
        dica: 'Não encare como bronca — é um mapa para você crescer!',
    },
    {
        emoji: '⏰',
        termo: 'Deadline',
        def: 'A data limite para entregar uma tarefa ou projeto.',
        dica: 'Respeitar o deadline é a forma mais rápida de mostrar que você é confiável.',
    },
    {
        emoji: '🤝',
        termo: 'Networking',
        def: 'Sua rede de contatos profissionais. Conversar com pessoas de outras áreas e manter boas relações.',
        dica: 'Pode abrir portas para futuras promoções ou novas vagas.',
    },
    {
        emoji: '🌩️',
        termo: 'Brainstorming',
        def: '"Tempestade de ideias". Reunião onde todos dão sugestões livremente para resolver um problema.',
        dica: 'No brainstorming, não existe ideia burra. O objetivo é a criatividade!',
    },
    {
        emoji: '🚪',
        termo: 'Onboarding',
        def: 'O processo de integração quando você entra na empresa: cultura, ferramentas e quem é quem.',
    },
    {
        emoji: '📋',
        termo: 'Briefing',
        def: 'O conjunto de instruções iniciais para realizar uma tarefa.',
        dica: 'Leia o briefing duas vezes antes de começar para evitar retrabalho.',
    },
    {
        emoji: '🧠',
        termo: 'Soft Skills',
        def: 'Habilidades comportamentais como empatia, paciência e trabalho em equipe. Diferentes das "Hard Skills" (técnicas).',
    },
    {
        emoji: '🎓',
        termo: 'Mentoria',
        def: 'Quando um profissional mais experiente orienta você na carreira.',
        dica: 'Uma oportunidade de ouro para aprender com os erros e acertos de quem já chegou lá.',
    },
];

// ── Estado ────────────────────────────────────────────────────────
let _estudados = new Set();

// Chamado por app.js ao navegar para outra view
function jogoLimpar() {}

// ── Inicialização ─────────────────────────────────────────────────

function iniciarJogo() {
    _estudados = new Set();
    _renderGrid();
    _atualizarProgresso();
    document.getElementById('jogoVitoria').style.display = 'none';
}

function reiniciarFlashcards() {
    document.getElementById('jogoVitoria').style.display = 'none';
    document.querySelectorAll('.flashcard').forEach(c => {
        c.classList.remove('virado', 'estudado');
    });
    _estudados = new Set();
    _atualizarProgresso();
}

// ── Render ────────────────────────────────────────────────────────

function _renderGrid() {
    const grid = document.getElementById('flashGrid');
    grid.innerHTML = FLASHCARDS.map((c, i) => `
        <div class="flashcard" id="fc-${i}" onclick="flipCard(${i})">
            <div class="flashcard-inner">
                <div class="flashcard-frente">
                    <span class="fc-emoji">${c.emoji}</span>
                    <span class="fc-termo">${escapeHtml(c.termo)}</span>
                    <span class="fc-hint">toque para revelar</span>
                </div>
                <div class="flashcard-verso">
                    <p class="fc-def">${escapeHtml(c.def)}</p>
                    ${c.dica ? `<div class="fc-dica">💡 ${escapeHtml(c.dica)}</div>` : ''}
                </div>
            </div>
        </div>`).join('');

    document.querySelectorAll('.flashcard').forEach((card, i) => {
        card.style.animationDelay = `${i * 0.07}s`;
    });
}

// ── Interação ─────────────────────────────────────────────────────

function flipCard(idx) {
    const card = document.getElementById(`fc-${idx}`);
    if (!card) return;

    const revelando = !card.classList.contains('virado');
    card.classList.toggle('virado');

    if (revelando) {
        card.classList.add('estudado');
        _estudados.add(idx);
        sparkleEmCarta(card);
        vibrar([8]);
        _atualizarProgresso();

        if (_estudados.size === FLASHCARDS.length) {
            setTimeout(_mostrarConclusao, 700);
        }
    }
}

// ── Progresso ─────────────────────────────────────────────────────

function _atualizarProgresso() {
    const total = FLASHCARDS.length;
    const visto = _estudados.size;
    document.getElementById('flashProgFill').style.width = `${(visto / total) * 100}%`;
    document.getElementById('flashProgLabel').textContent = visto === total
        ? '✅ Todos os termos descobertos!'
        : `${visto} de ${total} termos descobertos`;
}

// ── Conclusão ─────────────────────────────────────────────────────

function _mostrarConclusao() {
    document.getElementById('jogoVitoriaMensagem').textContent =
        'Agora você fala o idiomês corporativo como um profissional!';
    document.getElementById('jogoVitoria').style.display = 'flex';

    if (typeof gsap !== 'undefined') {
        gsap.from(document.querySelectorAll('.estrela.ativa'), {
            scale: 0, rotation: -30, duration: 0.5,
            stagger: 0.14, ease: 'elastic.out(1, 0.5)', delay: 0.2,
        });
    }

    dispararConfetti();
    tocarSomVitoria();
    vibrar([50, 80, 50, 80, 100]);
}

// ── Efeitos visuais e sonoros ─────────────────────────────────────

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

function tocarSomVitoria() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
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
