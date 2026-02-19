import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "ID necessário" }, { status: 400 });

  try {
    // O '*' garante que ele pegue weight e height que acabamos de criar
    const student = await sql`
      SELECT * FROM public.profiles 
      WHERE id = ${id}::uuid
      LIMIT 1
    `;

    return NextResponse.json(student[0]);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar detalhes" }, { status: 500 });
  }
}