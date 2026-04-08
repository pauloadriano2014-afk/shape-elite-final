import React from 'react';
import { X, CheckCircle } from 'lucide-react';

interface SubstituteModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItem: any;
}

export default function SubstituteModal({ isOpen, onClose, selectedItem }: SubstituteModalProps) {
  if (!isOpen || !selectedItem) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center sm:p-6">
      <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md" onClick={onClose} />
      
      <div className="bg-white w-full max-w-lg rounded-t-[40px] sm:rounded-[50px] overflow-hidden relative z-10 animate-in slide-in-from-bottom duration-500 shadow-2xl pb-[env(safe-area-inset-bottom,0px)] max-h-[85dvh] flex flex-col">
        <div className="bg-slate-900 border-b-4 border-green-600 p-6 sm:p-8 pt-[max(1.5rem,env(safe-area-inset-top))] text-white relative shrink-0">
           <button 
             onClick={onClose} 
             className="absolute top-4 sm:top-6 right-4 sm:right-6 bg-white/10 hover:bg-white/20 p-2 sm:p-3 rounded-full transition-colors text-white min-w-[44px] min-h-[44px] flex items-center justify-center"
           >
             <X size={20} />
           </button>
           <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] opacity-80 mb-2 sm:mb-3 block text-green-400">Opções Inteligentes:</span>
           <h3 className="text-2xl sm:text-3xl font-black uppercase italic leading-none tracking-tight pr-12 line-clamp-2">{selectedItem.name}</h3>
        </div>

        <div className="p-5 sm:p-8 bg-white flex-1 overflow-hidden flex flex-col">
          <div className="space-y-3 sm:space-y-4 overflow-y-auto custom-scrollbar flex-1 pr-1 sm:pr-2">
            {selectedItem.substitutes.map((sub: any, idx: number) => (
              <div key={idx} className="flex justify-between items-center p-4 sm:p-5 bg-white rounded-[25px] sm:rounded-[30px] border border-slate-100 shadow-sm group hover:border-green-500 hover:bg-green-50/30 transition-all active:scale-[0.98]">
                <div className="flex items-center gap-3 sm:gap-5 overflow-hidden">
                  <div className="w-14 h-14 sm:w-16 h-16 shrink-0 rounded-[18px] sm:rounded-[22px] bg-slate-50 border border-slate-100 flex flex-col items-center justify-center text-slate-800 group-hover:bg-white group-hover:border-green-200 transition-all shadow-inner">
                    <span className="text-base sm:text-lg font-black leading-none">{sub.amount}</span>
                    <span className="text-[8px] sm:text-[9px] font-black uppercase mt-1 text-green-600">{sub.unit}</span>
                  </div>
                  <span className="font-black uppercase italic text-slate-700 text-xs sm:text-sm group-hover:text-green-800 transition-colors line-clamp-2 whitespace-normal">
                    {sub.name}
                  </span>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 shrink-0 rounded-full border-2 border-slate-100 flex items-center justify-center group-hover:border-green-500 group-hover:bg-green-500 group-hover:text-white transition-all ml-2">
                    <CheckCircle size={16} className="sm:w-[20px] sm:h-[20px] text-slate-200 group-hover:text-white transition-colors" />
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={onClose} 
            className="w-full bg-slate-900 text-white p-5 sm:p-6 rounded-[25px] sm:rounded-[30px] font-black uppercase mt-4 sm:mt-6 hover:bg-green-600 transition-all shadow-2xl active:scale-95 tracking-[0.2em] shrink-0 min-h-[56px] mb-[max(env(safe-area-inset-bottom,10px),10px)] flex justify-center items-center gap-2"
          >
            Voltar ao Plano
          </button>
        </div>
      </div>
    </div>
  );
}