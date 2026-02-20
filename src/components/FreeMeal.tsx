'use client'

import { useState, useRef, useEffect } from 'react';
import { Flame, X, CheckCircle, Camera, Trash2, Loader2 } from 'lucide-react';

export default function FreeMeal({ studentId }: { studentId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mealText, setMealText] = useState('');
  const [mealPhoto, setMealPhoto] = useState<string | null>(null);
  const [salvo, setSalvo] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
          setMealText('');
          setMealPhoto(null);
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
        className="w-full bg-white border border-slate-200 p-5 rounded-[24px] sm:rounded-3xl shadow-sm hover:shadow-md hover:border-orange-300 transition-all flex items-center gap-4 group h-full active:scale-[0.98]"
      >
        <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-[16px] sm:rounded-2xl flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-all shrink-0">
          <Flame size={24} />
        </div>
        <div className="text-left">
          <h3 className="font-black uppercase text-sm text-slate-800 leading-tight">Saiu do<br/>Plano?</h3>
        </div>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-4 sm:p-6 overscroll-none">
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md" onClick={() => !loading && setIsOpen(false)} />
          
          <div className="bg-white w-full max-w-md rounded-[35px] sm:rounded-[40px] overflow-hidden relative z-10 animate-in slide-in-from-bottom sm:zoom-in duration-300 shadow-2xl pb-[env(safe-area-inset-bottom,0px)] border border-slate-100">
            
            {/* Header Elite (Dark com detalhe laranja) */}
            <div className="bg-slate-900 border-b-4 border-orange-500 p-8 pt-[max(env(safe-area-inset-top,2rem),2rem)] text-white relative shrink-0 text-center">
               <button 
                 onClick={() => setIsOpen(false)} 
                 className="absolute top-6 right-6 bg-white/10 hover:bg-white/20 p-3 rounded-full transition-colors text-white"
               >
                 <X size={20} />
               </button>
               <div className="w-16 h-16 bg-white/10 border border-white/5 rounded-[20px] sm:rounded-3xl flex items-center justify-center backdrop-blur-md mx-auto mb-4">
                  <Flame size={32} className="text-orange-500" />
               </div>
               <h3 className="text-2xl font-black uppercase italic leading-none tracking-tight">Registro de Furo</h3>
               <p className="text-[10px] font-bold uppercase text-slate-400 tracking-[0.2em] mt-2">O que rolou fora do plano?</p>
            </div>

            {/* Conteúdo */}
            <div className="p-6 sm:p-8 bg-slate-50 space-y-6">
              
              <div className="relative">
                {mealPhoto ? (
                  <div className="relative w-full h-56 rounded-[25px] overflow-hidden border-4 border-white shadow-lg">
                    <img src={mealPhoto} alt="Refeição Livre" className="w-full h-full object-cover" />
                    <button 
                      onClick={() => setMealPhoto(null)}
                      className="absolute top-3 right-3 bg-red-500 text-white p-3 rounded-2xl shadow-lg hover:bg-red-600 transition-colors active:scale-95"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-40 border-2 border-dashed border-slate-200 rounded-[25px] flex flex-col items-center justify-center gap-3 text-slate-400 hover:border-orange-400 hover:text-orange-500 hover:bg-orange-50 transition-all bg-white shadow-sm"
                  >
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-inherit">
                       <Camera size={24} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Adicionar Foto do Prato</span>
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
                className="w-full bg-white border border-slate-200 p-5 rounded-[25px] text-sm font-bold text-slate-800 outline-none focus:border-orange-500 focus:shadow-[0_0_0_4px_rgba(249,115,22,0.1)] transition-all min-h-[120px] resize-none shadow-sm placeholder:text-slate-300"
              />

              <button 
                onClick={handleSave}
                disabled={(!mealText && !mealPhoto) || salvo || loading}
                className="w-full bg-slate-900 text-white p-5 rounded-[20px] sm:rounded-[25px] font-black uppercase tracking-[0.2em] text-xs sm:text-sm hover:bg-orange-500 transition-all shadow-xl active:scale-95 disabled:opacity-50 disabled:scale-100 flex justify-center items-center gap-3"
              >
                {loading ? (
                  <><Loader2 size={20} className="animate-spin text-orange-400" /> Salvando...</>
                ) : salvo ? (
                  <><CheckCircle size={20} className="text-green-400"/> Registrado!</>
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