'use client'

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft, Trash2, Calculator, Search, Plus, CheckCircle, X, FileText, Clock, Utensils, ChevronDown } from 'lucide-react';

export default function EditorProPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [meals, setMeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [activeMealIndex, setActiveMealIndex] = useState<number | null>(null);
  const [manualSubIndex, setManualSubIndex] = useState<{mIdx: number, iIdx: number} | null>(null);
  const [suggestions, setSuggestions] = useState<{[key: string]: any[]}>({});

  const categories = [
    { id: 'proteina', label: '🥩 Proteínas' },
    { id: 'carbo', label: '🍚 Carbos' },
    { id: 'fruta', label: '🍎 Frutas' },
    { id: 'laticinio', label: '🥛 Laticínios' },
    { id: 'queijo', label: '🧀 Queijos/Frios' },
    { id: 'suplemento', label: '💪 Suplementos' },
    { id: 'gordura', label: '🥑 Gorduras' },
    { id: 'bebida_zero', label: '🥤 Bebidas Zero' },
  ];
  
  const timeOptions = Array.from({ length: 38 }, (_, i) => {
      const h = Math.floor(i / 2) + 5; 
      const m = i % 2 === 0 ? "00" : "30";
      return `${String(h).padStart(2, '0')}:${m}`;
  });

  const mealTitles = [
      "Café da Manhã", "Lanche da Manhã", "Almoço", "Lanche da Tarde", 
      "Pré-Treino", "Pós-Treino", "Jantar", "Ceia"
  ];

  const unitConversions: {[key: string]: number} = {
      'g': 1, 'ml': 1, 'un': 1, 
      'fatia': 25, 'colher': 20, 'xicara': 150, 'scoop': 30
  };

  const [activeCategory, setActiveCategory] = useState('proteina');

  useEffect(() => {
    async function loadDiet() {
      const res = await fetch(`/api/diet/latest?studentId=${id}`);
      if (res.ok) {
        const data = await res.json();
        const normalizedMeals = data.map((meal: any) => ({
          ...meal,
          observations: meal.observations || "", 
          items: Array.isArray(meal.items) ? meal.items.map((item: any) => {
            const isObj = typeof item === 'object';
            const rawName = isObj ? (item.name || "") : item;
            const match = rawName.match(/^(\d+)\s*([a-zA-Z]+)?\s+(.*)$/);
            return { 
              amount: isObj && item.amount ? item.amount : (match ? match[1] : "100"),
              unit: isObj && item.unit ? item.unit : (match ? (match[2] || "g") : "g"),
              name: isObj && item.name_only ? item.name_only : (match ? match[3] : rawName),
              substitutes: Array.isArray(item.substitutes) ? item.substitutes : [] 
            };
          }) : []
        }));
        setMeals(normalizedMeals);
      }
      setLoading(false);
    }
    loadDiet();
  }, [id]);

  useEffect(() => {
    const query = searchTerm.length > 1 ? searchTerm : '';
    const url = query 
      ? `/api/diet/search?q=${query}` 
      : `/api/diet/search?category=${activeCategory}`;
    fetch(url).then(res => res.json()).then(data => setSearchResults(data));
  }, [searchTerm, activeCategory]);

  const addMeal = () => {
    setMeals([...meals, { title: "Nova Refeição", time: "08:00", items: [], observations: "" }]);
  };

  const addItemToMeal = (mealIndex: number, food: any) => {
    const newMeals = [...meals];
    const newItem = {
         amount: food.base_unit === 'un' ? "3" : "100", 
         unit: food.base_unit || "g",
         name: food.name,
         substitutes: []
    };

    if (manualSubIndex) {
       const { mIdx, iIdx } = manualSubIndex;
       newMeals[mIdx].items[iIdx].substitutes.push(newItem);
       setManualSubIndex(null);
    } else {
       newMeals[mealIndex].items.push(newItem);
       setActiveMealIndex(null);
    }
    setMeals(newMeals);
    setSearchTerm('');
  };

  const calculateSubs = async (mealIndex: number, itemIndex: number) => {
    const item = meals[mealIndex].items[itemIndex];
    let apiAmount = parseFloat(item.amount);
    if (unitConversions[item.unit]) {
        apiAmount = apiAmount * unitConversions[item.unit];
    }
    const queryText = `${apiAmount} g ${item.name}`; 
    const key = `${mealIndex}-${itemIndex}`;
    setSuggestions(prev => ({ ...prev, [key]: [] }));
    const res = await fetch(`/api/diet/substitutes?itemText=${encodeURIComponent(queryText)}`);
    if (res.ok) {
      const data = await res.json();
      setSuggestions(prev => ({ ...prev, [key]: data }));
    }
  };

  const approveSub = (mealIndex: number, itemIndex: number, sub: any) => {
    const newMeals = [...meals];
    const exists = newMeals[mealIndex].items[itemIndex].substitutes.find((s: any) => s.name === sub.name);
    if (!exists) {
      newMeals[mealIndex].items[itemIndex].substitutes.push(sub);
      setMeals(newMeals);
    }
    const key = `${mealIndex}-${itemIndex}`;
    setSuggestions(prev => ({ ...prev, [key]: prev[key].filter((s: any) => s.name !== sub.name) }));
  };

  const saveDiet = async () => {
    const dietToSave = meals.map(meal => ({
      ...meal,
      items: meal.items.map((item: any) => ({
        ...item,
        name: `${item.amount}${item.unit} ${item.name}`,
        substitutes: item.substitutes 
      }))
    }));
    await fetch('/api/diet/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId: id, content: dietToSave })
    });
    alert("✅ PROTOCOLO SALVO!");
    router.push(`/dashboard-coach/aluno/${id}`);
  };

  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center font-black animate-pulse">CARREGANDO...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans pb-32 text-black">
      <header className="max-w-3xl mx-auto mb-10 flex justify-between items-center">
        <button onClick={() => router.back()} className="p-3 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all"><ArrowLeft size={20} /></button>
        <h1 className="text-2xl font-black uppercase italic tracking-tighter text-slate-800">Editor <span className="text-blue-600">MASTER V5</span></h1>
        <div className="w-10" />
      </header>

      <main className="max-w-3xl mx-auto space-y-8">
        {meals.map((meal, mIdx) => (
          <div key={mIdx} className="bg-white rounded-[30px] border border-slate-200 p-8 shadow-xl shadow-slate-200/50 relative group/card transition-all hover:shadow-2xl hover:shadow-blue-900/5">
            <button onClick={() => setMeals(meals.filter((_, i) => i !== mIdx))} className="absolute top-6 right-6 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>

            {/* HEADER MODERNO: HORA E TÍTULO */}
            <div className="flex items-center gap-4 mb-6">
               <div className="relative group">
                 <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                   <Clock size={16} className="text-blue-600" />
                 </div>
                 <select 
                   className="pl-10 pr-8 py-3 bg-blue-50/50 rounded-2xl font-black text-sm text-blue-900 appearance-none outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
                   value={meal.time}
                   onChange={(e) => { const n = [...meals]; n[mIdx].time = e.target.value; setMeals(n); }}
                 >
                   {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                 </select>
                 <ChevronDown size={14} className="absolute right-3 top-4 text-blue-400 pointer-events-none" />
               </div>
               
               <div className="flex-1 relative">
                 <input 
                   list={`titles-${mIdx}`} 
                   className="w-full text-xl font-black uppercase italic text-slate-800 outline-none bg-transparent placeholder-slate-300 border-b-2 border-transparent focus:border-blue-500 transition-all pb-1"
                   value={meal.title}
                   placeholder="NOME DA REFEIÇÃO"
                   onChange={(e) => { const n = [...meals]; n[mIdx].title = e.target.value; setMeals(n); }}
                 />
                 <datalist id={`titles-${mIdx}`}>
                    {mealTitles.map(t => <option key={t} value={t} />)}
                 </datalist>
               </div>
            </div>

            {/* OBSERVAÇÕES ELEGANTES */}
            <div className="mb-8">
               <div className="relative">
                  <FileText size={16} className="absolute top-3 left-3 text-yellow-500" />
                  <textarea 
                    placeholder="Adicionar observações ou modo de preparo..."
                    className="w-full pl-10 pr-4 py-3 bg-yellow-50/30 rounded-2xl text-sm font-medium text-slate-600 outline-none resize-none focus:bg-yellow-50 focus:ring-2 focus:ring-yellow-500/20 transition-all min-h-[50px]"
                    rows={meal.observations ? 2 : 1}
                    value={meal.observations}
                    onChange={(e) => { const n = [...meals]; n[mIdx].observations = e.target.value; setMeals(n); }}
                  />
               </div>
            </div>

            <div className="space-y-4">
              {meal.items.map((item: any, iIdx: number) => {
                const suggestionKey = `${mIdx}-${iIdx}`;
                const itemSuggestions = suggestions[suggestionKey] || [];

                return (
                  <div key={iIdx} className="p-1 rounded-3xl transition-all hover:bg-slate-50/50">
                    <div className="flex items-center gap-4 bg-white border border-slate-100 p-4 rounded-2xl shadow-sm relative group/item">
                      
                      {/* INPUT DE QUANTIDADE E UNIDADE (COMBO VISUAL) */}
                      <div className="flex items-center bg-slate-100 rounded-xl px-2 py-1 h-12">
                        <input 
                          className="w-12 bg-transparent text-center font-black text-lg text-slate-800 outline-none" 
                          value={item.amount} 
                          onChange={(e) => { const n = [...meals]; n[mIdx].items[iIdx].amount = e.target.value; setMeals(n); }} 
                        />
                        <div className="h-6 w-[1px] bg-slate-300 mx-1"></div>
                        <select 
                           className="bg-transparent text-[10px] font-black uppercase text-slate-500 outline-none appearance-none cursor-pointer w-14 text-center"
                           value={item.unit}
                           onChange={(e) => { const n = [...meals]; n[mIdx].items[iIdx].unit = e.target.value; setMeals(n); }}
                        >
                           <option value="g">G</option>
                           <option value="ml">ML</option>
                           <option value="un">UN</option>
                           <option value="fatia">FATIA</option>
                           <option value="colher">COLHER</option>
                           <option value="scoop">SCOOP</option>
                           <option value="xicara">XÍC</option>
                        </select>
                      </div>
                      
                      <span className="flex-1 font-bold text-sm text-slate-700 uppercase tracking-wide">{item.name}</span>
                      
                      {/* BOTÕES DE AÇÃO FLUTUANTES NO HOVER */}
                      <div className="flex gap-2 opacity-100 sm:opacity-0 sm:group-hover/item:opacity-100 transition-opacity">
                        <button onClick={() => calculateSubs(mIdx, iIdx)} className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all active:scale-95"><Calculator size={18} /></button>
                        <button onClick={() => { const n = [...meals]; n[mIdx].items.splice(iIdx, 1); setMeals(n); }} className="p-2.5 bg-white border border-slate-200 text-slate-400 rounded-xl hover:text-red-500 hover:border-red-200 transition-all"><Trash2 size={18} /></button>
                      </div>
                    </div>

                    {/* SUGESTÕES (AZUL) */}
                    {itemSuggestions.length > 0 && (
                      <div className="mt-3 ml-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-100 animate-in slide-in-from-top-2">
                        <p className="text-[10px] font-black uppercase text-blue-400 mb-3 tracking-wider">Sugestões de troca:</p>
                        <div className="flex flex-wrap gap-2">
                          {itemSuggestions.map((sub: any, sIdx: number) => (
                            <button key={sIdx} onClick={() => approveSub(mIdx, iIdx, sub)} className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl shadow-sm border border-blue-100 hover:border-blue-500 hover:text-blue-600 transition-all group/sub">
                              <Plus size={14} className="text-blue-300 group-hover/sub:text-blue-600" /> 
                              <span className="text-[10px] font-bold uppercase text-slate-600 group-hover/sub:text-blue-900">{sub.amount}{sub.unit} {sub.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* SUBSTITUTOS APROVADOS (VERDE) */}
                    {item.substitutes?.length > 0 && (
                      <div className="mt-3 ml-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {item.substitutes.map((sub: any, sIdx: number) => (
                          <div key={sIdx} className="flex items-center gap-3 bg-green-50/50 border border-green-100 p-2 pl-3 rounded-xl group/active">
                            <div className="flex items-center gap-1">
                               <input className="w-8 bg-transparent font-black text-xs text-green-700 text-center outline-none border-b border-green-200 focus:border-green-500" value={sub.amount} onChange={(e) => { const n = [...meals]; n[mIdx].items[iIdx].substitutes[sIdx].amount = e.target.value; setMeals(n); }} />
                               <span className="text-[9px] font-black uppercase text-green-400">{sub.unit}</span>
                            </div>
                            <span className="text-[10px] font-bold uppercase text-green-800 flex-1 truncate">{sub.name}</span>
                            <button onClick={() => { const n = [...meals]; n[mIdx].items[iIdx].substitutes.splice(sIdx, 1); setMeals(n); }} className="p-1.5 text-green-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover/active:opacity-100"><X size={14} /></button>
                          </div>
                        ))}
                      </div>
                    )}

                    <button onClick={() => { setManualSubIndex({ mIdx, iIdx }); setActiveMealIndex(mIdx); }} className="w-full text-center mt-2 text-[10px] font-bold text-slate-300 uppercase hover:text-blue-500 transition-colors py-1">+ Adicionar Substituto Manual</button>
                  </div>
                );
              })}
              
              {activeMealIndex === mIdx ? null : (
                 <button onClick={() => setActiveMealIndex(mIdx)} className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold uppercase text-xs hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/30 transition-all flex items-center justify-center gap-2 group/add">
                    <div className="p-1 bg-slate-200 rounded-full text-white group-hover/add:bg-blue-500 transition-colors"><Plus size={14} /></div>
                    Adicionar Alimento
                 </button>
              )}
            </div>
          </div>
        ))}
        
        <button onClick={addMeal} className="w-full py-8 bg-white border border-slate-200 rounded-[30px] shadow-sm text-slate-400 font-black uppercase tracking-widest hover:shadow-lg hover:border-blue-200 hover:text-blue-600 transition-all flex items-center justify-center gap-3">
            <Plus size={24} /> Nova Refeição
        </button>
      </main>

      {/* MODAL DE BUSCA MANTIDO E OTIMIZADO VISUALMENTE */}
      {(activeMealIndex !== null) && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4">
          <div className="bg-white w-full max-w-2xl h-[85vh] sm:h-[600px] rounded-t-[35px] sm:rounded-[35px] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white z-10">
              <h2 className="text-lg font-black uppercase italic text-slate-800">{manualSubIndex ? "Trocar por..." : "O que vamos comer?"}</h2>
              <button onClick={() => {setActiveMealIndex(null); setManualSubIndex(null);}} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 text-slate-500"><X size={20}/></button>
            </div>
            
            <div className="bg-slate-50/50 p-2">
                <div className="flex gap-2 p-2 overflow-x-auto no-scrollbar">
                {categories.map(cat => (
                    <button key={cat.id} onClick={() => { setActiveCategory(cat.id); setSearchTerm(''); }} className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase whitespace-nowrap transition-all border ${activeCategory === cat.id ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-white border-slate-200 text-slate-500 hover:border-blue-300'}`}>{cat.label}</button>
                ))}
                </div>
            </div>

            <div className="p-4 bg-white">
               <div className="flex items-center gap-3 bg-slate-100 p-4 rounded-2xl focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                  <Search className="text-slate-400" size={20}/>
                  <input autoFocus placeholder={`Buscar em ${categories.find(c => c.id === activeCategory)?.label}...`} className="flex-1 bg-transparent outline-none font-bold text-sm uppercase text-slate-700 placeholder-slate-400" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
               </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-50/30">
               {searchResults.map((food: any, idx) => (
                 <button key={idx} onClick={() => addItemToMeal(activeMealIndex, food)} className="w-full text-left p-4 bg-white border border-slate-100 hover:border-blue-500 hover:shadow-md rounded-2xl transition-all group">
                   <div className="flex justify-between items-center">
                       <span className="font-bold text-xs uppercase text-slate-700 group-hover:text-blue-700">{food.name}</span>
                       <span className="text-[9px] font-black bg-slate-100 text-slate-400 px-2 py-1 rounded-lg uppercase">{food.category?.replace('_', ' ') || 'GERAL'}</span>
                   </div>
                 </button>
               ))}
               {searchResults.length === 0 && <div className="flex flex-col items-center justify-center h-40 text-slate-300"><Search size={40} className="mb-2 opacity-20" /><span className="font-black uppercase italic text-xs">Nada encontrado</span></div>}
            </div>
          </div>
        </div>
      )}

      <footer className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-xl border-t border-slate-200 z-40">
        <button onClick={saveDiet} className="max-w-3xl mx-auto w-full bg-blue-600 text-white py-5 rounded-[20px] font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 hover:bg-slate-900 hover:shadow-slate-900/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3"><Save size={20} /> Salvar Alterações</button>
      </footer>
    </div>
  );
}