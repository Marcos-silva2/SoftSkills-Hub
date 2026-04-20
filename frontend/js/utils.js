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
    const el = document.createElement('div');
    el.className = `toast toast-${tipo}`;
    el.textContent = msg;
    container.appendChild(el);
    setTimeout(() => {
        el.style.animation = 'toastOut 0.3s ease forwards';
        setTimeout(() => el.remove(), 300);
    }, duracao);
}

function emptyState(svgInner, titulo, sub = '') {
    return `<div class="estado-vazio">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${svgInner}</svg>
        <p class="ev-titulo">${titulo}</p>
        ${sub ? `<p class="ev-sub">${sub}</p>` : ''}
    </div>`;
}
