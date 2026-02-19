'use client'

import { useState, useEffect } from 'react';
import { Activity, Battery, Utensils, CheckCircle, X } from 'lucide-react';

export default function Biofeedback({ studentId }: { studentId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [fome, setFome] = useState<string | null>(null);
  const [digestao, setDigestao] = useState<string | null>(null);
  const [energia, setEnergia] = useState<string | null>(null);
  const [salvo, setSalvo] = useState(false);

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
      <button onClick={() => setIsOpen(true)} className="w-full bg-white border border-slate-200 p-4 rounded-2xl shadow-sm hover:border-blue-300 transition-all flex items-center gap-3 group h-full">
         <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors shrink-0"><Activity size={20} /></div>
         <div className="text-left">
            <h3 className="font-black uppercase text-sm text-slate-800 leading-tight">Relatório</h3>
            <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">Como se sentiu?</p>
         </div>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="bg-white w-full max-w-md rounded-[35px] overflow-hidden relative z-10 shadow-2xl">
            <div className="bg-indigo-600 p-6 text-white pt-8 pb-10 relative">
               <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 p-2 rounded-full transition-colors text-white"><X size={18} /></button>
               <h3 className="text-xl font-black uppercase italic">Biofeedback Diário</h3>
            </div>
            <div className="p-6 -mt-6 bg-white rounded-t-[30px] relative space-y-5">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 flex items-center gap-1"><Utensils size={12}/> Fome hoje</p>
                  <div className="flex gap-2">
                    {['Baixa', 'Normal', 'Alta'].map(nivel => (
                      <button key={nivel} onClick={() => setFome(nivel)} className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${fome === nivel ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-50 text-slate-400'}`}>{nivel}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 flex items-center gap-1"><Activity size={12}/> Digestão / Intestino</p>
                  <div className="flex gap-2">
                    {['Ruim', 'Normal', 'Perfeito'].map(nivel => (
                      <button key={nivel} onClick={() => setDigestao(nivel)} className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${digestao === nivel ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-50 text-slate-400'}`}>{nivel}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 flex items-center gap-1"><Battery size={12}/> Energia no Treino</p>
                  <div className="flex gap-2">
                    {['Baixa', 'Média', 'Alta'].map(nivel => (
                      <button key={nivel} onClick={() => setEnergia(nivel)} className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${energia === nivel ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-50 text-slate-400'}`}>{nivel}</button>
                    ))}
                  </div>
                </div>
                <button onClick={handleSave} disabled={!fome || !digestao || !energia || salvo} className="w-full mt-4 py-4 bg-slate-900 text-white rounded-[20px] font-black uppercase hover:bg-indigo-600 transition-colors flex justify-center items-center gap-2">
                  {salvo ? <><CheckCircle size={16} className="text-green-400" /> Salvo!</> : 'Salvar no Diário'}
                </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}