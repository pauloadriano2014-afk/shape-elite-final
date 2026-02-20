'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { User, Mail, Lock, Phone, ArrowRight, Loader2 } from 'lucide-react';

export default function CadastroPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ 
    full_name: '', 
    email: '', 
    password: '',
    phone: '' 
  });

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
    <div className="min-h-[100dvh] bg-slate-900 flex items-center justify-center p-4 sm:p-6 font-sans relative overflow-x-hidden">
      
      {/* EFEITO DE LUZ NO FUNDO (GLOW ELITE) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[30rem] h-[30rem] bg-green-600 rounded-full blur-[150px] opacity-20 pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-500">
        
        {/* LOGO ELITE (ESTILO LOGIN - GRANDE E COM SOMBRA) */}
        <div className="flex justify-center mb-2 pt-[env(safe-area-inset-top)]">
          <div className="w-44 h-44 sm:w-52 sm:h-52 relative">
             <Image 
               src="/logo.png" 
               alt="Shape Elite Logo" 
               fill
               sizes="(max-width: 768px) 176px, 208px"
               className="object-contain drop-shadow-[0_15px_25px_rgba(22,163,74,0.4)]"
               priority
             />
          </div>
        </div>

        <div className="text-center mb-8">
          <p className="text-[10px] font-black text-green-400 uppercase tracking-[0.3em] bg-slate-800/60 px-4 py-1.5 rounded-full inline-block border border-green-500/20 backdrop-blur-md">
            Criação de Conta de Aluno
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="bg-white rounded-[35px] sm:rounded-[40px] p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-4 relative overflow-hidden">
             <div className="absolute left-0 top-0 h-full w-1.5 bg-green-500"></div>
             
             {/* CAMPO: NOME */}
             <div className="relative group">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-green-500 transition-colors" size={20} />
                <input 
                  required 
                  type="text" 
                  placeholder="NOME COMPLETO" 
                  className="w-full py-4 pr-4 pl-14 bg-slate-50 border border-slate-200 focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-500/10 rounded-[20px] outline-none font-bold text-sm sm:text-base text-slate-900 transition-all placeholder:text-slate-400 uppercase" 
                  value={formData.full_name} 
                  onChange={e => setFormData({...formData, full_name: e.target.value})} 
                />
             </div>

             {/* CAMPO: E-MAIL */}
             <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-green-500 transition-colors" size={20} />
                <input 
                  required 
                  type="email" 
                  placeholder="E-MAIL DE ACESSO" 
                  className="w-full py-4 pr-4 pl-14 bg-slate-50 border border-slate-200 focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-500/10 rounded-[20px] outline-none font-bold text-sm sm:text-base text-slate-900 transition-all placeholder:text-slate-400 uppercase" 
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})} 
                />
             </div>

             {/* CAMPO: WHATSAPP (A NOVIDADE) */}
             <div className="relative group">
                <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-green-500 transition-colors" size={20} />
                <input 
                  required 
                  type="tel" 
                  placeholder="WHATSAPP (DDD + NÚMERO)" 
                  className="w-full py-4 pr-4 pl-14 bg-slate-50 border border-slate-200 focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-500/10 rounded-[20px] outline-none font-bold text-sm sm:text-base text-slate-900 transition-all placeholder:text-slate-400 uppercase" 
                  value={formData.phone} 
                  onChange={e => setFormData({...formData, phone: e.target.value})} 
                />
             </div>

             {/* CAMPO: SENHA */}
             <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-green-500 transition-colors" size={20} />
                <input 
                  required 
                  type="password" 
                  placeholder="CRIE UMA SENHA" 
                  className="w-full py-4 pr-4 pl-14 bg-slate-50 border border-slate-200 focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-500/10 rounded-[20px] outline-none font-bold text-sm sm:text-base text-slate-900 transition-all placeholder:text-slate-400 uppercase" 
                  value={formData.password} 
                  onChange={e => setFormData({...formData, password: e.target.value})} 
                />
             </div>
          </div>
          
          <button 
            disabled={loading} 
            type="submit" 
            className="w-full bg-slate-900 text-white py-5 sm:py-6 rounded-[20px] sm:rounded-[25px] font-black uppercase tracking-[0.2em] text-xs sm:text-sm shadow-xl hover:bg-green-600 hover:shadow-green-500/30 transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-3"
          >
            {loading ? (
              <><Loader2 className="animate-spin text-green-400" size={20} /> CRIANDO CONTA...</>
            ) : (
              <>AVANÇAR PARA FICHA <ArrowRight size={20} className="text-green-400" /></>
            )}
          </button>
        </form>

        <p className="text-center mt-8 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
          Paulo Adriano Team © 2026
        </p>
      </div>
    </div>
  );
}