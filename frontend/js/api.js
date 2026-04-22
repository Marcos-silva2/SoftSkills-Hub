// Em produção, troque pela URL real do Render após criar o serviço.
const API = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:8000'
    : 'https://softskills-hub-api.onrender.com';

async function apiFetch(path, opts = {}) {
    const headers = { 'Content-Type': 'application/json', ...opts.headers };
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    let res;
    try {
        res = await fetch(API + path, { ...opts, headers });
    } catch {
        throw new Error(`Servidor não encontrado em ${API}. Verifique se o backend está rodando.`);
    }
    if (res.status === 401) { throw new Error('Sessão expirada. Faça login novamente.'); }
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
    const headers = { 'Content-Type': 'application/json', ...opts.headers };
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    let res;
    try {
        res = await fetch(API + path, { ...opts, headers });
    } catch {
        throw new Error(`Servidor não encontrado em ${API}. Verifique se o backend está rodando.`);
    }
    if (res.status === 401) { throw new Error('Sessão expirada. Faça login novamente.'); }
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
