'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image'; // IMPORTANTE: O Image do Next
import { 
  Users, Plus, Target, Search, Edit2, LogOut, 
  Droplets, Zap, Flame, User as UserIcon, Activity, TrendingUp, Copy,
  MessageCircle // <--- ADICIONE ESTE AQUI
} from 'lucide-react';

export default function DashboardCoachPage() {
  const router = useRouter();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const totalStudents = students.length;
  const activeToday = students.filter(s => s.today_water > 0 || s.today_energy).length;

  useEffect(() => {
    async function loadStudents() {
      try {
        const res = await fetch('/api/students/list');
        if (res.ok) {
          const data = await res.json();
          setStudents(data);
        }
      } catch (err) {
        console.error("Erro na carga de atletas");
      } finally {
        setLoading(false);
      }
    }
    loadStudents();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('shape_user');
    router.push('/login');
  };

  const filteredStudents = students.filter(s => 
    s.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    <div className="min-h-screen bg-slate-50 text-black font-sans flex flex-col relative overflow-x-hidden">
      
      {/* HEADER ELITE FIXO (PROTEÇÃO CONTRA VAZAMENTO NO TOPO) */}
      <div className="fixed top-0 left-0 right-0 z-[100] bg-slate-50/80 backdrop-blur-md px-4 sm:px-6 pt-[max(1rem,env(safe-area-inset-top))] pb-4">
        <header className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 bg-white p-5 sm:p-6 rounded-[30px] sm:rounded-[35px] border-2 border-slate-100 shadow-sm relative overflow-hidden">
          {/* Detalhe de cor no fundo do header */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-600 rounded-full blur-[80px] opacity-10 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

          {/* LOGO E TÍTULO */}
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-14 h-14 sm:w-20 sm:h-20 bg-slate-900 rounded-full border-2 border-green-500 overflow-hidden shadow-[0_0_15px_rgba(22,163,74,0.3)] shrink-0 flex items-center justify-center relative">
               <Image 
                 src="/logo.png" 
                 alt="Shape de Elite Logo" 
                 fill
                 sizes="(max-width: 768px) 56px, 80px"
                 className="object-cover"
                 priority
               />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Paulo Adriano Team</p>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black uppercase italic tracking-tighter leading-none">
                CENTRO <span className="text-green-600">DE COMANDO</span>
              </h1>
            </div>
          </div>
          
          {/* BOTÕES NO HEADER */}
          <div className="flex gap-3 sm:gap-4 w-full sm:w-auto relative z-10">
            <button onClick={handleLogout} className="bg-slate-50 text-slate-400 border border-slate-200 p-3.5 sm:p-4 rounded-[18px] sm:rounded-[20px] hover:text-red-500 transition-all active:scale-95 shrink-0 flex items-center justify-center">
              <LogOut size={22} />
            </button>
            
            <button onClick={() => router.push('/dashboard-coach/biblioteca')} className="bg-green-50 text-green-600 border border-green-200 p-3.5 sm:p-4 rounded-[18px] sm:rounded-[20px] hover:bg-green-600 hover:text-white transition-all active:scale-95 shrink-0 flex items-center justify-center">
              <Copy size={22} />
            </button>

            <button onClick={() => router.push('/dashboard-coach/novo-aluno')} className="flex-1 sm:flex-none bg-slate-900 text-white p-3.5 sm:p-4 rounded-[18px] sm:rounded-[20px] shadow-xl hover:bg-green-600 transition-all active:scale-95 flex items-center justify-center gap-2">
              <Plus size={22} />
              <span className="font-black uppercase text-[10px] sm:text-xs tracking-widest">Novo Atleta</span>
            </button>
          </div>
        </header>
      </div>

      {/* CONTEÚDO PRINCIPAL COM RECUO COMPENSATÓRIO 
          pt-[calc(210px...)]: Garante que os cards comecem abaixo do header fixo + notch
      */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 pt-[calc(210px+env(safe-area-inset-top))] sm:pt-[calc(160px+env(safe-area-inset-top))] pb-[env(safe-area-inset-bottom,120px)] space-y-6 sm:space-y-8">
        
        {/* CARDS DE ESTATÍSTICAS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-green-600 p-6 sm:p-8 rounded-[30px] text-white shadow-[0_10px_30px_rgba(22,163,74,0.3)] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-20">
                    <Users size={64} />
                </div>
                <Users size={28} className="mb-4 opacity-80 relative z-10" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-90 relative z-10">Time Total</p>
                <h3 className="text-3xl sm:text-4xl font-black italic mt-1 relative z-10">{totalStudents} <span className="text-lg">Atletas</span></h3>
            </div>
            <div className="bg-white p-6 sm:p-8 rounded-[30px] border border-slate-100 shadow-sm flex flex-col justify-between">
                <Activity size={28} className="mb-4 text-green-500" />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Ativos Hoje</p>
                  <h3 className="text-3xl sm:text-4xl font-black italic text-slate-800 mt-1">{activeToday} <span className="text-lg text-slate-400">Check-ins</span></h3>
                </div>
            </div>
            <div className="bg-white p-6 sm:p-8 rounded-[30px] border border-slate-100 shadow-sm flex flex-col justify-between">
                <TrendingUp size={28} className="mb-4 text-slate-800" />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Status do Time</p>
                  <h3 className="text-2xl sm:text-3xl font-black italic text-green-600 mt-1 uppercase">Em Evolução</h3>
                </div>
            </div>
        </div>

        {/* BARRA DE PESQUISA */}
        <div className="relative group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-green-600 transition-colors" size={22} />
          <input 
            type="text"
            placeholder="Pesquisar Aluno..."
            className="w-full p-6 sm:p-8 pl-16 sm:pl-16 bg-white border border-slate-200 rounded-[25px] sm:rounded-[30px] font-bold text-sm sm:text-base outline-none shadow-sm focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all placeholder:text-slate-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* LISTAGEM DE ALUNOS */}
        <div className="grid gap-4 sm:gap-6">
          {filteredStudents.map((student) => (
            <div key={student.id} className="bg-white rounded-[35px] sm:rounded-[40px] border border-slate-100 shadow-sm hover:shadow-[0_15px_40px_-15px_rgba(0,0,0,0.1)] hover:border-green-200 transition-all group relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-green-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="p-5 sm:p-6 lg:p-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                
                {/* DADOS DO ALUNO */}
                <div onClick={() => router.push(`/dashboard-coach/aluno/${student.id}/dieta-atual`)} className="flex items-center gap-5 sm:gap-6 cursor-pointer flex-1 w-full">
                  <div className="relative shrink-0">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-50 rounded-[25px] sm:rounded-[30px] flex items-center justify-center border-2 border-slate-100 overflow-hidden group-hover:border-green-500 transition-all shadow-inner">
                      {student.photoUrl ? (
                        <img 
                          src={student.photoUrl} 
                          alt={student.full_name} 
                          className={`w-full h-full object-cover ${student.photoPosition === 'top' ? 'object-top' : 'object-center'}`} 
                        />
                      ) : (
                        <UserIcon size={32} className="text-slate-300" />
                      )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 sm:w-7 sm:h-7 bg-green-500 border-4 border-white rounded-full shadow-sm"></div>
                  </div>

                  <div className="space-y-2 min-w-0 flex-1">
                    <h3 className="font-black uppercase italic text-xl sm:text-2xl leading-none text-slate-800 group-hover:text-green-600 transition-colors truncate pr-4">
                      {student.full_name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
                        <Target size={12} className="text-green-600" />
                        <span className="text-[9px] sm:text-[10px] font-black text-slate-600 uppercase tracking-widest truncate max-w-[100px] sm:max-w-none">
                          {student.goal || 'Performance'}
                        </span>
                      </div>
                      <span className="text-[10px] sm:text-[11px] font-black text-green-700 uppercase italic bg-green-50 px-3 py-1.5 rounded-full border border-green-100 whitespace-nowrap">
                        {student.weight ? `${student.weight}kg` : '-- kg'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* INDICADORES E BOTÃO AÇÃO */}
                <div className="flex items-center justify-between lg:justify-end gap-4 sm:gap-6 w-full lg:w-auto border-t lg:border-t-0 lg:border-l border-slate-100 pt-5 lg:pt-0 lg:pl-8">
                   
                   <div className="flex gap-3 sm:gap-6 flex-1 lg:flex-none justify-center">
                     <div className="flex flex-col items-center gap-1.5 sm:gap-2">
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-[14px] sm:rounded-2xl flex items-center justify-center transition-colors ${student.today_water > 0 ? 'bg-blue-50 text-blue-500 shadow-sm' : 'bg-slate-50 text-slate-200'}`}>
                          <Droplets size={20} className="sm:w-[22px] sm:h-[22px]" />
                        </div>
                        <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-400">Água</span>
                     </div>

                     <div className="flex flex-col items-center gap-1.5 sm:gap-2">
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-[14px] sm:rounded-2xl flex items-center justify-center transition-colors ${student.today_energy ? 'bg-amber-50 text-amber-500 shadow-sm' : 'bg-slate-50 text-slate-200'}`}>
                          <Zap size={20} className="sm:w-[22px] sm:h-[22px]" />
                        </div>
                        <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-400">Bio</span>
                     </div>

                     <div className="flex flex-col items-center gap-1.5 sm:gap-2">
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-[14px] sm:rounded-2xl flex items-center justify-center transition-colors ${student.today_free_meal ? 'bg-orange-50 text-orange-500 shadow-sm' : 'bg-slate-50 text-slate-200'}`}>
                          <Flame size={20} className={`sm:w-[22px] sm:h-[22px] ${student.today_free_meal ? "animate-pulse" : ""}`} />
                        </div>
                        <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-400">Furo</span>
                     </div>
                   </div>

                   <div className="flex gap-2"> {/* Agrupador para os botões ficarem lado a lado */}
  
  {/* BOTÃO WHATSAPP - SEGURO CONTRA ERROS */}
{student.phone && (
  <a 
    href={`https://wa.me/55${(student.phone || '').replace(/\D/g, '')}`}
    target="_blank"
    rel="noopener noreferrer"
    className="bg-green-500 text-white p-4 sm:p-5 rounded-[16px] sm:rounded-[20px] hover:bg-green-600 transition-all shadow-lg active:scale-90 shrink-0 flex items-center justify-center"
  >
    <MessageCircle size={20} className="sm:w-[24px] sm:h-[24px]" />
  </a>
)}

  <button 
    onClick={() => router.push(`/dashboard-coach/aluno/${student.id}`)} 
    className="bg-slate-900 text-white p-4 sm:p-5 rounded-[16px] sm:rounded-[20px] hover:bg-green-600 transition-all shadow-lg active:scale-90 shrink-0 flex items-center justify-center"
  >
    <Edit2 size={20} className="sm:w-[24px] sm:h-[24px]" />
  </button>
</div>
                </div>

              </div>
            </div>
          ))}
        </div>
      </main>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}