# Índice de Caminhos — SoftSkills Hub

## Raiz

| Caminho | Função |
|---|---|
| `render.yaml` | Configuração de deploy no Render |
| `.github/workflows/deploy.yml` | CI/CD GitHub Actions |
| `.gitignore` | Arquivos ignorados pelo git |

---

## Backend `backend/`

| Caminho | Função |
|---|---|
| `main.py` | Entry point FastAPI, CORS, routers |
| `models.py` | Modelos SQLAlchemy (tabelas do banco) |
| `schemas.py` | Schemas Pydantic (validação de I/O) |
| `database.py` | Engine SQLite, SessionLocal |
| `auth.py` | JWT — geração e verificação de tokens |
| `dependencies.py` | `get_current_user` injetado nas rotas |
| `limiter.py` | Rate limiting (slowapi) |
| `seed.py` | Dados iniciais (empresas, gestor padrão) |
| `softskills.db` | Banco SQLite (não commitar) |
| `.env` | Variáveis sensíveis (SECRET_KEY etc.) |
| `.env.example` | Template das variáveis de ambiente |
| `requirements.txt` | Dependências Python |

### Routers `backend/routers/`

| Caminho | Prefixo | Função |
|---|---|---|
| `auth_aprendiz.py` | `/auth/aprendiz` | Login e cadastro do aprendiz |
| `auth_gestor.py` | `/auth/gestor` | Login do gestor |
| `empresas.py` | `/empresas` | CRUD de empresas |
| `artigos.py` | `/artigos` | Artigos das trilhas |
| `mural.py` | `/mural` | Posts e reações do mural |
| `enquete.py` | `/enquete` | Enquetes profissionais (wizard) |
| `dashboard.py` | `/dashboard` | Dados agregados para o gestor |

### Services `backend/services/`

| Caminho | Função |
|---|---|
| `dashboard_service.py` | Queries de métricas do gestor |
| `enquete_service.py` | Lógica de enquete e respostas |
| `mural_service.py` | Lógica de posts e reações |
| `sanitizer.py` | Sanitização de texto (XSS) |

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
| `index.html` | Tela de login/cadastro (entry point) — inclui splash screen GSAP |
| `painel.aprendiz.html` | SPA do aprendiz |
| `painel-gestor.html` | SPA do gestor |
| `manifest.json` | Manifesto PWA |
| `sw.js` | Service Worker (cache offline) |

### CSS `frontend/css/`

| Caminho | Escopo |
|---|---|
| `global.css` | Variáveis, reset, componentes compartilhados |
| `login.css` | Telas de login e cadastro |
| `aprendiz.css` | Painel do aprendiz |
| `gestor.css` | Painel do gestor |

### JS compartilhado `frontend/js/`

| Caminho | Função |
|---|---|
| `api.js` | `apiFetch` centralizado, base URL |
| `utils.js` | `mostrar`, `setBotao`, `mostrarToast`, `vibrar` |
| `theme.js` | Toggle dark/light mode |

### JS do Aprendiz `frontend/js/aprendiz/`

| Caminho | Função |
|---|---|
| `app.js` | Inicialização, navbar, roteamento de abas |
| `trilhas.js` | Trilhas de aprendizado e artigos |
| `mural.js` | Feed do mural, posts, reações |
| `enquete.js` | Wizard multi-step de enquete |
| `jogo.js` | Minijogo de soft skills |
| `perfil.js` | Perfil e edição de dados do aprendiz |

### JS do Gestor `frontend/js/gestor/`

| Caminho | Função |
|---|---|
| `app.js` | Inicialização e navbar do gestor |
| `dashboard.js` | Gráficos e métricas (Chart.js) |
| `empresas.js` | CRUD de empresas |
| `trilhas.js` | Gestão de artigos das trilhas |
| `perfil.js` | Perfil do gestor |
| `problemas.js` | Relatos/problemas dos aprendizes |

### Assets `frontend/emoji/`

| Arquivo | Uso |
|---|---|
| `Logo.png` | Logo na tela de login |
| `Logo.ico` | Favicon |
| `Logo-icon.png` | Ícone PWA pequeno |
| `icon-512x512.png` | Ícone PWA 512px / apple-touch-icon |
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
| `STYLEGUIDE.md` | Tokens de design, paleta, tipografia |
| `empresas.md` | Regras de cadastro de empresas |
| `jogo.md` | Mecânica do minijogo |
