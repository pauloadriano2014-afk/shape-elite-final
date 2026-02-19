import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, weight, height } = body;

    // Convertemos para números para garantir que o banco aceite
    const numWeight = parseFloat(weight);
    const numHeight = parseFloat(height);

    if (!id) {
      return NextResponse.json({ error: "ID não fornecido" }, { status: 400 });
    }

    await sql`
      UPDATE public.profiles 
      SET 
        weight = ${numWeight}, 
        height = ${numHeight}
      WHERE id = ${id}::uuid
    `;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("ERRO NO BANCO NEON:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}