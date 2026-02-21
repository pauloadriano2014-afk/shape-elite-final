import { NextResponse } from 'next/server';
import { sql } from '@/lib/db'; // Importando a sua conexão exata com o Neon

export async function POST(req: Request) {
  try {
    const { studentId, peso, fotoFrente, fotoLado, fotoCostas, dataCheckin } = await req.json();

    // 1. GARANTIA DE TABELA: Mantém a estrutura de histórico
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

    // 2. INSERÇÃO DOS DADOS: Cria um novo registro (Histórico preservado)
    await sql`
      INSERT INTO evolucao (student_id, peso, foto_frente, foto_lado, foto_costas, data_checkin)
      VALUES (${studentId}, ${peso}, ${fotoFrente}, ${fotoLado}, ${fotoCostas}, ${dataCheckin});
    `;

    // 3. LIMPEZA DA AGENDA: Remove a data de exigência na tabela profiles
    // Isso faz o alerta vermelho/verde sumir da tela do aluno após o envio
    await sql`
      UPDATE profiles 
      SET next_checkin_date = NULL 
      WHERE id = ${studentId}::uuid;
    `;

    console.log(`✅ Check-in realizado e alerta limpo para o aluno: ${studentId}`);

    return NextResponse.json({ success: true, message: "Avaliação salva com sucesso e alerta removido!" });
    
  } catch (error) {
    console.error("🚨 Erro na rota de evolução (POST):", error);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json({ error: "ID do aluno não fornecido" }, { status: 400 });
    }

    // 4. HISTÓRICO COMPLETO: Puxa todos os check-ins do aluno (do mais novo para o mais antigo)
    const result = await sql`
      SELECT * FROM evolucao 
      WHERE student_id = ${studentId} 
      ORDER BY data_checkin DESC, created_at DESC
    `;

    // Retorna a lista completa para o Coach ver a evolução temporal
    return NextResponse.json(result);
    
  } catch (error) {
    console.error("🚨 Erro na rota de evolução (GET):", error);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}