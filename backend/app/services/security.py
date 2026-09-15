"""
Segurança simples usando apenas a stdlib (sem dependências novas).

- Senha: PBKDF2-HMAC-SHA256 com salt aleatório por usuário.
- Token: JWT (HS256) assinado manualmente com hmac/hashlib.

Observação: a SECRET_KEY é lida de variável de ambiente; se ausente,
usa um valor padrão apenas para desenvolvimento.
"""

import base64
import hashlib
import hmac
import json
import os
import secrets
import time

SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-supplierguard-troque-em-producao")

# Validade do token em segundos (8 horas)
TOKEN_EXP_SEGUNDOS = 8 * 60 * 60

_PBKDF2_ITERACOES = 120_000


# =========================================================
# SENHAS
# =========================================================

def gerar_hash_senha(senha: str) -> str:
    salt = secrets.token_hex(16)
    dk = hashlib.pbkdf2_hmac(
        "sha256",
        senha.encode("utf-8"),
        salt.encode("utf-8"),
        _PBKDF2_ITERACOES
    )
    return f"{salt}${dk.hex()}"


def verificar_senha(senha: str, senha_hash: str) -> bool:
    try:
        salt, hash_esperado = senha_hash.split("$", 1)
    except ValueError:
        return False

    dk = hashlib.pbkdf2_hmac(
        "sha256",
        senha.encode("utf-8"),
        salt.encode("utf-8"),
        _PBKDF2_ITERACOES
    )
    return hmac.compare_digest(dk.hex(), hash_esperado)


# =========================================================
# JWT (HS256) — implementação mínima
# =========================================================

def _b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")


def _b64url_decode(data: str) -> bytes:
    padding = "=" * (-len(data) % 4)
    return base64.urlsafe_b64decode(data + padding)


def _assinar(mensagem: str) -> str:
    assinatura = hmac.new(
        SECRET_KEY.encode("utf-8"),
        mensagem.encode("utf-8"),
        hashlib.sha256
    ).digest()
    return _b64url_encode(assinatura)


def criar_token(payload: dict) -> str:
    header = {"alg": "HS256", "typ": "JWT"}

    corpo = dict(payload)
    corpo.setdefault("iat", int(time.time()))
    corpo.setdefault("exp", int(time.time()) + TOKEN_EXP_SEGUNDOS)

    header_b64 = _b64url_encode(json.dumps(header, separators=(",", ":")).encode("utf-8"))
    payload_b64 = _b64url_encode(json.dumps(corpo, separators=(",", ":")).encode("utf-8"))

    mensagem = f"{header_b64}.{payload_b64}"
    assinatura = _assinar(mensagem)

    return f"{mensagem}.{assinatura}"


def decodificar_token(token: str) -> dict | None:
    """Retorna o payload se o token for válido e não expirado, senão None."""
    try:
        header_b64, payload_b64, assinatura = token.split(".")
    except ValueError:
        return None

    mensagem = f"{header_b64}.{payload_b64}"

    if not hmac.compare_digest(_assinar(mensagem), assinatura):
        return None

    try:
        payload = json.loads(_b64url_decode(payload_b64))
    except (ValueError, json.JSONDecodeError):
        return None

    exp = payload.get("exp")
    if exp is not None and int(time.time()) > int(exp):
        return None

    return payload
