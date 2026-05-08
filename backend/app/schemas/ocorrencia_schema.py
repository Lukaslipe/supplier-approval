from pydantic import BaseModel

class OcorrenciaCreate(BaseModel):

    fornecedor_id: int
    tipo: str
    descricao: str
    impacto: int


class OcorrenciaResponse(BaseModel):

    id: int

    fornecedor_id: int
    tipo: str
    descricao: str
    impacto: int

    class Config:
        from_attributes = True