let enqueteBloqueada = false;
let notaSelecionada = null;

function atualizarCardEnquete(lastEnqueteAt) {
    const SETE_DIAS_MS = 7 * 24 * 60 * 60 * 1000;
    if (!lastEnqueteAt) { enqueteBloqueada = false; return; }

    const ultima = new Date(lastEnqueteAt);
    const diff   = Date.now() - ultima.getTime();

    if (diff < SETE_DIAS_MS) {
        enqueteBloqueada = true;
        const diasRestantes = Math.max(1, Math.ceil((SETE_DIAS_MS - diff) / (24 * 60 * 60 * 1000)));
        const proxima = new Date(ultima.getTime() + SETE_DIAS_MS);
        const dataFmt = proxima.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

        const btn  = document.getElementById('btnIrEnquete');
        const card = document.getElementById('cardEnquete');
        const desc = document.getElementById('cardEnqueteDesc');

        btn.disabled = true;
        btn.textContent = `Disponível em ${diasRestantes} dia${diasRestantes > 1 ? 's' : ''}`;
        btn.style.opacity = '0.6';
        btn.style.cursor  = 'not-allowed';
        card.style.opacity = '0.75';
        desc.innerHTML = `Você já respondeu essa semana. 🔒<br>Próxima enquete disponível em <strong>${dataFmt}</strong>.`;
    } else {
        enqueteBloqueada = false;
    }
}

function atualizarProgresso() {
    const p1 = document.querySelectorAll('input[name="p1"]:checked').length > 0;
    const p3 = document.querySelector('input[name="efetivacao"]:checked') !== null;
    const p4 = notaSelecionada !== null;
    const total = [p1, p3, p4].filter(Boolean).length;
    document.getElementById('progFill').style.width = Math.round(total / 3 * 100) + '%';
    document.getElementById('progTexto').textContent = `${total} de 3 perguntas`;
}

document.getElementById('formEnquete').addEventListener('change', atualizarProgresso);

function selecionarNota(btn) {
    document.querySelectorAll('.escala-btn').forEach(b => b.classList.remove('selecionado'));
    btn.classList.add('selecionado');
    notaSelecionada = parseInt(btn.textContent);
    atualizarProgresso();
}

async function enviarEnquete() {
    ocultar('erroEnquete');
    ocultar('sucessoEnquete');

    const problemas  = [...document.querySelectorAll('input[name="p1"]:checked')].map(i => i.value);
    const positivos  = [...document.querySelectorAll('input[name="positivos"]:checked')].map(i => i.value);
    const negativos  = [...document.querySelectorAll('input[name="negativos"]:checked')].map(i => i.value);
    const efetivacao = document.querySelector('input[name="efetivacao"]:checked')?.value;

    if (problemas.length === 0) {
        mostrar('erroEnquete', 'Selecione ao menos uma opção na pergunta 1.', 'erro'); return;
    }
    if (!efetivacao) {
        mostrar('erroEnquete', 'Responda a pergunta 3 (efetivação).', 'erro'); return;
    }
    if (!notaSelecionada) {
        mostrar('erroEnquete', 'Selecione sua nota de satisfação na pergunta 4.', 'erro'); return;
    }

    const btn = document.getElementById('btnEnviarEnquete');
    btn.disabled = true; btn.textContent = 'Enviando...';

    try {
        await apiFetch('/enquete/responder', {
            method: 'POST',
            body: JSON.stringify({
                problemas,
                pontos_positivos: positivos,
                pontos_negativos: negativos,
                desejo_efetivacao: efetivacao,
                nota_satisfacao: notaSelecionada,
            }),
        });
        dispararConfetti();
        mostrarToast('✅ Respostas enviadas de forma totalmente anônima!', 'sucesso');
        document.getElementById('formEnquete').reset();
        notaSelecionada = null;
        document.querySelectorAll('.escala-btn').forEach(b => b.classList.remove('selecionado'));
        atualizarProgresso();
        setTimeout(() => navegarApp('viewInicio'), 2000);
    } catch (e) {
        mostrar('erroEnquete', e.message, 'erro');
    } finally {
        btn.disabled = false; btn.textContent = 'Enviar Respostas Anônimas';
    }
}
