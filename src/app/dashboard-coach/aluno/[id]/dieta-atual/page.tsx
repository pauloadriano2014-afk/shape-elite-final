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
            // Normaliza caso seja a versão antiga (apenas refeições) ou a nova (protocolos)
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
    <div className="min-h-[100dvh] bg-slate-50 p-4 sm:p-6 font-sans pb-[env(safe-area-inset-bottom,120px)] text-black">
      
      {/* HEADER DE LEITURA RÁPIDA */}
      <header className="max-w-4xl mx-auto mb-6 sm:mb-8 flex items-center justify-between sticky top-0 bg-slate-50/90 backdrop-blur-md z-30 py-4 border-b border-slate-200">
        <div className="flex items-center gap-3 sm:gap-4">
          <button onClick={() => router.push(`/dashboard-coach/aluno/${id}`)} className="p-3 bg-white border border-slate-200 rounded-[14px] sm:rounded-[20px] shadow-sm hover:border-green-400 hover:text-green-600 transition-all flex items-center gap-2">
            <ChevronLeft size={20} /> <span className="hidden sm:inline text-[11px] font-black uppercase tracking-widest">Voltar ao Perfil</span>
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black uppercase italic tracking-tighter text-slate-800 leading-none">
              Dieta <span className="text-green-600">Ativa</span>
            </h1>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Modo Leitura Rápida</p>
          </div>
        </div>

        {/* BOTÃO DE EDIÇÃO DIRETA */}
        <button 
          onClick={() => router.push(`/dashboard-coach/aluno/${id}/editor-pro`)}
          className="bg-slate-900 text-white px-4 sm:px-6 py-3 rounded-[16px] sm:rounded-[20px] text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2 shadow-lg hover:bg-green-600 transition-all active:scale-95"
        >
          <Edit3 size={16} className="text-green-400" /> <span className="hidden sm:inline">Editar no Master</span>
        </button>
      </header>

      <main className="max-w-4xl mx-auto space-y-6">
        
        {protocols.length === 0 ? (
           <div className="text-center py-20 bg-white border-2 border-dashed border-slate-300 rounded-[40px] shadow-sm">
              <Utensils size={48} className="mx-auto mb-4 text-slate-300" />
              <h2 className="text-2xl font-black italic uppercase text-slate-400 mb-2">Nenhuma dieta ativa</h2>
              <p className="text-sm font-bold text-slate-400 mb-6">Este aluno ainda não possui uma dieta prescrita.</p>
              <button 
                onClick={() => router.push(`/dashboard-coach/aluno/${id}/editor-pro`)}
                className="bg-green-600 text-white px-8 py-4 rounded-[20px] font-black uppercase tracking-widest text-xs hover:bg-slate-900 transition-all shadow-xl"
              >
                Prescrever Agora
              </button>
           </div>
        ) : (
          <>
            {/* ABAS DE PROTOCOLOS (Se houver mais de 1) */}
            {protocols.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
                {protocols.map((p, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setActiveProtocolIndex(idx)}
                    className={`px-5 sm:px-6 py-3 sm:py-3.5 rounded-[16px] sm:rounded-2xl font-black uppercase text-[10px] sm:text-xs whitespace-nowrap transition-all shadow-sm
                      ${activeProtocolIndex === idx 
                        ? 'bg-slate-900 text-white border border-slate-900' 
                        : 'bg-white text-slate-400 border border-slate-200 hover:border-green-400 hover:text-green-600'
                      }
                    `}
                  >
                    {p.name || `Protocolo ${idx + 1}`}
                  </button>
                ))}
              </div>
            )}

            {/* LISTAGEM DE REFEIÇÕES DO PROTOCOLO ATIVO */}
            <div className="space-y-6 sm:space-y-8">
              {protocols[activeProtocolIndex].meals?.map((meal: any, mIdx: number) => (
                <div key={mIdx} className="bg-white rounded-[35px] border border-slate-100 p-6 sm:p-8 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-green-500 rounded-l-[35px]"></div>
                  
                  {/* Cabeçalho da Refeição */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 pb-4 border-b border-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full text-[10px] font-black flex items-center gap-1.5">
                        <Clock size={12} /> {meal.time || '--:--'}
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black uppercase italic text-slate-800 leading-none">{meal.title || 'Refeição'}</h3>
                    </div>
                  </div>

                  {/* Observações da Refeição */}
                  {meal.observations && (
                    <div className="mb-6 bg-amber-50/50 border border-amber-100 p-4 rounded-[20px] flex items-start gap-3">
                      <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-xs font-semibold text-amber-800 italic">{meal.observations}</p>
                    </div>
                  )}

                  {/* Alimentos e Substitutos */}
                  <div className="space-y-3 pl-1 sm:pl-2">
                    {meal.items?.length > 0 ? (
                      meal.items.map((item: any, iIdx: number) => (
                        <div key={iIdx} className="flex flex-col gap-2">
                          
                          {/* Alimento Principal */}
                          <div className="flex items-center gap-4 bg-slate-50 p-3 sm:p-4 rounded-[20px] border border-slate-100 hover:border-green-200 transition-colors">
                            <div className="bg-white border border-slate-200 px-3 py-2 rounded-[14px] min-w-[70px] text-center shadow-sm">
                               <span className="font-black text-lg text-slate-900 block leading-none">{item.amount || '0'}</span>
                               <span className="text-[9px] font-black uppercase text-slate-400 block mt-1">{item.unit || 'g'}</span>
                            </div>
                            <span className="font-bold text-sm sm:text-base text-slate-800 uppercase flex-1">{item.name}</span>
                          </div>

                          {/* Lista de Substitutos (Abaixo do alimento principal) */}
                          {item.substitutes?.length > 0 && (
                            <div className="pl-6 sm:pl-10 space-y-2 mt-1 relative">
                              <div className="absolute left-[38px] top-0 w-px h-full bg-slate-200 hidden sm:block"></div>
                              {item.substitutes.map((sub: any, sIdx: number) => (
                                <div key={sIdx} className="flex items-center gap-3 bg-white border border-slate-200 p-2.5 rounded-[16px] relative z-10 w-fit pr-6">
                                  <div className="w-6 h-6 bg-green-50 rounded-full flex items-center justify-center shrink-0">
                                    <ArrowRightLeft size={12} className="text-green-600" />
                                  </div>
                                  <div className="flex items-center gap-2">
                                     <span className="font-black text-xs text-slate-900 bg-slate-100 px-2 py-1 rounded-[8px]">{sub.amount}{sub.unit}</span>
                                     <span className="text-[10px] sm:text-[11px] font-bold uppercase text-slate-600 truncate max-w-[200px] sm:max-w-none">{sub.name}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                        </div>
                      ))
                    ) : (
                      <p className="text-xs font-bold text-slate-400 italic py-4">Nenhum alimento cadastrado nesta refeição.</p>
                    )}
                  </div>

                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* FOOTER FIXO (Apenas se tiver dieta) */}
      {protocols.length > 0 && (
        <footer className="fixed bottom-0 left-0 right-0 p-4 sm:p-6 bg-white/90 backdrop-blur-xl border-t border-slate-200 z-40">
          <button 
            onClick={() => router.push(`/dashboard-coach/aluno/${id}/editor-pro`)}
            className="max-w-4xl mx-auto w-full bg-slate-900 text-white py-5 sm:py-6 rounded-[25px] font-black uppercase tracking-[0.2em] text-xs sm:text-sm shadow-xl hover:bg-green-600 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
          >
            <Edit3 size={20} className="text-green-400" /> Desbloquear Edição no Master
          </button>
        </footer>
      )}

    </div>
  );
}