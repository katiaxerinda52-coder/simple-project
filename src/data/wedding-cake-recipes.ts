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

// The original recipe records are intentionally stored in the protected Supabase
// table public.wedding_cake_recipes and must never be added to this frontend file.
