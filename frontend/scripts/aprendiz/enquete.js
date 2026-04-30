let enqueteBloqueada = false;
let notaSelecionada  = null;
let _efetivacao      = null;
let _passoAtual      = 0;
const _TOTAL_PASSOS  = 4;

const _selecionados = { p1: new Set(), positivos: new Set(), negativos: new Set() };

function atualizarCardEnquete(lastEnqueteAt) {
    const SETE_DIAS_MS = 7 * 24 * 60 * 60 * 1000;
    if (!lastEnqueteAt) { enqueteBloqueada = false; return; }

    const ultima = new Date(lastEnqueteAt);
    const diff   = Date.now() - ultima.getTime();

    if (diff < SETE_DIAS_MS) {
        enqueteBloqueada = true;
        const diasRestantes = Math.max(1, Math.ceil((SETE_DIAS_MS - diff) / (24 * 60 * 60 * 1000)));
        const proxima = new Date(ultima.getTime() + SETE_DIAS_MS);
        const dataFmt = proxima.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

        const btn  = document.getElementById('btnIrEnquete');
        const card = document.getElementById('cardEnquete');
        const desc = document.getElementById('cardEnqueteDesc');

        btn.disabled = true;
        btn.textContent = `Disponível em ${diasRestantes} dia${diasRestantes > 1 ? 's' : ''}`;
        btn.style.opacity = '0.6';
        btn.style.cursor  = 'not-allowed';
        card.style.opacity = '0.75';
        desc.innerHTML = `Você já respondeu essa semana. 🔒<br>Próxima enquete disponível em <strong>${dataFmt}</strong>.`;
    } else {
        enqueteBloqueada = false;
    }
}

const _EXCLUSIVOS = { p1: 'nenhum', positivos: 'nenhum_pos', negativos: 'nenhum_neg' };

function _desselecionarPill(container, val) {
    const btn = container.querySelector(`[data-value="${val}"]`);
    if (btn) { btn.classList.remove('pill-selecionada'); }
}

function togglePill(btn, grupo) {
    const val = btn.dataset.value;
    const exclusivo = _EXCLUSIVOS[grupo];

    if (_selecionados[grupo].has(val)) {
        _selecionados[grupo].delete(val);
        btn.classList.remove('pill-selecionada');
        if (typeof gsap !== 'undefined') gsap.to(btn, { scale: 0.94, duration: 0.08, yoyo: true, repeat: 1 });
    } else {
        if (val === exclusivo) {
            // "Nenhum" selecionado — limpa todos os outros
            const container = btn.closest('.pill-group, .wizard-passo');
            _selecionados[grupo].forEach(v => {
                const el = container && container.querySelector(`[data-value="${v}"]`);
                if (el) el.classList.remove('pill-selecionada');
            });
            _selecionados[grupo].clear();
        } else if (_selecionados[grupo].has(exclusivo)) {
            // Outro item selecionado — remove o "nenhum"
            _selecionados[grupo].delete(exclusivo);
            _desselecionarPill(btn.closest('.wizard-passo') || document, exclusivo);
        }
        _selecionados[grupo].add(val);
        btn.classList.add('pill-selecionada');
        if (typeof gsap !== 'undefined') gsap.fromTo(btn, { scale: 0.9 }, { scale: 1, duration: 0.35, ease: 'elastic.out(1, 0.5)' });
    }
    vibrar([8]);
}

function selecionarEfetivacao(btn) {
    document.querySelectorAll('.efetivacao-card').forEach(c => c.classList.remove('selecionado'));
    btn.classList.add('selecionado');
    _efetivacao = btn.dataset.value;
    if (typeof gsap !== 'undefined') gsap.fromTo(btn, { scale: 0.96 }, { scale: 1, duration: 0.4, ease: 'elastic.out(1, 0.5)' });
    vibrar([12]);
}

function selecionarNota(btn) {
    document.querySelectorAll('.escala-btn').forEach(b => b.classList.remove('selecionado'));
    btn.classList.add('selecionado');
    notaSelecionada = parseInt(btn.textContent);
    if (typeof gsap !== 'undefined') gsap.fromTo(btn, { scale: 0.88 }, { scale: 1, duration: 0.4, ease: 'elastic.out(1, 0.5)' });
    vibrar([12]);
}

function _atualizarIndicador(novoPasso) {
    for (let i = 0; i < _TOTAL_PASSOS; i++) {
        const step   = document.getElementById(`wstep-${i}`);
        const circle = step.querySelector('.step-circle');
        step.classList.remove('ativo', 'concluido');
        if (i < novoPasso) {
            step.classList.add('concluido');
            circle.textContent = '✓';
        } else if (i === novoPasso) {
            step.classList.add('ativo');
            circle.textContent = i + 1;
        } else {
            circle.textContent = i + 1;
        }
        if (i < _TOTAL_PASSOS - 1) {
            const linha = document.getElementById(`wline-${i}`);
            if (i < novoPasso) linha.classList.add('concluida');
            else linha.classList.remove('concluida');
        }
    }
}

function _irParaPasso(novoPasso) {
    const passoAtualEl = document.getElementById(`passo-${_passoAtual}`);
    const passoNovoEl  = document.getElementById(`passo-${novoPasso}`);
    const avancar = novoPasso > _passoAtual;

    if (typeof gsap !== 'undefined') {
        gsap.to(passoAtualEl, {
            x: avancar ? -28 : 28, opacity: 0, duration: 0.2, ease: 'power2.in',
            onComplete: () => {
                passoAtualEl.style.display = 'none';
                gsap.set(passoNovoEl, { x: avancar ? 28 : -28, opacity: 0, display: 'block' });
                gsap.to(passoNovoEl, { x: 0, opacity: 1, duration: 0.26, ease: 'power3.out', clearProps: 'all' });
            }
        });
    } else {
        passoAtualEl.style.display = 'none';
        passoNovoEl.style.display = 'block';
    }

    _atualizarIndicador(novoPasso);
    _passoAtual = novoPasso;

    document.getElementById('btnVoltarWizard').style.display = novoPasso > 0 ? 'flex' : 'none';
    document.getElementById('btnProximoWizard').style.display = novoPasso < _TOTAL_PASSOS - 1 ? 'flex' : 'none';
    document.getElementById('btnEnviarEnquete').style.display = novoPasso === _TOTAL_PASSOS - 1 ? 'flex' : 'none';
    document.getElementById('erroEnquete').style.display = 'none';
}

function proximoPasso() {
    const erroEl = document.getElementById('erroEnquete');

    if (_passoAtual === 0 && _selecionados.p1.size === 0) {
        erroEl.textContent = 'Selecione ao menos uma opção.';
        erroEl.style.display = 'block';
        adicionarShake(erroEl); vibrar([30, 15, 30]); return;
    }
    if (_passoAtual === 1 && _selecionados.positivos.size === 0 && _selecionados.negativos.size === 0) {
        erroEl.textContent = 'Selecione ao menos um ponto positivo ou negativo.';
        erroEl.style.display = 'block';
        adicionarShake(erroEl); vibrar([30, 15, 30]); return;
    }
    if (_passoAtual === 2 && !_efetivacao) {
        erroEl.textContent = 'Selecione uma opção de efetivação.';
        erroEl.style.display = 'block';
        adicionarShake(erroEl); vibrar([30, 15, 30]); return;
    }
    _irParaPasso(_passoAtual + 1);
    vibrar([12]);
}

function passoAnterior() {
    _irParaPasso(_passoAtual - 1);
    vibrar([12]);
}

function dispararConfetti() {
    if (typeof confetti === 'undefined') return;
    const cores = ['#367a28', '#56c240', '#1e88e5', '#ffd700', '#ff6b6b'];
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.55 }, colors: cores });
    setTimeout(() => confetti({ particleCount: 60, angle: 60,  spread: 55, origin: { x: 0, y: 0.6 }, colors: cores }), 250);
    setTimeout(() => confetti({ particleCount: 60, angle: 120, spread: 55, origin: { x: 1, y: 0.6 }, colors: cores }), 400);
}

async function enviarEnquete() {
    const erroEl = document.getElementById('erroEnquete');
    erroEl.style.display = 'none';

    if (!notaSelecionada) {
        erroEl.textContent = 'Selecione sua nota de satisfação.';
        erroEl.style.display = 'block';
        adicionarShake(erroEl); vibrar([30, 15, 30]); return;
    }

    const btn = document.getElementById('btnEnviarEnquete');
    btn.disabled = true; btn.textContent = 'Enviando...';

    try {
        await apiFetch('/enquete/responder', {
            method: 'POST',
            body: JSON.stringify({
                problemas:         [..._selecionados.p1].filter(v => v !== 'nenhum'),
                pontos_positivos:  [..._selecionados.positivos].filter(v => v !== 'nenhum_pos'),
                pontos_negativos:  [..._selecionados.negativos].filter(v => v !== 'nenhum_neg'),
                desejo_efetivacao: _efetivacao,
                nota_satisfacao:   notaSelecionada,
            }),
        });

        dispararConfetti();
        animarBotaoSucesso(btn, '✓ Enviado!');
        mostrarToast('✅ Respostas enviadas de forma totalmente anônima!', 'sucesso');
        enqueteBloqueada = true;
        atualizarCardEnquete(new Date().toISOString());
        setTimeout(() => navegarApp('viewInicio'), 2500);
    } catch (e) {
        erroEl.textContent = e.message;
        erroEl.style.display = 'block';
        adicionarShake(erroEl); vibrar([30, 15, 30]);
        btn.disabled = false; btn.textContent = 'Enviar Respostas ✓';
    }
}
