'use client'

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft, Scale, Ruler, Target, BrainCircuit, Save, History, 
  Edit3, ArrowRight, User as UserIcon, Loader2, Maximize2, 
  Clock, Ban, Pill, Utensils, Zap, Activity, Droplets, Flame, FileText, MessageCircle, Camera, CalendarDays, CheckCircle, Phone
} from 'lucide-react';

export default function PerfilAlunoPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  
  const [student, setStudent] = useState<any>(null);
  const [checkin, setCheckin] = useState<any>(null);
  const [evolucao, setEvolucao] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  
  const [measures, setMeasures] = useState({ weight: '', height: '', phone: '' });
  const [saving, setSaving] = useState(false);
  
  const [activeTab, setActiveTab] = useState<'dossie' | 'prescricao' | 'evolucao'>('dossie');

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`/api/students/details?id=${id}`);
        if (res.ok) {
          const data = await res.json();
          setStudent(data);
          setMeasures({ 
            weight: data.weight ? String(data.weight) : '', 
            height: data.height ? String(data.height) : '',
            phone: data.phone ? String(data.phone) : ''
          });
        }

        const today = new Date().toISOString().split('T')[0];
        const checkinRes = await fetch(`/api/checkins?studentId=${id}&date=${today}`);
        if (checkinRes.ok) {
          const cData = await checkinRes.json();
          setCheckin(cData);
        }

        const evoRes = await fetch(`/api/evolucao?studentId=${id}`);
        if (evoRes.ok) {
          const eData = await evoRes.json();
          setEvolucao(eData);
        }

      } catch (err) { 
        console.error("Erro na carga"); 
      } finally { 
        setLoading(false); 
      }
    }
    loadData();
  }, [id]);

  // 📸 UPLOAD DE FOTO PELO COACH
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      setStudent((prev: any) => ({ ...prev, photoUrl: base64String }));
      try {
        await fetch('/api/students/update-photo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ studentId: id, photoUrl: base64String })
        });
      } catch (error) {
        console.error("Erro ao subir foto", error);
      }
    };
    reader.readAsDataURL(file);
  };

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
        body: JSON.stringify({ 
          id, 
          weight: measures.weight, 
          height: measures.height,
          phone: measures.phone 
        })
      });
      if (res.ok) {
        setStudent((prev: any) => ({ 
          ...prev, 
          weight: measures.weight, 
          height: measures.height,
          phone: measures.phone
        }));
        setEditMode(false);
      }
    } catch (err) { console.error(err); } finally { setSaving(false); }
  };

  const scheduleCheckin = async (days: number, customDate?: string) => {
    let dateToSave = customDate;
    if (!dateToSave) {
      const date = new Date();
      date.setDate(date.getDate() + days);
      dateToSave = date.toISOString().split('T')[0];
    }
    
    try {
      await fetch('/api/students/schedule-checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: id, date: dateToSave })
      });
      setStudent((prev: any) => ({ ...prev, next_checkin_date: dateToSave }));
      alert(`✅ Avaliação agendada com sucesso!`);
    } catch (err) {
      console.error("Erro ao agendar", err);
    }
  };

  // 🚨 FUNÇÕES DA ZONA DE PERIGO 🚨
  const handleDelete = async () => {
    if (confirm("🚨 ATENÇÃO: Isso vai apagar TODAS as dietas, fotos e dados desse aluno para sempre. Tem certeza absoluta?")) {
      try {
        setLoading(true);
        const res = await fetch(`/api/students/delete?id=${id}`, { method: 'DELETE' });
        if (res.ok) {
          alert("Aluno aniquilado com sucesso!");
          router.push('/dashboard-coach'); 
        } else alert("Erro ao excluir.");
      } catch (err) { alert("Erro de conexão."); } finally { setLoading(false); }
    }
  };

  const handleInativar = async () => {
    if (confirm("Bloquear acesso deste aluno? Ele sumirá do seu painel e não poderá entrar no app.")) {
      try {
        setLoading(true);
        const res = await fetch(`/api/students/inativar`, { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify({ id }) 
        });
        if (res.ok) {
          alert("Aluno inativado e bloqueado!");
          router.push('/dashboard-coach');
        } else alert("Erro ao inativar.");
      } catch (err) { alert("Erro de conexão."); } finally { setLoading(false); }
    }
  };

  if (loading) return (
    <div className="min-h-[100dvh] bg-slate-900 flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[20rem] h-[20rem] bg-green-600 rounded-full blur-[120px] opacity-20 pointer-events-none"></div>
      <div className="w-32 h-32 sm:w-40 sm:h-40 relative animate-[pulse_2s_ease-in-out_infinite] mb-6">
        <img src="/logo.png" alt="Carregando..." className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(22,163,74,0.4)]" />
      </div>
      <p className="font-black uppercase tracking-[0.4em] text-green-500 italic text-xs sm:text-sm relative z-10">Acessando Dossiê...</p>
    </div>
  );

  return (
    <div className="min-h-[100dvh] bg-slate-50 px-4 sm:px-6 pt-[max(env(safe-area-inset-top,1.5rem),1.5rem)] pb-[env(safe-area-inset-bottom,100px)] text-black font-sans">
      
      {/* HEADER ELITE */}
      <header className="max-w-5xl mx-auto mb-6 sm:mb-8 flex justify-between items-center bg-white p-3 sm:p-5 rounded-[24px] sm:rounded-[30px] border border-slate-200 shadow-sm relative overflow-hidden gap-2">
        <button onClick={() => router.push('/dashboard-coach')} className="relative z-10 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] bg-slate-50 border border-slate-200 hover:border-green-400 p-3 sm:px-5 sm:py-3 rounded-[16px] sm:rounded-[20px] flex items-center gap-2 hover:text-green-600 transition-all active:scale-95 shrink-0">
          <ChevronLeft size={16} /> <span className="hidden sm:inline">Voltar ao Painel</span>
        </button>
        <button 
          onClick={() => editMode ? saveMeasures() : setEditMode(true)}
          disabled={saving}
          className="relative z-10 bg-slate-900 text-white px-4 py-3 sm:px-8 sm:py-4 rounded-[16px] sm:rounded-[20px] text-[9px] sm:text-xs font-black uppercase tracking-[0.1em] sm:tracking-[0.2em] flex items-center justify-center gap-1.5 sm:gap-3 shadow-xl hover:bg-green-600 hover:shadow-green-500/30 active:scale-95 transition-all disabled:opacity-70 disabled:scale-100 shrink-0"
        >
          {saving ? <Loader2 size={14} className="animate-spin text-green-400 shrink-0" /> : editMode ? <Save size={14} className="text-green-400 shrink-0" /> : <Edit3 size={14} className="text-green-400 shrink-0" />}
          <span className="hidden sm:inline">{editMode ? 'Salvar Dados' : 'Atualizar Medidas'}</span>
          <span className="sm:hidden">{editMode ? 'Salvar' : 'Medidas'}</span>
        </button>
      </header>

      <main className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
        
        {/* BANNER PRINCIPAL DO ALUNO */}
        <div className="bg-slate-900 text-white px-4 py-8 sm:p-10 rounded-[35px] sm:rounded-[50px] shadow-2xl relative border-b-4 border-green-600 overflow-hidden text-center">
          <div className="absolute top-0 right-0 w-48 h-48 bg-green-600 rounded-full blur-[80px] opacity-20 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          
          <div className="flex flex-col items-center relative z-10">
            <div className="relative group mb-5 sm:mb-6">
                <div className="w-28 h-28 sm:w-32 sm:h-32 bg-slate-800 rounded-[35px] sm:rounded-[40px] border-2 border-slate-700 flex items-center justify-center overflow-hidden shadow-2xl relative group">
                  {student?.photoUrl ? (
                      <img src={student.photoUrl} className={`w-full h-full object-cover ${student.photoPosition === 'top' ? 'object-top' : 'object-center'}`} />
                  ) : (
                      <UserIcon size={48} className="text-slate-600" />
                  )}
                  <div className="absolute inset-0 border-4 border-green-500 rounded-[35px] sm:rounded-[40px] pointer-events-none z-10"></div>
                  
                  {/* OVERLAY DE UPLOAD DO COACH (Aparece no hover) */}
                  <label className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-20">
                      <Camera size={24} className="text-white mb-1" />
                      <span className="text-[8px] font-black text-white uppercase tracking-widest text-center px-2 leading-tight">Mudar<br/>Foto</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                  </label>
                </div>
                
                {/* BOTÃO DE AJUSTAR POSIÇÃO DA FOTO */}
                <button 
                  onClick={togglePhotoPosition} 
                  className="absolute -bottom-2 -right-2 bg-green-600 text-white p-2.5 sm:p-3 rounded-[16px] sm:rounded-[20px] shadow-[0_5px_15px_rgba(22,163,74,0.4)] hover:scale-110 active:scale-95 transition-all border-2 border-slate-900 z-30"
                >
                  <Maximize2 size={16} />
                </button>
            </div>
            
            <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.4em] opacity-80 mb-2 italic text-green-400">Atleta Team Elite</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase italic tracking-tighter leading-none mb-4 max-w-full truncate px-2">{student?.full_name}</h2>
            
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              <div className="flex items-center gap-2 sm:gap-3 bg-white/10 px-4 sm:px-6 py-2 sm:py-2.5 rounded-[16px] sm:rounded-[20px] text-[10px] sm:text-[11px] font-black uppercase italic border border-white/5 backdrop-blur-sm">
                <Target size={14} className="text-green-400" /> 
                {student?.goal || 'Não informado'}
              </div>

              {student?.phone && (
                <a 
                  href={`https://wa.me/55${student.phone.replace(/\D/g, '')}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-green-500 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-[16px] sm:rounded-[20px] text-[10px] sm:text-[11px] font-black uppercase italic shadow-[0_5px_15px_rgba(22,163,74,0.3)] hover:scale-105 active:scale-95 transition-all"
                >
                  <MessageCircle size={14} /> Chamar no App
                </a>
              )}
            </div>
          </div>
        </div>

        {/* --- NAVEGAÇÃO DE ABAS --- */}
        <div className="flex bg-slate-200/60 p-1.5 rounded-[20px] max-w-2xl mx-auto relative z-20 gap-1 overflow-x-auto no-scrollbar">
            <button 
                onClick={() => setActiveTab('dossie')} 
                className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-3.5 rounded-[16px] font-black uppercase text-[10px] sm:text-xs tracking-widest transition-all ${activeTab === 'dossie' ? 'bg-white text-slate-900 shadow-md scale-[1.02]' : 'text-slate-400 hover:text-slate-600'}`}
            > 
                <FileText size={16}/> Dossiê 
            </button>
            <button 
                onClick={() => setActiveTab('prescricao')} 
                className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-3.5 rounded-[16px] font-black uppercase text-[10px] sm:text-xs tracking-widest transition-all ${activeTab === 'prescricao' ? 'bg-white text-slate-900 shadow-md scale-[1.02]' : 'text-slate-400 hover:text-slate-600'}`}
            > 
                <Utensils size={16}/> Prescrição 
            </button>
            <button 
                onClick={() => setActiveTab('evolucao')} 
                className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-3.5 rounded-[16px] font-black uppercase text-[10px] sm:text-xs tracking-widest transition-all ${activeTab === 'evolucao' ? 'bg-slate-900 text-green-400 shadow-md scale-[1.02]' : 'text-slate-400 hover:text-slate-600'}`}
            > 
                <Camera size={16}/> Check-in 
            </button>
        </div>

        {/* =========================================
            ABA 3: CHECK-IN / EVOLUÇÃO DAS FOTOS
        ========================================= */}
        {activeTab === 'evolucao' && (
            <div className="space-y-6 sm:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12 sm:pb-20">
               <div className="bg-white p-5 sm:p-6 rounded-[25px] sm:rounded-[30px] border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h4 className="font-black uppercase tracking-widest text-slate-800 flex items-center gap-2 text-sm">
                       <CalendarDays size={18} className="text-green-600"/> Próxima Avaliação
                    </h4>
                    <p className="text-[10px] sm:text-xs text-slate-400 font-bold mt-1 uppercase tracking-widest">
                       {student?.next_checkin_date 
                          ? `Agendado para: ${new Date(student.next_checkin_date).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}` 
                          : 'Check-in realizado / Aguardando nova data'}
                    </p>
                  </div>
                  <div className="flex flex-wrap sm:flex-nowrap gap-2 w-full sm:w-auto">
                     <button onClick={() => scheduleCheckin(15)} className="flex-1 sm:flex-none bg-slate-100 hover:bg-green-100 hover:text-green-700 text-slate-600 font-black uppercase text-[10px] sm:text-xs px-4 py-3 rounded-[14px] transition-all border border-transparent hover:border-green-300">
                        +15 Dias
                     </button>
                     <button onClick={() => scheduleCheckin(30)} className="flex-1 sm:flex-none bg-slate-100 hover:bg-green-100 hover:text-green-700 text-slate-600 font-black uppercase text-[10px] sm:text-xs px-4 py-3 rounded-[14px] transition-all border border-transparent hover:border-green-300">
                        +30 Dias
                     </button>
                     <div className="relative flex-1 sm:flex-none w-full sm:w-auto min-w-[130px]">
                        <input 
                           type="date" 
                           onChange={(e) => scheduleCheckin(0, e.target.value)} 
                           className="w-full bg-slate-900 text-white font-black uppercase text-[10px] sm:text-xs px-4 py-3 rounded-[14px] outline-none cursor-pointer tracking-widest text-center [color-scheme:dark]" 
                        />
                     </div>
                  </div>
               </div>

               {evolucao.length === 0 ? (
                  <div className="bg-white border-4 border-dashed border-slate-200 rounded-[40px] p-12 text-center flex flex-col items-center justify-center shadow-sm">
                     <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
                       <Camera size={32} />
                     </div>
                     <h3 className="font-black text-xl uppercase italic text-slate-800 tracking-tighter">Nenhum Check-in</h3>
                     <p className="text-slate-400 font-bold text-xs mt-2">O aluno ainda não enviou fotos de avaliação.</p>
                  </div>
               ) : (
                  <div className="space-y-8 sm:space-y-12">
                     {evolucao.map((item, index) => (
                        <div key={item.id} className="bg-slate-900 rounded-[30px] sm:rounded-[40px] p-5 sm:p-10 shadow-xl border border-slate-800 relative overflow-hidden">
                           <div className={`absolute top-0 right-0 w-32 h-32 blur-[80px] opacity-10 ${index === 0 ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                           
                           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 mb-6 sm:mb-8 border-b border-slate-800 pb-5 sm:pb-6 relative z-10">
                              <div>
                                 <div className={`flex items-center gap-2 mb-1 ${index === 0 ? 'text-green-400' : 'text-blue-400'}`}>
                                   <CheckCircle size={16} />
                                   <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em]">
                                       {index === 0 ? 'Avaliação Atual' : `Avaliação em ${new Date(item.data_checkin).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}`}
                                   </span>
                                 </div>
                                 <h3 className="text-xl sm:text-3xl font-black text-white italic tracking-tighter uppercase">
                                   {index === 0 ? 'Check-in Recente' : 'Histórico de Evolução'}
                                 </h3>
                              </div>

                              <div className="bg-slate-800 border border-slate-700 p-3 sm:p-4 rounded-[16px] sm:rounded-[20px] flex items-center gap-3 sm:gap-4 w-full sm:w-auto shrink-0">
                                 <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500/10 text-green-400 rounded-xl flex items-center justify-center shrink-0">
                                   <Scale size={20} className="sm:w-[24px] sm:h-[24px]"/>
                                 </div>
                                 <div>
                                   <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Peso Registrado</p>
                                   <p className="text-xl sm:text-2xl font-black italic text-white">{item.peso} <span className="text-xs sm:text-sm text-green-400">kg</span></p>
                                 </div>
                              </div>
                           </div>

                           <div className="grid grid-cols-3 gap-2 sm:gap-6 relative z-10">
                              <div className="flex flex-col gap-1.5 sm:gap-2">
                                 <div className="bg-slate-800 text-slate-400 text-[7px] sm:text-[10px] font-black uppercase tracking-widest text-center py-1.5 sm:py-2.5 rounded-t-[12px] sm:rounded-t-[16px] border border-slate-700 border-b-0 truncate px-1">Frontal</div>
                                 <a href={item.foto_frente} target="_blank" className="aspect-[3/4] bg-slate-800 rounded-b-[12px] sm:rounded-b-[16px] overflow-hidden border border-slate-700 relative group cursor-pointer block shadow-lg">
                                   <img src={item.foto_frente} alt="Frente" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                   <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-sm">
                                     <Maximize2 size={24} className="text-white drop-shadow-lg sm:w-[32px] sm:h-[32px]" />
                                   </div>
                                 </a>
                              </div>
                              <div className="flex flex-col gap-1.5 sm:gap-2">
                                 <div className="bg-slate-800 text-slate-400 text-[7px] sm:text-[10px] font-black uppercase tracking-widest text-center py-1.5 sm:py-2.5 rounded-t-[12px] sm:rounded-t-[16px] border border-slate-700 border-b-0 truncate px-1">Lateral</div>
                                 <a href={item.foto_lado} target="_blank" className="aspect-[3/4] bg-slate-800 rounded-b-[12px] sm:rounded-b-[16px] overflow-hidden border border-slate-700 relative group cursor-pointer block shadow-lg">
                                   <img src={item.foto_lado} alt="Lado" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                   <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-sm">
                                     <Maximize2 size={24} className="text-white drop-shadow-lg sm:w-[32px] sm:h-[32px]" />
                                   </div>
                                 </a>
                              </div>
                              <div className="flex flex-col gap-1.5 sm:gap-2">
                                 <div className="bg-slate-800 text-slate-400 text-[7px] sm:text-[10px] font-black uppercase tracking-widest text-center py-1.5 sm:py-2.5 rounded-t-[12px] sm:rounded-t-[16px] border border-slate-700 border-b-0 truncate px-1">Dorsal</div>
                                 <a href={item.foto_costas} target="_blank" className="aspect-[3/4] bg-slate-800 rounded-b-[12px] sm:rounded-b-[16px] overflow-hidden border border-slate-700 relative group cursor-pointer block shadow-lg">
                                   <img src={item.foto_costas} alt="Costas" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                   <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-sm">
                                     <Maximize2 size={24} className="text-white drop-shadow-lg sm:w-[32px] sm:h-[32px]" />
                                   </div>
                                 </a>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               )}
            </div>
        )}

        {/* =========================================
            ABA 1: DOSSIÊ CLÍNICO E RASTREIO
        ========================================= */}
        {activeTab === 'dossie' && (
            <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* INDICADORES GERAIS */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                  <div className="bg-white p-5 sm:p-6 rounded-[25px] sm:rounded-[30px] border border-slate-100 shadow-sm flex flex-col items-center justify-center relative overflow-hidden group hover:border-green-200 transition-colors">
                    <Scale size={20} className="text-green-600 mb-2" />
                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Peso</span>
                    {editMode ? (
                      <input type="number" step="0.1" value={measures.weight} onChange={e => setMeasures({...measures, weight: e.target.value})} className="w-full text-center text-xl font-black italic text-slate-900 border-b-2 border-green-500 focus:outline-none bg-transparent" />
                    ) : (
                      <span className="text-xl sm:text-2xl font-black italic text-slate-800">{student?.weight ? `${student.weight}kg` : '--'}</span>
                    )}
                  </div>
                  
                  <div className="bg-white p-5 sm:p-6 rounded-[25px] sm:rounded-[30px] border border-slate-100 shadow-sm flex flex-col items-center justify-center relative overflow-hidden group hover:border-green-200 transition-colors">
                    <Ruler size={20} className="text-green-600 mb-2" />
                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Altura</span>
                    {editMode ? (
                      <input type="number" value={measures.height} onChange={e => setMeasures({...measures, height: e.target.value})} className="w-full text-center text-xl font-black italic text-slate-900 border-b-2 border-green-500 focus:outline-none bg-transparent" />
                    ) : (
                      <span className="text-xl sm:text-2xl font-black italic text-slate-800">{student?.height ? `${student.height}cm` : '--'}</span>
                    )}
                  </div>

                  {/* TELEFONE EDITÁVEL */}
                  <div className="col-span-2 lg:col-span-1 bg-white p-5 sm:p-6 rounded-[25px] sm:rounded-[30px] border border-slate-100 shadow-sm flex flex-col items-center justify-center relative overflow-hidden group hover:border-green-200 transition-colors">
                    <Phone size={20} className="text-green-600 mb-2" />
                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">WhatsApp</span>
                    {editMode ? (
                      <input type="text" placeholder="Ex: 11999999999" value={measures.phone} onChange={e => setMeasures({...measures, phone: e.target.value})} className="w-full text-center text-sm font-black italic text-slate-900 border-b-2 border-green-500 focus:outline-none bg-transparent" />
                    ) : (
                      <span className="text-base sm:text-lg font-black italic text-slate-800 break-all px-2">{student?.phone || '--'}</span>
                    )}
                  </div>
                  
                  <div className="bg-white p-5 sm:p-6 rounded-[25px] sm:rounded-[30px] border border-slate-100 shadow-sm flex flex-col items-center justify-center relative overflow-hidden group">
                    <Utensils size={20} className="text-slate-400 mb-2" />
                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Refeições</span>
                    <span className="text-xl sm:text-2xl font-black italic text-slate-800">{student?.meal_count || '--'}</span>
                  </div>
                  
                  <div className="bg-white p-5 sm:p-6 rounded-[25px] sm:rounded-[30px] border border-slate-100 shadow-sm flex flex-col items-center justify-center relative overflow-hidden group">
                    <UserIcon size={20} className="text-slate-400 mb-2" />
                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Idade</span>
                    <span className="text-xl sm:text-2xl font-black italic text-slate-800">{student?.age || '--'}</span>
                  </div>
                </div>

                {/* RASTREAMENTO DO DIA */}
                <div>
                  <h3 className="flex items-center gap-2 font-black uppercase text-sm mb-4 sm:mb-6 text-slate-800 tracking-widest pl-2">
                    <Activity size={18} className="text-green-500" /> Rastreamento do Dia (Hoje)
                  </h3>

                  {!checkin ? (
                    <div className="bg-white border-2 border-dashed border-slate-200 rounded-[30px] p-8 text-center flex flex-col items-center gap-3">
                      <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center text-slate-300"><Clock size={20}/></div>
                      <p className="text-slate-400 font-bold text-xs sm:text-sm">O aluno ainda não registrou nada hoje.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                      <div className="bg-white p-5 sm:p-6 rounded-[25px] sm:rounded-[30px] border border-slate-100 shadow-sm relative overflow-hidden hover:border-blue-200 transition-colors">
                        <div className="absolute left-0 top-0 h-full w-1.5 bg-blue-500"></div>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-[14px] flex items-center justify-center"><Droplets size={20} /></div>
                          <h4 className="font-black uppercase tracking-widest text-slate-800 text-xs">Água</h4>
                        </div>
                        <p className="text-3xl sm:text-4xl font-black italic text-blue-600">{checkin.water_ml ? (checkin.water_ml / 1000).toFixed(2) + 'L' : '0.00L'}</p>
                      </div>

                      <div className="bg-white p-5 sm:p-6 rounded-[25px] sm:rounded-[30px] border border-slate-100 shadow-sm relative overflow-hidden hover:border-green-200 transition-colors">
                        <div className="absolute left-0 top-0 h-full w-1.5 bg-green-500"></div>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-green-50 text-green-600 rounded-[14px] flex items-center justify-center"><Activity size={20} /></div>
                          <h4 className="font-black uppercase tracking-widest text-slate-800 text-xs">Biofeedback</h4>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center bg-slate-50 px-4 py-2.5 rounded-[12px] border border-slate-100"><span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Fome</span><span className="text-[11px] sm:text-xs font-bold text-slate-800">{checkin.fome || '--'}</span></div>
                          <div className="flex justify-between items-center bg-slate-50 px-4 py-2.5 rounded-[12px] border border-slate-100"><span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Intestino</span><span className="text-[11px] sm:text-xs font-bold text-slate-800">{checkin.digestao || '--'}</span></div>
                          <div className="flex justify-between items-center bg-slate-50 px-4 py-2.5 rounded-[12px] border border-slate-100"><span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Energia</span><span className="text-[11px] sm:text-xs font-bold text-slate-800">{checkin.energia || '--'}</span></div>
                        </div>
                      </div>

                      <div className="bg-white p-5 sm:p-6 rounded-[25px] sm:rounded-[30px] border border-slate-100 shadow-sm relative overflow-hidden hover:border-orange-200 transition-colors">
                        <div className="absolute left-0 top-0 h-full w-1.5 bg-orange-500"></div>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-orange-50 text-orange-500 rounded-[14px] flex items-center justify-center"><Flame size={20} /></div>
                          <h4 className="font-black uppercase tracking-widest text-slate-800 text-xs">Saiu do Plano</h4>
                        </div>
                        {(!checkin.free_meal && !checkin.free_meal_photo) ? (
                          <div className="h-24 flex items-center justify-center border-2 border-dashed border-slate-100 rounded-[16px]"><p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Nenhum furo registrado</p></div>
                        ) : (
                          <div className="space-y-3">
                            {checkin.free_meal && <p className="text-[11px] sm:text-xs font-bold text-slate-700 bg-orange-50 p-3.5 rounded-[12px] border border-orange-100 italic">"{checkin.free_meal}"</p>}
                            {checkin.free_meal_photo && (
                              <a href={checkin.free_meal_photo} target="_blank" rel="noopener noreferrer" className="block w-full h-24 rounded-[12px] overflow-hidden border-2 border-orange-100 shadow-sm relative group cursor-pointer">
                                <img src={checkin.free_meal_photo} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Maximize2 size={20} className="text-white"/></div>
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* DETALHES CLÍNICOS E ROTINA */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pt-2 sm:pt-4 border-t border-slate-200">
                    <div className="bg-white p-5 sm:p-8 rounded-[30px] sm:rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden">
                      <div className="absolute left-0 top-0 w-1.5 h-full bg-red-500"></div>
                      <h4 className="flex items-center gap-2 font-black uppercase text-xs sm:text-sm tracking-widest mb-4 sm:mb-6 text-red-600"><Ban size={16}/> Alergias e Gostos</h4>
                      <div className="space-y-3">
                        <div className="bg-slate-50 p-4 rounded-[16px] border border-slate-100"><p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Alergias</p><p className="font-bold text-xs sm:text-sm text-slate-900">{student?.allergies || 'Nenhuma restrição informada'}</p></div>
                        <div className="bg-slate-50 p-4 rounded-[16px] border border-slate-100"><p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Não Come de jeito nenhum</p><p className="font-bold text-xs sm:text-sm text-slate-900 italic">"{student?.disliked_foods || 'Nada informado'}"</p></div>
                      </div>
                    </div>

                    <div className="bg-white p-5 sm:p-8 rounded-[30px] sm:rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden">
                      <div className="absolute left-0 top-0 w-1.5 h-full bg-amber-500"></div>
                      <h4 className="flex items-center gap-2 font-black uppercase text-xs sm:text-sm tracking-widest mb-4 sm:mb-6 text-amber-600"><Pill size={16}/> Suplementos e Rotina</h4>
                      <div className="space-y-3">
                        <div className="bg-slate-50 p-4 rounded-[16px] border border-slate-100"><p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Suplementação Atual</p><p className="font-bold text-xs sm:text-sm text-slate-900">{student?.supplements || 'Nenhum uso relatado'}</p></div>
                        <div className="bg-slate-50 p-4 rounded-[16px] border border-slate-100"><p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Flexibilidade da Dieta</p><p className="font-black text-xs sm:text-sm text-amber-600 uppercase tracking-widest">{student?.meal_flexibility || 'Padrão'}</p></div>
                      </div>
                    </div>

                    <div className="md:col-span-2 bg-white p-5 sm:p-8 lg:p-10 rounded-[30px] sm:rounded-[50px] border border-slate-100 shadow-sm relative overflow-hidden">
                      <div className="absolute left-0 top-0 w-1.5 h-full bg-blue-500"></div>
                      <h4 className="flex items-center gap-2 font-black uppercase text-xs sm:text-sm tracking-widest mb-5 sm:mb-8 text-blue-600"><Clock size={16}/> Cronograma do Atleta</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
                         {[
                           { label: 'Acorda', time: student?.wake_time },
                           { label: 'Início Trab.', time: student?.work_start },
                           { label: 'Fim Trab.', time: student?.work_end },
                           { label: 'Treina', time: student?.train_time },
                           { label: 'Dorme', time: student?.sleep_time },
                         ].map((item, idx) => (
                           <div key={idx} className="bg-slate-50 p-3 sm:p-5 lg:p-6 rounded-[16px] sm:rounded-[25px] border border-slate-200 text-center flex flex-col justify-center">
                              <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1 sm:mb-2">{item.label}</p>
                              <p className="text-lg sm:text-2xl font-black italic text-slate-800 leading-none">{item.time || '--:--'}</p>
                           </div>
                         ))}
                      </div>
                    </div>
                </div>

                {/* 🚨 ZONA DE PERIGO 🚨 (Com respiro ajustado para desktop/mobile) */}
                <div className="mt-12 pt-8 border-t-4 border-red-500/20 pb-16 sm:pb-32">
                  <h3 className="flex items-center gap-2 font-black uppercase text-red-500 mb-6 tracking-widest pl-2">
                    Zona de Perigo
                  </h3>
                  
                  <div className="bg-red-50/50 p-6 rounded-[30px] border border-red-100 flex flex-col sm:flex-row gap-4 justify-between items-center mb-4">
                    <div>
                      <h4 className="font-black text-red-800 uppercase tracking-widest text-sm">Inativar Aluno</h4>
                      <p className="text-[10px] sm:text-xs text-red-600/80 font-bold mt-1">O aluno perde o acesso, mas o histórico é preservado.</p>
                    </div>
                    <button onClick={handleInativar} className="w-full sm:w-auto bg-red-100 text-red-600 hover:bg-red-600 hover:text-white px-6 py-3.5 rounded-[16px] font-black uppercase text-[10px] tracking-widest transition-all shadow-sm">
                      Bloquear Acesso
                    </button>
                  </div>

                  <div className="bg-red-50 p-6 rounded-[30px] border border-red-200 flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <div>
                      <h4 className="font-black text-red-900 uppercase tracking-widest text-sm">Excluir Conta</h4>
                      <p className="text-[10px] sm:text-xs text-red-700/80 font-bold mt-1">Apaga fotos, check-ins, dietas e o perfil para sempre.</p>
                    </div>
                    <button onClick={handleDelete} className="w-full sm:w-auto bg-red-600 text-white hover:bg-red-700 px-6 py-3.5 rounded-[16px] font-black uppercase text-[10px] tracking-widest shadow-[0_10px_20px_rgba(220,38,38,0.3)] transition-all">
                      Excluir Definitivamente
                    </button>
                  </div>
                </div>

            </div>
        )}

        {/* =========================================
            ABA 2: PRESCRIÇÃO E DIETA
        ========================================= */}
        {activeTab === 'prescricao' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto space-y-4 sm:space-y-5">
              
              <div className="text-center mb-6 sm:mb-8">
                  <h3 className="text-xl sm:text-2xl font-black uppercase italic text-slate-800 tracking-tighter">Central de <span className="text-green-600">Prescrição</span></h3>
                  <p className="text-[10px] sm:text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">Escolha a estratégia para {student?.full_name?.split(' ')[0]}</p>
              </div>

              <button onClick={() => router.push(`/dashboard-coach/aluno/${id}/gerar-dieta-ia`)} className="w-full flex items-center bg-slate-900 text-white p-5 sm:p-8 rounded-[30px] sm:rounded-[40px] shadow-[0_15px_40px_rgba(22,163,74,0.2)] hover:bg-green-600 transition-all active:scale-[0.98] group relative overflow-hidden border border-slate-800 hover:border-green-500">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-black/20 transition-colors"></div>
                <div className="flex items-center gap-4 sm:gap-6 w-full relative z-10">
                  <div className="w-14 h-14 sm:w-20 sm:h-20 bg-white/10 text-green-400 rounded-[18px] sm:rounded-3xl flex items-center justify-center backdrop-blur-md border border-white/5 shrink-0"><BrainCircuit size={28} className="sm:w-[32px] sm:h-[32px]" /></div>
                  <div className="text-left flex-1">
                    <span className="font-black uppercase italic tracking-tighter text-xl sm:text-3xl block leading-none mb-1">Gerar por IA</span>
                    <span className="text-[9px] sm:text-xs font-bold uppercase tracking-[0.2em] text-green-400/80 block">Prescrição Ultra-Rápida</span>
                  </div>
                  <ArrowRight size={24} className="text-green-400/50 shrink-0 transition-transform group-hover:translate-x-1 sm:group-hover:translate-x-2" />
                </div>
              </button>

              <button onClick={() => router.push(`/dashboard-coach/aluno/${id}/editor-pro`)} className="w-full flex items-center bg-white text-black p-5 sm:p-8 rounded-[30px] sm:rounded-[40px] border-2 border-slate-200 shadow-sm hover:border-green-500 hover:shadow-[0_15px_40px_rgba(22,163,74,0.1)] transition-all active:scale-[0.98] group">
                <div className="flex items-center gap-4 sm:gap-6 w-full">
                  <div className="w-14 h-14 sm:w-20 sm:h-20 bg-green-50 text-green-600 rounded-[18px] sm:rounded-3xl flex items-center justify-center border border-green-100 group-hover:bg-green-600 group-hover:text-white transition-colors shrink-0"><Edit3 size={28} className="sm:w-[32px] sm:h-[32px]"/></div>
                  <div className="text-left flex-1">
                    <span className="font-black uppercase italic tracking-tighter text-xl sm:text-3xl block leading-none text-slate-800 group-hover:text-green-700 transition-colors mb-1">Editor Master</span>
                    <span className="text-[9px] sm:text-xs font-bold uppercase tracking-[0.2em] text-slate-400 block">Montagem Manual V6</span>
                  </div>
                  <ArrowRight size={24} className="text-green-500 shrink-0 transition-transform group-hover:translate-x-1 sm:group-hover:translate-x-2" />
                </div>
              </button>

              <button onClick={() => router.push(`/dashboard-coach/aluno/${id}/dieta-atual`)} className="w-full flex items-center bg-white text-black p-5 sm:p-8 rounded-[30px] sm:rounded-[40px] border-2 border-slate-100 shadow-sm hover:border-slate-800 transition-all active:scale-[0.98] group">
                <div className="flex items-center gap-4 sm:gap-6 w-full">
                  <div className="w-14 h-14 sm:w-20 sm:h-20 bg-slate-50 text-slate-500 rounded-[18px] sm:rounded-3xl flex items-center justify-center border border-slate-200 group-hover:bg-slate-900 group-hover:text-white transition-colors shrink-0"><History size={28} className="sm:w-[32px] sm:h-[32px]"/></div>
                  <div className="text-left flex-1">
                    <span className="font-black uppercase italic tracking-tighter text-xl sm:text-3xl block leading-none text-slate-600 group-hover:text-slate-900 transition-colors mb-1">Dieta Ativa</span>
                    <span className="text-[9px] sm:text-xs font-bold uppercase tracking-[0.2em] text-slate-400 block">Visualizar o Plano Atual</span>
                  </div>
                  <Zap size={24} className="text-slate-300 group-hover:text-amber-500 shrink-0 transition-colors" />
                </div>
              </button>

            </div>
        )}

      </main>
    </div>
  );
}