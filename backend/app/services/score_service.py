from datetime import datetime

def gerar_score(dados):

    score = 50  # começa neutro

    # =========================
    # SITUAÇÃO CADASTRAL
    # =========================

    situacao = dados.get("situacao")

    if situacao == "ATIVA":
        score += 20
    elif situacao in ["SUSPENSA", "INAPTA"]:
        score -= 25
    elif situacao == "BAIXADA":
        score -= 50


    # =========================
    # CAPITAL SOCIAL
    # =========================

    capital_social = dados.get("capital_social")

    try:

        capital = float(
            capital_social
            .replace(".", "")
            .replace(",", ".")
        )

        if capital >= 500000:
            score += 5

        elif capital >= 100000:
            score += 3

        elif capital >= 50000:
            score += 2

        elif capital < 10000:
            score -= 10

    except:
        score -= 5


    # =========================
    # TEMPO DE EMPRESA
    # =========================

    abertura = dados.get("abertura")

    try:

        data_abertura = datetime.strptime(
            abertura,
            "%d/%m/%Y"
        )

        anos = (
            datetime.now() - data_abertura
        ).days / 365

        if anos >= 10:
            score += 15

        elif anos >= 5:
            score += 10

        elif anos >= 2:
            score += 3

        elif anos < 1:
            score -= 15

    except:
        score -= 5


    # =========================
    # CONTATO
    # =========================

    if dados.get("telefone"):
        score += 3
    else:
        score -= 3

    if dados.get("email"):
        score += 3
    else:
        score -= 3


    # =========================
    # LIMITAR 0 - 100
    # =========================

    return max(0, min(100, score))


def definir_risco(score):

    if score >= 70:
        return "Baixo"

    if score >= 40:
        return "Médio"

    return "Alto"