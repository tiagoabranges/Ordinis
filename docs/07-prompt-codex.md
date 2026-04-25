# Prompt para o Codex

Você está trabalhando no projeto ORDINIS.

Antes de implementar, leia todos os arquivos em:

docs/codex/

Principalmente:

- 01-contexto-ordinis.md
- 02-regras-negocio-financeiro.md
- 03-mvp-planilha-financeira.md
- 04-arquitetura-backend.md
- 05-arquitetura-frontend.md
- 06-ordem-implementacao.md

Contexto atual:

O projeto é um monorepo com:

- apps/api: NestJS + Prisma + PostgreSQL
- apps/web: React + Vite + TypeScript
- Docker para PostgreSQL
- backend já possui módulos financeiros
- frontend ainda está no boilerplate do Vite

Objetivo:

Implementar o MVP da planilha financeira do ORDINIS.

Regras importantes:

- Não reescrever o projeto inteiro.
- Não trocar a stack.
- Não implementar IA agora.
- Não implementar metas financeiras agora.
- Não implementar fatura completa de cartão agora.
- Não duplicar entidades já existentes.
- Antes de criar algo novo, verificar se já existe no schema Prisma e nos módulos do backend.
- Manter código limpo, modular e tipado.
- Backend deve paginar e filtrar no banco.
- Frontend deve consumir API real e ter estrutura modular.

Primeira tarefa:

1. Inspecione a estrutura atual do projeto.
2. Leia o schema Prisma.
3. Leia os módulos existentes de transactions, accounts, categories, installments e dashboard.
4. Proponha um plano curto de implementação.
5. Depois implemente primeiro o endpoint GET /financial-grid com filtros, paginação e summary.

Formato esperado da resposta:

- arquivos alterados
- o que foi criado
- decisões tomadas
- como testar
- próximos passos