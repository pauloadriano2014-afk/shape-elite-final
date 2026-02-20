import { NextResponse } from "next/server";
import { neon } from '@neondatabase/serverless';

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    
    // Busca da tabela exata (profiles) e cruza com a tabela (checkins) do dia
    const students = await sql`
      SELECT 
        u.id, 
        u.full_name, 
        u.goal, 
        u.weight, 
        u."photoUrl", 
        u."photoPosition",
        c.water_ml as today_water,
        c.energia as today_energy,
        c.free_meal as today_free_meal
      FROM profiles u
      LEFT JOIN checkins c 
        ON u.id = c.student_id AND c.date = CURRENT_DATE
      WHERE u.role = 'student' OR u.role IS NULL
      ORDER BY u.full_name ASC
    `;
    
    return NextResponse.json(students);
  } catch (error: any) {
    console.error("Erro ao listar alunos no painel:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}