export interface FoodOption {
  name: string;
  amount: number;
  unit: string;
  isLactoseFree: boolean;
}

export async function getSubstitutes(itemText: string): Promise<FoodOption[] | null> {
  try {
    const res = await fetch(`/api/diet/substitutes?itemText=${encodeURIComponent(itemText)}`);
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data) ? data : null;
  } catch (error) {
    return null;
  }
}