# SoftSkills Hub — Contexto e Memória do Projeto

> Documento de referência para todas as sessões de desenvolvimento.
> Atualizado em: 2026-04-29

---

## Visão Geral

Plataforma **mobile-first** (max-width 400px) que conecta jovens aprendizes e gestores educacionais. Atua na intersecção dos ODS 3 (Saúde e Bem-Estar) e ODS 9 (Indústria e Inovação).

**Dois perfis com interfaces separadas:**
- **Aprendiz:** cadastro anônimo, enquete de clima, mural da comunidade, trilhas de soft skills, jogo de memória corporativa
- **Gestor:** dashboard analítico com KPIs, ranking de problemas, satisfação por empresa e **gerenciamento de artigos das trilhas**

---

## Identidade Visual

As cores passam no critério **WCAG AA (≥ 4.5:1)** com texto branco.

| Variável CSS     | Hex (light) | Hex (dark) | Uso                                         |
|------------------|-------------|------------|---------------------------------------------|
| `--verde`        | `#367a28`   | `#4fb53e`  | Cor primária do aprendiz                    |
| `--laranja`      | `#c4521a`   | `#e0693a`  | Cor primária do gestor                      |
| `--roxo`         | `#8e44ad`   | `#b06ccc`  | Seção de jogos                              |
| `--fundo`        | `#f4f7f6`   | `#121212`  | Background geral                            |
| `--card`         | `#ffffff`   | `#1e1e1e`  | Cards e painéis                             |
| `--texto`        | `#333333`   | `#e4e4e4`  | Texto principal                             |
| `--muted`        | `#777777`   | `#9e9e9e`  | Texto secundário                            |

**Fonte:** Inter (Google Fonts) → Segoe UI → sans-serif
**Headers:** `linear-gradient(135deg, ...)` — cor muda por aba no painel do aprendiz
**Dark mode:** classe `tema-escuro` no `<html>`, salvo em `localStorage` como `ssh_tema`
**Transição de tema:** classe temporária `tema-transition` aplicada via JS durante a alternância

---

## Estrutura de Arquivos

```
SoftSkills-Hub/
├── frontend/
│   ├── index.html               ← Login (aprendiz + gestor) e cadastro
│   ├── painel.aprendiz.html     ← Painel SPA do aprendiz
│   ├── painel-gestor.html       ← Painel SPA do gestor (dashboard + trilhas)
│   ├── css/
│   │   ├── global.css           ← Variáveis, reset, componentes compartilhados
│   │   ├── login.css            ← Estilos da tela de autenticação
│   │   ├── aprendiz.css         ← Estilos exclusivos do painel do aprendiz
│   │   └── gestor.css           ← Estilos exclusivos do painel do gestor
│   ├── js/
│   │   ├── theme.js             ← aplicarTema / alternarTema / atualizarBtnTema
│   │   ├── utils.js             ← Helpers compartilhados (mostrar, escapeHtml, toast…)
│   │   ├── api.js               ← apiFetch — wrapper autenticado para o backend
│   │   ├── aprendiz/
│   │   │   ├── app.js           ← Init, getToken, sair, navegarApp (aprendiz)
│   │   │   ├── enquete.js       ← Lógica da enquete de clima
│   │   │   ├── mural.js         ← Mural da comunidade
│   │   │   ├── trilhas.js       ← Artigos e dica do dia
│   │   │   ├── jogo.js          ← Jogo de memória corporativa
│   │   │   └── perfil.js        ← Perfil do aprendiz
│   │   └── gestor/
│   │       ├── app.js           ← Init, getToken, sair, navegarApp (gestor)
│   │       ├── dashboard.js     ← KPIs, donut chart, filtros do resumo
│   │       ├── problemas.js     ← Ranking de problemas
│   │       ├── empresas.js      ← Satisfação por empresa e detalhe
│   │       ├── trilhas.js       ← CRUD de artigos
│   │       └── perfil.js        ← Perfil do gestor
│   └── emoji/                   ← Imagens decorativas dos cards
│
├── backend/
│   ├── main.py                  ← FastAPI + todas as rotas
│   ├── models.py                ← ORM SQLAlchemy (8 tabelas)
│   ├── schemas.py               ← Validação Pydantic v2
│   ├── auth.py                  ← bcrypt + JWT (HS256, 8h)
│   ├── database.py              ← SQLite via SQLAlchemy
│   ├── seed.py                  ← Dados iniciais (61 empresas, admin, artigos, 196 respostas)
│   ├── requirements.txt         ← Dependências Python
│   └── softskills.db            ← Banco SQLite (gerado automaticamente)
│
└── docs/
    ├── contexto-projeto.md      ← Este arquivo
    ├── ideia-geral.md           ← Documento de visão e requisitos
    ├── empresas.md              ← Lista das 61 empresas parceiras
    ├── jogo.md                  ← Especificação do jogo de memória
    ├── DATABASE_SCHEMA.md       ← Documentação completa das 8 tabelas
    └── STYLEGUIDE.md            ← Design system: cores, componentes, convenções JS
```

---

## Backend — API REST (FastAPI + SQLite)

**URL local:** `http://localhost:8000`
**Documentação interativa:** `http://localhost:8000/docs`

### Como rodar

```bash
cd backend
pip install -r requirements.txt
python seed.py          # apenas na primeira vez (ou ao recriar o banco)
uvicorn main:app --reload
```

### Endpoints

| Método | Rota | Acesso | Descrição |
|--------|------|--------|-----------|
| GET | `/empresas` | Público | Lista as 61 empresas |
| POST | `/auth/aprendiz/register` | Público | Cadastro do aprendiz |
| POST | `/auth/aprendiz/login` | Público | Login (form-urlencoded) → JWT |
| POST | `/auth/aprendiz/refresh` | Aprendiz | Renova o JWT (token válido → novo token) |
| GET | `/auth/aprendiz/me` | Aprendiz | Perfil do usuário logado (inclui `is_admin`) |
| PUT | `/auth/aprendiz/perfil` | Aprendiz | Altera username e/ou senha |
| POST | `/auth/gestor/login` | Público | Login gestor (JSON) → JWT |
| POST | `/auth/gestor/refresh` | Gestor | Renova o JWT do gestor |
| GET | `/auth/gestor/me` | Gestor | Valida token e retorna dados do gestor |
| PUT | `/auth/gestor/perfil` | Gestor | Altera nome de exibição e/ou senha |
| POST | `/enquete/responder` | Aprendiz | Envia respostas anônimas (cooldown 7 dias) |
| GET | `/mural` | Público | Lista mensagens com paginação (`skip`, `limit`) — `X-Total-Count` no header |
| POST | `/mural` | Aprendiz | Posta mensagem anônima (**rate limit: 1 post / 2 min — persistido no banco**) |
| DELETE | `/mural/{id}` | Aprendiz admin | Apaga mensagem (requer `is_admin=True`, HTTP 403 caso contrário) |
| GET | `/artigos` | Público | Lista artigos (filtro por `?categoria=`) |
| GET | `/artigos/{id}` | Público | Artigo específico |
| POST | `/artigos` | Gestor | Cria novo artigo |
| PUT | `/artigos/{id}` | Gestor | Atualiza artigo existente |
| DELETE | `/artigos/{id}` | Gestor | Remove artigo |
| GET | `/dashboard/resumo` | Gestor | KPIs + top 3 pontos positivos/negativos — filtros: `empresa_id`, `genero`, `faixa_etaria`, `ano` |
| GET | `/dashboard/problemas` | Gestor | Ranking de problemas — filtros acima |
| GET | `/dashboard/satisfacao-por-empresa` | Gestor | Média de satisfação por empresa |
| GET | `/dashboard/efetivacao-por-empresa` | Gestor | % efetivação por empresa |
| GET | `/dashboard/empresa/{id}/detalhes` | Gestor | Efetivação por gênero, problemas e avaliações |

### Autenticação

- **Aprendiz:** JWT salvo em `localStorage` como `ssh_token`
  - Login usa `application/x-www-form-urlencoded` (padrão OAuth2)
  - Token enviado via header `Authorization: Bearer <token>`
- **Gestor:** JWT salvo como `ssh_token_gestor`
  - Login usa `application/json` com `{ username, senha }`

### Migrações automáticas no startup

O backend executa `ALTER TABLE` idempotentes no startup para colunas adicionadas após a criação inicial do banco:

```python
# Colunas adicionadas via migração (try/except — ignoram se já existirem):
ALTER TABLE aprendizes ADD COLUMN last_enquete_at DATETIME
ALTER TABLE aprendizes ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT 0
ALTER TABLE aprendizes ADD COLUMN last_mural_post_at DATETIME
```

---

## Banco de Dados — Modelo

### Princípio LGPD
`RespostaEnquete` **não armazena o ID do aprendiz**. Os dados demográficos (empresa, gênero, faixa etária) são copiados no momento do envio, impossibilitando rastreamento individual.

### Tabelas

| Tabela | Descrição |
|--------|-----------|
| `empresas` | 61 empresas parceiras |
| `aprendizes` | Usuários aprendizes — inclui `is_admin` e `last_enquete_at` |
| `gestores` | Usuários gestores |
| `respostas_enquete` | Cabeçalho anônimo de cada resposta de clima |
| `respostas_problemas` | Itens da pergunta 1 (checkboxes de problemas) |
| `respostas_avaliacao` | Itens da pergunta 2 (pontos positivos/negativos) |
| `mensagens_mural` | Mensagens anônimas do mural |
| `artigos` | Conteúdo das trilhas de soft skills |

### Faixas etárias (privacidade)
Idade exata nunca é gravada nas respostas — convertida em faixa:
`15-16` | `17-18` | `19-21` | `22`

---

## Credenciais de Teste

| Perfil | Usuário | Senha | Observação |
|--------|---------|-------|------------|
| Aprendiz de teste | `teste` | `123456` | Conta padrão do seed |
| Gestor / Admin | `admin` | `123456` | Criado pelo seed.py |
| Aprendiz admin | `aprendiz-adm` | `admin` | Criado no startup — pode apagar mensagens do mural |

---

## Frontend — Telas

### `index.html` — Autenticação
- Aba **Sou Aprendiz** (verde): login → redireciona para `painel.aprendiz.html`
- Aba **Sou Gestor** (laranja): login → redireciona para `painel-gestor.html`
- Cadastro de aprendiz: carrega empresas dinamicamente, medidor de força de senha
- Inputs com ícones SVG inline (usuário e cadeado)
- Logo SVG inline no header (sem arquivo externo)

### `painel.aprendiz.html` — Painel do Aprendiz (SPA)

| Aba (bottom-nav) | Cor do header | Conteúdo |
|------------------|---------------|----------|
| 🏠 Início | Verde | Cards: Enquete, Jogo, Dica do Dia |
| 💬 Mural | Azul | Post + listagem com rate limit de 2 min; admin vê botão apagar |
| 📚 Trilhas | Laranja | Artigos expansíveis por categoria com filtros |
| 👤 Perfil | Roxo | Username/senha; badges de gênero e faixa etária; "Tempo aqui" |

**Enquete (4 perguntas com barra de progresso):**
1. Problemas — 26 opções em scroll-box com fade gradient
2. Avaliação — pontos positivos (5) e negativos (5)
3. Desejo de efetivação — radio (sim / não / talvez)
4. Satisfação geral — escala 1–5 colorida (vermelho→verde) com rótulos

**Jogo — Memória Corporativa:** grid 4×3, flip 3D, sparkle ao acertar par, 6 termos de 14 possíveis

**Micro-interações:**
- Confetti ao enviar enquete com sucesso
- Animação de entrada escalonada (stagger) nos cards do mural e artigos
- KPIs do início com contagem animada

### `painel-gestor.html` — Painel do Gestor (SPA)

| Aba | Conteúdo |
|-----|----------|
| 📊 Resumo | 4 KPIs animados + donut chart de efetivação com tooltip, click-to-filter e badge de interpretação; filtros com badge de ativos e botão "Limpar" |
| ⚠️ Problemas | Ranking com medalhas 🥇🥈🥉 no pódio; filtros por empresa/gênero/faixa/ano com badge e botão "Limpar" |
| 🏭 Empresas | Estrelas coloridas + barra de avaliação + % efetivação; filtro por ano com badge; detalhe por empresa |
| 📚 Trilhas | **CRUD de artigos:** listar, criar, editar, apagar com modal bottom sheet |
| 👤 Perfil | Nome de exibição, senha, tema claro/escuro |

**Detalhe de empresa:** efetivação cruzada por gênero, ranking de problemas, pontos positivos e negativos.

---

## Decisões Técnicas Importantes

| Decisão | Motivo |
|---------|--------|
| SQLite no backend | Simplicidade para desenvolvimento local — sem necessidade de servidor de banco |
| `default=_now` nos models | `server_default=func.now()` do SQLite não preenche o campo em memória, causando falha no Pydantic |
| `bcrypt==4.0.1` fixado | Versão 4.x+ do bcrypt quebra a integração com `passlib` no Python 3.14 |
| `allow_credentials=False` no CORS | JWT é enviado via header Authorization, não via cookie |
| Agregação SQL no dashboard | `dashboard_resumo` usa `AVG`/`COUNT`/`CASE` — evita N+1 queries |
| `substr(data, 1, 4)` para filtro de ano | `strftime('%Y', ...)` falha com microsegundos no SQLite |
| Rate limiting do mural persistido no banco | `last_mural_post_at` em `aprendizes` — sobrevive ao reinício do servidor; não precisa de Redis |
| `is_admin` criado por startup | Sem endpoint de promoção — a conta `aprendiz-adm` é criada automaticamente se não existir |
| CRUD de artigos restrito ao gestor | Conteúdo educacional é curatorial — aprendizes não devem criar/editar artigos |
| Arquitetura em camadas no frontend | CSS e JS separados por domínio em `css/` e `js/aprendiz/` / `js/gestor/`; `app.js` carregado por último para garantir que todas as funções de domínio já existam no escopo global quando o `init()` é executado |
| `getToken()` definida em `app.js`, usada em `api.js` | `api.js` carrega antes de `app.js`, mas `getToken()` só é chamada em runtime dentro de `apiFetch()` — sem problema de ordem de carregamento |
| `nenhum_pos`/`nenhum_neg` filtrados no frontend | Aceitos pelo validador do backend para não causar HTTP 422, mas removidos do payload antes do POST em `enquete.js` — nunca gravados no banco |
| `nenhum` excluído dos rankings de problemas | `WHERE problema != 'nenhum'` nos endpoints `/dashboard/problemas` e detalhe por empresa — evita que "ausência de problema" apareça como um problema no ranking |
| 401 → redirect automático para login | `_expirarSessao()` em `api.js` limpa os tokens e redireciona para `index.html?sessao=expirada`; a tela de login detecta o parâmetro e exibe toast de aviso |
| Bottom-nav com `left:50%; transform:translateX(-50%)` | Garante centralização em qualquer largura de viewport sem depender da posição do pai no DOM |
| Refresh de token no init() | Após `/auth/*/me` retornar 200, uma chamada fire-and-forget para `/auth/*/refresh` emite novo token e atualiza o `localStorage` — evita expiração silenciosa durante sessões longas |
| Indicador offline via `navigator.onLine` | Banner fixo aparece/desaparece com eventos `online`/`offline` — injetado via `initOfflineIndicator()` em `utils.js`, chamado em ambos os `init()` |
| Inputs de login com `<label class="sr-only">` | Acessibilidade WCAG: leitores de tela identificam os campos sem impacto visual |
| Compartilhamento de mensagem do mural | Web Share API com fallback para `navigator.clipboard` — sem dependência externa |

---

## Funcionalidades Pendentes

| Área | Status |
|------|--------|
| Segundo minijogo de descompressão | Apenas o jogo de memória implementado |
| Troca da `SECRET_KEY` do JWT | Lida de `os.environ.get("SECRET_KEY", "chave-local-...")` — definir em produção |
| Rate limiting nas rotas de login | ✅ Implementado via `@limiter.limit("5/minute")` (slowapi) |
| Persistência do rate limiting do mural | ✅ Implementado via coluna `last_mural_post_at` em `aprendizes` |
| Refresh de token JWT | ✅ Endpoints `POST /auth/*/refresh`; init() em ambos os painéis atualiza token silenciosamente |
| Paginação do mural | ✅ Implementado com `skip`/`limit` e header `X-Total-Count`; botão "Carregar mais" no frontend |
| Export CSV do dashboard | Endpoint `GET /dashboard/export` com filtros de empresa/gênero/faixa etária/ano |
