import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // 1. Correção: O frontend envia { studentId }, vamos garantir que pegamos certo
    const body = await req.json();
    const student_id = body.studentId || body.student_id;

    if (!student_id || student_id === 'undefined') {
      return NextResponse.json({ error: "ID do aluno inválido" }, { status: 400 });
    }

    // 2. Busca o rascunho na tabela NOVA (diet_plans)
    // Correção: A coluna se chama 'content', não 'plan_data'
    const latestPlan = await sql`
      SELECT content FROM public.diet_plans 
      WHERE student_id = ${student_id}::uuid 
      AND status = 'active'
      ORDER BY created_at DESC LIMIT 1
    `;

    if (!latestPlan[0]) {
      return NextResponse.json({ error: "Nenhum rascunho encontrado para publicar." }, { status: 404 });
    }

    // COMO A LÓGICA MUDOU:
    // O App do Aluno agora lê direto da tabela 'diet_plans' (onde o status já é 'active').
    // Não precisamos mais copiar linha por linha para a tabela antiga 'meals'.
    // O simples fato de existir um registro 'active' na diet_plans já torna a dieta pública.

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("ERRO NA PUBLICAÇÃO:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}