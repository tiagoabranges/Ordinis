# 5. `05-arquitetura-frontend.md`

```md
# ORDINIS — Arquitetura Frontend

## Stack

- React
- Vite
- TypeScript

## Objetivo

Criar a primeira tela real do ORDINIS: a planilha financeira.

## Estrutura sugerida

Dentro de apps/web/src:

```txt
modules/
  financial-grid/
    components/
      FinancialGridPage.tsx
      FinancialSummaryCards.tsx
      FinancialFilters.tsx
      FinancialTransactionsTable.tsx
      TransactionRow.tsx
      InstallmentsExpandedRow.tsx
      TransactionFormModal.tsx
    services/
      financialGridService.ts
    hooks/
      useFinancialGrid.ts
    types/
      financialGrid.types.ts
Responsabilidades
FinancialGridPage

Orquestra a tela.

Deve chamar o hook, exibir cards, filtros e tabela.

useFinancialGrid

Controla:

filtros
paginação
loading
erro
busca na API
atualização da lista
financialGridService

Responsável apenas por chamadas HTTP.

Não deve ter regra visual.

FinancialSummaryCards

Exibe:

receitas
despesas
saldo
pendente
FinancialFilters

Permite filtrar por:

período
tipo
conta
categoria
status
texto
FinancialTransactionsTable

Renderiza a tabela principal.

TransactionRow

Renderiza uma linha da transação.

Se for parcelada, deve permitir expandir.

InstallmentsExpandedRow

Renderiza as parcelas abaixo da linha mãe.

UX esperada

A tela deve ser limpa, rápida e objetiva.

Priorizar:

boa legibilidade
formato de planilha
ações rápidas
valores monetários bem formatados
cores diferentes para receita, despesa e transferência
Fora do escopo

Não implementar agora:

gráficos avançados
IA
metas
fatura de cartão
múltiplos projetos