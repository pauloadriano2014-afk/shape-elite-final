'use client'

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, BrainCircuit, Wand2, Save } from 'lucide-react';

export default function GerarDietaIAPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  
  const [student, setStudent] = useState<any>(null);
  const [observations, setObservations] = useState('');
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  useEffect(() => {
    fetch(`/api/students/details?id=${id}`)
      .then(res => res.json())
      .then(data => setStudent(data));
  }, [id]);

  const handleGenerate = async () => {
    if (!student) return;
    setLoading(true);

    try {
      // AQUI: CHAMANDO O ARQUIVO QUE JÁ EXISTIA
      const res = await fetch('/api/ai/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: id,
          name: student.full_name,
          weight: student.weight,
          height: student.height,
          goal: student.goal,
          observations
        })
      });

      if (res.ok) {
        setGenerated(true);
        // Redireciona para o Rascunho (onde você poderá editar)
        setTimeout(() => {
          router.push(`/dashboard-coach/aluno/${id}/dieta-atual`);
        }, 1500);
      } else {
        alert("Erro na IA. Verifique a chave no .env.local");
      }
    } catch (err) {
      alert("Erro técnico.");
    } finally {
      setLoading(false);
    }
  };

  if (!student) return <div className="p-10 text-center font-black animate-pulse">CARREGANDO...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6 text-black font-sans">
      <header className="mb-8 flex items-center gap-4">
        <button onClick={() => router.back()} className="bg-white p-3 rounded-full shadow-md border-2 border-black hover:scale-95 transition-all">
          <ChevronLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-black uppercase italic tracking-tighter">
            IA Generator <span className="text-blue-600">v2.0</span>
          </h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Usando arquivo generate-plan</p>
        </div>
      </header>

      <main className="max-w-md mx-auto space-y-6">
        <div className="bg-white p-6 rounded-[30px] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-sm font-black uppercase text-slate-400 mb-4 tracking-widest">Base do Atleta</h2>
          <div className="flex justify-between items-center mb-2">
            <span className="font-black uppercase text-lg">{student.full_name}</span>
            <span className="bg-black text-white px-3 py-1 rounded-full text-[10px] font-black uppercase">{student.goal}</span>
          </div>
          <div className="flex gap-4 text-sm font-black italic text-blue-600">
            <span>{student.weight} kg</span> • <span>{student.height} cm</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest ml-2 text-slate-500">Instruções Extras</label>
          <textarea 
            className="w-full p-4 bg-white rounded-[20px] border-2 border-slate-200 outline-none focus:border-blue-600 font-bold text-sm h-32 resize-none shadow-inner"
            placeholder="Ex: Sem lactose, prefere treino de manhã..."
            value={observations}
            onChange={e => setObservations(e.target.value)}
          />
        </div>

        <button 
          onClick={handleGenerate}
          disabled={loading || generated}
          className={`w-full p-6 rounded-[30px] flex items-center justify-between shadow-[0px_10px_40px_-10px_rgba(37,99,235,0.5)] transition-all active:scale-95 group
            ${generated ? 'bg-green-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}
          `}
        >
          <div className="flex items-center gap-4">
            {loading ? <div className="animate-spin w-6 h-6 border-4 border-white border-t-transparent rounded-full" /> : <BrainCircuit size={28} />}
            <span className="font-black uppercase italic tracking-tighter text-xl">
              {loading ? 'Processando...' : generated ? 'Sucesso!' : 'Gerar Dieta'}
            </span>
          </div>
        </button>
      </main>
    </div>
  );
}