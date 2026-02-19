import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    await sql`
      UPDATE public.profiles 
      SET 
        goal = ${data.goal},
        weight = ${Number(data.weight)},
        height = ${Number(data.height)},
        age = ${Number(data.age)},
        meal_count = ${data.meal_count},
        meal_flexibility = ${data.meal_flexibility},
        disliked_foods = ${data.disliked_foods},
        allergies = ${data.allergies},
        supplements = ${data.supplements},
        wake_time = ${data.wake_time},
        work_start = ${data.work_start},
        work_end = ${data.work_end},
        train_time = ${data.train_time},
        sleep_time = ${data.sleep_time},
        routine = ${data.extra_routine},
        anamnesis_completed = TRUE
      WHERE id = ${data.id}::uuid
    `;
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erro ao salvar anamnese:", error);
    return NextResponse.json({ error: "Erro ao processar dados" }, { status: 500 });
  }
}