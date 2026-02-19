import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message, protocols, studentName } = await req.json();
    const apiKey = process.env.OPENAI_API_KEY;

    const systemPrompt = `
      Você é o Assistente Nutricional de Elite do Coach Paulo Adriano, focado no sistema Shape Natural.
      Sua missão é ajudar o aluno ${studentName} com dúvidas sobre o plano alimentar dele.

      ESTA É A DIETA ATUAL DO ALUNO:
      ${JSON.stringify(protocols)}

      REGRAS RÍGIDAS:
      1. Responda apenas dúvidas sobre nutrição, substituições (baseado em equivalência de macros) e horários da dieta.
      2. Se perguntarem sobre treino, anabolizantes ou suplementos pesados, diga que deve consultar o Coach Paulo Adriano no WhatsApp.
      3. Seja motivador, curto, direto e use linguajar de musculação/fitness.
      4. Se o aluno quiser trocar algo, sugira opções saudáveis com macros parecidos.
      5. Você não é médico, é um assistente virtual de alta performance.
    `;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        max_tokens: 400
      })
    });

    const aiData = await response.json();
    return NextResponse.json({ result: aiData.choices[0].message.content });
  } catch (error) {
    return NextResponse.json({ error: "Erro na IA" }, { status: 500 });
  }
}