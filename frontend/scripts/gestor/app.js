aplicarTema();
lucide.createIcons();

function getToken() { return localStorage.getItem('ssh_token_gestor'); }

function sair() {
    localStorage.removeItem('ssh_token_gestor');
    localStorage.removeItem('ssh_gestor');
    window.location.href = 'index.html';
}

function navegarApp(id) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));

    const newView = document.getElementById(id);
    newView.classList.add('active');

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
    if (id === 'viewResumo')         { activeBtn = document.getElementById('navResumo');       activeBtn.classList.add('active'); carregarResumo(); }
    if (id === 'viewProblemas')      { activeBtn = document.getElementById('navProblemas');    activeBtn.classList.add('active'); carregarProblemas(); }
    if (id === 'viewEmpresas')       { activeBtn = document.getElementById('navEmpresas');     activeBtn.classList.add('active'); carregarSatisfacaoEmpresas(); }
    if (id === 'viewDetalheEmpresa') { activeBtn = document.getElementById('navEmpresas');     activeBtn.classList.add('active'); }
    if (id === 'viewTrilhas')        { activeBtn = document.getElementById('navTrilhas');      activeBtn.classList.add('active'); carregarTrilhas(); }
    if (id === 'viewPerfilGestor')   { activeBtn = document.getElementById('navPerfilGestor'); activeBtn.classList.add('active'); carregarPerfilGestor(); atualizarBtnTema(); }

    if (activeBtn && typeof gsap !== 'undefined') {
        gsap.fromTo(activeBtn, { scale: 0.78 }, { scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
    }
    atualizarNavPill(activeBtn);
    vibrar([12]);
}

(async function init() {
    const token = getToken();
    if (!token) { window.location.href = 'index.html'; return; }

    const nomeLocal = localStorage.getItem('ssh_gestor') || 'Gestor';
    document.getElementById('saudacaoGestor').textContent = `Olá, ${nomeLocal}!`;

    try {
        const res = await fetch(`${API}/auth/gestor/me`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        if (res.status === 401) { sair(); return; }
        if (res.ok) {
            const perfil = await res.json();
            const nome = perfil.nome || perfil.username || nomeLocal;
            localStorage.setItem('ssh_gestor', nome);
            document.getElementById('saudacaoGestor').textContent = `Olá, ${nome}!`;

            fetch(`${API}/auth/gestor/refresh`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${getToken()}` },
            }).then(r => r.ok ? r.json() : null).then(d => {
                if (d?.access_token) localStorage.setItem('ssh_token_gestor', d.access_token);
            }).catch(() => {});
        }
    } catch (e) {
        console.warn('[gestor init] servidor offline ou erro de rede:', e.message);
    }

    popularFiltroAnos();
    carregarFiltroEmpresas();
    carregarResumo();

    iniciarRipple();
    iniciarPressAnimation();
    initOfflineIndicator();
    setTimeout(() => atualizarNavPill(document.getElementById('navResumo'), false), 200);
    iniciarPullToRefresh(done => {
        const v = document.querySelector('.view.active');
        if (v) navegarApp(v.id);
        setTimeout(done, 900);
    });
})();
