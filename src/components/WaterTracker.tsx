'use client'

import { useState, useEffect } from 'react';
import { Droplets, Info, Plus, RotateCcw, Loader2 } from 'lucide-react';

export default function WaterTracker({ studentId, weight }: { studentId: string, weight: number | null }) {
  const [consumed, setConsumed] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const [loading, setLoading] = useState(true);

  const baseWeight = weight ? parseFloat(weight.toString()) : 70;
  const minGoal = baseWeight * 35;
  const progress = Math.min((consumed / minGoal) * 100, 100);

  // BUSCAR DADOS AO CARREGAR
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

  // SALVAR NO BANCO
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

  if (loading) return <div className="h-32 flex items-center justify-center text-blue-500 animate-pulse font-black text-xs uppercase italic">Sincronizando Hidratação...</div>;

  return (
    <div className="bg-white p-5 rounded-[25px] border border-blue-100 shadow-sm relative mb-4">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center"><Droplets size={16} /></div>
          <div>
            <h3 className="font-black uppercase text-sm text-slate-800 leading-none">Hidratação</h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Meta Mínima: {minGoal / 1000}L</span>
          </div>
        </div>
        <button onClick={() => setShowInfo(!showInfo)} className="text-slate-300 hover:text-blue-500 transition-colors"><Info size={18} /></button>
      </div>

      {showInfo && (
        <div className="bg-blue-50 p-3 rounded-xl mb-4 border border-blue-100 text-[10px] font-medium text-blue-800 leading-relaxed">
           Sua meta base é <b>35ml/kg</b>. Em dias de treino intenso ou calor, suba para <b>50ml/kg</b>.
        </div>
      )}

      <div className="mb-4">
        <div className="flex justify-between items-end mb-2">
          <span className="text-2xl font-black text-blue-600 italic">{(consumed / 1000).toFixed(2)}L</span>
          <span className="text-[10px] font-black uppercase text-slate-300">/ {minGoal / 1000}L</span>
        </div>
        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
          <div className="bg-blue-500 h-full rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={() => updateWater(consumed + 250)} className="flex-1 bg-slate-50 border border-slate-100 hover:bg-blue-50 text-blue-600 font-black text-xs py-2 rounded-xl transition-all">+ 250ml</button>
        <button onClick={() => updateWater(consumed + 500)} className="flex-1 bg-slate-50 border border-slate-100 hover:bg-blue-50 text-blue-600 font-black text-xs py-2 rounded-xl transition-all">+ 500ml</button>
        <button onClick={() => updateWater(0)} className="w-10 flex shrink-0 items-center justify-center bg-slate-50 border border-slate-100 text-slate-400 hover:text-red-500 rounded-xl transition-all"><RotateCcw size={14} /></button>
      </div>
    </div>
  );
}