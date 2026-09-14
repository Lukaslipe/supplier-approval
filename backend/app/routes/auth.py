from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth.deps import get_db, get_usuario_atual
from app.models.usuario import Usuario
from app.schemas.usuario_schema import (
    LoginRequest,
    LoginResponse,
    UsuarioResponse,
)
from app.services.security import criar_token, verificar_senha

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=LoginResponse)
def login(dados: LoginRequest, db: Session = Depends(get_db)):

    usuario = db.query(Usuario).filter(
        Usuario.email == dados.email
    ).first()

    if not usuario or not verificar_senha(dados.senha, usuario.senha_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail ou senha inválidos"
        )

    if not usuario.ativo:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuário inativo"
        )

    token = criar_token({
        "sub": usuario.id,
        "role": usuario.role,
        "nome": usuario.nome
    })

    return {
        "token": token,
        "usuario": usuario
    }


@router.get("/me", response_model=UsuarioResponse)
def me(usuario: Usuario = Depends(get_usuario_atual)):
    return usuario
