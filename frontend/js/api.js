const API = 'http://localhost:8000';

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
