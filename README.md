# CADEBOARD

CADEBOARD e um sistema interno para apoiar o atendimento N1 na consulta de sistemas, projetos e servicos de infraestrutura, com seus responsaveis, contatos e estado operacional atual.

O MVP segue os requisitos e a fila de implementacao em [docs/CADEBOARD_REQUISITOS_E_TASKS_MVP.md](docs/CADEBOARD_REQUISITOS_E_TASKS_MVP.md).

## Arquitetura Prevista

- `backend/`: API Node.js com NestJS, TypeScript, Prisma e PostgreSQL.
- `frontend/`: aplicacao Angular standalone com TypeScript e SCSS.
- `docs/`: requisitos, decisoes e plano de implementacao.
- `docker-compose.yml`: orquestracao local prevista para banco, API e web.

## Pre-requisitos

- Node.js 24 LTS.
- npm compativel com a versao do Node.js instalada.
- Docker e Docker Compose.
- Git.

As versoes serao fixadas nos arquivos de cada camada quando backend, frontend e containers forem criados.

## Configuracao

Copie `.env.example` para `.env` para execucao local quando os servicos forem implementados:

```sh
cp .env.example .env
```

Nao versione `.env` ou qualquer arquivo com credenciais reais.

## Comandos Previstos

Os comandos abaixo serao disponibilizados conforme as proximas tasks forem implementadas.

```sh
docker compose build
docker compose up
docker compose down
```

Backend:

```sh
cd backend
npm install
npm run lint
npm test
npm run build
```

Frontend:

```sh
cd frontend
npm install
npm run lint
npm test
npm run build
```

## Status do Projeto

- TASK 01: estrutura inicial do repositorio.
- Proximas etapas: Docker Compose, base do backend, modelo de dados e frontend.
