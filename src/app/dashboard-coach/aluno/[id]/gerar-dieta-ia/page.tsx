'use client'

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, BrainCircuit, Wand2, Save, Loader2, Target, User as UserIcon, AlertTriangle, Clock, Ban, Utensils, Zap } from 'lucide-react';

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
      const strictFormatInstruction = "\n\n[REGRA ESTRITA DE FORMATAÇÃO]: NUNCA inclua a quantidade ou unidade no nome do alimento. O campo 'name' deve conter apenas o nome limpo do alimento (ex: 'Pão Integral', 'Frango Desfiado', 'Ovo'). Coloque os valores numéricos APENAS no campo 'amount' e a medida no campo 'unit'. Não use '2fatias de pão' no nome. IMPORTANTE: Crie as refeições baseadas na quantidade solicitada pelo aluno.";
      
      // INJEÇÃO DE CÉREBRO: O sistema empacota as respostas do formulário automaticamente para a IA
      const anamneseData = `
        [DADOS DO FORMULÁRIO DO ALUNO (CRIAÇÃO OBRIGATÓRIA BASEADA NISTO)]:
        - Idade: ${student.age || 'Não informada'}
        - Horário de Acordar: ${student.wake_time || 'Não informado'}
        - Horário de Dormir: ${student.sleep_time || 'Não informado'}
        - Horário de Treino: ${student.train_time || 'Não informado'}
        - Alergias/Intolerâncias: ${student.allergies || 'Nenhuma'}
        - Alimentos que ODEIA: ${student.disliked_foods || 'Nenhum'}
        - Quantidade de Refeições desejada: ${student.meal_count || 'Padrão'}
        - Flexibilidade exigida: ${student.meal_flexibility || 'Normal'}
        - Suplementos que já usa: ${student.supplements || 'Nenhum'}
      `;

      const payloadObservations = anamneseData + "\n\n[INSTRUÇÕES DO COACH]: " + observations + strictFormatInstruction;

      const res = await fetch('/api/ai/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: id,
          name: student.full_name,
          weight: student.weight,
          height: student.height,
          goal: student.goal,
          observations: payloadObservations
        })
      });

      if (res.ok) {
        setGenerated(true);
        setTimeout(() => {
          router.push(`/dashboard-coach/aluno/${id}/dieta-atual`);
        }, 1500);
      } else {
        alert("Erro na IA. Verifique a chave no .env.local");
      }
    } catch (err) {
      alert("Erro técnico ao conectar com a IA.");
    } finally {
      setLoading(false);
    }
  };

  if (!student) return (
    <div className="min-h-[100dvh] bg-slate-50 flex flex-col items-center justify-center">
      <div className="w-16 h-16 border-8 border-green-600 border-t-transparent rounded-full animate-spin mb-4 shadow-[0_0_20px_rgba(22,163,74,0.3)]"></div>
      <p className="font-black uppercase italic tracking-widest text-green-500 text-sm">Carregando IA...</p>
    </div>
  );

  return (
    <div className="min-h-[100dvh] bg-slate-50 p-4 sm:p-6 pb-[env(safe-area-inset-bottom,24px)] text-black font-sans flex flex-col items-center justify-center">
      
      <div className="w-full max-w-lg">
        <header className="mb-6 relative w-full flex flex-col items-center text-center">
          <button 
            onClick={() => router.back()} 
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-white p-3 sm:p-4 rounded-[20px] shadow-sm border border-slate-100 hover:border-green-400 hover:text-green-600 active:scale-95 transition-all"
          >
            <ChevronLeft size={24} />
          </button>
          
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-4 border border-green-100 shadow-sm">
              <BrainCircuit size={28} />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black uppercase italic tracking-tighter leading-none text-slate-900">
              IA <span className="text-green-600">Generator</span>
            </h1>
            <p className="text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">Personalização Baseada em Dossiê</p>
          </div>
        </header>

        <main className="space-y-4 w-full">
          
          {/* BASE DO ATLETA */}
          <div className="bg-white p-6 sm:p-8 rounded-[35px] border border-slate-100 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.1)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-900"></div>
            
            <h2 className="text-[10px] font-black uppercase text-slate-400 mb-5 tracking-[0.2em] flex items-center gap-2">
              <UserIcon size={14} /> Base do Atleta
            </h2>
            
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
              <span className="font-black uppercase italic text-2xl text-slate-800 leading-none truncate pr-4">{student.full_name}</span>
              <span className="bg-green-50 border border-green-100 text-green-700 px-4 py-2 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-widest shrink-0 w-fit flex items-center gap-1.5">
                <Target size={14} /> {student.goal}
              </span>
            </div>
            
            <div className="flex gap-4 text-xs sm:text-sm font-black italic text-slate-500 bg-slate-50 p-4 rounded-[20px] border border-slate-100">
              <span className="text-slate-800">{student.weight} kg</span> • <span>{student.height} cm</span> • <span>{student.age || '--'} anos</span>
            </div>
          </div>

          {/* DADOS DO DOSSIÊ (INJETADOS NA IA VISÍVEIS PARA O COACH) */}
          <div className="bg-blue-50/50 p-5 sm:p-6 rounded-[30px] border border-blue-100/50 shadow-inner">
             <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-500 mb-4 flex items-center gap-2">
               <BrainCircuit size={12}/> Dados Injetados na I.A.:
             </p>
             <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-3 rounded-[16px] border border-blue-100 shadow-sm flex items-start gap-2">
                   <Clock size={14} className="text-blue-500 shrink-0 mt-0.5" />
                   <div>
                     <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Treino</p>
                     <p className="text-xs font-bold text-slate-800">{student.train_time || 'N/A'}</p>
                   </div>
                </div>
                
                <div className="bg-white p-3 rounded-[16px] border border-blue-100 shadow-sm flex items-start gap-2">
                   <Utensils size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                   <div>
                     <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Refeições</p>
                     <p className="text-[10px] font-bold text-slate-800 leading-tight">
                        {student.meal_count ? `${student.meal_count} Refeições` : 'Padrão'}
                        <br/>
                        <span className="text-[8px] text-slate-500 font-normal leading-tight">{student.meal_flexibility || 'Flexível'}</span>
                     </p>
                   </div>
                </div>

                <div className="bg-white p-3 rounded-[16px] border border-blue-100 shadow-sm flex items-start gap-2">
                   <AlertTriangle size={14} className="text-red-500 shrink-0 mt-0.5" />
                   <div>
                     <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Alergias</p>
                     <p className="text-[10px] font-bold text-slate-800 leading-tight">{student.allergies || 'Nenhuma'}</p>
                   </div>
                </div>
                
                <div className="bg-white p-3 rounded-[16px] border border-blue-100 shadow-sm flex items-start gap-2">
                   <Ban size={14} className="text-orange-500 shrink-0 mt-0.5" />
                   <div>
                     <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Odeia Comer</p>
                     <p className="text-[10px] font-bold text-slate-800 italic leading-tight">{student.disliked_foods || 'Come tudo'}</p>
                   </div>
                </div>
                
                <div className="col-span-2 bg-white p-3 rounded-[16px] border border-blue-100 shadow-sm flex items-start gap-2">
                   <Zap size={14} className="text-purple-500 shrink-0 mt-0.5" />
                   <div>
                     <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Suplementação Atual</p>
                     <p className="text-[10px] font-bold text-slate-800 leading-tight">{student.supplements || 'Nenhum'}</p>
                   </div>
                </div>
             </div>
          </div>

          {/* INSTRUÇÕES EXTRAS */}
          <div className="bg-white p-6 sm:p-8 rounded-[35px] border border-slate-100 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.1)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-green-500"></div>
            
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 mb-4">
              <Wand2 size={14} /> Instruções Extras da Montagem (Opcional)
            </label>
            <textarea 
              className="w-full p-5 bg-slate-50 rounded-[20px] border border-slate-200 outline-none focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-500/10 font-bold text-sm h-28 resize-none transition-all placeholder:text-slate-300 text-slate-800"
              placeholder="A IA já leu o dossiê acima. Digite aqui apenas se quiser forçar algo a mais (Ex: Dieta low carb pesada, usar mais peixe, colocar doce de leite no pré-treino...)"
              value={observations}
              onChange={e => setObservations(e.target.value)}
            />
          </div>

          {/* BOTÃO GERAR */}
          <button 
            onClick={handleGenerate}
            disabled={loading || generated}
            className={`w-full p-6 sm:p-8 rounded-[30px] flex items-center justify-center shadow-xl transition-all active:scale-95 group min-h-[70px] mt-4
              ${generated 
                ? 'bg-green-500 text-white shadow-green-500/30' 
                : 'bg-slate-900 text-white hover:bg-green-600 hover:shadow-green-500/30 disabled:opacity-70 disabled:scale-100'
              }
            `}
          >
            <div className="flex items-center gap-4">
              {loading ? (
                <Loader2 size={24} className="animate-spin text-green-400" />
              ) : generated ? (
                <Save size={24} className="text-white" />
              ) : (
                <BrainCircuit size={24} className="text-green-400 group-hover:text-white transition-colors" />
              )}
              <span className="font-black uppercase italic tracking-widest text-lg sm:text-xl">
                {loading ? 'Processando Dossiê...' : generated ? 'Dieta Criada!' : 'Gerar com IA'}
              </span>
            </div>
          </button>
          
        </main>
      </div>
    </div>
  );
}