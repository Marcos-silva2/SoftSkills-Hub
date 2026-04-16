# SoftSkills Hub — Contexto e Memória do Projeto

> Documento de referência para todas as sessões de desenvolvimento.
> Atualizado em: 2026-04-14

---

## Visão Geral

Plataforma **mobile-first** (max-width 400px) que conecta jovens aprendizes e gestores educacionais. Atua na intersecção dos ODS 3 (Saúde e Bem-Estar) e ODS 9 (Indústria e Inovação).

**Dois perfis com interfaces separadas:**
- **Aprendiz:** cadastro anônimo, enquete de clima, mural, trilhas de soft skills
- **Gestor:** dashboard analítico com KPIs, ranking de problemas e satisfação por empresa

---

## Identidade Visual

| Variável CSS | Valor | Uso |
|---|---|---|
| `--verde` / `--ods3-verde` | `#4C9F38` | Cor primária do aprendiz (ODS 3) |
| `--laranja` / `--ods9-laranja` | `#FD6925` | Cor primária do gestor (ODS 9) |
| `--roxo` / `--cor-jogo` | `#8e44ad` | Seção de descompressão/jogos |
| `--fundo` / `--fundo-tela` | `#f4f7f6` | Background geral |
| `--card` / `--fundo-card` | `#ffffff` | Cards e painéis |
| `--texto` / `--texto-escuro` | `#333333` | Texto principal |
| `--muted` / `--texto-claro` | `#777777` | Texto secundário |

**Fonte:** Segoe UI → Tahoma → Verdana (sans-serif)
**Animação padrão:** `fadeIn` — `translateY(5–10px → 0)`, `0.3–0.4s ease`
**Nota:** os arquivos do frontend usam nomes curtos (`--verde`, `--laranja`). O `contexto-projeto.md` antigo usava nomes longos — ambos são equivalentes.

---

## Estrutura de Arquivos

```
SoftSkills-Hub/
├── frontend/
│   ├── index.html               ← Login (aprendiz + gestor) e cadastro
│   ├── painel.aprendiz.html     ← Painel SPA do aprendiz
│   └── painel-gestor.html       ← Painel SPA do gestor (dashboard)
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
├── docs/
│   ├── contexto-projeto.md      ← Este arquivo
│   ├── ideia-geral.md           ← Documento de visão e requisitos
│   ├── empresas.md              ← Lista das 61 empresas parceiras
│   ├── jogo.md                  ← Especificação do jogo de memória
│   ├── DATABASE_SCHEMA.md       ← Documentação completa das 8 tabelas
│   └── STYLEGUIDE.md            ← Design system: cores, componentes, convenções JS
│
└── index.html / painel.aprendiz.html  ← PROTÓTIPOS ANTIGOS (não usar)
```

**Importante:** usar sempre os arquivos dentro de `frontend/`. Os arquivos na raiz são protótipos sem integração com o backend.

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
|---|---|---|---|
| GET | `/empresas` | Público | Lista as 61 empresas |
| POST | `/auth/aprendiz/register` | Público | Cadastro do aprendiz |
| POST | `/auth/aprendiz/login` | Público | Login (form-urlencoded) → JWT |
| GET | `/auth/aprendiz/me` | Aprendiz | Perfil do usuário logado |
| PUT | `/auth/aprendiz/perfil` | Aprendiz | Altera username e/ou senha |
| POST | `/auth/gestor/login` | Público | Login gestor (JSON) → JWT |
| GET | `/auth/gestor/me` | Gestor | Valida token e retorna dados do gestor |
| PUT | `/auth/gestor/perfil` | Gestor | Altera nome de exibição e/ou senha |
| POST | `/enquete/responder` | Aprendiz | Envia respostas anônimas |
| GET | `/mural` | Público | Lista últimas 50 mensagens |
| POST | `/mural` | Aprendiz | Posta mensagem anônima |
| GET | `/artigos` | Público | Lista artigos (filtro por `categoria`) |
| GET | `/artigos/{id}` | Público | Artigo específico |
| GET | `/dashboard/resumo` | Gestor | KPIs — filtros: `empresa_id`, `genero`, `faixa_etaria` |
| GET | `/dashboard/problemas` | Gestor | Ranking de problemas — filtros: `empresa_id`, `genero`, `faixa_etaria` |
| GET | `/dashboard/satisfacao-por-empresa` | Gestor | Média de satisfação por empresa |
| GET | `/dashboard/efetivacao-por-empresa` | Gestor | % efetivação — filtros: `empresa_id`, `genero`, `faixa_etaria` |
| GET | `/dashboard/empresa/{id}/detalhes` | Gestor | Efetivação por gênero, problemas e avaliações de uma empresa |

### Autenticação

- **Aprendiz:** JWT salvo em `localStorage` como `ssh_token`
  - Login usa `application/x-www-form-urlencoded` (padrão OAuth2)
  - Token carregado via header `Authorization: Bearer <token>`
- **Gestor:** JWT salvo como `ssh_token_gestor`
  - Login usa `application/json` com `{ username, senha }`

---

## Banco de Dados — Modelo

### Princípio LGPD
`RespostaEnquete` **não armazena o ID do aprendiz**. Os dados demográficos (empresa, gênero, faixa etária) são copiados no momento do envio, impossibilitando rastreamento individual.

### Tabelas

| Tabela | Descrição |
|---|---|
| `empresas` | 61 empresas parceiras |
| `aprendizes` | Usuários aprendizes (username anônimo) |
| `gestores` | Usuários gestores/admin |
| `respostas_enquete` | Cabeçalho anônimo de cada resposta |
| `respostas_problemas` | Itens da pergunta 1 (checkboxes) |
| `respostas_avaliacao` | Itens da pergunta 2 (positivos/negativos) |
| `mensagens_mural` | Mensagens anônimas do mural |
| `artigos` | Conteúdo das trilhas de soft skills |

### Faixas etárias (privacidade)
Idade exata nunca é gravada nas respostas — convertida em faixa:
`14–16` | `17–18` | `19–21` | `22–24`

---

## Credenciais de Teste

| Perfil | Usuário | Senha |
|---|---|---|
| Aprendiz de teste | `teste` | `123456` |
| Gestor / Admin | `admin` | `123456` |

---

## Frontend — Telas

### `index.html` — Autenticação
- Aba **Sou Aprendiz** (verde): login com usuário + senha → redireciona para `painel.aprendiz.html`
- Aba **Sou Gestor** (laranja): login com usuário + senha → redireciona para `painel-gestor.html`
- Tela de cadastro: carrega empresas dinamicamente da API, valida todos os campos antes de enviar
- Banner de aviso automático se o backend não estiver rodando

### `painel.aprendiz.html` — Painel do Aprendiz (SPA)
Saudação com nome real buscado via `GET /auth/aprendiz/me`.

| Aba (bottom-nav) | Conteúdo |
|---|---|
| 🏠 Início | Cards: Enquete, Descompressão (jogo), Dica do Dia (artigo mais recente) |
| 👥 Mural | Post + listagem de mensagens anônimas da comunidade |
| 📚 Leitura | Trilhas de Soft Skills — artigos expansíveis por categoria |
| 👤 Perfil | Troca de username e senha; botão Sair |

**Enquete (4 perguntas):**
1. Problemas na empresa — 26 opções, checkbox com scroll
2. Avaliação — pontos positivos (6) e negativos (6) separados
3. Desejo de efetivação — radio (sim / não / talvez)
4. Satisfação geral — escala 1–5

**Jogo — Memória Corporativa:**
Grid 4×3 de cartas com flip 3D. 6 termos sorteados de um pool de 14 (Networking, Proatividade, Resiliência, Mindset, etc.). Inclui glossário pós-jogo.

### `painel-gestor.html` — Painel do Gestor (SPA)
Filtros por empresa, gênero e faixa etária disponíveis em todas as abas.

| Aba | Conteúdo |
|---|---|
| 📊 Resumo | 4 KPIs + barras de efetivação geral (com filtros) |
| ⚠️ Problemas | Ranking dos problemas mais relatados (com filtros próprios) |
| 🏭 Empresas | Satisfação (estrelas + média), % efetivação; botão "Ver detalhes" por empresa |
| 👤 Perfil | Troca de nome de exibição e senha; botão Sair |

**Detalhe de empresa:** efetivação cruzada por gênero (tabela), ranking de problemas, pontos positivos e negativos.

---

## Decisões Técnicas Importantes

| Decisão | Motivo |
|---|---|
| SQLite no backend | Simplicidade para desenvolvimento local — sem necessidade de servidor de banco |
| `default=_now` nos models | `server_default=func.now()` do SQLite não preenche o campo em memória, causando falha no Pydantic |
| `bcrypt==4.0.1` fixado | Versão 4.x+ do bcrypt quebra a integração com `passlib` no Python 3.14 |
| `allow_credentials=False` no CORS | JWT é enviado via header Authorization, não via cookie — `credentials=True` com `allow_origins=["*"]` é bloqueado pelo browser |
| `"null"` removido das origens CORS | Substituído por `allow_origins=["*"]` que é mais simples e correto para JWT |
| Agregação SQL no dashboard | `dashboard_resumo` usa SQL `AVG`/`COUNT`/`CASE` — evita carregar todas as linhas em memória |
| `efetivacao_por_empresa` com GROUP BY | Substituiu loop N+1 (uma query por empresa) por uma única query agrupada |

---

## Funcionalidades Pendentes

| Área | Status |
|---|---|
| Gráficos no dashboard do gestor | Barras em HTML puro — Chart.js ainda não integrado |
| Mais artigos nas trilhas | Apenas 4 artigos (1 por categoria) |
| Segundo minijogo de descompressão | Apenas o jogo de memória implementado |
| Rate limiting nas rotas de login | Não implementado |
| Troca da `SECRET_KEY` do JWT | Hardcoded em `auth.py` — necessário para produção |
