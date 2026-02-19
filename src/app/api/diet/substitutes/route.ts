import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const itemText = searchParams.get('itemText');

  if (!itemText) return NextResponse.json([]);

  // 1. Decifra o input (ex: "150g Arroz")
  // A regex agora aceita inputs mais "sujos" que podem vir da edição manual
  const match = itemText.match(/^(\d+)\s*([a-zA-Z]+)?\s+(.*)$/);
  
  // Se não der match (ex: apenas "Arroz"), tenta buscar só pelo nome com quantidade 100g padrão
  const amount = match ? parseFloat(match[1]) : 100;
  const unit = match ? (match[2] || 'g') : 'g';
  const name = match ? match[3].trim() : itemText.trim();

  try {
    // 2. Busca o alimento ORIGINAL
    // IMPORTANTE: Busca por similaridade (ILIKE) para achar "Arroz" mesmo se digitar "Arroz Branco"
    const sourceFoods = await sql`
      SELECT name, category, conversion_factor, equivalence_factor, base_unit 
      FROM public.food_database 
      WHERE name ILIKE ${'%' + name + '%'}
      LIMIT 1
    `;

    if (sourceFoods.length === 0) return NextResponse.json([]); 

    const source = sourceFoods[0];
    if (!source.category) return NextResponse.json([]); 

    // Define o fator real (prioriza conversion, usa equivalence se conversion for nulo/zero)
    const sourceFactor = parseFloat(source.conversion_factor) || parseFloat(source.equivalence_factor) || 1;

    // 3. Busca Substitutos da mesma categoria
    const substitutes = await sql`
      SELECT name, base_unit, conversion_factor, equivalence_factor
      FROM public.food_database 
      WHERE category = ${source.category} 
      AND name != ${source.name}
    `;

    const results = substitutes.map(sub => {
      const subFactor = parseFloat(sub.conversion_factor) || parseFloat(sub.equivalence_factor) || 1;

      // LÓGICA NUTRIUM (Baseada em Densidade Nutricional)
      // Fórmula: (QtdOriginal * FatorOriginal) / FatorNovo
      
      const absoluteNutrient = amount * sourceFactor;
      let newAmount = absoluteNutrient / subFactor;
      
      // Arredonda para evitar decimais quebrados (ex: 123.4g -> 123)
      newAmount = Math.round(newAmount);

      return {
        name: sub.name,
        amount: String(newAmount),
        unit: sub.base_unit || 'g'
      };
    });

    return NextResponse.json(results);

  } catch (error) {
    console.error("Erro API Substitutos:", error);
    return NextResponse.json([]);
  }
}