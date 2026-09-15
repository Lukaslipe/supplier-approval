from datetime import datetime

from sqlalchemy import Boolean, DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


# Papéis possíveis:
# - admin     -> gerencia usuários e enxerga tudo
# - rh        -> aprova o setor RH
# - juridico  -> aprova o setor Jurídico
# - compras   -> aprova o setor Compras
# - comum     -> cadastra fornecedores e acompanha
ROLES = ["admin", "rh", "juridico", "compras", "comum"]

# Mapeia o papel do usuário ao nome do setor usado na homologação
ROLE_PARA_SETOR = {
    "rh": "RH",
    "juridico": "Jurídico",
    "compras": "Compras",
}


class Usuario(Base):

    __tablename__ = "usuarios"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    nome: Mapped[str] = mapped_column(String)

    email: Mapped[str] = mapped_column(
        String,
        unique=True,
        index=True
    )

    senha_hash: Mapped[str] = mapped_column(String)

    role: Mapped[str] = mapped_column(
        String,
        default="comum"
    )

    ativo: Mapped[bool] = mapped_column(
        Boolean,
        default=True
    )

    criado_em: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )
