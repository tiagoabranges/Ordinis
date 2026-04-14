# Ordinis

Monorepo do Ordinis. Neste momento o backend está estruturado em `apps/api` com NestJS + Prisma + PostgreSQL e o frontend segue como base Vite em `apps/web`.

## Estrutura

- `apps/api`: API NestJS
- `apps/web`: frontend React/Vite
- `docker-compose.yml`: PostgreSQL local

## Rodando o backend

```bash
npm install
npm run db:up
cp apps/api/.env.example apps/api/.env
npm run prisma:generate --workspace api
npm run prisma:deploy --workspace api
npm run prisma:seed --workspace api
npm run start:dev --workspace api
```

Swagger: `http://localhost:3000/api/docs`

Healthcheck: `http://localhost:3000/api/health`

Credenciais demo: `demo@ordinis.app` / `demo12345`
