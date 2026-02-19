import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { full_name, email, password, goal, weight, height } = await req.json();

    // 1. Verifica se o e-mail já existe
    const existing = await sql`SELECT id FROM public.profiles WHERE email = ${email}`;
    if (existing.length > 0) {
      return NextResponse.json({ error: "E-mail já cadastrado" }, { status: 400 });
    }

    // 2. Insere o novo aluno
    // Nota: Em um sistema real, você deve usar hash de senha (ex: bcrypt)
    await sql`
      INSERT INTO public.profiles (full_name, email, password, goal, weight, height, role)
      VALUES (
        ${full_name}, 
        ${email}, 
        ${password}, 
        ${goal}, 
        ${weight ? Number(weight) : null}, 
        ${height ? Number(height) : null}, 
        'student'
      )
    `;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erro no registro:", error);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}