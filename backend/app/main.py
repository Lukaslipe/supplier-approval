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

Base.metadata.create_all(bind=engine)

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

@app.get("/")
def home():
    return {"message": "API funcionando"}