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

Banco, migrations e seed pelo Compose:

```sh
docker compose up -d db
docker compose run --rm api-tools npm run prisma:migrate
docker compose run --rm api-tools npm run prisma:seed
docker compose run --rm api-tools npm run test:integration
docker compose down
```

O alvo `api-tools` gera o Prisma Client durante o build, e o script
`prisma:seed` tambem executa `prisma generate` antes de rodar o seed. O seed e
idempotente e pode ser executado mais de uma vez sem duplicar os dados iniciais.
Use `prisma:migrate` para aplicar migrations versionadas; nao use sincronizacao
automatica destrutiva de schema em ambientes persistentes.

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
- TASK 04: Prisma com schema PostgreSQL, migration inicial versionada, seed idempotente e testes de integracao das restricoes principais.
- TASK 05: endpoints de responsaveis no backend com listagem paginada, busca por nome, detalhe, criacao, atualizacao, ativacao/inativacao, validacoes de contato, testes unitarios e testes de integracao dos endpoints.
- TASK 06: endpoints de catalogo no backend com CRUD sem exclusao fisica, busca por sigla/nome/descricao, filtros por tipo/status, ordenacao por criticidade, paginacao e responsaveis agrupados no retorno.
- TASK 07: endpoints de vinculo entre item e responsavel, com validacao de item/responsavel ativos, conflito para duplicidade, suporte a dois papeis para a mesma pessoa e remocao sem excluir o responsavel.
- TASK 08: atualizacao rapida de status do item com motivo/previsao opcionais, horario definido pelo servidor, limpeza da previsao ao voltar para `OK` e campo calculado `returnOverdue`.
- TASK 09: base Angular standalone do frontend com routing, SCSS, ambientes, URL da API, layout responsivo, tokens CSS, interceptor HTTP com feedback global, scripts de lint/test/build e rotas lazy `/painel`, `/itens` e `/responsaveis`.
- TASK 10: tela de gestao de responsaveis no frontend com busca, paginacao, cadastro, edicao, ativacao/inativacao com confirmacao, validacoes equivalentes ao backend e estados de carregamento/vazio/erro/sucesso.
- TASK 11: tela de gestao de itens no frontend com listagem administrativa, filtros, cadastro, edicao, ativacao/inativacao, selecao pesquisavel de responsaveis existentes e manutencao de vinculos tecnicos e gerenciais sem criar novos cadastros.
- Proximas etapas: painel operacional e busca principal.
