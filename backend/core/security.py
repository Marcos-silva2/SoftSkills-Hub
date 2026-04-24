"""Autenticação e autorização: hash de senhas e tokens JWT."""

import os
from datetime import datetime, timedelta, timezone
from typing import Optional

from dotenv import load_dotenv
from jose import JWTError, jwt
from passlib.context import CryptContext

load_dotenv()

# Em produção, defina SECRET_KEY via variável de ambiente com valor forte.
# Gere uma com: python -c "import secrets; print(secrets.token_hex(32))"
SECRET_KEY = os.environ.get("SECRET_KEY", "chave-local-somente-para-desenvolvimento")
ALGORITHM = "HS256"
EXPIRACAO_HORAS = 8

_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ─── Senha ────────────────────────────────────────────────────────────────────

def hash_senha(senha: str) -> str:
    """Retorna o hash bcrypt da senha fornecida."""
    return _pwd_context.hash(senha)


def verificar_senha(senha_plana: str, senha_hash: str) -> bool:
    """Verifica se a senha em texto plano corresponde ao hash armazenado."""
    return _pwd_context.verify(senha_plana, senha_hash)


# ─── JWT ──────────────────────────────────────────────────────────────────────

def criar_token(dados: dict) -> str:
    """Cria um JWT HS256 com expiração de EXPIRACAO_HORAS horas."""
    payload = dados.copy()
    expira = datetime.now(timezone.utc) + timedelta(hours=EXPIRACAO_HORAS)
    payload.update({"exp": expira})
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def verificar_token(token: str) -> Optional[dict]:
    """Decodifica e valida o JWT. Retorna o payload ou None se inválido."""
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None
