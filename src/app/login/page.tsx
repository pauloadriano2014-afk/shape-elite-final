'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, User, ArrowRight } from 'lucide-react';

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
    <div className="min-h-screen bg-black flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-white rounded-[40px] p-10 shadow-[0px_0px_40px_rgba(37,99,235,0.3)] border-4 border-blue-600">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-black">
            Shape <span className="text-blue-600">Natural</span>
          </h1>
          <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mt-2">Acesso Restrito</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="bg-slate-50 p-4 rounded-2xl border-2 border-black flex items-center gap-4">
            <User className="text-slate-400" />
            <input 
              type="email" 
              placeholder="SEU E-MAIL"
              className="bg-transparent font-black uppercase text-sm w-full outline-none text-black placeholder:text-slate-400"
              value={form.email}
              onChange={e => setForm({...form, email: e.target.value})}
              required
            />
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border-2 border-black flex items-center gap-4">
            <Lock className="text-slate-400" />
            <input 
              type="password" 
              placeholder="SUA SENHA"
              className="bg-transparent font-black uppercase text-sm w-full outline-none text-black placeholder:text-slate-400"
              value={form.password}
              onChange={e => setForm({...form, password: e.target.value})}
              required
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white p-5 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
          >
            {loading ? 'ACESSANDO...' : 'ENTRAR NO SISTEMA'} <ArrowRight size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}