# Massas de Noiva Pro — Especificação funcional e visual

**Estado:** especificação aprovada para orientar a implementação  
**Produto:** Massas de Noiva Pro  
**Idioma da interface:** português  
**Público:** confeiteiras

---

## 1. Objectivo do produto

Criar uma calculadora profissional de massas de noiva que permita calcular a quantidade de massa necessária para bolos individuais e bolos de vários andares, converter as receitas em listas de ingredientes completas e apresentar o método de preparo de cada tipo de massa.

A aplicação deve funcionar como calculadora e ficha de produção. A confeiteira escolhe a massa e as dimensões do bolo e recebe as quantidades necessárias para preparar toda a massa de uma só vez, além da distribuição por forma e das instruções de preparo.

## 2. Decisões visuais aprovadas

- Identidade visual: **ameixa**.
- Paleta principal: ameixa escuro, marfim e dourado discreto.
- Fundo predominantemente marfim, com áreas de destaque em ameixa.
- Botões principais em ameixa escuro; dourado reservado a pequenos detalhes.
- Tipografia elegante e legível, contraste forte, cartões limpos e espaçamento generoso.
- Aparência premium, profissional, simples e intuitiva.
- Responsivo para telemóvel e computador.
- Evitar aparência de folha Excel, excesso de números, ícones amadores e emojis decorativos.

## 3. Tipos de massa

A aplicação terá três receitas independentes:

1. Massa de noiva com álcool.
2. Massa de noiva sem álcool.
3. Massa de noiva com cerveja preta.

Cada tipo terá os seus próprios ingredientes, quantidades, rendimento, parâmetros de cálculo e método de preparo.

**Não criar uma área pública para as utilizadoras adicionarem, editarem ou substituírem receitas-base.** As receitas e os métodos serão configurados internamente pelo responsável da aplicação, a partir dos dados fornecidos pela proprietária do produto.

Até as receitas reais serem fornecidas e configuradas, não apresentar quantidades fictícias como se fossem resultados verdadeiros. Usar estados vazios ou dados claramente identificados como demonstração.

## 4. Dimensões disponíveis

### Diâmetros
Disponibilizar todos os diâmetros inteiros de **10 cm a 35 cm**, inclusive.

### Alturas
Disponibilizar as quatro alturas aprovadas:
- 10 cm
- 12 cm
- 15 cm
- 17 cm

A selecção de diâmetro e altura deve ser independente para cada forma/andar.

## 5. Ecrã inicial e percursos

O ecrã inicial deve apresentar duas acções principais:

- **Calcular bolo individual**
- **Calcular bolo de vários andares**

Em ambos os percursos, a utilizadora escolhe primeiro um dos três tipos de massa.

### 5.1 Bolo individual

A utilizadora escolhe:
- Tipo de massa.
- Diâmetro da forma (10–35 cm).
- Altura (10, 12, 15 ou 17 cm).

A aplicação apresenta a quantidade de massa crua necessária para a forma, a lista completa de ingredientes ajustada e o método de preparo da receita seleccionada.

### 5.2 Bolo de vários andares

A utilizadora pode:
- Adicionar e remover andares.
- Escolher o diâmetro de cada andar independentemente.
- Escolher a altura de cada andar independentemente.
- Visualizar a configuração completa antes de calcular.

Exemplo de configuração meramente ilustrativa:
- Andar 1: 22 cm × 15 cm.
- Andar 2: 14 cm × 12 cm.
- Andar 3: 10 cm × 10 cm.

A aplicação deve calcular:
- Quantidade de massa crua para cada forma individual.
- Quantidade total de massa crua para preparar toda a produção.
- Ingredientes necessários para bater a massa completa de uma só vez.
- Quantidades de ingredientes correspondentes a cada andar, quando a receita permitir essa decomposição.
- Lista consolidada dos ingredientes, somando as necessidades de todos os andares.

A confeiteira não deve ter de calcular ou preparar manualmente uma receita separada para cada andar. A prioridade é apresentar primeiro a receita total que deve pesar e bater para produzir o bolo completo.

## 6. Organização dos resultados

Depois de clicar em **Calcular**, apresentar os resultados em quatro secções ou separadores:

### A. Resumo
- Tipo de massa escolhido.
- Dimensões de cada forma/andar.
- Quantidade de massa crua por forma.
- Quantidade total de massa crua a preparar.
- Número de andares.

### B. Ingredientes — receita completa
- Lista consolidada com todos os ingredientes.
- Quantidade total de cada ingrediente necessária para preparar toda a massa de uma só vez.
- Unidades apropriadas: gramas, quilogramas e unidades (por exemplo, ovos).
- Esta secção deve aparecer em destaque, pois é a lista que a confeiteira utilizará para pesar os ingredientes antes de começar.

### C. Distribuição por andar
- Cada andar identificado pelo seu diâmetro e altura.
- Quantidade de massa crua a colocar em cada forma.
- Decomposição dos ingredientes por andar, quando tecnicamente suportada pelos dados da receita.
- Total geral, para conferência.

### D. Método de preparo
- Instruções completas e específicas do tipo de massa seleccionado.
- Passos numerados e apresentados numa ordem clara.
- Preparação prévia dos ingredientes e das formas.
- Ordem e técnica de incorporação dos ingredientes.
- Temperatura e tempo de forno, quando fornecidos na receita.
- Orientações específicas e observações importantes da receita.

Os métodos de preparo não devem ser inventados nem presumidos iguais para as três massas. Serão configurados a partir das instruções reais fornecidas pela proprietária.

## 7. Ficha de produção e impressão

Disponibilizar uma acção **Imprimir / Guardar PDF** para gerar uma ficha completa com:
- Nome do tipo de massa.
- Configuração do bolo e dimensões dos andares.
- Quantidade total de massa a preparar.
- Ingredientes consolidados.
- Distribuição de massa por forma.
- Método de preparo.

A ficha deve ser limpa, legível e adequada para consulta durante a produção.

## 8. Motor de cálculo e precisão

O motor de cálculo deve usar os dados reais de cada receita e ser calibrado individualmente para cada tipo de massa.

O volume geométrico de uma forma cilíndrica pode ser calculado por:

V = π × (D/2)² × H

Uma proporção de volumes pode servir como ponto de partida para ajustar uma receita de referência, mas não deve ser tratada como garantia universal de peso de massa ou de resultado de forno. Densidade, rendimento real, método de enchimento e comportamento de cada massa podem variar.

Requisitos:
- Guardar internamente os dados de referência de cada receita.
- Calcular a massa crua por forma com parâmetros validados.
- Somar as quantidades por andar para obter o total da produção.
- Escalar cada ingrediente com a regra de rendimento validada para a respectiva receita.
- Consolidar ingredientes iguais, preservando unidades coerentes.
- Evitar arredondamentos prematuros; arredondar apenas na apresentação final.
- Não mostrar resultados reais até os dados da receita terem sido fornecidos e validados.
- Incluir verificações para impedir dimensões inválidas ou receitas incompletas.

**Regra essencial:** o total de ingredientes apresentado em “Ingredientes — receita completa” deve corresponder à soma necessária para todos os andares, e não apenas à receita de um andar ou a uma receita-base isolada.

## 9. Gestão interna das receitas

Não disponibilizar gestão de receitas às utilizadoras finais.

A configuração interna deverá permitir ao responsável do produto definir, para cada uma das três massas:
- Ingredientes.
- Quantidades originais e unidades.
- Rendimento/peso de massa crua da receita.
- Forma(s) e dimensões de referência.
- Parâmetros de cálculo e calibração.
- Método de preparo completo.
- Temperatura, tempo de forno e observações, quando aplicáveis.

A forma técnica de armazenar estes dados será definida na implementação, sem expor um editor de receitas no ecrã público.

## 10. Fora do âmbito desta versão

Não incluir nesta primeira versão:
- Cadastro ou edição de receitas pelas confeiteiras.
- Gestão de encomendas.
- Funcionalidades adicionais que tornem o fluxo de cálculo mais complexo.
- Valores de ingredientes, métodos, temperaturas ou tempos de forno inventados.

## 11. Critérios de aceitação

A implementação só deve ser considerada concluída quando:

1. A interface tiver a identidade ameixa aprovada e for responsiva.
2. Existirem os percursos de bolo individual e bolo de vários andares.
3. Os três tipos de massa estiverem disponíveis.
4. Os diâmetros de 10 a 35 cm estiverem disponíveis, inclusive.
5. As alturas 10, 12, 15 e 17 cm estiverem disponíveis em cada forma.
6. For possível adicionar e remover andares e configurar cada um individualmente.
7. O resultado mostrar a quantidade de massa crua por forma e o total.
8. A lista de ingredientes consolidada representar a massa completa de todos os andares.
9. A distribuição por andar for apresentada para conferência.
10. O método de preparo correcto acompanhar cada tipo de massa.
11. A impressão/PDF incluir a ficha de produção completa.
12. Não existir editor público de receitas-base.
13. Não forem apresentados valores fictícios como cálculos reais.
14. Os cálculos forem testados com as receitas reais e quantidades de referência fornecidas pela proprietária.

## 12. Dados ainda necessários da proprietária

A implementação final dos cálculos e dos métodos depende do envio de:

- Receita completa de massa de noiva com álcool.
- Receita completa de massa de noiva sem álcool.
- Receita completa de massa de noiva com cerveja preta.
- Quantidades e unidades de todos os ingredientes.
- Rendimento ou peso total de massa crua, se conhecido.
- Diâmetros e alturas das formas usadas como referência.
- Quantidade de massa colocada em cada forma, se conhecida.
- Método de preparo de cada receita.
- Temperatura e tempo de forno, se conhecidos.

Estes dados são necessários para calibrar os cálculos e garantir que a aplicação apresenta quantidades fiáveis.

---

**Nota de implementação:** a primeira interface foi implementada em `src/routes/index.tsx`, com estilos em `src/styles.css` e metadados em `src/routes/__root.tsx`. A interface já permite configurar bolos individuais e de vários andares, mas os cálculos reais permanecem bloqueados até serem inseridas e validadas as três receitas originais. Preservar a estrutura TanStack Start e não editar ficheiros gerados ou migrações geridas pelo Lovable.


## 13. Primeira receita recebida — massa de noiva com álcool

Em 08/11/2026 foi recebida a receita original de massa de noiva com álcool e registada internamente em `src/data/wedding-cake-recipes.ts`. O registo preserva a demolha de passas, a calda de caramelo, os ingredientes da massa, a sequência de preparo e as notas sobre papel de alumínio e bailarina de flores.

A indicação manuscrita/digitalizada “1 4 ovos inteiros” foi interpretada provisoriamente como 14 ovos e está marcada para confirmação. Também aguardam confirmação: peso de massa crua produzido, forma de referência, se as passas são pesadas escorridas, destino do líquido da demolha, temperatura e tempo de forno. Por isso, esta receita está registada, mas ainda não está calibrada para gerar quantidades por diâmetro/altura.


### Referência de rendimento — massa de noiva com álcool

A proprietária esclareceu que a receita completa corresponde à produção simultânea de:
- 1 forma de 20 cm de diâmetro × 12 cm de altura.
- 1 forma de 14 cm de diâmetro × 13 cm de altura.

Estas duas formas são a referência conjunta para a escala proporcional por volume cilíndrico. O sistema pode estimar a proporção da receita e escalar os ingredientes para a soma dos volumes das formas escolhidas. Ainda não deve afirmar o peso em gramas da massa crua por forma: falta medir o rendimento total de massa crua desta receita ou o peso efectivamente colocado em cada uma das formas de referência.


### Confirmações e acabamento — massa de noiva com álcool

A autora confirmou que a receita utiliza 14 ovos inteiros. As passas são demolhadas na mistura de vinho tinto e brandy/conhaque durante pelo menos 7 dias. O líquido dessa demolha é reservado e utilizado para humedecer o bolo ainda quente, depois de sair do forno, em quantidade suficiente conforme a absorção — sem dose fixa informada. O bolo não é desenformado nessa fase: permanece na forma, é embrulhado em papel aderente e arrefece até ao dia seguinte. Continua pendente apenas confirmar se as 300 g de passas são pesadas antes ou depois de demolhar/escorrer, além do rendimento em massa crua e dos dados de forno.


### Dados de pesagem e forno — massa de noiva com álcool

A autora esclareceu que as 300 g de uvas passas são pesadas antes de demolhar; depois de demolhadas, são utilizadas na massa. A cozedura é longa e lenta: forno a 160 °C durante aproximadamente 1 hora e 45 minutos. Esta referência deve ser apresentada como orientação, pois o tempo pode variar com o forno e as dimensões/profundidade da forma. O rendimento em peso da massa crua ainda não é conhecido e não deve ser inventado.
