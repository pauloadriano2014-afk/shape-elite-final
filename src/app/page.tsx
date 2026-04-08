'use client'

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Activity, 
  LogOut, 
  Clock, 
  ArrowRightLeft, 
  Camera, 
  CheckCircle,
  Square,
  FileText, 
  CalendarDays, 
  ShoppingCart, 
  Loader2, 
  Utensils,
  LayoutDashboard,
  TrendingUp, 
  UploadCloud 
} from 'lucide-react';

// IMPORTANDO OS COMPONENTES DO ECOSSISTEMA SHAPE NATURAL
import Biofeedback from '@/components/Biofeedback';
import FreeMeal from '@/components/FreeMeal';
import WaterTracker from '@/components/WaterTracker';
import DietPDFGenerator from '@/components/DietPDFGenerator';
import NutriChat from '@/components/NutriChat';
import InstallScreen from '@/components/InstallScreen';

// IMPORTANDO OS MODAIS MODULARIZADOS
import SubstituteModal from '@/components/modals/SubstituteModal';
import ShoppingListModal from '@/components/modals/ShoppingListModal';
import AiScannerModal from '@/components/modals/AiScannerModal';

export default function Home() {
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<'dieta' | 'painel' | 'evolucao'>('dieta');
  const [showInstallGate, setShowInstallGate] = useState(false);

  const [user, setUser] = useState<any>(null);
  const [studentData, setStudentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [protocols, setProtocols] = useState<any[]>([]);
  const [activeDay, setActiveDay] = useState<number>(new Date().getDay());
  const [completedMeals, setCompletedMeals] = useState<string[]>([]);

  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isShoppingListOpen, setIsShoppingListOpen] = useState(false);
  const [checkedShoppingItems, setCheckedShoppingItems] = useState<string[]>([]);

  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [activeMealForPhoto, setActiveMealForPhoto] = useState<any>(null);

  const [checkinWeight, setCheckinWeight] = useState('');
  const [checkinPhotos, setCheckinPhotos] = useState<{frente: string | null, lado: string | null, costas: string | null}>({ frente: null, lado: null, costas: null });
  const [isSubmittingCheckin, setIsSubmittingCheckin] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);
  const fileFrenteRef = useRef<HTMLInputElement>(null);
  const fileLadoRef = useRef<HTMLInputElement>(null);
  const fileCostasRef = useRef<HTMLInputElement>(null);

  const weekDays = [
      { idx: 0, label: 'Dom' }, { idx: 1, label: 'Seg' }, { idx: 2, label: 'Ter' },
      { idx: 3, label: 'Qua' }, { idx: 4, label: 'Qui' }, { idx: 5, label: 'Sex' }, { idx: 6, label: 'Sáb' }
  ];

  useEffect(() => {
    const today = new Date().toLocaleDateString('pt-BR');
    const stored = localStorage.getItem('shape_completed_meals');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.date === today) {
          setCompletedMeals(parsed.meals || []);
        } else {
          localStorage.removeItem('shape_completed_meals');
          setCompletedMeals([]);
        }
      } catch (e) {
        localStorage.removeItem('shape_completed_meals');
      }
    }
  }, []);

  const toggleMealCompleted = (mealId: string) => {
    setCompletedMeals(prev => {
      const isCompleted = prev.includes(mealId);
      const nextMeals = isCompleted ? prev.filter(id => id !== mealId) : [...prev, mealId];
      const today = new Date().toLocaleDateString('pt-BR');
      localStorage.setItem('shape_completed_meals', JSON.stringify({ date: today, meals: nextMeals }));
      return nextMeals;
    });
  };

  useEffect(() => {
    if (isModalOpen || isShoppingListOpen || isAiModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isModalOpen, isShoppingListOpen, isAiModalOpen]);

  useEffect(() => {
    const storedUser = localStorage.getItem('shape_user');
    if (!storedUser) {
      router.push('/login');
      return;
    }
    const userData = JSON.parse(storedUser);
    setUser(userData);

    if (userData.role === 'coach') {
      router.push('/dashboard-coach');
      return;
    }

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    const hasDismissedInstall = sessionStorage.getItem('pwa_dismissed');
    if (!isStandalone && !hasDismissedInstall) {
      setShowInstallGate(true);
    }

    async function loadData() {
      try {
        const dietRes = await fetch(`/api/diet/latest?studentId=${userData.id}`);
        if (dietRes.ok) {
          const data = await dietRes.json();
          if (Array.isArray(data) && data.length > 0) {
              setProtocols(!data[0].meals ? [{ name: 'Protocolo Padrão', activeDays: [0, 1, 2, 3, 4, 5, 6], meals: data }] : data);
          }
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

  const handleProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onloadend = async () => {
          const base64 = reader.result as string;
          setStudentData((prev: any) => ({ ...prev, photoUrl: base64 }));
          await fetch('/api/students/update-photo', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ studentId: user.id, photoUrl: base64 }) });
      };
      reader.readAsDataURL(file);
  };

  const openSubstituteModal = (item: any) => {
    if (item.substitutes && item.substitutes.length > 0) {
      setSelectedItem(item);
      setIsModalOpen(true);
    }
  };

  const getActiveProtocol = () => {
      if (protocols.length === 0) return null;
      const found = protocols.find(p => p.activeDays?.includes(activeDay));
      return found || (protocols.length === 1 ? protocols[0] : null);
  };

  const generateShoppingList = () => {
      const list: {[key: string]: any} = {};

      protocols.forEach(protocol => {
          const daysCount = protocol.activeDays?.length || 0;
          if (daysCount === 0) return;

          protocol.meals?.forEach((meal: any) => {
              meal.items?.forEach((item: any) => {
                  const amt = parseFloat(item.amount) || 0;
                  if (amt === 0) return;

                  let cleanName = item.name;
                  const prefixRegex = /^(\d+(?:[.,]\d+)?)\s*([a-zA-Záéíóúç]+)?\s*(de\s+)?/i;
                  const match = cleanName.match(prefixRegex);
                  
                  if (match) {
                      const possibleUnit = (match[2] || '').toLowerCase();
                      const validUnits = ['g', 'ml', 'un', 'fatia', 'fatias', 'colher', 'colheres', 'scoop', 'xicara', 'xícara', 'xícaras', 'kg', 'l'];
                      if (validUnits.includes(possibleUnit)) {
                          cleanName = cleanName.replace(prefixRegex, '').trim();
                      } else if (!possibleUnit) {
                          cleanName = cleanName.replace(/^(\d+(?:[.,]\d+)?)\s*/, '').trim();
                      }
                  }

                  const totalAmt = amt * daysCount;
                  const key = `${cleanName.toLowerCase()}|${item.unit}`;

                  if (!list[key]) {
                      let cat = '🛒 Outros';
                      const n = cleanName.toLowerCase();
                      if (n.includes('frango') || n.includes('carne') || n.includes('patinho') || n.includes('peixe') || n.includes('ovo') || n.includes('queijo') || n.includes('mussarela') || n.includes('peru') || n.includes('presunto') || n.includes('lombo') || n.includes('ricota') || n.includes('cottage') || n.includes('tilápia')) {
                          cat = '🥩 Açougue e Laticínios';
                      } else if (n.includes('arroz') || n.includes('aveia') || n.includes('pão') || n.includes('macarrão') || n.includes('azeite') || n.includes('amendoim') || n.includes('tapioca') || n.includes('granola') || n.includes('café') || n.includes('requeijão') || n.includes('leite') || n.includes('crepioca')) {
                          cat = '📦 Mercearia';
                      } else if (n.includes('banana') || n.includes('maçã') || n.includes('batata') || n.includes('mandioca') || n.includes('morango') || n.includes('melancia') || n.includes('mamão') || n.includes('abacate') || n.includes('melão') || n.includes('pera') || n.includes('uva')) {
                          cat = '🥦 Frutaria e Legumes';
                      } else if (n.includes('whey') || n.includes('creatina') || n.includes('albumina') || n.includes('soja') || n.includes('caseína')) {
                          cat = '💪 Suplementos';
                      }
                      list[key] = { name: cleanName, unit: item.unit, amount: totalAmt, category: cat };
                  } else {
                      list[key].amount += totalAmt;
                  }
              });
          });
      });

      const grouped: {[key: string]: any[]} = {};
      Object.values(list).forEach(item => {
          let finalAmount = item.amount;
          let finalUnit = item.unit;
          if (finalUnit === 'g' && finalAmount >= 1000) {
              finalAmount = (finalAmount / 1000).toFixed(1).replace('.0', '');
              finalUnit = 'kg';
          } else if (finalUnit === 'ml' && finalAmount >= 1000) {
              finalAmount = (finalAmount / 1000).toFixed(1).replace('.0', '');
              finalUnit = 'L';
          }
          if (!grouped[item.category]) grouped[item.category] = [];
          grouped[item.category].push({ ...item, amount: finalAmount, unit: finalUnit });
      });
      return grouped;
  };

  const toggleShoppingItem = (itemName: string) => {
      if (checkedShoppingItems.includes(itemName)) {
          setCheckedShoppingItems(checkedShoppingItems.filter(i => i !== itemName));
      } else {
          setCheckedShoppingItems([...checkedShoppingItems, itemName]);
      }
  };

  const triggerCamera = (meal: any) => {
      setActiveMealForPhoto(meal);
      if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onloadend = () => {
          setPhotoPreview(reader.result as string);
          setAiFeedback(null);
          setIsAiModalOpen(true);
      };
      reader.readAsDataURL(file);
  };

  const analyzeImage = async () => {
    if (!photoPreview) return;
    setIsAnalyzing(true);
    setAiFeedback(null);
    try {
      const expectedFood = activeMealForPhoto.items.map((i: any) => `${i.amount}${i.unit} de ${i.name}`);
      const res = await fetch('/api/ai/analyze-meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: photoPreview, expectedMeal: expectedFood })
      });
      const data = await res.json();
      if (res.ok) setAiFeedback(data.result);
      else setAiFeedback("Erro ao analisar imagem: " + (data.error || "Desconhecido"));
    } catch (error) {
      setAiFeedback("Falha na conexão com a IA.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCheckinPhoto = (e: React.ChangeEvent<HTMLInputElement>, position: 'frente' | 'lado' | 'costas') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => { setCheckinPhotos(prev => ({ ...prev, [position]: reader.result as string })); };
    reader.readAsDataURL(file);
  };

  const submitCheckin = async () => {
    if (!checkinWeight || !checkinPhotos.frente || !checkinPhotos.lado || !checkinPhotos.costas) {
       alert("Elite não fura check-in: Preencha o peso e adicione as 3 fotos!");
       return;
    }
    setIsSubmittingCheckin(true);

    try {
      const uploadPhoto = async (base64: string, position: string) => {
         const res = await fetch(base64);
         const blob = await res.blob();
         const filename = `${user.id}-${position}-${Date.now()}.jpg`;
         const uploadRes = await fetch(`/api/upload?filename=${filename}`, { method: 'POST', body: blob });
         if (!uploadRes.ok) throw new Error("Falha ao subir foto");
         return (await uploadRes.json()).url;
      };

      const [urlFrente, urlLado, urlCostas] = await Promise.all([
          uploadPhoto(checkinPhotos.frente, 'frente'),
          uploadPhoto(checkinPhotos.lado, 'lado'),
          uploadPhoto(checkinPhotos.costas, 'costas')
      ]);

      const dbRes = await fetch('/api/evolucao', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId: user.id, peso: checkinWeight, fotoFrente: urlFrente, fotoLado: urlLado, fotoCostas: urlCostas,
            dataCheckin: new Date().toISOString().split('T')[0]
          })
      });

      if (!dbRes.ok) throw new Error("Erro ao salvar avaliação no banco.");
      alert("📸 Missão Cumprida! Check-in enviado para o Coach.");
      
      const refreshProfile = await fetch(`/api/students/details?id=${user.id}`);
      if (refreshProfile.ok) setStudentData(await refreshProfile.json());
      
      setCheckinWeight('');
      setCheckinPhotos({ frente: null, lado: null, costas: null });
      setActiveTab('painel'); 

    } catch (error) {
       console.error(error);
       alert("Erro de conexão. Tente novamente.");
    } finally {
       setIsSubmittingCheckin(false);
    }
  };

  const activeProtocol = getActiveProtocol();
  const shoppingList = generateShoppingList();

  const nextCheckinStr = studentData?.next_checkin_date;
  let checkinStatus = 'none'; 
  let daysToDiff = 0;
  let formattedDate = '';

  if (nextCheckinStr) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const [year, month, day] = nextCheckinStr.split('T')[0].split('-');
      const checkinDate = new Date(Number(year), Number(month) - 1, Number(day));
      checkinDate.setHours(0, 0, 0, 0); 
      formattedDate = checkinDate.toLocaleDateString('pt-BR');
      const diffTime = checkinDate.getTime() - today.getTime();
      daysToDiff = Math.round(diffTime / (1000 * 60 * 60 * 24));
      if (daysToDiff > 5) checkinStatus = 'ok';
      else if (daysToDiff > 0 && daysToDiff <= 5) checkinStatus = 'warning';
      else checkinStatus = 'danger'; 
  }

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-slate-900 flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="font-black text-white text-xl tracking-[0.3em] uppercase italic animate-pulse">Shape Natural</p>
      </div>
    );
  }

  if (showInstallGate) {
    return <InstallScreen onContinue={() => { setShowInstallGate(false); sessionStorage.setItem('pwa_dismissed', 'true'); }} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-black font-sans flex flex-col relative overflow-x-hidden">
      
      <input type="file" accept="image/*" capture="environment" ref={fileInputRef} className="hidden" onChange={handleImageCapture} />
      <input type="file" accept="image/*" ref={profileInputRef} className="hidden" onChange={handleProfileImageChange} />
      <input type="file" accept="image/*" ref={fileFrenteRef} className="hidden" onChange={(e) => handleCheckinPhoto(e, 'frente')} />
      <input type="file" accept="image/*" ref={fileLadoRef} className="hidden" onChange={(e) => handleCheckinPhoto(e, 'lado')} />
      <input type="file" accept="image/*" ref={fileCostasRef} className="hidden" onChange={(e) => handleCheckinPhoto(e, 'costas')} />

      <div className="relative z-[150]">
         <NutriChat studentName={user?.name || 'Atleta'} protocols={protocols} />
      </div>

      <header className="fixed top-0 left-0 right-0 z-[100] bg-slate-900 text-white px-6 pt-[max(1.2rem,env(safe-area-inset-top))] pb-6 rounded-b-[45px] shadow-2xl border-b-4 border-green-600 overflow-hidden flex items-center justify-between">
        <div className="absolute top-0 right-0 w-80 h-80 bg-green-600 rounded-full blur-[120px] opacity-20 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="flex items-center gap-4 relative z-10">
          <div onClick={() => profileInputRef.current?.click()} className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-800 rounded-full border-2 border-green-500 flex items-center justify-center overflow-hidden shadow-[0_0_25px_rgba(22,163,74,0.4)] relative group cursor-pointer active:scale-95 transition-all shrink-0">
            {studentData?.photoUrl || user?.photoUrl ? (
                <img src={studentData?.photoUrl || user?.photoUrl} alt="Perfil" className="w-full h-full object-cover" />
            ) : (
                <User size={30} className="text-green-400" />
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={18} className="text-white"/>
            </div>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black text-green-400 uppercase tracking-[0.2em] mb-1">Shape Natural Elite</p>
            <h1 className="text-xl font-black uppercase italic tracking-tighter leading-none truncate max-w-[150px]">Fala, {user?.name ? user.name.split(' ')[0] : 'Aluno'}!</h1>
          </div>
        </div>
        <button onClick={handleLogout} className="relative z-10 text-white/40 hover:text-red-500 p-3 bg-white/5 rounded-2xl active:scale-90 transition-transform">
          <LogOut size={22} />
        </button>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full pt-[calc(140px+env(safe-area-inset-top))] pb-[250px]">
          
          <div className={`${activeTab === 'dieta' ? 'block' : 'hidden'} animate-in fade-in duration-300`}>
             <div className="px-4 sm:px-6 mb-8">
                 <div className="flex items-center justify-between mb-4">
                     <div className="flex items-center gap-2 text-slate-400 px-2">
                       <CalendarDays size={16}/>
                       <span className="text-[11px] font-black uppercase tracking-widest">Protocolos</span>
                     </div>
                     {protocols.length > 0 && (
                       <DietPDFGenerator studentName={user?.name || 'Aluno'} protocols={protocols} />
                     )}
                 </div>
                 <div className="flex justify-between bg-white p-2.5 rounded-[25px] shadow-sm border border-slate-200 overflow-x-auto hide-scrollbar gap-2 snap-x">
                     {weekDays.map(day => (
                         <button 
                            key={day.idx} 
                            onClick={() => setActiveDay(day.idx)} 
                            className={`min-w-[60px] flex-1 py-3 rounded-2xl text-[10px] font-black uppercase transition-all snap-center whitespace-nowrap ${activeDay === day.idx ? 'bg-green-600 text-white shadow-lg scale-105 z-10' : 'text-slate-400 hover:bg-slate-50'}`}
                         >
                            {day.label}
                         </button>
                     ))}
                 </div>
             </div>

             <div className="px-4 sm:px-6 space-y-8">
                <div className="flex justify-between items-center px-2">
                    <h2 className="text-[10px] sm:text-xs font-black uppercase italic flex items-center gap-2 sm:gap-3 text-slate-400 tracking-[0.2em] sm:tracking-[0.3em] border-l-4 border-green-600 pl-3">
                       {activeProtocol ? activeProtocol.name : 'Descanso'}
                    </h2>
                </div>
                
                {!activeProtocol ? (
                  <div className="py-24 text-center border-4 border-dashed border-slate-200 rounded-[50px] bg-white/50 m-2">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                        <Activity size={32} />
                    </div>
                    <p className="font-black uppercase text-xs text-slate-400 tracking-widest">Sem protocolos hoje.</p>
                  </div>
                ) : (
                  <div className="space-y-6 sm:space-y-8">
                    {activeProtocol.meals.map((meal: any, index: number) => {
                      const mealUniqueId = `${activeProtocol.name}-${activeDay}-${meal.title}-${index}`;
                      const isMealCompleted = completedMeals.includes(mealUniqueId);

                      return (
                      <div 
                        key={index} 
                        className={`bg-white p-5 sm:p-7 rounded-[35px] sm:rounded-[40px] shadow-[0px_10px_30px_-15px_rgba(0,0,0,0.1)] border transition-all group relative overflow-hidden ${isMealCompleted ? 'border-green-400 opacity-90' : 'border-slate-100 hover:border-green-200'}`}
                      >
                        <div className={`absolute top-0 left-0 w-1.5 h-full transition-opacity ${isMealCompleted ? 'bg-green-500 opacity-100' : 'bg-green-600 opacity-0 group-hover:opacity-100'}`}></div>
                        
                        <div className="flex justify-between items-start mb-6 sm:mb-8 pb-4 sm:pb-5 border-b border-slate-50">
                          <div className="space-y-2 pr-2">
                            <div className="bg-slate-100 text-slate-600 w-fit px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-[9px] sm:text-[10px] font-black flex items-center gap-1.5 sm:gap-2 group-hover:bg-green-600 group-hover:text-white transition-all">
                              <Clock size={12} className="sm:w-[14px] sm:h-[14px]" /> 
                              {meal.time || "Livre"}
                            </div>
                            <h3 className="text-xl sm:text-2xl font-black uppercase italic leading-none text-slate-800 tracking-tight">
                              {meal.title}
                            </h3>
                          </div>
                          
                          <button 
                            onClick={() => triggerCamera(meal)} 
                            className="bg-green-50 text-green-600 p-3 sm:p-4 rounded-2xl sm:rounded-3xl hover:bg-green-600 hover:text-white transition-all shadow-sm flex flex-col items-center gap-1 active:scale-90 shrink-0 min-w-[56px]"
                          >
                            <Camera size={20} className="sm:w-[24px] sm:h-[24px]" />
                            <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-wider">IA Scan</span>
                          </button>
                        </div>

                        {meal.observations && (
                          <div className="mb-6 sm:mb-8 bg-amber-50/50 p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-amber-100 text-[11px] sm:text-xs font-semibold text-amber-800 italic relative">
                            <span className="absolute -top-3 left-4 sm:left-6 bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full text-[8px] sm:text-[9px] font-black uppercase flex items-center gap-1 shadow-sm">
                              <FileText size={10} className="sm:w-[12px] sm:h-[12px]"/> Nota Estratégica
                            </span>
                            {meal.observations}
                          </div>
                        )}

                        <div className="space-y-3 sm:space-y-4">
                          {meal.items?.map((item: any, i: number) => (
                            <div key={i} className="flex flex-col">
                              <div className="flex items-center justify-between bg-slate-50/80 p-3 sm:p-4 rounded-[20px] sm:rounded-[25px] border border-slate-100 group/item">
                                <div className="flex items-center gap-3 sm:gap-4 flex-1 overflow-hidden">
                                  <div className={`w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-[14px] sm:rounded-2xl flex items-center justify-center font-black text-xs sm:text-sm shadow-sm transition-colors ${item.substitutes?.length > 0 ? 'bg-green-100 text-green-600 border border-green-200' : 'bg-white text-slate-400 border border-slate-200'}`}>
                                    {i + 1}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <span className="block text-xs sm:text-sm font-black uppercase italic text-slate-800 leading-snug line-clamp-2 whitespace-normal group-hover/item:text-green-700 transition-colors">
                                      {item.name}
                                    </span>
                                    {item.amount && (
                                      <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] sm:text-[11px] font-black text-slate-500 uppercase bg-slate-200 px-2 py-0.5 rounded-md sm:rounded-lg">
                                          {item.amount}{item.unit}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                {item.substitutes && item.substitutes.length > 0 && (
                                  <button 
                                    onClick={() => openSubstituteModal(item)} 
                                    className="shrink-0 bg-white border-2 border-green-100 text-green-600 p-2 sm:p-3 rounded-[14px] sm:rounded-2xl hover:bg-green-600 hover:text-white hover:border-green-600 transition-all shadow-sm active:scale-95 flex items-center gap-1.5 sm:gap-2 ml-2 min-h-[44px] min-w-[44px] justify-center"
                                  >
                                    <ArrowRightLeft size={16} />
                                    <span className="text-[9px] sm:text-[10px] font-black uppercase hidden sm:inline">Trocar</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        <button 
                           onClick={() => toggleMealCompleted(mealUniqueId)}
                           className={`w-full mt-6 p-4 rounded-[20px] font-black uppercase text-[10px] sm:text-xs tracking-[0.2em] flex items-center justify-center gap-2 transition-all duration-300 active:scale-95 border-2 ${
                              isMealCompleted 
                              ? 'bg-green-500 text-white border-green-500 shadow-[0_10px_20px_rgba(22,163,74,0.3)]' 
                              : 'bg-transparent text-slate-400 border-slate-200 hover:border-green-400 hover:text-green-600'
                           }`}
                        >
                           {isMealCompleted ? (
                              <><CheckCircle size={18} className="animate-in zoom-in duration-300" /> Refeição Concluída</>
                           ) : (
                              <><Square size={18} /> Marcar como Feita</>
                           )}
                        </button>

                      </div>
                    );})}
                  </div>
                )}
             </div>
          </div>

          <div className={`${activeTab === 'painel' ? 'block' : 'hidden'} animate-in fade-in duration-300`}>
             <div className="px-4 sm:px-6 space-y-4">
                 <WaterTracker studentId={user?.id} weight={studentData?.weight} />
                 
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <button 
                        onClick={() => setIsShoppingListOpen(true)} 
                        className="w-full bg-white border border-slate-200 p-5 rounded-3xl shadow-sm hover:shadow-md hover:border-green-300 transition-all flex items-center gap-4 group h-full active:scale-[0.98]"
                     >
                        <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-all shrink-0">
                          <ShoppingCart size={24} />
                        </div>
                        <div className="text-left">
                          <h3 className="font-black uppercase text-sm text-slate-800 leading-tight">Mercado</h3>
                          <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Lista Automática</p>
                        </div>
                     </button>
                     
                     <Biofeedback studentId={user?.id} />
                 </div>

                 <div className="w-full">
                    <FreeMeal studentId={user?.id} />
                 </div>
             </div>
          </div>

          <div className={`${activeTab === 'evolucao' ? 'block' : 'hidden'} animate-in fade-in duration-300 px-4 sm:px-6 space-y-6`}>
             
             <div className={`p-6 rounded-[30px] shadow-xl relative overflow-hidden transform-gpu transition-colors duration-500 ${
                 checkinStatus === 'danger' ? 'bg-red-600 text-white shadow-[0_10px_40px_rgba(220,38,38,0.4)] animate-[pulse_2s_ease-in-out_infinite]' : 
                 checkinStatus === 'warning' ? 'bg-amber-400 text-slate-900 shadow-[0_10px_40px_rgba(251,191,36,0.3)]' : 
                 'bg-slate-900 text-white shadow-[0_10px_40px_rgba(0,0,0,0.2)]'
             }`}>
                <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-20 translate-x-1/2 -translate-y-1/2 pointer-events-none ${
                    checkinStatus === 'danger' ? 'bg-white' : checkinStatus === 'warning' ? 'bg-white' : 'bg-green-500'
                }`}></div>

                <div className="flex items-center gap-3 mb-2 relative z-10">
                   <div className={`w-2 h-2 rounded-full animate-pulse ${checkinStatus === 'warning' ? 'bg-slate-900' : 'bg-white'}`}></div>
                   <h3 className={`text-[10px] font-black uppercase tracking-[0.3em] ${checkinStatus === 'warning' ? 'text-slate-900' : checkinStatus === 'danger' ? 'text-white' : 'text-green-400'}`}>
                      Status da Missão
                   </h3>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black uppercase italic leading-none relative z-10 pb-1">
                   {checkinStatus === 'danger' ? (
                       <>CHEGOU A<br/><span className="pr-2">HORA!</span></>
                   ) : checkinStatus === 'warning' ? (
                       <>FALTAM<br/><span className="pr-2">{daysToDiff} {daysToDiff === 1 ? 'DIA' : 'DIAS'}</span></>
                   ) : checkinStatus === 'ok' ? (
                       <>AVALIAÇÃO EM<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-600 pr-2">{daysToDiff} DIAS</span></>
                   ) : (
                       <>AGUARDE A<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-600 pr-2">DEFINIÇÃO</span></>
                   )}
                </h2>

                <p className={`text-xs font-semibold mt-3 relative z-10 ${checkinStatus === 'warning' ? 'text-slate-800' : 'text-slate-300'}`}>
                   {checkinStatus === 'danger' ? 'Coach aguardando. Envie suas fotos e peso agora.' : 
                    checkinStatus === 'warning' ? `Prepare-se. Sua avaliação é dia ${formattedDate}.` :
                    checkinStatus === 'ok' ? `Agendado para ${formattedDate}.` :
                    'Aguarde o Paulo definir a sua próxima data de avaliação.'}
                </p>
             </div>

             <div className="bg-white p-6 rounded-[30px] border border-slate-100 shadow-sm flex flex-col items-center">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Peso Atual (Em Jejum)</h4>
                <div className="flex items-end gap-2">
                   <input 
                      type="number" 
                      placeholder="00.0" 
                      value={checkinWeight}
                      onChange={(e) => setCheckinWeight(e.target.value)}
                      className="w-32 text-center text-4xl font-black italic text-slate-900 bg-slate-50 border-2 border-slate-100 focus:border-green-500 rounded-2xl p-3 outline-none transition-all"
                   />
                   <span className="text-lg font-black text-slate-400 mb-3">KG</span>
                </div>
             </div>

             <div className="bg-white p-6 rounded-[30px] border border-slate-100 shadow-sm">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 text-center">Registro Fotográfico</h4>
                <div className="grid grid-cols-3 gap-3">
                   <div className="flex flex-col gap-2">
                      <div onClick={() => fileFrenteRef.current?.click()} className="aspect-[3/4] bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 hover:border-green-400 hover:text-green-500 transition-all cursor-pointer relative overflow-hidden group">
                         {checkinPhotos.frente ? <img src={checkinPhotos.frente} alt="Frente" className="w-full h-full object-cover" /> : <><Camera size={24} className="mb-2 group-hover:scale-110 transition-transform" /><span className="text-[8px] font-black uppercase tracking-widest">Frente</span></>}
                      </div>
                   </div>
                   <div className="flex flex-col gap-2">
                      <div onClick={() => fileLadoRef.current?.click()} className="aspect-[3/4] bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 hover:border-green-400 hover:text-green-500 transition-all cursor-pointer relative overflow-hidden group">
                         {checkinPhotos.lado ? <img src={checkinPhotos.lado} alt="Lado" className="w-full h-full object-cover" /> : <><Camera size={24} className="mb-2 group-hover:scale-110 transition-transform" /><span className="text-[8px] font-black uppercase tracking-widest">Lado</span></>}
                      </div>
                   </div>
                   <div className="flex flex-col gap-2">
                      <div onClick={() => fileCostasRef.current?.click()} className="aspect-[3/4] bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 hover:border-green-400 hover:text-green-500 transition-all cursor-pointer relative overflow-hidden group">
                         {checkinPhotos.costas ? <img src={checkinPhotos.costas} alt="Costas" className="w-full h-full object-cover" /> : <><Camera size={24} className="mb-2 group-hover:scale-110 transition-transform" /><span className="text-[8px] font-black uppercase tracking-widest">Costas</span></>}
                      </div>
                   </div>
                </div>
             </div>

             <button 
                onClick={submitCheckin}
                disabled={isSubmittingCheckin}
                className="w-full bg-green-600 text-white p-6 rounded-[25px] font-black uppercase tracking-[0.2em] text-xs sm:text-sm shadow-[0_15px_30px_-10px_rgba(22,163,74,0.4)] hover:bg-green-700 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-70"
             >
                {isSubmittingCheckin ? <><Loader2 className="animate-spin" size={20} /> ENVIANDO...</> : <><UploadCloud size={20} /> ENVIAR CHECK-IN</>}
             </button>
          </div>

      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-slate-200 p-2 pb-[max(1.2rem,env(safe-area-inset-bottom))] flex justify-center z-[110] shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
         <div className="w-full max-w-md flex bg-slate-50 p-1.5 rounded-[22px] mx-4 border border-slate-100 gap-1">
            <button onClick={() => setActiveTab('dieta')} className={`flex-1 flex flex-col items-center justify-center p-3 rounded-[16px] transition-all ${activeTab === 'dieta' ? 'bg-slate-900 text-green-400 shadow-md scale-[1.02]' : 'text-slate-400'}`}>
               <Utensils size={20} className="mb-1" /><span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest">Dieta</span>
            </button>
            <button onClick={() => setActiveTab('painel')} className={`flex-1 flex flex-col items-center justify-center p-3 rounded-[16px] transition-all ${activeTab === 'painel' ? 'bg-slate-900 text-green-400 shadow-md scale-[1.02]' : 'text-slate-400'}`}>
               <LayoutDashboard size={20} className="mb-1" /><span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest">Painel</span>
            </button>
            <button onClick={() => setActiveTab('evolucao')} className={`flex-1 flex flex-col items-center justify-center p-3 rounded-[16px] transition-all relative ${activeTab === 'evolucao' ? 'bg-slate-900 text-green-400 shadow-md scale-[1.02]' : 'text-slate-400'}`}>
               {checkinStatus === 'danger' && <span className="absolute top-2 right-6 sm:right-8 w-2.5 h-2.5 bg-red-500 border-2 border-slate-50 rounded-full animate-ping"></span>}
               {checkinStatus === 'danger' && <span className="absolute top-2 right-6 sm:right-8 w-2.5 h-2.5 bg-red-500 border-2 border-slate-50 rounded-full"></span>}
               <TrendingUp size={20} className="mb-1" /><span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest">Evolução</span>
            </button>
         </div>
      </nav>

      {/* --- INSERINDO OS MODAIS MODULARIZADOS AQUI --- */}
      <SubstituteModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        selectedItem={selectedItem} 
      />

      <ShoppingListModal 
        isOpen={isShoppingListOpen} 
        onClose={() => setIsShoppingListOpen(false)} 
        shoppingList={shoppingList}
        checkedShoppingItems={checkedShoppingItems}
        toggleShoppingItem={toggleShoppingItem}
        studentName={user?.name || 'Aluno'}
      />

      <AiScannerModal 
        isOpen={isAiModalOpen} 
        onClose={() => setIsAiModalOpen(false)} 
        photoPreview={photoPreview}
        isAnalyzing={isAnalyzing}
        aiFeedback={aiFeedback}
        analyzeImage={analyzeImage}
      />

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        #nutrichat-trigger, .fixed.bottom-4.right-4, button.fixed.bottom-6.right-6 { bottom: 110px !important; z-index: 160 !important; }
      `}</style>
    </div>
  );
}