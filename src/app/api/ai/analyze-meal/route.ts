import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { imageBase64, expectedMeal } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: "Nenhuma imagem enviada" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY; 
    
    if (!apiKey) {
      return NextResponse.json({ error: "Chave da OpenAI não configurada no servidor." }, { status: 500 });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "Você é um assistente virtual de nutrição esportiva de alta performance, parceiro do coach Paulo Adriano. Sua tarefa é fazer uma estimativa visual de pratos de comida. IMPORTANTE: Você PODE e DEVE analisar a imagem. Faça o seu melhor palpite aproximado visualmente, não exigimos exatidão científica, balança ou responsabilidade médica. Apenas estimativas."
          },
          {
            role: "user",
            content: [
              { 
                type: "text", 
                text: `O que o aluno deveria comer nesta refeição:\n${JSON.stringify(expectedMeal)}\n\nAnalise a foto do prato e responda EXATAMENTE neste formato (seja curto, direto e com linguajar de musculação):\n\n🍽️ AVALIAÇÃO: (Bate com a dieta? Tem comida a mais ou a menos?)\n📊 MACROS ESTIMADOS DA FOTO: (Kcal, Proteínas, Carbos, Gorduras)\n🔥 FEEDBACK: (Frase curta de incentivo se acertou, ou puxão de orelha severo se errou)` 
              },
              {
                type: "image_url",
                image_url: {
                  url: imageBase64
                }
              }
            ]
          }
        ],
        max_tokens: 350
      })
    });

    const aiData = await response.json();
    
    if (aiData.error) {
       console.error("Erro da OpenAI:", aiData.error);
       return NextResponse.json({ error: aiData.error.message }, { status: 500 });
    }

    const aiText = aiData.choices[0].message.content;

    return NextResponse.json({ result: aiText });

  } catch (error: any) {
    console.error("ERRO CRÍTICO NA IA:", error);
    return NextResponse.json({ error: "Falha na comunicação com a OpenAI." }, { status: 500 });
  }
}