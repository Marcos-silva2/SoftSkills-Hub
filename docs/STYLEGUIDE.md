# STYLEGUIDE — SoftSkills Hub

Guia de referência de design e código para o projeto. Toda adição de interface deve seguir estas convenções para garantir consistência visual e de comportamento.

---

## Layout

- **Largura máxima:** `400px` — a aplicação é mobile-first e nunca ultrapassa esse valor.
- O container principal (`.app-container`) é centralizado horizontalmente com `display: flex; justify-content: center` no `<body>`.
- Padding inferior de `80px` no container para não sobrepor a barra de navegação fixa.
- Conteúdo das views usa `padding: 20px`.

```css
.app-container {
    width: 100%;
    max-width: 400px;
    min-height: 100vh;
    padding-bottom: 80px;
}
```

---

## Paleta de cores

Definidas como variáveis CSS no `:root` de cada painel. Todas as cores de ação passam no critério **WCAG AA (≥ 4.5:1)** com texto branco.

| Variável         | Hex (light)  | Hex (dark)   | Uso principal                                       |
|------------------|--------------|--------------|-----------------------------------------------------|
| `--verde`        | `#367a28`    | `#4fb53e`    | Cor primária — header, botões, destaques (aprendiz) |
| `--verde-claro`  | `#e8f5e9`    | `#1a3a16`    | Fundo de hover em checkboxes e badges leves         |
| `--laranja`      | `#c4521a`    | `#e0693a`    | Cor de destaque — painel do gestor                  |
| `--laranja-claro`| `#fff3ee`    | `#2a1a0e`    | Fundo de hover leve no painel do gestor             |
| `--roxo`         | `#8e44ad`    | `#b06ccc`    | Cor do jogo de memória                              |
| `--fundo`        | `#f4f7f6`    | `#121212`    | Fundo da aplicação                                  |
| `--card`         | `#ffffff`    | `#1e1e1e`    | Fundo de cards                                      |
| `--texto`        | `#333333`    | `#e4e4e4`    | Texto principal                                     |
| `--muted`        | `#777777`    | `#9e9e9e`    | Texto secundário, placeholders                      |

> Nunca use `#4C9F38` ou `#FD6925` diretamente — esses eram os valores antigos que falhavam no critério de contraste WCAG AA com texto branco.

---

## Dark Mode

O tema escuro é ativado adicionando a classe `tema-escuro` ao elemento `<html>`. A classe é gerenciada por JavaScript, que respeita a preferência salva no `localStorage` ou detecta a configuração do sistema operacional.

### Estrutura CSS

```css
html.tema-escuro {
    --verde: #4fb53e;
    --fundo: #121212;
    --card:  #1e1e1e;
    --texto: #e4e4e4;
    --muted: #9e9e9e;
    /* ... demais variáveis ... */
}

html.tema-escuro input,
html.tema-escuro select { background: #2a2a2a !important; border-color: #3a3a3a; }
html.tema-escuro .perfil-info-row { border-color: #3a3a3a; }
html.tema-escuro .msg-card { background: #2a2a2a; border-color: #3a3a3a; }
html.tema-escuro .skeleton {
    background: linear-gradient(90deg, #2a2a2a 25%, #383838 50%, #2a2a2a 75%);
    background-size: 200% 100%;
}
```

### Transição suave de tema

Ao alternar o tema, aplicar temporariamente a classe `tema-transition` no `<html>` para animar todas as propriedades de cor simultaneamente:

```css
html.tema-transition * {
    transition: background-color 0.3s ease, color 0.3s ease,
                border-color 0.3s ease, box-shadow 0.3s ease !important;
}
```

```javascript
function alternarTema() {
    document.documentElement.classList.add('tema-transition');
    const agora = document.documentElement.classList.toggle('tema-escuro');
    localStorage.setItem('ssh_tema', agora ? 'escuro' : 'claro');
    atualizarBtnTema();
    setTimeout(() => document.documentElement.classList.remove('tema-transition'), 400);
}
```

A classe deve ser **removida após 400ms** para não deixar transitions ativas permanentemente (o que tornaria scrolls e hovers lentos).

### Ativação via JavaScript

```javascript
function aplicarTema() {
    const armazenado = localStorage.getItem('ssh_tema'); // 'escuro' | 'claro' | null
    const sistemaEscuro = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const escuro = armazenado === 'escuro' || (!armazenado && sistemaEscuro);
    document.documentElement.classList.toggle('tema-escuro', escuro);
    atualizarBtnTema();
}

function atualizarBtnTema() {
    const btn = document.getElementById('btnTema');
    if (!btn) return;
    const escuro = document.documentElement.classList.contains('tema-escuro');
    btn.textContent = escuro ? '☀️  Mudar para Modo Claro' : '🌙  Mudar para Modo Escuro';
}
```

`aplicarTema()` deve ser a **primeira chamada** do bloco `<script>` para evitar flash de tema errado.

---

## Tipografia

- **Font stack:** `'Inter', 'Segoe UI', sans-serif` — carregada via Google Fonts CDN
- Reset global: `* { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Inter', 'Segoe UI', sans-serif; }`
- **Line-height global:** `body { line-height: 1.5; }` — melhora legibilidade em todos os textos

### Google Fonts (Inter)

Adicionar no `<head>` de cada página, antes do `<style>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

| Elemento              | Tamanho      | Peso    |
|-----------------------|--------------|---------|
| Header `h1`           | `1.4rem`     | 700     |
| Header subtítulo `p`  | `0.8rem`     | 400     |
| Card título `h3`      | `1.1rem`     | 600     |
| Card texto `p`        | `0.9rem`     | 400     |
| Rótulos de pergunta   | `0.95rem`    | 700     |
| Items de lista        | `0.88rem`    | 400     |
| Texto muted           | `0.85rem`    | 400     |
| Label de input        | `0.78rem`    | 600     |

---

## Bibliotecas externas

| Biblioteca        | CDN                                                               | Uso                                   |
|-------------------|-------------------------------------------------------------------|---------------------------------------|
| **Inter**         | `https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700` | Tipografia principal             |
| **Lucide Icons**  | `https://unpkg.com/lucide@latest/dist/umd/lucide.min.js`         | Ícones vetoriais na bottom-nav        |
| **marked.js v9**  | `https://cdn.jsdelivr.net/npm/marked@9/marked.min.js`            | Renderização de Markdown nos artigos  |

Ordem obrigatória de inicialização no `<script>`:

```javascript
// 1. Tema (evita flash de cor errada)
aplicarTema();
// 2. Ícones Lucide (substitui <i data-lucide="nome"> por <svg>)
lucide.createIcons();
// 3. Constantes e estado global
const API = 'http://localhost:8000';
// 4. Validação de sessão + carregamento inicial
init();
```

---

## Componentes

### Logo SVG (landing page)

O logotipo em `index.html` é um SVG inline — sem dependência de arquivo externo. Estrutura: círculo com gradiente verde, silhueta de pessoa centralizada, estrela dourada no canto superior direito.

```html
<svg width="72" height="72" viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#56c240;stop-opacity:1"/>
      <stop offset="100%" style="stop-color:#2a5e1e;stop-opacity:1"/>
    </linearGradient>
  </defs>
  <circle cx="36" cy="36" r="36" fill="url(#logoGrad)"/>
  <!-- silhueta de pessoa -->
  <circle cx="36" cy="24" r="9" fill="white" opacity="0.9"/>
  <path d="M18 56 Q18 42 36 42 Q54 42 54 56" fill="white" opacity="0.9"/>
  <!-- estrela dourada -->
  <text x="52" y="16" font-size="14" fill="#ffd700">★</text>
</svg>
```

---

### Header com gradiente

O header usa `linear-gradient` em vez de cor sólida. A cor muda por aba ativa no painel do aprendiz via classe CSS.

**Painel aprendiz (padrão verde):**

```css
header {
    background: linear-gradient(135deg, #2a5e1e, #56c240);
    color: white;
    padding: 30px 20px 20px;
    border-bottom-left-radius: 20px;
    border-bottom-right-radius: 20px;
    text-align: center;
    transition: background 0.4s ease;
}
html.tema-escuro header { background: linear-gradient(135deg, #1a3a12, #2a5e1e); }
```

**Classes de cor por aba (aprendiz):**

```css
header.tema-mural    { background: linear-gradient(135deg, #1a3a6e, #3a7bd5); }
header.tema-trilhas  { background: linear-gradient(135deg, #6e3a1a, #d5823a); }
header.tema-perfil   { background: linear-gradient(135deg, #5c1a6e, #a83ad5); }
header.tema-jogo     { background: linear-gradient(135deg, #1a5c6e, #3ab5d5); }

html.tema-escuro header.tema-mural   { background: linear-gradient(135deg, #0a1a3a, #1a3a6e); }
html.tema-escuro header.tema-trilhas { background: linear-gradient(135deg, #3a1a08, #6b2e0e); }
html.tema-escuro header.tema-perfil  { background: linear-gradient(135deg, #2a0a3a, #4a1a6e); }
html.tema-escuro header.tema-jogo    { background: linear-gradient(135deg, #0a2a3a, #1a4a5e); }
```

**Painel gestor (laranja):**

```css
header {
    background: linear-gradient(135deg, #a8461a, #e87c40);
    transition: background 0.4s ease;
}
html.tema-escuro header { background: linear-gradient(135deg, #3a1a08, #6b2e0e); }
```

**Troca de cor via JavaScript (aprendiz):**

```javascript
const _headerTema = {
    viewInicio: '',
    viewMural: 'tema-mural',
    viewTrilhas: 'tema-trilhas',
    viewPerfil: 'tema-perfil',
    viewJogo: 'tema-jogo',
};

function navegarApp(view) {
    // ... lógica de troca de view ...
    const header = document.querySelector('header');
    header.className = _headerTema[view] || '';
}
```

---

### Card

Container padrão para agrupar conteúdo. Cards clicáveis (artigos, empresa-rows) ganham lift no hover:

```css
.card {
    background-color: var(--card);
    border-radius: 15px;
    padding: 20px;
    margin-bottom: 15px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.03);
}

/* Cards clicáveis */
.artigo-card, .empresa-row {
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
}
.artigo-card:hover, .empresa-row:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.08);
}
```

---

### Botões

Touch targets mínimos de **44px de altura** para todos os botões interativos (padrão WCAG 2.5.5).

**Botão primário** (ação principal da tela):

```css
.btn-verde {
    width: 100%; padding: 15px; min-height: 44px;
    background-color: var(--verde); color: white;
    border: none; border-radius: 12px;
    font-size: 1rem; font-weight: bold;
    cursor: pointer; transition: 0.3s;
}
.btn-verde:hover:not(:disabled) { background-color: #2a5e1e; }
.btn-verde:disabled { opacity: 0.6; cursor: not-allowed; }
```

**Botão destrutivo** (sair, excluir):

```css
.btn-sair-perfil {
    width: 100%; padding: 14px; min-height: 44px;
    border: 1px solid #e74c3c; border-radius: 12px;
    background: transparent; color: #e74c3c;
    font-weight: bold; cursor: pointer; transition: 0.2s;
}
.btn-sair-perfil:hover { background: #e74c3c; color: white; }
```

**Botão de tema** (toggle dark/light mode):

```css
.btn-tema {
    width: 100%; padding: 13px 16px; min-height: 44px;
    border-radius: 10px; border: 2px solid #ddd;
    background: transparent; color: var(--texto);
    font-size: 0.9rem; font-weight: bold;
    cursor: pointer; transition: 0.2s;
}
.btn-tema:hover { border-color: var(--verde); color: var(--verde); }
```

---

### Inputs e Formulários

Todo input de formulário deve ter um `<label>` visível acima — nunca use apenas `placeholder`.

```html
<label class="input-label" for="meuInput">Nome do campo</label>
<input class="input-perfil" id="meuInput" type="text" placeholder="Dica de preenchimento">
```

```css
.input-label {
    display: block; font-size: 0.78rem; font-weight: 600;
    color: var(--muted); margin-bottom: 5px; letter-spacing: 0.3px;
}

.input-perfil {
    width: 100%; padding: 12px 14px; border: 1px solid #ddd;
    border-radius: 10px; background: #fafafa; font-size: 0.9rem;
    outline: none; transition: 0.2s; margin-bottom: 10px;
}

.input-perfil:focus,
input:focus,
select:focus {
    border-color: var(--verde);
    background: #fff;
    box-shadow: 0 0 0 3px rgba(54,122,40,0.15);
}
```

> No painel do gestor, o focus ring usa `rgba(196,82,26,0.15)` (laranja) no modo claro e `rgba(224,105,58,0.2)` no escuro.

#### Inputs com ícone (login)

Na landing page, inputs de login têm ícone SVG inline à esquerda:

```css
.input-wrap { position: relative; margin-bottom: 12px; }
.input-wrap input { width: 100%; padding: 12px 14px 12px 42px; /* espaço para ícone */ }
.input-icon {
    position: absolute; left: 13px; top: 50%; transform: translateY(-50%);
    width: 18px; height: 18px; color: var(--muted); pointer-events: none;
}
```

```html
<div class="input-wrap">
    <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
         fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
    </svg>
    <input type="text" placeholder="Usuário">
</div>
```

#### Medidor de força de senha

Exibido abaixo do campo de senha no cadastro. Composto por 4 barras coloridas + label textual.

```css
.senha-strength { margin-top: 6px; }
.strength-bars  { display: flex; gap: 4px; margin-bottom: 4px; }
.strength-bar   { flex: 1; height: 4px; border-radius: 2px; background: #e0e0e0; transition: 0.3s; }
.strength-label { font-size: 0.72rem; color: var(--muted); }
```

```javascript
function avaliarSenha(v) {
    let score = 0;
    if (v.length >= 6)  score++;
    if (v.length >= 10) score++;
    if (/[a-zA-Z]/.test(v) && /[0-9]/.test(v)) score++;
    if (/[^a-zA-Z0-9]/.test(v) || v.length >= 14) score++;

    const cores  = ['#e74c3c', '#e67e22', '#f39c12', '#27ae60'];
    const labels = ['Muito fraca', 'Fraca', 'Média', 'Forte'];
    document.querySelectorAll('.strength-bar').forEach((bar, i) => {
        bar.style.background = i < score ? cores[score - 1] : '#e0e0e0';
    });
    document.querySelector('.strength-label').textContent = v.length ? labels[score - 1] || '' : '';
}
```

---

### Alertas / Mensagens de feedback

Erros de validação de formulário ficam **inline** (próximos ao campo). Confirmações de sucesso usam **toast** (ver seção Toast).

```css
.alerta { padding: 10px 14px; border-radius: 10px; font-size: 0.85rem; display: none; line-height: 1.4; }
.alerta-erro    { background: #fdecea; color: #c0392b; border: 1px solid #f5c6cb; }
.alerta-sucesso { background: #e8f5e9; color: #2e7d32; border: 1px solid #c8e6c9; }
.alerta-info    { background: #fff8e1; color: #856404; border: 1px solid #ffeeba; }
```

---

### Toast

Notificações flutuantes para confirmações de sucesso. Aparecem acima da bottom-nav e somem automaticamente após 3,5 s.

```css
.toast-container {
    position: fixed; bottom: 90px; left: 50%; transform: translateX(-50%);
    z-index: 999; display: flex; flex-direction: column-reverse; align-items: center;
    gap: 8px; width: calc(100% - 40px); max-width: 360px; pointer-events: none;
}
.toast {
    padding: 12px 18px; border-radius: 12px; font-size: 0.85rem; line-height: 1.4;
    text-align: center; box-shadow: 0 4px 20px rgba(0,0,0,0.25);
    animation: toastIn 0.3s ease; width: 100%; font-weight: 500; pointer-events: auto;
}
.toast-sucesso { background: #2e7d32; color: white; }
.toast-erro    { background: #c0392b; color: white; }
.toast-info    { background: #1a1a2e; color: white; }
```

```javascript
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
```

---

### Skeleton Loading

Shimmer animado exibido enquanto dados da API carregam.

```css
.skeleton {
    display: block;
    background: linear-gradient(90deg, #ebebeb 25%, #f5f5f5 50%, #ebebeb 75%);
    background-size: 200% 100%;
    animation: skeletonPulse 1.4s ease-in-out infinite;
    border-radius: 4px;
}
@keyframes skeletonPulse {
    0%   { background-position:  200% 0; }
    100% { background-position: -200% 0; }
}
html.tema-escuro .skeleton {
    background: linear-gradient(90deg, #2a2a2a 25%, #383838 50%, #2a2a2a 75%);
    background-size: 200% 100%;
}
```

**Helpers JS disponíveis:**

| Função              | Painel    | Uso                              |
|---------------------|-----------|----------------------------------|
| `skeletonMensagem(n)` | Aprendiz | Cards do mural durante carregamento |
| `skeletonArtigo(n)`   | Aprendiz | Cards de artigo durante carregamento |
| `skeletonPerfilRow(n)`| Aprendiz | Linhas do perfil durante carregamento |
| `skeletonKpi(n)`      | Gestor   | Grid de KPIs durante carregamento |
| `skeletonRank(n)`     | Gestor   | Lista de ranking durante carregamento |
| `skeletonEmpresa(n)`  | Gestor   | Cards de empresa durante carregamento |

---

### Estados Vazios (Empty States)

```css
.estado-vazio { text-align: center; padding: 40px 20px; }
.estado-vazio svg { margin: 0 auto 14px; display: block; opacity: 0.35; color: var(--muted); }
.estado-vazio .ev-titulo { font-size: 0.92rem; font-weight: 600; color: var(--texto); margin-bottom: 4px; }
.estado-vazio .ev-sub { font-size: 0.82rem; color: var(--muted); }
```

```javascript
function emptyState(svgInner, titulo, sub = '') {
    return `<div class="estado-vazio">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24"
             fill="none" stroke="currentColor" stroke-width="1.5"
             stroke-linecap="round" stroke-linejoin="round">${svgInner}</svg>
        <p class="ev-titulo">${titulo}</p>
        ${sub ? `<p class="ev-sub">${sub}</p>` : ''}
    </div>`;
}
```

---

### KPI Grid (dashboard do gestor)

Os valores contam de 0 até o alvo com easing ao carregar (ver `animarContagem`).

```css
.kpi-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 15px; }
.kpi { background: var(--card); border-radius: 14px; padding: 22px 16px; text-align: center; }
.kpi .valor { font-size: 2rem; font-weight: bold; color: var(--laranja); line-height: 1; }
.kpi .label { font-size: 0.78rem; color: var(--muted); margin-top: 8px; line-height: 1.4; }
```

**HTML — atributos de dados para animação:**

```html
<div class="kpi">
    <div class="valor" data-alvo="87" data-sufixo="%" data-decimais="0">—</div>
    <div class="label">Satisfação média</div>
</div>
```

**Animação de contagem:**

```javascript
function animarContagem(el, alvo, sufixo = '', decimais = 0, duracao = 900) {
    const inicio = performance.now();
    function tick(agora) {
        const t = Math.min((agora - inicio) / duracao, 1);
        const ease = t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2;
        el.textContent = (alvo * ease).toFixed(decimais) + sufixo;
        if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
}

// Acionamento após carregarResumo():
document.querySelectorAll('.kpi .valor[data-alvo]').forEach(el => {
    animarContagem(el,
        parseFloat(el.dataset.alvo),
        el.dataset.sufixo || '',
        parseInt(el.dataset.decimais || '0')
    );
});
```

---

### Ranking (dashboard do gestor)

Os 3 primeiros itens recebem medalhas e fundo destacado.

```css
.rank-item { display: flex; align-items: center; gap: 14px; padding: 14px 4px; border-bottom: 1px solid #f0f0f0; }
.rank-item:last-child { border-bottom: none; }
.rank-num   { font-size: 0.8rem; font-weight: bold; color: var(--muted); min-width: 24px; text-align: center; }
.rank-label { flex: 1; font-size: 0.88rem; color: var(--texto); line-height: 1.4; }
.rank-val   { font-size: 0.88rem; font-weight: bold; color: var(--laranja); flex-shrink: 0; }
```

```javascript
const medalhas = ['🥇', '🥈', '🥉'];
const bgPodio  = ['#fff8e1', '#f5f5f5', '#fff3ee'];

itens.forEach((item, idx) => {
    const num   = idx < 3 ? medalhas[idx] : `${idx + 1}`;
    const fundo = idx < 3 ? `background:${bgPodio[idx]};border-radius:8px;padding:4px 8px;` : '';
    // ... montar HTML com num e fundo ...
});
```

---

### Estrelas coloridas por nota

No painel do gestor, `★` são coloridas de acordo com a nota média.

```javascript
function estrelas(media) {
    return [1,2,3,4,5].map(n => {
        let cor;
        if (media >= 4)      cor = '#27ae60';
        else if (media >= 3) cor = '#f39c12';
        else                 cor = '#e74c3c';
        const opacidade = n <= Math.round(media) ? '1' : '0.25';
        return `<span style="color:${cor};opacity:${opacidade}">★</span>`;
    }).join('');
}
```

---

### Barra de avaliação por empresa

Cada linha de empresa no painel do gestor exibe uma barra fina colorida pela nota média de satisfação:

```javascript
const corBarra = media >= 4 ? '#27ae60' : media >= 3 ? '#f39c12' : '#e74c3c';
// HTML injetado abaixo do nome da empresa:
`<div style="height:5px;border-radius:3px;background:#eee;margin-top:6px;">
    <div style="height:100%;width:${(media/5)*100}%;background:${corBarra};border-radius:3px;transition:width 0.6s ease;"></div>
</div>`
```

---

### Navegação inferior (SPA)

Usa ícones vetoriais da biblioteca **Lucide Icons**. Todos os botões têm `aria-label` descritivo para acessibilidade.

```html
<nav class="bottom-nav">
    <button id="navInicio" class="nav-item active"
            aria-label="Tela inicial"
            onclick="navegarApp('viewInicio')">
        <i data-lucide="home"></i>
        <span>Início</span>
    </button>
</nav>
```

```css
.bottom-nav {
    position: fixed; bottom: 0; width: 100%; max-width: 400px;
    background: var(--card); display: flex; justify-content: space-around;
    padding: 10px 0 15px; border-top: 1px solid #eee;
    border-top-left-radius: 20px; border-top-right-radius: 20px;
}
.nav-item { display: flex; flex-direction: column; align-items: center;
            font-size: 0.75rem; color: var(--muted); background: none;
            border: none; cursor: pointer; transition: 0.2s; padding: 0 8px;
            position: relative; }
.nav-item svg { width: 22px; height: 22px; margin-bottom: 4px;
                stroke: currentColor; transition: transform 0.2s; }
.nav-item.active { color: var(--verde); font-weight: bold; }
.nav-item.active svg { transform: translateY(-2px); }
```

#### Badge de notificação (nav)

Círculo vermelho posicionado absolutamente sobre o ícone para indicar conteúdo novo:

```css
.nav-badge {
    position: absolute; top: -2px; right: 2px;
    background: #e74c3c; color: white;
    font-size: 0.6rem; font-weight: bold;
    width: 16px; height: 16px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    opacity: 0; transform: scale(0); transition: 0.2s;
}
.nav-badge.visivel { opacity: 1; transform: scale(1); }
```

```html
<button class="nav-item" id="navMural" onclick="navegarApp('viewMural')">
    <i data-lucide="message-circle"></i>
    <span id="muralBadge" class="nav-badge">!</span>
    <span>Mural</span>
</button>
```

**Mapeamento de ícones:**

| View               | Ícone Lucide      | aria-label               |
|--------------------|-------------------|--------------------------|
| Início (aprendiz)  | `home`            | "Tela inicial"           |
| Mural              | `message-circle`  | "Mural da comunidade"    |
| Trilhas            | `book-open`       | "Trilhas de leitura"     |
| Perfil (aprendiz)  | `user`            | "Meu perfil"             |
| Resumo (gestor)    | `bar-chart-2`     | "Resumo geral"           |
| Problemas (gestor) | `alert-triangle`  | "Ranking de problemas"   |
| Empresas (gestor)  | `building-2`      | "Dados por empresa"      |
| Perfil (gestor)    | `user`            | "Perfil do gestor"       |

---

### Filtros de categoria (Trilhas de Soft Skills)

```css
.categoria-filtros { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; padding: 0 20px; }
.btn-categoria {
    padding: 5px 12px; min-height: 36px; border-radius: 20px;
    border: 1px solid #ddd; background: #f5f5f5;
    color: var(--muted); font-size: 0.78rem; font-weight: bold;
    cursor: pointer; transition: 0.2s;
}
.btn-categoria:hover { border-color: var(--verde); color: var(--verde); }
.btn-categoria.ativo { background: var(--verde); color: white; border-color: var(--verde); }
```

---

### Conteúdo de artigos (Markdown)

O campo `conteudo` dos artigos é armazenado em Markdown e renderizado pelo `marked.js`. **Não use `escapeHtml()` no conteúdo de artigos** — use `marked.parse()`.

```css
.artigo-body h1, .artigo-body h2, .artigo-body h3 { color: var(--verde); margin: 12px 0 6px; }
.artigo-body p  { margin-bottom: 8px; }
.artigo-body ul, .artigo-body ol { padding-left: 20px; margin-bottom: 8px; }
.artigo-body blockquote { border-left: 3px solid var(--verde); padding-left: 10px; color: var(--muted); }
```

---

### Contador de caracteres (Mural)

```css
.mural-contador { font-size: 0.75rem; color: var(--muted); text-align: right; margin-top: -4px; }
```

```javascript
function atualizarContadorMural() {
    const n = document.getElementById('txtMensagem').value.length;
    const contador = document.getElementById('contadorMural');
    contador.textContent = `${n} / 500`;
    contador.style.color = n > 450 ? '#e74c3c' : 'var(--muted)';
}
```

---

### Checkbox e Radio (enquete)

```css
.checkbox-item {
    display: flex; align-items: flex-start; gap: 10px;
    font-size: 0.85rem; background: #fafafa;
    padding: 10px; border-radius: 8px; border: 1px solid #eee;
    cursor: pointer; transition: 0.2s;
}
.checkbox-item:hover { background: var(--verde-claro); border-color: var(--verde); }
```

#### Scroll-box com gradiente de fade

O `.scroll-box` exibe um gradiente de desbotamento no topo e no fundo para indicar overflow. Usa `background-attachment: local` — sem wrapper adicional.

```css
.scroll-box {
    max-height: 220px; overflow-y: auto;
    border: 1px solid #eee; border-radius: 10px; padding: 10px;
    background-image:
        linear-gradient(to bottom, var(--card) 0%, transparent 30px),
        linear-gradient(to top,    var(--card) 0%, transparent 30px);
    background-attachment: local, local;
}
```

---

### Escala de satisfação (1–5)

Os botões têm cor progressiva (vermelho → verde) via `nth-child` e a linha de rótulos abaixo serve como legenda.

```css
.escala-satisfacao { display: flex; justify-content: space-between; gap: 5px; }
.escala-btn {
    flex: 1; padding: 10px 0; min-height: 44px;
    background: #fafafa; border: 1px solid #ddd;
    border-radius: 8px; font-weight: bold; cursor: pointer; transition: 0.2s;
}
/* Cores progressivas */
.escala-btn:nth-child(1) { color: #e74c3c; }
.escala-btn:nth-child(2) { color: #e67e22; }
.escala-btn:nth-child(3) { color: #f39c12; }
.escala-btn:nth-child(4) { color: #27ae60; }
.escala-btn:nth-child(5) { color: var(--verde); }

.escala-btn:hover { opacity: 0.85; transform: translateY(-1px); }

.escala-btn.selecionado:nth-child(1) { background: #e74c3c; color: white; border-color: #e74c3c; }
.escala-btn.selecionado:nth-child(2) { background: #e67e22; color: white; border-color: #e67e22; }
.escala-btn.selecionado:nth-child(3) { background: #f39c12; color: white; border-color: #f39c12; }
.escala-btn.selecionado:nth-child(4) { background: #27ae60; color: white; border-color: #27ae60; }
.escala-btn.selecionado:nth-child(5) { background: var(--verde); color: white; border-color: var(--verde); }
```

**Rótulos da escala (HTML abaixo dos botões):**

```html
<div style="display:flex;justify-content:space-between;margin-top:4px;">
    <span style="font-size:0.65rem;color:var(--muted)">Muito Baixo</span>
    <span style="font-size:0.65rem;color:var(--muted)">Baixo</span>
    <span style="font-size:0.65rem;color:var(--muted)">Regular</span>
    <span style="font-size:0.65rem;color:var(--muted)">Alto</span>
    <span style="font-size:0.65rem;color:var(--muted)">Muito Alto</span>
</div>
```

---

### Barra de progresso da enquete

Exibida acima do formulário de enquete, atualizada automaticamente conforme o aprendiz preenche cada etapa.

```css
.enquete-progresso { margin-bottom: 16px; }
.prog-bg { background: #e0e0e0; border-radius: 10px; height: 6px; overflow: hidden; }
.prog-fill {
    height: 100%; border-radius: 10px;
    background: linear-gradient(90deg, var(--verde), #56c240);
    transition: width 0.4s ease;
}
.prog-label { font-size: 0.75rem; color: var(--muted); margin-top: 4px; text-align: right; }
```

```javascript
function atualizarProgresso() {
    const etapas = ['p1', 'p3', 'p4']; // IDs das perguntas obrigatórias
    const concluidas = etapas.filter(id => /* pergunta respondida */);
    const pct = Math.round((concluidas.length / etapas.length) * 100);
    document.querySelector('.prog-fill').style.width = pct + '%';
    document.querySelector('.prog-label').textContent = `${concluidas.length} de ${etapas.length} perguntas respondidas`;
}
```

---

### Badges (pills)

Usados no perfil para exibir gênero e faixa etária de forma destacada.

```css
.badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: bold; }
.badge-verde    { background: #e8f5e9; color: #2e7d32; }
.badge-amarelo  { background: #fff8e1; color: #f57f17; }
.badge-vermelho { background: #fdecea; color: #c0392b; }
.badge-roxo     { background: #f3e5f5; color: var(--roxo); }
.badge-verde-perfil { background: #e8f5e9; color: #2e7d32; }

html.tema-escuro .badge-roxo        { background: #3a1a4a; color: #c07ad5; }
html.tema-escuro .badge-verde-perfil{ background: #1a3a1a; color: #4fb53e; }
```

---

### Donut Chart (Desejo de Efetivação)

Gráfico SVG animado no painel do gestor. Três arcos (Sim / Não / Talvez) com separação visual por gap, legenda com contagens absolutas e badge de interpretação.

```javascript
function donutChart(sim, nao, talvez, total) {
    if (!total) return '<p style="text-align:center;color:var(--muted)">Sem dados</p>';

    const r    = 44;
    const circ = 2 * Math.PI * r; // ~276.5
    const gap  = circ * 0.012;

    const pcts = [sim, nao, talvez].map(v => v / total);
    const lens = pcts.map(p => Math.max(p * circ - gap, 0));

    const cores  = ['#27ae60', '#e74c3c', '#f39c12'];
    const labels = ['Sim', 'Não', 'Talvez'];
    const vals   = [sim, nao, talvez];

    // Cada arco começa com dasharray=0 (estado inicial para animação)
    let cum = 0;
    const arcos = lens.map((len, i) => {
        const offset = -(cum / circ * circ); // rotação acumulada
        cum += len + gap;
        return `<circle class="donut-arco" cx="50" cy="50" r="${r}"
            fill="none" stroke="${cores[i]}" stroke-width="12"
            stroke-dasharray="0 ${circ}"
            stroke-dashoffset="${-( (cum - len - gap) )}"
            data-dash="${len} ${circ - len}"
            transform="rotate(-90 50 50)"/>`;
    }).join('');

    // Interpretação
    const pctSim = total ? Math.round(sim / total * 100) : 0;
    const corBadge = pctSim >= 60 ? '#27ae60' : pctSim >= 35 ? '#f39c12' : '#e74c3c';
    const textoBadge = pctSim >= 60 ? 'Alto interesse em efetivação'
        : pctSim >= 35 ? 'Interesse moderado'
        : 'Baixo interesse em efetivação';

    return `<div style="text-align:center">
        <svg width="100" height="100" viewBox="0 0 100 100">${arcos}
            <text x="50" y="54" text-anchor="middle" font-size="13" font-weight="bold" fill="var(--texto)">${Math.round(sim/total*100)}%</text>
        </svg>
        <!-- legenda + badge de interpretação -->
    </div>`;
}
```

**CSS de animação dos arcos:**

```css
.donut-arco { transition: stroke-dasharray 0.8s cubic-bezier(.4,0,.2,1); }
```

**Acionamento da animação** — requer um ciclo de render entre definir `0` e o valor real:

```javascript
// Após injetar o HTML do donut no DOM:
setTimeout(() => {
    document.querySelectorAll('.donut-arco').forEach(arc => {
        arc.setAttribute('stroke-dasharray', arc.dataset.dash);
    });
}, 60);
```

**Badge de interpretação:**

```html
<div style="margin-top:10px;padding:8px 12px;border-radius:8px;
            background:${corBadge}22;border:1px solid ${corBadge}55;
            color:${corBadge};font-size:0.78rem;font-weight:600;">
    ${textoBadge}
</div>
```

---

### Imagens decorativas (emoji customizados)

Armazenadas em `frontend/emoji/`. Usadas como ícones de seção nos títulos de cards (`<h3>`).

| Arquivo                      | Onde é usado                              | Tamanho atual |
|------------------------------|-------------------------------------------|---------------|
| `satisfacao-do-aprendiz.png` | Pesquisa de Clima (aprendiz) e Satisfação por Empresa (gestor) | 56px |
| `Mural-da-comunidade.png`    | Mural da Comunidade (aprendiz)            | 44px          |
| `conhecimento.png`           | Trilhas de Soft Skills (aprendiz)         | 44px          |
| `perfil-aprendiz.png`        | Avatar do perfil do aprendiz              | 90px          |
| `perfil gestor.png`          | Avatar do perfil do gestor                | 90px          |

---

## Animações

### fadeIn (padrão para views)

```css
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(5px); }
    to   { opacity: 1; transform: translateY(0); }
}
.view.active { animation: fadeIn 0.3s ease-in-out; }
```

### cardEnter (entrada escalonada de listas)

Cards de mural e artigos entram com animação escalonada — cada item com `animation-delay` incremental de 60ms.

```css
@keyframes cardEnter {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
}
```

```javascript
itens.forEach((item, i) => {
    const card = criarCard(item);
    card.style.animation = 'none';
    card.style.opacity = '0';
    container.appendChild(card);
    setTimeout(() => {
        card.style.animation = `cardEnter 0.35s ease forwards`;
        card.style.animationDelay = `${i * 60}ms`;
    }, 10);
});
```

### skeletonPulse (loading shimmer)

```css
@keyframes skeletonPulse {
    0%   { background-position:  200% 0; }
    100% { background-position: -200% 0; }
}
```

### toastIn / toastOut (notificações)

```css
@keyframes toastIn  { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
@keyframes toastOut { from { opacity:1; transform:translateY(0); }    to { opacity:0; transform:translateY(12px); } }
```

### Flip de carta (jogo de memória)

```css
.carta { perspective: 600px; }
.carta-inner { transform-style: preserve-3d; transition: transform 0.45s ease; }
.carta.virada .carta-inner { transform: rotateY(180deg); }
.carta-capa, .carta-face { backface-visibility: hidden; }
.carta-face { transform: rotateY(180deg); }
```

### Confetti (celebração de enquete)

Disparado ao enviar a enquete com sucesso. 48 pedaços gerados dinamicamente com posição e duração aleatórias.

```css
.confetti-piece {
    position: fixed; width: 8px; height: 8px; border-radius: 2px;
    pointer-events: none; z-index: 9999;
    animation: confettiFall linear forwards;
}
@keyframes confettiFall {
    0%   { transform: translateY(-10px) rotate(0deg); opacity: 1; }
    100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
}
```

```javascript
function dispararConfetti() {
    const cores = ['#e74c3c','#f39c12','#27ae60','#3498db','#9b59b6','#e67e22'];
    for (let i = 0; i < 48; i++) {
        const el = document.createElement('div');
        el.className = 'confetti-piece';
        el.style.cssText = `
            left: ${Math.random() * 100}vw;
            top: ${Math.random() * 30}vh;
            background: ${cores[Math.floor(Math.random() * cores.length)]};
            animation-duration: ${1.2 + Math.random() * 1.5}s;
            animation-delay: ${Math.random() * 0.4}s;
        `;
        document.body.appendChild(el);
        el.addEventListener('animationend', () => el.remove());
    }
}
```

### Sparkle (acerto no jogo de memória)

Ao acertar um par no jogo, 6 pontos coloridos explodem a partir das cartas.

```css
.sparkle-dot {
    position: fixed; width: 7px; height: 7px; border-radius: 50%;
    pointer-events: none; z-index: 9999;
    animation: sparkleOut 0.6s ease forwards;
}
@keyframes sparkleOut {
    0%   { transform: translate(0, 0) scale(1); opacity: 1; }
    100% { transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; }
}
```

```javascript
function sparkleEmCarta(cartaEl) {
    const rect  = cartaEl.getBoundingClientRect();
    const cx    = rect.left + rect.width / 2;
    const cy    = rect.top  + rect.height / 2;
    const cores = ['#f39c12','#e74c3c','#27ae60','#3498db','#9b59b6','#e67e22'];
    for (let i = 0; i < 6; i++) {
        const dot = document.createElement('div');
        dot.className = 'sparkle-dot';
        const angulo = (i / 6) * 2 * Math.PI;
        const dist   = 30 + Math.random() * 20;
        dot.style.cssText = `
            left: ${cx}px; top: ${cy}px;
            background: ${cores[i]};
            --tx: ${Math.cos(angulo) * dist}px;
            --ty: ${Math.sin(angulo) * dist}px;
        `;
        document.body.appendChild(dot);
        dot.addEventListener('animationend', () => dot.remove());
    }
}
// Uso: ao acertar par, chamar sparkleEmCarta(cartaA) e sparkleEmCarta(cartaB)
```

---

## Sistema de permissões (Admin)

### Modelo de dados

O campo `is_admin` na tabela `aprendizes` identifica administradores. Adicionado via migration segura no startup do backend.

```python
# backend/models.py
class Aprendiz(Base):
    # ...
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False, server_default="0")
```

```python
# backend/main.py — migration on startup (idempotente)
try:
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE aprendizes ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT 0"))
        conn.commit()
except Exception:
    pass  # coluna já existe
```

### Conta administradora padrão

Criada automaticamente no startup se não existir. Credenciais: `aprendiz-adm` / `admin`.

```python
with SessionLocal() as db:
    if not db.query(Aprendiz).filter_by(username='aprendiz-adm').first():
        empresa = db.query(Empresa).first()
        admin = Aprendiz(
            username='aprendiz-adm',
            senha_hash=pwd_context.hash('admin'),
            idade=20, genero='prefiro_nao_dizer',
            empresa_id=empresa.id,
            is_admin=True
        )
        db.add(admin); db.commit()
```

### Endpoint de exclusão (mural)

```python
@app.delete("/mural/{mensagem_id}", status_code=204)
async def apagar_mensagem(mensagem_id: int, aprendiz=Depends(get_current_aprendiz), db=Depends(get_db)):
    if not aprendiz.is_admin:
        raise HTTPException(status_code=403, detail="Sem permissão")
    msg = db.get(MensagemMural, mensagem_id)
    if not msg:
        raise HTTPException(status_code=404)
    db.delete(msg); db.commit()
```

### Frontend — guarda de admin

```javascript
let _isAdmin = false;

async function init() {
    const me = await apiFetch('/auth/aprendiz/me');
    _isAdmin = me.is_admin ?? false;
    // ...
}
```

**Botão de apagar mensagem** (visível apenas para admins):

```css
.msg-card { position: relative; }
.btn-apagar-msg {
    position: absolute; top: 8px; right: 8px;
    background: none; border: none; color: #e74c3c;
    font-size: 1rem; cursor: pointer; opacity: 0; transition: 0.2s;
}
.msg-card:hover .btn-apagar-msg { opacity: 1; }
```

```javascript
async function apagarMensagem(id, btn) {
    const card = btn.closest('.msg-card');
    await apiFetch(`/mural/${id}`, { method: 'DELETE' });
    card.style.transition = 'opacity 0.3s, transform 0.3s';
    card.style.opacity = '0';
    card.style.transform = 'scale(0.95)';
    setTimeout(() => card.remove(), 300);
}
```

---

## Convenções JavaScript

### Nomenclatura

| Tipo               | Convenção               | Exemplo                               |
|--------------------|-------------------------|---------------------------------------|
| Funções de view    | `view` + PascalCase     | `viewInicio()`, `viewPerfil()`        |
| Carregamento       | `carregar` + PascalCase | `carregarMural()`, `carregarArtigos()`|
| Handlers de form   | verbo + PascalCase      | `salvarSenha()`, `postarMensagem()`   |
| Constantes globais | UPPER_SNAKE_CASE        | `API`, `SVG_MENSAGEM`                 |
| Variáveis de estado| camelCase               | `cartaVirada`, `enqueteBloqueada`     |
| Prefixo privado    | `_` + camelCase         | `_categoriaAtiva`, `_isAdmin`         |

### apiFetch — wrapper autenticado

```javascript
async function apiFetch(path, opts = {}) {
    const token = localStorage.getItem('ssh_token'); // ou ssh_token_gestor
    const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
    let res;
    try {
        res = await fetch(API + path, { ...opts, headers });
    } catch {
        throw new Error('Servidor não encontrado. Verifique se o backend está rodando.');
    }
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const detail = Array.isArray(err.detail)
            ? err.detail.map(e => e.msg).join(' | ')
            : (err.detail || `Erro ${res.status}`);
        throw new Error(detail);
    }
    return res.json();
}
```

### Formatação de data relativa (Mural)

```javascript
function tempoRelativo(iso) {
    const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
    if (diff < 60)         return 'agora mesmo';
    if (diff < 3600)       return `há ${Math.floor(diff / 60)} min`;
    if (diff < 86400)      return `há ${Math.floor(diff / 3600)} h`;
    if (diff < 7 * 86400)  return `há ${Math.floor(diff / 86400)} dias`;
    return new Date(iso).toLocaleString('pt-BR', { day:'2-digit', month:'2-digit', year:'numeric' });
}
```

### Segurança — escapeHtml

Sempre escapar conteúdo de banco antes de inserir via `innerHTML`. **Exceção:** conteúdo de artigos usa `marked.parse()`.

```javascript
function escapeHtml(str = '') {
    return str
        .replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
```

---

## Tokens de autenticação e preferências (localStorage)

| Chave              | Quem usa         | Conteúdo / Endpoint de validação          |
|--------------------|------------------|-------------------------------------------|
| `ssh_token`        | Painel aprendiz  | JWT — validado em `GET /auth/aprendiz/me` |
| `ssh_token_gestor` | Painel gestor    | JWT — validado em `GET /auth/gestor/me`   |
| `ssh_username`     | Painel aprendiz  | Username para exibição local              |
| `ssh_gestor`       | Painel gestor    | Username do gestor para exibição          |
| `ssh_tema`         | Todos os painéis | `"escuro"` \| `"claro"` \| ausente (segue sistema) |

---

## Estrutura de arquivos frontend

```
frontend/
├── index.html            # Landing page + login/cadastro (aprendiz e gestor)
├── painel.aprendiz.html  # SPA do aprendiz (enquete, mural, trilhas, jogo, perfil)
├── painel-gestor.html    # SPA do gestor (dashboard, problemas, empresas, perfil)
└── emoji/                # Imagens decorativas dos cards
    ├── satisfacao-do-aprendiz.png
    ├── Mural-da-comunidade.png
    ├── conhecimento.png
    ├── perfil-aprendiz.png
    └── perfil gestor.png
```
