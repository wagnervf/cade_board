# Task — Refatorar o layout da tela de Responsáveis

## Objetivo

Atualizar o layout da tela vinculada à rota `/responsaveis`, seguindo o mesmo padrão visual já aprovado e implementado na tela de Itens.

A nova tela deve:

* aproveitar toda a largura disponível;
* facilitar a localização dos responsáveis;
* permitir leitura rápida dos contatos;
* diferenciar claramente ativos e inativos;
* oferecer acesso imediato às ações;
* mover cadastro e edição para modal.

## Análise inicial obrigatória

Antes de alterar o código:

1. Localize os componentes, templates e estilos da rota `/responsaveis`.
2. Analise a implementação final da tela de Itens.
3. Reutilize da tela de Itens:

   * cores;
   * tokens;
   * estrutura do cabeçalho;
   * painel de busca;
   * cards;
   * badges;
   * botões;
   * modal;
   * paginação;
   * estados responsivos.
4. Analise a lógica atual de:

   * cadastro;
   * edição;
   * busca;
   * paginação;
   * ativação e inativação;
   * validação das formas de contato.

O resultado deve parecer parte do mesmo sistema visual da tela de Itens.

## Restrições

* Não alterar backend, endpoints ou contratos da API.
* Não modificar regras de negócio.
* Não adicionar bibliotecas, plugins ou dependências.
* Não apagar arquivos.
* Não hardcodar responsáveis, iniciais, totais ou páginas.
* Não criar filtros sem suporte na implementação atual.
* Não criar componentes genéricos desnecessários.
* Não duplicar estilos que já possam ser reutilizados da tela de Itens.
* Preservar a regra que exige pelo menos uma forma de contato.
* Manter o código simples, legível e testável.

## 1. Cabeçalho

Apresentar:

* categoria `CONTATOS`;
* título `Responsáveis`;
* descrição `Cadastre e mantenha responsáveis e seus canais de contato.`;
* botão primário `+ Novo responsável`.

Seguir exatamente o padrão da tela de Itens:

* categoria em azul vivo;
* título em azul-marinho;
* descrição em cinza azulado;
* botão primário azul;
* mesmos tamanhos, espaçamentos, bordas e estados de interação.

## 2. Cadastro em modal

Remover o formulário “Novo responsável” da lateral da página.

Ao clicar em `Novo responsável`, abrir um modal utilizando o mesmo padrão adotado na tela de Itens.

O modal deve conter os campos atuais:

* Nome;
* Telefone;
* E-mail;
* Canal de contato.

Ações:

* `Cancelar`;
* `Cadastrar responsável`.

Manter:

* validações atuais;
* exigência de pelo menos uma forma de contato;
* mensagens de erro;
* estado de salvamento;
* bloqueio contra envio duplicado;
* atualização da listagem após o cadastro.

Em caso de erro, manter o modal aberto.

## 3. Edição

Reutilizar o mesmo formulário do cadastro.

Ao clicar em `Editar`:

* abrir o modal preenchido;
* usar o título `Editar responsável`;
* alterar a ação principal para `Salvar alterações`.

Não duplicar o formulário nem a lógica de validação.

## 4. Painel de busca

Criar um painel branco ocupando toda a largura disponível.

Apresentar:

* campo de busca com ícone de lupa;
* placeholder `Buscar por nome`;
* botão primário `Buscar`;
* ação secundária `Limpar filtros`;
* quantidade de resultados abaixo.

Exemplo:

`4 responsáveis encontrados`

Não adicionar filtro de situação cadastral se ele não estiver suportado pela lógica ou pela API atual.

O campo deve ocupar a maior parte da linha.

No mobile, campo e ações devem ser empilhados sem rolagem horizontal.

## 5. Cards dos responsáveis

Substituir a listagem atual por cards horizontais em largura total.

Cada card deve possuir cinco áreas:

1. identificação;
2. telefone;
3. e-mail;
4. canal de contato;
5. ações.

Usar CSS Grid ou Flexbox responsivo, evitando larguras fixas que prejudiquem e-mails ou nomes longos.

### Identificação

Apresentar:

* círculo com as iniciais;
* nome do responsável;
* badge `Ativo` ou `Inativo`.

As iniciais devem ser calculadas a partir do nome real:

* `Ana Souza` → `AS`;
* `Bruno Lima` → `BL`;
* `Equipe Infraestrutura` → `EI`.

Não hardcodar iniciais.

Para nomes com uma única palavra, usar a primeira letra ou a regra visual já existente no projeto.

### Contatos

Apresentar cada contato em uma área própria:

* ícone de telefone + rótulo `Telefone`;
* ícone de envelope + rótulo `E-mail`;
* ícone de mensagem + rótulo `Canal de contato`.

Abaixo de cada rótulo, mostrar o valor real.

Quando o campo não estiver preenchido, exibir:

`Não informado`

Não utilizar apenas `-`, pois isso dificulta a compreensão durante a consulta.

Os contatos devem ser separados por linhas verticais discretas no desktop.

E-mails longos não podem invadir outras colunas ou ações. Utilizar quebra controlada, truncamento acessível ou outra solução já adotada no projeto.

## 6. Ícones

Usar somente a biblioteca ou conjunto de ícones já existente.

Ícones esperados:

* lupa;
* telefone;
* envelope;
* mensagem ou canal;
* lápis;
* ativar/inativar;
* adição.

Não instalar uma nova biblioteca.

## 7. Responsável ativo

Aplicar:

* fundo branco;
* barra lateral azul;
* iniciais azuis;
* círculo com fundo azul muito claro;
* badge `Ativo` com fundo verde suave;
* contraste normal nos contatos.

Ações:

* `Editar`, com ícone de lápis e contorno azul;
* `Inativar`, com ícone de energia e contorno vermelho suave.

## 8. Responsável inativo

Aplicar:

* fundo cinza muito claro;
* barra lateral cinza;
* iniciais e círculo em tons neutros;
* textos secundários suavizados, mas legíveis;
* badge `Inativo` em cinza com borda.

Ações:

* `Editar`;
* `Ativar`, com ícone e contorno azul.

Não usar vermelho como cor principal do card inativo.

## 9. Ações

No desktop, manter os botões lado a lado e alinhados à direita:

* `Editar`;
* `Inativar` ou `Ativar`.

Os botões devem:

* possuir ícone e texto;
* ter dimensões consistentes;
* manter área de clique confortável;
* permanecer na mesma posição em todos os cards;
* usar os mesmos estilos da tela de Itens.

Preservar o comportamento atual de confirmação, se já existir.

No mobile, permitir que as ações ocupem uma linha inferior com larguras equilibradas.

## 10. Cores

Reutilizar a paleta da tela de Itens:

* azul primário aproximado: `#1769E8`;
* azul de hover aproximado: `#0E55C7`;
* títulos: `#0C1B38`;
* textos secundários: `#59677D`;
* fundo: `#F6F8FB`;
* superfícies: `#FFFFFF`;
* bordas: `#DCE3EC`;
* ativo: verde suave;
* inativo: cinza neutro;
* inativar: vermelho apenas na ação.

Preferir os tokens já implementados na tela de Itens. Não criar outra variação de azul para esta página.

## 11. Paginação

Utilizar o mesmo componente e padrão visual da tela de Itens.

Apresentar a paginação dentro de um painel branco com:

* resumo à esquerda;
* controles à direita;
* borda clara;
* sombra discreta;
* cantos arredondados.

Exemplo:

`Página 1 de 1 · 4 registros`

Controles:

* `Anterior`;
* números das páginas;
* `Próxima`.

Não criar páginas fictícias. Os números devem ser calculados pelos dados reais.

Quando existir apenas uma página:

* mostrar a página `1` selecionada;
* desabilitar `Anterior` e `Próxima`.

## 12. Responsividade

### Desktop

* cards horizontais;
* contatos distribuídos em colunas;
* linhas verticais separando informações;
* ações lado a lado.

### Tablet

* permitir reorganização dos contatos em duas colunas;
* manter identificação no início;
* manter ações visíveis.

### Celular

* empilhar identificação e contatos;
* remover separadores verticais quando necessário;
* manter os rótulos dos contatos;
* apresentar ações em uma linha inferior;
* evitar rolagem horizontal;
* garantir área adequada para toque.

## 13. Acessibilidade

Garantir:

* labels associados aos campos;
* nome acessível nos botões com ícones;
* foco visível;
* navegação por teclado;
* contraste adequado;
* estado informado por texto, não somente por cor;
* foco inicial no modal;
* devolução do foco ao botão que abriu o modal, quando suportado;
* informações de contato legíveis em diferentes ampliações.

## 14. Estados da tela

Preservar e adequar visualmente:

* carregamento;
* erro;
* sucesso;
* lista vazia;
* busca sem resultados;
* salvamento em andamento;
* botões desabilitados.

Quando a busca não retornar registros, apresentar mensagem clara e permitir limpar o filtro.

## Critérios de aceite

* O formulário lateral não aparece mais na página.
* `Novo responsável` abre o cadastro em modal.
* `Editar` abre o mesmo formulário preenchido.
* A listagem utiliza toda a largura disponível.
* A tela usa o mesmo azul e padrão visual da tela de Itens.
* Cada responsável possui iniciais calculadas dinamicamente.
* Telefone, e-mail e canal estão organizados em áreas distintas.
* Campos ausentes apresentam `Não informado`.
* Ativos e inativos são claramente diferenciados.
* Ações ficam lado a lado no desktop.
* A paginação segue o padrão da tela de Itens.
* Busca, cadastro, edição, ativação, inativação e paginação continuam funcionando.
* A validação de pelo menos uma forma de contato permanece funcionando.
* Nenhuma dependência foi adicionada.
* Não há rolagem horizontal indevida.

## Validação final

1. Testar cadastro com cada forma de contato individualmente.
2. Testar a validação sem nenhuma forma de contato.
3. Testar edição.
4. Testar ativação e inativação.
5. Testar busca e limpeza.
6. Testar responsável com nome, e-mail ou canal longo.
7. Testar campos de contato ausentes.
8. Testar desktop, tablet e celular.
9. Executar lint, testes e build disponíveis.
10. Informar arquivos alterados, componentes reutilizados e resultados das validações.
