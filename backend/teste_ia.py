from app.services.ai_service import gerar_parecer

prompt = """
Fornecedor:
- Situação: ATIVA
- Score: 45
- Risco: Médio
- Ocorrências:
  - atraso entrega
  - falha documentação

Gere parecer curto corporativo.
"""

resposta = gerar_parecer(prompt)

print(resposta)