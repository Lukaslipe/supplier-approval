from datetime import datetime

from fastapi import APIRouter, HTTPException
from app.database import SessionLocal
from app.models.aprovacao import AprovacaoFornecedor

router = APIRouter()


@router.get("/fornecedores/{fornecedor_id}/aprovacoes")
def listar_aprovacoes(fornecedor_id: int):

    db = SessionLocal()

    try:

        aprovacoes = db.query(AprovacaoFornecedor).filter(
            AprovacaoFornecedor.fornecedor_id == fornecedor_id
        ).all()

        return aprovacoes

    finally:
        db.close()


@router.post("/fornecedores/{fornecedor_id}/aprovacao")
def salvar_aprovacao(fornecedor_id: int, payload: dict):

    db = SessionLocal()

    try:

        setor = payload.get("setor")
        status = payload.get("status")

        if not setor or not status:
            raise HTTPException(
                status_code=400,
                detail="setor e status são obrigatórios"
            )

        aprovacao = db.query(AprovacaoFornecedor).filter(
            AprovacaoFornecedor.fornecedor_id == fornecedor_id,
            AprovacaoFornecedor.setor == setor
        ).first()

        if aprovacao:

            aprovacao.status = status
            aprovacao.atualizado_em = datetime.utcnow() # type: ignore

        else:

            aprovacao = AprovacaoFornecedor(
                fornecedor_id=fornecedor_id,
                setor=setor,
                status=status
            )

            db.add(aprovacao)

        db.commit()

        return {
            "message": "Aprovação salva com sucesso"
        }

    finally:
        db.close()