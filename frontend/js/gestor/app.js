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
    document.getElementById(id).classList.add('active');
    if (id === 'viewResumo')         { document.getElementById('navResumo').classList.add('active');       carregarResumo(); }
    if (id === 'viewProblemas')      { document.getElementById('navProblemas').classList.add('active');    carregarProblemas(); }
    if (id === 'viewEmpresas')       { document.getElementById('navEmpresas').classList.add('active');     carregarSatisfacaoEmpresas(); }
    if (id === 'viewDetalheEmpresa') { document.getElementById('navEmpresas').classList.add('active'); }
    if (id === 'viewTrilhas')        { document.getElementById('navTrilhas').classList.add('active');      carregarTrilhas(); }
    if (id === 'viewPerfilGestor')   { document.getElementById('navPerfilGestor').classList.add('active'); carregarPerfilGestor(); atualizarBtnTema(); }
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
        }
    } catch (e) {
        console.warn('[gestor init] servidor offline ou erro de rede:', e.message);
    }

    popularFiltroAnos();
    carregarFiltroEmpresas();
    carregarResumo();
})();
