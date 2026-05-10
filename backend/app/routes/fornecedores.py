from fastapi import APIRouter
from app.services.receita_ws import consultar_cnpj

from app.database import SessionLocal
from app.models.fornecedor import Fornecedor
from app.services.score_service import gerar_score, definir_risco
from app.schemas.fornecedor_schema import FornecedorSchema

router = APIRouter()

@router.get("/consulta-cnpj/{cnpj}")
def buscar_cnpj(cnpj: str):

    db = SessionLocal() 

    try: 

        fornecedor_existente = db.query(Fornecedor).filter(
            Fornecedor.cnpj == cnpj
        ).first()

        if fornecedor_existente:
            return {
                "message": "Fornecedor já cadastrado",
                "fornecedor": fornecedor_existente
            }

        dados = consultar_cnpj(cnpj)

        if not dados:
            return {"erro": "Erro ao consultar CNPJ"}

        score = gerar_score(dados)

        novo_fornecedor = Fornecedor(
            cnpj=dados.get("cnpj"),
            razao_social=dados.get("nome"),
            nome_fantasia=dados.get("fantasia"),
            situacao=dados.get("situacao"),
            porte=dados.get("porte"),
            capital_social=dados.get("capital_social"),
            abertura=dados.get("abertura"),
            telefone=dados.get("telefone"),
            email=dados.get("email"),
            cidade=dados.get("municipio"),
            uf=dados.get("uf"),
            cnae=dados.get("atividade_principal", [{}])[0].get("text"),
            score=score,
            risco=definir_risco(score)
        )

        db.add(novo_fornecedor)
        db.commit()
        db.refresh(novo_fornecedor)

        return {
            "message": "Fornecedor cadastrado com sucesso",
            "fornecedor": novo_fornecedor
        }
    finally:
        db.close()

@router.get("/fornecedores", response_model=list[FornecedorSchema])
def listar_fornecedores():

    db = SessionLocal()

    try: 

        fornecedores = db.query(Fornecedor).all()

        return fornecedores

    finally:
        db.close()

@router.get("/fornecedores/{id}", response_model=FornecedorSchema)
def buscar_fornecedor(id: int):

    db = SessionLocal()

    try: 
        fornecedor = db.query(Fornecedor).filter(
            Fornecedor.id == id
        ).first()

        if not fornecedor:
            return {"erro": "Fornecedor não encontrado"}

        return fornecedor
    finally:
        db.close()