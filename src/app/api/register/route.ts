import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { full_name, email, password } = await req.json();

    // Verifica se o e-mail já existe
    const existing = await sql`SELECT id FROM public.profiles WHERE email = ${email}`;
    if (existing.length > 0) {
      return NextResponse.json({ error: "E-mail já cadastrado" }, { status: 400 });
    }

    // Insere o aluno e RETORNA o ID gerado
    const result = await sql`
      INSERT INTO public.profiles (full_name, email, password, role, anamnesis_completed)
      VALUES (${full_name}, ${email}, ${password}, 'student', FALSE)
      RETURNING id
    `;

    return NextResponse.json({ success: true, id: result[0].id });
  } catch (error: any) {
    console.error("Erro no registro:", error);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}