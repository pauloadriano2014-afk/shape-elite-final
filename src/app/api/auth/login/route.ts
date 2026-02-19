import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // Busca o usuário pelo email e senha
    const users = await sql`
      SELECT id, full_name, role 
      FROM public.profiles 
      WHERE email = ${email} AND password = ${password}
      LIMIT 1
    `;

    if (!users[0]) {
      return NextResponse.json({ error: "Email ou senha inválidos" }, { status: 401 });
    }

    const user = users[0];

    // Retorna os dados do usuário para o navegador salvar
    return NextResponse.json({
      id: user.id,
      name: user.full_name,
      role: user.role, // Aqui ele diz se é 'coach' ou 'student'
    });

  } catch (error) {
    return NextResponse.json({ error: "Erro no servidor" }, { status: 500 });
  }
}