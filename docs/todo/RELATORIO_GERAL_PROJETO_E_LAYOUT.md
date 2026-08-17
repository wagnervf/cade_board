# Relatório geral do projeto CADEBOARD

## 1. Visão geral

O CADEBOARD é um sistema web interno criado para apoiar equipes de atendimento de primeiro nível (N1). Sua função principal é centralizar informações sobre sistemas, projetos e serviços de infraestrutura, permitindo que o atendente encontre rapidamente:

- o item afetado ou consultado;
- seu estado operacional atual;
- o motivo de uma instabilidade ou parada;
- a previsão de retorno do serviço;
- os responsáveis técnicos e gerenciais;
- os canais de contato dessas pessoas ou equipes.

O projeto resolve um problema de consulta operacional: em vez de procurar informações dispersas em planilhas, documentos ou conversas, o atendente usa um painel único para identificar a situação de um serviço e saber quem deve ser acionado.

O MVP está concluído e funcional dentro do escopo definido. Ele foi pensado como uma aplicação interna simples, sem autenticação e sem integrações externas neste primeiro momento.

## 2. Público e contexto de uso

O usuário principal é o atendente N1, que precisa obter uma resposta rápida durante um atendimento. Para esse perfil, as informações mais importantes são:

1. qual item está sendo procurado;
2. se ele está operando normalmente;
3. se existe indisponibilidade ou instabilidade;
4. quando há previsão de normalização;
5. quem pode ser contatado.

Também existe um perfil de uso administrativo, mesmo sem perfis de acesso formais: pessoas que mantêm o catálogo, atualizam responsáveis, criam vínculos e alteram o estado operacional dos itens.

Assim, o sistema atende a duas necessidades diferentes:

- **consulta operacional**, que deve ser rápida, objetiva e orientada a incidentes;
- **manutenção de cadastros**, que exige formulários, filtros e ações de edição.

Essa diferença é importante para qualquer revisão futura do layout.

## 3. O que o sistema faz atualmente

### 3.1 Painel operacional

É a tela principal do produto e a rota inicial da aplicação. Ela permite:

- buscar itens por sigla, nome ou descrição;
- filtrar por tipo de item e status;
- combinar busca e filtros;
- manter os filtros na URL;
- consultar os resultados em cards;
- visualizar primeiro os itens mais críticos;
- alterar o status sem sair do painel;
- copiar telefone, e-mail ou canal de contato;
- abrir o cliente de e-mail quando o endereço estiver disponível;
- navegar pelos resultados com paginação.

Cada card apresenta:

- tipo, sigla, nome e descrição do item;
- status `OK`, `Instável` ou `Parado`;
- indicador textual e visual do status;
- data e hora da última mudança;
- motivo da situação atual, quando informado;
- previsão de retorno, quando informada;
- alerta de previsão vencida;
- responsáveis técnicos e gerenciais com seus contatos;
- ação para alterar rapidamente o status.

Ao editar o status, o card abre um formulário compacto com seleção do novo estado, motivo e previsão de retorno. A atualização acontece no próprio card, sem recarregar a aplicação inteira.

### 3.2 Gestão de itens

É a área administrativa do catálogo. Ela permite:

- criar e editar sistemas, projetos e serviços de infraestrutura;
- informar sigla, nome e descrição;
- buscar e filtrar itens por tipo e status;
- visualizar itens ativos e inativos;
- ativar ou inativar um cadastro sem apagá-lo;
- pesquisar responsáveis ativos;
- vincular responsáveis como técnicos ou gerenciais;
- remover vínculos sem excluir o cadastro do responsável.

No desktop, a tela é dividida em duas colunas: editor à esquerda e listagem à direita. Quando um item está em edição, a gestão de responsáveis aparece abaixo do formulário do item.

### 3.3 Gestão de responsáveis

É a área de manutenção dos contatos usados pelo catálogo. Ela permite:

- cadastrar e editar responsáveis;
- informar nome, telefone, e-mail e canal de contato;
- exigir pelo menos uma forma de contato;
- buscar responsáveis pelo nome;
- ativar ou inativar registros;
- navegar pela lista com paginação.

No desktop, a tela também utiliza duas colunas: formulário à esquerda e listagem à direita.

## 4. Estrutura de navegação atual

A navegação principal possui três destinos:

| Área | Finalidade | Rota |
| --- | --- | --- |
| Painel | Consulta operacional e alteração rápida de status | `/painel` |
| Itens | Cadastro e manutenção do catálogo | `/itens` |
| Responsáveis | Cadastro e manutenção de contatos | `/responsaveis` |

O cabeçalho é fixo no topo e contém a marca CADEBOARD e os três links. Em telas menores, o cabeçalho passa a ocupar mais altura e a navegação pode ser rolada horizontalmente.

Não existem, no MVP, dashboard de métricas, menu lateral, página de detalhes isolada, login, preferências do usuário ou controle de permissões.

## 5. Conteúdo e regras de negócio

O catálogo trabalha com três tipos de item:

- sistema;
- projeto;
- serviço de infraestrutura.

Cada item tem um único status operacional atual:

- **OK**: funcionamento normal;
- **Instável**: funcionamento com problemas;
- **Parado**: indisponível.

Itens também possuem sigla, nome, descrição, observação do status, previsão de retorno, data da última mudança e indicação de ativo ou inativo.

Os responsáveis são cadastros reutilizáveis. Uma mesma pessoa ou equipe pode estar ligada a vários itens e pode exercer papel técnico, gerencial ou ambos. O papel pertence ao vínculo com o item, não à pessoa.

A aplicação não apaga itens ou responsáveis nas ações comuns. Ela usa ativação e inativação para preservar os dados e os vínculos existentes.

## 6. Características do layout atual

### Identidade visual

A interface utiliza uma linguagem visual sóbria e institucional:

- fundo geral cinza muito claro;
- superfícies brancas;
- azul-petróleo como cor principal;
- amarelo para instabilidade;
- vermelho para parada, erro e previsão vencida;
- cantos levemente arredondados;
- sombras discretas;
- tipografia padrão Arial/Helvetica;
- espaçamento baseado em uma escala simples de 4 a 32 pixels.

A marca é apresentada por um quadrado azul com a letra `C` e o nome CADEBOARD. Não há um conjunto de ícones ou uma identidade gráfica mais desenvolvida.

### Estrutura visual

O conteúdo fica centralizado em uma área de até aproximadamente 1180 pixels. As páginas usam:

- título com uma pequena categoria acima, como “Operação”, “Catálogo” ou “Contatos”;
- painéis brancos com borda, sombra e espaçamento interno;
- botões primários, secundários e neutros;
- chips para estados;
- mensagens de sucesso e erro;
- estados de carregamento e lista vazia;
- paginação com ações “Anterior” e “Próxima”.

O painel operacional usa uma grade de cards responsivos. Cada card concentra identificação, descrição, situação, atualização de status, responsáveis e ações de contato.

As telas administrativas usam o padrão formulário + lista, lado a lado no desktop e empilhados em telas menores.

### Responsividade e acessibilidade já consideradas

A interface possui regras específicas para tablet e celular. Colunas são empilhadas, barras de ferramentas mudam de direção e grupos de botões passam a ocupar o espaço vertical.

Também há cuidados iniciais de acessibilidade:

- foco de teclado visível;
- estrutura semântica com cabeçalhos, seções e artigos;
- mensagens com papéis de status ou alerta;
- status comunicado por texto e indicador, não apenas por cor;
- rótulos associados aos campos;
- bloqueio visual e funcional durante salvamentos.

## 7. Pontos fortes atuais

- O objetivo do produto é fácil de entender.
- A navegação possui poucas opções e baixa curva de aprendizado.
- A busca principal ocupa posição de destaque.
- Os estados críticos possuem diferenciação visual clara.
- A alteração rápida de status evita navegação desnecessária.
- Os contatos aparecem diretamente no contexto do item.
- As telas tratam carregamento, erro, sucesso e ausência de resultados.
- A estrutura responsiva cobre os fluxos principais.
- O sistema evita depender apenas de cores para comunicar status.
- O frontend não depende de uma biblioteca visual pesada, o que dá liberdade para evoluir a identidade e os componentes.

## 8. Pontos de atenção para evolução do layout

### 8.1 Densidade dos cards do painel

Um card pode reunir descrição, três campos de status, formulário de edição, dois grupos de responsáveis e várias ações de contato. Com muitos responsáveis ou contatos, ele tende a ficar alto e visualmente denso.

Uma evolução pode separar informações essenciais e secundárias. Estado, previsão e contato prioritário devem ser lidos primeiro; detalhes e ações menos frequentes podem ficar em expansão, painel lateral ou visualização detalhada.

### 8.2 Hierarquia de informações

O painel já destaca o status, mas quase todas as seções internas usam peso visual semelhante. Há espaço para reforçar a sequência de leitura:

1. identidade do item;
2. gravidade do status;
3. motivo e previsão;
4. responsáveis principais;
5. detalhes adicionais e edição.

### 8.3 Mistura entre consulta e edição

A alteração de status dentro do card é útil, mas adiciona complexidade a uma tela de consulta. Pode ser interessante manter a ação rápida e abrir a edição em um popover, modal ou painel lateral, preservando o card em seu formato compacto.

### 8.4 Volume de ações de contato

Cada responsável pode exibir vários botões, como copiar telefone, abrir e-mail, copiar e-mail e copiar canal. Isso pode gerar repetição e ruído visual. Ícones com rótulos acessíveis, um menu contextual ou uma ação principal por tipo de contato podem simplificar a área.

### 8.5 Telas administrativas extensas

Na gestão de itens, o formulário, a gestão de vínculos e a lista convivem na mesma página. O fluxo funciona, mas pode ficar longo e exigir muito deslocamento, principalmente em notebooks e dispositivos móveis.

Alternativas para estudo:

- abrir cadastro e edição em painel lateral;
- separar dados do item e responsáveis em etapas ou abas;
- usar uma tabela responsiva na listagem administrativa;
- manter o formulário oculto até o usuário iniciar uma criação ou edição.

### 8.6 Consistência e reutilização visual

Botões, campos, feedbacks, paginação e estados de lista possuem estilos muito parecidos, mas estão definidos separadamente em cada tela. Criar componentes visuais compartilhados e um conjunto mais completo de tokens ajudaria a manter consistência durante um redesign.

### 8.7 Navegação mobile

O cabeçalho empilhado e a navegação horizontal funcionam, mas podem consumir espaço vertical. Vale avaliar uma barra de navegação compacta, um menu recolhível ou uma navegação inferior se o uso em celular for relevante.

### 8.8 Tipografia e identidade

A tipografia de sistema e o símbolo com a letra `C` atendem ao MVP, mas ainda transmitem uma identidade genérica. Uma revisão de tipografia, escala de títulos, iconografia e marca pode aumentar a legibilidade e a personalidade do produto sem comprometer seu caráter institucional.

### 8.9 Visão resumida da operação

O painel começa diretamente pela busca e pelos resultados. Caso seja útil para a rotina do N1, pode haver uma faixa compacta com totais de itens parados, instáveis e com previsão vencida. Essa inclusão só deve ser feita se apoiar decisões reais, para não transformar o painel em um dashboard decorativo.

## 9. Direção sugerida para um futuro redesign

Uma boa direção geral é manter o produto simples e operacional, organizando o redesign em três camadas:

### Camada 1 — leitura imediata

- busca global evidente;
- filtros fáceis de limpar;
- quantidade de resultados;
- destaque forte para itens parados, instáveis e atrasados;
- cards mais compactos, com status e previsão reconhecíveis rapidamente.

### Camada 2 — contexto para atendimento

- motivo da ocorrência;
- última atualização;
- contatos prioritários;
- acesso rápido a todos os responsáveis;
- ações de copiar ou iniciar contato.

### Camada 3 — manutenção

- alteração de status;
- edição cadastral;
- ativação e inativação;
- gestão de vínculos;
- confirmações e validações.

Essa separação reduz a competição visual entre consultar, contatar e administrar.

## 10. Sugestão de prioridade para melhorias visuais

| Prioridade | Melhoria | Resultado esperado |
| --- | --- | --- |
| Alta | Reduzir e reorganizar o conteúdo dos cards operacionais | Leitura mais rápida durante o atendimento |
| Alta | Reforçar hierarquia entre status, previsão, motivo e contatos | Melhor identificação da ação necessária |
| Alta | Revisar a experiência das ações de contato | Menos botões repetidos e menor ruído visual |
| Média | Separar melhor listagem e edição nas áreas administrativas | Fluxos mais claros e páginas menos extensas |
| Média | Consolidar componentes e tokens visuais compartilhados | Mais consistência e manutenção mais simples |
| Média | Revisar navegação e ações em telas pequenas | Melhor uso em celular e notebook |
| Baixa | Evoluir marca, tipografia e iconografia | Identidade visual mais própria |
| Condicional | Adicionar resumo numérico operacional | Visão rápida, se houver necessidade comprovada |

## 11. Arquitetura técnica resumida

O projeto é um monorepositório simples, com frontend e backend separados:

- **Frontend:** Angular 22, TypeScript, SCSS e componentes standalone;
- **Backend:** Node.js 24, NestJS 11 e TypeScript;
- **Banco de dados:** PostgreSQL 18;
- **Persistência:** Prisma ORM, migrations versionadas e seed inicial;
- **API:** REST com prefixo `/api/v1` e documentação Swagger;
- **Execução:** Docker Compose com serviços de banco, API e aplicação web;
- **Servidor web:** Nginx servindo o build do Angular e encaminhando chamadas para a API;
- **Testes:** testes unitários e de integração no backend e testes básicos no frontend.

As três entidades principais são:

- itens do catálogo;
- responsáveis;
- vínculos entre itens e responsáveis.

A API fornece busca, filtros e paginação no servidor. A ordenação operacional prioriza itens parados, depois instáveis e, por fim, itens em estado normal.

## 12. Limitações atuais do MVP

- não há login, perfis ou permissões;
- qualquer pessoa com acesso interno pode alterar dados;
- não há histórico completo de mudanças de status;
- não é registrado quem realizou uma alteração;
- não há notificações automáticas;
- não existem integrações com monitoramento ou chamados;
- o status não é separado por ambiente;
- a busca principal não pesquisa responsáveis ou contatos;
- não há aplicação móvel nativa;
- o frontend possui cobertura de testes menor que o backend;
- ainda não há testes de navegação ponta a ponta.

Essas limitações não impedem um redesign, mas algumas delas — especialmente autenticação, permissões e histórico — podem introduzir novas áreas e estados de interface no futuro.

## 13. Conclusão

O CADEBOARD é um catálogo operacional voltado à velocidade de consulta e ao acionamento de responsáveis. O MVP cobre o ciclo essencial: cadastrar contatos, cadastrar itens, relacionar responsáveis, localizar serviços, consultar sua situação e atualizar rapidamente o status.

O layout atual é funcional, responsivo e coerente com uma primeira versão. A oportunidade de evolução está menos em adicionar elementos e mais em organizar prioridades: deixar o painel mais compacto, tornar situações críticas ainda mais fáceis de reconhecer, reduzir a repetição de ações e separar com mais clareza os momentos de consulta e administração.

Antes de iniciar o redesign, é recomendável validar com usuários reais quais informações eles consultam primeiro, quais contatos acionam com maior frequência e em quais dispositivos trabalham. Essas respostas devem orientar os wireframes e evitar que a nova interface ganhe complexidade sem benefício operacional.
