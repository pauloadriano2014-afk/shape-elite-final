import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // 1. Recebe 'content' (que é o nome que o Editor envia)
    const { studentId, content } = await req.json();

    if (!studentId) {
      return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });
    }

    // Validação de segurança: Se o conteúdo vier vazio, não salva para evitar corromper a dieta
    if (!content) {
        return NextResponse.json({ error: "Conteúdo da dieta vazio" }, { status: 400 });
    }

    console.log("Salvando alterações manuais para:", studentId);

    // 2. Tenta Atualizar (UPDATE)
    const updateResult = await sql`
      UPDATE public.diet_plans 
      SET 
        content = ${JSON.stringify(content)}::jsonb,
        updated_at = NOW()
      WHERE student_id = ${studentId}::uuid AND status = 'active'
      RETURNING id
    `;

    // 3. Se não atualizou nada (count = 0), é porque não tinha plano ativo. Cria um novo (INSERT).
    if (updateResult.length === 0) {
       console.log("Criando novo plano...");
       await sql`
         INSERT INTO public.diet_plans (student_id, content, status)
         VALUES (${studentId}::uuid, ${JSON.stringify(content)}::jsonb, 'active')
       `;
    }

    return NextResponse.json({ success: true, message: "Dieta salva com sucesso!" });
  } catch (error: any) {
    console.error("ERRO NO SAVE:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}