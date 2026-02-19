'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Activity, Scale, Ruler, LogOut, Clock, ArrowRightLeft, X, Utensils, CheckCircle, FileText } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [meals, setMeals] = useState<any[]>([]);
  const [studentData, setStudentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Estados para o Modal de Substituição
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('shape_user');
    if (!storedUser) { router.push('/login'); return; }
    
    const userData = JSON.parse(storedUser);
    setUser(userData);

    if (userData.role === 'coach') { router.push('/dashboard-coach'); return; }

    async function loadData() {
      try {
        const dietRes = await fetch(`/api/diet/latest?studentId=${userData.id}`);
        if (dietRes.ok) {
          const diet = await dietRes.json();
          // Normalização Poderosa: Garante que tudo vire objeto legível
          const normalizedDiet = Array.isArray(diet) ? diet.map(meal => ({
             ...meal,
             items: Array.isArray(meal.items) ? meal.items.map((item: any) => {
                // Se for string antiga ("100g Frango"), converte para objeto visual
                if (typeof item === 'string') {
                    return { name: item, amount: "", unit: "", substitutes: [] };
                }
                // Se for objeto novo, mantém. Se faltar nome, põe placeholder.
                return {
                    name: item.name || "Alimento sem nome",
                    amount: item.amount || "",
                    unit: item.unit || "",
                    substitutes: Array.isArray(item.substitutes) ? item.substitutes : []
                };
             }) : []
          })) : [];
          setMeals(normalizedDiet); 
        }
        
        const detailsRes = await fetch(`/api/students/details?id=${userData.id}`);
        if (detailsRes.ok) setStudentData(await detailsRes.json());
      } catch (err) { 
        console.error(err); 
      } finally { 
        setLoading(false); 
      }
    }
    loadData();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('shape_user');
    router.push('/login');
  };

  const openSubstituteModal = (item: any) => {
    if (item.substitutes && item.substitutes.length > 0) {
      setSelectedItem(item);
      setIsModalOpen(true);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center font-black text-blue-500 animate-pulse text-xl tracking-widest">
      CARREGANDO...
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24 relative text-black">
      
      {/* --- CABEÇALHO --- */}
      <header className="bg-slate-900 text-white p-8 rounded-b-[40px] shadow-2xl mb-8 border-b-4 border-blue-600 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full blur-[100px] opacity-20 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        
        <div className="flex justify-between items-start relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center text-white border-2 border-white/20 shadow-lg shadow-blue-900/50">
              <User size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Shape Natural</p>
              <h1 className="text-2xl font-black uppercase italic tracking-tighter leading-none">
                {user?.name}
              </h1>
            </div>
          </div>
          <button onClick={handleLogout} className="text-white/30 hover:text-red-500 transition-colors p-2 bg-white/5 rounded-xl hover:bg-white/10">
            <LogOut size={20} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-8 relative z-10">
          <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex items-center gap-3">
            <Scale className="text-blue-400" size={20} />
            <div>
              <span className="block text-[10px] font-black uppercase opacity-60">Peso Atual</span>
              <span className="text-xl font-black italic">{studentData?.weight || '--'}kg</span>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex items-center gap-3">
            <Ruler className="text-blue-400" size={20} />
            <div>
              <span className="block text-[10px] font-black uppercase opacity-60">Altura</span>
              <span className="text-xl font-black italic">{studentData?.height || '--'}cm</span>
            </div>
          </div>
        </div>
      </header>

      {/* --- CRONOGRAMA --- */}
      <main className="px-6 space-y-8">
        <h2 className="text-xs font-black uppercase italic flex items-center gap-2 text-slate-400 tracking-[0.2em] pl-2 border-l-4 border-blue-600">
           Protocolo do Dia
        </h2>
        
        {meals.length === 0 ? (
          <div className="py-20 text-center border-4 border-dashed border-slate-200 rounded-[40px] bg-white opacity-50">
            <p className="font-black uppercase text-xs text-slate-400">Aguardando liberação do Coach</p>
          </div>
        ) : (
          <div className="space-y-6">
            {meals.map((meal: any, index: number) => (
              <div key={index} className="bg-white p-6 rounded-[35px] shadow-[0px_15px_40px_-15px_rgba(0,0,0,0.08)] border border-slate-100 hover:border-blue-200 transition-all group">
                
                {/* Header da Refeição */}
                <div className="flex justify-between items-start mb-6 pb-4 border-b border-slate-50">
                  <div>
                    <div className="bg-slate-100 text-slate-600 w-fit px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1.5 mb-2 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Clock size={12} /> {meal.time || "00:00"}
                    </div>
                    <h3 className="text-xl font-black uppercase italic leading-none text-slate-800">{meal.title}</h3>
                  </div>
                </div>
                
                {/* Observações do Coach */}
                {meal.observations && (
                  <div className="mb-6 bg-yellow-50 p-4 rounded-2xl border border-yellow-100 text-xs font-medium text-yellow-800 italic relative">
                     <span className="absolute -top-2 left-4 bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded text-[9px] font-black uppercase flex items-center gap-1"><FileText size={10}/> Nota do Coach</span>
                     {meal.observations}
                  </div>
                )}

                {/* Lista de Alimentos */}
                <div className="space-y-3">
                  {meal.items?.map((item: any, i: number) => (
                    <div key={i} className="flex flex-col">
                      <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-3 flex-1 overflow-hidden">
                          <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center font-black text-xs shadow-sm ${item.substitutes?.length > 0 ? 'bg-blue-100 text-blue-600 border border-blue-200' : 'bg-white text-slate-400 border border-slate-200'}`}>
                             {i + 1}
                          </div>
                          <div className="min-w-0">
                             <span className="block text-sm font-black uppercase italic text-slate-800 leading-tight truncate">
                               {item.name}
                             </span>
                             {/* Renderiza Quantidade e Unidade se existirem */}
                             {item.amount && (
                                <span className="text-[10px] font-bold text-slate-500 uppercase bg-slate-200 px-1.5 py-0.5 rounded mr-1">
                                    {item.amount}{item.unit}
                                </span>
                             )}
                          </div>
                        </div>
                        
                        {/* Botão de Substituição */}
                        {item.substitutes && item.substitutes.length > 0 && (
                          <button 
                            onClick={() => openSubstituteModal(item)}
                            className="shrink-0 bg-white border-2 border-blue-100 text-blue-600 p-2 rounded-xl hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm active:scale-95 flex items-center gap-1"
                          >
                            <ArrowRightLeft size={14} />
                            <span className="text-[9px] font-black uppercase hidden sm:inline">Trocar</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* --- MODAL DE SUBSTITUIÇÃO --- */}
      {isModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          
          <div className="bg-white w-full max-w-md rounded-[35px] overflow-hidden relative z-10 animate-in slide-in-from-bottom duration-300 shadow-2xl">
            <div className="bg-blue-600 p-6 text-white pt-8 pb-10 relative">
               <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 p-2 rounded-full transition-colors text-white">
                 <X size={18} />
               </button>
               <span className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2 block">Você pode trocar por:</span>
               <h3 className="text-xl font-black uppercase italic leading-none">{selectedItem.name}</h3>
            </div>

            <div className="p-6 -mt-6 bg-white rounded-t-[30px] relative">
              <div className="space-y-3 max-h-[50vh] overflow-y-auto pt-2 pr-2 custom-scrollbar">
                {selectedItem.substitutes.map((sub: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-white rounded-2xl border border-slate-100 shadow-sm group hover:border-blue-500 hover:shadow-md transition-all">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-12 h-12 shrink-0 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center text-blue-600 group-hover:bg-blue-50 group-hover:border-blue-200 transition-colors">
                        <span className="text-sm font-black leading-none">{sub.amount}</span>
                        <span className="text-[8px] font-black uppercase">{sub.unit}</span>
                      </div>
                      <span className="font-bold uppercase italic text-slate-700 text-xs group-hover:text-blue-900 truncate">{sub.name}</span>
                    </div>
                    <CheckCircle className="text-slate-200 group-hover:text-blue-500 transition-colors shrink-0" size={18} />
                  </div>
                ))}
              </div>

              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-full bg-slate-900 text-white p-4 rounded-[20px] font-black uppercase mt-6 hover:bg-blue-600 transition-colors shadow-xl active:scale-98"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}