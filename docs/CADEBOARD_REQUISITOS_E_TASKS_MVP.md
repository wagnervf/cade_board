# CADEBOARD — Requisitos e plano de implementação do MVP

## 1. Objetivo do produto

Criar um sistema interno simples e rápido para apoiar o atendimento N1, permitindo:

- localizar sistemas, projetos e serviços de infraestrutura por sigla, nome ou descrição;
- identificar rapidamente seus responsáveis técnicos e gerenciais e os respectivos contatos;
- visualizar o estado operacional de cada item;
- atualizar o status diretamente pelo painel, com motivo opcional e previsão de retorno;
- destacar itens cuja previsão de retorno já venceu.

O MVP não terá autenticação. Qualquer pessoa que consiga acessar o sistema interno poderá consultar e alterar os dados.

## 2. Decisões confirmadas

| Tema | Decisão do MVP |
| --- | --- |
| Tipos de item | Sistema, projeto e serviço de infraestrutura |
| Busca | Sigla, nome e descrição |
| Responsáveis | Cadastro único e reutilizável em vários itens |
| Quantidade | Vários responsáveis técnicos e gerenciais por item |
| Papel | Definido no vínculo entre o responsável e cada item |
| Contatos | Telefone, e-mail e canal de contato |
| Aplicação de status | Todos os tipos de item |
| Status possíveis | OK, Instável e Parado |
| Atualização | Rápida e feita no próprio painel |
| Complementos do status | Motivo/observação opcional e previsão de retorno opcional |
| Última mudança | Exibir data e hora da alteração |
| Previsão vencida | Manter o status e destacar visualmente que a previsão venceu |
| Histórico | Guardar apenas o status atual e os dados da última alteração |
| Permissão no MVP | Qualquer pessoa com acesso ao sistema interno pode alterar |

## 3. Escopo funcional do MVP

### 3.1 Catálogo de itens

Cada item deverá possuir:

- identificador;
- tipo: `SISTEMA`, `PROJETO` ou `SERVICO_INFRAESTRUTURA`;
- sigla;
- nome;
- descrição;
- status atual: `OK`, `INSTAVEL` ou `PARADO`;
- motivo ou observação do status, opcional;
- previsão de retorno, opcional;
- data e hora da última alteração de status;
- indicador de ativo/inativo para evitar exclusões físicas desnecessárias;
- datas de criação e atualização do cadastro.

Regras:

- sigla e nome são obrigatórios;
- a sigla deve ser normalizada para maiúsculas;
- o status inicial deve ser `OK`;
- status, motivo, previsão e horário da alteração representam somente a situação atual;
- não criar tabela de histórico de status no MVP;
- ao alterar o status, atualizar a data/hora da última alteração no servidor;
- quando o status voltar para `OK`, remover a previsão de retorno anterior;
- a previsão é considerada vencida quando for anterior ao horário atual e o status não for `OK`;
- o vencimento deve ser calculado na consulta ou na interface, sem tarefa agendada.

### 3.2 Cadastro de responsáveis

Cada responsável deverá possuir:

- identificador;
- nome;
- telefone, opcional;
- e-mail, opcional;
- canal de contato, opcional;
- indicador de ativo/inativo;
- datas de criação e atualização.

Regras:

- o nome é obrigatório;
- exigir ao menos uma forma de contato entre telefone, e-mail e canal de contato;
- validar o formato do e-mail quando informado;
- o mesmo cadastro poderá ser associado a vários itens;
- inativar um responsável não deve apagar vínculos já existentes.

### 3.3 Vínculo entre item e responsável

O vínculo deverá registrar:

- item;
- responsável;
- papel no item: `TECNICO` ou `GERENCIAL`.

Regras:

- um item poderá ter vários vínculos técnicos e gerenciais;
- o papel pertence ao vínculo, não ao cadastro do responsável;
- impedir vínculo duplicado com a mesma combinação de item, responsável e papel;
- a estrutura deve permitir que a mesma pessoa exerça os dois papéis no mesmo item por meio de dois vínculos distintos;
- a remoção de um vínculo não deve excluir o responsável.

### 3.4 Busca e consulta

- disponibilizar uma busca textual principal no topo do painel;
- pesquisar de forma parcial e sem diferenciar maiúsculas de minúsculas em sigla, nome e descrição;
- permitir filtros por tipo e status;
- combinar busca e filtros;
- ordenar resultados, por padrão, priorizando `PARADO`, depois `INSTAVEL` e depois `OK`; dentro de cada grupo, ordenar por sigla/nome;
- usar paginação no servidor;
- apresentar estado vazio, carregamento e erro de forma clara;
- não incluir busca por nome de responsável ou contato no MVP.

### 3.5 Painel operacional

Cada card deve exibir:

- sigla e nome;
- tipo do item;
- status com texto, cor e ícone;
- motivo/observação, quando preenchido;
- data e hora da última alteração;
- previsão de retorno, quando preenchida;
- destaque `Previsão vencida` quando aplicável;
- responsáveis separados em `Técnicos` e `Gerenciais`;
- telefone, e-mail e canal de contato com ação simples de copiar ou abrir quando aplicável.

Atualização rápida:

- disponibilizar a ação de status no próprio card;
- abrir um formulário compacto com as três opções de status, motivo e previsão de retorno;
- manter os dados atuais preenchidos ao editar;
- salvar sem navegar para outra página;
- atualizar o card após o sucesso, sem recarregar toda a aplicação;
- bloquear envios repetidos durante a requisição;
- exibir confirmação de sucesso ou mensagem de erro útil.

A cor não pode ser o único meio de comunicar o status. Sempre exibir também texto e ícone.

## 4. Fora do escopo do MVP

- login, usuários, perfis e permissões;
- histórico completo ou auditoria de alterações;
- identificação de quem realizou a mudança;
- notificações automáticas;
- integrações com monitoramento, chamados, e-mail ou mensageria;
- status separado por ambiente;
- retorno automático para `OK`;
- cadastro de equipes e substitutos;
- anexos;
- aplicativo móvel nativo.

## 5. Arquitetura proposta

### 5.1 Tecnologias

- Frontend: Angular 22, aplicação standalone, TypeScript e SCSS;
- Backend: Node.js 24 LTS, NestJS e TypeScript;
- Persistência: PostgreSQL 18;
- ORM e migrations: Prisma;
- Documentação da API: OpenAPI/Swagger gerado pelo backend;
- Containers: Docker e Docker Compose;
- Testes: Jest no backend e framework padrão configurado pelo Angular no frontend;
- Interface: CSS responsivo e componentes simples; evitar bibliotecas sem necessidade real.

Fixar versões compatíveis nos arquivos do projeto e nas imagens Docker. Não usar tags `latest`.

### 5.2 Organização do repositório

```text
cadeboard/
├── backend/
├── frontend/
├── docker-compose.yml
├── .env.example
├── .gitignore
├── README.md
└── docs/
```

Manter frontend e backend separados, mas no mesmo repositório. Não criar microserviços para este MVP.

### 5.3 Modelo de dados

Tabelas principais:

- `catalog_items`;
- `responsibles`;
- `item_responsibilities`.

Restrições importantes:

- chave primária UUID;
- `catalog_items.acronym` único, ignorando diferença entre maiúsculas e minúsculas;
- chave única em `item_responsibilities(item_id, responsible_id, role)`;
- chaves estrangeiras com exclusão restrita para evitar perda acidental;
- datas armazenadas em UTC e convertidas para o fuso do navegador na exibição;
- migrations versionadas no Git.

Para o volume inicial, implementar a busca com `ILIKE` e paginação. Avaliar índice trigram somente se medições reais demonstrarem necessidade.

### 5.4 API inicial

Base: `/api/v1`.

Itens:

- `GET /items` — busca, filtros, ordenação e paginação;
- `GET /items/:id` — detalhamento com responsáveis;
- `POST /items` — inclusão;
- `PUT /items/:id` — atualização cadastral;
- `PATCH /items/:id/status` — atualização rápida do status;
- `PATCH /items/:id/active` — ativação/inativação.

Responsáveis:

- `GET /responsibles` — listagem e busca por nome;
- `GET /responsibles/:id` — detalhamento;
- `POST /responsibles` — inclusão;
- `PUT /responsibles/:id` — atualização;
- `PATCH /responsibles/:id/active` — ativação/inativação.

Vínculos:

- `POST /items/:itemId/responsibilities` — associar responsável e papel;
- `DELETE /items/:itemId/responsibilities/:relationshipId` — remover vínculo.

Parâmetros mínimos da listagem de itens:

- `search`;
- `type`;
- `status`;
- `page`, iniciando em 1 na interface pública da API;
- `pageSize`, com padrão 20 e limite máximo 100.

Formato padronizado de lista:

```json
{
  "data": [],
  "page": 1,
  "pageSize": 20,
  "totalItems": 0,
  "totalPages": 0
}
```

Erros devem usar um formato único com código HTTP, identificador do erro, mensagem legível e detalhes de validação quando existirem.

## 6. Tasks para execução pelo Codex

Executar as tasks na ordem indicada. Cada task deve gerar uma alteração pequena, verificável e adequada para um commit próprio.

### TASK 01 — Inicializar Git e estrutura do projeto

Objetivo: criar a base vazia e versionável do CADEBOARD.

Implementar:

1. criar a estrutura raiz com `backend`, `frontend` e `docs`;
2. inicializar o Git com branch principal `main`, caso o repositório ainda não exista;
3. criar `.gitignore` para Node, Angular, variáveis locais, cobertura, builds e arquivos de IDE;
4. criar `.editorconfig` e regras básicas de formatação;
5. criar `.env.example` sem segredos;
6. criar README com pré-requisitos, arquitetura resumida e comandos previstos;
7. não configurar repositório remoto nem publicar código.

Critérios de aceite:

- nenhum segredo ou `.env` real é versionado;
- a estrutura inicial está documentada;
- o repositório está limpo após o commit inicial.

### TASK 02 — Estruturar Docker Compose

Objetivo: subir banco, backend e frontend de forma reproduzível.

Implementar:

1. criar Dockerfile multi-stage para backend;
2. criar Dockerfile multi-stage para frontend, servindo o build estático por Nginx;
3. criar `docker-compose.yml` com serviços `db`, `api` e `web`;
4. usar volume nomeado para o PostgreSQL;
5. adicionar healthchecks e dependências condicionadas à saúde;
6. expor apenas as portas necessárias;
7. configurar variáveis por `.env`, mantendo exemplos no `.env.example`;
8. adicionar `.dockerignore` em frontend e backend;
9. documentar os comandos `build`, `up`, `down`, logs e reset controlado do banco.

Critérios de aceite:

- `docker compose config` é válido;
- os três serviços iniciam sem intervenção manual;
- a API só inicia sua operação após o banco estar saudável;
- nenhuma imagem usa `latest`.

### TASK 03 — Criar a base do backend

Objetivo: disponibilizar uma API Node organizada, testável e observável.

Implementar:

1. iniciar NestJS em `backend` com TypeScript estrito;
2. configurar variáveis de ambiente validadas na inicialização;
3. criar prefixo `/api/v1`;
4. configurar validação global de DTOs e remoção/rejeição de propriedades desconhecidas;
5. criar filtro padronizado de exceções;
6. criar endpoint de saúde;
7. configurar CORS apenas para a origem do frontend informada por ambiente;
8. configurar Swagger/OpenAPI;
9. adicionar scripts de lint, test, build e start;
10. criar teste do endpoint de saúde.

Critérios de aceite:

- a aplicação falha cedo quando uma variável obrigatória está ausente;
- a documentação da API abre no ambiente de desenvolvimento;
- lint, testes e build passam.

### TASK 04 — Modelar PostgreSQL e migrations

Objetivo: criar o esquema persistente do MVP.

Implementar:

1. configurar Prisma e conexão com PostgreSQL;
2. criar enums de tipo, status e papel;
3. criar as tabelas e restrições definidas neste documento;
4. criar a primeira migration;
5. criar seed pequeno e realista com ao menos um item de cada tipo e responsáveis técnicos/gerenciais;
6. documentar migration e seed;
7. não usar sincronização automática destrutiva de schema em produção.

Critérios de aceite:

- banco vazio é criado apenas pelas migrations;
- executar o seed duas vezes não duplica registros;
- restrições de unicidade e relacionamentos possuem testes de integração.

### TASK 05 — Implementar responsáveis no backend

Objetivo: permitir cadastro único e reutilizável de contatos.

Implementar:

1. módulo, controller, service, DTOs e acesso ao repositório;
2. endpoints de listagem, detalhe, inclusão, atualização e ativação/inativação;
3. busca parcial por nome e paginação;
4. validações de nome, e-mail e existência de ao menos um contato;
5. impedir exclusão física via API;
6. testes unitários das regras e testes de integração dos endpoints.

Critérios de aceite:

- um responsável pode ser reutilizado em vários itens;
- dados inválidos retornam `400` com mensagem útil;
- registros inexistentes retornam `404`.

### TASK 06 — Implementar catálogo e busca no backend

Objetivo: cadastrar e localizar rapidamente os itens do CADEBOARD.

Implementar:

1. módulo, controller, service, DTOs e acesso ao repositório;
2. CRUD cadastral sem exclusão física;
3. busca combinada em sigla, nome e descrição com `ILIKE`;
4. filtros por tipo e status;
5. paginação e ordenação definidas neste documento;
6. retorno dos responsáveis agrupados por papel na consulta de detalhe;
7. evitar consultas N+1;
8. testes unitários e de integração, incluindo combinações de busca e filtros.

Critérios de aceite:

- buscar `CGTI`, `cgti` ou parte do nome encontra o mesmo item;
- filtros podem ser combinados;
- metadados de paginação correspondem aos resultados;
- itens inativos não aparecem por padrão.

### TASK 07 — Implementar vínculos de responsabilidade

Objetivo: associar vários responsáveis técnicos e gerenciais a cada item.

Implementar:

1. endpoint de criação do vínculo;
2. endpoint de remoção do vínculo;
3. validar existência e situação ativa de item e responsável ao criar;
4. impedir duplicidade da combinação item, responsável e papel;
5. preservar o cadastro do responsável ao remover o vínculo;
6. testes das regras de vínculo.

Critérios de aceite:

- uma pessoa pode ser técnica em um item e gerencial em outro;
- uma pessoa pode possuir os dois papéis no mesmo item;
- vínculo duplicado retorna conflito controlado.

### TASK 08 — Implementar atualização de status no backend

Objetivo: alterar rapidamente a situação atual sem criar histórico completo.

Implementar:

1. criar `PATCH /items/:id/status`;
2. aceitar status, motivo/observação opcional e previsão de retorno opcional;
3. definir `statusUpdatedAt` exclusivamente no servidor;
4. limpar a previsão de retorno ao mudar para `OK`;
5. retornar o item atualizado;
6. expor campo calculado `returnOverdue` nas consultas;
7. não criar tabela ou registros de histórico;
8. testar transições, datas e cálculo de vencimento.

Critérios de aceite:

- cada mudança substitui os dados da última alteração;
- não existe retorno automático para `OK`;
- previsão vencida continua com o status atual e retorna `returnOverdue: true`.

### TASK 09 — Criar a base do frontend Angular

Objetivo: preparar uma interface moderna, simples e responsiva.

Implementar:

1. iniciar Angular standalone em `frontend`, com routing e SCSS;
2. configurar ambientes e URL da API;
3. criar layout principal com cabeçalho e área de conteúdo;
4. definir tokens CSS mínimos de cor, espaçamento, tipografia, borda e sombra;
5. criar tratamento global de erro HTTP e feedback de requisição;
6. configurar scripts de lint, test e build;
7. evitar dependências visuais desnecessárias;
8. criar rotas lazy: `/painel`, `/itens` e `/responsaveis`.

Critérios de aceite:

- layout funciona em desktop e celular;
- build de produção passa;
- navegação direta pelas rotas funciona no container Nginx.

### TASK 10 — Implementar gestão de responsáveis no frontend

Objetivo: permitir manter os contatos usados pelos itens.

Implementar:

1. tela de listagem com busca e paginação;
2. formulário de inclusão e edição;
3. ativação/inativação com confirmação;
4. validações equivalentes às do backend;
5. feedback de carregamento, vazio, erro e sucesso;
6. reutilizar os componentes e estilos já criados no projeto, sem abstrações prematuras.

Critérios de aceite:

- é possível cadastrar, editar, localizar e inativar um responsável;
- erros de validação aparecem próximos aos campos;
- o formulário impede envios repetidos.

### TASK 11 — Implementar gestão dos itens no frontend

Objetivo: manter sistemas, projetos e serviços e seus vínculos.

Implementar:

1. listagem administrativa dos itens;
2. formulário de inclusão e edição;
3. seletor pesquisável de responsáveis existentes;
4. associação e remoção de papéis técnico e gerencial;
5. separação visual clara entre os dois papéis;
6. ativação/inativação com confirmação;
7. feedback completo de interface.

Critérios de aceite:

- um item pode ter vários responsáveis por papel;
- duplicidades são impedidas na interface e validadas pelo backend;
- editar vínculos não cria novos cadastros de responsável.

### TASK 12 — Implementar painel operacional e busca

Objetivo: entregar a principal experiência de consulta do N1.

Implementar:

1. campo de busca em destaque, com debounce curto e cancelamento de requisições anteriores;
2. filtros de tipo e status, com ação de limpar;
3. cards responsivos ordenados pela criticidade;
4. exibição dos responsáveis e contatos agrupados por papel;
5. ações de copiar contato com retorno visual;
6. status sempre representado por texto, cor e ícone;
7. motivo, última alteração e previsão de retorno;
8. destaque para previsão vencida;
9. paginação no servidor;
10. preservar busca e filtros na URL para permitir recarregar ou compartilhar a consulta;
11. estados de carregamento, vazio e erro sem apagar resultados anteriores desnecessariamente.

Critérios de aceite:

- a busca encontra por sigla, nome e descrição;
- filtros combinados atualizam os resultados corretamente;
- busca e filtros são recuperados ao recarregar a página;
- a interface é utilizável apenas com teclado e possui foco visível.

### TASK 13 — Implementar alteração rápida de status no painel

Objetivo: permitir que a Infra atualize o estado sem sair do painel.

Implementar:

1. ação de status diretamente no card;
2. formulário compacto com `OK`, `Instável` e `Parado`;
3. campos opcionais de motivo e previsão;
4. confirmação da alteração;
5. atualização local do card com a resposta da API;
6. tratamento de concorrência simples: enquanto salva, desabilitar nova ação naquele card;
7. mensagem de sucesso e erro;
8. confirmação adicional apenas quando a ação puder apagar a previsão anterior ao retornar para `OK`.

Critérios de aceite:

- a atualização ocorre sem mudar de rota;
- horário exibido vem da resposta do backend;
- mudar para `OK` remove a previsão anterior;
- falha na API preserva os dados que estavam visíveis.

### TASK 14 — Testes integrados, documentação e encerramento do MVP

Objetivo: validar o fluxo completo e deixar o projeto executável por outra pessoa.

Implementar:

1. testar o fluxo cadastro de responsável → cadastro de item → vínculo → busca → alteração de status;
2. testar status OK, Instável, Parado e previsão vencida;
3. testar paginação, busca sem resultado e filtros combinados;
4. executar lint, testes e builds de frontend e backend;
5. validar subida limpa pelo Docker Compose;
6. atualizar README com instalação, variáveis, migrations, seed, testes e solução de problemas comuns;
7. documentar limitações do MVP e próximos passos;
8. não adicionar funcionalidades além das definidas neste documento.

Critérios de aceite:

- uma pessoa com Docker consegue executar o projeto seguindo apenas o README;
- todos os checks documentados passam;
- Swagger reflete os endpoints implementados;
- o MVP atende aos cenários de aceite abaixo.

## 7. Cenários de aceite do produto

### Cenário 1 — Direcionar um chamado

1. o atendente abre o painel;
2. digita parte da sigla, nome ou descrição;
3. visualiza o item correto;
4. identifica responsáveis técnicos e gerenciais;
5. copia ou abre um dos contatos disponíveis.

Resultado esperado: o responsável é localizado sem consultar anotações externas.

### Cenário 2 — Comunicar indisponibilidade

1. a Infra localiza o item;
2. altera o status para `Parado` no próprio card;
3. informa motivo e previsão de retorno;
4. salva a alteração.

Resultado esperado: o card passa a indicar `Parado`, exibe o motivo, a previsão e o horário da mudança.

### Cenário 3 — Previsão vencida

1. um item está `Instável` ou `Parado`;
2. a previsão de retorno passa sem nova atualização.

Resultado esperado: o status não muda automaticamente e o card exibe `Previsão vencida`.

### Cenário 4 — Recuperação

1. a Infra altera o item para `OK`;
2. confirma a mudança.

Resultado esperado: a previsão anterior é removida e o novo horário de alteração é exibido.

## 8. Diretrizes obrigatórias para o Codex

- analisar o estado atual do repositório antes de cada alteração;
- respeitar o escopo e a ordem das tasks;
- não apagar arquivos ou alterações existentes sem necessidade comprovada;
- produzir código simples, legível, tipado e testável;
- evitar classes, camadas, componentes e dependências sem uso concreto;
- centralizar regras de negócio no backend, sem duplicar decisões críticas apenas no frontend;
- não confiar em validação exclusiva da interface;
- usar nomes coerentes e evitar abreviações obscuras;
- criar migrations para toda mudança de banco;
- nunca versionar credenciais;
- executar e registrar os comandos de validação ao concluir cada task;
- informar arquivos alterados, testes executados, resultados e qualquer limitação encontrada;
- não implementar autenticação ou histórico completo no MVP.

## 9. Riscos e evolução futura

O MVP sem autenticação só é aceitável em rede interna controlada. O backend não terá como identificar autor, limitar alterações ou oferecer auditoria. Antes de exposição fora desse ambiente, priorizar:

1. autenticação corporativa;
2. perfis de consulta, manutenção e Infra;
3. auditoria completa de alterações;
4. controle de concorrência por versão do registro;
5. integração com monitoramento para atualização automática;
6. notificações quando uma previsão vencer;
7. busca também por responsáveis, equipes e contatos, se houver demanda medida.

## 10. Ordem recomendada de entrega

1. Fundação: TASK 01 e TASK 02.
2. Backend: TASK 03 a TASK 08.
3. Frontend: TASK 09 a TASK 13.
4. Validação: TASK 14.

Não iniciar o frontend antes de estabilizar o contrato OpenAPI dos endpoints essenciais. O Swagger deve ser a referência entre as duas camadas.
