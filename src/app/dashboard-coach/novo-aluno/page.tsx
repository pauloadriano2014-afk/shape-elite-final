'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, UserPlus, Loader2, User, Mail, Target, Phone } from 'lucide-react';

export default function NovoAlunoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ full_name: '', email: '', phone: '', goal: 'Emagrecimento' });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/students/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        alert("✅ ATLETA INTEGRADO AO TIME!");
        router.push('/dashboard-coach');
      } else {
        alert("Erro ao cadastrar. Verifique se o email é único.");
      }
    } catch (err) {
      alert("Erro de conexão.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] overscroll-none bg-slate-50 p-6 flex flex-col items-center justify-center font-sans pb-[env(safe-area-inset-bottom,24px)] text-black">
      <div className="max-w-md w-full">
        <header className="mb-10 w-full relative">
          <button 
            onClick={() => router.back()} 
            className="absolute -top-12 left-0 text-slate-400 hover:text-green-600 transition-colors p-2 bg-white rounded-full shadow-sm border border-slate-100 flex items-center justify-center min-w-[40px] min-h-[40px]"
          >
            <ChevronLeft size={20} />
          </button>
          
          <div className="text-center mt-6">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Paulo Adriano Team</p>
            <h1 className="text-4xl sm:text-5xl font-black uppercase italic tracking-tighter leading-none text-slate-900">
              NOVO <span className="text-green-600">ALUNO</span>
            </h1>
          </div>
        </header>

        <main className="w-full">
          <form onSubmit={handleCreate} className="space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-[35px] sm:rounded-[40px] border border-slate-100 shadow-[0px_10px_30px_-15px_rgba(0,0,0,0.1)] space-y-5 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1.5 bg-green-600"></div>

               {/* Nome Completo */}
               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2 block">Nome Completo</label>
                 <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-green-600" size={18} />
                    <input 
                      required
                      type="text" 
                      placeholder="Digite o nome do aluno"
                      className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-500/10 rounded-[20px] outline-none font-bold text-sm sm:text-base text-slate-900 transition-all placeholder:text-slate-300" 
                      value={formData.full_name} 
                      onChange={e => setFormData({...formData, full_name: e.target.value})} 
                    />
                 </div>
               </div>

               {/* E-mail */}
               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2 block">E-mail de Acesso</label>
                 <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-green-600" size={18} />
                    <input 
                      required
                      type="email" 
                      placeholder="email@aluno.com"
                      className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-500/10 rounded-[20px] outline-none font-bold text-sm sm:text-base text-slate-900 transition-all placeholder:text-slate-300" 
                      value={formData.email} 
                      onChange={e => setFormData({...formData, email: e.target.value})} 
                    />
                 </div>
               </div>

               {/* NOVO: Telefone/WhatsApp */}
               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2 block">WhatsApp (Com DDD)</label>
                 <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-green-600" size={18} />
                    <input 
                      required
                      type="tel" 
                      placeholder="Ex: 41999999999"
                      className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-500/10 rounded-[20px] outline-none font-bold text-sm sm:text-base text-slate-900 transition-all placeholder:text-slate-300" 
                      value={formData.phone} 
                      onChange={e => setFormData({...formData, phone: e.target.value})} 
                    />
                 </div>
               </div>

               {/* Objetivo */}
               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2 block">Objetivo Principal</label>
                 <div className="relative">
                    <Target className="absolute left-4 top-1/2 -translate-y-1/2 text-green-600" size={18} />
                    <select 
                      className="w-full p-4 pl-12 pr-10 bg-slate-50 border border-slate-200 focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-500/10 rounded-[20px] outline-none font-bold text-sm sm:text-base text-slate-900 transition-all appearance-none cursor-pointer"
                      value={formData.goal}
                      onChange={e => setFormData({...formData, goal: e.target.value})}
                    >
                      <option>Emagrecimento</option>
                      <option>Hipertrofia</option>
                      <option>Definição</option>
                      <option>Performance</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                       <ChevronLeft size={16} className="-rotate-90" />
                    </div>
                 </div>
               </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-slate-900 text-white font-black p-5 sm:p-6 rounded-[25px] sm:rounded-[30px] uppercase tracking-[0.2em] text-[11px] sm:text-xs shadow-xl hover:bg-green-600 hover:shadow-green-500/30 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:scale-100 min-h-[60px]"
            >
              {loading ? (
                <><Loader2 size={20} className="animate-spin text-green-400" /> CADASTRANDO...</>
              ) : (
                <><UserPlus size={20} className="text-green-400" /> FINALIZAR CADASTRO</>
              )}
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}