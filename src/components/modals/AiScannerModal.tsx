import React from 'react';
import { X, Sparkles, Loader2, CheckCircle } from 'lucide-react';

interface AiScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  photoPreview: string | null;
  isAnalyzing: boolean;
  aiFeedback: string | null;
  analyzeImage: () => void;
}

export default function AiScannerModal({ isOpen, onClose, photoPreview, isAnalyzing, aiFeedback, analyzeImage }: AiScannerModalProps) {
  if (!isOpen || !photoPreview) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-xl" onClick={() => !isAnalyzing && onClose()} />
      
      <div className="bg-white w-full max-w-lg rounded-[40px] sm:rounded-[50px] overflow-hidden relative z-10 shadow-[0_0_100px_rgba(22,163,74,0.2)] animate-in zoom-in-95 duration-500 flex flex-col max-h-[90dvh]">
        <div className="p-5 sm:p-6 bg-slate-50 flex justify-between items-center border-b border-slate-200 shrink-0">
            <div className="flex items-center gap-2 sm:gap-3 text-green-600">
                <Sparkles size={20} className="sm:w-[24px] sm:h-[24px] animate-pulse" />
                <h3 className="font-black uppercase italic text-xs sm:text-sm tracking-widest">IA Shape Natural</h3>
            </div>
            {!isAnalyzing && (
                <button 
                  onClick={onClose} 
                  className="p-2 sm:p-3 text-slate-400 hover:text-red-500 rounded-full bg-white shadow-md border border-slate-100 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                  <X size={18} className="sm:w-[20px] sm:h-[20px]"/>
                </button>
            )}
        </div>

        <div className="p-5 sm:p-8 overflow-y-auto custom-scrollbar">
            <div className="w-full h-48 sm:h-64 bg-slate-200 rounded-[25px] sm:rounded-[35px] overflow-hidden mb-6 sm:mb-8 border-4 border-white shadow-2xl relative group shrink-0">
                <img src={photoPreview} alt="Sua refeição" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
            </div>

            {!aiFeedback ? (
                <button 
                   onClick={analyzeImage} 
                   disabled={isAnalyzing} 
                   className="w-full bg-slate-900 text-white p-5 sm:p-6 rounded-[25px] sm:rounded-[30px] font-black uppercase text-xs sm:text-sm tracking-[0.2em] hover:bg-green-600 transition-all shadow-xl shadow-green-600/30 flex justify-center items-center gap-3 sm:gap-4 disabled:opacity-70 disabled:cursor-not-allowed min-h-[56px]"
                >
                   {isAnalyzing ? (
                       <><Loader2 size={20} className="sm:w-[24px] sm:h-[24px] animate-spin text-green-400" /> Escaneando Macros...</>
                   ) : (
                       <><Sparkles size={20} className="sm:w-[24px] sm:h-[24px] text-green-400" /> Validar Refeição</>
                   )}
                </button>
            ) : (
                <div className="bg-green-50/50 border-2 border-green-100 p-5 sm:p-7 rounded-[25px] sm:rounded-[35px] animate-in fade-in duration-500">
                    <div className="flex items-center gap-2 mb-3 sm:mb-4">
                        <CheckCircle size={16} className="sm:w-[18px] sm:h-[18px] text-green-500" />
                        <p className="text-[10px] sm:text-[11px] font-black text-green-700 uppercase tracking-widest">Feedback do Coach Virtual:</p>
                    </div>
                    <p className="text-sm sm:text-base font-semibold text-slate-800 whitespace-pre-line leading-relaxed italic">
                        "{aiFeedback}"
                    </p>
                    <button 
                        onClick={onClose} 
                        className="w-full mt-6 sm:mt-8 bg-slate-900 text-white p-4 rounded-2xl font-black uppercase text-[10px] sm:text-xs tracking-widest hover:bg-green-600 transition-all shadow-lg min-h-[48px]"
                    >
                        Fechar Análise
                    </button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}