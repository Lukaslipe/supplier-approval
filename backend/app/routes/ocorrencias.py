# pyright: reportAttributeAccessIssue=false
# pyright: reportGeneralTypeIssues=false

from fastapi import APIRouter, HTTPException

from app.database import SessionLocal

from app.models import fornecedor
from app.models.ocorrencia import Ocorrencia
from app.models.fornecedor import Fornecedor
from app.services.ai_service import gerar_parecer
from app.models.analise_ia import AnaliseIA

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

    try:

        fornecedor = db.query(Fornecedor).filter(
            Fornecedor.id == ocorrencia.fornecedor_id
        ).first()

        if not fornecedor:
            raise HTTPException(
                status_code=404,
                detail="Fornecedor não encontrado"
            )

        if ocorrencia.impacto < 0 or ocorrencia.impacto > 100:
            raise HTTPException(
                status_code=400,
                detail="Impacto deve estar entre 0 e 100"
            )

        score_antes = fornecedor.score

        novo_score = fornecedor.score - ocorrencia.impacto

        if novo_score < 0:
            novo_score = 0

        nova_ocorrencia = Ocorrencia(
            fornecedor_id=ocorrencia.fornecedor_id,
            tipo=ocorrencia.tipo,
            descricao=ocorrencia.descricao,
            impacto=ocorrencia.impacto,
            score_antes=score_antes,
            score_depois=novo_score
        )

        db.add(nova_ocorrencia)

        fornecedor.score = novo_score
        fornecedor.risco = definir_risco(novo_score)

        db.commit()

        db.refresh(nova_ocorrencia)

        return nova_ocorrencia

    finally:
        db.close()

@router.get(
    "/fornecedores/{fornecedor_id}/ocorrencias",
    response_model=list[OcorrenciaResponse]
)
def listar_ocorrencias(fornecedor_id: int):

    db = SessionLocal()

    try:

        ocorrencias = db.query(Ocorrencia).filter(
            Ocorrencia.fornecedor_id == fornecedor_id
        ).order_by(Ocorrencia.id.desc()).all()

        return ocorrencias

    finally:
        db.close()