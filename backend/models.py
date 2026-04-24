from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from core.database import Base


def _now() -> datetime:
    return datetime.now(timezone.utc)


class Empresa(Base):
    __tablename__ = "empresas"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    nome: Mapped[str] = mapped_column(String(150), unique=True, nullable=False)

    aprendizes: Mapped[list["Aprendiz"]] = relationship(back_populates="empresa")
    respostas: Mapped[list["RespostaEnquete"]] = relationship(back_populates="empresa")


class Aprendiz(Base):
    __tablename__ = "aprendizes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(80), unique=True, nullable=False)
    senha_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    idade: Mapped[int] = mapped_column(Integer, nullable=False)
    # feminino | masculino | prefiro_nao_dizer
    genero: Mapped[str] = mapped_column(String(30), nullable=False)
    empresa_id: Mapped[int] = mapped_column(ForeignKey("empresas.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now)
    last_enquete_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    last_mural_post_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False, server_default="0")

    empresa: Mapped["Empresa"] = relationship(back_populates="aprendizes")


class Gestor(Base):
    __tablename__ = "gestores"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(150), unique=True, nullable=False)
    senha_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    nome: Mapped[str] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now)


class RespostaEnquete(Base):
    """
    Armazena respostas de clima de forma ANÔNIMA.
    Nunca guarda o ID do aprendiz — apenas dados demográficos
    copiados no momento do envio (conformidade LGPD).
    """
    __tablename__ = "respostas_enquete"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    # Dados demográficos copiados (sem vínculo com a tabela de usuários)
    empresa_id: Mapped[int] = mapped_column(ForeignKey("empresas.id"), nullable=False)
    genero: Mapped[str] = mapped_column(String(30), nullable=False)
    # Faixa etária em vez de idade exata — maior privacidade
    faixa_etaria: Mapped[str] = mapped_column(String(10), nullable=False)  # ex: "17-18"

    # Respostas da enquete
    desejo_efetivacao: Mapped[str] = mapped_column(String(10), nullable=False)  # sim | nao | talvez
    nota_satisfacao: Mapped[int] = mapped_column(Integer, nullable=False)  # 1 a 5

    data_resposta: Mapped[datetime] = mapped_column(DateTime, default=_now)

    empresa: Mapped["Empresa"] = relationship(back_populates="respostas")
    problemas: Mapped[list["RespostaProblema"]] = relationship(back_populates="resposta", cascade="all, delete")
    avaliacoes: Mapped[list["RespostaAvaliacao"]] = relationship(back_populates="resposta", cascade="all, delete")


class RespostaProblema(Base):
    """Checkbox da Pergunta 1 — problemas enfrentados na empresa."""
    __tablename__ = "respostas_problemas"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    resposta_id: Mapped[int] = mapped_column(ForeignKey("respostas_enquete.id"), nullable=False)
    problema: Mapped[str] = mapped_column(String(80), nullable=False)

    resposta: Mapped["RespostaEnquete"] = relationship(back_populates="problemas")


class RespostaAvaliacao(Base):
    """Checkboxes da Pergunta 2 — pontos positivos e negativos da empresa."""
    __tablename__ = "respostas_avaliacao"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    resposta_id: Mapped[int] = mapped_column(ForeignKey("respostas_enquete.id"), nullable=False)
    tipo: Mapped[str] = mapped_column(String(10), nullable=False)  # positivo | negativo
    valor: Mapped[str] = mapped_column(String(80), nullable=False)

    resposta: Mapped["RespostaEnquete"] = relationship(back_populates="avaliacoes")


class MensagemMural(Base):
    """Mensagens anônimas do Mural da Comunidade."""
    __tablename__ = "mensagens_mural"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    conteudo: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now)


class Artigo(Base):
    """Conteúdo das Trilhas de Soft Skills."""
    __tablename__ = "artigos"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    titulo: Mapped[str] = mapped_column(String(200), nullable=False)
    resumo: Mapped[str] = mapped_column(String(300), nullable=False)
    conteudo: Mapped[str] = mapped_column(Text, nullable=False)
    # inteligencia_emocional | comunicacao | postura_profissional | saude_mental
    categoria: Mapped[str] = mapped_column(String(40), nullable=False)
    tempo_leitura: Mapped[int] = mapped_column(Integer, nullable=True)  # em minutos
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now)
