'use client'

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Sparkles, User } from 'lucide-react';

export default function NutriChat({ studentName, protocols }: { studentName: string, protocols: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([
    { role: 'assistant', content: `Olá, ${studentName.split(' ')[0]}! Sou seu assistente Shape Natural. Qual sua dúvida sobre a dieta de hoje?` }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch('/api/ai/nutri-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, protocols, studentName })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.result }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Ops, falha na conexão." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40 border-4 border-white"
      >
        <MessageCircle size={28} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-24 sm:right-6 sm:w-[400px] sm:h-[600px] bg-white z-50 flex flex-col shadow-2xl sm:rounded-[30px] overflow-hidden border border-slate-200 animate-in slide-in-from-bottom-5">
          <div className="bg-slate-900 p-5 text-white flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg"><Sparkles size={20} /></div>
              <div>
                <h3 className="font-black uppercase text-xs tracking-widest leading-none">Assistente Nutri</h3>
                <span className="text-[10px] text-blue-400 font-bold uppercase">Shape Natural Elite</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20} /></button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50 custom-scrollbar">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-[20px] text-sm font-medium leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start italic text-[10px] text-slate-400 gap-2 items-center px-2">
                <Loader2 size={12} className="animate-spin" /> Coach está pensando...
              </div>
            )}
          </div>

          <div className="p-4 bg-white border-t border-slate-100 flex gap-2">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Pergunte sobre sua dieta..."
              className="flex-1 bg-slate-100 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all"
            />
            <button onClick={sendMessage} className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center hover:bg-blue-600 transition-colors shadow-lg active:scale-95">
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}