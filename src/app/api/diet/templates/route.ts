import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

// 1. GET: Busca todos os templates salvos na sua Biblioteca Elite
export async function GET() {
  try {
    const templates = await sql`
      SELECT id, name, content, created_at 
      FROM public.diet_templates 
      ORDER BY created_at DESC
    `;
    
    return NextResponse.json(templates);
  } catch (error: any) {
    console.error("Erro ao buscar templates:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 2. POST: Salva um novo template vindo do painel do Coach
export async function POST(req: Request) {
  try {
    const { name, content } = await req.json();

    if (!name || !content) {
      return NextResponse.json({ error: "O nome e o conteúdo do template são obrigatórios." }, { status: 400 });
    }

    // Insere no banco de dados Neon no formato JSONB
    const result = await sql`
      INSERT INTO public.diet_templates (name, content) 
      VALUES (${name}, ${JSON.stringify(content)})
      RETURNING id, name
    `;

    return NextResponse.json({ success: true, template: result[0] });
  } catch (error: any) {
    console.error("Erro ao salvar template:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 3. DELETE: Exclui um template da biblioteca
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: "ID do template não fornecido." }, { status: 400 });
    }

    await sql`DELETE FROM public.diet_templates WHERE id = ${id}::uuid`;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erro ao excluir template:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}