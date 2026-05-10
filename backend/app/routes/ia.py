from fastapi import APIRouter

from app.database import SessionLocal

from app.models.fornecedor import Fornecedor
from app.models.ocorrencia import Ocorrencia
from app.models.analise_ia import AnaliseIA
from app.schemas.analise_ia_schema import AnaliseIAResponse

from app.services.ai_service import gerar_parecer

router = APIRouter()

@router.post("/fornecedores/{id}/analise-ia")
def analisar_fornecedor(id: int):

    db = SessionLocal()

    try:

        fornecedor = db.query(Fornecedor).filter(
            Fornecedor.id == id
        ).first()

        if not fornecedor:
            return {"erro": "Fornecedor não encontrado"}

        ocorrencias = db.query(Ocorrencia).filter(
            Ocorrencia.fornecedor_id == id
        ).all()

        texto_ocorrencias = ""

        for ocorrencia in ocorrencias:
            texto_ocorrencias += f"- {ocorrencia.tipo}\n"

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
            - Razão social: {fornecedor.razao_social}
            - Situação: {fornecedor.situacao}
            - Score: {fornecedor.score}
            - Risco: {fornecedor.risco}

            Ocorrências:
            {texto_ocorrencias}
        """

        parecer = gerar_parecer(prompt)

        if not parecer:
            return {"erro": "IA não retornou parecer"}

        nova_analise = AnaliseIA(
            fornecedor_id=id,
            parecer=parecer
        )

        db.add(nova_analise)

        db.commit()

        return {
            "fornecedor": fornecedor.razao_social,
            "parecer": parecer
        }
    finally:
        db.close()

@router.get(
    "/fornecedores/{id}/analises-ia",
    response_model=list[AnaliseIAResponse]
)
def listar_analises(id: int):

    db = SessionLocal()

    try:

        analises = db.query(AnaliseIA).filter(
            AnaliseIA.fornecedor_id == id
        ).order_by(AnaliseIA.id.desc()).all()

        return analises

    finally:
        db.close()