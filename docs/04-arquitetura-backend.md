# ORDINIS — Arquitetura Backend

## Stack

- NestJS
- TypeScript
- Prisma
- PostgreSQL
- JWT
- class-validator
- Swagger

## Objetivo

Criar ou ajustar os endpoints necessários para alimentar a planilha financeira do frontend.

## Módulo sugerido

Criar um módulo específico para a grid financeira, sem quebrar os módulos existentes.

Nome sugerido:

financial-grid

ou reaproveitar transactions se já existir uma estrutura melhor.

## Responsabilidades do backend

O backend deve:

- listar transações paginadas
- aplicar filtros
- calcular resumo financeiro do período
- retornar dados prontos para a grid
- retornar parcelamentos vinculados à transação mãe
- criar transações simples
- editar transações
- cancelar/desativar transações quando necessário

## Endpoint sugerido

GET /financial-grid

Deve retornar:

```json
{
  "summary": {
    "totalIncome": 0,
    "totalExpense": 0,
    "periodBalance": 0,
    "totalPending": 0
  },
  "items": [],
  "pagination": {
    "page": 1,
    "perPage": 20,
    "total": 0,
    "totalPages": 0
  }
}


Filtros aceitos

Query params:

page
perPage
startDate
endDate
type
accountId
categoryId
status
search
DTOs

Criar DTOs para:

filtros da grid
criação de transação
atualização de transação
resposta da grid
resposta de summary
Cuidados
Não buscar tudo do banco.
Sempre paginar.
Sempre filtrar por usuário autenticado.
Não misturar regra de dashboard avançado com a grid.
Transferências não devem entrar em totalIncome nem totalExpense.
Parcelamentos devem ser retornados de forma expansível.