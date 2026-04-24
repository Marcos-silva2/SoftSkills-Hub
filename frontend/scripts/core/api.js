// Em produção, troque pela URL real do Render após criar o serviço.
const API = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:8000'
    : 'https://softskills-hub.onrender.com';

function _expirarSessao() {
    localStorage.removeItem('ssh_token');
    localStorage.removeItem('ssh_token_gestor');
    window.location.href = 'index.html?sessao=expirada';
}

async function apiFetch(path, opts = {}) {
    if (typeof topBarInicio !== 'undefined') topBarInicio();
    const headers = { 'Content-Type': 'application/json', ...opts.headers };
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    let res;
    try {
        res = await fetch(API + path, { ...opts, headers });
    } catch {
        if (typeof topBarFim !== 'undefined') topBarFim();
        throw new Error(`Servidor não encontrado em ${API}. Verifique se o backend está rodando.`);
    }
    if (typeof topBarFim !== 'undefined') topBarFim();
    if (res.status === 401) { _expirarSessao(); throw new Error('Sessão expirada.'); }
    if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Erro de comunicação com o servidor.' }));
        const detail = Array.isArray(err.detail)
            ? err.detail.map(e => e.msg || JSON.stringify(e)).join(' | ')
            : (err.detail || 'Erro desconhecido');
        throw new Error(detail);
    }
    return res.json();
}

async function apiFetchComTotal(path, opts = {}) {
    if (typeof topBarInicio !== 'undefined') topBarInicio();
    const headers = { 'Content-Type': 'application/json', ...opts.headers };
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    let res;
    try {
        res = await fetch(API + path, { ...opts, headers });
    } catch {
        if (typeof topBarFim !== 'undefined') topBarFim();
        throw new Error(`Servidor não encontrado em ${API}. Verifique se o backend está rodando.`);
    }
    if (typeof topBarFim !== 'undefined') topBarFim();
    if (res.status === 401) { _expirarSessao(); throw new Error('Sessão expirada.'); }
    if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Erro de comunicação com o servidor.' }));
        const detail = Array.isArray(err.detail)
            ? err.detail.map(e => e.msg || JSON.stringify(e)).join(' | ')
            : (err.detail || 'Erro desconhecido');
        throw new Error(detail);
    }
    const total = parseInt(res.headers.get('X-Total-Count') || '0', 10);
    const data = await res.json();
    return { data, total };
}
