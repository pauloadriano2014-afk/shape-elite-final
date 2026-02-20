'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

export default function CadastroPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ full_name: '', email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erro no servidor");
      }

      const data = await res.json();
      localStorage.setItem('temp_student_id', data.id);
      router.push('/anamnese');
      
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] overscroll-none bg-slate-50 p-6 flex items-center justify-center font-sans text-black">
      <div className="max-w-md w-full">
        <header className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-black italic tracking-tighter text-slate-900 leading-none mb-2">
            SHAPE <span className="text-green-600">ELITE</span>
          </h1>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.3em]">Criação de Conta de Aluno</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-[35px] border border-slate-100 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.1)] space-y-4 relative overflow-hidden">
             <div className="absolute left-0 top-0 h-full w-1.5 bg-green-500"></div>
             
             <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-green-500 transition-colors" size={18} />
                <input required type="text" placeholder="Nome Completo" className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-500/10 rounded-[20px] outline-none font-bold text-sm sm:text-base text-slate-900 transition-all placeholder:text-slate-300" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
             </div>
             <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-green-500 transition-colors" size={18} />
                <input required type="email" placeholder="E-mail fornecido pelo Coach" className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-500/10 rounded-[20px] outline-none font-bold text-sm sm:text-base text-slate-900 transition-all placeholder:text-slate-300" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
             </div>
             <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-green-500 transition-colors" size={18} />
                <input required type="password" placeholder="Crie uma Senha" className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-500/10 rounded-[20px] outline-none font-bold text-sm sm:text-base text-slate-900 transition-all placeholder:text-slate-300" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
             </div>
          </div>
          
          <button disabled={loading} type="submit" className="w-full bg-slate-900 text-white p-5 sm:p-6 rounded-[25px] sm:rounded-[30px] font-black uppercase tracking-[0.2em] text-xs shadow-xl hover:bg-green-600 hover:shadow-green-500/30 transition-all active:scale-95 flex items-center justify-center gap-3">
            {loading ? <Loader2 className="animate-spin text-green-400" /> : <>Preencher Ficha <ArrowRight size={20} className="text-green-400" /></>}
          </button>
        </form>
      </div>
    </div>
  );
}