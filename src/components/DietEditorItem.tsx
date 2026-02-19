import { useState } from 'react';
import { Plus, Trash2, Calculator } from 'lucide-react';

interface Substitute {
  name: string;
}

interface Item {
  name: string;
  substitutes: Substitute[];
}

export default function DietEditorItem({ 
  item, 
  onUpdate 
}: { 
  item: Item; 
  onUpdate: (updatedItem: Item) => void 
}) {
  const [newSubName, setNewSubName] = useState('');

  // Adiciona um substituto manual ou calculado
  const addSubstitute = () => {
    if (!newSubName) return;
    const updatedSubstitutes = [...item.substitutes, { name: newSubName }];
    onUpdate({ ...item, substitutes: updatedSubstitutes });
    setNewSubName('');
  };

  const removeSubstitute = (index: number) => {
    const updatedSubstitutes = item.substitutes.filter((_, i) => i !== index);
    onUpdate({ ...item, substitutes: updatedSubstitutes });
  };

  return (
    <div className="p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 mb-4">
      {/* Alimento Principal */}
      <div className="flex gap-2 mb-3">
        <input 
          type="text"
          value={item.name}
          onChange={(e) => onUpdate({ ...item, name: e.target.value })}
          className="w-full p-2 rounded-xl border-2 border-black font-bold text-sm"
          placeholder="Ex: 100g de Frango Grelhado"
        />
      </div>

      {/* Lista de Substitutos definidos por você */}
      <div className="pl-6 space-y-2">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
          Substitutos que o aluno verá:
        </p>
        
        {item.substitutes.map((sub, idx) => (
          <div key={idx} className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-200">
            <span className="text-xs font-bold uppercase italic">{sub.name}</span>
            <button onClick={() => removeSubstitute(idx)} className="text-red-500 hover:text-red-700">
              <Trash2 size={14} />
            </button>
          </div>
        ))}

        {/* Campo para adicionar novo substituto */}
        <div className="flex gap-2 mt-2">
          <input 
            type="text"
            value={newSubName}
            onChange={(e) => setNewSubName(e.target.value)}
            className="flex-1 p-2 rounded-lg border border-slate-300 text-xs"
            placeholder="Novo substituto (ex: 5 un de Ovos)"
          />
          <button 
            onClick={addSubstitute}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-black transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}