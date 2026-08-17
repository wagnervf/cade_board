# Task — Ajustar os cards e separar a situação operacional no Painel

## Objetivo

Atualizar a implementação atual da rota `/painel` conforme o novo mockup aprovado.

Cada resultado deve ser composto por dois blocos relacionados:

1. card principal do item, à esquerda;
2. janela de situação operacional, à direita.

Também simplificar a apresentação dos responsáveis, mantendo no Painel apenas nome e Teams. Telefone, e-mail e demais informações devem permanecer disponíveis na tela de Responsáveis.

## Análise inicial

Antes de alterar:

1. Localize a implementação atual dos cards do Painel.
2. Identifique o bloco que apresenta:

   * status;
   * motivo;
   * última atualização;
   * previsão de retorno.
3. Identifique a apresentação de técnicos e gerenciais.
4. Analise a navegação atual para `/responsaveis`.
5. Preserve toda a lógica de busca, filtros, paginação e alteração de status.

Não reimplementar regras já existentes.

## Restrições

* Não alterar backend, endpoints ou contratos.
* Não modificar regras de negócio.
* Não instalar bibliotecas ou plugins.
* Não hardcodar dados.
* Não apagar componentes compartilhados.
* Não alterar as telas de Itens e Responsáveis.
* Não remover informações do cadastro de responsáveis.
* Remover telefone e e-mail apenas da apresentação resumida do Painel.
* Reutilizar os componentes, ícones, modais e estilos existentes.
* Manter o código simples e responsivo.

## 1. Estrutura de cada resultado

No desktop, cada item deve ocupar uma linha formada por duas colunas:

* aproximadamente 74% para o card principal;
* aproximadamente 26% para a janela de status;
* espaçamento entre os blocos de aproximadamente 16px.

Pode ser utilizada uma estrutura semelhante a:

* `minmax(0, 1fr)` para o card principal;
* `minmax(280px, 340px)` para a janela de status.

O card principal e a janela de status devem:

* começar na mesma altura;
* possuir a mesma altura visual na linha;
* utilizar `align-items: stretch`;
* manter bordas, sombras e raios coerentes;
* permanecer claramente relacionados.

Cada novo item deve iniciar uma nova linha completa.

## 2. Card principal

O card principal deve conter somente:

* ícone do tipo;
* tipo;
* sigla e nome;
* descrição;
* resumo dos responsáveis;
* ação `Ver responsáveis`.

Remover do card principal:

* badge `Parado`, `Instável` ou `OK`;
* botão `Alterar status`;
* faixa de ocorrência;
* última atualização;
* previsão de retorno;
* telefone;
* e-mail;
* botões de copiar contato.

Essas informações serão reposicionadas ou acessadas em outra tela.

Usar uma barra lateral azul no card principal, pois ele representa a identidade do item. As cores operacionais devem ficar concentradas na janela de status.

## 3. Resumo dos responsáveis

Criar uma área denominada `Responsáveis`.

No desktop, apresentar:

* `Técnicos (quantidade)` à esquerda;
* `Gerenciais (quantidade)` à direita.

Cada responsável deve apresentar apenas:

* iniciais;
* nome;
* Teams.

Exemplos:

* `Ana Souza — Teams: ana.souza`;
* `Carla Mendes — Teams: carla.mendes`.

Não apresentar no Painel:

* telefone;
* e-mail;
* botão para copiar telefone;
* botão para copiar e-mail;
* botão para abrir e-mail;
* demais informações detalhadas.

### Tratamento do Teams

Inspecionar como o Teams está representado nos dados atuais.

* Não derivar Teams a partir de telefone ou e-mail.
* Não alterar o valor recebido da API.
* Não apresentar outro dado como se fosse Teams.
* Quando não existir Teams identificável, exibir `Teams não informado`.

Se o campo atual for um canal genérico e não permitir distinguir Teams de outros canais com segurança, preservar a regra existente e documentar essa limitação no resumo final.

## 4. Botão “Ver responsáveis”

Adicionar no cabeçalho da área de responsáveis um botão secundário:

`Ver responsáveis`

Características:

* ícone de pessoas;
* contorno azul;
* mesma identidade dos botões secundários existentes;
* alinhamento à direita no desktop;
* área de clique confortável.

Ao clicar, navegar para:

`/responsaveis`

Utilizar `routerLink` ou o padrão de navegação já adotado.

Se a tela de Responsáveis já aceitar filtro por ID ou nome via query parameter, utilizar esse recurso. Caso não aceite, navegar apenas para `/responsaveis`.

Não criar um novo filtro ou contrato apenas para essa navegação.

## 5. Janela de status

Criar uma janela independente ao lado de cada card.

A janela deve conter exclusivamente:

* título `STATUS OPERACIONAL`;
* indicador do status atual;
* botão `Alterar status`;
* motivo ou situação normal;
* última atualização;
* previsão de retorno;
* aviso de previsão vencida, quando aplicável.

As informações devem continuar utilizando os dados reais do item.

## 6. Indicador e botão com as mesmas dimensões

O indicador de status e o botão `Alterar status` devem possuir exatamente:

* a mesma largura;
* a mesma altura;
* o mesmo raio de borda;
* o mesmo padding;
* o mesmo alinhamento interno.

Aplicar, por exemplo:

* `width: 100%`;
* `min-height: 44px`;
* `box-sizing: border-box`.

O indicador de status deve parecer um controle destacado, mas não deve ser um botão clicável.

Utilizar semântica apropriada, como:

* elemento não interativo;
* `role="status"`, se adequado;
* ícone e texto.

Não criar um botão falso sem ação.

## 7. Status Parado

Para item parado:

* borda ou detalhe lateral vermelho na janela;
* indicador com fundo vermelho suave;
* ícone de alerta;
* texto `Parado`.

Abaixo dos controles, apresentar:

* `OCORRÊNCIA ATUAL`;
* motivo;
* última atualização;
* previsão de retorno.

Quando não houver motivo:

`Motivo não informado`

Quando não houver previsão:

`Previsão não informada`

Quando a previsão estiver vencida:

* mostrar `Previsão vencida`;
* utilizar texto e cor vermelha;
* reutilizar a lógica existente.

## 8. Status Instável

Para item instável:

* detalhe âmbar;
* indicador âmbar suave;
* ícone de atenção;
* texto `Instável`.

Apresentar motivo, última atualização, previsão e eventual vencimento seguindo a mesma estrutura do status Parado.

## 9. Status OK

Para item normal:

* detalhe verde;
* indicador verde suave;
* ícone de confirmação;
* texto `OK`.

Abaixo, apresentar:

* `Funcionando normalmente`;
* última atualização.

Não apresentar ocorrência anterior como se estivesse ativa.

## 10. Alteração de status

Manter o comportamento já implementado.

Ao clicar em `Alterar status`:

* abrir o modal atual;
* preservar o item selecionado;
* manter as validações;
* salvar utilizando o endpoint existente;
* atualizar o card e a janela após sucesso;
* manter filtros e paginação;
* não recarregar a aplicação inteira.

O botão deve utilizar:

* fundo branco;
* contorno azul;
* ícone de atualização;
* texto azul;
* mesma dimensão do indicador acima.

## 11. Associação visual

O card e sua janela devem parecer parte do mesmo resultado.

Garantir:

* alinhamento vertical;
* alturas equivalentes;
* mesmo espaçamento externo;
* proximidade entre os blocos;
* status sempre ao lado do item correspondente;
* nenhuma possibilidade de confundir o status com o card seguinte.

A cor operacional deve aparecer prioritariamente na janela de status. O card principal permanece neutro, com detalhe azul.

## 12. Responsividade

### Desktop

* card e status lado a lado;
* status com largura suficiente para textos e datas;
* responsáveis técnicos e gerenciais em duas colunas.

### Tablet e celular

A partir do breakpoint adequado do projeto:

1. card principal;
2. janela de status;
3. próximo item.

A janela deve ficar imediatamente abaixo do card ao qual pertence.

Não permitir esta ordem:

1. todos os cards;
2. todas as janelas de status.

No mobile:

* responsáveis empilhados;
* botão `Ver responsáveis` pode ocupar uma nova linha;
* indicador e `Alterar status` continuam com dimensões iguais;
* não deve existir rolagem horizontal.

## 13. Paginação

Manter a paginação existente abaixo de todos os pares de cards.

Não posicionar a paginação somente sob a coluna principal.

Ela deve ocupar toda a largura da área de resultados.

## 14. Acessibilidade

Garantir:

* status comunicado por ícone, texto e cor;
* indicador de status não apresentado como botão clicável;
* botão `Alterar status` acessível por teclado;
* botão `Ver responsáveis` com nome acessível;
* foco visível;
* contraste adequado;
* ordem de leitura card → status;
* no mobile, status lido antes do próximo item.

## Critérios de aceite

* Cada item possui card principal à esquerda e janela de status à direita.
* A faixa de ocorrência não permanece dentro do card principal.
* Status, motivo, atualização e previsão aparecem na janela lateral.
* O indicador `Parado`, `Instável` ou `OK` possui as mesmas dimensões do botão `Alterar status`.
* O indicador de status não é clicável.
* O card apresenta somente nome e Teams dos responsáveis.
* Telefone e e-mail não aparecem no Painel.
* Ausência de Teams apresenta `Teams não informado`.
* Existe um botão `Ver responsáveis`.
* O botão direciona para `/responsaveis`.
* Técnicos e gerenciais continuam separados.
* A alteração de status continua funcionando.
* Previsão vencida continua sendo identificada.
* Busca, filtros, ordenação e paginação permanecem funcionando.
* Card e janela ficam empilhados corretamente em telas pequenas.
* Não existem dependências novas.
* Nenhum endpoint ou regra foi alterado.

## Validação final

1. Testar Parado, Instável e OK.
2. Testar item com e sem motivo.
3. Testar item com e sem previsão.
4. Testar previsão vencida.
5. Testar responsável com e sem Teams.
6. Confirmar que telefone e e-mail não aparecem no Painel.
7. Testar `Ver responsáveis`.
8. Testar `Alterar status`.
9. Confirmar igualdade visual entre indicador e botão.
10. Testar desktop, tablet e celular.
11. Executar lint, testes e build disponíveis.
12. Informar arquivos alterados, componentes reutilizados e resultados.
