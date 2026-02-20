'use client'

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Edit3, Clock, Utensils, AlertCircle, ArrowRightLeft, CheckCircle2 } from 'lucide-react';

export default function VisualizadorDietaPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  
  const [protocols, setProtocols] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeProtocolIndex, setActiveProtocolIndex] = useState(0);

  useEffect(() => {
    async function fetchDiet() {
      try {
        const res = await fetch(`/api/diet/latest?studentId=${id}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            if (!data[0].meals) {
              setProtocols([{ id: 'default', name: 'Protocolo Base', meals: data }]);
            } else {
              setProtocols(data);
            }
          }
        }
      } catch (error) {
        console.error("Erro ao carregar dieta ativa", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDiet();
  }, [id]);

  if (loading) return (
    <div className="min-h-[100dvh] bg-slate-900 flex flex-col items-center justify-center">
      <div className="w-32 h-32 relative animate-[pulse_2s_ease-in-out_infinite] mb-6">
        <img src="/logo.png" alt="Carregando..." className="w-full h-full object-contain" />
      </div>
      <p className="font-black uppercase tracking-[0.4em] text-green-500 italic text-xs">Sincronizando Elite...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-black font-sans relative flex flex-col">
      
      {/* 1. HEADER FIXO (TRAVADO NO TOPO DO VIDRO) */}
      <header className="fixed top-0 left-0 right-0 z-[100] bg-white/95 backdrop-blur-xl border-b border-slate-200 px-4 sm:px-6 pt-[max(1rem,env(safe-area-inset-top))] pb-4 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.push(`/dashboard-coach/aluno/${id}`)} 
              className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl active:scale-90 transition-transform"
            >
              <ChevronLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-black uppercase italic tracking-tighter text-slate-800 leading-none">
                Dieta <span className="text-green-600">Ativa</span>
              </h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Modo Leitura</p>
            </div>
          </div>

          <button 
            onClick={() => router.push(`/dashboard-coach/aluno/${id}/editor-pro`)}
            className="bg-slate-900 text-white p-2.5 rounded-xl shadow-lg active:scale-90 transition-transform"
          >
            <Edit3 size={20} className="text-green-400" />
          </button>
        </div>
      </header>

      {/* 2. CONTEÚDO COM PADDING COMPENSATÓRIO 
          pt-[140px]: Garante que o conteúdo comece abaixo do header fixo + notch.
          pb-[200px]: Garante que o conteúdo termine bem antes do botão de baixo.
      */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 pt-[calc(90px+env(safe-area-inset-top))] pb-[200px] space-y-6">
        
        {protocols.length === 0 ? (
           <div className="text-center py-20 bg-white border-2 border-dashed border-slate-300 rounded-[40px] shadow-sm mt-10">
              <Utensils size={48} className="mx-auto mb-4 text-slate-300" />
              <h2 className="text-2xl font-black italic uppercase text-slate-400 mb-2">Nenhuma dieta</h2>
              <button 
                onClick={() => router.push(`/dashboard-coach/aluno/${id}/editor-pro`)}
                className="bg-green-600 text-white px-8 py-4 rounded-[20px] font-black uppercase text-xs mt-4"
              >
                Prescrever Agora
              </button>
           </div>
        ) : (
          <>
            {/* ABAS DE PROTOCOLOS */}
            {protocols.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar sticky top-[calc(70px+env(safe-area-inset-top))] z-[90] bg-slate-50/80 backdrop-blur-sm py-2">
                {protocols.map((p, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setActiveProtocolIndex(idx)}
                    className={`px-5 py-3 rounded-2xl font-black uppercase text-[10px] whitespace-nowrap transition-all shadow-sm border
                      ${activeProtocolIndex === idx 
                        ? 'bg-slate-900 text-white border-slate-900' 
                        : 'bg-white text-slate-400 border-slate-200'
                      }
                    `}
                  >
                    {p.name || `Protocolo ${idx + 1}`}
                  </button>
                ))}
              </div>
            )}

            {/* LISTAGEM DE REFEIÇÕES */}
            <div className="space-y-6">
              {protocols[activeProtocolIndex].meals?.map((meal: any, mIdx: number) => (
                <div key={mIdx} className="bg-white rounded-[35px] border border-slate-100 p-6 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-green-500"></div>
                  
                  <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-50">
                    <div className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full text-[10px] font-black flex items-center gap-1.5">
                      <Clock size={12} /> {meal.time || '--:--'}
                    </div>
                    <h3 className="text-xl font-black uppercase italic text-slate-800">{meal.title || 'Refeição'}</h3>
                  </div>

                  {meal.observations && (
                    <div className="mb-5 bg-amber-50/50 border border-amber-100 p-4 rounded-2xl flex items-start gap-3">
                      <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-xs font-semibold text-amber-800 italic leading-relaxed">{meal.observations}</p>
                    </div>
                  )}

                  <div className="space-y-3">
                    {meal.items?.length > 0 ? (
                      meal.items.map((item: any, iIdx: number) => (
                        <div key={iIdx} className="flex flex-col gap-2">
                          <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                            <div className="bg-white border border-slate-200 px-3 py-2 rounded-xl min-w-[70px] text-center shadow-sm">
                               <span className="font-black text-lg text-slate-900 block leading-none">{item.amount || '0'}</span>
                               <span className="text-[9px] font-black uppercase text-slate-400 block mt-1">{item.unit || 'g'}</span>
                            </div>
                            <span className="font-bold text-sm text-slate-800 uppercase flex-1 leading-tight">{item.name}</span>
                          </div>

                          {item.substitutes?.length > 0 && (
                            <div className="pl-6 space-y-2 mt-1 relative">
                              <div className="absolute left-[38px] top-0 w-px h-full bg-slate-200"></div>
                              {item.substitutes.map((sub: any, sIdx: number) => (
                                <div key={sIdx} className="flex items-center gap-3 bg-white border border-slate-200 p-2.5 rounded-2xl relative z-10 w-fit pr-6 shadow-sm">
                                  <div className="w-6 h-6 bg-green-50 rounded-full flex items-center justify-center shrink-0">
                                    <ArrowRightLeft size={12} className="text-green-600" />
                                  </div>
                                  <div className="flex items-center gap-2">
                                     <span className="font-black text-xs text-slate-900 bg-slate-100 px-2 py-1 rounded-lg">{sub.amount}{sub.unit}</span>
                                     <span className="text-[10px] font-bold uppercase text-slate-600 truncate max-w-[150px]">{sub.name}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-xs font-bold text-slate-400 italic py-2">Nenhum alimento cadastrado.</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* 3. FOOTER FIXO (BLINDADO) */}
      {protocols.length > 0 && (
        <footer className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-xl border-t border-slate-200 z-[100] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <button 
            onClick={() => router.push(`/dashboard-coach/aluno/${id}/editor-pro`)}
            className="max-w-4xl mx-auto w-full bg-slate-900 text-white py-5 rounded-[25px] font-black uppercase tracking-[0.2em] text-xs shadow-xl active:scale-95 transition-transform flex items-center justify-center gap-3"
          >
            <Edit3 size={20} className="text-green-400" /> Desbloquear Edição
          </button>
        </footer>
      )}

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}