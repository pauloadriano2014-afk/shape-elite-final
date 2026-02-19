import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { studentId, photoUrl } = await req.json();

    if (!studentId || !photoUrl) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    // ATENÇÃO: Mudamos de 'students' para 'profiles' para bater com seu banco
    await sql`
      UPDATE public.profiles 
      SET "photoUrl" = ${photoUrl} 
      WHERE id = ${studentId}::uuid
    `;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erro ao atualizar foto:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}