aplicarTema();
lucide.createIcons();

let _isAdmin = false;

function getToken() { return localStorage.getItem('ssh_token'); }

function sair() {
    localStorage.removeItem('ssh_token');
    localStorage.removeItem('ssh_username');
    window.location.href = 'index.html';
}

const _headerTema = {
    viewInicio: '', viewEnquete: '', viewJogo: 'tema-jogo',
    viewMural: 'tema-mural', viewTrilhas: 'tema-trilhas', viewPerfil: 'tema-perfil',
};

function navegarApp(id) {
    if (id === 'viewEnquete' && enqueteBloqueada) return;
    if (typeof jogoLimpar === 'function') jogoLimpar();

    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));

    const newView = document.getElementById(id);
    newView.classList.add('active');

    const h = document.querySelector('header');
    h.className = _headerTema[id] || '';

    if (typeof gsap !== 'undefined') {
        gsap.fromTo(newView,
            { x: 22, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.28, ease: 'power3.out', clearProps: 'transform,opacity' }
        );
        const cards = newView.querySelectorAll('.card, .kpi');
        if (cards.length) {
            gsap.from(cards, { y: 20, opacity: 0, duration: 0.38, stagger: 0.07,
                ease: 'power2.out', clearProps: 'transform,opacity' });
        }
    }

    let activeBtn;
    if (id === 'viewInicio' || id === 'viewEnquete' || id === 'viewJogo') {
        activeBtn = document.getElementById('navInicio');
        activeBtn.classList.add('active');
    }
    if (id === 'viewEnquete') { if (typeof enqueteIniciar === 'function') enqueteIniciar(); }
    if (id === 'viewJogo')  { iniciarJogo(); }
    if (id === 'viewMural') {
        activeBtn = document.getElementById('navMural');
        activeBtn.classList.add('active');
        const badge = document.getElementById('muralBadge');
        if (badge) badge.classList.remove('visivel');
        carregarMural();
    }
    if (id === 'viewTrilhas') { activeBtn = document.getElementById('navLeitura'); activeBtn.classList.add('active'); carregarArtigos(); }
    if (id === 'viewPerfil')  { activeBtn = document.getElementById('navPerfil');  activeBtn.classList.add('active'); carregarPerfil(); atualizarBtnTema(); }

    if (activeBtn && typeof gsap !== 'undefined') {
        gsap.fromTo(activeBtn, { scale: 0.78 }, { scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
    }
    atualizarNavPill(activeBtn);
    vibrar([12]);
}

(async function init() {
    const token = getToken();
    if (!token) { window.location.href = 'index.html'; return; }

    const usernameLocal = localStorage.getItem('ssh_username') || 'aprendiz';
    document.getElementById('saudacao').textContent = `Olá, ${usernameLocal}!`;

    try {
        const res = await fetch(`${API}/auth/aprendiz/me`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        if (res.status === 401) { sair(); return; }
        if (res.ok) {
            const perfil = await res.json();
            localStorage.setItem('ssh_username', perfil.username);
            document.getElementById('saudacao').textContent = `Olá, ${perfil.username}!`;
            atualizarCardEnquete(perfil.last_enquete_at);
            _isAdmin = perfil.is_admin === true;

            fetch(`${API}/auth/aprendiz/refresh`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${getToken()}` },
            }).then(r => r.ok ? r.json() : null).then(d => {
                if (d?.access_token) localStorage.setItem('ssh_token', d.access_token);
            }).catch(() => {});
        }
    } catch (e) {
        console.warn('[init] servidor offline ou erro de rede:', e.message);
    }

    carregarDicaDia();

    iniciarRipple();
    iniciarPressAnimation();
    initOfflineIndicator();
    setTimeout(() => atualizarNavPill(document.getElementById('navInicio'), false), 200);
    iniciarPullToRefresh(done => {
        const v = document.querySelector('.view.active');
        if (v?.id === 'viewTrilhas') carregarArtigos(true);
        else if (v) navegarApp(v.id);
        setTimeout(done, 900);
    });
})();
