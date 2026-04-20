import os
from datetime import datetime, timedelta, timezone
from typing import Optional
from dotenv import load_dotenv
from jose import JWTError, jwt
from passlib.context import CryptContext

load_dotenv()

# ─── Configuração ─────────────────────────────────────────────────────────────
# Em produção, defina a variável de ambiente SECRET_KEY com um valor forte.
# Gere uma com: python -c "import secrets; print(secrets.token_hex(32))"
SECRET_KEY = os.environ.get("SECRET_KEY", "chave-local-somente-para-desenvolvimento")
ALGORITHM = "HS256"
EXPIRACAO_HORAS = 8

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ─── Senha ────────────────────────────────────────────────────────────────────

def hash_senha(senha: str) -> str:
    return pwd_context.hash(senha)


def verificar_senha(senha_plana: str, senha_hash: str) -> bool:
    return pwd_context.verify(senha_plana, senha_hash)


# ─── JWT ──────────────────────────────────────────────────────────────────────

def criar_token(dados: dict) -> str:
    payload = dados.copy()
    expira = datetime.now(timezone.utc) + timedelta(hours=EXPIRACAO_HORAS)
    payload.update({"exp": expira})
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def verificar_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None
