'use client'

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft, Scale, Ruler, Target, BrainCircuit, Save, History, 
  Edit3, ArrowRight, User as UserIcon, Loader2, Maximize2, 
  Clock, Ban, Pill, Utensils, Zap, Activity, Droplets, Flame, FileText, MessageCircle
} from 'lucide-react';

export default function PerfilAlunoPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  
  const [student, setStudent] = useState<any>(null);
  const [checkin, setCheckin] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [measures, setMeasures] = useState({ weight: '', height: '' });
  const [saving, setSaving] = useState(false);
  
  const [activeTab, setActiveTab] = useState<'dossie' | 'prescricao'>('dossie');

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

        const today = new Date().toISOString().split('T')[0];
        const checkinRes = await fetch(`/api/checkins?studentId=${id}&date=${today}`);
        if (checkinRes.ok) {
          const cData = await checkinRes.json();
          setCheckin(cData);
        }

      } catch (err) { 
        console.error("Erro na carga"); 
      } finally { 
        setLoading(false); 
      }
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
    <div className="min-h-[100dvh] bg-slate-900 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Luz de fundo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[20rem] h-[20rem] bg-green-600 rounded-full blur-[120px] opacity-20 pointer-events-none"></div>
      
      {/* Logo Pulsando */}
      <div className="w-32 h-32 sm:w-40 sm:h-40 relative animate-[pulse_2s_ease-in-out_infinite] mb-6">
        <img src="/logo.png" alt="Carregando..." className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(22,163,74,0.4)]" />
      </div>
      
      <p className="font-black uppercase tracking-[0.4em] text-green-500 italic text-xs sm:text-sm relative z-10">Sincronizando Elite...</p>
    </div>
  );

  return (
    <div className="min-h-[100dvh] bg-slate-50 p-4 sm:p-6 pb-[env(safe-area-inset-bottom,100px)] text-black font-sans">
      
      {/* HEADER ELITE */}
      <header className="max-w-5xl mx-auto mb-6 sm:mb-8 flex justify-between items-center bg-white p-4 sm:p-5 rounded-[30px] border border-slate-200 shadow-sm relative overflow-hidden">
        <button onClick={() => router.push('/dashboard-coach')} className="relative z-10 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] bg-slate-50 border border-slate-200 hover:border-green-400 p-3 sm:px-5 sm:py-3 rounded-[20px] flex items-center gap-2 hover:text-green-600 transition-all active:scale-95">
          <ChevronLeft size={16} /> <span className="hidden sm:inline">Voltar ao Painel</span>
        </button>
        <button 
          onClick={() => editMode ? saveMeasures() : setEditMode(true)}
          disabled={saving}
          className="relative z-10 bg-slate-900 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-[20px] text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2 sm:gap-3 shadow-xl hover:bg-green-600 hover:shadow-green-500/30 active:scale-95 transition-all disabled:opacity-70 disabled:scale-100"
        >
          {saving ? <Loader2 size={16} className="animate-spin text-green-400" /> : editMode ? <Save size={16} className="text-green-400" /> : <Edit3 size={16} className="text-green-400" />}
          {editMode ? 'Salvar Dados' : 'Atualizar Medidas'}
        </button>
      </header>

      <main className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
        
        {/* BANNER PRINCIPAL DO ALUNO */}
        <div className="bg-slate-900 text-white px-6 py-8 sm:p-10 rounded-[40px] sm:rounded-[50px] shadow-2xl relative border-b-4 border-green-600 overflow-hidden text-center">
          <div className="absolute top-0 right-0 w-48 h-48 bg-green-600 rounded-full blur-[80px] opacity-20 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          
          <div className="flex flex-col items-center relative z-10">
            <div className="relative group mb-5 sm:mb-6">
                <div className="w-28 h-28 sm:w-32 sm:h-32 bg-slate-800 rounded-[35px] sm:rounded-[40px] border-2 border-slate-700 flex items-center justify-center overflow-hidden shadow-2xl relative">
                  {student?.photoUrl ? (
                      <img src={student.photoUrl} className={`w-full h-full object-cover ${student.photoPosition === 'top' ? 'object-top' : 'object-center'}`} />
                  ) : (
                      <UserIcon size={48} className="text-slate-600" />
                  )}
                  <div className="absolute inset-0 border-4 border-green-500 rounded-[35px] sm:rounded-[40px] pointer-events-none"></div>
                </div>
                <button 
                  onClick={togglePhotoPosition} 
                  className="absolute -bottom-2 -right-2 bg-green-600 text-white p-2.5 sm:p-3 rounded-[16px] sm:rounded-2xl shadow-[0_5px_15px_rgba(22,163,74,0.4)] hover:scale-110 active:scale-95 transition-all border-2 border-slate-900"
                >
                  <Maximize2 size={16} />
                </button>
            </div>
            
            <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.4em] opacity-80 mb-2 italic text-green-400">Atleta Team Elite</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase italic tracking-tighter leading-none mb-4 max-w-full truncate px-4">{student?.full_name}</h2>
            
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              <div className="flex items-center gap-2 sm:gap-3 bg-white/10 px-5 sm:px-6 py-2 sm:py-2.5 rounded-[16px] sm:rounded-2xl text-[10px] sm:text-[11px] font-black uppercase italic border border-white/5 backdrop-blur-sm">
                <Target size={14} className="text-green-400" /> 
                {student?.goal || 'Não informado'}
              </div>

              {/* BOTÃO DO WHATSAPP AQUI! */}
              {student?.phone && (
                <a 
                  href={`https://wa.me/55${student.phone.replace(/\D/g, '')}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 sm:gap-3 bg-green-500 text-white px-5 sm:px-6 py-2 sm:py-2.5 rounded-[16px] sm:rounded-2xl text-[10px] sm:text-[11px] font-black uppercase italic shadow-[0_5px_15px_rgba(22,163,74,0.3)] hover:scale-105 active:scale-95 transition-all"
                >
                  <MessageCircle size={14} /> Chamar no WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>

        {/* --- NAVEGAÇÃO DE ABAS (PÍLULA) --- */}
        <div className="flex bg-slate-200/60 p-1.5 rounded-[20px] max-w-md mx-auto relative z-20">
            <button 
                onClick={() => setActiveTab('dossie')} 
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-[16px] font-black uppercase text-[10px] sm:text-xs tracking-widest transition-all ${activeTab === 'dossie' ? 'bg-white text-slate-900 shadow-md scale-[1.02]' : 'text-slate-400 hover:text-slate-600'}`}
            > 
                <FileText size={16}/> Dossiê Clínico 
            </button>
            <button 
                onClick={() => setActiveTab('prescricao')} 
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-[16px] font-black uppercase text-[10px] sm:text-xs tracking-widest transition-all ${activeTab === 'prescricao' ? 'bg-slate-900 text-green-400 shadow-md scale-[1.02]' : 'text-slate-400 hover:text-slate-600'}`}
            > 
                <Utensils size={16}/> Prescrição 
            </button>
        </div>

        {/* =========================================
            ABA 1: DOSSIÊ CLÍNICO E RASTREIO
        ========================================= */}
        {activeTab === 'dossie' && (
            <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* INDICADORES GERAIS */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  <div className="bg-white p-6 sm:p-8 rounded-[35px] sm:rounded-[40px] border border-slate-100 shadow-sm flex flex-col items-center relative overflow-hidden group hover:border-green-200 transition-colors">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-slate-50 rounded-bl-[40px] -z-10 group-hover:bg-green-50 transition-colors"></div>
                    <Scale size={24} className="text-green-600 mb-3 sm:mb-4" />
                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1 sm:mb-2 text-center">Peso Atual</span>
                    {editMode ? (
                      <input type="number" step="0.1" value={measures.weight} onChange={e => setMeasures({...measures, weight: e.target.value})} className="w-full text-center text-3xl sm:text-4xl font-black italic text-slate-900 border-b-2 border-green-500 focus:outline-none bg-transparent" />
                    ) : (
                      <span className="text-3xl sm:text-4xl font-black italic text-slate-800">{student?.weight ? `${student.weight}kg` : '--'}</span>
                    )}
                  </div>
                  
                  <div className="bg-white p-6 sm:p-8 rounded-[35px] sm:rounded-[40px] border border-slate-100 shadow-sm flex flex-col items-center relative overflow-hidden group hover:border-green-200 transition-colors">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-slate-50 rounded-bl-[40px] -z-10 group-hover:bg-green-50 transition-colors"></div>
                    <Ruler size={24} className="text-green-600 mb-3 sm:mb-4" />
                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1 sm:mb-2 text-center">Altura</span>
                    {editMode ? (
                      <input type="number" value={measures.height} onChange={e => setMeasures({...measures, height: e.target.value})} className="w-full text-center text-3xl sm:text-4xl font-black italic text-slate-900 border-b-2 border-green-500 focus:outline-none bg-transparent" />
                    ) : (
                      <span className="text-3xl sm:text-4xl font-black italic text-slate-800">{student?.height ? `${student.height}cm` : '--'}</span>
                    )}
                  </div>
                  
                  <div className="bg-white p-6 sm:p-8 rounded-[35px] sm:rounded-[40px] border border-slate-100 shadow-sm flex flex-col items-center relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-slate-50 rounded-bl-[40px] -z-10"></div>
                    <Utensils size={24} className="text-slate-400 mb-3 sm:mb-4" />
                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1 sm:mb-2 text-center">Refeições</span>
                    <span className="text-3xl sm:text-4xl font-black italic text-slate-800">{student?.meal_count || '--'}</span>
                  </div>
                  
                  <div className="bg-white p-6 sm:p-8 rounded-[35px] sm:rounded-[40px] border border-slate-100 shadow-sm flex flex-col items-center relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-slate-50 rounded-bl-[40px] -z-10"></div>
                    <UserIcon size={24} className="text-slate-400 mb-3 sm:mb-4" />
                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1 sm:mb-2 text-center">Idade</span>
                    <span className="text-3xl sm:text-4xl font-black italic text-slate-800">{student?.age || '--'}</span>
                  </div>
                </div>

                {/* RASTREAMENTO DO DIA */}
                <div>
                  <h3 className="flex items-center gap-2 font-black uppercase text-sm mb-6 text-slate-800 tracking-widest pl-2">
                    <Activity size={18} className="text-green-500" /> Rastreamento do Dia (Hoje)
                  </h3>

                  {!checkin ? (
                    <div className="bg-white border-2 border-dashed border-slate-200 rounded-[30px] p-10 text-center flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300"><Clock size={24}/></div>
                      <p className="text-slate-400 font-bold text-sm">O aluno ainda não registrou nada no diário hoje.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                      <div className="bg-white p-5 sm:p-6 rounded-[30px] border border-slate-100 shadow-sm relative overflow-hidden hover:border-blue-200 transition-colors">
                        <div className="absolute left-0 top-0 h-full w-1.5 bg-blue-500"></div>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-[14px] flex items-center justify-center"><Droplets size={20} /></div>
                          <h4 className="font-black uppercase tracking-widest text-slate-800 text-xs">Água</h4>
                        </div>
                        <p className="text-4xl font-black italic text-blue-600">{checkin.water_ml ? (checkin.water_ml / 1000).toFixed(2) + 'L' : '0.00L'}</p>
                      </div>

                      <div className="bg-white p-5 sm:p-6 rounded-[30px] border border-slate-100 shadow-sm relative overflow-hidden hover:border-green-200 transition-colors">
                        <div className="absolute left-0 top-0 h-full w-1.5 bg-green-500"></div>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-green-50 text-green-600 rounded-[14px] flex items-center justify-center"><Activity size={20} /></div>
                          <h4 className="font-black uppercase tracking-widest text-slate-800 text-xs">Biofeedback</h4>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100"><span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Fome</span><span className="text-xs font-bold text-slate-800">{checkin.fome || '--'}</span></div>
                          <div className="flex justify-between items-center bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100"><span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Intestino</span><span className="text-xs font-bold text-slate-800">{checkin.digestao || '--'}</span></div>
                          <div className="flex justify-between items-center bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100"><span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Energia</span><span className="text-xs font-bold text-slate-800">{checkin.energia || '--'}</span></div>
                        </div>
                      </div>

                      <div className="bg-white p-5 sm:p-6 rounded-[30px] border border-slate-100 shadow-sm relative overflow-hidden hover:border-orange-200 transition-colors">
                        <div className="absolute left-0 top-0 h-full w-1.5 bg-orange-500"></div>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-orange-50 text-orange-500 rounded-[14px] flex items-center justify-center"><Flame size={20} /></div>
                          <h4 className="font-black uppercase tracking-widest text-slate-800 text-xs">Saiu do Plano</h4>
                        </div>
                        {(!checkin.free_meal && !checkin.free_meal_photo) ? (
                          <div className="h-24 flex items-center justify-center border-2 border-dashed border-slate-100 rounded-2xl"><p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Nenhum furo registrado</p></div>
                        ) : (
                          <div className="space-y-3">
                            {checkin.free_meal && <p className="text-xs font-bold text-slate-700 bg-orange-50 p-3.5 rounded-xl border border-orange-100 italic">"{checkin.free_meal}"</p>}
                            {checkin.free_meal_photo && (
                              <a href={checkin.free_meal_photo} target="_blank" rel="noopener noreferrer" className="block w-full h-24 rounded-xl overflow-hidden border-2 border-orange-100 shadow-sm relative group cursor-pointer">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pt-4 border-t border-slate-200">
                    <div className="bg-white p-6 sm:p-8 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden">
                      <div className="absolute left-0 top-0 w-1.5 h-full bg-red-500"></div>
                      <h4 className="flex items-center gap-2 font-black uppercase text-xs sm:text-sm tracking-widest mb-5 sm:mb-6 text-red-600"><Ban size={18}/> Alergias e Gostos</h4>
                      <div className="space-y-3 sm:space-y-4">
                        <div className="bg-slate-50 p-4 sm:p-5 rounded-[20px] sm:rounded-2xl border border-slate-100"><p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Alergias</p><p className="font-bold text-sm text-slate-900">{student?.allergies || 'Nenhuma restrição informada'}</p></div>
                        <div className="bg-slate-50 p-4 sm:p-5 rounded-[20px] sm:rounded-2xl border border-slate-100"><p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Não Come de jeito nenhum</p><p className="font-bold text-sm text-slate-900 italic">"{student?.disliked_foods || 'Nada informado'}"</p></div>
                      </div>
                    </div>

                    <div className="bg-white p-6 sm:p-8 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden">
                      <div className="absolute left-0 top-0 w-1.5 h-full bg-amber-500"></div>
                      <h4 className="flex items-center gap-2 font-black uppercase text-xs sm:text-sm tracking-widest mb-5 sm:mb-6 text-amber-600"><Pill size={18}/> Suplementos e Rotina</h4>
                      <div className="space-y-3 sm:space-y-4">
                        <div className="bg-slate-50 p-4 sm:p-5 rounded-[20px] sm:rounded-2xl border border-slate-100"><p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Suplementação Atual</p><p className="font-bold text-sm text-slate-900">{student?.supplements || 'Nenhum uso relatado'}</p></div>
                        <div className="bg-slate-50 p-4 sm:p-5 rounded-[20px] sm:rounded-2xl border border-slate-100"><p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Flexibilidade da Dieta</p><p className="font-black text-xs text-amber-600 uppercase tracking-widest">{student?.meal_flexibility || 'Padrão'}</p></div>
                      </div>
                    </div>

                    <div className="md:col-span-2 bg-white p-6 sm:p-8 lg:p-10 rounded-[40px] sm:rounded-[50px] border border-slate-100 shadow-sm relative overflow-hidden">
                      <div className="absolute left-0 top-0 w-1.5 h-full bg-blue-500"></div>
                      <h4 className="flex items-center gap-2 font-black uppercase text-xs sm:text-sm tracking-widest mb-6 sm:mb-8 text-blue-600"><Clock size={18}/> Cronograma do Atleta</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
                         {[
                           { label: 'Acorda', time: student?.wake_time },
                           { label: 'Início Trab.', time: student?.work_start },
                           { label: 'Fim Trab.', time: student?.work_end },
                           { label: 'Treina', time: student?.train_time },
                           { label: 'Dorme', time: student?.sleep_time },
                         ].map((item, idx) => (
                           <div key={idx} className="bg-slate-50 p-4 sm:p-5 lg:p-6 rounded-[20px] sm:rounded-[25px] border border-slate-200 text-center flex flex-col justify-center">
                              <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1.5 sm:mb-2">{item.label}</p>
                              <p className="text-xl sm:text-2xl font-black italic text-slate-800 leading-none">{item.time || '--:--'}</p>
                           </div>
                         ))}
                      </div>
                    </div>
                </div>
            </div>
        )}

        {/* =========================================
            ABA 2: PRESCRIÇÃO E DIETA
        ========================================= */}
        {activeTab === 'prescricao' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto space-y-5">
              
              <div className="text-center mb-8">
                  <h3 className="text-2xl font-black uppercase italic text-slate-800 tracking-tighter">Central de <span className="text-green-600">Prescrição</span></h3>
                  <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">Escolha a estratégia para {student?.full_name?.split(' ')[0]}</p>
              </div>

              {/* Módulo 1: IA */}
              <button onClick={() => router.push(`/dashboard-coach/aluno/${id}/gerar-dieta-ia`)} className="w-full flex items-center bg-slate-900 text-white p-6 sm:p-8 rounded-[35px] sm:rounded-[40px] shadow-[0_15px_40px_rgba(22,163,74,0.2)] hover:bg-green-600 transition-all active:scale-[0.98] group relative overflow-hidden border border-slate-800 hover:border-green-500">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-black/20 transition-colors"></div>
                <div className="flex items-center gap-5 sm:gap-6 w-full relative z-10">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/10 text-green-400 rounded-[22px] sm:rounded-3xl flex items-center justify-center backdrop-blur-md border border-white/5 shrink-0"><BrainCircuit size={32} /></div>
                  <div className="text-left flex-1">
                    <span className="font-black uppercase italic tracking-tighter text-2xl sm:text-3xl block leading-none mb-1">Gerar por IA</span>
                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-green-400/80 block">Prescrição Ultra-Rápida</span>
                  </div>
                  <ArrowRight size={28} className="text-green-400/50 hidden sm:block shrink-0 transition-transform group-hover:translate-x-2" />
                </div>
              </button>

              {/* Módulo 2: Manual V6 */}
              <button onClick={() => router.push(`/dashboard-coach/aluno/${id}/editor-pro`)} className="w-full flex items-center bg-white text-black p-6 sm:p-8 rounded-[35px] sm:rounded-[40px] border-2 border-slate-200 shadow-sm hover:border-green-500 hover:shadow-[0_15px_40px_rgba(22,163,74,0.1)] transition-all active:scale-[0.98] group">
                <div className="flex items-center gap-5 sm:gap-6 w-full">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-50 text-green-600 rounded-[22px] sm:rounded-3xl flex items-center justify-center border border-green-100 group-hover:bg-green-600 group-hover:text-white transition-colors shrink-0"><Edit3 size={32} /></div>
                  <div className="text-left flex-1">
                    <span className="font-black uppercase italic tracking-tighter text-2xl sm:text-3xl block leading-none text-slate-800 group-hover:text-green-700 transition-colors mb-1">Editor Master</span>
                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-slate-400 block">Montagem Manual V6</span>
                  </div>
                  <ArrowRight size={28} className="text-green-500 hidden sm:block shrink-0 transition-transform group-hover:translate-x-2" />
                </div>
              </button>

              {/* Módulo 3: Dieta Ativa */}
              <button onClick={() => router.push(`/dashboard-coach/aluno/${id}/dieta-atual`)} className="w-full flex items-center bg-white text-black p-6 sm:p-8 rounded-[35px] sm:rounded-[40px] border-2 border-slate-100 shadow-sm hover:border-slate-800 transition-all active:scale-[0.98] group">
                <div className="flex items-center gap-5 sm:gap-6 w-full">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 text-slate-500 rounded-[22px] sm:rounded-3xl flex items-center justify-center border border-slate-200 group-hover:bg-slate-900 group-hover:text-white transition-colors shrink-0"><History size={32} /></div>
                  <div className="text-left flex-1">
                    <span className="font-black uppercase italic tracking-tighter text-2xl sm:text-3xl block leading-none text-slate-600 group-hover:text-slate-900 transition-colors mb-1">Dieta Ativa</span>
                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-slate-400 block">Visualizar o Plano Atual</span>
                  </div>
                  <Zap size={28} className="text-slate-300 group-hover:text-amber-500 hidden sm:block shrink-0 transition-colors" />
                </div>
              </button>

            </div>
        )}

      </main>
    </div>
  );
}