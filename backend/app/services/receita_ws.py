import requests

def consultar_cnpj(cnpj: str):
    url = f"https://receitaws.com.br/v1/cnpj/{cnpj}"

    response = requests.get(url)

    if response.status_code != 200:
        return None

    return response.json()