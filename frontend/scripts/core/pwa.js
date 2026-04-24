/**
 * pwa.js — Recursos de Progressive Web App.
 *
 * Funções: iniciarPullToRefresh, initOfflineIndicator
 *
 * Dependências: feedback.js (mostrarToast)
 */

/**
 * Ativa o gesto de "puxar para atualizar" (pull-to-refresh) na tela.
 * Exibe um indicador visual no topo e chama onRefresh quando acionado.
 *
 * @param {function(done: function): void} onRefresh
 *   Callback executado ao soltar após puxar > 55px.
 *   Deve chamar done() quando a atualização concluir.
 */
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
        if (e.touches[0].clientY - startY > 55) {
            txt.textContent = 'Solte para atualizar';
            indicator.classList.add('visivel');
        }
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

/**
 * Inicia o monitoramento de conectividade e exibe um banner quando offline.
 * Mostra toast de "conexão restaurada" ao voltar online.
 */
function initOfflineIndicator() {
    const banner = document.createElement('div');
    banner.id = 'offlineBanner';
    banner.className = 'offline-banner';
    banner.setAttribute('role', 'status');
    banner.setAttribute('aria-live', 'polite');
    banner.textContent = '⚠️ Sem conexão — você está offline';
    document.body.appendChild(banner);

    function atualizar() {
        banner.classList.toggle('visivel', !navigator.onLine);
        if (navigator.onLine) mostrarToast('Conexão restaurada!', 'sucesso', 2500);
    }

    window.addEventListener('online', atualizar);
    window.addEventListener('offline', () => banner.classList.add('visivel'));
    if (!navigator.onLine) banner.classList.add('visivel');
}
