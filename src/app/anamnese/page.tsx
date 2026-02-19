'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Scale, Ruler, Ban, Clock, CheckCircle2, Loader2, CalendarClock, Pill, AlertTriangle } from 'lucide-react';

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
      <div className="bg-white p-10 rounded-[45px] shadow-2xl max-w-lg border-b-[15px] border-blue-600 animate-in zoom-in-95 duration-500">
        <CheckCircle2 size={80} className="text-blue-600 mx-auto mb-6" />
        <h2 className="text-3xl font-black italic text-slate-900 leading-none mb-4 uppercase tracking-tighter">Ficha Recebida!</h2>
        <p className="text-slate-800 font-bold text-sm leading-relaxed mb-8">
          Excelente! Seus dados já estão com o <span className="text-blue-600">Paulo Adriano TEAM</span>.<br/><br/>
          Analisarei a sua rotina para estruturar um plano alimentar. <span className="uppercase text-blue-600 font-black">Aguarde meu aviso para acessar!</span>
        </p>
        <button onClick={() => router.push('/login')} className="w-full bg-black text-white p-5 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl">Fazer Login</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6 pb-24 font-sans text-slate-900">
      <div className="max-w-3xl mx-auto">
        <header className="mb-10 text-center">
          <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] block mb-2">Etapa Final de Consultoria</span>
          <h1 className="text-4xl font-black italic text-slate-900 uppercase tracking-tighter">Perfil do Aluno</h1>
        </header>

        <form onSubmit={handleSubmit} className="space-y-10">
          
          {/* SEÇÃO 1: CORPO */}
          <div className="bg-white p-8 rounded-[45px] border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="flex items-center gap-2 font-black uppercase text-sm mb-8 text-blue-600 border-b-2 border-slate-100 pb-2"><Scale size={18}/> Medidas e Objetivo</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-900 ml-2 italic">Objetivo</label>
                  <select className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl font-bold text-slate-900 outline-none focus:border-blue-600 transition-all" value={form.goal} onChange={e => setForm({...form, goal: e.target.value})}>
                     <option>Definição</option><option>Hipertrofia</option><option>Emagrecimento</option><option>Saúde</option>
                  </select>
               </div>
               <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-900 ml-2 italic">Idade</label>
                  <input required type="number" placeholder="Sua idade" className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl font-bold text-slate-900 outline-none focus:border-blue-600 transition-all" value={form.age} onChange={e => setForm({...form, age: e.target.value})} />
               </div>
               <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-900 ml-2 italic">Peso Atual (kg)</label>
                  <input required type="number" placeholder="Ex: 85" className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl font-bold text-slate-900 outline-none focus:border-blue-600 transition-all" value={form.weight} onChange={e => setForm({...form, weight: e.target.value})} />
               </div>
               <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-900 ml-2 italic">Altura (cm)</label>
                  <input required type="number" placeholder="Ex: 175" className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl font-bold text-slate-900 outline-none focus:border-blue-600 transition-all" value={form.height} onChange={e => setForm({...form, height: e.target.value})} />
               </div>
            </div>
          </div>

          {/* SEÇÃO 2: RESTRIÇÕES ALIMENTARES */}
          <div className="bg-white p-8 rounded-[45px] border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="flex items-center gap-2 font-black uppercase text-sm mb-8 text-red-600 border-b-2 border-slate-100 pb-2"><Ban size={18}/> Alergias e Gostos</h3>
            <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-900 mb-4 block italic">Marque se possuir alguma destas:</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {allergyOptions.map(opt => (
                      <button key={opt} type="button" onClick={() => toggleItem('selected_allergies', opt)} className={`p-4 rounded-2xl text-[10px] font-black uppercase transition-all border-2 ${form.selected_allergies.includes(opt) ? 'bg-red-600 border-black text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]' : 'bg-slate-50 border-slate-200 text-slate-900'}`}>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
                <input type="text" placeholder="Outra alergia ou intolerância?" className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl font-bold text-slate-900" value={form.custom_allergy} onChange={e => setForm({...form, custom_allergy: e.target.value})} />
                
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-900 ml-2 italic">Alimentos que você NÃO COME (Odie):</label>
                  <textarea placeholder="Ex: Coentro, Berinjela, Fígado..." className="w-full p-5 bg-slate-50 border-2 border-slate-200 rounded-3xl font-bold text-slate-900 h-28 outline-none focus:border-red-600 transition-all" value={form.disliked_foods} onChange={e => setForm({...form, disliked_foods: e.target.value})} />
                </div>
            </div>
          </div>

          {/* SEÇÃO 3: SUPLEMENTOS */}
          <div className="bg-white p-8 rounded-[45px] border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="flex items-center gap-2 font-black uppercase text-sm mb-8 text-amber-600 border-b-2 border-slate-100 pb-2"><Pill size={18}/> Suplementação Atual</h3>
            <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-900 mb-4 block italic">O que você já tem em casa?</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {supplementOptions.map(opt => (
                      <button key={opt} type="button" onClick={() => toggleItem('selected_supplements', opt)} className={`p-4 rounded-2xl text-[10px] font-black uppercase transition-all border-2 ${form.selected_supplements.includes(opt) ? 'bg-amber-500 border-black text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]' : 'bg-slate-50 border-slate-200 text-slate-900'}`}>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-900 ml-2 italic">Outros suplementos ou marcas:</label>
                  <textarea placeholder="Liste outros produtos ou manipulados aqui..." className="w-full p-5 bg-slate-50 border-2 border-slate-200 rounded-3xl font-bold text-slate-900 h-24 outline-none focus:border-amber-500 transition-all" value={form.custom_supplement} onChange={e => setForm({...form, custom_supplement: e.target.value})} />
                </div>
            </div>
          </div>

          {/* SEÇÃO 4: ROTINA E FLEXIBILIDADE (A NOVIDADE) */}
          <div className="bg-white p-8 rounded-[45px] border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="flex items-center gap-2 font-black uppercase text-sm mb-8 text-green-600 border-b-2 border-slate-100 pb-2"><CalendarClock size={18}/> Rotina e Flexibilidade</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-900 ml-2 italic">Flexibilidade para Comer</label>
                  <select className="w-full p-4 bg-blue-50 border-2 border-blue-200 rounded-2xl font-black text-slate-900 outline-none" value={form.meal_flexibility} onChange={e => setForm({...form, meal_flexibility: e.target.value})}>
                    <option>Flexível (3 em 3h)</option>
                    <option>Flexível (4 em 4h)</option>
                    <option>Outro / Restrito</option>
                  </select>
                </div>

                {form.meal_flexibility === 'Outro / Restrito' && (
                  <div className="space-y-1 animate-in slide-in-from-top-2">
                    <label className="text-[10px] font-black uppercase text-red-600 ml-2 italic">Explique sua restrição</label>
                    <input required type="text" placeholder="Ex: Só posso comer no almoço" className="w-full p-4 bg-white border-2 border-red-200 rounded-2xl font-bold text-slate-900 outline-none" value={form.custom_flexibility} onChange={e => setForm({...form, custom_flexibility: e.target.value})} />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-900 ml-2 italic">Horário que Acorda</label>
                  <select className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl font-bold text-slate-900" value={form.wake_time} onChange={e => setForm({...form, wake_time: e.target.value})}>
                    {timeOptions.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-900 ml-2 italic">Início do Trabalho</label>
                  <select className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl font-bold text-slate-900" value={form.work_start} onChange={e => setForm({...form, work_start: e.target.value})}>
                    {timeOptions.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-900 ml-2 italic">Horário do Treino</label>
                  <select className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl font-bold text-slate-900" value={form.train_time} onChange={e => setForm({...form, train_time: e.target.value})}>
                    {timeOptions.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-900 ml-2 italic">Horário que Dorme</label>
                  <select className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl font-bold text-slate-900" value={form.sleep_time} onChange={e => setForm({...form, sleep_time: e.target.value})}>
                    {timeOptions.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-900 ml-2 italic">Observações Extras da Agenda (Opcional)</label>
              <textarea placeholder="Ex: Trabalho em turnos, viajo muito, etc..." className="w-full p-5 bg-slate-50 border-2 border-slate-200 rounded-3xl font-bold text-slate-900 h-24 outline-none focus:border-green-600 transition-all" value={form.extra_routine} onChange={e => setForm({...form, extra_routine: e.target.value})} />
            </div>
          </div>

          <button disabled={loading} type="submit" className="w-full bg-blue-600 text-white p-7 rounded-[40px] font-black uppercase italic text-xl shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-4">
            {loading ? <Loader2 className="animate-spin" /> : "Finalizar Ficha de Aluno"}
          </button>
        </form>
      </div>
    </div>
  );
}