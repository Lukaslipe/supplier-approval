from sqlalchemy import Column, Integer, String, ForeignKey
from app.database import Base

class Ocorrencia(Base):
    __tablename__ = "ocorrencias"

    id = Column(Integer, primary_key=True, index=True)

    fornecedor_id = Column(Integer, ForeignKey("fornecedores.id"))

    tipo = Column(String)
    descricao = Column(String)

    impacto = Column(Integer, default=10)

    score_antes = Column(Integer)
    score_depois = Column(Integer)