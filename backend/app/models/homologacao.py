from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class HomologacaoFornecedor(Base):

    __tablename__ = "homologacoes_fornecedor"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    fornecedor_id: Mapped[int] = mapped_column(
        ForeignKey("fornecedores.id"),
        unique=True
    )

    status: Mapped[str] = mapped_column(
        String,
        default="Pendente"
    )

    tipo: Mapped[str] = mapped_column(
        String
    )

    visita_realizada: Mapped[bool] = mapped_column(
        Boolean,
        default=False
    )

    documentos_ok: Mapped[bool] = mapped_column(
        Boolean,
        default=False
    )

    criado_em: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )

    atualizado_em: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )