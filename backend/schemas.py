from datetime import datetime
from typing import Optional
from pydantic import BaseModel, field_validator


# ─── Empresa ──────────────────────────────────────────────────────────────────

class EmpresaOut(BaseModel):
    id: int
    nome: str

    model_config = {"from_attributes": True}


# ─── Auth: Aprendiz ───────────────────────────────────────────────────────────

class AprendizCreate(BaseModel):
    username: str
    senha: str
    idade: int
    genero: str
    empresa_id: int

    @field_validator("username")
    @classmethod
    def username_valido(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 3:
            raise ValueError("Nome de usuário deve ter ao menos 3 caracteres")
        return v

    @field_validator("senha")
    @classmethod
    def senha_valida(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError("Senha deve ter ao menos 6 caracteres")
        return v

    @field_validator("idade")
    @classmethod
    def idade_valida(cls, v: int) -> int:
        if not (15 <= v <= 22):
            raise ValueError("Idade deve estar entre 15 e 22 anos")
        return v

    @field_validator("genero")
    @classmethod
    def genero_valido(cls, v: str) -> str:
        opcoes = {"feminino", "masculino", "prefiro_nao_dizer"}
        if v not in opcoes:
            raise ValueError(f"Gênero inválido. Opções: {opcoes}")
        return v


class AprendizOut(BaseModel):
    id: int
    username: str
    idade: int
    genero: str
    faixa_etaria: Optional[str] = None
    empresa_id: int
    created_at: datetime
    last_enquete_at: Optional[datetime] = None
    is_admin: bool = False

    model_config = {"from_attributes": True}


# ─── Auth: Gestor ─────────────────────────────────────────────────────────────

class GestorLogin(BaseModel):
    username: str
    senha: str


# ─── Token JWT ────────────────────────────────────────────────────────────────

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ─── Atualização de perfil ────────────────────────────────────────────────────

class AprendizPerfilUpdate(BaseModel):
    novo_username: Optional[str] = None
    senha_atual: str
    nova_senha: Optional[str] = None

    @field_validator("novo_username")
    @classmethod
    def username_valido(cls, v):
        if v is not None:
            v = v.strip()
            if len(v) < 3:
                raise ValueError("Nome de usuário deve ter ao menos 3 caracteres")
        return v

    @field_validator("nova_senha")
    @classmethod
    def senha_valida(cls, v):
        if v is not None and len(v) < 6:
            raise ValueError("Nova senha deve ter ao menos 6 caracteres")
        return v


class GestorPerfilUpdate(BaseModel):
    nome: Optional[str] = None
    senha_atual: str
    nova_senha: Optional[str] = None

    @field_validator("nova_senha")
    @classmethod
    def senha_valida(cls, v):
        if v is not None and len(v) < 6:
            raise ValueError("Nova senha deve ter ao menos 6 caracteres")
        return v


# ─── Enquete ──────────────────────────────────────────────────────────────────

_PROBLEMAS_VALIDOS = {
    "assedio_moral", "favorecimento", "machismo", "assedio_sexual",
    "desvio_funcao", "carga_excessiva", "falta_orientacao", "sobrecarga",
    "preconceito_etario", "discriminacao_racial", "homofobia",
    "intolerancia_religiosa", "atraso_pagamento", "falta_feedback",
    "pressao_psicologica", "condicoes_inseguras", "exclusao_equipe",
    "desvalorizacao_ideias", "microgerenciamento", "tarefas_repetitivas",
    "ameacas_demissao", "falta_estrutura", "desrespeito_direitos",
    "ausencia_intervalo", "proibicao_cursos", "nenhum",
}

_POSITIVOS_VALIDOS = {
    "aprendizado", "clima_bom", "lideranca_apoio", "beneficios", "flexibilidade",
    "nenhum_pos",
}

_NEGATIVOS_VALIDOS = {
    "comunicacao_ruim", "desorganizacao", "clima_tenso",
    "falta_reconhecimento", "distancia_lideranca",
    "nenhum_neg",
}


class RespostaEnqueteCreate(BaseModel):
    # Pergunta 1 — problemas (lista de valores do checkbox)
    problemas: list[str] = []
    # Pergunta 2 — avaliação da empresa
    pontos_positivos: list[str] = []
    pontos_negativos: list[str] = []
    # Pergunta 3 — efetivação
    desejo_efetivacao: str
    # Pergunta 4 — satisfação 1–5
    nota_satisfacao: int

    @field_validator("problemas")
    @classmethod
    def problemas_validos(cls, v: list[str]) -> list[str]:
        invalidos = [x for x in v if x not in _PROBLEMAS_VALIDOS]
        if invalidos:
            raise ValueError(f"Problemas inválidos: {invalidos}")
        return v

    @field_validator("pontos_positivos")
    @classmethod
    def positivos_validos(cls, v: list[str]) -> list[str]:
        invalidos = [x for x in v if x not in _POSITIVOS_VALIDOS]
        if invalidos:
            raise ValueError(f"Pontos positivos inválidos: {invalidos}")
        return v

    @field_validator("pontos_negativos")
    @classmethod
    def negativos_validos(cls, v: list[str]) -> list[str]:
        invalidos = [x for x in v if x not in _NEGATIVOS_VALIDOS]
        if invalidos:
            raise ValueError(f"Pontos negativos inválidos: {invalidos}")
        return v

    @field_validator("desejo_efetivacao")
    @classmethod
    def efetivacao_valida(cls, v: str) -> str:
        if v not in {"sim", "nao", "talvez"}:
            raise ValueError("Valor inválido. Use: sim, nao ou talvez")
        return v

    @field_validator("nota_satisfacao")
    @classmethod
    def nota_valida(cls, v: int) -> int:
        if not (1 <= v <= 5):
            raise ValueError("Nota de satisfação deve ser entre 1 e 5")
        return v


# ─── Dashboard ────────────────────────────────────────────────────────────────

class AvaliacaoContagem(BaseModel):
    valor: str
    total: int


class DashboardResumo(BaseModel):
    total_respostas: int
    media_satisfacao: float
    perc_quer_efetivacao: float
    top_positivos: list[AvaliacaoContagem] = []
    top_negativos: list[AvaliacaoContagem] = []


class ProblemaContagem(BaseModel):
    problema: str
    total: int


class SatisfacaoEmpresa(BaseModel):
    empresa_id: int
    empresa: str
    media_satisfacao: float
    total_respostas: int


# ─── Mural ────────────────────────────────────────────────────────────────────

class MensagemCreate(BaseModel):
    conteudo: str

    @field_validator("conteudo")
    @classmethod
    def conteudo_valido(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 5:
            raise ValueError("Mensagem muito curta")
        if len(v) > 500:
            raise ValueError("Mensagem deve ter no máximo 500 caracteres")
        return v


class MensagemOut(BaseModel):
    id: int
    conteudo: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ─── Artigos ──────────────────────────────────────────────────────────────────

_CATEGORIAS_VALIDAS = {
    "inteligencia_emocional", "comunicacao", "postura_profissional", "saude_mental"
}


class ArtigoCreate(BaseModel):
    titulo: str
    resumo: str
    conteudo: str
    categoria: str
    tempo_leitura: Optional[int] = None

    @field_validator("titulo")
    @classmethod
    def titulo_valido(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 3:
            raise ValueError("Título deve ter ao menos 3 caracteres")
        if len(v) > 200:
            raise ValueError("Título deve ter no máximo 200 caracteres")
        return v

    @field_validator("resumo")
    @classmethod
    def resumo_valido(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 10:
            raise ValueError("Resumo deve ter ao menos 10 caracteres")
        if len(v) > 300:
            raise ValueError("Resumo deve ter no máximo 300 caracteres")
        return v

    @field_validator("conteudo")
    @classmethod
    def conteudo_valido(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 20:
            raise ValueError("Conteúdo deve ter ao menos 20 caracteres")
        return v

    @field_validator("categoria")
    @classmethod
    def categoria_valida(cls, v: str) -> str:
        if v not in _CATEGORIAS_VALIDAS:
            raise ValueError(f"Categoria inválida. Opções: {_CATEGORIAS_VALIDAS}")
        return v


class ArtigoUpdate(BaseModel):
    titulo: Optional[str] = None
    resumo: Optional[str] = None
    conteudo: Optional[str] = None
    categoria: Optional[str] = None
    tempo_leitura: Optional[int] = None

    @field_validator("titulo")
    @classmethod
    def titulo_valido(cls, v):
        if v is not None:
            v = v.strip()
            if len(v) < 3:
                raise ValueError("Título deve ter ao menos 3 caracteres")
        return v

    @field_validator("categoria")
    @classmethod
    def categoria_valida(cls, v):
        if v is not None and v not in _CATEGORIAS_VALIDAS:
            raise ValueError(f"Categoria inválida. Opções: {_CATEGORIAS_VALIDAS}")
        return v


class ArtigoOut(BaseModel):
    id: int
    titulo: str
    resumo: str
    conteudo: str
    categoria: str
    tempo_leitura: Optional[int]
    created_at: datetime

    model_config = {"from_attributes": True}
