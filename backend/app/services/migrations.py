"""
Migrações simples para bancos SQLite já existentes.

O SQLAlchemy `create_all` cria tabelas novas, mas NÃO adiciona colunas novas
a tabelas que já existem. Como o projeto não usa Alembic, aplicamos aqui
os ajustes mínimos de schema de forma idempotente.
"""

from sqlalchemy import inspect, text

from app.database import engine


def _coluna_existe(inspector, tabela: str, coluna: str) -> bool:
    if tabela not in inspector.get_table_names():
        return False
    colunas = [c["name"] for c in inspector.get_columns(tabela)]
    return coluna in colunas


def aplicar_migracoes_simples():
    inspector = inspect(engine)

    # aprovacoes_fornecedor.aprovado_por
    if inspector.get_table_names() and not _coluna_existe(
        inspector, "aprovacoes_fornecedor", "aprovado_por"
    ):
        if "aprovacoes_fornecedor" in inspector.get_table_names():
            with engine.begin() as conn:
                conn.execute(
                    text(
                        "ALTER TABLE aprovacoes_fornecedor "
                        "ADD COLUMN aprovado_por VARCHAR"
                    )
                )
            print("[migração] Coluna aprovado_por adicionada em aprovacoes_fornecedor")
