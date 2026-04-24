/**
 * format.js — Formatação de datas e textos.
 *
 * Funções: formatarData, tempoRelativo
 */

/**
 * Formata uma string ISO 8601 no padrão brasileiro (dd/mm/aaaa hh:mm).
 * @param   {string} iso  Data no formato ISO 8601
 * @returns {string}
 */
function formatarData(iso) {
    return new Date(iso).toLocaleString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

/**
 * Retorna a diferença de tempo em linguagem natural relativa ao momento atual.
 * Ex: "agora mesmo", "há 3 min", "há 2 h", "há 4 dias".
 * Recai em formatarData() para datas com mais de 7 dias.
 * @param   {string} iso  Data no formato ISO 8601
 * @returns {string}
 */
function tempoRelativo(iso) {
    const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
    if (diff < 60)        return 'agora mesmo';
    if (diff < 3600)      return `há ${Math.floor(diff / 60)} min`;
    if (diff < 86400)     return `há ${Math.floor(diff / 3600)} h`;
    if (diff < 7 * 86400) return `há ${Math.floor(diff / 86400)} dias`;
    return formatarData(iso);
}
