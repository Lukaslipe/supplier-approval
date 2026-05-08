from pydantic import BaseModel

class FornecedorSchema(BaseModel):

    id: int
    cnpj: str

    razao_social: str | None
    nome_fantasia: str | None

    situacao: str | None
    porte: str | None

    capital_social: str | None
    abertura: str | None

    telefone: str | None
    email: str | None

    cidade: str | None
    uf: str | None

    cnae: str | None

    score: float
    risco: str

    class Config:
        from_attributes = True