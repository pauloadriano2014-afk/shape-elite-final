'use client'

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Scale, Ruler, Target, BrainCircuit, Save, History, Edit3, ArrowRight } from 'lucide-react';

export default function PerfilAlunoPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [measures, setMeasures] = useState({ weight: '', height: '' });

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`/api/students/details?id=${id}`);
        if (res.ok) {
          const data = await res.json();
          setStudent(data);
          setMeasures({ 
            weight: data.weight ? String(data.weight) : '', 
            height: data.height ? String(data.height) : '' 
          });
        }
      } catch (err) { console.error(err); } finally { setLoading(false); }
    }
    loadData();
  }, [id]);

  const saveMeasures = async () => {
    try {
      const res = await fetch('/api/students/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, weight: measures.weight, height: measures.height })
      });

      if (res.ok) {
        setStudent((prev: any) => ({
          ...prev,
          weight: measures.weight,
          height: measures.height
        }));
        setEditMode(false);
        alert("✅ MEDIDAS ATUALIZADAS COM SUCESSO!");
      }
    } catch (err) { alert("Erro ao salvar no banco"); }
  };

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-black animate-pulse uppercase italic text-black">Sincronizando Atleta...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6 pb-32 text-black font-sans">
      <header className="max-w-md mx-auto mb-8 flex justify-between items-center bg-white p-4 rounded-3xl border-2 border-black shadow-sm">
        <button onClick={() => router.push('/dashboard-coach')} className="text-[10px] font-black uppercase italic border-b-2 border-black flex items-center gap-2">
          <ChevronLeft size={14} /> Painel Coach
        </button>
        
        <button 
          onClick={() => editMode ? saveMeasures() : setEditMode(true)}
          className="bg-black text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase flex items-center gap-2 shadow-xl active:scale-95 transition-all"
        >
          {editMode ? <><Save size={14} className="text-blue-400" /> Gravar Dados</> : 'Editar Medidas'}
        </button>
      </header>

      <main className="max-w-md mx-auto space-y-6">
        <div className="bg-black text-white p-8 rounded-[40px] shadow-2xl relative border-b-8 border-blue-600">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-1 italic text-blue-400">Atleta de Elite</p>
          <h2 className="text-2xl font-black uppercase italic tracking-tighter leading-none">{student?.full_name}</h2>
          <div className="mt-4 flex items-center gap-2 bg-blue-600 w-fit px-4 py-1 rounded-full text-[10px] font-black uppercase italic shadow-lg">
            <Target size={12} /> {student?.goal}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-[35px] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center">
            <Scale size={20} className="text-blue-600 mb-2" />
            <span className="text-[10px] font-black uppercase text-slate-400 mb-1 italic">Peso (kg)</span>
            {editMode ? (
              <input 
                type="number" 
                className="w-full text-center font-black text-2xl outline-none border-b-4 border-blue-600 bg-slate-50 rounded-lg p-1" 
                value={measures.weight} 
                onChange={e => setMeasures({...measures, weight: e.target.value})}
                autoFocus
              />
            ) : (
              <span className="text-2xl font-black italic">
                {student?.weight ? student.weight : '--'} <span className="text-xs">kg</span>
              </span>
            )}
          </div>

          <div className="bg-white p-6 rounded-[35px] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center">
            <Ruler size={20} className="text-blue-600 mb-2" />
            <span className="text-[10px] font-black uppercase text-slate-400 mb-1 italic">Altura (cm)</span>
            {editMode ? (
              <input 
                type="number" 
                className="w-full text-center font-black text-2xl outline-none border-b-4 border-blue-600 bg-slate-50 rounded-lg p-1" 
                value={measures.height} 
                onChange={e => setMeasures({...measures, height: e.target.value})} 
              />
            ) : (
              <span className="text-2xl font-black italic">
                {student?.height ? student.height : '--'} <span className="text-xs">cm</span>
              </span>
            )}
          </div>
        </div>

        {/* --- AÇÕES DO COACH PAULO ADRIANO --- */}
        <div className="space-y-4 pt-4">
          
          {/* EDITOR MANUAL PRO (NOVIDADE) */}
          <button 
            onClick={() => router.push(`/dashboard-coach/aluno/${id}/editor-pro`)}
            className="w-full flex items-center justify-between bg-white text-black p-6 rounded-[30px] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] group hover:bg-blue-50 transition-all active:scale-95"
          >
            <div className="flex items-center gap-4 text-left">
              <Edit3 size={24} className="text-blue-600" />
              <div>
                <span className="font-black uppercase italic tracking-tighter text-lg block leading-none">Montar Dieta (Manual)</span>
                <span className="text-[9px] font-black uppercase text-slate-400 italic">Editor Pro com Seletor</span>
              </div>
            </div>
            <ArrowRight size={20} />
          </button>

          <button 
            onClick={() => router.push(`/dashboard-coach/aluno/${id}/gerar-dieta-ia`)}
            className="w-full flex items-center justify-between bg-black text-white p-6 rounded-[30px] shadow-xl group hover:bg-blue-700 transition-all active:scale-95 border-b-4 border-blue-600"
          >
            <div className="flex items-center gap-4 text-left">
              <BrainCircuit size={24} className="text-blue-400" />
              <span className="font-black uppercase italic tracking-tighter text-lg">Gerar Rascunho IA</span>
            </div>
            <ArrowRight size={20} />
          </button>

          <button 
            onClick={() => router.push(`/dashboard-coach/aluno/${id}/dieta-atual`)}
            className="w-full flex items-center justify-between bg-white text-black p-6 rounded-[30px] border-2 border-slate-200 group hover:border-black transition-all shadow-sm"
          >
            <div className="flex items-center gap-4 text-left">
              <History size={24} className="text-slate-400 group-hover:text-blue-600" />
              <span className="font-black uppercase italic tracking-tighter text-lg text-slate-500 group-hover:text-black">Ver Dieta Publicada</span>
            </div>
            <ArrowRight size={20} />
          </button>
        </div>
      </main>
    </div>
  );
}