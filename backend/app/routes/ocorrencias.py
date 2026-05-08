from fastapi import APIRouter

from app.database import SessionLocal

from app.models.ocorrencia import Ocorrencia
from app.models.fornecedor import Fornecedor

from app.schemas.ocorrencia_schema import (
    OcorrenciaCreate,
    OcorrenciaResponse
)

from app.services.score_service import definir_risco

router = APIRouter()

@router.post(
    "/ocorrencias",
    response_model=OcorrenciaResponse
)
def criar_ocorrencia(ocorrencia: OcorrenciaCreate):

    db = SessionLocal()

    fornecedor = db.query(Fornecedor).filter(
        Fornecedor.id == ocorrencia.fornecedor_id
    ).first()

    if not fornecedor:
        return {"erro": "Fornecedor não encontrado"}

    nova_ocorrencia = Ocorrencia(
        fornecedor_id=ocorrencia.fornecedor_id,
        tipo=ocorrencia.tipo,
        descricao=ocorrencia.descricao,
        impacto=ocorrencia.impacto
    )

    fornecedor.score -= ocorrencia.impacto

    if fornecedor.score < 0:
        fornecedor.score = 0

    fornecedor.risco = definir_risco(fornecedor.score)

    db.add(nova_ocorrencia)

    db.commit()
    db.refresh(nova_ocorrencia)

    return nova_ocorrencia