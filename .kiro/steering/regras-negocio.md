---
inclusion: always
---

# Regras de Negócio — Score, Risco e Homologação

## Score (`backend/app/services/score_service.py`)

`gerar_score(dados)` começa em **50** (neutro) e ajusta:

- **Situação cadastral:** ATIVA +20 | SUSPENSA/INAPTA −25 | BAIXADA −50
- **Capital social:** ≥500k +5 | ≥100k +3 | ≥50k +2 | <10k −10 | erro de parse −5
- **Tempo de empresa (abertura dd/mm/aaaa):** ≥10a +15 | ≥5a +10 | ≥2a +3 | <1a −15 | erro −5
- **Contato:** telefone ±3 | email ±3
- Resultado final limitado a **[0, 100]**.

## Classificação de risco (`definir_risco`)

- score ≥ 70 → **Baixo**
- score ≥ 40 → **Médio**
- senão → **Alto**

## Homologação por risco (`homologacao_service.criar_homologacao`)

- **Baixo:** status "Aprovado automaticamente", tipo "Automática". Sem aprovações setoriais. Gera parecer de IA automático no cadastro.
- **Médio:** status "Pendente", tipo "Setorial". Cria 3 aprovações: **RH, Jurídico, Compras**.
- **Alto:** status "Pendente", tipo "Especial". Cria as 3 aprovações + exige `visita_realizada` e `documentos_ok`.

## Recálculo de status da homologação (ao aprovar/reprovar setor ou atualizar flags)

1. Qualquer setor **Reprovado** → homologação "Reprovado" (motivo/`observacao` obrigatório na reprovação).
2. Se nem todos os setores estão Aprovados → "Pendente".
3. Se tipo == "Especial" (Alto): só vira "Aprovado" com visita **e** documentos OK; senão "Pendente".
4. Caso contrário (Médio, todos aprovados) → "Aprovado".

## Ocorrências e score ao longo do tempo (`backend/app/routes/ocorrencias.py`)

- `novo_score = score_atual − impacto`, limitado a [0, 100]; depois recalcula o risco.
- **Convenção do sinal do impacto (importante):**
  - No banco, `impacto` **positivo abaixa** o score (penalidade); `impacto` **negativo aumenta** o score (bônus).
  - O frontend inverte esse sinal na escrita e na leitura: toggle "Penalidade" grava `+abs`, "Bônus" grava `−abs`; a timeline lê `impacto < 0` como bônus.
- `impacto` deve estar entre −100 e 100 (senão 400).
