import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { id } = await req.json();

    if (!id) return NextResponse.json({ error: "ID não fornecido" }, { status: 400 });

    // Muda a "role" (permissão) do aluno para 'inactive'. 
    // Isso tira ele do seu Dashboard e pode ser usado para bloquear o login.
    await sql`UPDATE public.profiles SET role = 'inactive' WHERE id = ${id}::uuid`;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erro ao inativar aluno:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}