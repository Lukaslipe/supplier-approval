from pydantic import BaseModel


class LoginRequest(BaseModel):
    email: str
    senha: str


class UsuarioResponse(BaseModel):
    id: int
    nome: str
    email: str
    role: str
    ativo: bool

    class Config:
        from_attributes = True


class LoginResponse(BaseModel):
    token: str
    usuario: UsuarioResponse


class UsuarioCreate(BaseModel):
    nome: str
    email: str
    senha: str
    role: str = "comum"


class UsuarioUpdate(BaseModel):
    nome: str | None = None
    email: str | None = None
    senha: str | None = None
    role: str | None = None
    ativo: bool | None = None
