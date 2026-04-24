/**
 * feedback.js — Feedback visual e háptico para o usuário.
 *
 * Funções: mostrarToast, vibrar, adicionarShake, animarBotaoSucesso
 *
 * Dependências: GSAP (opcional, carregado antes via CDN)
 */

/**
 * Exibe uma notificação toast temporária na parte inferior da tela.
 * @param {string} msg           Texto da mensagem
 * @param {'info'|'sucesso'|'erro'} [tipo='info']  Tipo visual
 * @param {number} [duracao=3500]  Tempo em ms antes de desaparecer
 */
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

    // Barra de progresso interna
    const bar = document.createElement('div');
    bar.style.cssText =
        'position:absolute;bottom:0;left:0;height:3px;width:100%;' +
        'background:rgba(255,255,255,0.35);border-radius:0 0 12px 12px;';
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

/**
 * Aciona vibração háptica no dispositivo (no-op em desktops).
 * @param {number[]} [pattern=[25]]  Padrão de vibração em milissegundos
 */
function vibrar(pattern = [25]) {
    if ('vibrate' in navigator) navigator.vibrate(pattern);
}

/**
 * Aplica a animação de shake (tremida) a um elemento DOM.
 * @param {HTMLElement|null} el
 */
function adicionarShake(el) {
    if (!el) return;
    el.classList.remove('shake');
    void el.offsetWidth; // força reflow para reiniciar a animação CSS
    el.classList.add('shake');
    el.addEventListener('animationend', () => el.classList.remove('shake'), { once: true });
}

/**
 * Anima um botão para estado de sucesso e restaura o texto original após 2s.
 * Usa GSAP se disponível; caso contrário usa setTimeout simples.
 * @param {HTMLElement|null} btn
 * @param {string} [textoSucesso='✓ Salvo!']
 */
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
