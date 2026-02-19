'use client'

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Plus, Trash2, Save, Clock, Flame, RotateCcw } from 'lucide-react';

export default function DietaAtualPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [meals, setMeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadDiet();
  }, [id]);

  async function loadDiet() {
    try {
      const res = await fetch(`/api/diet/latest?studentId=${id}`);
      if (res.ok) {
        const data = await res.json();
        // Garante que os itens virem string para edição fácil
        const formatted = (Array.isArray(data) ? data : []).map((m: any) => ({
          ...m,
          // Transforma array de itens em texto único separado por quebra de linha
          itemsText: Array.isArray(m.items) ? m.items.join('\n') : m.items
        }));
        setMeals(formatted);
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }

  // --- FUNÇÕES DE EDIÇÃO MANUAL ---
  
  const updateMeal = (index: number, field: string, value: string) => {
    const newMeals = [...meals];
    newMeals[index][field] = value;
    setMeals(newMeals);
    setHasChanges(true);
  };

  const addMeal = () => {
    setMeals([...meals, { 
      time: "00:00", 
      title: "Nova Refeição", 
      calories: "0", 
      itemsText: "Insira os alimentos aqui..." 
    }]);
    setHasChanges(true);
  };

  const removeMeal = (index: number) => {
    if (confirm("Tem certeza que quer remover essa refeição?")) {
      const newMeals = meals.filter((_, i) => i !== index);
      setMeals(newMeals);
      setHasChanges(true);
    }
  };

  const handleSave = async () => {
    try {
      // Reconverte o texto em array de itens antes de salvar
      const cleanMeals = meals.map(m => ({
        time: m.time,
        title: m.title,
        calories: m.calories,
        items: m.itemsText.split('\n').filter((i: string) => i.trim() !== '')
      }));

      const res = await fetch('/api/diet/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: id, meals: cleanMeals })
      });

      if (res.ok) {
        setHasChanges(false);
        alert("✅ DIETA SALVA E ATUALIZADA PARA O ALUNO!");
      } else {
        alert("Erro ao salvar.");
      }
    } catch (err) { alert("Erro de conexão."); }
  };

  if (loading) return <div className="p-10 text-center font-black animate-pulse">CARREGANDO...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6 text-black font-sans pb-40">
      <header className="mb-8 flex items-center justify-between sticky top-0 bg-slate-50 z-10 py-4">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="bg-white p-2 rounded-full border-2 border-black shadow-sm">
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-2xl font-black uppercase italic tracking-tighter text-blue-600 leading-none">
            Editor <span className="text-black">Pro</span>
          </h1>
        </div>
        
        {hasChanges && (
          <div className="bg-yellow-400 text-black px-4 py-1 rounded-full text-[10px] font-black uppercase animate-bounce">
            Alterações pendentes
          </div>
        )}
      </header>

      <main className="max-w-md mx-auto space-y-6">
        {meals.map((meal, index) => (
          <div key={index} className="bg-white p-4 rounded-[25px] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative group">
            
            {/* Botão de Excluir (Só aparece quando passa o mouse ou foca) */}
            <button 
              onClick={() => removeMeal(index)}
              className="absolute -top-3 -right-3 bg-red-500 text-white p-2 rounded-full shadow-md opacity-100 hover:scale-110 transition-all z-10"
              title="Excluir Refeição"
            >
              <Trash2 size={14} />
            </button>

            {/* Linha 1: Horário e Calorias */}
            <div className="flex gap-2 mb-2">
              <div className="flex items-center gap-1 bg-slate-100 px-3 py-2 rounded-xl flex-1 border border-slate-200">
                <Clock size={14} className="text-blue-600" />
                <input 
                  type="time" 
                  value={meal.time}
                  onChange={e => updateMeal(index, 'time', e.target.value)}
                  className="bg-transparent font-black text-xs outline-none w-full uppercase"
                />
              </div>
              <div className="flex items-center gap-1 bg-slate-100 px-3 py-2 rounded-xl w-24 border border-slate-200">
                <Flame size={14} className="text-orange-500" />
                <input 
                  type="number" 
                  value={String(meal.calories).replace(/[^0-9]/g, '')}
                  onChange={e => updateMeal(index, 'calories', e.target.value)}
                  className="bg-transparent font-black text-xs outline-none w-full text-right"
                  placeholder="0"
                />
                <span className="text-[8px] font-black opacity-50">kcal</span>
              </div>
            </div>

            {/* Linha 2: Título */}
            <input 
              type="text" 
              value={meal.title}
              onChange={e => updateMeal(index, 'title', e.target.value)}
              className="w-full font-black uppercase italic text-lg outline-none border-b-2 border-transparent focus:border-blue-600 mb-3 placeholder:opacity-30"
              placeholder="NOME DA REFEIÇÃO"
            />

            {/* Linha 3: Itens (Textarea Inteligente) */}
            <textarea 
              value={meal.itemsText}
              onChange={e => updateMeal(index, 'itemsText', e.target.value)}
              className="w-full text-sm font-bold text-slate-600 bg-slate-50 p-3 rounded-xl outline-none border-2 border-transparent focus:border-blue-600 resize-none h-24 leading-relaxed"
              placeholder="Digite os alimentos (um por linha)..."
            />
          </div>
        ))}

        {/* Botão Adicionar Refeição */}
        <button 
          onClick={addMeal}
          className="w-full py-4 border-2 border-dashed border-slate-300 rounded-[25px] text-slate-400 font-black uppercase flex items-center justify-center gap-2 hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50 transition-all"
        >
          <Plus size={20} /> Adicionar Refeição
        </button>
      </main>

      {/* Barra de Ação Flutuante */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-md px-6 flex gap-3">
        <button 
          onClick={() => router.push(`/dashboard-coach/aluno/${id}/gerar-dieta-ia`)}
          className="bg-white text-black border-2 border-black p-4 rounded-[20px] shadow-lg hover:bg-slate-50 active:scale-95 transition-all"
          title="Refazer com IA"
        >
          <RotateCcw size={24} />
        </button>
        
        <button 
          onClick={handleSave}
          disabled={!hasChanges}
          className={`flex-1 p-4 rounded-[20px] font-black uppercase text-sm flex items-center justify-center gap-3 shadow-[0px_10px_30px_rgba(0,0,0,0.2)] transition-all active:scale-95
            ${hasChanges ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-black text-white'}
          `}
        >
          <Save size={20} />
          {hasChanges ? 'Salvar Alterações' : 'Tudo Atualizado'}
        </button>
      </div>
    </div>
  );
}