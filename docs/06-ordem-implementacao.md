# 6. `06-ordem-implementacao.md`

```md
# ORDINIS — Ordem de Implementação

## Fase 1 — Backend

1. Verificar o schema Prisma atual
2. Identificar se já existem Transaction, Account, Category, InstallmentGroup e PaymentMethod
3. Não duplicar entidades já existentes
4. Criar ou ajustar DTOs necessários
5. Criar endpoint GET /financial-grid
6. Implementar filtros
7. Implementar paginação
8. Implementar cálculo do summary
9. Garantir que transferência não entra em receita/despesa
10. Garantir autenticação por usuário

## Fase 2 — Frontend

1. Criar módulo financial-grid
2. Criar service de API
3. Criar types TypeScript
4. Criar hook useFinancialGrid
5. Criar página FinancialGridPage
6. Criar cards de resumo
7. Criar filtros
8. Criar tabela
9. Criar expansão de parcelamentos
10. Criar estados loading/empty/error

## Fase 3 — Integração

1. Conectar frontend com endpoint real
2. Validar filtros
3. Validar paginação
4. Validar summary
5. Validar expansão de parcelas
6. Ajustar layout

## Fase 4 — Refinamento

1. Melhorar UX
2. Melhorar formatação monetária
3. Melhorar responsividade
4. Melhorar organização dos arquivos
5. Remover código boilerplate do Vite