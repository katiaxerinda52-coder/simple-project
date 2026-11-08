import type { RecipeIngredient } from "./wedding-cake-recipes";

export type PanDimensions = {
  id: number;
  diameterCm: number;
  heightCm: number;
};

export type ScaledIngredient = RecipeIngredient & {
  totalQuantity: number;
  byPan: { panId: number; quantity: number }[];
};

const cylinderVolume = (diameterCm: number, heightCm: number) =>
  Math.PI * Math.pow(diameterCm / 2, 2) * heightCm;

/**
 * Scales a recipe against the combined volume of its reference pans.
 * This is a proportional volume estimate; final batter-weight calibration
 * still requires measured raw batter yield and the baker's actual pan fill.
 */
export function scaleRecipeByReferenceVolume(
  ingredients: RecipeIngredient[],
  referencePans: { diameterCm: number; heightCm: number }[],
  targetPans: PanDimensions[],
): { factor: number; ingredients: ScaledIngredient[]; targetVolumeCm3: number; referenceVolumeCm3: number } {
  const referenceVolumeCm3 = referencePans.reduce(
    (sum, pan) => sum + cylinderVolume(pan.diameterCm, pan.heightCm),
    0,
  );
  const targetVolumeCm3 = targetPans.reduce(
    (sum, pan) => sum + cylinderVolume(pan.diameterCm, pan.heightCm),
    0,
  );
  const factor = referenceVolumeCm3 > 0 ? targetVolumeCm3 / referenceVolumeCm3 : 0;

  return {
    factor,
    targetVolumeCm3,
    referenceVolumeCm3,
    ingredients: ingredients.map((ingredient) => ({
      ...ingredient,
      totalQuantity: ingredient.quantity * factor,
      byPan: targetPans.map((pan) => ({
        panId: pan.id,
        quantity:
          ingredient.quantity *
          (cylinderVolume(pan.diameterCm, pan.heightCm) / referenceVolumeCm3),
      })),
    })),
  };
}
