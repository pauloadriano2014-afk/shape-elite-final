import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { studentId, date, water_ml, fome, digestao, energia, free_meal, free_meal_photo } = body;

    if (!studentId || !date) {
      return NextResponse.json({ error: 'Faltam dados obrigatórios' }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL!);

    // UPSERT: Se não existir o registro para esse aluno hoje, ele cria. Se já existir, ele atualiza.
    await sql`
      INSERT INTO daily_checkins (student_id, date, water_ml, fome, digestao, energia, free_meal, free_meal_photo)
      VALUES (${studentId}, ${date}, COALESCE(${water_ml}, 0), ${fome}, ${digestao}, ${energia}, ${free_meal}, ${free_meal_photo})
      ON CONFLICT (student_id, date)
      DO UPDATE SET 
        water_ml = COALESCE(${water_ml}, daily_checkins.water_ml),
        fome = COALESCE(${fome}, daily_checkins.fome),
        digestao = COALESCE(${digestao}, daily_checkins.digestao),
        energia = COALESCE(${energia}, daily_checkins.energia),
        free_meal = COALESCE(${free_meal}, daily_checkins.free_meal),
        free_meal_photo = COALESCE(${free_meal_photo}, daily_checkins.free_meal_photo)
    `;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erro ao salvar check-in:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get('studentId');
  const date = searchParams.get('date');

  if (!studentId || !date) return NextResponse.json({ error: 'Faltam parâmetros' }, { status: 400 });

  try {
    const sql = neon(process.env.DATABASE_URL!);
    const rows = await sql`SELECT * FROM daily_checkins WHERE student_id = ${studentId} AND date = ${date}`;
    return NextResponse.json(rows[0] || null);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}