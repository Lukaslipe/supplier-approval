from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth.deps import get_db, require_admin
from app.models.usuario import ROLES, Usuario
from app.schemas.usuario_schema import (
    UsuarioCreate,
    UsuarioResponse,
    UsuarioUpdate,
)
from app.services.security import gerar_hash_senha

router = APIRouter(prefix="/usuarios", tags=["usuarios"])


@router.get("", response_model=list[UsuarioResponse])
def listar_usuarios(
    db: Session = Depends(get_db),
    _admin: Usuario = Depends(require_admin)
):
    return db.query(Usuario).order_by(Usuario.id.asc()).all()


@router.post(
    "",
    response_model=UsuarioResponse,
    status_code=status.HTTP_201_CREATED
)
def criar_usuario(
    dados: UsuarioCreate,
    db: Session = Depends(get_db),
    _admin: Usuario = Depends(require_admin)
):

    if dados.role not in ROLES:
        raise HTTPException(
            status_code=400,
            detail=f"Papel inválido. Use um de: {', '.join(ROLES)}"
        )

    existente = db.query(Usuario).filter(
        Usuario.email == dados.email
    ).first()

    if existente:
        raise HTTPException(
            status_code=409,
            detail="E-mail já cadastrado"
        )

    usuario = Usuario(
        nome=dados.nome,
        email=dados.email,
        senha_hash=gerar_hash_senha(dados.senha),
        role=dados.role,
        ativo=True
    )

    db.add(usuario)
    db.commit()
    db.refresh(usuario)

    return usuario


@router.put("/{usuario_id}", response_model=UsuarioResponse)
def atualizar_usuario(
    usuario_id: int,
    dados: UsuarioUpdate,
    db: Session = Depends(get_db),
    _admin: Usuario = Depends(require_admin)
):

    usuario = db.query(Usuario).filter(
        Usuario.id == usuario_id
    ).first()

    if not usuario:
        raise HTTPException(
            status_code=404,
            detail="Usuário não encontrado"
        )

    if dados.role is not None:
        if dados.role not in ROLES:
            raise HTTPException(
                status_code=400,
                detail=f"Papel inválido. Use um de: {', '.join(ROLES)}"
            )
        usuario.role = dados.role

    if dados.nome is not None:
        usuario.nome = dados.nome

    if dados.email is not None:
        conflito = db.query(Usuario).filter(
            Usuario.email == dados.email,
            Usuario.id != usuario_id
        ).first()
        if conflito:
            raise HTTPException(
                status_code=409,
                detail="E-mail já cadastrado"
            )
        usuario.email = dados.email

    if dados.senha:
        usuario.senha_hash = gerar_hash_senha(dados.senha)

    if dados.ativo is not None:
        usuario.ativo = dados.ativo

    db.commit()
    db.refresh(usuario)

    return usuario


@router.delete("/{usuario_id}")
def remover_usuario(
    usuario_id: int,
    db: Session = Depends(get_db),
    admin: Usuario = Depends(require_admin)
):

    usuario = db.query(Usuario).filter(
        Usuario.id == usuario_id
    ).first()

    if not usuario:
        raise HTTPException(
            status_code=404,
            detail="Usuário não encontrado"
        )

    if usuario.id == admin.id:
        raise HTTPException(
            status_code=400,
            detail="Você não pode remover o próprio usuário"
        )

    db.delete(usuario)
    db.commit()

    return {"message": "Usuário removido"}
