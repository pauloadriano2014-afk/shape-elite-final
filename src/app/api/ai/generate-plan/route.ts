import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

// --- FUNÇÃO FAXINEIRO ATUALIZADA (SUPORTE A OBJETOS DE SUBSTITUIÇÃO E QUANTIDADES SEPARADAS) ---
function sanitizeDiet(diet: any[]) {
  if (!Array.isArray(diet)) return [];
  return diet.map(meal => ({
    time: meal.time || "00:00",
    title: meal.title || "Refeição",
    calories: String(meal.calories).replace(/[^0-9]/g, ''), 
    // Mapeia os itens garantindo amount, unit, name separados e a lista de substitutos
    items: Array.isArray(meal.items) 
      ? meal.items.map((item: any) => {
          // Se por um milagre a IA devolver apenas string, transformamos no formato correto
          if (typeof item === 'string') {
            return {
              name: item,
              amount: "",
              unit: "",
              substitutes: [] // Fica vazio para o Coach preencher manualmente ou via seletor
            };
          }
          return {
            name: item.name || "Alimento",
            amount: item.amount || "",
            unit: item.unit || "",
            substitutes: Array.isArray(item.substitutes) ? item.substitutes : []
          };
        })
      : []
  }));
}

export async function POST(req: Request) {
  try {
    const { studentId, name, weight, height, goal, observations } = await req.json();

    if (!studentId) return NextResponse.json({ error: "ID do aluno não fornecido" }, { status: 400 });
    if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: "Chave da API não configurada" }, { status: 500 });

    const methodology = `
      Você é o Coach Paulo Adriano (Shape Natural). Estilo Old School e direto ao ponto.
      
      Sua tarefa é gerar a base da dieta. O Coach irá revisar e adicionar substitutos manualmente depois.
      
      REGRAS DE NOMENCLATURA:
      1. FEIJÃO: "Feijão Preto Cozido" ou "Feijão Carioca Cozido".
      2. PROTEÍNA REFEIÇÃO: [Frango Grelhado, Carne Moída (Patinho), Tilápia Grelhada, Lombo Suíno Grelhado, Ovos Inteiros].
      3. PROTEÍNA LANCHE: [Ovos Inteiros, Whey Protein Isolado, Queijo Cottage, Atum em Conserva].
      4. CARBOS: [Arroz Branco, Batata Inglesa Cozida, Pão Integral, Tapioca (massa)].

      DIRETRIZES TÉCNICAS:
      - Ovos: 100g de frango = 5 un de Ovos Inteiros.
      - Base de Pão: 50g.
    `;

    // PROMPT ATUALIZADO: FORÇANDO A SEPARAÇÃO DE NOME, QUANTIDADE E UNIDADE
    const prompt = `
      ${methodology}
      Gere um plano para ${name} (${weight}kg, ${height}cm, objetivo: ${goal}).
      Instruções adicionais: ${observations || 'Nenhuma.'}
      
      FORMATO JSON OBRIGATÓRIO (ARRAY DE OBJETOS DE REFEIÇÕES):
      Cada refeição deve ter "time", "title", "calories", e um array de "items".
      
      REGRA ESTRITA DE ITEMS: 
      NUNCA coloque o número e a medida no campo "name" (Proibido: "2 fatias de pão").
      O campo "name" deve ter APENAS o nome limpo. 
      Coloque o valor numérico em "amount" e a medida de grandeza em "unit".
      
      Exemplo do formato JSON OBRIGATÓRIO:
      [
        {
          "time": "08:00",
          "title": "Café da Manhã",
          "calories": "350",
          "items": [
            { "name": "Pão Integral", "amount": 2, "unit": "fatias" },
            { "name": "Ovo Inteiro", "amount": 3, "unit": "un" },
            { "name": "Mamão", "amount": 100, "unit": "g" }
          ]
        }
      ]
    `;

    const openAIResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      }),
    });

    const aiData = await openAIResponse.json();
    let dietContent = aiData.choices?.[0]?.message?.content;
    
    if (!dietContent) throw new Error("A IA não respondeu.");

    dietContent = dietContent.replace(/```json/g, "").replace(/```/g, "").trim();
    const rawDiet = JSON.parse(dietContent);
    const cleanDietData = sanitizeDiet(rawDiet);

    // Arquiva a anterior e salva a nova com suporte a substitutos manuais e unidades separadas
    await sql`UPDATE public.diet_plans SET status = 'archived' WHERE student_id = ${studentId}::uuid`;
    
    await sql`
      INSERT INTO public.diet_plans (student_id, content, status) 
      VALUES (${studentId}::uuid, ${JSON.stringify(cleanDietData)}, 'active')
    `;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erro ao gerar/salvar dieta:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}