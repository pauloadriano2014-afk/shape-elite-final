'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Scale, Ruler, Ban, Clock, CheckCircle2, Loader2, CalendarClock, Pill } from 'lucide-react';

export default function AnamnesePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [finished, setFinished] = useState(false);
  const [studentId, setStudentId] = useState<string | null>(null);

  const [form, setForm] = useState({
    goal: 'Definição',
    weight: '', height: '', age: '',
    meal_count: '4', custom_meal_count: '',
    meal_flexibility: 'Flexível (3 em 3h)',
    custom_flexibility: '',
    disliked_foods: '', 
    selected_allergies: [] as string[],
    custom_allergy: '',
    selected_supplements: [] as string[],
    custom_supplement: '',
    wake_time: '07:00',
    work_start: '08:00',
    work_end: '18:00',
    train_time: '19:00',
    sleep_time: '23:00',
    extra_routine: '', 
    digestive_health: 'Normal'
  });

  const allergyOptions = ['Lactose', 'Glúten', 'Ovo', 'Amendoim', 'Frutos do Mar', 'Soja'];
  const supplementOptions = ['Whey Protein', 'Creatina', 'Multivitamínico', 'Ômega 3', 'Pré-treino', 'Glutamina', 'Albumina'];
  const timeOptions = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);

  useEffect(() => {
    const id = localStorage.getItem('temp_student_id');
    if (!id) router.push('/cadastro');
    setStudentId(id);
  }, [router]);

  const toggleItem = (listName: 'selected_allergies' | 'selected_supplements', item: string) => {
    setForm(prev => ({
      ...prev,
      [listName]: prev[listName].includes(item)
        ? prev[listName].filter(i => i !== item)
        : [...prev[listName], item]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const finalMealCount = form.meal_count === 'Outro' ? form.custom_meal_count : form.meal_count;
    const finalFlexibility = form.meal_flexibility === 'Outro / Restrito' ? form.custom_flexibility : form.meal_flexibility;
    const finalAllergies = [...form.selected_allergies, form.custom_allergy].filter(Boolean).join(', ') || 'Nenhuma';
    const finalSupplements = [...form.selected_supplements, form.custom_supplement].filter(Boolean).join(', ') || 'Nenhum';

    try {
      const res = await fetch('/api/anamnesis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...form, 
          meal_count: finalMealCount, 
          meal_flexibility: finalFlexibility,
          allergies: finalAllergies,
          supplements: finalSupplements,
          id: studentId 
        })
      });
      if (res.ok) {
        setFinished(true);
        localStorage.removeItem('temp_student_id');
      }
    } catch (err) {
      alert("Erro ao salvar ficha.");
    } finally {
      setLoading(false);
    }
  };

  if (finished) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-center">
      <div className="bg-white p-10 sm:p-12 rounded-[45px] shadow-[0_0_50px_rgba(22,163,74,0.15)] max-w-lg border-b-8 border-green-600 animate-in zoom-in-95 duration-500 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-500 rounded-full blur-[60px] opacity-20 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <CheckCircle2 size={80} className="text-green-500 mx-auto mb-6 relative z-10" />
        <h2 className="text-3xl font-black italic text-slate-900 leading-none mb-4 uppercase tracking-tighter relative z-10">Ficha Recebida!</h2>
        <p className="text-slate-600 font-bold text-sm leading-relaxed mb-8 relative z-10">
          Excelente! Seus dados já estão com o <span className="text-green-600">Paulo Adriano TEAM</span>.<br/><br/>
          Seu protocolo será estruturado em breve. <span className="uppercase text-slate-900 font-black">Aguarde o aviso para acessar!</span>
        </p>
        <button onClick={() => router.push('/login')} className="w-full bg-slate-900 text-white p-5 rounded-2xl font-black uppercase tracking-widest hover:bg-green-600 transition-all shadow-xl relative z-10">Fazer Login</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 pb-24 font-sans text-slate-900">
      <div className="max-w-3xl mx-auto">
        <header className="mb-10 text-center pt-6">
          <span className="text-[10px] font-black text-green-600 uppercase tracking-[0.4em] block mb-2">Etapa Final de Ingresso</span>
          <h1 className="text-3xl sm:text-4xl font-black italic text-slate-900 uppercase tracking-tighter">Dossiê do Aluno</h1>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8 sm:space-y-10">
          
          {/* SEÇÃO 1: CORPO */}
          <div className="bg-white p-6 sm:p-8 rounded-[35px] border border-slate-100 shadow-sm relative overflow-hidden hover:border-green-200 transition-colors">
            <div className="absolute left-0 top-0 h-full w-1.5 bg-green-500"></div>
            <h3 className="flex items-center gap-2 font-black uppercase text-sm mb-6 text-slate-900 border-b border-slate-100 pb-4"><Scale size={18} className="text-green-500"/> Medidas e Objetivo</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
               <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Objetivo</label>
                  <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm text-slate-900 outline-none focus:border-green-500 focus:bg-white transition-all appearance-none cursor-pointer" value={form.goal} onChange={e => setForm({...form, goal: e.target.value})}>
                     <option>Definição</option><option>Hipertrofia</option><option>Emagrecimento</option><option>Saúde</option>
                  </select>
               </div>
               <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Idade</label>
                  <input required type="number" placeholder="Sua idade" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm text-slate-900 outline-none focus:border-green-500 focus:bg-white transition-all placeholder:text-slate-300" value={form.age} onChange={e => setForm({...form, age: e.target.value})} />
               </div>
               <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Peso Atual (kg)</label>
                  <input required type="number" step="0.1" placeholder="Ex: 85.5" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm text-slate-900 outline-none focus:border-green-500 focus:bg-white transition-all placeholder:text-slate-300" value={form.weight} onChange={e => setForm({...form, weight: e.target.value})} />
               </div>
               <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Altura (cm)</label>
                  <input required type="number" placeholder="Ex: 175" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm text-slate-900 outline-none focus:border-green-500 focus:bg-white transition-all placeholder:text-slate-300" value={form.height} onChange={e => setForm({...form, height: e.target.value})} />
               </div>
            </div>
          </div>

          {/* SEÇÃO 2: RESTRIÇÕES ALIMENTARES */}
          <div className="bg-white p-6 sm:p-8 rounded-[35px] border border-slate-100 shadow-sm relative overflow-hidden hover:border-red-200 transition-colors">
            <div className="absolute left-0 top-0 h-full w-1.5 bg-red-500"></div>
            <h3 className="flex items-center gap-2 font-black uppercase text-sm mb-6 text-slate-900 border-b border-slate-100 pb-4"><Ban size={18} className="text-red-500"/> Alergias e Gostos</h3>
            <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 mb-3 block tracking-widest">Marque se possuir alguma destas:</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
                    {allergyOptions.map(opt => (
                      <button key={opt} type="button" onClick={() => toggleItem('selected_allergies', opt)} className={`p-3 sm:p-4 rounded-2xl text-[10px] sm:text-xs font-black uppercase transition-all border ${form.selected_allergies.includes(opt) ? 'bg-red-50 border-red-500 text-red-600 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-red-200 hover:text-red-400'}`}>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
                <input type="text" placeholder="Outra alergia ou intolerância?" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm text-slate-900 outline-none focus:border-red-500 focus:bg-white transition-all placeholder:text-slate-300" value={form.custom_allergy} onChange={e => setForm({...form, custom_allergy: e.target.value})} />
                
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Alimentos que você NÃO COME de jeito nenhum:</label>
                  <textarea placeholder="Ex: Coentro, Berinjela, Fígado..." className="w-full p-4 bg-slate-50 border border-slate-200 rounded-[20px] font-bold text-sm text-slate-900 h-28 outline-none focus:border-red-500 focus:bg-white transition-all resize-none placeholder:text-slate-300" value={form.disliked_foods} onChange={e => setForm({...form, disliked_foods: e.target.value})} />
                </div>
            </div>
          </div>

          {/* SEÇÃO 3: SUPLEMENTOS */}
          <div className="bg-white p-6 sm:p-8 rounded-[35px] border border-slate-100 shadow-sm relative overflow-hidden hover:border-amber-200 transition-colors">
            <div className="absolute left-0 top-0 h-full w-1.5 bg-amber-500"></div>
            <h3 className="flex items-center gap-2 font-black uppercase text-sm mb-6 text-slate-900 border-b border-slate-100 pb-4"><Pill size={18} className="text-amber-500"/> Suplementação Atual</h3>
            <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 mb-3 block tracking-widest">O que você já tem em casa?</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
                    {supplementOptions.map(opt => (
                      <button key={opt} type="button" onClick={() => toggleItem('selected_supplements', opt)} className={`p-3 sm:p-4 rounded-2xl text-[10px] sm:text-xs font-black uppercase transition-all border ${form.selected_supplements.includes(opt) ? 'bg-amber-50 border-amber-500 text-amber-600 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-amber-200 hover:text-amber-500'}`}>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Outros suplementos ou manipulados:</label>
                  <textarea placeholder="Liste outros produtos aqui..." className="w-full p-4 bg-slate-50 border border-slate-200 rounded-[20px] font-bold text-sm text-slate-900 h-24 outline-none focus:border-amber-500 focus:bg-white transition-all resize-none placeholder:text-slate-300" value={form.custom_supplement} onChange={e => setForm({...form, custom_supplement: e.target.value})} />
                </div>
            </div>
          </div>

          {/* SEÇÃO 4: ROTINA E FLEXIBILIDADE */}
          <div className="bg-white p-6 sm:p-8 rounded-[35px] border border-slate-100 shadow-sm relative overflow-hidden hover:border-blue-200 transition-colors">
            <div className="absolute left-0 top-0 h-full w-1.5 bg-blue-500"></div>
            <h3 className="flex items-center gap-2 font-black uppercase text-sm mb-6 text-slate-900 border-b border-slate-100 pb-4"><CalendarClock size={18} className="text-blue-500"/> Rotina e Flexibilidade</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Flexibilidade para Comer</label>
                  <select className="w-full p-4 bg-blue-50/50 border border-blue-100 rounded-2xl font-bold text-sm text-slate-900 outline-none focus:border-blue-500 focus:bg-white appearance-none cursor-pointer transition-colors" value={form.meal_flexibility} onChange={e => setForm({...form, meal_flexibility: e.target.value})}>
                    <option>Flexível (3 em 3h)</option>
                    <option>Flexível (4 em 4h)</option>
                    <option>Outro / Restrito</option>
                  </select>
                </div>

                {form.meal_flexibility === 'Outro / Restrito' && (
                  <div className="space-y-1 animate-in slide-in-from-top-2">
                    <label className="text-[10px] font-black uppercase text-blue-500 ml-2 tracking-widest">Explique sua restrição</label>
                    <input required type="text" placeholder="Ex: Só posso comer no almoço" className="w-full p-4 bg-white border border-blue-200 focus:border-blue-500 rounded-2xl font-bold text-sm text-slate-900 outline-none" value={form.custom_flexibility} onChange={e => setForm({...form, custom_flexibility: e.target.value})} />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Horário que Acorda</label>
                  <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm text-slate-900 outline-none focus:border-blue-500 focus:bg-white appearance-none cursor-pointer" value={form.wake_time} onChange={e => setForm({...form, wake_time: e.target.value})}>
                    {timeOptions.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Início do Trabalho</label>
                  <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm text-slate-900 outline-none focus:border-blue-500 focus:bg-white appearance-none cursor-pointer" value={form.work_start} onChange={e => setForm({...form, work_start: e.target.value})}>
                    {timeOptions.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Horário do Treino</label>
                  <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm text-slate-900 outline-none focus:border-blue-500 focus:bg-white appearance-none cursor-pointer" value={form.train_time} onChange={e => setForm({...form, train_time: e.target.value})}>
                    {timeOptions.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Horário que Dorme</label>
                  <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm text-slate-900 outline-none focus:border-blue-500 focus:bg-white appearance-none cursor-pointer" value={form.sleep_time} onChange={e => setForm({...form, sleep_time: e.target.value})}>
                    {timeOptions.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Observações da Agenda (Opcional)</label>
              <textarea placeholder="Ex: Trabalho em turnos, viajo muito, etc..." className="w-full p-4 bg-slate-50 border border-slate-200 rounded-[20px] font-bold text-sm text-slate-900 h-24 outline-none focus:border-blue-500 focus:bg-white transition-all resize-none placeholder:text-slate-300" value={form.extra_routine} onChange={e => setForm({...form, extra_routine: e.target.value})} />
            </div>
          </div>

          <button disabled={loading} type="submit" className="w-full bg-slate-900 text-white p-6 sm:p-7 rounded-[30px] font-black uppercase tracking-[0.2em] text-sm shadow-xl hover:bg-green-600 hover:shadow-green-500/30 transition-all active:scale-95 flex items-center justify-center gap-3">
            {loading ? <Loader2 className="animate-spin text-green-400" /> : "Enviar Ficha para o Coach"}
          </button>
        </form>
      </div>
    </div>
  );
}