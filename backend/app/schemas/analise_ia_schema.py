from pydantic import BaseModel

class AnaliseIAResponse(BaseModel):

    id: int

    fornecedor_id: int

    parecer: str

    class Config:
        from_attributes = True