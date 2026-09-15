"""
Cria um usuário administrador inicial caso não exista nenhum admin.
Roda no startup da aplicação.
"""

from app.database import SessionLocal
from app.models.usuario import Usuario
from app.services.security import gerar_hash_senha

ADMIN_EMAIL = "admin@supplierguard.com"
ADMIN_SENHA = "admin123"
ADMIN_NOME = "Administrador"


def seed_admin():
    db = SessionLocal()

    try:
        existe_admin = db.query(Usuario).filter(
            Usuario.role == "admin"
        ).first()

        if existe_admin:
            return

        admin = Usuario(
            nome=ADMIN_NOME,
            email=ADMIN_EMAIL,
            senha_hash=gerar_hash_senha(ADMIN_SENHA),
            role="admin",
            ativo=True
        )

        db.add(admin)
        db.commit()

        print(
            f"[seed] Admin criado -> {ADMIN_EMAIL} / senha: {ADMIN_SENHA}"
        )

    finally:
        db.close()
