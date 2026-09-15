---
inclusion: fileMatch
fileMatchPattern: 'frontend/**'
---

# Frontend (React + Vite)

Raiz: `frontend/src/`. App: `App.jsx`, entry: `main.jsx`.

## Stack

- React 19, react-router-dom 7, Vite 8, Tailwind CSS v4 (`index.css` só tem `@import "tailwindcss";`, `App.css` vazio).
- axios (`src/services/api.js` — instância única, baseURL hardcoded `http://127.0.0.1:8000`, sem interceptors/auth).
- Ícones: `lucide-react`. Gráficos: `recharts`. Toasts: `react-hot-toast` (Toaster montado no `main.jsx`).
- Estilização inteiramente via classes Tailwind inline no JSX.

## Rotas (`App.jsx`)

- `/` → `Dashboard`
- `/fornecedores` → `Fornecedores` (lista)
- `/fornecedor/:id` → `FornecedorDetalhe`
- `/novo-fornecedor` → `NovoFornecedor`
- `/homologacoes` → `Homologacoes` (lista)
- `/homologacao/:id` → `HomologacaoDetalhe` — **atenção: `:id` é o `fornecedor_id`**, não o id da homologação.

Detalhes usam segmento singular (`/fornecedor`, `/homologacao`); listas usam plural.

## Páginas (`src/pages/`)

- `Dashboard.jsx`: KPIs (total, contagem por risco, score médio) + PieChart de risco; últimos 5 fornecedores clicáveis.
- `Fornecedores.jsx`: tabela com busca (razão social/cnpj) e filtro por risco (client-side).
- `NovoFornecedor.jsx`: fluxo em 2 passos — consulta CNPJ (`GET /consulta-cnpj/{cnpj}`, com máscara/validação de 14 dígitos) → confirma cadastro (`POST /fornecedores`, envia `fornecedor.fornecedor`). Trata 400 e 409 com toast.
- `FornecedorDetalhe.jsx`: hub operacional. Abas Visão geral (LineChart de score + parecer IA), Ocorrências (form + timeline), IA (histórico de pareceres).
- `Homologacoes.jsx`: tabela de homologações; "Abrir" navega para `/homologacao/{fornecedor_id}`.
- `HomologacaoDetalhe.jsx`: gate de homologação. Aprovações setoriais aparecem só para risco Médio/Alto; visita + documentos só para Alto.

## Convenções

- Cada página faz seu próprio try/catch + `console.error` (sem tratamento global de erro).
- Cores de risco/status: Baixo/Aprovado = verde, Médio/Pendente = amarelo, Alto/Reprovado = vermelho.
- Ao adicionar chamadas ao backend, use a instância `api` de `src/services/api.js`.
