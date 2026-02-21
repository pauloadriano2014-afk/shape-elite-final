import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { studentId, date } = await req.json();

    // Cria a coluna de agendamento na tabela "profiles" caso ela não exista
    await sql`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS next_checkin_date DATE;`;

    // Salva a data que o Coach escolheu na tabela "profiles"
    await sql`UPDATE profiles SET next_checkin_date = ${date} WHERE id = ${studentId};`;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao agendar:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}