import { useState } from 'react';
import { Utensils, X, ArrowRightLeft } from 'lucide-react';

interface Substitute {
  name: string;
}

interface Item {
  name: string;
  substitutes?: Substitute[];
}

interface MealProps {
  title: string;
  time: string;
  items: Item[];
  calories: string | number;
}

export default function MealCard({ title, time, items, calories }: MealProps) {
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  return (
    <div className="bg-white p-6 rounded-[35px] border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] mb-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-[10px] font-black bg-blue-600 text-white px-3 py-1 rounded-full uppercase tracking-widest">
            {time}
          </span>
          <h3 className="text-lg font-black uppercase italic tracking-tighter mt-2 leading-none text-black">
            {title}
          </h3>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Energia</p>
          <p className="text-sm font-black text-black">{calories} kcal</p>
        </div>
      </div>

      <div className="space-y-3 border-t-2 border-slate-100 pt-4">
        {items.map((item, idx) => (
          <div key={idx} className="flex flex-col gap-1">
            <div className="flex items-center justify-between group">
              <div className="flex items-center gap-3 text-xs font-bold text-slate-700">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                <span className="text-black uppercase italic">{item.name}</span>
              </div>
              
              {/* Botão Seletor: Só aparece se o Coach Paulo Adriano definiu substitutos */}
              {item.substitutes && item.substitutes.length > 0 && (
                <button 
                  onClick={() => setSelectedItem(item)}
                  className="flex items-center gap-1 text-[9px] font-black bg-slate-100 hover:bg-black hover:text-white transition-colors px-2 py-1 rounded-lg uppercase"
                >
                  <ArrowRightLeft size={10} />
                  Trocar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Substitutos Controlados pelo Coach */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[35px] border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center mb-6">
              <div>
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Substitutos para</p>
                <h4 className="text-lg font-black uppercase italic leading-none">{selectedItem.name}</h4>
              </div>
              <button 
                onClick={() => setSelectedItem(null)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={20} className="text-black" />
              </button>
            </div>

            <div className="space-y-3">
              {selectedItem.substitutes?.map((sub, sIdx) => (
                <div 
                  key={sIdx}
                  className="p-4 rounded-2xl border-2 border-black bg-slate-50 flex items-center justify-between"
                >
                  <span className="font-bold text-sm uppercase italic">{sub.name}</span>
                  <div className="bg-green-500 text-white p-1 rounded-full">
                    <Utensils size={14} />
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={() => setSelectedItem(null)}
              className="w-full mt-6 py-4 bg-black text-white font-black uppercase italic rounded-2xl hover:bg-blue-600 transition-colors shadow-[4px_4px_0px_0px_rgba(37,99,235,1)]"
            >
              Fechar Lista
            </button>
          </div>
        </div>
      )}
    </div>
  );
}