'use client'

import { useState, useEffect } from 'react';
import { Activity, Battery, Utensils, CheckCircle, X, CheckSquare, Square } from 'lucide-react';

export default function Biofeedback({ studentId }: { studentId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [fome, setFome] = useState<string | null>(null);
  const [digestao, setDigestao] = useState<string | null>(null);
  const [energia, setEnergia] = useState<string | null>(null);
  const [salvo, setSalvo] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    async function loadFeedback() {
      if (!studentId || !isOpen) return;
      try {
        const today = new Date().toISOString().split('T')[0];
        const res = await fetch(`/api/checkins?studentId=${studentId}&date=${today}`);
        const data = await res.json();
        if (data) {
          setFome(data.fome);
          setDigestao(data.digestao);
          setEnergia(data.energia);
        }
      } catch (err) { console.error(err); }
    }
    loadFeedback();
  }, [studentId, isOpen]);

  const handleSave = async () => {
    if (!fome || !digestao || !energia) return;
    try {
      await fetch('/api/checkins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          date: new Date().toISOString().split('T')[0],
          fome, digestao, energia
        })
      });
      setSalvo(true);
      setTimeout(() => { setSalvo(false); setIsOpen(false); }, 2000);
    } catch (err) { console.error(err); }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)} 
        className="w-full bg-white border border-slate-200 p-5 rounded-[24px] sm:rounded-3xl shadow-sm hover:shadow-md hover:border-green-300 transition-all flex items-center gap-4 group h-full active:scale-[0.98]"
      >
         <div className="w-12 h-12 bg-green-50 text-green-600 rounded-[16px] sm:rounded-2xl flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-all shrink-0">
           <Activity size={24} />
         </div>
         <div className="text-left">
            <h3 className="font-black uppercase text-sm text-slate-800 leading-tight">Relatório</h3>
            <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Biofeedback</p>
         </div>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md" onClick={() => setIsOpen(false)} />
          
          <div className="bg-white w-full max-w-[95vw] sm:max-w-md max-h-[90dvh] rounded-[35px] sm:rounded-[40px] flex flex-col relative z-10 shadow-2xl animate-in zoom-in-95 duration-300 border border-slate-100 overflow-hidden">
            
            {/* Header Elite */}
            <div className="bg-slate-900 border-b-4 border-green-600 p-6 sm:p-8 pt-[max(env(safe-area-inset-top,1.5rem),1.5rem)] text-white relative shrink-0 text-center">
               <button 
                 onClick={() => setIsOpen(false)} 
                 className="absolute top-4 right-4 sm:top-6 sm:right-6 bg-white/10 hover:bg-white/20 p-2 sm:p-3 rounded-full transition-colors text-white min-w-[44px] min-h-[44px] flex items-center justify-center z-20"
               >
                 <X size={20} />
               </button>
               <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/10 border border-white/5 rounded-[20px] sm:rounded-3xl flex items-center justify-center backdrop-blur-md mx-auto mb-3 sm:mb-4">
                  <Activity size={28} className="text-green-400 sm:w-[32px] sm:h-[32px]" />
               </div>
               <h3 className="text-xl sm:text-2xl font-black uppercase italic leading-none tracking-tight">Biofeedback</h3>
               <p className="text-[9px] sm:text-[10px] font-bold uppercase text-slate-400 tracking-[0.2em] mt-2">Relatório Diário</p>
            </div>

            {/* Conteúdo com Scroll Interno */}
            <div className="p-5 sm:p-8 bg-slate-50 space-y-4 sm:space-y-6 flex-1 overflow-y-auto custom-scrollbar">
                
                {/* Bloco: Fome */}
                <div className="bg-white p-4 sm:p-5 rounded-[25px] border border-slate-200 shadow-sm hover:border-green-200 transition-colors">
                  <p className="text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 sm:mb-4 flex items-center gap-2">
                    <Utensils size={14} className="text-green-500" /> Nível de Fome
                  </p>
                  <div className="flex gap-2">
                    {['Baixa', 'Normal', 'Alta'].map(nivel => (
                      <button 
                        key={nivel} 
                        onClick={() => setFome(nivel)} 
                        className={`flex-1 py-3 px-1 rounded-[16px] text-[10px] sm:text-xs font-black uppercase transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 ${fome === nivel ? 'bg-green-600 text-white shadow-md scale-105' : 'bg-slate-50 text-slate-400 border border-slate-100 hover:border-green-300'}`}
                      >
                        {fome === nivel ? <CheckSquare size={14} className="shrink-0" /> : <Square size={14} className="opacity-50 shrink-0" />}
                        <span className="truncate w-full text-center px-1">{nivel}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bloco: Digestão */}
                <div className="bg-white p-4 sm:p-5 rounded-[25px] border border-slate-200 shadow-sm hover:border-green-200 transition-colors">
                  <p className="text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 sm:mb-4 flex items-center gap-2">
                    <Activity size={14} className="text-green-500" /> Digestão e Intestino
                  </p>
                  <div className="flex gap-2">
                    {['Ruim', 'Normal', 'Perfeito'].map(nivel => (
                      <button 
                        key={nivel} 
                        onClick={() => setDigestao(nivel)} 
                        className={`flex-1 py-3 px-1 rounded-[16px] text-[10px] sm:text-xs font-black uppercase transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 ${digestao === nivel ? 'bg-green-600 text-white shadow-md scale-105' : 'bg-slate-50 text-slate-400 border border-slate-100 hover:border-green-300'}`}
                      >
                        {digestao === nivel ? <CheckSquare size={14} className="shrink-0" /> : <Square size={14} className="opacity-50 shrink-0" />}
                        <span className="truncate w-full text-center px-1">{nivel}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bloco: Energia */}
                <div className="bg-white p-4 sm:p-5 rounded-[25px] border border-slate-200 shadow-sm hover:border-green-200 transition-colors">
                  <p className="text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 sm:mb-4 flex items-center gap-2">
                    <Battery size={14} className="text-green-500" /> Energia Geral
                  </p>
                  <div className="flex gap-2">
                    {['Baixa', 'Média', 'Alta'].map(nivel => (
                      <button 
                        key={nivel} 
                        onClick={() => setEnergia(nivel)} 
                        className={`flex-1 py-3 px-1 rounded-[16px] text-[10px] sm:text-xs font-black uppercase transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 ${energia === nivel ? 'bg-green-600 text-white shadow-md scale-105' : 'bg-slate-50 text-slate-400 border border-slate-100 hover:border-green-300'}`}
                      >
                        {energia === nivel ? <CheckSquare size={14} className="shrink-0" /> : <Square size={14} className="opacity-50 shrink-0" />}
                        <span className="truncate w-full text-center px-1">{nivel}</span>
                      </button>
                    ))}
                  </div>
                </div>

            </div>

            {/* Botão de Salvar Rodapé Fixo */}
            <div className="p-4 sm:p-5 bg-white border-t border-slate-100 shrink-0">
               <button 
                 onClick={handleSave} 
                 disabled={!fome || !digestao || !energia || salvo} 
                 className="w-full py-4 sm:py-5 bg-slate-900 text-white rounded-[20px] sm:rounded-[25px] font-black uppercase tracking-[0.2em] text-xs sm:text-sm hover:bg-green-600 transition-all shadow-xl disabled:opacity-50 disabled:scale-100 active:scale-95 flex justify-center items-center gap-3 min-h-[56px]"
               >
                 {salvo ? <><CheckCircle size={20} className="text-green-400" /> Salvo!</> : 'Registrar no Diário'}
               </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}