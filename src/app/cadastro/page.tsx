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
      // Salva o ID para a Anamnese
      localStorage.setItem('temp_student_id', data.id);
      router.push('/anamnese');
      
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center font-sans">
      <div className="max-w-md w-full">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-black italic tracking-tighter text-slate-900">
            SHAPE <span className="text-blue-600">NATURAL</span>
          </h1>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Nova conta de Aluno</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="bg-white p-8 rounded-[40px] border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-4">
             <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-900" size={18} />
                <input required type="text" placeholder="Nome Completo" className="w-full p-4 pl-12 bg-slate-50 border-2 border-slate-200 focus:border-blue-600 rounded-2xl outline-none font-bold text-slate-900 transition-all" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
             </div>
             <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-900" size={18} />
                <input required type="email" placeholder="E-mail" className="w-full p-4 pl-12 bg-slate-50 border-2 border-slate-200 focus:border-blue-600 rounded-2xl outline-none font-bold text-slate-900 transition-all" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
             </div>
             <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-900" size={18} />
                <input required type="password" placeholder="Senha de Acesso" className="w-full p-4 pl-12 bg-slate-50 border-2 border-slate-200 focus:border-blue-600 rounded-2xl outline-none font-bold text-slate-900 transition-all" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
             </div>
          </div>
          <button disabled={loading} type="submit" className="w-full bg-black text-white p-6 rounded-[30px] font-black uppercase italic flex items-center justify-center gap-3 shadow-[6px_6px_0px_0px_rgba(37,99,235,1)] hover:bg-blue-600 transition-all active:scale-95">
            {loading ? <Loader2 className="animate-spin" /> : <>Continuar para Ficha <ArrowRight size={20} /></>}
          </button>
        </form>
      </div>
    </div>
  );
}