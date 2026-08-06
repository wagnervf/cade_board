# CADEBOARD

CADEBOARD e um sistema interno para apoiar o atendimento N1 na consulta de sistemas, projetos e servicos de infraestrutura, com seus responsaveis, contatos e estado operacional atual.

O MVP segue os requisitos e a fila de implementacao em [docs/CADEBOARD_REQUISITOS_E_TASKS_MVP.md](docs/CADEBOARD_REQUISITOS_E_TASKS_MVP.md).

## Arquitetura

- `backend/`: API Node.js com NestJS, TypeScript, Prisma, Swagger e PostgreSQL.
- `frontend/`: aplicacao Angular standalone com TypeScript e SCSS.
- `docs/`: requisitos, decisoes e roteiros de operacao.
- `docker-compose.yml`: orquestracao local de `db`, `api`, `api-tools` e `web`.

## Pre-requisitos

- Docker e Docker Compose.
- Git.

Node.js 24 LTS e npm sao necessarios apenas para execucao local fora do Docker.
Com Docker, as imagens fixadas no projeto ja fornecem o runtime necessario.

## Execucao Rapida Com Docker

1. Copie o arquivo de ambiente:

```sh
cp .env.example .env
```

2. Construa as imagens:

```sh
docker compose build
```

3. Suba o banco:

```sh
docker compose up -d db
```

4. Aplique migrations e seed:

```sh
docker compose run --rm api-tools npm run prisma:migrate
docker compose run --rm api-tools npm run prisma:seed
```

5. Suba API e frontend:

```sh
docker compose up -d api web
```

6. Acesse:

- Frontend: `http://127.0.0.1:4200`
- API health: `http://127.0.0.1:3000/api/v1/health`
- Swagger: `http://127.0.0.1:3000/api/docs`

7. Pare os servicos quando terminar:

```sh
docker compose down
```

Esse comando preserva o volume do PostgreSQL. Use `docker compose down -v`
somente quando quiser apagar os dados locais.

## Variaveis

As variaveis ficam em `.env`, criado a partir de `.env.example`.

| Variavel | Padrao | Uso |
| --- | --- | --- |
| `NODE_ENV` | `development` | ambiente da API |
| `API_PORT` | `3000` | porta local da API |
| `API_CORS_ORIGIN` | `http://localhost:4200` | origem permitida para CORS |
| `POSTGRES_PORT` | `5432` | porta local do PostgreSQL |
| `POSTGRES_DB` | `cadeboard` | banco criado no container |
| `POSTGRES_USER` | `cadeboard` | usuario do banco |
| `POSTGRES_PASSWORD` | `cadeboard_dev_password` | senha local do banco |
| `DATABASE_URL` | `postgresql://cadeboard:cadeboard_dev_password@db:5432/cadeboard?schema=public` | conexao Prisma usada pela API e `api-tools` |
| `WEB_PORT` | `4200` | porta local do frontend |
| `API_BASE_URL` | `/api/v1` | base usada no build do Angular |
| `API_PROXY_PASS` | `http://api:3000` | destino do proxy Nginx do frontend |

Nao versione `.env` ou qualquer arquivo com credenciais reais.

## Migrations E Seed

Aplicar migrations versionadas:

```sh
docker compose up -d db
docker compose run --rm api-tools npm run prisma:migrate
```

Popular dados iniciais:

```sh
docker compose run --rm api-tools npm run prisma:seed
```

O alvo `api-tools` gera o Prisma Client durante o build, e o script
`prisma:seed` tambem executa `prisma generate` antes de rodar o seed. O seed e
idempotente e pode ser executado mais de uma vez sem duplicar os dados iniciais.
Use `prisma:migrate` para aplicar migrations versionadas; nao use sincronizacao
automatica destrutiva de schema em ambientes persistentes.

## Testes E Checks

Backend pelo `api-tools`:

```sh
docker compose run --rm api-tools npm run lint
docker compose run --rm api-tools npm test
docker compose run --rm api-tools npm run build
docker compose run --rm api-tools npm run test:integration
docker compose run --rm api-tools npm audit --audit-level=high
```

Frontend em container Node:

```sh
docker run --rm --user "$(id -u):$(id -g)" -e NPM_CONFIG_CACHE=/tmp/.npm -v "$PWD/frontend:/app" -w /app node:24.15.0-alpine3.23 npm run lint
docker run --rm --user "$(id -u):$(id -g)" -e NPM_CONFIG_CACHE=/tmp/.npm -v "$PWD/frontend:/app" -w /app node:24.15.0-alpine3.23 npm test
docker run --rm --user "$(id -u):$(id -g)" -e NPM_CONFIG_CACHE=/tmp/.npm -v "$PWD/frontend:/app" -w /app node:24.15.0-alpine3.23 npm run build
docker run --rm --user "$(id -u):$(id -g)" -e NPM_CONFIG_CACHE=/tmp/.npm -v "$PWD/frontend:/app" -w /app node:24.15.0-alpine3.23 npm audit --audit-level=high
```

Build final das imagens:

```sh
docker compose build api api-tools web
```

## Execucao Local Sem Docker

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

## Solucao De Problemas

- Porta em uso: altere `POSTGRES_PORT`, `API_PORT` ou `WEB_PORT` no `.env`, ou pare o projeto que esta usando a mesma porta.
- API ou web nao ficam `healthy`: rode `docker compose ps` e leia logs com `docker compose logs api`, `docker compose logs web` ou `docker compose logs db`.
- Erro de Prisma Client ausente: reconstrua `api` e `api-tools` com `docker compose build api api-tools`.
- Banco sem tabelas: rode `docker compose up -d db` e `docker compose run --rm api-tools npm run prisma:migrate`.
- Dados iniciais ausentes: rode `docker compose run --rm api-tools npm run prisma:seed`.
- Reset local do banco: use `docker compose down -v` apenas se puder apagar os dados locais.

## Limitacoes Do MVP

- Nao ha autenticacao, perfis, auditoria ou historico completo de status.
- Qualquer pessoa com acesso interno ao sistema pode alterar cadastros e status.
- Nao ha notificacoes automaticas, integracao com monitoramento ou chamados.
- O status e unico por item; nao ha separacao por ambiente.
- A busca principal nao pesquisa por responsaveis ou contatos.

## Proximos Passos

- Autenticacao corporativa e perfis de acesso.
- Auditoria completa de alteracoes e identificacao do autor.
- Integracao com monitoramento/chamados e notificacoes de previsao vencida.
- Busca por responsavel, equipe e contato se houver demanda.
- Testes end-to-end de navegador para os fluxos mais usados.

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
- TASK 12: painel operacional com busca por sigla/nome/descricao com debounce e cancelamento de requisicoes anteriores, filtros preservados na URL, cards responsivos por criticidade, contatos agrupados por papel com acao de copiar, status com texto/cor/indicador visual, previsao vencida, paginacao e estados de carregamento/vazio/erro.
- TASK 13: alteracao rapida de status no painel com formulario compacto por card, opcoes `OK`, `Instavel` e `Parado`, motivo/previsao opcionais, confirmacao de alteracao, alerta adicional ao limpar previsao retornando para `OK`, bloqueio por card durante salvamento, mensagem de sucesso/erro e atualizacao local com a resposta da API.
- TASK 14: validacao final do MVP com teste de integracao do fluxo responsavel-item-vinculo-busca-status, checks de backend/frontend, validacao de migrations, seed, subida Docker Compose, health, proxy web/API e Swagger, alem de README completo com execucao, variaveis, testes, troubleshooting, limitacoes e proximos passos.
- Status: MVP concluido conforme escopo definido.
