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

## Docker Compose

Os containers usam imagens com tags fixas e leem configuracoes do `.env` quando o arquivo existir. Para iniciar com os valores padrao, copie o exemplo:

```sh
cp .env.example .env
```

Build das imagens:

```sh
docker compose build
```

Subida do banco, API e frontend:

```sh
docker compose up
```

Subida em segundo plano:

```sh
docker compose up -d
```

Logs:

```sh
docker compose logs -f
docker compose logs -f api
docker compose logs -f web
docker compose logs -f db
```

Parada sem apagar dados do banco:

```sh
docker compose down
```

Reset controlado do banco local, apagando o volume nomeado:

```sh
docker compose down -v
docker compose up --build
```

Nesta etapa, `backend` e `frontend` ainda possuem placeholders executaveis para validar a infraestrutura. A API NestJS sera criada na TASK 03 e a aplicacao Angular na TASK 09.

## Comandos Previstos das Aplicacoes

Os comandos abaixo serao completados conforme as proximas tasks forem implementadas.

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
- TASK 02: Docker Compose com PostgreSQL, API e web.
- TASK 03: base NestJS do backend com validacao de ambiente, prefixo `/api/v1`, CORS, filtro global de erros, Swagger em `/api/docs`, endpoint `/api/v1/health`, lint, testes e build.
- Proximas etapas: modelo de dados, responsaveis, catalogo e frontend.
