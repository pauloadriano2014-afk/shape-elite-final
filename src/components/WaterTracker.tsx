'use client'

import { useState, useEffect } from 'react';
import { Droplets, Info, RotateCcw } from 'lucide-react';

export default function WaterTracker({ studentId, weight }: { studentId: string, weight: number | null }) {
  const [consumed, setConsumed] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const [loading, setLoading] = useState(true);

  const baseWeight = weight ? parseFloat(weight.toString()) : 70;
  const minGoal = baseWeight * 35;
  const progress = Math.min((consumed / minGoal) * 100, 100);

  useEffect(() => {
    async function loadWater() {
      if (!studentId) return;
      try {
        const today = new Date().toISOString().split('T')[0];
        const res = await fetch(`/api/checkins?studentId=${studentId}&date=${today}`);
        const data = await res.json();
        if (data && data.water_ml) setConsumed(data.water_ml);
      } catch (err) {
        console.error("Erro ao carregar água:", err);
      } finally {
        setLoading(false);
      }
    }
    loadWater();
  }, [studentId]);

  const updateWater = async (newAmount: number) => {
    setConsumed(newAmount);
    try {
      await fetch('/api/checkins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          date: new Date().toISOString().split('T')[0],
          water_ml: newAmount
        })
      });
    } catch (err) {
      console.error("Erro ao salvar água:", err);
    }
  };

  if (loading) return <div className="h-32 flex items-center justify-center text-blue-500 animate-pulse font-black text-xs uppercase tracking-widest bg-white rounded-[30px] border border-slate-100 shadow-sm">Sincronizando...</div>;

  return (
    <div className="bg-white p-5 sm:p-6 rounded-[25px] sm:rounded-[30px] border border-slate-100 shadow-sm relative hover:border-blue-200 transition-colors">
      <div className="flex justify-between items-start mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-[14px] flex items-center justify-center"><Droplets size={20} /></div>
          <div>
            <h3 className="font-black uppercase text-sm sm:text-base text-slate-800 leading-none mb-1">Hidratação</h3>
            <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Meta Mínima: {minGoal / 1000}L</span>
          </div>
        </div>
        <button onClick={() => setShowInfo(!showInfo)} className="text-slate-300 hover:text-blue-500 bg-slate-50 p-2 rounded-full transition-colors"><Info size={16} /></button>
      </div>

      {showInfo && (
        <div className="bg-blue-50 p-4 rounded-[16px] mb-5 border border-blue-100 text-[10px] sm:text-xs font-medium text-blue-800 leading-relaxed animate-in slide-in-from-top-2">
           Sua meta base é <b className="text-blue-600">35ml/kg</b>. Em dias de treino intenso ou calor, suba para <b className="text-blue-600">50ml/kg</b>.
        </div>
      )}

      <div className="mb-5">
        <div className="flex justify-between items-end mb-2 px-1">
          <span className="text-2xl sm:text-3xl font-black text-blue-600 italic leading-none">{(consumed / 1000).toFixed(2)}L</span>
          <span className="text-[10px] sm:text-[11px] font-black uppercase text-slate-400 tracking-widest">/ {minGoal / 1000}L</span>
        </div>
        <div className="w-full bg-slate-100 h-3 sm:h-4 rounded-full overflow-hidden shadow-inner">
          <div className="bg-blue-500 h-full rounded-full transition-all duration-700 ease-out relative overflow-hidden" style={{ width: `${progress}%` }}>
            <div className="absolute inset-0 bg-white/20 w-full h-full animate-[pulse_2s_ease-in-out_infinite]"></div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 sm:gap-3">
        <button onClick={() => updateWater(consumed + 250)} className="flex-1 bg-slate-50 border border-slate-200 hover:bg-blue-50 hover:border-blue-200 text-blue-600 font-black text-[10px] sm:text-xs tracking-widest py-3 sm:py-4 rounded-[16px] transition-all active:scale-95 shadow-sm">+ 250ml</button>
        <button onClick={() => updateWater(consumed + 500)} className="flex-1 bg-slate-50 border border-slate-200 hover:bg-blue-50 hover:border-blue-200 text-blue-600 font-black text-[10px] sm:text-xs tracking-widest py-3 sm:py-4 rounded-[16px] transition-all active:scale-95 shadow-sm">+ 500ml</button>
        <button onClick={() => updateWater(0)} className="w-12 sm:w-14 flex shrink-0 items-center justify-center bg-slate-50 border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 rounded-[16px] transition-all shadow-sm"><RotateCcw size={16} /></button>
      </div>
    </div>
  );
}