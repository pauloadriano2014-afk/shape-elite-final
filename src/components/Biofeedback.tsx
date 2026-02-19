'use client'

import { useState, useEffect } from 'react';
import { Activity, Battery, Utensils, CheckCircle, X, CheckSquare, Square } from 'lucide-react';

export default function Biofeedback({ studentId }: { studentId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [fome, setFome] = useState<string | null>(null);
  const [digestao, setDigestao] = useState<string | null>(null);
  const [energia, setEnergia] = useState<string | null>(null);
  const [salvo, setSalvo] = useState(false);

  // Trava de Scroll (Bloqueia o fundo quando o modal abre)
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
        className="w-full bg-white border border-slate-200 p-5 rounded-3xl shadow-sm hover:shadow-md hover:border-indigo-300 transition-all flex items-center gap-4 group h-full active:scale-[0.98]"
      >
         <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all shrink-0">
           <Activity size={24} />
         </div>
         <div className="text-left">
            <h3 className="font-black uppercase text-sm text-slate-800 leading-tight">Relatório</h3>
            <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Biofeedback</p>
         </div>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-4 sm:p-6 overscroll-none">
          {/* Fundo escuro */}
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md" onClick={() => setIsOpen(false)} />
          
          {/* Caixa do Modal */}
          <div className="bg-white w-full max-w-md rounded-[40px] overflow-hidden relative z-10 shadow-2xl animate-in slide-in-from-bottom sm:zoom-in duration-300 pb-[env(safe-area-inset-bottom,0px)]">
            
            {/* Header Elite */}
            <div className="bg-indigo-600 p-8 text-white relative shrink-0 text-center">
               <button 
                 onClick={() => setIsOpen(false)} 
                 className="absolute top-6 right-6 bg-white/20 hover:bg-white/40 p-3 rounded-full transition-colors text-white"
               >
                 <X size={20} />
               </button>
               <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-md mx-auto mb-4">
                  <Activity size={32} className="text-white" />
               </div>
               <h3 className="text-2xl font-black uppercase italic leading-none tracking-tight">Biofeedback</h3>
               <p className="text-[10px] font-bold uppercase opacity-80 tracking-[0.2em] mt-2">Relatório Diário do Aluno</p>
            </div>

            {/* Conteúdo */}
            <div className="p-8 bg-slate-50 space-y-6">
                
                {/* Bloco: Fome */}
                <div className="bg-white p-5 rounded-[25px] border border-slate-200 shadow-sm">
                  <p className="text-[11px] font-black text-slate-500 uppercase mb-4 flex items-center gap-2">
                    <Utensils size={14} className="text-indigo-600" /> Nível de Fome
                  </p>
                  <div className="flex gap-2">
                    {['Baixa', 'Normal', 'Alta'].map(nivel => (
                      <button 
                        key={nivel} 
                        onClick={() => setFome(nivel)} 
                        className={`flex-1 py-3 px-1 rounded-2xl text-[10px] sm:text-xs font-black uppercase transition-all flex items-center justify-center gap-1 sm:gap-2 ${fome === nivel ? 'bg-indigo-600 text-white shadow-md scale-105' : 'bg-slate-50 text-slate-400 border border-slate-100 hover:border-indigo-200'}`}
                      >
                        {fome === nivel ? <CheckSquare size={14} /> : <Square size={14} className="opacity-50" />}
                        {nivel}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bloco: Digestão */}
                <div className="bg-white p-5 rounded-[25px] border border-slate-200 shadow-sm">
                  <p className="text-[11px] font-black text-slate-500 uppercase mb-4 flex items-center gap-2">
                    <Activity size={14} className="text-indigo-600" /> Digestão e Intestino
                  </p>
                  <div className="flex gap-2">
                    {['Ruim', 'Normal', 'Perfeito'].map(nivel => (
                      <button 
                        key={nivel} 
                        onClick={() => setDigestao(nivel)} 
                        className={`flex-1 py-3 px-1 rounded-2xl text-[10px] sm:text-xs font-black uppercase transition-all flex items-center justify-center gap-1 sm:gap-2 ${digestao === nivel ? 'bg-indigo-600 text-white shadow-md scale-105' : 'bg-slate-50 text-slate-400 border border-slate-100 hover:border-indigo-200'}`}
                      >
                        {digestao === nivel ? <CheckSquare size={14} /> : <Square size={14} className="opacity-50" />}
                        {nivel}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bloco: Energia */}
                <div className="bg-white p-5 rounded-[25px] border border-slate-200 shadow-sm">
                  <p className="text-[11px] font-black text-slate-500 uppercase mb-4 flex items-center gap-2">
                    <Battery size={14} className="text-indigo-600" /> Energia Geral
                  </p>
                  <div className="flex gap-2">
                    {['Baixa', 'Média', 'Alta'].map(nivel => (
                      <button 
                        key={nivel} 
                        onClick={() => setEnergia(nivel)} 
                        className={`flex-1 py-3 px-1 rounded-2xl text-[10px] sm:text-xs font-black uppercase transition-all flex items-center justify-center gap-1 sm:gap-2 ${energia === nivel ? 'bg-indigo-600 text-white shadow-md scale-105' : 'bg-slate-50 text-slate-400 border border-slate-100 hover:border-indigo-200'}`}
                      >
                        {energia === nivel ? <CheckSquare size={14} /> : <Square size={14} className="opacity-50" />}
                        {nivel}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Botão de Salvar */}
                <div className="pt-2">
                  <button 
                    onClick={handleSave} 
                    disabled={!fome || !digestao || !energia || salvo} 
                    className="w-full py-5 bg-slate-900 text-white rounded-[25px] font-black uppercase tracking-[0.2em] text-sm hover:bg-indigo-600 transition-all shadow-xl disabled:opacity-50 disabled:scale-100 active:scale-95 flex justify-center items-center gap-3"
                  >
                    {salvo ? <><CheckCircle size={20} className="text-green-400" /> Relatório Salvo!</> : 'Registrar no Diário'}
                  </button>
                </div>
                
            </div>
          </div>
        </div>
      )}
    </>
  );
}