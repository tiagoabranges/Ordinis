# Ordinis API

Backend financeiro do Ordinis construído com NestJS, Prisma e PostgreSQL.

## Principais recursos

- autenticação com JWT access token e refresh token
- CRUD de contas, categorias e centros de custo
- transações com receitas, despesas e transferências
- parcelamentos com geração automática de parcelas
- recorrências com geração de ocorrências pendentes
- dashboard consolidado com indicadores e agrupamentos
- importação de CSV com preview, deduplicação básica e sugestão de categoria
- anexos locais preparados para futura troca por S3
- inbox de automação para fluxo futuro com IA
- documentação Swagger em `/api/docs`

## Setup

1. Copie `apps/api/.env.example` para `apps/api/.env`.
2. Suba o PostgreSQL:

```bash
npm run db:up
```

3. Gere o client Prisma:

```bash
npm run prisma:generate --workspace api
```

4. Aplique a migration:

```bash
npm run prisma:deploy --workspace api
```

5. Rode o seed:

```bash
npm run prisma:seed --workspace api
```

6. Inicie a API:

```bash
npm run start:dev --workspace api
```

## Usuário demo

- e-mail: `demo@ordinis.app`
- senha: `demo12345`

## Endpoints principais

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `GET /api/dashboard`
- `CRUD /api/accounts`
- `CRUD /api/categories`
- `CRUD /api/cost-centers`
- `CRUD /api/transactions`
- `POST /api/installments`
- `CRUD /api/recurring-transactions`
- `POST /api/imports/preview`
- `POST /api/imports/confirm`
- `POST /api/attachments/:transactionId`
- `POST /api/automation/inbox`
- `GET /api/health`

## Observações

- IDs usam `cuid`, então o frontend deve tratar os identificadores como string.
- transferências não entram como receita/despesa nos indicadores do dashboard.
- o módulo de importação persiste preview no banco antes da confirmação.
