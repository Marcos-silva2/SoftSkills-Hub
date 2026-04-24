# SoftSkills Hub — CLAUDE.md

Guia de referência rápida para desenvolvimento. Leia antes de alterar qualquer arquivo.

---

## Estrutura do Projeto

```
SoftSkills-Hub/
├── frontend/          # PWA estático (GitHub Pages)
│   ├── index.html           # Login / Splash screen
│   ├── aprendiz.html        # Painel do aprendiz (6 views)
│   ├── gestor.html          # Painel do gestor (6 views)
│   ├── manifest.json        # Metadados PWA
│   ├── sw.js                # Service worker (cache-first, v13)
│   ├── assets/icons/        # Imagens e ícones
│   ├── styles/              # CSS (global, aprendiz, gestor, login)
│   └── scripts/
│       ├── core/            # Módulos compartilhados
│       │   ├── api.js           → Cliente HTTP + token
│       │   ├── theme.js         → Tema claro/escuro
│       │   ├── dom.js           → Helpers de DOM e sanitização
│       │   ├── format.js        → Formatação de datas
│       │   ├── feedback.js      → Toast, vibração, shake, botão
│       │   ├── animations.js    → GSAP helpers, ripple, navPill
│       │   └── pwa.js           → Pull-to-refresh, offline banner
│       ├── aprendiz/        # Módulos do painel aprendiz
│       │   ├── app.js           → Router + inicialização
│       │   ├── enquete.js       → Wizard de enquete (4 passos)
│       │   ├── mural.js         → Mural anônimo da comunidade
│       │   ├── trilhas.js       → Trilhas de leitura / artigos
│       │   ├── jogo.js          → Jogo de memória (soft skills)
│       │   └── perfil.js        → Perfil e configurações
│       └── gestor/          # Módulos do painel gestor
│           ├── app.js           → Router + inicialização
│           ├── dashboard.js     → KPIs e gráficos
│           ├── problemas.js     → Ranking de problemas
│           ├── empresas.js      → Satisfação por empresa
│           ├── trilhas.js       → CRUD de artigos
│           └── perfil.js        → Perfil do gestor
└── backend/           # API FastAPI (Render)
    ├── main.py              # Entry point, routers, lifespan
    ├── models.py            # Modelos SQLAlchemy (8 tabelas)
    ├── schemas.py           # Schemas Pydantic (validação)
    ├── seed.py              # Seed inicial do banco
    ├── core/                # Infraestrutura central
    │   ├── security.py      → Hash bcrypt + JWT HS256
    │   ├── database.py      → Engine SQLAlchemy + get_db()
    │   ├── dependencies.py  → get_aprendiz_atual / get_gestor_atual
    │   └── rate_limiter.py  → slowapi limiter
    ├── routers/             # Camada HTTP (FastAPI routers)
    │   ├── empresas.py, auth_aprendiz.py, auth_gestor.py
    │   ├── enquete.py, mural.py, artigos.py, dashboard.py
    └── services/            # Regras de negócio
        ├── enquete_service.py, mural_service.py
        ├── sanitizer.py, dashboard_service.py
```

---

## Arquitetura em Camadas

### Frontend (Vanilla JS, sem bundler)

```
Camada de Apresentação   → HTML (aprendiz.html, gestor.html, index.html)
Camada de Aplicação      → scripts/aprendiz/app.js, scripts/gestor/app.js (roteador)
Camada de Domínio        → scripts/aprendiz/*.js, scripts/gestor/*.js (lógica de feature)
Camada de Serviço        → scripts/core/api.js (HTTP), scripts/core/theme.js
Camada de Utilitários    → scripts/core/dom.js, format.js, feedback.js, animations.js, pwa.js
```

**Ordem de carregamento dos scripts** (respeitar esta ordem nos HTMLs):
1. `theme.js` — aplica tema antes de renderizar qualquer coisa
2. `dom.js` → `format.js` → `feedback.js` → `animations.js` → `pwa.js`
3. `api.js`
4. Módulos de feature (`enquete.js`, `mural.js`, etc.)
5. `app.js` — sempre por último (depende de todos os outros)

### Backend (FastAPI + SQLAlchemy)

```
Camada HTTP          → routers/  (valida entrada, chama services)
Camada de Negócio    → services/ (regras, validações de domínio)
Camada de Domínio    → models.py (entidades SQLAlchemy)
Camada de Contratos  → schemas.py (Pydantic, DTOs de entrada/saída)
Infraestrutura       → core/     (segurança, banco, rate limiting)
```

---

## Comandos Úteis

### Backend local
```bash
cd backend
pip install -r requirements.txt
python seed.py         # popular banco pela primeira vez
uvicorn main:app --reload
# Swagger em http://localhost:8000/docs
```

### Variáveis de ambiente (`.env` em backend/)
```
SECRET_KEY=<string aleatória forte>
DATABASE_URL=sqlite:///./softskills.db
```

### Migrations (Alembic)
```bash
cd backend
alembic upgrade head
alembic revision --autogenerate -m "descricao"
```

---

## Convenções

### JavaScript
- Funções globais em camelCase. Variáveis de estado privadas com prefixo `_`.
- Funções de "limpeza" ao sair de uma view devem ser nomeadas `<módulo>Limpar()` (ex: `jogoLimpar()`).
- Não usar `innerHTML` com dados do usuário — sempre via `escapeHtml()` de `dom.js`.

### Python
- Imports da camada `core` sempre via `from core.xxx import ...`.
- Nunca importar `auth`, `database`, `dependencies` ou `limiter` diretamente — usar `core.*`.
- Services recebem `db: Session` como parâmetro, nunca criam sessão própria.
- Routers não contêm lógica de negócio — apenas validação de entrada e delegação aos services.

### CSS
- Variáveis de tema em `styles/global.css` (`:root` e `html.tema-escuro`).
- Estilos específicos de feature: `styles/aprendiz.css` ou `styles/gestor.css`.
- Nunca usar `!important` fora dos overrides de tema (`.tema-*` headers).

---

## Deploy

| Serviço | Plataforma | Configuração |
|---------|-----------|--------------|
| Frontend | GitHub Pages | `.github/workflows/deploy.yml` — publica `frontend/` |
| Backend  | Render       | `render.yaml` — `cd backend && uvicorn main:app` |

**Atenção ao incrementar o cache do SW:** ao renomear arquivos cacheados, sempre incrementar `CACHE = 'softskills-vNN'` em `sw.js`.

---

## Segurança

- `escapeHtml()` obrigatório em todo dado vindo do servidor ou do usuário antes de `innerHTML`.
- Mural: sanitização server-side em `services/sanitizer.py` (blocklist + strip HTML).
- Enquete: desvinculada do aprendiz no banco (LGPD) — copia apenas dados demográficos no momento da resposta.
- JWT: tipo `"aprendiz"` ou `"gestor"` no payload; validado em `core/dependencies.py`.
