"""
Dependências de autenticação/autorização para as rotas FastAPI.
"""

from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.usuario import Usuario
from app.services.security import decodificar_token


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_usuario_atual(
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db)
) -> Usuario:

    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token ausente"
        )

    token = authorization.split(" ", 1)[1]

    payload = decodificar_token(token)

    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido ou expirado"
        )

    usuario_id = payload.get("sub")

    usuario = db.query(Usuario).filter(
        Usuario.id == usuario_id
    ).first()

    if not usuario or not usuario.ativo:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário inválido ou inativo"
        )

    return usuario


def require_role(*roles: str):
    """Gera uma dependência que só permite os papéis informados."""

    def verificador(
        usuario: Usuario = Depends(get_usuario_atual)
    ) -> Usuario:

        if usuario.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Permissão insuficiente"
            )

        return usuario

    return verificador


def require_admin(
    usuario: Usuario = Depends(get_usuario_atual)
) -> Usuario:

    if usuario.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas administradores"
        )

    return usuario
