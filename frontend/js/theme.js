function aplicarTema() {
    const armazenado = localStorage.getItem('ssh_tema');
    const sistemaEscuro = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const escuro = armazenado === 'escuro' || (!armazenado && sistemaEscuro);
    document.documentElement.classList.toggle('tema-escuro', escuro);
    atualizarBtnTema();
}

function alternarTema() {
    document.documentElement.classList.add('tema-transition');
    const agora = document.documentElement.classList.toggle('tema-escuro');
    localStorage.setItem('ssh_tema', agora ? 'escuro' : 'claro');
    atualizarBtnTema();
    setTimeout(() => document.documentElement.classList.remove('tema-transition'), 400);
}

function atualizarBtnTema() {
    const btn = document.getElementById('btnTema');
    if (!btn) return;
    const escuro = document.documentElement.classList.contains('tema-escuro');
    btn.textContent = escuro ? '☀️  Mudar para Modo Claro' : '🌙  Mudar para Modo Escuro';
}
