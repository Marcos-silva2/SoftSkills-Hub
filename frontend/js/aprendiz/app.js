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

    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    document.getElementById(id).classList.add('active');

    const h = document.querySelector('header');
    h.className = _headerTema[id] || '';

    if (id === 'viewInicio' || id === 'viewEnquete' || id === 'viewJogo') {
        document.getElementById('navInicio').classList.add('active');
    }
    if (id === 'viewJogo')    { iniciarJogo(); }
    if (id === 'viewMural')   {
        document.getElementById('navMural').classList.add('active');
        const badge = document.getElementById('muralBadge');
        if (badge) { badge.classList.remove('visivel'); }
        carregarMural();
    }
    if (id === 'viewTrilhas') { document.getElementById('navLeitura').classList.add('active'); carregarArtigos(); }
    if (id === 'viewPerfil')  { document.getElementById('navPerfil').classList.add('active'); carregarPerfil(); atualizarBtnTema(); }
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
        }
    } catch (e) {
        console.warn('[init] servidor offline ou erro de rede:', e.message);
    }

    carregarDicaDia();
})();
