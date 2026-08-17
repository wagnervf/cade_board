# Task — Ajustar a tela de Itens para corresponder ao layout aprovado

## Contexto

A primeira implementação da nova tela `/itens` está funcional, porém ainda está visualmente diferente do mockup aprovado.

A tela atual usa predominantemente azul-petróleo e mantém os cards com uma composição muito próxima da versão anterior. O resultado esperado é o apresentado na imagem de referência: identidade azul mais viva, cards horizontais mais bem estruturados, ícones, separação visual das informações e ações alinhadas lado a lado.

## Objetivo

Atualizar somente o layout e os estilos da tela já implementada, aproximando-a fielmente da imagem de referência.

Preservar integralmente:

* criação e edição em modal;
* busca e filtros;
* dados retornados pela API;
* paginação;
* ativação e inativação;
* validações;
* endpoints;
* modelos;
* regras de negócio;
* responsividade existente.

Não refazer a implementação do zero.

## Restrições

* Não alterar backend ou contratos da API.
* Não adicionar bibliotecas, plugins ou dependências.
* Não apagar arquivos.
* Não hardcodar itens, totais ou páginas.
* Não alterar os valores reais apresentados.
* Reutilizar componentes, ícones, variáveis e estilos existentes.
* Não criar componentes genéricos desnecessários.
* Fazer alterações localizadas na tela de itens.
* Manter o código simples e compatível com o padrão atual do projeto.

## 1. Corrigir a identidade de cores

A principal diferença está no uso atual do azul-petróleo. Substituir essa cor, nesta tela, pelo azul vivo da referência.

Aplicar o azul primário em:

* texto `CATÁLOGO`;
* botão `Novo item`;
* botão `Buscar`;
* barra lateral dos cards ativos;
* ícones dos tipos de item;
* borda, texto e ícone do botão `Editar`;
* borda, texto e ícone do botão `Ativar`;
* página selecionada na paginação;
* estados de foco e interação.

Paleta visual aproximada:

* azul primário: `#1769E8`;
* azul no hover: `#0E55C7`;
* título principal: `#0C1B38`;
* texto secundário: `#59677D`;
* fundo da página: `#F6F8FB`;
* superfície: `#FFFFFF`;
* borda: `#DCE3EC`.

Antes de adicionar valores locais, verificar se o projeto já possui tokens visualmente equivalentes. Reutilizá-los quando possível.

Não manter azul-petróleo nos botões principais ou na barra lateral dos cards.

## 2. Cabeçalho

Manter:

* categoria `CATÁLOGO`;
* título `Itens`;
* descrição da página;
* botão `+ Novo item`.

Ajustar para a referência:

* título com maior presença visual e cor azul-marinho;
* categoria em azul primário;
* botão `Novo item` maior, azul vivo e com ícone de adição;
* espaçamento vertical mais generoso;
* alinhamento do botão à direita.

O botão não deve utilizar azul-petróleo.

## 3. Painel de busca

Manter os filtros e a semântica atualmente suportados pela API.

Não trocar `Status operacional` por `Situação cadastral` se o filtro existente realmente consultar `OK`, `Instável` e `Parado`.

Alterações visuais:

* adicionar ícone de lupa dentro do campo, usando o conjunto de ícones existente;
* retirar o rótulo visual redundante `Buscar` acima do campo;
* manter label acessível com `aria-label` ou solução equivalente;
* aumentar o espaço destinado à busca;
* usar bordas claras e foco azul;
* deixar `Buscar` como botão azul primário;
* transformar `Limpar filtros` em ação visualmente mais leve, preferencialmente link ou botão sem destaque;
* aumentar o espaçamento interno do painel;
* manter o contador de resultados abaixo dos filtros e em semibold.

A linha dos filtros deve se aproximar da referência:

1. busca;
2. tipo;
3. status operacional;
4. botão `Buscar`;
5. ação `Limpar filtros`.

## 4. Reestruturar os cards

Os cards atuais ainda concentram o conteúdo à esquerda e empilham as ações. Alterar para a composição horizontal da referência.

No desktop, cada card deve possuir estas áreas:

1. ícone do tipo;
2. identificação e descrição;
3. badges;
4. responsáveis;
5. ações.

Usar CSS Grid ou Flexbox de forma responsiva, evitando larguras rígidas que quebrem com nomes longos.

### Ícone do tipo

Adicionar um círculo com fundo azul muito claro e um ícone correspondente:

* Sistema: monitor;
* Projeto: pasta;
* Serviço de infraestrutura: escudo ou ícone equivalente.

Usar exclusivamente o conjunto de ícones já disponível no projeto. Não instalar biblioteca.

Para item inativo:

* círculo em cinza muito claro;
* ícone cinza.

Se não existir um ícone exatamente correspondente, utilizar o mais próximo disponível.

### Identificação

Apresentar:

* `SIGLA — Nome` em destaque;
* tipo abaixo, em texto secundário;
* descrição em uma linha inferior.

Manter boa legibilidade e evitar que títulos longos invadam badges, responsáveis ou ações.

### Responsáveis

Substituir o texto corrido:

`Técnicos: 2 · Gerenciais: 1`

por dois blocos visuais:

* ícone de pessoa + `2 técnicos`;
* ícone de grupo + `1 gerencial`.

Separar os blocos com linhas verticais discretas, conforme a referência.

Tratar corretamente singular e plural.

Quando não houver vínculos, exibir:

`Sem responsáveis vinculados`

Não alterar os valores retornados pela aplicação.

## 5. Badges

Manter status operacional e situação cadastral como conceitos diferentes.

Cores:

* `OK`: fundo verde suave e texto verde escuro;
* `Instável`: fundo amarelo/âmbar suave;
* `Parado`: fundo vermelho suave;
* `Ativo`: fundo verde suave;
* `Inativo`: fundo cinza claro com borda.

Os badges devem ter:

* altura consistente;
* formato arredondado;
* padding horizontal confortável;
* texto legível;
* cores suaves, sem saturação excessiva.

Para itens inativos, o badge `Inativo` deve ser o principal indicador visual. Caso o status operacional continue sendo exibido por requisito, deixá-lo com menor destaque para não competir com a inatividade cadastral.

## 6. Diferenciação dos cards

### Item ativo

Aplicar:

* fundo branco;
* barra lateral azul viva;
* texto em contraste normal;
* ícone com fundo azul muito claro;
* sombra discreta;
* borda clara.

### Item inativo

Aplicar:

* fundo cinza muito claro;
* barra lateral cinza;
* ícone e textos secundários suavizados;
* badge `Inativo` cinza;
* contraste suficiente para leitura.

Não usar vermelho como cor principal do item inativo.

## 7. Ações

No desktop, os botões devem ficar lado a lado, nunca empilhados:

* `Editar`;
* `Inativar` ou `Ativar`.

### Editar

* ícone de lápis;
* borda azul;
* texto azul;
* fundo branco.

### Inativar

* ícone de energia ou equivalente;
* borda vermelha suave;
* texto vermelho;
* fundo branco.

### Ativar

* ícone de energia ou equivalente;
* borda azul;
* texto azul;
* fundo branco.

Manter dimensões consistentes e área de clique confortável.

Em telas menores, os botões podem quebrar para uma linha inferior ou ocupar larguras equivalentes. Não devem ficar estreitos ou desalinhados.

## 8. Altura e espaçamento dos cards

Reduzir a altura excessiva causada pelo empilhamento atual.

Os cards devem:

* manter padding interno consistente;
* ter menor altura no desktop;
* usar alinhamento vertical central;
* apresentar espaços claros entre identificação, badges, responsáveis e ações;
* possuir distância uniforme entre um card e outro.

Evitar grandes espaços vazios dentro dos cards.

## 9. Paginação

A paginação atual está solta diretamente sobre o fundo da página. Colocá-la dentro de um painel branco com:

* borda clara;
* sombra discreta;
* cantos arredondados;
* resumo à esquerda;
* controles à direita.

Formato do resumo:

`Página 1 de 1 · 3 registros`

Quando houver mais páginas, mostrar:

* `Anterior`;
* números das páginas;
* página atual com fundo azul;
* `Próxima`.

Não criar páginas fictícias. Os botões numéricos devem ser calculados com base nos dados reais da paginação.

Para uma única página, mostrar o botão `1` selecionado e manter `Anterior` e `Próxima` desabilitados, caso isso seja compatível com o componente existente.

## 10. Responsividade

No desktop:

* manter cards horizontais;
* manter ações lado a lado;
* distribuir badges e responsáveis em colunas;
* utilizar melhor a largura disponível.

No tablet e celular:

* permitir quebra organizada das áreas;
* manter identificação antes dos status;
* colocar responsáveis abaixo da descrição quando necessário;
* manter ações visíveis;
* evitar rolagem horizontal;
* garantir área de toque adequada.

## 11. Modal

Não alterar a lógica do modal de cadastro e edição já implementada.

Apenas verificar se ele também utiliza:

* azul vivo nas ações primárias;
* título azul-marinho;
* bordas claras;
* foco azul;
* botões coerentes com a nova identidade.

## Critérios de aceite

* Não há azul-petróleo nas ações primárias da tela.
* `Novo item` e `Buscar` usam o azul vivo da referência.
* Cards ativos possuem barra lateral azul.
* Cards inativos possuem fundo e barra lateral cinza.
* Cada tipo de item possui ícone visual, usando recursos existentes.
* Os responsáveis são apresentados em blocos com ícones.
* Os botões de ação ficam lado a lado no desktop.
* Os botões possuem ícones e cores coerentes.
* A paginação está dentro de um painel branco.
* A página atual aparece em azul quando aplicável.
* Os dados reais permanecem inalterados.
* Busca, filtros, modal, edição, ativação, inativação e paginação continuam funcionando.
* Nenhuma dependência foi adicionada.
* Não existe rolagem horizontal indevida.
* O resultado visual está claramente mais próximo da segunda imagem.

## Validação final

1. Comparar visualmente a implementação com a segunda imagem.
2. Testar item ativo e inativo.
3. Testar todos os status operacionais disponíveis.
4. Testar títulos e descrições longos.
5. Testar item sem responsáveis.
6. Testar desktop, tablet e celular.
7. Executar os comandos de lint, testes e build disponíveis.
8. Informar os arquivos alterados e os resultados das validações.

Priorizar fidelidade visual à segunda imagem, principalmente nas cores, estrutura horizontal dos cards, ícones, ações e paginação.
