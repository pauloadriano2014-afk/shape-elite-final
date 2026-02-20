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

    // UPSERT: Usando a tabela 'checkins' que você criou no Passo 1
    await sql`
      INSERT INTO checkins (student_id, date, water_ml, fome, digestao, energia, free_meal, free_meal_photo)
      VALUES (
        ${studentId}::uuid, 
        ${date}::date, 
        COALESCE(${water_ml}, 0), 
        ${fome || null}, 
        ${digestao || null}, 
        ${energia || null}, 
        ${free_meal || null}, 
        ${free_meal_photo || null}
      )
      ON CONFLICT (student_id, date)
      DO UPDATE SET 
        water_ml = COALESCE(${water_ml}, checkins.water_ml),
        fome = COALESCE(${fome}, checkins.fome),
        digestao = COALESCE(${digestao}, checkins.digestao),
        energia = COALESCE(${energia}, checkins.energia),
        free_meal = COALESCE(${free_meal}, checkins.free_meal),
        free_meal_photo = COALESCE(${free_meal_photo}, checkins.free_meal_photo)
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
    // Buscando da mesma tabela configurada no Passo 1 e 3
    const rows = await sql`SELECT * FROM checkins WHERE student_id = ${studentId}::uuid AND date = ${date}::date`;
    return NextResponse.json(rows[0] || null);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}