# ORDINIS — Regras de Negócio Financeiro

## Regra 1 — Transação é a entidade principal

Toda movimentação financeira deve ser representada como uma transação.

Tipos principais:

- income: receita
- expense: despesa
- transfer: transferência

## Regra 2 — Receitas e despesas entram no dashboard

Receitas somam no total de entradas.

Despesas somam no total de saídas.

Transferências não devem entrar como receita nem como despesa.

## Regra 3 — Saldo é derivado

O saldo não deve ser salvo como fonte da verdade.

Saldo deve ser calculado a partir de:

saldo inicial da conta + receitas - despesas + transferências entre contas

## Regra 4 — Dados financeiros não devem ser apagados definitivamente

Sempre que possível, preferir soft delete, status inativo ou cancelamento lógico.

Histórico financeiro precisa ser preservado.

## Regra 5 — Parcelamento

Compra parcelada deve aparecer como uma linha mãe na grid.

Ao expandir, devem aparecer as parcelas.

Exemplo:

Notebook Dell — R$ 3.600 — 12x

- Parcela 1/12 — R$ 300 — paga
- Parcela 2/12 — R$ 300 — pendente

## Regra 6 — Construção da casa

No MVP, construção da casa será tratada como categoria comum.

Exemplo:

Categoria: Casa / Obra

Futuramente pode virar projeto separado.

## Regra 7 — Cartão de crédito

No MVP, cartão de crédito será controlado por compra individual.

A fatura completa fica para V2.

Cartão pode ser tratado como uma conta do tipo credit_card.

## Regra 8 — Transferência

Transferência deve aparecer na grid principal.

Mas não deve impactar os totais de receita e despesa.

## Regra 9 — Metas financeiras

Metas ficam para V2.

No MVP não implementar:

- meta mensal
- meta de economia
- projeção futura avançada