from pydantic import BaseModel


class AprovacaoUpdate(BaseModel):
    setor: str
    status: str