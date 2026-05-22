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

        # cria ocorrência
        nova_ocorrencia = Ocorrencia(
            fornecedor_id=ocorrencia.fornecedor_id,
            tipo=ocorrencia.tipo,
            descricao=ocorrencia.descricao,
            impacto=ocorrencia.impacto
        )

        db.add(nova_ocorrencia)
        db.flush()

        # atualiza score e risco
        fornecedor.score -= ocorrencia.impacto

        if fornecedor.score < 0:
            fornecedor.score = 0

        fornecedor.risco = definir_risco(fornecedor.score)

        # salva estado atualizado
        db.commit()

        db.refresh(fornecedor)

        # busca ocorrências atualizadas
        todas_ocorrencias = db.query(Ocorrencia).filter(
            Ocorrencia.fornecedor_id == fornecedor.id
        ).all()

        texto_ocorrencias = ""

        for o in todas_ocorrencias:
            texto_ocorrencias += (
                f"- {o.tipo}: {o.descricao or ''} "
                f"(impacto {o.impacto})\n"
            )

        # prompt IA
        prompt = f"""
            Você é um sistema de análise de risco de fornecedores.

            REGRAS OBRIGATÓRIAS:
            - Não use markdown
            - Não use negrito
            - Não use tópicos
            - Não use listas
            - Não use títulos
            - Máximo 5 linhas
            - Texto corrido apenas
            - Linguagem corporativa objetiva

            Formato da resposta:
            Parecer: <texto único>

            Fornecedor:
            - Nome: {fornecedor.razao_social}
            - Score: {fornecedor.score}
            - Risco: {fornecedor.risco}

            Ocorrências:
            {texto_ocorrencias}
            """

        # gera IA
        parecer = gerar_parecer(prompt)

        # salva análise
        nova_analise = AnaliseIA(
            fornecedor_id=fornecedor.id,
            parecer=parecer
        )

        db.add(nova_analise)
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