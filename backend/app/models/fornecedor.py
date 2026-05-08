from sqlalchemy import Column, Integer, String, Float
from app.database import Base

class Fornecedor(Base):
    __tablename__ = "fornecedores"

    id = Column(Integer, primary_key=True, index=True)

    cnpj = Column(String, unique=True, index=True)

    razao_social = Column(String)
    nome_fantasia = Column(String)

    situacao = Column(String)
    porte = Column(String)

    capital_social = Column(String)
    abertura = Column(String)

    telefone = Column(String)
    email = Column(String)

    cidade = Column(String)
    uf = Column(String)

    cnae = Column(String)

    score = Column(Float, default=0)
    risco = Column(String, default="Em análise")