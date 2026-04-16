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

| Variável        | Hex (light)  | Hex (dark)   | Uso principal                                      |
|-----------------|--------------|--------------|----------------------------------------------------|
| `--verde`       | `#367a28`    | `#4fb53e`    | Cor primária — header, botões, destaques (aprendiz) |
| `--verde-claro` | `#e8f5e9`    | `#1a3a16`    | Fundo de hover em checkboxes e badges leves        |
| `--laranja`     | `#c4521a`    | `#e0693a`    | Cor de destaque — painel do gestor                 |
| `--laranja-claro`| `#fff3ee`   | `#2a1a0e`    | Fundo de hover leve no painel do gestor            |
| `--roxo`        | `#8e44ad`    | `#b06ccc`    | Cor do jogo de memória                             |
| `--fundo`       | `#f4f7f6`    | `#121212`    | Fundo da aplicação                                 |
| `--card`        | `#ffffff`    | `#1e1e1e`    | Fundo de cards                                     |
| `--texto`       | `#333333`    | `#e4e4e4`    | Texto principal                                    |
| `--muted`       | `#777777`    | `#9e9e9e`    | Texto secundário, placeholders                     |

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

/* Sobrescritas de componentes específicos */
html.tema-escuro input,
html.tema-escuro select { background: #2a2a2a !important; border-color: #3a3a3a; }
html.tema-escuro .perfil-info-row { border-color: #3a3a3a; }
```

### Ativação via JavaScript

```javascript
function aplicarTema() {
    const armazenado = localStorage.getItem('ssh_tema'); // 'escuro' | 'claro' | null
    const sistemaEscuro = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const escuro = armazenado === 'escuro' || (!armazenado && sistemaEscuro);
    document.documentElement.classList.toggle('tema-escuro', escuro);
    atualizarBtnTema();
}

function alternarTema() {
    const agora = document.documentElement.classList.toggle('tema-escuro');
    localStorage.setItem('ssh_tema', agora ? 'escuro' : 'claro');
    atualizarBtnTema();
}

function atualizarBtnTema() {
    const btn = document.getElementById('btnTema');
    if (!btn) return;
    const escuro = document.documentElement.classList.contains('tema-escuro');
    btn.textContent = escuro ? '☀️  Mudar para Modo Claro' : '🌙  Mudar para Modo Escuro';
}
```

`aplicarTema()` deve ser a **primeira chamada** do bloco `<script>` para evitar flash de tema errado. Em `index.html`, usa-se uma IIFE anônima para o mesmo efeito.

---

## Tipografia

- **Font stack:** `'Segoe UI', Tahoma, sans-serif`
- Reset global: `* { box-sizing: border-box; margin: 0; padding: 0; font-family: ... }`

| Elemento              | Tamanho      | Peso    |
|-----------------------|--------------|---------|
| Header `h1`           | `1.4rem`     | bold    |
| Header subtítulo `p`  | `0.8rem`     | normal  |
| Card título `h3`      | `1.1rem`     | normal  |
| Card texto `p`        | `0.9rem`     | normal  |
| Rótulos de pergunta   | `0.95rem`    | bold    |
| Items de lista        | `0.88rem`    | normal  |
| Texto muted           | `0.85rem`    | normal  |

---

## Bibliotecas externas

| Biblioteca       | CDN                                                              | Uso                                   |
|------------------|------------------------------------------------------------------|---------------------------------------|
| **Lucide Icons** | `https://unpkg.com/lucide@latest/dist/umd/lucide.min.js`        | Ícones vetoriais na bottom-nav        |
| **marked.js v9** | `https://cdn.jsdelivr.net/npm/marked@9/marked.min.js`           | Renderização de Markdown nos artigos  |

Inicialização obrigatória logo após `aplicarTema()`:

```javascript
aplicarTema();
lucide.createIcons(); // substitui <i data-lucide="nome"> por <svg>
```

---

## Componentes

### Header

```css
header {
    background-color: var(--verde);    /* ou --laranja no gestor */
    color: white;
    padding: 30px 20px 20px;
    border-bottom-left-radius: 20px;
    border-bottom-right-radius: 20px;
    text-align: center;
}
```

---

### Card

Container padrão para agrupar conteúdo.

```css
.card {
    background-color: var(--card);
    border-radius: 15px;
    padding: 20px;
    margin-bottom: 15px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.03);
}
```

---

### Botões

**Botão primário** (ação principal da tela):

```css
.btn-verde {
    width: 100%;
    padding: 15px;
    background-color: var(--verde);
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
    transition: 0.3s;
}
.btn-verde:hover:not(:disabled) { background-color: #2a5e1e; }
.btn-verde:disabled { opacity: 0.6; cursor: not-allowed; }
```

**Botão destrutivo** (sair, excluir):

```css
.btn-sair-perfil {
    width: 100%;
    padding: 14px;
    border: 1px solid #e74c3c;
    border-radius: 12px;
    background: transparent;
    color: #e74c3c;
    font-weight: bold;
    cursor: pointer;
}
.btn-sair-perfil:hover { background: #e74c3c; color: white; }
```

**Botão de tema** (toggle dark/light mode):

```css
.btn-tema {
    width: 100%;
    padding: 13px 16px;
    border-radius: 10px;
    border: 2px solid #ddd;
    background: transparent;
    color: var(--texto);
    font-size: 0.9rem;
    font-weight: bold;
    cursor: pointer;
    transition: 0.2s;
}
.btn-tema:hover { border-color: var(--verde); color: var(--verde); }
```

---

### Inputs e Formulários

```css
input, select, textarea {
    width: 100%;
    padding: 12px 15px;
    border: 1px solid #ddd;
    border-radius: 10px;
    font-size: 0.95rem;
    outline: none;
    transition: border-color 0.2s;
}
input:focus, select:focus { border-color: var(--verde); }
.form-group { margin-bottom: 15px; }
```

---

### Alertas / Mensagens de feedback

```css
.alerta { padding: 10px 14px; border-radius: 10px; font-size: 0.85rem; display: none; line-height: 1.4; }
.alerta-erro    { background: #fdecea; color: #c0392b; border: 1px solid #f5c6cb; }
.alerta-sucesso { background: #e8f5e9; color: #2e7d32; border: 1px solid #c8e6c9; }
.alerta-info    { background: #fff8e1; color: #856404; border: 1px solid #ffeeba; }
```

---

### KPI Grid (dashboard do gestor)

```css
.kpi-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 15px; }
.kpi { background: var(--card); border-radius: 14px; padding: 22px 16px; text-align: center; }
.kpi .valor { font-size: 2rem; font-weight: bold; color: var(--laranja); line-height: 1; }
.kpi .label { font-size: 0.78rem; color: var(--muted); margin-top: 8px; line-height: 1.4; }
```

---

### Ranking (dashboard do gestor)

```css
.rank-item { display: flex; align-items: center; gap: 14px; padding: 14px 4px; border-bottom: 1px solid #f0f0f0; }
.rank-item:last-child { border-bottom: none; }
.rank-num   { font-size: 0.8rem; font-weight: bold; color: var(--muted); min-width: 24px; text-align: center; }
.rank-label { flex: 1; font-size: 0.88rem; color: var(--texto); line-height: 1.4; }
.rank-val   { font-size: 0.88rem; font-weight: bold; color: var(--laranja); flex-shrink: 0; }
```

---

### Navegação inferior (SPA)

Usa ícones vetoriais da biblioteca **Lucide Icons** — substituem os emojis anteriores. Todos os botões têm `aria-label` descritivo para acessibilidade.

```html
<nav class="bottom-nav">
    <button id="navInicio" class="nav-item active"
            aria-label="Tela inicial"
            onclick="navegarApp('viewInicio')">
        <i data-lucide="home"></i>
        <span>Início</span>
    </button>
    <!-- ... demais itens ... -->
</nav>
```

```css
.bottom-nav {
    position: fixed; bottom: 0;
    width: 100%; max-width: 400px;
    background: var(--card);
    display: flex; justify-content: space-around;
    padding: 10px 0 15px;
    border-top: 1px solid #eee;
    border-top-left-radius: 20px; border-top-right-radius: 20px;
}
.nav-item { display: flex; flex-direction: column; align-items: center;
            font-size: 0.75rem; color: var(--muted); background: none;
            border: none; cursor: pointer; transition: 0.2s; padding: 0 8px; }
.nav-item svg { width: 22px; height: 22px; margin-bottom: 4px;
                stroke: currentColor; transition: transform 0.2s; }
.nav-item.active { color: var(--verde); font-weight: bold; }
.nav-item.active svg { transform: translateY(-2px); }
```

**Mapeamento de ícones:**

| View              | Ícone Lucide         | aria-label                  |
|-------------------|----------------------|-----------------------------|
| Início (aprendiz) | `home`               | "Tela inicial"              |
| Mural             | `message-circle`     | "Mural da comunidade"       |
| Trilhas           | `book-open`          | "Trilhas de leitura"        |
| Perfil (aprendiz) | `user`               | "Meu perfil"                |
| Resumo (gestor)   | `bar-chart-2`        | "Resumo geral"              |
| Problemas (gestor)| `alert-triangle`     | "Ranking de problemas"      |
| Empresas (gestor) | `building-2`         | "Dados por empresa"         |
| Perfil (gestor)   | `user`               | "Perfil do gestor"          |

---

### Filtros de categoria (Trilhas de Soft Skills)

Botões pill que filtram artigos por categoria. O botão ativo recebe a classe `ativo`.

```css
.categoria-filtros { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; padding: 0 20px; }
.btn-categoria {
    padding: 5px 12px; border-radius: 20px;
    border: 1px solid #ddd; background: #f5f5f5;
    color: var(--muted); font-size: 0.78rem; font-weight: bold;
    cursor: pointer; transition: 0.2s;
}
.btn-categoria:hover { border-color: var(--verde); color: var(--verde); }
.btn-categoria.ativo { background: var(--verde); color: white; border-color: var(--verde); }
```

```javascript
let _categoriaAtiva = '';

function filtrarCategoria(btn, categoria) {
    document.querySelectorAll('.btn-categoria').forEach(b => b.classList.remove('ativo'));
    btn.classList.add('ativo');
    _categoriaAtiva = categoria;
    carregarArtigos();
}
```

---

### Conteúdo de artigos (Markdown)

O campo `conteudo` dos artigos é armazenado em Markdown e renderizado pelo `marked.js`. **Não use `escapeHtml()` no conteúdo de artigos** — use `marked.parse()`.

```javascript
// Correto
div.artigo-body.innerHTML = marked.parse(artigo.conteudo);

// Errado — exibe o Markdown como texto plano
div.artigo-body.innerHTML = escapeHtml(artigo.conteudo);
```

CSS para estilizar o HTML gerado pelo Markdown:

```css
.artigo-body h1, .artigo-body h2, .artigo-body h3 { color: var(--verde); margin: 12px 0 6px; }
.artigo-body p  { margin-bottom: 8px; }
.artigo-body ul, .artigo-body ol { padding-left: 20px; margin-bottom: 8px; }
.artigo-body blockquote { border-left: 3px solid var(--verde); padding-left: 10px; color: var(--muted); }
```

---

### Contador de caracteres (Mural)

```html
<textarea id="txtMensagem" maxlength="500" oninput="atualizarContadorMural()"></textarea>
<small id="contadorMural" class="mural-contador">0 / 500</small>
```

```css
.mural-contador { font-size: 0.75rem; color: var(--muted); text-align: right; margin-top: -4px; }
```

```javascript
function atualizarContadorMural() {
    const n = document.getElementById('txtMensagem').value.length;
    const contador = document.getElementById('contadorMural');
    contador.textContent = `${n} / 500`;
    contador.style.color = n > 450 ? '#e74c3c' : 'var(--muted)'; // vermelho ao se aproximar do limite
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
.scroll-box { max-height: 220px; overflow-y: auto; border: 1px solid #eee; border-radius: 10px; padding: 10px; }
```

---

### Escala de satisfação (1–5)

```css
.escala-satisfacao { display: flex; justify-content: space-between; gap: 5px; }
.escala-btn { flex: 1; padding: 10px 0; background: #fafafa; border: 1px solid #ddd; border-radius: 8px; font-weight: bold; cursor: pointer; }
.escala-btn.selecionado { background: var(--verde); color: white; border-color: var(--verde); }
```

---

### Badges

```css
.badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: bold; }
.badge-verde   { background: #e8f5e9; color: #2e7d32; }
.badge-amarelo { background: #fff8e1; color: #f57f17; }
.badge-vermelho{ background: #fdecea; color: #c0392b; }
.badge-roxo    { background: #f3e5f5; color: var(--roxo); }
```

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

### Flip de carta (jogo de memória)

```css
.carta { perspective: 600px; }
.carta-inner { transform-style: preserve-3d; transition: transform 0.45s ease; }
.carta.virada .carta-inner { transform: rotateY(180deg); }
.carta-capa, .carta-face { backface-visibility: hidden; }
.carta-face { transform: rotateY(180deg); }
```

---

## Convenções JavaScript

### Nomenclatura

| Tipo               | Convenção               | Exemplo                              |
|--------------------|-------------------------|--------------------------------------|
| Funções de view    | `view` + PascalCase     | `viewInicio()`, `viewPerfil()`       |
| Carregamento       | `carregar` + PascalCase | `carregarMural()`, `carregarArtigos()`|
| Handlers de form   | verbo + PascalCase      | `salvarSenha()`, `postarMensagem()`  |
| Constantes globais | UPPER_SNAKE_CASE        | `API`, `COOLDOWN_ENQUETE_DIAS`       |
| Variáveis de estado| camelCase               | `cartaVirada`, `enqueteBloqueada`    |
| Prefixo privado    | `_` + camelCase         | `_categoriaAtiva`, `_filtrar_ano()`  |

### Navegação SPA

```javascript
function navegarApp(id) {
    if (id === 'viewEnquete' && enqueteBloqueada) return; // guarda de estado
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    // cada view dispara seu próprio carregamento no bloco if/else
}
```

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

### Dicionários de rótulos

```javascript
const LABEL_GENERO = {
    feminino: 'Feminino',
    masculino: 'Masculino',
    prefiro_nao_dizer: 'Pref. não dizer',
};

const categoriaLabel = {
    inteligencia_emocional: 'Inteligência Emocional',
    comunicacao: 'Comunicação',
    postura_profissional: 'Postura Profissional',
    saude_mental: 'Saúde Mental',
};
```

---

## Tokens de autenticação e preferências (localStorage)

| Chave               | Quem usa              | Conteúdo / Endpoint de validação       |
|---------------------|-----------------------|----------------------------------------|
| `ssh_token`         | Painel aprendiz       | JWT — validado em `GET /auth/aprendiz/me` |
| `ssh_token_gestor`  | Painel gestor         | JWT — validado em `GET /auth/gestor/me`   |
| `ssh_username`      | Painel aprendiz       | Username para exibição local           |
| `ssh_gestor`        | Painel gestor         | Username do gestor para exibição       |
| `ssh_tema`          | Todos os painéis      | `"escuro"` \| `"claro"` \| ausente (segue sistema) |

---

## Estrutura de arquivos frontend

```
frontend/
├── index.html            # Landing page + login/cadastro (aprendiz e gestor)
├── painel.aprendiz.html  # SPA do aprendiz (enquete, mural, trilhas, jogo, perfil)
└── painel-gestor.html    # SPA do gestor (dashboard, problemas, empresas, perfil)
```

Cada painel é um arquivo HTML único com todo o CSS e JS inline — sem bundler, sem framework. Isso simplifica o deploy e o desenvolvimento local via Live Server ou arquivo direto no browser.

### Ordem de inicialização do script

```javascript
// 1. Tema (evita flash)
aplicarTema();
// 2. Ícones Lucide
lucide.createIcons();
// 3. Constantes e estado global
const API = 'http://localhost:8000';
// 4. Validação de sessão + carregamento inicial
init();
```
