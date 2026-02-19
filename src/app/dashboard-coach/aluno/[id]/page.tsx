'use client'

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft, Scale, Ruler, Target, BrainCircuit, Save, History, 
  Edit3, ArrowRight, User as UserIcon, Loader2, Maximize2, 
  Clock, Ban, Pill, Utensils, CalendarDays, Zap
} from 'lucide-react';

export default function PerfilAlunoPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [measures, setMeasures] = useState({ weight: '', height: '' });
  const [saving, setSaving] = useState(false);

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
      } catch (err) { console.error("Erro na carga"); } finally { setLoading(false); }
    }
    loadData();
  }, [id]);

  const togglePhotoPosition = async () => {
    if (!student) return;
    const newPos = student.photoPosition === 'top' ? 'center' : 'top';
    setStudent({ ...student, photoPosition: newPos });
    try {
      await fetch('/api/students/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, photoPosition: newPos })
      });
    } catch (err) { console.error("Erro ao salvar posição"); }
  };

  const saveMeasures = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/students/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, weight: measures.weight, height: measures.height })
      });
      if (res.ok) {
        setStudent((prev: any) => ({ ...prev, weight: measures.weight, height: measures.height }));
        setEditMode(false);
      }
    } catch (err) { console.error(err); } finally { setSaving(false); }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center">
      <div className="w-16 h-16 border-8 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="font-black uppercase italic tracking-widest text-blue-500">Acessando Perfil do Aluno...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6 pb-32 text-black font-sans">
      
      <header className="max-w-5xl mx-auto mb-8 flex justify-between items-center bg-white p-5 rounded-[30px] border-2 border-black shadow-sm">
        <button onClick={() => router.push('/dashboard-coach')} className="text-[10px] font-black uppercase italic border-b-4 border-blue-600 flex items-center gap-2 hover:bg-slate-50 transition-all">
          <ChevronLeft size={16} /> Voltar
        </button>
        <button 
          onClick={() => editMode ? saveMeasures() : setEditMode(true)}
          disabled={saving}
          className="bg-black text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase flex items-center gap-2 shadow-xl active:scale-95 transition-all hover:bg-blue-600"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : editMode ? <Save size={14} /> : <Edit3 size={14} />}
          {editMode ? 'Salvar' : 'Medidas'}
        </button>
      </header>

      <main className="max-w-5xl mx-auto space-y-10">
        
        <div className="bg-black text-white p-10 rounded-[50px] shadow-2xl relative border-b-[12px] border-blue-600 overflow-hidden text-center">
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600 rounded-full blur-[80px] opacity-20 -translate-y-1/2 translate-x-1/2"></div>
          <div className="flex flex-col items-center relative z-10">
            <div className="relative group mb-6">
                <div className="w-32 h-32 bg-slate-800 rounded-[40px] border-4 border-blue-500 flex items-center justify-center overflow-hidden shadow-2xl">
                {student?.photoUrl ? (
                    <img src={student.photoUrl} className={`w-full h-full object-cover ${student.photoPosition === 'top' ? 'object-top' : 'object-center'}`} />
                ) : (
                    <UserIcon size={48} className="text-slate-600" />
                )}
                </div>
                <button onClick={togglePhotoPosition} className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-3 rounded-2xl shadow-lg border-2 border-black hover:scale-110 transition-all"><Maximize2 size={16} /></button>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 mb-2 italic text-blue-400">Aluno de Elite</p>
            <h2 className="text-4xl font-black uppercase italic tracking-tighter leading-none mb-4">{student?.full_name}</h2>
            <div className="flex items-center gap-3 bg-white/10 px-6 py-2 rounded-2xl text-[11px] font-black uppercase italic border border-white/5"><Target size={14} className="text-blue-400" /> {student?.goal}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          <div className="bg-white p-8 rounded-[45px] border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center">
            <Scale size={28} className="text-blue-600 mb-4" />
            <span className="text-[10px] font-black uppercase text-slate-400 mb-2 italic text-center">Peso (kg)</span>
            <span className="text-4xl font-black italic">{student?.weight || '--'}</span>
          </div>
          <div className="bg-white p-8 rounded-[45px] border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center">
            <Ruler size={28} className="text-blue-600 mb-4" />
            <span className="text-[10px] font-black uppercase text-slate-400 mb-2 italic text-center">Altura (cm)</span>
            <span className="text-4xl font-black italic">{student?.height || '--'}</span>
          </div>
          <div className="bg-white p-8 rounded-[45px] border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center">
            <Utensils size={28} className="text-blue-600 mb-4" />
            <span className="text-[10px] font-black uppercase text-slate-400 mb-2 italic text-center">Refeições</span>
            <span className="text-4xl font-black italic">{student?.meal_count || '--'}</span>
          </div>
          <div className="bg-white p-8 rounded-[45px] border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center">
            <UserIcon size={28} className="text-blue-600 mb-4" />
            <span className="text-[10px] font-black uppercase text-slate-400 mb-2 italic text-center">Idade</span>
            <span className="text-4xl font-black italic">{student?.age || '--'}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Bloco Alergias */}
            <div className="bg-white p-8 rounded-[45px] border-4 border-black shadow-[10px_10px_0px_0px_rgba(239,68,68,1)]">
              <h4 className="flex items-center gap-2 font-black uppercase text-sm mb-6 text-red-600"><Ban size={20}/> Alergias e Gostos</h4>
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-2xl"><p className="text-[9px] font-black uppercase text-slate-400 mb-1">Alergias</p><p className="font-bold text-slate-900">{student?.allergies || 'Nenhuma'}</p></div>
                <div className="bg-slate-50 p-4 rounded-2xl"><p className="text-[9px] font-black uppercase text-slate-400 mb-1">Não Come</p><p className="font-bold text-slate-900 italic">"{student?.disliked_foods || 'Nada informado'}"</p></div>
              </div>
            </div>
            {/* Bloco Suplementos e Flexibilidade */}
            <div className="bg-white p-8 rounded-[45px] border-4 border-black shadow-[10px_10px_0px_0px_rgba(245,158,11,1)]">
              <h4 className="flex items-center gap-2 font-black uppercase text-sm mb-6 text-amber-600"><Pill size={20}/> Suplementos e Rotina</h4>
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-2xl"><p className="text-[9px] font-black uppercase text-slate-400 mb-1">Suplementação</p><p className="font-bold text-slate-900">{student?.supplements || 'Nenhum'}</p></div>
                <div className="bg-slate-50 p-4 rounded-2xl"><p className="text-[9px] font-black uppercase text-slate-400 mb-1">Flexibilidade</p><p className="font-bold text-slate-900 uppercase text-xs">{student?.meal_flexibility}</p></div>
              </div>
            </div>
            {/* Cronograma (Fixing indicators) */}
            <div className="md:col-span-2 bg-white p-10 rounded-[50px] border-4 border-black shadow-[12px_12px_0px_0px_rgba(34,197,94,1)]">
              <h4 className="flex items-center gap-2 font-black uppercase text-sm mb-8 text-green-600"><Clock size={20}/> Cronograma Diário</h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                 {[
                   { label: 'Acorda', time: student?.wake_time },
                   { label: 'Início Trab.', time: student?.work_start },
                   { label: 'Fim Trab.', time: student?.work_end },
                   { label: 'Treina', time: student?.train_time },
                   { label: 'Dorme', time: student?.sleep_time },
                 ].map((item, idx) => (
                   <div key={idx} className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-100 text-center">
                      <p className="text-[9px] font-black uppercase text-slate-400 mb-2">{item.label}</p>
                      <p className="text-2xl font-black italic text-slate-900 leading-none">{item.time || '--:--'}</p>
                   </div>
                 ))}
              </div>
            </div>
        </div>

        {/* --- BOTÕES DE AÇÃO (IA DE VOLTA) --- */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-8 border-t-2 border-slate-100">
          <button onClick={() => router.push(`/dashboard-coach/aluno/${id}/editor-pro`)} className="w-full flex items-center justify-between bg-white text-black p-8 rounded-[40px] border-4 border-black shadow-[12px_12px_0px_0px_rgba(37,99,235,1)] hover:translate-x-1 hover:translate-y-1 transition-all active:scale-95 group">
            <div className="flex items-center gap-4 text-left">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center border-2 border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-all"><Edit3 size={28} /></div>
              <div><span className="font-black uppercase italic tracking-tighter text-2xl block leading-none">Montar Dieta</span><span className="text-[10px] font-black uppercase text-slate-400 mt-1 italic">Plano Manual</span></div>
            </div>
            <ArrowRight size={26} className="text-blue-600" />
          </button>

          <button onClick={() => router.push(`/dashboard-coach/aluno/${id}/gerar-dieta-ia`)} className="w-full flex items-center justify-between bg-black text-white p-8 rounded-[40px] shadow-2xl border-b-[10px] border-blue-600 hover:bg-blue-900 transition-all active:scale-95 group">
            <div className="flex items-center gap-4 text-left">
              <div className="w-14 h-14 bg-white/10 text-blue-400 rounded-3xl flex items-center justify-center backdrop-blur-md"><BrainCircuit size={28} /></div>
              <div><span className="font-black uppercase italic tracking-tighter text-2xl block leading-none">Gerar por IA</span><span className="text-[10px] font-black uppercase text-blue-300 mt-1 italic">Estratégia Virtual</span></div>
            </div>
            <ArrowRight size={26} className="text-blue-400 opacity-50" />
          </button>

          <button onClick={() => router.push(`/dashboard-coach/aluno/${id}/dieta-atual`)} className="w-full flex items-center justify-between bg-white text-black p-8 rounded-[40px] border-2 border-slate-200 shadow-sm hover:border-black transition-all group">
            <div className="flex items-center gap-4 text-left">
              <div className="w-14 h-14 bg-slate-50 text-slate-400 rounded-3xl flex items-center justify-center border-2 border-slate-100 group-hover:bg-black group-hover:text-white transition-all"><History size={28} /></div>
              <div><span className="font-black uppercase italic tracking-tighter text-2xl block leading-none text-slate-500 group-hover:text-black">Dieta Ativa</span><span className="text-[10px] font-black uppercase text-slate-400 mt-1 italic text-center">Visualizar</span></div>
            </div>
            <Zap size={26} className="text-slate-200 group-hover:text-amber-500" />
          </button>
        </div>
      </main>
    </div>
  );
}