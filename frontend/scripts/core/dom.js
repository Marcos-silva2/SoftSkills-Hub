/**
 * dom.js — Manipulação de DOM e sanitização.
 *
 * Funções: mostrar, ocultar, setBotao, escapeHtml, emptyState
 */

/**
 * Exibe um elemento de alerta com texto e tipo (erro | sucesso | info).
 * @param {string} id   ID do elemento
 * @param {string} txt  Mensagem a exibir
 * @param {string} tipo Classe CSS do tipo: 'erro', 'sucesso' ou 'info'
 */
function mostrar(id, txt, tipo) {
    const el = document.getElementById(id);
    el.classList.remove('alerta-erro', 'alerta-sucesso', 'alerta-info');
    if (tipo) el.classList.add('alerta-' + tipo);
    el.textContent = txt;
    el.style.display = 'block';
}

/**
 * Oculta um elemento pelo ID.
 * @param {string} id
 */
function ocultar(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
}

/**
 * Alterna o estado de carregamento de um botão.
 * @param {string}  id             ID do botão
 * @param {boolean} carregando     true para desabilitar e mostrar "Aguarde..."
 * @param {string}  textoOriginal  Texto a restaurar quando carregando = false
 */
function setBotao(id, carregando, textoOriginal) {
    const btn = document.getElementById(id);
    btn.disabled = carregando;
    btn.textContent = carregando ? 'Aguarde...' : textoOriginal;
}

/**
 * Escapa caracteres especiais HTML para prevenir XSS.
 * @param   {string} str
 * @returns {string}
 */
function escapeHtml(str = '') {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/**
 * Gera o HTML de um estado vazio (ícone + título + subtítulo opcional).
 * @param {string} svgInner  Conteúdo interno do elemento <svg>
 * @param {string} titulo    Texto principal
 * @param {string} [sub='']  Texto secundário opcional
 * @returns {string}  HTML pronto para ser injetado via innerHTML
 */
function emptyState(svgInner, titulo, sub = '') {
    return `<div class="estado-vazio">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24"
             fill="none" stroke="currentColor" stroke-width="1.5"
             stroke-linecap="round" stroke-linejoin="round">${svgInner}</svg>
        <p class="ev-titulo">${titulo}</p>
        ${sub ? `<p class="ev-sub">${sub}</p>` : ''}
    </div>`;
}
