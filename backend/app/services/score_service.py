from datetime import datetime

def gerar_score(dados):

    score = 0

    if dados.get("situacao") == "ATIVA":
        score += 30

    capital_social = dados.get("capital_social")

    try:
        capital = float(capital_social.replace(".", "").replace(",", "."))

        if capital >= 100000:
            score += 20
        elif capital >= 50000:
            score += 10

    except:
        pass

    abertura = dados.get("abertura")

    try:
        data_abertura = datetime.strptime(abertura, "%d/%m/%Y")
        anos = (datetime.now() - data_abertura).days / 365

        if anos >= 5:
            score += 20
        elif anos >= 2:
            score += 10

    except:
        pass

    if dados.get("telefone"):
        score += 10

    if dados.get("email"):
        score += 10

    return score


def definir_risco(score):

    if score >= 70:
        return "Baixo"

    if score >= 40:
        return "Médio"

    return "Alto"