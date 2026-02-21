import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');

    if (!filename) {
      return NextResponse.json({ error: 'Nome do arquivo é obrigatório' }, { status: 400 });
    }

    // Pega o arquivo bruto que veio do celular do aluno
    const body = request.body;
    if (!body) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
    }

    // Faz o upload direto para o Vercel Blob (public = você consegue ver o link)
    const blob = await put(filename, body, {
      access: 'public',
    });

    // Retorna o link final da foto em alta qualidade
    return NextResponse.json(blob);
    
  } catch (error) {
    console.error("Erro no upload para o Blob:", error);
    return NextResponse.json({ error: 'Falha no upload da imagem' }, { status: 500 });
  }
}