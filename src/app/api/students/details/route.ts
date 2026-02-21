import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "ID necessário" }, { status: 400 });

  try {
    const student = await sql`
      SELECT 
        id, 
        full_name, 
        email, 
        phone, -- A coluna mágica que estava faltando
        goal, 
        weight, 
        height, 
        age,
        meal_count, 
        meal_flexibility, 
        disliked_foods, 
        allergies, 
        supplements, 
        wake_time, 
        work_start, 
        work_end, 
        train_time, 
        sleep_time, 
        routine, 
        digestive_health,
        "photoUrl" as "photoUrl", 
        "photoPosition" as "photoPosition",
        next_checkin_date
      FROM public.profiles 
      WHERE id = ${id}::uuid 
      LIMIT 1
    `;
    
    return NextResponse.json(student[0] || null);
  } catch (error) {
    console.error("Erro ao buscar detalhes:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}