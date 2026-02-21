'use client'

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Sparkles, HelpCircle } from 'lucide-react';

export default function NutriChat({ studentName, protocols }: { studentName: string, protocols: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // BOTÕES DE RESPOSTAS RÁPIDAS (ONBOARDING)
  const quickReplies = [
    { icon: "🔥", text: "Como usar o Furo da Dieta?" },
    { icon: "📸", text: "Como funciona o Check-in?" },
    { icon: "🤖", text: "Para que serve a IA Scan?" },
    { icon: "💧", text: "Importância de bater a Água?" },
    { icon: "📈", text: "Para que serve o Biofeedback?" }
  ];

  useEffect(() => {
    if (studentName && messages.length === 0) {
      setMessages([
        { role: 'assistant', content: `Fala, ${studentName.split(' ')[0]}! Sou seu Coach Virtual. Selecione uma opção abaixo para entender como usar o app, ou me pergunte algo sobre a sua dieta de hoje:` }
      ]);
    }
  }, [studentName]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen, loading]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const sendMessage = async (messageText: string = input) => {
    if (!messageText.trim() || loading) return;
    
    const userMsg = messageText;
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
      setMessages(prev => [...prev, { role: 'assistant', content: "Ops, falha na conexão com o Coach. Tente novamente." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!isOpen && (
        <button 
          id="nutrichat-trigger"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-[110px] right-4 sm:right-6 w-14 h-14 bg-green-600 text-white rounded-full shadow-[0_10px_25px_rgba(22,163,74,0.4)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-[160] border-4 border-white"
        >
          <MessageCircle size={26} />
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-[200] flex sm:items-end justify-center sm:justify-end sm:p-6 overscroll-none">
          <div className="absolute inset-0 bg-slate-900/60 sm:hidden backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          
          <div className="bg-white w-full h-[100dvh] sm:h-[600px] sm:w-[400px] flex flex-col relative z-10 sm:rounded-[40px] shadow-2xl overflow-hidden animate-in slide-in-from-bottom sm:slide-in-from-bottom-10 duration-300 border border-slate-100 pb-[env(safe-area-inset-bottom,0px)]">
            
            <div className="bg-slate-900 p-5 sm:p-6 pt-[max(env(safe-area-inset-top,1.5rem),1.5rem)] text-white flex justify-between items-center shrink-0 border-b-4 border-green-600 relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-600 rounded-full blur-[60px] opacity-20 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
              
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 bg-white/10 border border-white/5 rounded-[18px] flex items-center justify-center text-green-400 shadow-lg shrink-0">
                  <Sparkles size={22} className="animate-pulse" />
                </div>
                <div>
                  <h3 className="font-black uppercase text-sm tracking-widest leading-none mb-1">Coach Virtual</h3>
                  <span className="text-[9px] text-green-400 font-bold uppercase tracking-[0.2em]">Shape Natural Elite</span>
                </div>
              </div>
              
              <button 
                onClick={() => setIsOpen(false)} 
                className="relative z-10 p-3 bg-white/10 hover:bg-red-500 rounded-full transition-colors shrink-0 active:scale-90 min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                <X size={20} className="text-white" />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 bg-slate-50 custom-scrollbar">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 sm:p-5 rounded-[25px] text-[13px] sm:text-sm font-semibold leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-green-600 text-white rounded-br-sm' : 'bg-white text-slate-800 rounded-bl-sm border border-slate-200'}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start italic text-[11px] font-bold uppercase text-slate-400 gap-2 items-center px-4 py-2 bg-slate-100 w-fit rounded-full animate-pulse border border-slate-200">
                  <Loader2 size={14} className="animate-spin text-green-600" /> Analisando...
                </div>
              )}
            </div>

            <div className="bg-white border-t border-slate-100 flex flex-col shrink-0">
              <div className="flex gap-2 overflow-x-auto p-3 no-scrollbar border-b border-slate-50">
                {quickReplies.map((reply, idx) => (
                  <button
                    key={idx}
                    onClick={() => sendMessage(reply.text)}
                    disabled={loading}
                    className="flex items-center gap-1.5 whitespace-nowrap bg-slate-50 border border-slate-200 hover:border-green-400 hover:bg-green-50 px-4 py-2 rounded-full text-[10px] font-black uppercase text-slate-600 transition-all active:scale-95 disabled:opacity-50"
                  >
                    <span className="text-sm">{reply.icon}</span> {reply.text}
                  </button>
                ))}
              </div>

              <div className="p-4 sm:p-5 flex gap-3">
                <input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Pergunte sobre sua dieta..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-[20px] px-5 py-4 text-sm font-bold text-slate-800 focus:border-green-500 focus:bg-white outline-none transition-all placeholder:text-slate-300"
                />
                <button 
                  onClick={() => sendMessage()} 
                  disabled={!input.trim() || loading}
                  className="w-[56px] h-[56px] shrink-0 bg-slate-900 text-white rounded-[20px] flex items-center justify-center hover:bg-green-600 transition-all shadow-xl active:scale-90 disabled:opacity-50 disabled:scale-100"
                >
                  <Send size={22} className="ml-1 text-green-400" />
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}