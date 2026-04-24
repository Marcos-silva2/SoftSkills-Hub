# Arquitetura — SoftSkills Hub

## Visão Geral

O SoftSkills Hub é uma plataforma PWA de desenvolvimento socioemocional para jovens aprendizes, composta por:

- **Frontend**: aplicação estática (HTML + CSS + JS puro), hospedada no GitHub Pages
- **Backend**: API REST em FastAPI (Python), hospedada no Render com banco SQLite

---

## Estrutura de Camadas

### Frontend

A camada de apresentação é dividida em três grupos por responsabilidade:

```
┌──────────────────────────────────────────────────────────┐
│                    APRESENTAÇÃO                          │
│   index.html   aprendiz.html   gestor.html               │
├──────────────────────────────────────────────────────────┤
│                    APLICAÇÃO (Router)                    │
│   scripts/aprendiz/app.js   scripts/gestor/app.js        │
├──────────────────────────────────────────────────────────┤
│                    FEATURES (Domínio)                    │
│   enquete · mural · trilhas · jogo · perfil              │
│   dashboard · problemas · empresas                       │
├──────────────────────────────────────────────────────────┤
│                    SERVIÇOS CORE                         │
│   api.js · theme.js                                      │
├──────────────────────────────────────────────────────────┤
│                    UTILITÁRIOS                           │
│   dom.js · format.js · feedback.js · animations.js · pwa.js │
└──────────────────────────────────────────────────────────┘
```

#### Módulos Core

| Arquivo | Responsabilidade | Funções principais |
|---------|-------------------|-------------------|
| `api.js` | Cliente HTTP com autenticação | `apiFetch`, `apiFetchComTotal` |
| `theme.js` | Tema claro/escuro | `aplicarTema`, `alternarTema` |
| `dom.js` | Manipulação de DOM e XSS | `mostrar`, `ocultar`, `escapeHtml`, `emptyState` |
| `format.js` | Formatação de dados | `formatarData`, `tempoRelativo` |
| `feedback.js` | Feedback ao usuário | `mostrarToast`, `vibrar`, `adicionarShake` |
| `animations.js` | Micro-interações GSAP | `iniciarRipple`, `atualizarNavPill`, `topBarInicio/Fim` |
| `pwa.js` | Recursos PWA | `iniciarPullToRefresh`, `initOfflineIndicator` |

---

### Backend

```
┌──────────────────────────────────────────────────────────┐
│                    HTTP (Routers)                        │
│   /empresas  /auth/*  /enquete  /mural  /artigos         │
│   /dashboard/*                                           │
├──────────────────────────────────────────────────────────┤
│                    NEGÓCIO (Services)                    │
│   enquete_service · mural_service · dashboard_service    │
│   sanitizer                                              │
├──────────────────────────────────────────────────────────┤
│                    DOMÍNIO (Models)                      │
│   Empresa · Aprendiz · Gestor · RespostaEnquete          │
│   RespostaProblema · RespostaAvaliacao                   │
│   MensagemMural · Artigo                                 │
├──────────────────────────────────────────────────────────┤
│                    CONTRATOS (Schemas)                   │
│   schemas.py  — DTOs Pydantic de entrada/saída           │
├──────────────────────────────────────────────────────────┤
│                    INFRAESTRUTURA (Core)                 │
│   security.py · database.py · dependencies.py            │
│   rate_limiter.py                                        │
└──────────────────────────────────────────────────────────┘
```

#### Core / Infraestrutura

| Arquivo | Responsabilidade |
|---------|-----------------|
| `core/security.py` | Hash bcrypt + geração/validação de JWT HS256 |
| `core/database.py` | Engine SQLAlchemy, SessionLocal, Base, `get_db()` |
| `core/dependencies.py` | Dependências FastAPI: `get_aprendiz_atual`, `get_gestor_atual` |
| `core/rate_limiter.py` | Instância global do slowapi Limiter |

---

## Fluxo de uma Requisição Autenticada

```
Browser
  │ Authorization: Bearer <JWT>
  ▼
Router (routers/*.py)
  │ Depends(get_aprendiz_atual)
  ▼
core/dependencies.py
  │ core/security.verificar_token(token)
  │ db.query(Aprendiz).filter(id == sub).first()
  ▼
Service (services/*.py)
  │ Lógica de negócio
  ▼
Model (models.py) via SQLAlchemy Session
  │
  ▼
SQLite (softskills.db)
```

---

## Decisões de Design

### LGPD — Enquete Anônima
As respostas de enquete **não possuem FK para o aprendiz**. No momento da resposta, apenas dados demográficos agregados (empresa, gênero, faixa etária) são copiados para `RespostaEnquete`. Isso garante que respostas não possam ser rastreadas a um indivíduo específico.

### PWA sem bundler
O projeto usa **JS puro sem módulos ES** para garantir compatibilidade máxima e evitar a necessidade de um processo de build. Os scripts são carregados como `<script>` tags com ordem explícita definida no HTML. Qualquer refatoração que introduza `import/export` exigiria adicionar um passo de build (Vite, esbuild, etc.) e atualizar o deploy.

### Service Worker Cache-First
O SW usa estratégia **cache-first** para assets estáticos. Ao atualizar qualquer arquivo cacheado, é obrigatório incrementar a constante `CACHE` em `sw.js` para forçar a revalidação nos clientes.

### Banco SQLite em Produção
O banco é um arquivo SQLite persistido no volume do Render. Para escalar para múltiplas instâncias, seria necessário migrar para PostgreSQL (alterar apenas `DATABASE_URL` em `.env` — o código é agnóstico via SQLAlchemy).
