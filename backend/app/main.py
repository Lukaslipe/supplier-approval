from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base

from app.models.fornecedor import Fornecedor
from app.routes.fornecedores import router as fornecedor_router
from app.models.ocorrencia import Ocorrencia
from app.routes.ocorrencias import router as ocorrencia_router
from app.models.analise_ia import AnaliseIA
from app.routes.ia import router as ia_router
from app.routes.aprovacao_routes import router as aprovacao_router
from app.models.usuario import Usuario
from app.routes.auth import router as auth_router
from app.routes.usuarios import router as usuarios_router
from app.services.migrations import aplicar_migracoes_simples
from app.services.seed import seed_admin

Base.metadata.create_all(bind=engine)

# Ajustes de schema para bancos já existentes (create_all não altera tabelas)
aplicar_migracoes_simples()

# Garante um admin inicial
seed_admin()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(fornecedor_router)
app.include_router(ocorrencia_router)
app.include_router(ia_router)
app.include_router(aprovacao_router)
app.include_router(auth_router)
app.include_router(usuarios_router)

@app.get("/")
def home():
    return {"message": "API funcionando"}