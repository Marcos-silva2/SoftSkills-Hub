/**
 * animations.js — Animações de interface e micro-interações.
 *
 * Funções: topBarInicio, topBarFim, animarListaComScroll,
 *          iniciarRipple, atualizarNavPill, iniciarPressAnimation
 *
 * Dependências: GSAP + ScrollTrigger (opcionais, carregados via CDN)
 */

/**
 * Inicia a barra de progresso no topo da tela (top loading bar).
 * Cria o elemento se ainda não existir.
 */
function topBarInicio() {
    let bar = document.getElementById('topBar');
    if (!bar) {
        bar = document.createElement('div');
        bar.id = 'topBar';
        bar.className = 'top-bar';
        document.body.appendChild(bar);
    }
    bar.style.opacity = '1';
    bar.style.width = '35%';
}

/**
 * Conclui e oculta a barra de progresso no topo da tela.
 */
function topBarFim() {
    const bar = document.getElementById('topBar');
    if (!bar) return;
    bar.style.width = '100%';
    setTimeout(() => {
        bar.style.opacity = '0';
        setTimeout(() => { bar.style.width = '0%'; bar.style.opacity = '1'; }, 350);
    }, 280);
}

/**
 * Anima itens de uma lista conforme entram na viewport (ScrollTrigger).
 * Sem GSAP, aplica animação em batch simples.
 * @param {HTMLElement|null} containerEl  Container pai (null = document)
 * @param {string} [seletor]              Seletor CSS dos itens a animar
 */
function animarListaComScroll(
    containerEl,
    seletor = '.rank-item, .empresa-row, .artigo-item, .msg-card, .ponto-item, .artigo-card',
) {
    if (typeof gsap === 'undefined') return;

    const els = containerEl
        ? containerEl.querySelectorAll(seletor)
        : document.querySelectorAll(seletor);
    if (!els.length) return;

    if (typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
        els.forEach(el => gsap.from(el, {
            y: 14, opacity: 0, duration: 0.32, ease: 'power2.out',
            clearProps: 'transform,opacity',
            scrollTrigger: { trigger: el, start: 'top 96%', once: true },
        }));
        ScrollTrigger.refresh();
    } else {
        gsap.from(els, { y: 14, opacity: 0, duration: 0.32, stagger: 0.05,
            ease: 'power2.out', clearProps: 'transform,opacity' });
    }
}

/**
 * Adiciona efeito ripple (ondulação) em cliques de botões e cards.
 * Deve ser chamada uma única vez na inicialização do app.
 */
function iniciarRipple() {
    document.addEventListener('click', function (e) {
        const btn = e.target.closest('button:not([disabled]), .empresa-row, .artigo-card');
        if (!btn) return;

        const rect = btn.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const wave = document.createElement('span');
        wave.className = 'ripple-wave';
        wave.style.cssText =
            `width:${size}px;height:${size}px;` +
            `left:${e.clientX - rect.left - size / 2}px;` +
            `top:${e.clientY - rect.top - size / 2}px;`;

        if (getComputedStyle(btn).position === 'static') btn.style.position = 'relative';
        btn.style.overflow = 'hidden';
        btn.appendChild(wave);
        wave.addEventListener('animationend', () => wave.remove());
    });
}

/**
 * Move a "pílula" indicadora da navegação inferior para o botão ativo.
 * @param {HTMLElement|null} activeBtn  Botão ativo no nav
 * @param {boolean} [animate=true]      Anima a transição com GSAP
 */
function atualizarNavPill(activeBtn, animate = true) {
    const pill = document.getElementById('navPill');
    if (!pill || !activeBtn) return;

    const navRect = pill.parentElement.getBoundingClientRect();
    const btnRect = activeBtn.getBoundingClientRect();
    const left  = btnRect.left - navRect.left + btnRect.width * 0.2;
    const width = btnRect.width * 0.6;
    const color = getComputedStyle(activeBtn).color;

    if (typeof gsap !== 'undefined' && animate) {
        gsap.to(pill, { left, width, backgroundColor: color, duration: 0.35, ease: 'power3.inOut' });
    } else {
        pill.style.left = left + 'px';
        pill.style.width = width + 'px';
        pill.style.backgroundColor = color;
    }
}

/**
 * Ativa animação de escala em toque (press) para botões via GSAP.
 * Deve ser chamada uma única vez na inicialização do app.
 */
function iniciarPressAnimation() {
    if (typeof gsap === 'undefined') return;

    document.addEventListener('touchstart', e => {
        const btn = e.target.closest('button:not([disabled])');
        if (btn) gsap.to(btn, { scale: 0.93, duration: 0.1, ease: 'power2.out', overwrite: true });
    }, { passive: true });

    ['touchend', 'touchcancel'].forEach(ev =>
        document.addEventListener(ev, e => {
            const btn = e.target.closest('button:not([disabled])');
            if (btn) gsap.to(btn, { scale: 1, duration: 0.45, ease: 'elastic.out(1, 0.4)', overwrite: true });
        }, { passive: true }),
    );
}
