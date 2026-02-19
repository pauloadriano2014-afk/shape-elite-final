import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const students = await sql`
      SELECT 
        id, 
        full_name, 
        goal, 
        weight, 
        height,
        "photoUrl" as "photoUrl",
        "photoPosition" as "photoPosition"
      FROM public.profiles 
      WHERE role = 'student'
      ORDER BY full_name ASC
    `;

    return NextResponse.json(students);
  } catch (error) {
    console.error("Erro ao listar alunos:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}