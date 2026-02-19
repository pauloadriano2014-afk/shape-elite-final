import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get('studentId');

  if (!studentId) return NextResponse.json([]);

  try {
    // AGORA ELE LÊ DA TABELA NOVA 'diet_plans'
    // Pega a última dieta criada que esteja 'active'
    const plans = await sql`
      SELECT content FROM public.diet_plans 
      WHERE student_id = ${studentId}::uuid AND status = 'active'
      ORDER BY created_at DESC 
      LIMIT 1
    `;

    if (plans.length > 0) {
      // Retorna o JSON das refeições direto para o App
      return NextResponse.json(plans[0].content); 
    }

    return NextResponse.json([]); // Retorna vazio se não tiver dieta
  } catch (error) {
    console.error("Erro ao buscar dieta:", error);
    return NextResponse.json([]);
  }
}