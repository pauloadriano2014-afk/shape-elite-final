import { NextResponse } from 'next/server';
import { sql } from '@/lib/db'; // Importando a sua conexão exata com o Neon

export async function POST(req: Request) {
  try {
    const { studentId, peso, fotoFrente, fotoLado, fotoCostas, dataCheckin } = await req.json();

    // 1. GARANTIA DE TABELA: Se a tabela não existir no seu Neon, ele cria na hora!
    await sql`
      CREATE TABLE IF NOT EXISTS evolucao (
        id SERIAL PRIMARY KEY,
        student_id TEXT NOT NULL,
        peso TEXT NOT NULL,
        foto_frente TEXT NOT NULL,
        foto_lado TEXT NOT NULL,
        foto_costas TEXT NOT NULL,
        data_checkin DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 2. INSERÇÃO DOS DADOS: Salvando o peso e os links das fotos em alta qualidade
    await sql`
      INSERT INTO evolucao (student_id, peso, foto_frente, foto_lado, foto_costas, data_checkin)
      VALUES (${studentId}, ${peso}, ${fotoFrente}, ${fotoLado}, ${fotoCostas}, ${dataCheckin});
    `;

    console.log(`✅ Check-in salvo com sucesso para o aluno ID: ${studentId}`);

    return NextResponse.json({ success: true, message: "Avaliação salva com sucesso!" });
    
  } catch (error) {
    console.error("🚨 Erro ao salvar evolução no Neon DB:", error);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}

// --- ADICIONE ISSO NO FINAL DO ARQUIVO route.ts ---

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json({ error: "ID do aluno não fornecido" }, { status: 400 });
    }

    // Puxa a última avaliação cadastrada desse aluno no Neon DB
    const result = await sql`
      SELECT * FROM evolucao 
      WHERE student_id = ${studentId} 
      ORDER BY data_checkin DESC, created_at DESC 
      LIMIT 1
    `;

    if (result.length > 0) {
      return NextResponse.json(result[0]);
    } else {
      return NextResponse.json(null); // Retorna null se não tiver avaliação
    }
  } catch (error) {
    console.error("🚨 Erro ao buscar evolução no Neon DB:", error);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}