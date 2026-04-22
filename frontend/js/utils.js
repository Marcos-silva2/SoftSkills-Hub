function mostrar(id, txt, tipo) {
    const el = document.getElementById(id);
    el.classList.remove('alerta-erro', 'alerta-sucesso', 'alerta-info');
    if (tipo) el.classList.add('alerta-' + tipo);
    el.textContent = txt;
    el.style.display = 'block';
}

function ocultar(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
}

function setBotao(id, carregando, textoOriginal) {
    const btn = document.getElementById(id);
    btn.disabled = carregando;
    btn.textContent = carregando ? 'Aguarde...' : textoOriginal;
}

function escapeHtml(str = '') {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function formatarData(iso) {
    return new Date(iso).toLocaleString('pt-BR', {
        day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit'
    });
}

function tempoRelativo(iso) {
    const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
    if (diff < 60)         return 'agora mesmo';
    if (diff < 3600)       return `há ${Math.floor(diff / 60)} min`;
    if (diff < 86400)      return `há ${Math.floor(diff / 3600)} h`;
    if (diff < 7 * 86400)  return `há ${Math.floor(diff / 86400)} dias`;
    return formatarData(iso);
}

function mostrarToast(msg, tipo = 'info', duracao = 3500) {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    const icons = { sucesso: '✅', erro: '❌', info: 'ℹ️' };
    const el = document.createElement('div');
    el.className = `toast toast-${tipo}`;
    el.style.cssText = 'position:relative;overflow:hidden;';
    el.innerHTML = `<span style="margin-right:6px;">${icons[tipo] || ''}</span>${msg}`;

    const bar = document.createElement('div');
    bar.style.cssText = 'position:absolute;bottom:0;left:0;height:3px;width:100%;background:rgba(255,255,255,0.35);border-radius:0 0 12px 12px;';
    el.appendChild(bar);
    container.appendChild(el);

    requestAnimationFrame(() => requestAnimationFrame(() => {
        bar.style.transition = `width ${duracao}ms linear`;
        bar.style.width = '0%';
    }));

    vibrar([20]);

    setTimeout(() => {
        el.style.animation = 'toastOut 0.3s ease forwards';
        setTimeout(() => el.remove(), 300);
    }, duracao);
}

function vibrar(pattern = [25]) {
    if ('vibrate' in navigator) navigator.vibrate(pattern);
}

function adicionarShake(el) {
    if (!el) return;
    el.classList.remove('shake');
    void el.offsetWidth;
    el.classList.add('shake');
    el.addEventListener('animationend', () => el.classList.remove('shake'), { once: true });
}

function animarBotaoSucesso(btn, textoSucesso = '✓ Salvo!') {
    if (!btn) return;
    const orig = btn.textContent;
    const origBg = btn.style.background;
    if (typeof gsap !== 'undefined') {
        gsap.timeline()
            .to(btn, { scale: 0.88, duration: 0.08 })
            .to(btn, { scale: 1, duration: 0.45, ease: 'elastic.out(1, 0.4)' })
            .call(() => { btn.textContent = textoSucesso; btn.style.background = '#27ae60'; })
            .to({}, { duration: 2 })
            .call(() => { btn.textContent = orig; btn.style.background = origBg; });
    } else {
        btn.textContent = textoSucesso;
        setTimeout(() => { btn.textContent = orig; }, 2000);
    }
}

function topBarInicio() {
    let bar = document.getElementById('topBar');
    if (!bar) {
        bar = document.createElement('div');
        bar.id = 'topBar'; bar.className = 'top-bar';
        document.body.appendChild(bar);
    }
    bar.style.opacity = '1'; bar.style.width = '35%';
}

function topBarFim() {
    const bar = document.getElementById('topBar');
    if (!bar) return;
    bar.style.width = '100%';
    setTimeout(() => {
        bar.style.opacity = '0';
        setTimeout(() => { bar.style.width = '0%'; bar.style.opacity = '1'; }, 350);
    }, 280);
}

function animarListaComScroll(containerEl, seletor = '.rank-item, .empresa-row, .artigo-item, .msg-card, .ponto-item, .artigo-card') {
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
            scrollTrigger: { trigger: el, start: 'top 96%', once: true }
        }));
        ScrollTrigger.refresh();
    } else {
        gsap.from(els, { y: 14, opacity: 0, duration: 0.32, stagger: 0.05,
            ease: 'power2.out', clearProps: 'transform,opacity' });
    }
}

function iniciarRipple() {
    document.addEventListener('click', function(e) {
        const btn = e.target.closest('button:not([disabled]), .empresa-row, .artigo-card');
        if (!btn) return;
        const rect = btn.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const wave = document.createElement('span');
        wave.className = 'ripple-wave';
        wave.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - rect.left - size / 2}px;top:${e.clientY - rect.top - size / 2}px;`;
        if (getComputedStyle(btn).position === 'static') btn.style.position = 'relative';
        btn.style.overflow = 'hidden';
        btn.appendChild(wave);
        wave.addEventListener('animationend', () => wave.remove());
    });
}

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
        }, { passive: true })
    );
}

function iniciarPullToRefresh(onRefresh) {
    let startY = 0, pulling = false;
    const indicator = document.createElement('div');
    indicator.className = 'ptr-indicator';
    indicator.innerHTML = '<span class="ptr-spinner"></span><span class="ptr-text">Puxe para atualizar</span>';
    document.body.appendChild(indicator);
    const txt = indicator.querySelector('.ptr-text');

    document.addEventListener('touchstart', e => {
        if (window.scrollY === 0) { startY = e.touches[0].clientY; pulling = true; }
    }, { passive: true });

    document.addEventListener('touchmove', e => {
        if (!pulling) return;
        const dy = e.touches[0].clientY - startY;
        if (dy > 55) { txt.textContent = 'Solte para atualizar'; indicator.classList.add('visivel'); }
    }, { passive: true });

    document.addEventListener('touchend', e => {
        if (!pulling) return;
        const dy = e.changedTouches[0].clientY - startY;
        if (dy > 55) {
            txt.textContent = 'Atualizando...';
            indicator.classList.add('atualizando');
            onRefresh(() => {
                indicator.classList.remove('visivel', 'atualizando');
                txt.textContent = 'Puxe para atualizar';
            });
        } else {
            indicator.classList.remove('visivel');
        }
        pulling = false;
    });
}

function emptyState(svgInner, titulo, sub = '') {
    return `<div class="estado-vazio">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${svgInner}</svg>
        <p class="ev-titulo">${titulo}</p>
        ${sub ? `<p class="ev-sub">${sub}</p>` : ''}
    </div>`;
}
