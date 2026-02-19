import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q');
  const category = searchParams.get('category');

  try {
    let foods;

    if (query) {
      // Busca Global pelo nome (Digitação)
      foods = await sql`
        SELECT name, category, base_unit 
        FROM public.food_database 
        WHERE name ILIKE ${'%' + query + '%'}
        LIMIT 20
      `;
    } else if (category) {
      // Busca por Categoria (Abas do Editor)
      
      if (category === 'proteina') {
         // Traz Carnes, Ovos e Proteínas Gerais
         foods = await sql`
           SELECT name, category, base_unit FROM public.food_database 
           WHERE category IN ('proteina', 'proteina_carne') 
           ORDER BY name ASC LIMIT 50
         `;
      } 
      else if (category === 'carbo') {
         // Traz Arroz, Batata, Macarrão E CEREAIS (Aveia/Granola)
         foods = await sql`
           SELECT name, category, base_unit FROM public.food_database 
           WHERE category IN ('carbo', 'carbo_almoco', 'cereal') 
           ORDER BY name ASC LIMIT 50
         `;
      } 
      else if (category === 'laticinio') {
         // Traz Leites, Iogurtes (bebida_lactea) E Cremosos (laticinio)
         foods = await sql`
           SELECT name, category, base_unit FROM public.food_database 
           WHERE category IN ('laticinio', 'bebida_lactea') 
           ORDER BY name ASC LIMIT 50
         `;
      } 
      else if (category === 'queijo') {
         // Traz Queijos e Embutidos/Frios
         foods = await sql`
           SELECT name, category, base_unit FROM public.food_database 
           WHERE category = 'queijo' 
           ORDER BY name ASC LIMIT 50
         `;
      } 
      else {
         // Fallback para Frutas, Gorduras, Suplementos e Bebidas Zero
         foods = await sql`
           SELECT name, category, base_unit FROM public.food_database 
           WHERE category = ${category} 
           ORDER BY name ASC LIMIT 50
         `;
      }
    } else {
      return NextResponse.json([]);
    }

    return NextResponse.json(foods);
  } catch (error) {
    console.error("Erro Search:", error);
    return NextResponse.json([]);
  }
}