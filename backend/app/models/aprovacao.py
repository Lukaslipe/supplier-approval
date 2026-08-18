from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class AprovacaoFornecedor(Base):

    __tablename__ = "aprovacoes_fornecedor"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    fornecedor_id: Mapped[int] = mapped_column(
        ForeignKey("fornecedores.id")
    )

    setor: Mapped[str] = mapped_column(
        String
    )

    status: Mapped[str] = mapped_column(
        String,
        default="Pendente"
    )

    observacao: Mapped[str | None] = mapped_column(
        String,
        nullable=True
    )

    atualizado_em: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )