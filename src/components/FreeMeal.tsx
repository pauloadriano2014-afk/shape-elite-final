'use client'

import { useState, useRef, useEffect } from 'react';
import { Flame, X, CheckCircle, Camera, Trash2, Loader2, Image as ImageIcon } from 'lucide-react';

export default function FreeMeal({ studentId }: { studentId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mealText, setMealText] = useState('');
  const [mealPhoto, setMealPhoto] = useState<string | null>(null);
  const [salvo, setSalvo] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Carrega dados existentes ao abrir o modal
  useEffect(() => {
    async function loadFreeMeal() {
      if (!studentId || !isOpen) return;
      try {
        const today = new Date().toISOString().split('T')[0];
        const res = await fetch(`/api/checkins?studentId=${studentId}&date=${today}`);
        const data = await res.json();
        if (data) {
          setMealText(data.free_meal || '');
          setMealPhoto(data.free_meal_photo || null);
        }
      } catch (err) {
        console.error("Erro ao carregar refeição livre:", err);
      }
    }
    loadFreeMeal();
  }, [studentId, isOpen]);

  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setMealPhoto(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!mealText && !mealPhoto) return;
    setLoading(true);

    try {
      const res = await fetch('/api/checkins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          date: new Date().toISOString().split('T')[0],
          free_meal: mealText,
          free_meal_photo: mealPhoto
        })
      });

      if (res.ok) {
        setSalvo(true);
        setTimeout(() => {
          setSalvo(false);
          setIsOpen(false);
        }, 2000);
      }
    } catch (err) {
      console.error("Erro ao salvar refeição livre:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full bg-white border border-slate-200 p-4 rounded-2xl shadow-sm hover:shadow-md hover:border-orange-300 transition-all flex items-center gap-3 group h-full"
      >
        <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-colors shrink-0">
          <Flame size={20} />
        </div>
        <div className="text-left">
          <h3 className="font-black uppercase text-sm text-slate-800 leading-tight">Saiu do<br/>Plano?</h3>
        </div>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => !loading && setIsOpen(false)} />
          
          <div className="bg-white w-full max-w-md rounded-[35px] overflow-hidden relative z-10 animate-in slide-in-from-bottom duration-300 shadow-2xl">
            <div className="bg-orange-500 p-6 text-white pt-8 pb-10 relative">
               <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 p-2 rounded-full transition-colors text-white">
                 <X size={18} />
               </button>
               <span className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2 block flex items-center gap-1"><Flame size={12}/> Registro de Furo</span>
               <h3 className="text-xl font-black uppercase italic leading-none">O que rolou fora do plano?</h3>
            </div>

            <div className="p-6 -mt-6 bg-white rounded-t-[30px] relative space-y-4">
              
              {/* Área de Foto */}
              <div className="relative">
                {mealPhoto ? (
                  <div className="relative w-full h-48 rounded-2xl overflow-hidden border-2 border-orange-100 shadow-inner">
                    <img src={mealPhoto} alt="Refeição Livre" className="w-full h-full object-cover" />
                    <button 
                      onClick={() => setMealPhoto(null)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-32 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-orange-300 hover:text-orange-500 hover:bg-orange-50 transition-all"
                  >
                    <Camera size={24} />
                    <span className="text-[10px] font-black uppercase">Adicionar Foto do Prato</span>
                  </button>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  capture="environment" 
                  ref={fileInputRef} 
                  className="hidden" 
                  onChange={handleImageCapture} 
                />
              </div>

              <textarea 
                value={mealText}
                onChange={(e) => setMealText(e.target.value)}
                placeholder="Descreva o que comeu (ex: 2 fatias de pizza, 1 copo de suco...)"
                className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl text-sm font-medium text-slate-700 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all min-h-[100px] resize-none"
              />

              <button 
                onClick={handleSave}
                disabled={(!mealText && !mealPhoto) || salvo || loading}
                className="w-full bg-slate-900 text-white p-4 rounded-[20px] font-black uppercase hover:bg-orange-500 transition-colors shadow-xl active:scale-98 disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {loading ? (
                  <><Loader2 size={18} className="animate-spin" /> Salvando...</>
                ) : salvo ? (
                  <><CheckCircle size={18} className="text-green-400"/> Registrado!</>
                ) : (
                  'Salvar no Relatório'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}