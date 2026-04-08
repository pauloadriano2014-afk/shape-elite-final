import React from 'react';
import { X, ShoppingCart, CheckSquare, Square } from 'lucide-react';
import ShoppingPDFGenerator from '@/components/ShoppingPDFGenerator';

interface ShoppingListModalProps {
  isOpen: boolean;
  onClose: () => void;
  shoppingList: { [key: string]: any[] };
  checkedShoppingItems: string[];
  toggleShoppingItem: (name: string) => void;
  studentName: string;
}

export default function ShoppingListModal({ isOpen, onClose, shoppingList, checkedShoppingItems, toggleShoppingItem, studentName }: ShoppingListModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md" onClick={onClose} />
      
      <div className="bg-white w-full max-w-2xl max-h-[85dvh] rounded-[35px] sm:rounded-[40px] flex flex-col relative z-10 animate-in zoom-in-95 duration-300 shadow-2xl overflow-hidden">
        <div className="bg-slate-900 border-b-4 border-green-600 p-6 sm:p-8 text-white relative shrink-0">
           <button 
             onClick={onClose} 
             className="absolute top-4 sm:top-6 right-4 sm:right-6 bg-white/10 hover:bg-white/20 p-2 sm:p-3 rounded-full transition-colors text-white min-w-[44px] min-h-[44px] flex items-center justify-center z-20"
           >
             <X size={20} />
           </button>
           
           <div className="flex justify-between items-center mb-4 sm:mb-6 pr-12 relative z-10">
              <div className="w-14 h-14 bg-white/10 rounded-[20px] flex items-center justify-center backdrop-blur-md border border-white/5 shrink-0">
                 <ShoppingCart size={28} className="text-green-400" />
              </div>
              <div className="shrink-0">
                <ShoppingPDFGenerator studentName={studentName} shoppingList={shoppingList} />
              </div>
           </div>
           
           <h3 className="text-2xl sm:text-3xl font-black uppercase italic leading-none mb-1 tracking-tighter truncate">Minha lista de compras</h3>
           <p className="text-[9px] font-bold uppercase opacity-80 tracking-widest text-green-400 truncate">Calculado de todos os protocolos</p>
        </div>

        <div className="flex-1 overflow-y-auto p-5 sm:p-8 bg-slate-50 space-y-6 custom-scrollbar">
           {Object.keys(shoppingList).length === 0 ? (
               <div className="text-center py-20 opacity-40">
                   <ShoppingCart size={48} className="mx-auto mb-4" />
                   <p className="font-black uppercase text-xs tracking-[0.2em]">Sua lista está vazia</p>
               </div>
           ) : (
               Object.keys(shoppingList).map((category, cIdx) => (
                   <div key={cIdx} className="bg-white rounded-[25px] border border-slate-200 p-5 shadow-sm">
                       <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 mb-4 border-b border-slate-100 pb-2 flex items-center gap-2 truncate">
                           <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shrink-0"></div>
                           {category}
                       </h4>
                       <div className="grid grid-cols-1 gap-3">
                           {shoppingList[category].map((item: any, iIdx: number) => {
                               const isChecked = checkedShoppingItems.includes(item.name);
                               return (
                                   <button 
                                      key={iIdx} 
                                      onClick={() => toggleShoppingItem(item.name)} 
                                      className={`w-full flex justify-between items-center p-3 rounded-2xl border transition-all min-h-[44px] ${isChecked ? 'bg-slate-50 border-transparent opacity-50 grayscale' : 'bg-white border-slate-100 hover:border-green-400'}`}
                                   >
                                      <div className="flex items-center gap-3 text-left overflow-hidden">
                                          {isChecked ? <CheckSquare size={20} className="text-green-500 shrink-0" /> : <Square size={20} className="text-slate-300 shrink-0" />}
                                          <span className={`text-sm font-bold uppercase italic truncate ${isChecked ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                                              {item.name}
                                          </span>
                                      </div>
                                      <div className="bg-slate-100 px-3 py-1.5 rounded-[12px] shrink-0 text-right shadow-inner ml-2">
                                          <span className="font-black text-base text-slate-900 leading-none">{item.amount}</span>
                                          <span className="text-[9px] font-black uppercase ml-1 text-green-600">{item.unit}</span>
                                      </div>
                                   </button>
                               );
                           })}
                       </div>
                   </div>
               ))
           )}
        </div>

        <div className="p-5 bg-white border-t border-slate-100 shrink-0">
           <button 
             onClick={onClose} 
             className="w-full bg-slate-900 text-white p-5 rounded-[25px] font-black uppercase text-sm tracking-[0.2em] hover:bg-green-600 transition-all shadow-xl active:scale-95 flex justify-center items-center gap-2 min-h-[56px]"
           >
             Concluir Compra
           </button>
        </div>
      </div>
    </div>
  );
}