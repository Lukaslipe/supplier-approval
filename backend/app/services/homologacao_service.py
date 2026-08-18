from app.models.homologacao import HomologacaoFornecedor
from app.models.aprovacao import AprovacaoFornecedor


SETORES = [
    "RH",
    "Jurídico",
    "Compras"
]


def criar_homologacao(fornecedor, db):

    homologacao = HomologacaoFornecedor(
        fornecedor_id=fornecedor.id
    )

    if fornecedor.risco == "Baixo":

        homologacao.status = "Aprovado automaticamente"
        homologacao.tipo = "Automática"

    elif fornecedor.risco == "Médio":

        homologacao.status = "Pendente"
        homologacao.tipo = "Setorial"

    elif fornecedor.risco == "Alto":

        homologacao.status = "Pendente"
        homologacao.tipo = "Especial"

    db.add(homologacao)
    db.flush()

    # Médio e Alto precisam das aprovações
    if fornecedor.risco in ["Médio", "Alto"]:

        setores = [
            "RH",
            "Jurídico",
            "Compras"
        ]

        for setor in setores:

            aprovacao = AprovacaoFornecedor(
                fornecedor_id=fornecedor.id,
                setor=setor,
                status="Pendente"
            )

            db.add(aprovacao)

    return homologacao