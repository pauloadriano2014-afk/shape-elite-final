'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Plus, ChevronRight, Target, Search, Edit2, LogOut } from 'lucide-react';

export default function DashboardCoachPage() {
  const router = useRouter();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function loadStudents() {
      try {
        const res = await fetch('/api/students/list');
        if (res.ok) {
          const data = await res.json();
          setStudents(data);
        }
      } catch (err) {
        console.error("Erro na carga de alunos");
      } finally {
        setLoading(false);
      }
    }
    loadStudents();
  }, []);

  const handleLogout = () => {
    // Limpa a sessão e manda de volta para o login
    localStorage.removeItem('shape_user');
    router.push('/login');
  };

  const filteredStudents = students.filter(s => 
    s.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center font-black animate-pulse uppercase tracking-widest text-black italic">
        Sincronizando Time...
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6 text-black font-sans">
      <header className="max-w-4xl mx-auto mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter leading-none">
            Coach <span className="text-blue-600">Panel</span>
          </h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 italic">
            Gestão de Atletas de Elite
          </p>
        </div>
        
        <div className="flex gap-3">
          {/* BOTÃO DE LOGOUT ADICIONADO */}
          <button 
            onClick={handleLogout}
            className="bg-white text-red-500 border-2 border-red-100 p-4 rounded-2xl shadow-sm hover:bg-red-50 transition-all active:scale-90"
            title="Sair do Sistema"
          >
            <LogOut size={28} />
          </button>

          <button 
            onClick={() => router.push('/dashboard-coach/novo-aluno')}
            className="bg-black text-white p-4 rounded-2xl shadow-xl hover:bg-blue-600 transition-all active:scale-90"
            title="Cadastrar Novo Aluno"
          >
            <Plus size={28} />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto space-y-6">
        {/* BARRA DE PESQUISA */}
        <div className="relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
          <input 
            type="text"
            placeholder="BUSCAR ATLETA PELO NOME..."
            className="w-full p-6 pl-14 bg-white border-2 border-black rounded-[25px] font-black uppercase text-xs outline-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:shadow-[2px_2px_0px_0px_rgba(37,99,235,1)] transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* LISTA DE ALUNOS COM EDIÇÃO RÁPIDA */}
        <div className="grid gap-4">
          {filteredStudents.map((student) => (
            <div 
              key={student.id}
              className="bg-white p-6 rounded-[35px] border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex justify-between items-center group active:scale-[0.99] transition-all"
            >
              <div 
                onClick={() => router.push(`/dashboard-coach/aluno/${student.id}/dieta-atual`)}
                className="flex items-center gap-5 cursor-pointer flex-1"
              >
                <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center border-2 border-black group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Users size={24} />
                </div>
                <div>
                  <h3 className="font-black uppercase italic text-lg leading-none">{student.full_name}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-1">
                      <Target size={12} className="text-blue-600" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                        {student.goal}
                      </span>
                    </div>
                    <span className="text-[10px] font-black text-blue-600 uppercase italic">
                      {student.weight ? `${student.weight}kg` : '-- kg'}
                    </span>
                  </div>
                </div>
              </div>

              {/* BOTÃO DE EDIÇÃO INTEGRADO */}
              <button 
                onClick={() => router.push(`/dashboard-coach/aluno/${student.id}`)}
                className="bg-slate-50 p-4 rounded-2xl border-2 border-black hover:bg-black hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ml-4"
              >
                <Edit2 size={20} />
              </button>
            </div>
          ))}

          {filteredStudents.length === 0 && (
            <div className="py-20 text-center opacity-20 italic font-black uppercase tracking-[0.3em]">
              Nenhum atleta encontrado
            </div>
          )}
        </div>
      </main>
    </div>
  );
}