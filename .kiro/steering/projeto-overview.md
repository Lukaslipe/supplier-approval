---
inclusion: always
---

# SupplierGuard — Visão Geral

Sistema de aprovação/homologação de fornecedores (SaaS interno). Todo o domínio e a UI estão em **português**.

## Stack

- **Backend:** FastAPI 0.136 + SQLAlchemy 2.0 + SQLite (`backend/`)
- **Frontend:** React 19 + Vite 8 + Tailwind CSS v4 (`frontend/`)
- **Integrações externas:** ReceitaWS (consulta de CNPJ) e OpenRouter (parecer de IA)

## Fluxo de negócio (resumo)

1. **Consulta CNPJ** → busca dados na ReceitaWS e calcula um **score** (0–100).
2. **Cadastro** → persiste o fornecedor e cria a **homologação** conforme o risco.
3. **Homologação** → risco define o caminho: Baixo (automático), Médio (aprovações setoriais), Alto (aprovações + visita + documentos).
4. **Ocorrências** → registram fatos que alteram o score ao longo do tempo.
5. **Análise de IA** → gera parecer textual sobre o fornecedor via OpenRouter.

## Como rodar (dev)

- Backend: `uvicorn app.main:app --reload` dentro de `backend/` (roda em `http://127.0.0.1:8000`). Requer `.env` com `OPENROUTER_API_KEY`.
- Frontend: `npm run dev` dentro de `frontend/`. A URL do backend está **hardcoded** em `frontend/src/services/api.js` (`http://127.0.0.1:8000`), sem proxy nem variável de ambiente.

## Convenções importantes

- Domínio, nomes de variáveis, rotas e mensagens em português.
- Não há autenticação/autorização em nenhuma camada.
- Banco SQLite (`backend/supplier.db`) criado automaticamente no startup (sem migrations).
