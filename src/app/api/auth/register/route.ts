import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // 1. ADICIONADO: Extrair o 'phone' do JSON recebido
    const { full_name, email, password, goal, weight, height, phone } = await req.json();

    // 2. Verifica se o e-mail já existe
    const existing = await sql`SELECT id FROM public.profiles WHERE email = ${email}`;
    if (existing.length > 0) {
      return NextResponse.json({ error: "E-mail já cadastrado" }, { status: 400 });
    }

    // 3. ADICIONADO: Incluir a coluna 'phone' no INSERT
    const result = await sql`
      INSERT INTO public.profiles (full_name, email, password, goal, weight, height, phone, role)
      VALUES (
        ${full_name}, 
        ${email}, 
        ${password}, 
        ${goal}, 
        ${weight ? Number(weight) : null}, 
        ${height ? Number(height) : null}, 
        ${phone || null}, -- Salvando o telefone do aluno
        'student'
      )
      RETURNING id; -- Importante para o redirecionamento do frontend
    `;

    return NextResponse.json({ success: true, id: result[0].id });
  } catch (error: any) {
    console.error("Erro no registro:", error);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}