'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Lock, User, ArrowRight, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (res.ok) {
        const user = await res.json();
        
        // SALVA O USUÁRIO E O ID DELE NO NAVEGADOR
        localStorage.setItem('shape_user', JSON.stringify(user));

        if (user.role === 'coach') {
          router.push('/dashboard-coach');
        } else {
          router.push('/'); 
        }
      } else {
        alert("Acesso Negado: Verifique suas credenciais.");
      }
    } catch (err) {
      alert("Erro de conexão.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-slate-900 flex items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden">
      
      {/* EFEITO DE LUZ NO FUNDO (GLOW) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[30rem] h-[30rem] bg-green-600 rounded-full blur-[150px] opacity-20 pointer-events-none"></div>

      <div className="w-full max-w-md bg-white rounded-[35px] sm:rounded-[40px] p-6 sm:p-10 shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-500 border border-slate-100">
        
        {/* LOGO ELITE LIVRE (Sem círculo, maior e com sombra) */}
        <div className="flex justify-center mb-4">
          <div className="w-48 h-48 sm:w-56 sm:h-56 relative">
             <Image 
               src="/logo.png" 
               alt="Shape Elite Logo" 
               fill
               sizes="(max-width: 768px) 192px, 224px"
               className="object-contain drop-shadow-[0_15px_25px_rgba(22,163,74,0.3)]"
               priority
             />
          </div>
        </div>

        <div className="text-center mb-8">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] bg-slate-100 px-4 py-1.5 rounded-full inline-block">Acesso Restrito</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          
          {/* INPUT E-MAIL (Com espaçamento forçado: py-4 pr-4 pl-14) */}
          <div className="relative group">
            <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-green-500 transition-colors" size={22} />
            <input 
              type="email" 
              placeholder="SEU E-MAIL"
              className="w-full py-4 pr-4 pl-14 sm:py-5 sm:pr-5 sm:pl-16 bg-slate-50 border border-slate-200 focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-500/10 rounded-[20px] outline-none font-bold text-sm sm:text-base text-slate-900 transition-all placeholder:text-slate-400 uppercase"
              value={form.email}
              onChange={e => setForm({...form, email: e.target.value})}
              required
            />
          </div>

          {/* INPUT SENHA (Com espaçamento forçado) */}
          <div className="relative group">
            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-green-500 transition-colors" size={22} />
            <input 
              type="password" 
              placeholder="SUA SENHA"
              className="w-full py-4 pr-4 pl-14 sm:py-5 sm:pr-5 sm:pl-16 bg-slate-50 border border-slate-200 focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-500/10 rounded-[20px] outline-none font-bold text-sm sm:text-base text-slate-900 transition-all placeholder:text-slate-400 uppercase"
              value={form.password}
              onChange={e => setForm({...form, password: e.target.value})}
              required
            />
          </div>

          {/* BOTÃO DE LOGIN */}
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white py-5 sm:py-6 rounded-[20px] sm:rounded-[25px] font-black uppercase tracking-[0.2em] text-xs sm:text-sm hover:bg-green-600 shadow-xl shadow-slate-900/10 hover:shadow-green-600/30 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-70 disabled:scale-100 mt-2"
          >
            {loading ? (
              <><Loader2 className="animate-spin text-green-400" size={20} /> ACESSANDO...</>
            ) : (
              <>ENTRAR NO SISTEMA <ArrowRight size={20} className="text-green-400" /></>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}