# ORDINIS — MVP da Planilha Financeira

## Objetivo

Criar a primeira tela funcional do sistema: uma planilha financeira moderna para listar, filtrar, criar, editar e visualizar transações.

## Tela principal

Criar uma tela no frontend para o Financial Grid.

Ela deve conter:

1. Cards de resumo no topo
2. Filtros rápidos
3. Botão de nova transação
4. Tabela/grid de transações
5. Expansão de parcelamentos
6. Estados de loading, vazio e erro

## Colunas da grid

A grid deve exibir:

- Data
- Descrição
- Tipo
- Conta
- Categoria
- Forma de pagamento
- Valor
- Status
- Parcelamento
- Ações

## Status possíveis

- paid
- pending
- canceled

## Filtros necessários

- mês atual
- data inicial
- data final
- tipo
- conta
- categoria
- status
- busca por texto

## Cards de resumo

Exibir no topo:

- Total de receitas
- Total de despesas
- Saldo do período
- Total pendente

## Parcelamento

Quando uma transação possuir parcelamento, a linha principal deve ser expansível.

Ao expandir, exibir as parcelas relacionadas.

## Transferências

Transferências devem aparecer na grid com tipo transfer.

Transferências não entram nos cards de receitas e despesas.

## Escopo fora do MVP

Não implementar agora:

- metas financeiras
- IA
- upload de extrato
- importação CSV avançada
- fatura completa de cartão
- múltiplos projetos financeiros