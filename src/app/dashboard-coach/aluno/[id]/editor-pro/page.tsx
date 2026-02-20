'use client'

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft, Trash2, Calculator, Search, Plus, CheckCircle, X, FileText, Clock, Utensils, ChevronDown, Copy } from 'lucide-react';

export default function EditorProPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  
  // NOVO: Estado de Protocolos (Substitui o estado simples de 'meals')
  const [protocols, setProtocols] = useState<any[]>([{ 
      id: 'default', 
      name: 'Protocolo Base', 
      activeDays: [0, 1, 2, 3, 4, 5, 6], // 0 = Domingo, 1 = Segunda...
      meals: [] 
  }]);
  const [activeProtocolIndex, setActiveProtocolIndex] = useState(0);

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [activeMealIndex, setActiveMealIndex] = useState<number | null>(null);
  const [manualSubIndex, setManualSubIndex] = useState<{mIdx: number, iIdx: number} | null>(null);
  const [suggestions, setSuggestions] = useState<{[key: string]: any[]}>({});

  // ESTADOS DO MODAL DE TEMPLATE
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateName, setTemplateName] = useState('');

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

  const weekDays = [
      { idx: 0, label: 'Dom' }, { idx: 1, label: 'Seg' }, { idx: 2, label: 'Ter' },
      { idx: 3, label: 'Qua' }, { idx: 4, label: 'Qui' }, { idx: 5, label: 'Sex' }, { idx: 6, label: 'Sáb' }
  ];

  const unitConversions: {[key: string]: number} = {
      'g': 1, 'ml': 1, 'un': 1, 
      'fatia': 25, 'colher': 20, 'xicara': 150, 'scoop': 30
  };

  const [activeCategory, setActiveCategory] = useState('proteina');

  // Helper para normalizar as refeições, seja de dados novos ou antigos
  const normalizeMeals = (mealsArray: any[]) => {
      return mealsArray.map((meal: any) => ({
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
  };

  useEffect(() => {
    async function loadDiet() {
      const res = await fetch(`/api/diet/latest?studentId=${id}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
            // Verifica se é o formato NOVO (Array de Protocolos) ou ANTIGO (Array de Refeições)
            if (!data[0].meals) {
                // Formato antigo: Converte as refeições para dentro de um "Protocolo Base"
                setProtocols([{ 
                    id: 'default', name: 'Protocolo Base', activeDays: [0, 1, 2, 3, 4, 5, 6], 
                    meals: normalizeMeals(data) 
                }]);
            } else {
                // Formato Novo: Carrega os protocolos e normaliza as refeições de cada um
                setProtocols(data.map((p: any) => ({
                    ...p,
                    meals: normalizeMeals(p.meals)
                })));
            }
        }
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

  // --- FUNÇÕES DE GERENCIAMENTO DE PROTOCOLOS ---
  const addProtocol = () => {
      setProtocols([...protocols, { 
          id: Date.now().toString(), 
          name: `Protocolo ${protocols.length + 1}`, 
          activeDays: [], 
          meals: [] 
      }]);
      setActiveProtocolIndex(protocols.length);
  };

  const toggleDay = (dayIndex: number) => {
      const n = [...protocols];
      const days = n[activeProtocolIndex].activeDays;
      if (days.includes(dayIndex)) {
          n[activeProtocolIndex].activeDays = days.filter((d: number) => d !== dayIndex);
      } else {
          n[activeProtocolIndex].activeDays.push(dayIndex);
      }
      setProtocols(n);
  };

  // --- FUNÇÕES DE REFEIÇÕES (Agora atuam no Protocolo Ativo) ---
  const addMeal = () => {
    const n = [...protocols];
    n[activeProtocolIndex].meals.push({ title: "Nova Refeição", time: "08:00", items: [], observations: "" });
    setProtocols(n);
  };

  const addItemToMeal = (mealIndex: number, food: any) => {
    const n = [...protocols];
    const newItem = {
         amount: food.base_unit === 'un' ? "3" : "100", 
         unit: food.base_unit || "g",
         name: food.name,
         substitutes: []
    };

    if (manualSubIndex) {
       const { mIdx, iIdx } = manualSubIndex;
       n[activeProtocolIndex].meals[mIdx].items[iIdx].substitutes.push(newItem);
       setManualSubIndex(null);
    } else {
       n[activeProtocolIndex].meals[mealIndex].items.push(newItem);
       setActiveMealIndex(null);
    }
    setProtocols(n);
    setSearchTerm('');
  };

  const calculateSubs = async (mealIndex: number, itemIndex: number) => {
    const item = protocols[activeProtocolIndex].meals[mealIndex].items[itemIndex];
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
    const n = [...protocols];
    const exists = n[activeProtocolIndex].meals[mealIndex].items[itemIndex].substitutes.find((s: any) => s.name === sub.name);
    if (!exists) {
      n[activeProtocolIndex].meals[mealIndex].items[itemIndex].substitutes.push(sub);
      setProtocols(n);
    }
    const key = `${mealIndex}-${itemIndex}`;
    setSuggestions(prev => ({ ...prev, [key]: prev[key].filter((s: any) => s.name !== sub.name) }));
  };

  const saveDiet = async () => {
    // Formata o array mestre de protocolos para salvar
    const dietToSave = protocols.map(p => ({
      ...p,
      meals: p.meals.map((meal: any) => ({
        ...meal,
        items: meal.items.map((item: any) => ({
          ...item,
          name: `${item.amount}${item.unit} ${item.name}`,
          substitutes: item.substitutes 
        }))
      }))
    }));

    await fetch('/api/diet/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId: id, content: dietToSave })
    });
    alert("✅ PROTOCOLO SALVO NO APP DO ALUNO!");
    router.push(`/dashboard-coach/aluno/${id}`);
  };

  const handleSaveTemplate = async () => {
    if(!templateName.trim()) {
      alert("Dê um nome para o template.");
      return;
    }
    try {
      // Prepara os dados exatamente no mesmo formato que vai pro app do aluno
      const contentToSave = protocols.map(p => ({
        ...p,
        meals: p.meals.map((meal: any) => ({
          ...meal,
          items: meal.items.map((item: any) => ({
            ...item,
            name: `${item.amount}${item.unit} ${item.name}`,
            substitutes: item.substitutes 
          }))
        }))
      }));

      const res = await fetch('/api/diet/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: templateName, content: contentToSave })
      });
      
      if(res.ok) {
        alert("✅ Template Salvo na sua Biblioteca Elite!");
        setShowTemplateModal(false);
        setTemplateName('');
      } else {
        alert("Erro ao salvar template.");
      }
    } catch (err) {
      alert("Erro de conexão ao salvar template.");
      setShowTemplateModal(false);
    }
  };

  if (loading) return (
    <div className="min-h-[100dvh] bg-slate-900 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Luz de fundo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[20rem] h-[20rem] bg-green-600 rounded-full blur-[120px] opacity-20 pointer-events-none"></div>
      
      {/* Logo Pulsando */}
      <div className="w-32 h-32 sm:w-40 sm:h-40 relative animate-[pulse_2s_ease-in-out_infinite] mb-6">
        <img src="/logo.png" alt="Carregando..." className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(22,163,74,0.4)]" />
      </div>
      
      <p className="font-black uppercase tracking-[0.4em] text-green-500 italic text-xs sm:text-sm relative z-10">Sincronizando Elite...</p>
    </div>
  );

  return (
    <div className="min-h-[100dvh] bg-slate-50 p-4 sm:p-6 font-sans pb-[env(safe-area-inset-bottom,120px)] text-black">
      
      {/* HEADER FIXO COM BOTÃO DE TEMPLATE */}
      <header className="max-w-4xl mx-auto mb-6 sm:mb-8 flex items-center justify-between sticky top-0 bg-slate-50/90 backdrop-blur-md z-30 py-4 border-b border-slate-200">
        <div className="flex items-center gap-3 sm:gap-4">
          <button onClick={() => router.back()} className="p-3 bg-white border border-slate-200 rounded-[14px] sm:rounded-[20px] shadow-sm hover:border-green-400 hover:text-green-600 transition-all flex items-center gap-2">
            <ArrowLeft size={20} /> <span className="hidden sm:inline text-[11px] font-black uppercase tracking-widest">Voltar</span>
          </button>
          <h1 className="text-xl sm:text-2xl font-black uppercase italic tracking-tighter text-slate-800 leading-none">
            Editor <span className="text-green-600">MASTER</span>
          </h1>
        </div>

        {/* Botões de Salvar Template */}
        <button 
          onClick={() => setShowTemplateModal(true)}
          className="hidden sm:flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-[16px] text-[10px] font-black uppercase tracking-widest hover:bg-green-600 transition-all shadow-sm shrink-0"
        >
          <Copy size={14} className="text-green-400" /> Salvar Template
        </button>
        <button 
          onClick={() => setShowTemplateModal(true)}
          className="sm:hidden bg-slate-900 text-white p-2.5 rounded-[14px] hover:bg-green-600 transition-all shadow-sm shrink-0"
        >
          <Copy size={18} className="text-green-400" />
        </button>
      </header>

      <main className="max-w-4xl mx-auto space-y-6">
        
        {/* --- ABAS DE PROTOCOLOS --- */}
        <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
            {protocols.map((p, idx) => (
               <button 
                  key={p.id} 
                  onClick={() => setActiveProtocolIndex(idx)}
                  className={`px-5 sm:px-6 py-3 sm:py-3.5 rounded-[16px] sm:rounded-2xl font-black uppercase text-[10px] sm:text-xs whitespace-nowrap transition-all shadow-sm
                    ${activeProtocolIndex === idx 
                      ? 'bg-slate-900 text-white border border-slate-900' 
                      : 'bg-white text-slate-400 border border-slate-200 hover:border-green-400 hover:text-green-600'
                    }
                  `}
               >
                  {p.name}
               </button>
            ))}
            <button onClick={addProtocol} className="px-5 py-3 bg-green-50 text-green-600 border border-green-200 rounded-[16px] sm:rounded-2xl font-black uppercase text-[10px] sm:text-xs whitespace-nowrap hover:bg-green-600 hover:text-white transition-all flex items-center gap-2 shrink-0">
               <Plus size={14} className="sm:w-4 sm:h-4"/> Adicionar Ciclo
            </button>
        </div>

        {/* --- CONFIGURAÇÃO DO PROTOCOLO ATIVO --- */}
        <div className="bg-white p-5 sm:p-8 rounded-[35px] border border-slate-100 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.1)] relative animate-in fade-in slide-in-from-bottom-2 overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-900"></div>
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <input 
                   className="text-2xl sm:text-3xl font-black uppercase italic text-slate-800 outline-none bg-transparent border-b-2 border-transparent focus:border-green-500 w-full transition-colors pb-1 placeholder:text-slate-300"
                   value={protocols[activeProtocolIndex].name}
                   onChange={(e) => { const n = [...protocols]; n[activeProtocolIndex].name = e.target.value; setProtocols(n); }}
                   placeholder="NOME DO PROTOCOLO (Ex: Dia de Treino)"
                />
                {protocols.length > 1 && (
                   <button onClick={() => { const n = [...protocols]; n.splice(activeProtocolIndex, 1); setProtocols(n); setActiveProtocolIndex(0); }} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-colors shrink-0">
                     <Trash2 size={20}/>
                   </button>
                )}
            </div>
            
            <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 sm:mb-4">Dias da Semana Ativos:</p>
            <div className="flex gap-2 flex-wrap">
                {weekDays.map(day => {
                   const isActive = protocols[activeProtocolIndex].activeDays.includes(day.idx);
                   return (
                      <button 
                         key={day.idx} 
                         onClick={() => toggleDay(day.idx)}
                         className={`w-12 h-12 sm:w-14 sm:h-14 rounded-[16px] sm:rounded-[20px] font-black text-xs sm:text-sm transition-all flex items-center justify-center border
                           ${isActive 
                             ? 'bg-green-600 border-green-600 text-white shadow-[0_5px_15px_rgba(22,163,74,0.3)] scale-105' 
                             : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-white hover:border-green-400 hover:text-green-600'
                           }
                         `}
                      >
                         {day.label}
                      </button>
                   );
                })}
            </div>
        </div>

        {/* --- REFEIÇÕES DO PROTOCOLO ATIVO --- */}
        <div className="space-y-6 sm:space-y-8 mt-8">
            {protocols[activeProtocolIndex].meals.map((meal: any, mIdx: number) => (
              <div key={mIdx} className="bg-white rounded-[35px] border border-slate-100 p-5 sm:p-8 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.1)] relative group/card transition-all hover:border-green-200">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-green-500 rounded-l-[35px]"></div>
                
                <button onClick={() => { const n = [...protocols]; n[activeProtocolIndex].meals.splice(mIdx, 1); setProtocols(n); }} className="absolute top-5 right-5 text-slate-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-xl transition-colors"><Trash2 size={18} /></button>

                {/* HEADER MODERNO: HORA E TÍTULO */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-6 pr-10">
                   <div className="relative group shrink-0">
                     <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                       <Clock size={16} className="text-green-600" />
                     </div>
                     <select 
                       className="pl-10 pr-8 py-3 bg-slate-50 border border-slate-200 rounded-[16px] font-black text-sm text-slate-800 appearance-none outline-none focus:border-green-500 focus:bg-white transition-all cursor-pointer"
                       value={meal.time}
                       onChange={(e) => { const n = [...protocols]; n[activeProtocolIndex].meals[mIdx].time = e.target.value; setProtocols(n); }}
                     >
                       {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                     </select>
                     <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                   </div>
                   
                   <div className="flex-1 w-full relative">
                     <input 
                       list={`titles-${mIdx}`} 
                       className="w-full text-xl sm:text-2xl font-black uppercase italic text-slate-800 outline-none bg-transparent placeholder-slate-300 border-b-2 border-transparent focus:border-green-500 transition-all pb-1"
                       value={meal.title}
                       placeholder="NOME DA REFEIÇÃO"
                       onChange={(e) => { const n = [...protocols]; n[activeProtocolIndex].meals[mIdx].title = e.target.value; setProtocols(n); }}
                     />
                     <datalist id={`titles-${mIdx}`}>
                        {mealTitles.map(t => <option key={t} value={t} />)}
                     </datalist>
                   </div>
                </div>

                {/* OBSERVAÇÕES ELEGANTES */}
                <div className="mb-6 sm:mb-8 pl-1 sm:pl-2">
                   <div className="relative">
                      <FileText size={16} className="absolute top-4 left-4 text-amber-500" />
                      <textarea 
                        placeholder="Adicionar observações, modo de preparo ou instruções..."
                        className="w-full pl-12 pr-4 py-3.5 bg-amber-50/50 border border-amber-100/50 rounded-[20px] text-sm font-bold text-slate-700 outline-none resize-none focus:bg-white focus:border-amber-300 transition-all min-h-[50px] placeholder:text-amber-500/50"
                        rows={meal.observations ? 2 : 1}
                        value={meal.observations}
                        onChange={(e) => { const n = [...protocols]; n[activeProtocolIndex].meals[mIdx].observations = e.target.value; setProtocols(n); }}
                      />
                   </div>
                </div>

                {/* LISTA DE ALIMENTOS */}
                <div className="space-y-3 pl-1 sm:pl-2">
                  {meal.items.map((item: any, iIdx: number) => {
                    const suggestionKey = `${mIdx}-${iIdx}`;
                    const itemSuggestions = suggestions[suggestionKey] || [];

                    return (
                      <div key={iIdx} className="rounded-[25px] transition-all bg-slate-50 border border-slate-100 hover:border-green-200">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 relative group/item">
                          
                          {/* INPUT DE QUANTIDADE E UNIDADE */}
                          <div className="flex items-center bg-white border border-slate-200 rounded-[14px] px-2 py-1.5 h-12 w-full sm:w-auto shrink-0 shadow-sm focus-within:border-green-500 transition-colors">
                            <input 
                              type="number"
                              className="w-16 sm:w-14 bg-transparent text-center font-black text-lg text-slate-800 outline-none hide-arrows" 
                              value={item.amount} 
                              onChange={(e) => { const n = [...protocols]; n[activeProtocolIndex].meals[mIdx].items[iIdx].amount = e.target.value; setProtocols(n); }} 
                            />
                            <div className="h-6 w-[1px] bg-slate-200 mx-1"></div>
                            <select 
                               className="bg-transparent text-[10px] font-black uppercase text-slate-500 outline-none appearance-none cursor-pointer w-16 text-center"
                               value={item.unit}
                               onChange={(e) => { const n = [...protocols]; n[activeProtocolIndex].meals[mIdx].items[iIdx].unit = e.target.value; setProtocols(n); }}
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
                          
                          <div className="flex-1 w-full flex items-center justify-between">
                            <span className="font-bold text-sm sm:text-base text-slate-800 uppercase tracking-wide truncate pr-2">{item.name}</span>
                            
                            <div className="flex gap-2 shrink-0">
                              <button onClick={() => calculateSubs(mIdx, iIdx)} className="p-2.5 bg-slate-900 text-white rounded-[12px] hover:bg-green-600 hover:shadow-[0_5px_15px_rgba(22,163,74,0.3)] transition-all active:scale-95" title="Calcular Substitutos Automáticos"><Calculator size={18} /></button>
                              <button onClick={() => { const n = [...protocols]; n[activeProtocolIndex].meals[mIdx].items.splice(iIdx, 1); setProtocols(n); }} className="p-2.5 bg-white border border-slate-200 text-slate-400 rounded-[12px] hover:text-red-500 hover:border-red-200 transition-all"><Trash2 size={18} /></button>
                            </div>
                          </div>
                        </div>

                        {/* SUGESTÕES DA IA (VERDE) */}
                        {itemSuggestions.length > 0 && (
                          <div className="px-4 pb-4 animate-in slide-in-from-top-2">
                            <div className="p-4 bg-green-50 rounded-[20px] border border-green-100">
                              <p className="text-[9px] sm:text-[10px] font-black uppercase text-green-600 mb-3 tracking-[0.2em] flex items-center gap-1.5"><CheckCircle size={14}/> Sugestões de troca pela IA:</p>
                              <div className="flex flex-wrap gap-2">
                                {itemSuggestions.map((sub: any, sIdx: number) => (
                                  <button key={sIdx} onClick={() => approveSub(mIdx, iIdx, sub)} className="flex items-center gap-2 bg-white px-3 py-2 rounded-[12px] shadow-sm border border-green-100 hover:border-green-500 hover:text-green-700 transition-all group/sub active:scale-95">
                                    <Plus size={14} className="text-green-400 group-hover/sub:text-green-600" /> 
                                    <span className="text-[10px] font-bold uppercase text-slate-700 group-hover/sub:text-green-800">{sub.amount}{sub.unit} {sub.name}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* SUBSTITUTOS APROVADOS MANUAIS */}
                        {item.substitutes?.length > 0 && (
                          <div className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {item.substitutes.map((sub: any, sIdx: number) => (
                              <div key={sIdx} className="flex items-center gap-3 bg-white border border-slate-200 p-2.5 pl-4 rounded-[16px] group/active hover:border-green-300 transition-colors">
                                <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-[10px] border border-slate-100">
                                   <input className="w-8 bg-transparent font-black text-xs text-slate-800 text-center outline-none hide-arrows" type="number" value={sub.amount} onChange={(e) => { const n = [...protocols]; n[activeProtocolIndex].meals[mIdx].items[iIdx].substitutes[sIdx].amount = e.target.value; setProtocols(n); }} />
                                   <span className="text-[9px] font-black uppercase text-slate-400">{sub.unit}</span>
                                </div>
                                <span className="text-[10px] sm:text-[11px] font-bold uppercase text-slate-600 flex-1 truncate">{sub.name}</span>
                                <button onClick={() => { const n = [...protocols]; n[activeProtocolIndex].meals[mIdx].items[iIdx].substitutes.splice(sIdx, 1); setProtocols(n); }} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-[10px] transition-all"><X size={14} /></button>
                              </div>
                            ))}
                          </div>
                        )}

                        <button onClick={() => { setManualSubIndex({ mIdx, iIdx }); setActiveMealIndex(mIdx); }} className="w-full text-center pb-3 text-[10px] font-black tracking-[0.2em] text-slate-300 uppercase hover:text-green-500 transition-colors pt-2 flex items-center justify-center gap-1"><Plus size={12}/> Adicionar Substituto Manual</button>
                      </div>
                    );
                  })}
                  
                  {activeMealIndex === mIdx ? null : (
                     <button onClick={() => setActiveMealIndex(mIdx)} className="w-full py-5 border-2 border-dashed border-slate-200 rounded-[25px] text-slate-400 font-black uppercase text-[10px] sm:text-xs tracking-widest hover:border-green-400 hover:text-green-600 hover:bg-green-50/50 transition-all flex items-center justify-center gap-2 group/add mt-4">
                        <div className="p-1.5 bg-slate-100 rounded-[10px] text-slate-400 group-hover/add:bg-green-500 group-hover/add:text-white transition-colors"><Plus size={16} /></div>
                        Adicionar Alimento
                     </button>
                  )}
                </div>
              </div>
            ))}
            
            <button onClick={addMeal} className="w-full py-6 sm:py-8 bg-white border border-slate-200 rounded-[35px] shadow-sm text-slate-400 font-black uppercase tracking-[0.2em] hover:shadow-[0_10px_30px_-15px_rgba(0,0,0,0.1)] hover:border-green-300 hover:text-green-600 transition-all flex items-center justify-center gap-3">
                <Plus size={24} className="text-green-500"/> Criar Nova Refeição
            </button>
        </div>
      </main>

      {/* MODAL DE BUSCA ELITE */}
      {(activeMealIndex !== null) && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-end sm:items-center justify-center sm:p-4">
          <div className="bg-white w-full max-w-2xl h-[85vh] sm:h-[650px] rounded-t-[35px] sm:rounded-[40px] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 border border-slate-100">
            <div className="p-5 sm:p-6 border-b border-slate-100 flex justify-between items-center bg-white z-10">
              <h2 className="text-xl font-black uppercase italic text-slate-800 flex items-center gap-2">
                <Search className="text-green-500" size={24}/> {manualSubIndex ? "Trocar alimento..." : "O que vamos comer?"}
              </h2>
              <button onClick={() => {setActiveMealIndex(null); setManualSubIndex(null);}} className="p-2.5 bg-slate-50 border border-slate-200 rounded-[14px] hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-all"><X size={20}/></button>
            </div>
            
            <div className="bg-slate-50 p-3 sm:p-4 border-b border-slate-100">
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {categories.map(cat => (
                    <button 
                      key={cat.id} 
                      onClick={() => { setActiveCategory(cat.id); setSearchTerm(''); }} 
                      className={`px-4 sm:px-5 py-2.5 sm:py-3 rounded-[16px] text-[10px] sm:text-[11px] font-black uppercase tracking-widest whitespace-nowrap transition-all border 
                        ${activeCategory === cat.id 
                          ? 'bg-slate-900 border-slate-900 text-green-400 shadow-md' 
                          : 'bg-white border-slate-200 text-slate-500 hover:border-green-300 hover:text-slate-800'
                        }
                      `}
                    >
                      {cat.label}
                    </button>
                ))}
                </div>
            </div>

            <div className="p-4 sm:p-5 bg-white shadow-sm z-10">
               <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-4 sm:p-5 rounded-[20px] focus-within:border-green-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-green-500/10 transition-all">
                  <Search className="text-slate-400" size={22}/>
                  <input autoFocus placeholder={`Buscar em ${categories.find(c => c.id === activeCategory)?.label}...`} className="flex-1 bg-transparent outline-none font-bold text-sm sm:text-base uppercase text-slate-800 placeholder-slate-400" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
               </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2.5 bg-slate-50">
               {searchResults.map((food: any, idx) => (
                 <button key={idx} onClick={() => addItemToMeal(activeMealIndex, food)} className="w-full text-left p-4 sm:p-5 bg-white border border-slate-100 hover:border-green-400 hover:shadow-[0_5px_15px_rgba(22,163,74,0.1)] rounded-[20px] transition-all group active:scale-[0.98]">
                   <div className="flex justify-between items-center gap-4">
                       <span className="font-black text-xs sm:text-sm uppercase text-slate-700 group-hover:text-green-700 transition-colors leading-tight">{food.name}</span>
                       <span className="text-[9px] sm:text-[10px] font-black tracking-widest bg-slate-50 border border-slate-100 text-slate-400 px-3 py-1.5 rounded-[10px] uppercase shrink-0">{food.category?.replace('_', ' ') || 'GERAL'}</span>
                   </div>
                 </button>
               ))}
               {searchResults.length === 0 && (
                 <div className="flex flex-col items-center justify-center h-40 text-slate-300">
                   <Search size={48} className="mb-4 opacity-20" />
                   <span className="font-black uppercase tracking-widest text-xs">Nenhum alimento encontrado</span>
                 </div>
               )}
            </div>
          </div>
        </div>
      )}

      {/* FOOTER SALVAR */}
      <footer className="fixed bottom-0 left-0 right-0 p-4 sm:p-6 bg-white/80 backdrop-blur-xl border-t border-slate-200 z-40">
        <button onClick={saveDiet} className="max-w-4xl mx-auto w-full bg-slate-900 text-white py-5 sm:py-6 rounded-[25px] font-black uppercase tracking-[0.2em] text-xs sm:text-sm shadow-xl shadow-slate-900/20 hover:bg-green-600 hover:shadow-green-600/30 transition-all active:scale-[0.98] flex items-center justify-center gap-3">
          <Save size={20} className="text-green-400" /> Confirmar e Enviar Dieta
        </button>
      </footer>

      {/* MODAL DE SALVAR TEMPLATE NA BIBLIOTECA */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white p-6 sm:p-8 rounded-[35px] max-w-sm w-full shadow-2xl relative animate-in fade-in zoom-in-95">
              <button onClick={() => setShowTemplateModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 bg-slate-50 p-2 rounded-full"><X size={16}/></button>
              
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-4 border border-green-100"><Copy size={24}/></div>
              <h3 className="text-xl font-black uppercase italic text-slate-900 mb-2">Salvar na Biblioteca</h3>
              <p className="text-xs font-bold text-slate-500 mb-6">Guarde esta dieta (com todos os ciclos e substitutos) para clonar depois.</p>
              
              <input 
                type="text" 
                placeholder="Ex: Bulk Pesado 90kg" 
                value={templateName}
                onChange={e => setTemplateName(e.target.value)}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-[16px] font-bold outline-none focus:border-green-500 focus:bg-white transition-colors mb-4 text-slate-900"
              />
              
              <button 
                onClick={handleSaveTemplate}
                className="w-full bg-slate-900 text-white font-black uppercase p-4 rounded-[16px] text-xs tracking-widest hover:bg-green-600 transition-colors shadow-lg active:scale-95 flex justify-center gap-2"
              >
                <Save size={16} className="text-green-400" /> Confirmar e Salvar
              </button>
           </div>
        </div>
      )}

      <style jsx global>{`
        .hide-arrows::-webkit-outer-spin-button,
        .hide-arrows::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        .hide-arrows {
          -moz-appearance: textfield;
        }
      `}</style>
    </div>
  );
}