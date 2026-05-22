from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from datetime import datetime

from app.database import Base


class AprovacaoFornecedor(Base):

    __tablename__ = "aprovacoes_fornecedor"

    id = Column(Integer, primary_key=True, index=True)

    fornecedor_id = Column(Integer, ForeignKey("fornecedores.id"))

    setor = Column(String)

    status = Column(String, default="Pendente")

    atualizado_em = Column(DateTime, default=datetime.utcnow)