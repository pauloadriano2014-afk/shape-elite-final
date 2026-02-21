import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: "ID não fornecido" }, { status: 400 });

    // 1. Apaga as dietas vinculadas
    await sql`DELETE FROM meals WHERE student_id = ${id}::uuid`;
    
    // 2. Apaga os rastreios diários
    await sql`DELETE FROM checkins WHERE student_id = ${id}::uuid`;
    
    // 3. Apaga o histórico de fotos (Aviso: O id na evolução é tratado como texto)
    await sql`DELETE FROM evolucao WHERE student_id = ${id}`;
    
    // 4. Finalmente, apaga o perfil principal
    await sql`DELETE FROM profiles WHERE id = ${id}::uuid`;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erro ao excluir aluno:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}