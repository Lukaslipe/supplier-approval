import re

from fastapi import APIRouter, HTTPException, status

from app.models.ocorrencia import Ocorrencia
from app.services.receita_ws import consultar_cnpj
from app.services.homologacao_service import criar_homologacao
from app.database import SessionLocal
from app.models.fornecedor import Fornecedor
from app.models.homologacao import HomologacaoFornecedor
from app.models.aprovacao import AprovacaoFornecedor

from app.services.score_service import (
    gerar_score,
    definir_risco
)

from app.schemas.fornecedor_schema import FornecedorSchema

router = APIRouter()


def limpar_cnpj(cnpj: str):
    return re.sub(r"\D", "", cnpj)


@router.get("/consulta-cnpj/{cnpj}")
def consultar_fornecedor(cnpj: str):

    cnpj_limpo = limpar_cnpj(cnpj)

    fornecedor_existente = None

    db = SessionLocal()

    try:

        fornecedor_existente = db.query(Fornecedor).filter(
            Fornecedor.cnpj == cnpj_limpo
        ).first()

    finally:
        db.close()

    if fornecedor_existente:

        return {
            "ja_cadastrado": True,
            "fornecedor": {
                "id": fornecedor_existente.id,
                "cnpj": fornecedor_existente.cnpj,
                "razao_social": fornecedor_existente.razao_social,
                "score": fornecedor_existente.score,
                "risco": fornecedor_existente.risco
            }
        }

    dados = consultar_cnpj(cnpj_limpo)

    if not dados:
        raise HTTPException(
            status_code=400,
            detail="Erro ao consultar CNPJ"
        )

    score = gerar_score(dados)

    return {
        "ja_cadastrado": False,
        "fornecedor": {
            "cnpj": cnpj_limpo,
            "razao_social": dados.get("nome"),
            "nome_fantasia": dados.get("fantasia"),
            "situacao": dados.get("situacao"),
            "porte": dados.get("porte"),
            "capital_social": dados.get("capital_social"),
            "abertura": dados.get("abertura"),
            "telefone": dados.get("telefone"),
            "email": dados.get("email"),
            "cidade": dados.get("municipio"),
            "uf": dados.get("uf"),
            "cnae": dados.get("atividade_principal", [{}])[0].get("text"),
            "score": score,
            "risco": definir_risco(score)
        }
    }


@router.post(
    "/fornecedores",
    status_code=status.HTTP_201_CREATED
)
def cadastrar_fornecedor(payload: dict):

    db = SessionLocal()

    try:

        cnpj_limpo = limpar_cnpj(payload.get("cnpj")) # type: ignore

        fornecedor_existente = db.query(Fornecedor).filter(
            Fornecedor.cnpj == cnpj_limpo
        ).first()

        if fornecedor_existente:
            raise HTTPException(
                status_code=409,
                detail="Fornecedor já cadastrado"
            )

        novo_fornecedor = Fornecedor(
            cnpj=cnpj_limpo,
            razao_social=payload.get("razao_social"),
            nome_fantasia=payload.get("nome_fantasia"),
            situacao=payload.get("situacao"),
            porte=payload.get("porte"),
            capital_social=payload.get("capital_social"),
            abertura=payload.get("abertura"),
            telefone=payload.get("telefone"),
            email=payload.get("email"),
            cidade=payload.get("cidade"),
            uf=payload.get("uf"),
            cnae=payload.get("cnae"),
            score=payload.get("score"),
            score_base=payload.get("score"),
            risco=payload.get("risco")
        )

        db.add(novo_fornecedor)

        db.flush()

        criar_homologacao(
            novo_fornecedor,
            db
        )

        db.commit()

        db.refresh(novo_fornecedor)

        return {
            "message": "Fornecedor cadastrado com sucesso",
            "fornecedor": novo_fornecedor
        }

    finally:
        db.close()


@router.get(
    "/fornecedores",
    response_model=list[FornecedorSchema]
)
def listar_fornecedores():

    db = SessionLocal()

    try:

        fornecedores = db.query(Fornecedor).all()

        return fornecedores

    finally:
        db.close()


@router.get(
    "/fornecedores/{id}",
    response_model=FornecedorSchema
)
def buscar_fornecedor(id: int):

    db = SessionLocal()

    try:

        fornecedor = db.query(Fornecedor).filter(
            Fornecedor.id == id
        ).first()

        if not fornecedor:
            raise HTTPException(
                status_code=404,
                detail="Fornecedor não encontrado"
            )

        return fornecedor

    finally:
        db.close()

@router.get("/fornecedores/{fornecedor_id}/historico-score")
def historico_score(fornecedor_id: int):

    db = SessionLocal()

    try:

        fornecedor = db.query(Fornecedor).filter(
            Fornecedor.id == fornecedor_id
        ).first()

        if not fornecedor:
            raise HTTPException(
                status_code=404,
                detail="Fornecedor não encontrado"
            )

        ocorrencias = db.query(Ocorrencia).filter(
            Ocorrencia.fornecedor_id == fornecedor_id
        ).order_by(Ocorrencia.id.asc()).all()

        historico = []

        if ocorrencias:

            historico.append({
                "label": "Score inicial",
                "score": ocorrencias[0].score_antes
            })

            for ocorrencia in ocorrencias:

                historico.append({
                    "label": ocorrencia.tipo,
                    "score": ocorrencia.score_depois,
                    "impacto": ocorrencia.impacto
                })

        else:

            historico.append({
                "label": "Score inicial",
                "score": fornecedor.score
            })

        return historico

    finally:
        db.close()

@router.get("/fornecedores/{fornecedor_id}/homologacao")
def buscar_homologacao(fornecedor_id: int):

    db = SessionLocal()

    try:

        homologacao = db.query(HomologacaoFornecedor).filter(
            HomologacaoFornecedor.fornecedor_id == fornecedor_id
        ).first()

        if not homologacao:
            raise HTTPException(
                status_code=404,
                detail="Homologação não encontrada"
            )

        fornecedor = db.query(Fornecedor).filter(
            Fornecedor.id == fornecedor_id
        ).first()

        if not fornecedor:
            raise HTTPException(
                status_code=404,
                detail="Fornecedor não encontrado"
            )

        aprovacoes = db.query(AprovacaoFornecedor).filter(
            AprovacaoFornecedor.fornecedor_id == fornecedor_id
        ).all()

        return {
            "id": homologacao.id,
            "fornecedor_id": homologacao.fornecedor_id,

            "razao_social": fornecedor.razao_social,
            "cnpj": fornecedor.cnpj,
            "risco": fornecedor.risco,
            "score": fornecedor.score,

            "status": homologacao.status,
            "tipo": homologacao.tipo,

            "visita_realizada": homologacao.visita_realizada,
            "documentos_ok": homologacao.documentos_ok,

            "aprovacoes": [
                {
                    "id": aprovacao.id,
                    "setor": aprovacao.setor,
                    "status": aprovacao.status,
                    "observacao": aprovacao.observacao,
                    "atualizado_em": aprovacao.atualizado_em
                }
                for aprovacao in aprovacoes
            ]
        }

    finally:
        db.close()

@router.post("/fornecedores/{fornecedor_id}/aprovacao")
def atualizar_aprovacao(
    fornecedor_id: int,
    payload: dict
):

    db = SessionLocal()

    try:

        setor = payload.get("setor")
        status_aprovacao = payload.get("status")
        observacao = payload.get("observacao")

        if setor not in ["RH", "Jurídico", "Compras"]:
            raise HTTPException(
                status_code=400,
                detail="Setor inválido"
            )

        if status_aprovacao not in ["Aprovado", "Reprovado"]:
            raise HTTPException(
                status_code=400,
                detail="Status inválido"
            )

        # Motivo obrigatório para reprovação
        if status_aprovacao == "Reprovado" and not observacao:
            raise HTTPException(
                status_code=400,
                detail="O motivo da reprovação é obrigatório"
            )

        aprovacao = db.query(AprovacaoFornecedor).filter(
            AprovacaoFornecedor.fornecedor_id == fornecedor_id,
            AprovacaoFornecedor.setor == setor
        ).first()

        if not aprovacao:
            raise HTTPException(
                status_code=404,
                detail="Aprovação não encontrada"
            )

        aprovacao.status = status_aprovacao
        aprovacao.observacao = observacao

        homologacao = db.query(HomologacaoFornecedor).filter(
            HomologacaoFornecedor.fornecedor_id == fornecedor_id
        ).first()

        if not homologacao:
            raise HTTPException(
                status_code=404,
                detail="Homologação não encontrada"
            )

        aprovacoes = db.query(AprovacaoFornecedor).filter(
            AprovacaoFornecedor.fornecedor_id == fornecedor_id
        ).all()

        # Qualquer reprovação reprova a homologação
        if any(a.status == "Reprovado" for a in aprovacoes):

            homologacao.status = "Reprovado"

        # Ainda existem aprovações pendentes
        elif not all(a.status == "Aprovado" for a in aprovacoes):

            homologacao.status = "Pendente"

        # Risco alto/especial precisa também de visita e documentos
        elif homologacao.tipo == "Especial":

            if (
                homologacao.visita_realizada
                and homologacao.documentos_ok
            ):
                homologacao.status = "Aprovado"
            else:
                homologacao.status = "Pendente"

        # Risco médio
        else:

            homologacao.status = "Aprovado"

        db.commit()

        return {
            "message": "Aprovação atualizada",
            "status": homologacao.status
        }

    finally:
        db.close()

@router.get("/homologacoes")
def listar_homologacoes():

    db = SessionLocal()

    try:

        homologacoes = (
            db.query(HomologacaoFornecedor)
            .join(
                Fornecedor,
                Fornecedor.id == HomologacaoFornecedor.fornecedor_id
            )
            .all()
        )

        resultado = []

        for homologacao in homologacoes:

            fornecedor = db.query(Fornecedor).filter(
                Fornecedor.id == homologacao.fornecedor_id
            ).first()

            aprovacoes = db.query(AprovacaoFornecedor).filter(
                AprovacaoFornecedor.fornecedor_id == homologacao.fornecedor_id
            ).all()

            resultado.append({
                "id": homologacao.id,
                "fornecedor_id": homologacao.fornecedor_id,

                "razao_social": fornecedor.razao_social,
                "cnpj": fornecedor.cnpj,
                "risco": fornecedor.risco,
                "score": fornecedor.score,

                "status": homologacao.status,
                "tipo": homologacao.tipo,

                "visita_realizada": homologacao.visita_realizada,
                "documentos_ok": homologacao.documentos_ok,

                "aprovacoes": [
                    {
                        "setor": aprovacao.setor,
                        "status": aprovacao.status
                    }
                    for aprovacao in aprovacoes
                ]
            })

        return resultado

    finally:
        db.close()

@router.put("/fornecedores/{fornecedor_id}/homologacao")
def atualizar_homologacao(
    fornecedor_id: int,
    payload: dict
):

    db = SessionLocal()

    try:

        homologacao = db.query(HomologacaoFornecedor).filter(
            HomologacaoFornecedor.fornecedor_id == fornecedor_id
        ).first()

        if not homologacao:
            raise HTTPException(
                status_code=404,
                detail="Homologação não encontrada"
            )

        if "visita_realizada" in payload:
            homologacao.visita_realizada = payload["visita_realizada"]

        if "documentos_ok" in payload:
            homologacao.documentos_ok = payload["documentos_ok"]

        aprovacoes = db.query(AprovacaoFornecedor).filter(
            AprovacaoFornecedor.fornecedor_id == fornecedor_id
        ).all()

        if any(a.status == "Reprovado" for a in aprovacoes):

            homologacao.status = "Reprovado"

        elif homologacao.tipo == "Especial":

            if (
                homologacao.visita_realizada
                and homologacao.documentos_ok
            ):
                homologacao.status = "Aprovado"

        db.commit()

        return {
            "message": "Homologação atualizada",
            "status": homologacao.status
        }

    finally:
        db.close()