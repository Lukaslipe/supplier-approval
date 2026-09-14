---
inclusion: fileMatch
fileMatchPattern: 'backend/**'
---

# Backend (FastAPI)

Raiz: `backend/app/`. Entry point: `app/main.py`.

## Arquitetura

- `main.py`: cria o `FastAPI`, aplica CORS permissivo (`allow_origins=["*"]`), chama `Base.metadata.create_all()` no import (cria tabelas, sem migrations) e registra 4 routers **sem prefixo**: fornecedores, ocorrencias, ia, aprovacao.
- `database.py`: SQLite `sqlite:///./supplier.db`, `check_same_thread=False`. `SessionLocal`, `Base = declarative_base()`.
- **Sessão de banco:** não usa `Depends(get_db)`. Cada rota faz `db = SessionLocal()` dentro de `try/finally: db.close()`. Manter esse padrão.

## Models (`app/models/`)

- `Fornecedor` (tabela `fornecedores`): dados do CNPJ + `score` (Float), `score_base` (score original), `risco` (String).
- `Ocorrencia` (`ocorrencias`): FK fornecedor, `tipo`, `descricao`, `impacto` (Int), `score_antes`, `score_depois`.
- `AnaliseIA` (`analises_ia`): FK fornecedor, `parecer` (texto da IA).
- `AprovacaoFornecedor` (`aprovacoes_fornecedor`): FK fornecedor, `setor`, `status`, `observacao`, `atualizado_em`. Uma linha por (fornecedor, setor).
- `HomologacaoFornecedor` (`homologacoes_fornecedor`): FK fornecedor (**unique**), `status`, `tipo`, `visita_realizada`, `documentos_ok`.
- **Sem `relationship()`** — associações são feitas por join manual via colunas FK.

## Rotas principais (`app/routes/fornecedores.py` é o módulo central)

- `GET /consulta-cnpj/{cnpj}` — ReceitaWS + score (preview, não persiste).
- `POST /fornecedores` — cria fornecedor + `criar_homologacao()`; se risco Baixo, gera parecer de IA automático.
- `GET /fornecedores`, `GET /fornecedores/{id}`
- `GET /fornecedores/{id}/historico-score` — timeline montada a partir das ocorrências.
- `GET /fornecedores/{id}/homologacao`, `POST /fornecedores/{id}/aprovacao`, `PUT /fornecedores/{id}/homologacao`
- `GET /homologacoes`
- `ocorrencias.py`: `POST /ocorrencias`, `GET /fornecedores/{id}/ocorrencias`
- `ia.py`: `POST /fornecedores/{id}/analise-ia`, `GET /fornecedores/{id}/analises-ia`

## Services (`app/services/`)

- `score_service.py`: `gerar_score(dados)` e `definir_risco(score)` — motor de score/risco.
- `homologacao_service.py`: `criar_homologacao()` — ramifica o workflow por risco.
- `receita_ws.py`: `consultar_cnpj()` → GET receitaws.com.br.
- `ai_service.py`: `gerar_parecer(prompt)` → OpenRouter (`minimax/minimax-m3:free`). Lê `OPENROUTER_API_KEY` do `.env`. **Sem tratamento de erro** (KeyError se resposta vier malformada) — envolver em try/except ao chamar.

## Cuidados / dívidas conhecidas

- Arquivos **stub vazios**: `models/avaliacao.py`, `routes/avaliacoes.py`, `services/openrouter.py` (a chamada real vive em `ai_service.py`).
- `services/aprovacao_service.py` é **código morto** (a lógica está inline em `fornecedores.py`).
- **Colisão de rota:** `POST /fornecedores/{id}/aprovacao` é definida em `fornecedores.py` E em `aprovacao_routes.py`; a de `fornecedores.py` vence (registrada primeiro).
- Muitas rotas recebem `payload: dict` cru em vez dos schemas Pydantic existentes.
- `requirements.txt` está em UTF-16.
