# Índice de Caminhos — SoftSkills Hub

## Raiz

| Caminho | Função |
|---|---|
| `render.yaml` | Configuração de deploy no Render |
| `.github/workflows/deploy.yml` | CI/CD GitHub Actions |
| `.gitignore` | Arquivos ignorados pelo git |
| `CLAUDE.md` | Guia de referência rápida para desenvolvimento |

---

## Backend `backend/`

| Caminho | Função |
|---|---|
| `main.py` | Entry point FastAPI, CORS, routers, lifespan |
| `models.py` | Modelos SQLAlchemy (8 tabelas) |
| `schemas.py` | Schemas Pydantic (validação de I/O) |
| `seed.py` | Dados iniciais (empresas, gestor padrão) |
| `softskills.db` | Banco SQLite (não commitar) |
| `.env` | Variáveis sensíveis (SECRET_KEY etc.) |
| `.env.example` | Template das variáveis de ambiente |
| `requirements.txt` | Dependências Python |

### Core `backend/core/`

| Caminho | Função |
|---|---|
| `core/security.py` | Hash bcrypt + geração/validação de JWT HS256 |
| `core/database.py` | Engine SQLAlchemy, SessionLocal, Base, `get_db()` |
| `core/dependencies.py` | `get_aprendiz_atual`, `get_gestor_atual` injetados nas rotas |
| `core/rate_limiter.py` | Instância global do slowapi Limiter |

### Routers `backend/routers/`

| Caminho | Prefixo | Função |
|---|---|---|
| `auth_aprendiz.py` | `/auth/aprendiz` | Login, cadastro e perfil do aprendiz |
| `auth_gestor.py` | `/auth/gestor` | Login e perfil do gestor |
| `empresas.py` | `/empresas` | Listagem de empresas |
| `artigos.py` | `/artigos` | CRUD de artigos das trilhas |
| `mural.py` | `/mural` | Posts anônimos do mural |
| `enquete.py` | `/enquete` | Envio de respostas da enquete de clima |
| `dashboard.py` | `/dashboard` | Dados agregados para o painel gestor |

### Services `backend/services/`

| Caminho | Função |
|---|---|
| `enquete_service.py` | Cooldown de 7 dias, cálculo de faixa etária |
| `mural_service.py` | Rate limit de posts (120s), sanitização |
| `dashboard_service.py` | Queries de métricas e agregações |
| `sanitizer.py` | Sanitização de texto (blocklist + strip HTML) |

### Tests `backend/tests/`

| Caminho | Cobre |
|---|---|
| `conftest.py` | Fixtures: banco em memória, client, tokens |
| `test_auth_aprendiz.py` | Registro e login do aprendiz |
| `test_auth_gestor.py` | Login do gestor |
| `test_artigos.py` | CRUD de artigos |

---

## Frontend `frontend/`

| Caminho | Função |
|---|---|
| `index.html` | Tela de login/cadastro (entry point) — splash screen GSAP |
| `aprendiz.html` | SPA do aprendiz (6 views) |
| `gestor.html` | SPA do gestor (6 views) |
| `manifest.json` | Manifesto PWA |
| `sw.js` | Service Worker (cache-first, v14) |

### CSS `frontend/styles/`

| Caminho | Escopo |
|---|---|
| `global.css` | Variáveis de tema, reset, componentes compartilhados |
| `login.css` | Telas de login e cadastro |
| `aprendiz.css` | Painel do aprendiz |
| `gestor.css` | Painel do gestor |

### JS Core `frontend/scripts/core/`

| Caminho | Função |
|---|---|
| `api.js` | `apiFetch`, `apiFetchComTotal`, base URL, expiração de sessão |
| `theme.js` | Toggle dark/light mode |
| `dom.js` | `mostrar`, `ocultar`, `setBotao`, `escapeHtml`, `emptyState` |
| `format.js` | `formatarData`, `tempoRelativo` |
| `feedback.js` | `mostrarToast`, `vibrar`, `adicionarShake`, `animarBotaoSucesso` |
| `animations.js` | `iniciarRipple`, `atualizarNavPill`, `topBarInicio/Fim`, `animarListaComScroll` |
| `pwa.js` | `iniciarPullToRefresh`, `initOfflineIndicator` |

### JS do Aprendiz `frontend/scripts/aprendiz/`

| Caminho | Função |
|---|---|
| `app.js` | Inicialização, navbar, roteamento de views |
| `enquete.js` | Wizard multi-step de enquete (4 passos) |
| `mural.js` | Feed do mural, posts anônimos, paginação |
| `trilhas.js` | Cards de artigos, filtros, busca, modal de leitura |
| `jogo.js` | Flashcards do idiomês corporativo |
| `perfil.js` | Perfil e edição de dados do aprendiz |

### JS do Gestor `frontend/scripts/gestor/`

| Caminho | Função |
|---|---|
| `app.js` | Inicialização e navbar do gestor |
| `dashboard.js` | KPIs, donut chart de efetivação, barras de avaliação |
| `empresas.js` | Listagem de satisfação por empresa e detalhe |
| `trilhas.js` | CRUD de artigos das trilhas |
| `perfil.js` | Perfil do gestor |
| `problemas.js` | Ranking de problemas relatados |

### Assets `frontend/assets/icons/`

| Arquivo | Uso |
|---|---|
| `Logo.png` | Logo na tela de login e apple-touch-icon |
| `Logo.ico` | Favicon |
| `icon-512x512.png` | Ícone PWA 512px |
| `perfil-aprendiz.png` | Avatar padrão aprendiz |
| `perfil gestor.png` | Avatar padrão gestor |
| `Mural-da-comunidade.png` | Ilustração do mural |
| `conhecimento.png` | Ilustração de trilhas |
| `satisfacao-do-aprendiz.png` | Ilustração de enquete |

---

## Docs `docs/`

| Caminho | Conteúdo |
|---|---|
| `índice.md` | Este arquivo |
| `ideia-geral.md` | Visão do produto e público-alvo |
| `contexto-projeto.md` | Contexto pedagógico e institucional |
| `DATABASE_SCHEMA.md` | Diagrama e descrição das tabelas |
| `ARCHITECTURE.md` | Camadas, fluxo de requisição, decisões de design |
| `STYLEGUIDE.md` | Tokens de design, paleta, tipografia |
| `empresas.md` | Regras de cadastro de empresas |
| `jogo.md` | Mecânica do minijogo de flashcards |
