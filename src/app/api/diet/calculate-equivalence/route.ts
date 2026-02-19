import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const fromName = searchParams.get('from');
    const toName = searchParams.get('to');
    const amount = parseFloat(searchParams.get('amount') || "0");

    if (!fromName || !toName || !amount) return NextResponse.json({ amount: 0 });

    const foods = await sql`
      SELECT name, equivalence_factor, base_unit 
      FROM public.food_database 
      WHERE name = ${fromName} OR name = ${toName}
    `;

    const source = foods.find(f => f.name === fromName);
    const target = foods.find(f => f.name === toName);

    if (!source || !target) return NextResponse.json({ amount: 0 });

    // Regra de 3: (Qtd Atual / Fator Origem) * Fator Destino
    const calculated = Math.round((amount / source.equivalence_factor) * target.equivalence_factor);

    return NextResponse.json({ 
      amount: calculated,
      unit: target.base_unit 
    });
  } catch (error) {
    return NextResponse.json({ amount: 0 });
  }
}