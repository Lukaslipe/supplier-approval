from sqlalchemy.orm import Session
from app.models.aprovacao import AprovacaoFornecedor
from datetime import datetime


def listar_aprovacoes(db: Session, fornecedor_id: int):

    return db.query(AprovacaoFornecedor).filter(
        AprovacaoFornecedor.fornecedor_id == fornecedor_id
    ).all()


def atualizar_aprovacao(db: Session, fornecedor_id: int, setor: str, status: str):

    aprovacao = db.query(AprovacaoFornecedor).filter(
        AprovacaoFornecedor.fornecedor_id == fornecedor_id,
        AprovacaoFornecedor.setor == setor
    ).first()

    if not aprovacao:
        return None

    aprovacao.status = status # type: ignore
    aprovacao.atualizado_em = datetime.utcnow() # type: ignore

    db.commit()
    db.refresh(aprovacao)

    return aprovacao