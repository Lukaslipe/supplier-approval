from sqlalchemy import Column, Integer, String, ForeignKey

from app.database import Base

class AnaliseIA(Base):

    __tablename__ = "analises_ia"

    id = Column(Integer, primary_key=True, index=True)

    fornecedor_id = Column(Integer, ForeignKey("fornecedores.id"))

    parecer = Column(String)