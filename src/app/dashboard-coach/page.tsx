'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, Plus, ChevronRight, Target, Search, Edit2, LogOut, 
  Droplets, Zap, Flame, User as UserIcon, Activity, CheckCircle2, TrendingUp
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
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 border-8 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6 shadow-[0_0_20px_rgba(37,99,235,0.3)]"></div>
        <p className="font-black uppercase tracking-[0.4em] text-blue-500 italic text-xl">Sincronizando Elite...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6 text-black font-sans pb-24">
      
      <header className="max-w-5xl mx-auto mb-12 flex justify-between items-center bg-white p-6 rounded-[35px] border-2 border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Paulo Adriano Team</p>
          </div>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter leading-none">
            Coach <span className="text-blue-600">Panel</span>
          </h1>
        </div>
        
        <div className="flex gap-4">
          <button onClick={handleLogout} className="bg-slate-50 text-slate-400 border-2 border-slate-100 p-4 rounded-2xl hover:text-red-500 transition-all active:scale-90">
            <LogOut size={24} />
          </button>
          <button onClick={() => router.push('/dashboard-coach/novo-aluno')} className="bg-black text-white p-4 rounded-2xl shadow-xl hover:bg-blue-600 transition-all active:scale-95 flex items-center gap-2">
            <Plus size={24} />
            <span className="font-black uppercase text-xs hidden sm:inline">Novo Atleta</span>
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-blue-600 p-6 rounded-[30px] text-white shadow-lg">
                <Users size={24} className="mb-4 opacity-50" />
                <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Time Total</p>
                <h3 className="text-3xl font-black italic">{totalStudents} Atletas</h3>
            </div>
            <div className="bg-white p-6 rounded-[30px] border-2 border-slate-100 shadow-sm">
                <Droplets size={24} className="mb-4 text-blue-500" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ativos Hoje</p>
                <h3 className="text-3xl font-black italic text-slate-800">{activeToday} Check-ins</h3>
            </div>
            <div className="bg-white p-6 rounded-[30px] border-2 border-slate-100 shadow-sm">
                <TrendingUp size={24} className="mb-4 text-green-500" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status do Time</p>
                <h3 className="text-3xl font-black italic text-slate-800">Em Evolução</h3>
            </div>
        </div>

        <div className="relative group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={22} />
          <input 
            type="text"
            placeholder="PESQUISAR ATLETA NO SISTEMA..."
            className="w-full p-8 pl-16 bg-white border-2 border-slate-100 rounded-[35px] font-black uppercase text-xs outline-none shadow-sm focus:border-blue-600 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid gap-6">
          {filteredStudents.map((student) => (
            <div key={student.id} className="bg-white rounded-[45px] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-blue-200 transition-all group relative overflow-hidden">
              <div className="p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                
                <div onClick={() => router.push(`/dashboard-coach/aluno/${student.id}/dieta-atual`)} className="flex items-center gap-8 cursor-pointer flex-1">
                  <div className="relative shrink-0">
                    <div className="w-24 h-24 bg-slate-100 rounded-[30px] flex items-center justify-center border-4 border-slate-50 overflow-hidden group-hover:border-blue-600 transition-all shadow-inner">
                      {student.photoUrl ? (
                        <img 
                          src={student.photoUrl} 
                          alt={student.full_name} 
                          className={`w-full h-full object-cover ${student.photoPosition === 'top' ? 'object-top' : 'object-center'}`} 
                        />
                      ) : (
                        <UserIcon size={40} className="text-slate-300" />
                      )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-500 border-4 border-white rounded-full"></div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-black uppercase italic text-2xl leading-none text-slate-800 group-hover:text-blue-600 transition-colors">
                      {student.full_name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2 bg-slate-100 px-4 py-1.5 rounded-full border border-slate-200">
                        <Target size={14} className="text-blue-600" />
                        <span className="text-[11px] font-black text-slate-600 uppercase tracking-tighter">
                          {student.goal || 'Performance'}
                        </span>
                      </div>
                      <span className="text-[12px] font-black text-blue-600 uppercase italic bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100">
                        {student.weight ? `${student.weight}kg` : '-- kg'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 w-full md:w-auto border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-10">
                   <div className="flex flex-col items-center gap-2">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${student.today_water > 0 ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-200'}`}>
                        <Droplets size={22} />
                      </div>
                      <span className="text-[9px] font-black uppercase text-slate-400">Água</span>
                   </div>

                   <div className="flex flex-col items-center gap-2">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${student.today_energy ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-200'}`}>
                        <Zap size={22} />
                      </div>
                      <span className="text-[9px] font-black uppercase text-slate-400">Bio</span>
                   </div>

                   <div className="flex flex-col items-center gap-2">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${student.today_free_meal ? 'bg-orange-100 text-orange-600' : 'bg-slate-50 text-slate-200'}`}>
                        <Flame size={22} className={student.today_free_meal ? "animate-bounce" : ""} />
                      </div>
                      <span className="text-[9px] font-black uppercase text-slate-400">Furo</span>
                   </div>

                   <div className="flex gap-3 ml-6">
                      <button onClick={() => router.push(`/dashboard-coach/aluno/${student.id}`)} className="bg-slate-900 text-white p-5 rounded-2xl hover:bg-blue-600 transition-all shadow-lg">
                        <Edit2 size={24} />
                      </button>
                   </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}