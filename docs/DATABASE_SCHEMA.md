# DATABASE_SCHEMA — SoftSkills Hub

Banco de dados: **SQLite** (`softskills.db`), gerenciado pelo SQLAlchemy ORM com mapeamento declarativo (`Mapped` / `mapped_column`).

---

## Tabelas

### `empresas`

Cadastro de empresas parceiras onde os jovens aprendizes trabalham.

| Coluna | Tipo          | Restrições                        |
|--------|---------------|-----------------------------------|
| `id`   | INTEGER       | PK, autoincrement                 |
| `nome` | VARCHAR(150)  | NOT NULL, UNIQUE                  |

**Relacionamentos:**
- `aprendizes` → um-para-muitos com `aprendizes.empresa_id`
- `respostas` → um-para-muitos com `respostas_enquete.empresa_id`

---

### `aprendizes`

Usuários do tipo aprendiz. Autenticados via JWT (tipo `"aprendiz"`).

| Coluna            | Tipo         | Restrições                                                      |
|-------------------|--------------|-----------------------------------------------------------------|
| `id`              | INTEGER      | PK, autoincrement                                               |
| `username`        | VARCHAR(80)  | NOT NULL, UNIQUE                                                |
| `senha_hash`      | VARCHAR(255) | NOT NULL — bcrypt (custo padrão)                               |
| `idade`           | INTEGER      | NOT NULL — aceito: **15 a 22**                                  |
| `genero`          | VARCHAR(30)  | NOT NULL — `feminino \| masculino \| prefiro_nao_dizer`         |
| `empresa_id`      | INTEGER      | NOT NULL, FK → `empresas.id`                                    |
| `created_at`      | DATETIME     | default: `datetime.now(UTC)`                                    |
| `last_enquete_at`    | DATETIME  | nullable — registra quando o aprendiz enviou a última enquete   |
| `last_mural_post_at` | DATETIME  | nullable — registra quando o aprendiz fez o último post no mural (rate limit persistido) |
| `is_admin`           | BOOLEAN   | NOT NULL, default `0` — indica conta com permissão de admin     |

**Relacionamentos:**
- `empresa` → muitos-para-um com `empresas`

**Cooldown de enquete:**
`last_enquete_at` é atualizado no momento do envio de cada resposta. O backend verifica se `agora - last_enquete_at < 7 dias` e retorna HTTP 429 com o tempo restante caso o cooldown não tenha expirado. Quando restam menos de 24 horas, a mensagem exibe horas (ex: "Aguarde 3 horas"); caso contrário, exibe dias. A coluna foi adicionada via `ALTER TABLE` na inicialização do servidor (migração idempotente com `try/except`).

**Propriedade `faixa_etaria` (computada):**
O model `Aprendiz` expõe `faixa_etaria` como `@property` Python, calculada a partir de `idade`. Pydantic lê a propriedade via `from_attributes=True` e a inclui em `AprendizOut`, permitindo que o frontend exiba a faixa no perfil do aprendiz sem expor a idade exata.

**Campo `is_admin`:**
Identifica contas com permissão especial (ex: apagar mensagens do mural). A conta padrão `aprendiz-adm` é criada automaticamente no startup do backend com `is_admin=True`. Adicionado via migração idempotente junto com `last_enquete_at`.

---

### `gestores`

Usuários administrativos. Autenticados via JWT (tipo `"gestor"`).

| Coluna       | Tipo         | Restrições                     |
|--------------|--------------|--------------------------------|
| `id`         | INTEGER      | PK, autoincrement              |
| `username`   | VARCHAR(150) | NOT NULL, UNIQUE               |
| `senha_hash` | VARCHAR(255) | NOT NULL — bcrypt              |
| `nome`       | VARCHAR(100) | nullable — nome de exibição    |
| `created_at` | DATETIME     | default: `datetime.now(UTC)`   |

> O gestor padrão criado pelo `seed.py` tem `username = "admin"`, `nome = "Administrador"`.

---

### `respostas_enquete`

Registro de uma resposta de clima organizacional. **Design deliberadamente anônimo** — sem FK para `aprendizes`.

| Coluna              | Tipo        | Restrições                                               |
|---------------------|-------------|----------------------------------------------------------|
| `id`                | INTEGER     | PK, autoincrement                                        |
| `empresa_id`        | INTEGER     | NOT NULL, FK → `empresas.id`                             |
| `genero`            | VARCHAR(30) | NOT NULL — copiado do perfil no momento do envio         |
| `faixa_etaria`      | VARCHAR(10) | NOT NULL — `"15-16" \| "17-18" \| "19-21" \| "22"`      |
| `desejo_efetivacao` | VARCHAR(10) | NOT NULL — `sim \| nao \| talvez`                        |
| `nota_satisfacao`   | INTEGER     | NOT NULL — 1 a 5                                         |
| `data_resposta`     | DATETIME    | default: `datetime.now(UTC)`                             |

**Relacionamentos:**
- `empresa` → muitos-para-um com `empresas`
- `problemas` → um-para-muitos com `respostas_problemas` (cascade delete)
- `avaliacoes` → um-para-muitos com `respostas_avaliacao` (cascade delete)

**Conformidade LGPD:**
A tabela não armazena o `aprendiz_id`. Gênero e faixa etária são copiados no momento do envio — se o aprendiz atualizar seu perfil, os dados históricos permanecem inalterados e desvinculados. Isso impede a reidentificação das respostas.

**Função `_calcular_faixa_etaria(idade)`:**

```python
def _calcular_faixa_etaria(idade: int) -> str:
    if idade <= 16: return "15-16"
    if idade <= 18: return "17-18"
    if idade <= 21: return "19-21"
    return "22"
```

---

### `respostas_problemas`

Cada linha representa um item marcado na Pergunta 1 ("Quais problemas você enfrenta?").

| Coluna        | Tipo        | Restrições                               |
|---------------|-------------|------------------------------------------|
| `id`          | INTEGER     | PK, autoincrement                        |
| `resposta_id` | INTEGER     | NOT NULL, FK → `respostas_enquete.id`    |
| `problema`    | VARCHAR(80) | NOT NULL                                 |

**Valores possíveis para `problema`** (validados em `schemas.py` pelo conjunto `_PROBLEMAS_VALIDOS`):

| Valor                   | Rótulo                          |
|-------------------------|---------------------------------|
| `assedio_moral`         | Assédio moral                   |
| `favorecimento`         | Favoritismo / nepotismo         |
| `machismo`              | Machismo                        |
| `assedio_sexual`        | Assédio sexual                  |
| `desvio_funcao`         | Desvio de função                |
| `carga_excessiva`       | Carga de trabalho excessiva     |
| `falta_orientacao`      | Falta de orientação             |
| `sobrecarga`            | Sobrecarga de tarefas           |
| `preconceito_etario`    | Preconceito etário              |
| `discriminacao_racial`  | Discriminação racial            |
| `homofobia`             | Homofobia                       |
| `intolerancia_religiosa`| Intolerância religiosa          |
| `atraso_pagamento`      | Atraso no pagamento             |
| `falta_feedback`        | Falta de feedback               |
| `pressao_psicologica`   | Pressão psicológica             |
| `condicoes_inseguras`   | Condições inseguras de trabalho |
| `exclusao_equipe`       | Exclusão da equipe              |
| `desvalorizacao_ideias` | Desvalorização de ideias        |
| `microgerenciamento`    | Microgerenciamento              |
| `tarefas_repetitivas`   | Tarefas muito repetitivas       |
| `ameacas_demissao`      | Ameaças de demissão             |
| `falta_estrutura`       | Falta de estrutura física       |
| `desrespeito_direitos`  | Desrespeito a direitos          |
| `ausencia_intervalo`    | Ausência de intervalo           |
| `proibicao_cursos`      | Proibição de frequentar cursos  |
| `nenhum`                | Nenhum problema relatado        |

> Qualquer valor fora desse conjunto é rejeitado pelo `field_validator` do Pydantic com HTTP 422.

---

### `respostas_avaliacao`

Cada linha representa um item marcado na Pergunta 2 ("Avalie pontos da empresa").

| Coluna        | Tipo        | Restrições                                |
|---------------|-------------|-------------------------------------------|
| `id`          | INTEGER     | PK, autoincrement                         |
| `resposta_id` | INTEGER     | NOT NULL, FK → `respostas_enquete.id`     |
| `tipo`        | VARCHAR(10) | NOT NULL — `positivo \| negativo`         |
| `valor`       | VARCHAR(80) | NOT NULL                                  |

**Valores para `tipo = "positivo"`** (validados pelo conjunto `_POSITIVOS_VALIDOS`):

| Valor              | Rótulo (exibido ao aprendiz e ao gestor) |
|--------------------|------------------------------------------|
| `aprendizado`      | Bom aprendizado prático                  |
| `clima_bom`        | Bom clima na equipe                      |
| `lideranca_apoio`  | Liderança prestativa                     |
| `beneficios`       | Bons benefícios                          |
| `flexibilidade`    | Flexibilidade de horários                |
| `nenhum_pos`       | Nenhum ponto positivo                    |

**Valores para `tipo = "negativo"`** (validados pelo conjunto `_NEGATIVOS_VALIDOS`):

| Valor                  | Rótulo (exibido ao aprendiz e ao gestor) |
|------------------------|------------------------------------------|
| `comunicacao_ruim`     | Comunicação ruim                         |
| `desorganizacao`       | Desorganização                           |
| `clima_tenso`          | Clima tenso                              |
| `falta_reconhecimento` | Falta de reconhecimento                  |
| `distancia_lideranca`  | Liderança ausente                        |
| `nenhum_neg`           | Nenhum ponto negativo                    |

> `nenhum_pos` e `nenhum_neg` são aceitos pelo validador mas **filtrados no frontend antes do POST** — nunca chegam a ser gravados no banco. Existem apenas para que o aprendiz possa indicar explicitamente que não tem pontos positivos/negativos sem travar a validação.

---

### `mensagens_mural`

Mensagens anônimas do Mural da Comunidade. Qualquer aprendiz autenticado pode postar; nenhum autor é registrado.

| Coluna      | Tipo     | Restrições                      |
|-------------|----------|---------------------------------|
| `id`        | INTEGER  | PK, autoincrement               |
| `conteudo`  | TEXT     | NOT NULL — 5 a 500 caracteres   |
| `created_at`| DATETIME | default: `datetime.now(UTC)`    |

**Rate limiting de posts:**
O endpoint `POST /mural` limita cada aprendiz a **1 post a cada 2 minutos** (120 segundos) via dict em memória `_mural_rate: dict[int, datetime]` no backend. Se tentar antes do cooldown, retorna HTTP 429 com os segundos restantes. O controle é reiniciado quando o servidor é reiniciado.

---

### `artigos`

Conteúdo das Trilhas de Soft Skills.

| Coluna         | Tipo         | Restrições                                                                                         |
|----------------|--------------|----------------------------------------------------------------------------------------------------|
| `id`           | INTEGER      | PK, autoincrement                                                                                  |
| `titulo`       | VARCHAR(200) | NOT NULL                                                                                           |
| `resumo`       | VARCHAR(300) | NOT NULL — texto curto exibido no card                                                             |
| `conteudo`     | TEXT         | NOT NULL — corpo completo em **Markdown** (renderizado no frontend via `marked.js`)                |
| `categoria`    | VARCHAR(40)  | NOT NULL — `inteligencia_emocional \| comunicacao \| postura_profissional \| saude_mental`         |
| `tempo_leitura`| INTEGER      | nullable — estimativa em minutos                                                                   |
| `created_at`   | DATETIME     | default: `datetime.now(UTC)`                                                                       |

---

## Diagrama de relacionamentos

```
empresas (1) ──< aprendizes (N)
empresas (1) ──< respostas_enquete (N)
respostas_enquete (1) ──< respostas_problemas (N)
respostas_enquete (1) ──< respostas_avaliacao (N)

mensagens_mural    (sem FK — anônimo)
artigos            (sem FK — conteúdo estático)
gestores           (sem FK — usuários admin)
```

---

## Notas de design

### Star Schema no dashboard

O dashboard do gestor usa `respostas_enquete` como tabela de fatos e `empresas` como dimensão. Todas as agregações (média de satisfação, distribuição de efetivação, contagem de problemas) são feitas com `GROUP BY` em uma única query SQL — sem N+1.

### Filtro de ano — `_filtrar_ano`

O helper abaixo é usado em todos os endpoints de dashboard que aceitam `ano: Optional[int]`:

```python
def _filtrar_ano(query, ano: Optional[int]):
    if ano:
        query = query.filter(
            func.substr(RespostaEnquete.data_resposta, 1, 4) == str(ano)
        )
    return query
```

Usa `substr` em vez de `strftime('%Y', ...)` porque o SQLite falha ao parsear datetimes com microsegundos (`"2026-04-10 14:11:26.567424"`). `substr(..., 1, 4)` extrai sempre os primeiros 4 caracteres, independente do formato.

### Separação de múltiplos valores (normalização)

Os campos checkbox (`problemas`, `pontos_positivos`, `pontos_negativos`) são normalizados em tabelas separadas (`respostas_problemas`, `respostas_avaliacao`) em vez de serializar em JSON ou texto separado por vírgulas. Isso permite `GROUP BY problema` e `COUNT` direto no banco.

### Validação de enums no backend

Os valores aceitos para os checkboxes da enquete são definidos como conjuntos Python em `schemas.py` e verificados por `field_validator`:

```python
_PROBLEMAS_VALIDOS = {"assedio_moral", "favorecimento", ..., "nenhum"}
_POSITIVOS_VALIDOS = {"aprendizado", "clima_bom", "lideranca_apoio", "beneficios", "flexibilidade", "nenhum_pos"}
_NEGATIVOS_VALIDOS = {"comunicacao_ruim", "desorganizacao", "clima_tenso", "falta_reconhecimento", "distancia_lideranca", "nenhum_neg"}
```

Qualquer valor fora dessas listas retorna HTTP 422 com a lista dos itens inválidos.

> **Nota:** `nenhum_pos` e `nenhum_neg` são válidos no backend mas filtrados pelo frontend antes de enviar (ver `enquete.js`). O valor `nenhum` de problemas é aceito e gravado, mas **excluído dos rankings** (`/dashboard/problemas` e detalhe por empresa) via `WHERE problema != 'nenhum'`.

### Faixa etária vs. idade exata

`respostas_enquete` guarda `faixa_etaria` em vez da idade exata. As faixas são `"15-16"`, `"17-18"`, `"19-21"` e `"22"`, correspondendo ao intervalo de idade aceito no cadastro (15–22 anos). Isso reduz a granularidade e dificulta a reidentificação de respostas de grupos pequenos.

### bcrypt e bcrypt pinado

Senhas são armazenadas com bcrypt via `passlib`. A dependência `bcrypt==4.0.1` é fixada no `requirements.txt` para evitar incompatibilidades com a versão do `passlib` em uso.

### JWT — sub como string

O campo `sub` do JWT (RFC 7519) deve ser string. O backend converte `str(user.id)` ao criar o token e `int(payload["sub"])` ao decodificar, evitando erros de validação da biblioteca `python-jose`.

### SECRET_KEY via variável de ambiente

A chave usada para assinar os JWTs é lida de `os.environ.get("SECRET_KEY", "chave-local-somente-para-desenvolvimento")`. Em produção, defina a variável de ambiente `SECRET_KEY` com um valor forte gerado por `python -c "import secrets; print(secrets.token_hex(32))"`. O arquivo `backend/.env.example` documenta isso.
