import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // 1. ADICIONADO: Extraímos o phone do corpo da requisição
    const { id, weight, height, phone } = body;

    if (!id) {
      return NextResponse.json({ error: "ID não fornecido" }, { status: 400 });
    }

    // Convertemos para números ou null caso estejam vazios
    const numWeight = weight ? parseFloat(weight) : null;
    const numHeight = height ? parseFloat(height) : null;

    // 2. ATUALIZADO: O SQL agora contempla o campo phone
    await sql`
      UPDATE public.profiles 
      SET 
        weight = ${numWeight}, 
        height = ${numHeight},
        phone = ${phone || null} -- Se o phone for vazio, salva null para não dar erro
      WHERE id = ${id}::uuid
    `;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("ERRO NO BANCO NEON:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}