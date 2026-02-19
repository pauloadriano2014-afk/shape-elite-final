import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // AQUI ESTÁ O FILTRO MÁGICO: WHERE role = 'student'
    const students = await sql`
      SELECT * FROM public.profiles 
      WHERE role = 'student'
      ORDER BY full_name ASC
    `;

    return NextResponse.json(students);
  } catch (error) {
    console.error("Erro ao listar alunos:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}