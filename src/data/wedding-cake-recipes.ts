export type RecipeIngredient = {
  name: string;
  quantity: number;
  unit: "g" | "unidade" | "colher de chá" | "colher de sopa";
  note?: string;
};

export type RecipeStep = {
  title: string;
  instructions: string;
  warning?: string;
};

export type WeddingCakeRecipe = {
  id: "alcohol" | "without-alcohol" | "black-beer";
  name: string;
  status: "configured" | "pending";
  components: {
    name: string;
    ingredients: RecipeIngredient[];
    steps: RecipeStep[];
  }[];
  batterIngredients: RecipeIngredient[];
  preparation: RecipeStep[];
  notes: string[];
  calibration: {
    referencePans: { diameterCm: number; heightCm: number }[];
    scalingMethod: "combined-cylinder-volume" | "pending";
    rawBatterYieldGrams: number | null;
    referencePanDiameterCm: number | null;
    referencePanHeightCm: number | null;
    rawBatterPerPanGrams: number | null;
    ovenTemperature: string | null;
    bakingTime: string | null;
    pendingQuestions: string[];
  };
};

export const weddingCakeRecipes: Record<WeddingCakeRecipe["id"], WeddingCakeRecipe> = {
  alcohol: {
    id: "alcohol",
    name: "Massa de noiva com álcool",
    status: "configured",
    components: [
      {
        name: "Passas demolhadas",
        ingredients: [
          { name: "Vinho tinto", quantity: 380, unit: "g" },
          { name: "Brandy ou conhaque", quantity: 190, unit: "g", note: "À escolha." },
          { name: "Uva passa", quantity: 300, unit: "g" },
        ],
        steps: [
          {
            title: "Demolhar as passas",
            instructions: "Colocar o vinho tinto, o brandy ou conhaque e as uvas passas num recipiente. Tapar bem e deixar repousar durante pelo menos 7 dias, num lugar fresco, fora da geleira.",
          },
        ],
      },
      {
        name: "Calda de caramelo",
        ingredients: [
          { name: "Açúcar, de preferência castanho", quantity: 310, unit: "g" },
          { name: "Água quente", quantity: 720, unit: "g" },
        ],
        steps: [
          {
            title: "Preparar o caramelo",
            instructions: "Numa panela limpa e seca, colocar o açúcar e levar ao fogo até derreter completamente e ficar bem escuro, quase preto. Aquecer a água à parte, de preferência até ferver. Com muito cuidado, adicionar a água quente ao caramelo. Deixar dissolver todo o açúcar, retirar do fogo e reservar até arrefecer completamente.",
            warning: "Ao adicionar água ao caramelo quente, pode haver respingos e vapor muito quente. Adicionar lentamente e com cuidado, mantendo o rosto e as mãos afastados.",
          },
        ],
      },
    ],
    batterIngredients: [
      { name: "Manteiga", quantity: 500, unit: "g" },
      { name: "Açúcar", quantity: 400, unit: "g" },
      { name: "Ovos inteiros", quantity: 14, unit: "unidade" },
      { name: "Calda de caramelo fria", quantity: 320, unit: "g" },
      { name: "Farinha de trigo", quantity: 1160, unit: "g" },
      { name: "Essência de rum", quantity: 2, unit: "colher de chá" },
      { name: "Essência de café", quantity: 1, unit: "colher de chá" },
      { name: "Pasta de laranja", quantity: 1, unit: "colher de sopa", note: "Opcional." },
      { name: "Fermento Royal", quantity: 60, unit: "g" },
      { name: "Noz-moscada em pó", quantity: 1, unit: "colher de chá" },
      { name: "Mix spice para bolo", quantity: 2, unit: "colher de chá" },
      { name: "Gengibre em pó", quantity: 0.5, unit: "colher de chá" },
      { name: "Uvas passas demolhadas", quantity: 300, unit: "g", note: "As passas são demolhadas na mistura de vinho tinto e brandy/conhaque." },
      { name: "Fruta cristalizada", quantity: 130, unit: "g" },
      { name: "Amêndoas", quantity: 70, unit: "g" },
    ],
    preparation: [
      {
        title: "Bater manteiga e açúcar",
        instructions: "Colocar a manteiga e o açúcar numa bacia e bater durante pelo menos 10 minutos, ou até obter uma mistura cremosa e fofa.",
      },
      {
        title: "Adicionar os ovos",
        instructions: "Reduzir um pouco a velocidade da batedeira e acrescentar os ovos, um a um, incorporando bem cada ovo.",
      },
      {
        title: "Incorporar caramelo, essências e farinha",
        instructions: "Com os ovos incorporados, adicionar a calda de caramelo já completamente fria, as essências e metade da farinha. Este processo pode ser feito com uma colher de pau grande ou um fouet gigante. Mexer delicadamente.",
      },
      {
        title: "Adicionar os restantes ingredientes secos",
        instructions: "Acrescentar o restante da farinha, a noz-moscada, o mix spice e o fermento. Mexer até obter uma massa uniforme.",
      },
      {
        title: "Adicionar frutas e frutos secos",
        instructions: "Adicionar as passas demolhadas, a fruta cristalizada e as amêndoas. Mexer delicadamente até ficarem bem distribuídas e incorporadas na massa.",
      },
      {
        title: "Preparar para levar ao forno",
        instructions: "Colocar a massa nas formas preparadas. Cobrir sempre a massa crua com papel de alumínio antes de levar ao forno, conforme a nota da receita.",
      },
      {
        title: "Humedecer o bolo ainda quente",
        instructions: "Depois de o bolo sair do forno, ainda quente e sem o desenformar, utilizar o líquido da demolha das passas (mistura de vinho tinto e brandy/conhaque) para humedecer a massa. Usar apenas a quantidade que baste, distribuindo o líquido pelo bolo. A quantidade exacta não é fixa e deve ser ajustada à absorção do bolo.",
      },
      {
        title: "Embrulhar e deixar arrefecer",
        instructions: "Depois de humedecer, manter o bolo dentro da própria forma, embrulhar em papel aderente e deixar arrefecer até ao dia seguinte. Não desenformar antes de arrefecer.",
      },
    ],
    notes: [
      "Cobrir sempre a massa crua com papel de alumínio.",
      "Para formas muito grandes, a autora recomenda colocar uma bailarina de flores no centro do bolo e retirá-la depois de cozido.",
      "A bailarina é uma peça de ferro que ajuda a distribuir o calor e a cozer a massa mais rapidamente; pode ser feita por um serralheiro.",
      "O líquido da demolha das passas é reservado para humedecer o bolo ainda quente, depois de sair do forno. Usar a quantidade que baste; não existe uma medida fixa indicada.",
      "Depois de humedecer, o bolo permanece na forma, é embrulhado em papel aderente e arrefece até ao dia seguinte antes de ser desenformado.",
    ],
    calibration: {
      referencePans: [
        { diameterCm: 20, heightCm: 12 },
        { diameterCm: 14, heightCm: 13 },
      ],
      scalingMethod: "combined-cylinder-volume",
      rawBatterYieldGrams: null,
      referencePanDiameterCm: null,
      referencePanHeightCm: null,
      rawBatterPerPanGrams: null,
      ovenTemperature: null,
      bakingTime: null,
      pendingQuestions: [
        "Confirmar se as 300 g de passas correspondem ao peso antes ou depois de demolhar e escorrer.",
        "Indicar a temperatura e o tempo de forno, se aplicável.",
      ],
    },
  },
  "without-alcohol": {
    id: "without-alcohol",
    name: "Massa de noiva sem álcool",
    status: "pending",
    components: [],
    batterIngredients: [],
    preparation: [],
    notes: [],
    calibration: {
      rawBatterYieldGrams: null,
      referencePanDiameterCm: null,
      referencePanHeightCm: null,
      rawBatterPerPanGrams: null,
      ovenTemperature: null,
      bakingTime: null,
      referencePans: [],
      scalingMethod: "pending",
      pendingQuestions: ["Aguardar receita original."],
    },
  },
  "black-beer": {
    id: "black-beer",
    name: "Massa de noiva com cerveja preta",
    status: "pending",
    components: [],
    batterIngredients: [],
    preparation: [],
    notes: [],
    calibration: {
      rawBatterYieldGrams: null,
      referencePanDiameterCm: null,
      referencePanHeightCm: null,
      rawBatterPerPanGrams: null,
      ovenTemperature: null,
      bakingTime: null,
      pendingQuestions: ["Aguardar receita original."],
    },
  },
};
