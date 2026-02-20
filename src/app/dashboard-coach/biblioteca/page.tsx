'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Copy, Loader2, Search, CalendarDays, Utensils, Users, CheckSquare, Square, X } from 'lucide-react';

export default function BibliotecaGlobalPage() {
  const router = useRouter();
  
  const [templates, setTemplates] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados de busca
  const [searchTemplate, setSearchTemplate] = useState('');
  const [searchStudent, setSearchStudent] = useState('');
  
  // Estados do Modal de Clonagem
  const [cloningTemplate, setCloningTemplate] = useState<any | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [isCloning, setIsCloning] = useState(false);

  // Carrega Templates e Alunos ao abrir a página
  useEffect(() => {
    async function loadData() {
      try {
        const [resTemplates, resStudents] = await Promise.all([
          fetch('/api/diet/templates'),
          fetch('/api/students/list')
        ]);
        
        if (resTemplates.ok) setTemplates(await resTemplates.json());
        if (resStudents.ok) setStudents(await resStudents.json());
      } catch (err) {
        console.error("Erro ao carregar dados", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId) 
        : [...prev, studentId]
    );
  };

  const handleConfirmClone = async () => {
    if (selectedStudents.length === 0) {
      alert("Selecione pelo menos um aluno para receber a dieta.");
      return;
    }

    setIsCloning(true);
    try {
      // Dispara a requisição de salvar dieta para TODOS os alunos selecionados ao mesmo tempo
      await Promise.all(selectedStudents.map(studentId => 
        fetch('/api/diet/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            studentId: studentId, 
            meals: cloningTemplate.content, 
            content: cloningTemplate.content 
          })
        })
      ));

      alert(`✅ DIETA CLONADA PARA ${selectedStudents.length} ALUNO(S)!`);
      setCloningTemplate(null);
      setSelectedStudents([]);
    } catch (err) {
      alert("Erro técnico ao tentar clonar as dietas.");
    } finally {
      setIsCloning(false);
    }
  };

  const filteredTemplates = templates.filter(t => 
    t.name.toLowerCase().includes(searchTemplate.toLowerCase())
  );

  const filteredStudents = students.filter(s =>
    s.full_name.toLowerCase().includes(searchStudent.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-[100dvh] bg-slate-50 flex flex-col items-center justify-center">
      <div className="w-16 h-16 border-8 border-green-600 border-t-transparent rounded-full animate-spin mb-4 shadow-[0_0_20px_rgba(22,163,74,0.3)]"></div>
      <p className="font-black uppercase italic tracking-widest text-green-500 text-sm">Acessando Cofre Global...</p>
    </div>
  );

  return (
    <div className="min-h-[100dvh] bg-slate-50 p-4 sm:p-6 pb-[env(safe-area-inset-bottom,24px)] text-black font-sans">
      
      {/* HEADER ELITE */}
      <header className="max-w-4xl mx-auto mb-6 sm:mb-8 flex justify-between items-center bg-white p-4 sm:p-5 rounded-[30px] border border-slate-200 shadow-sm relative overflow-hidden">
        <button onClick={() => router.back()} className="relative z-10 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] bg-slate-50 border border-slate-200 hover:border-green-400 p-3 sm:px-5 sm:py-3 rounded-[20px] flex items-center gap-2 hover:text-green-600 transition-all active:scale-95">
          <ChevronLeft size={16} /> <span className="hidden sm:inline">Voltar</span>
        </button>
        <div className="relative z-10 text-right flex items-center gap-4">
          <div className="text-right">
            <h1 className="text-2xl sm:text-3xl font-black uppercase italic tracking-tighter leading-none text-slate-900">
              Biblioteca <span className="text-green-600">Global</span>
            </h1>
            <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mt-1">Disparo em Massa</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto space-y-6">
        
        {/* BARRA DE PESQUISA */}
        <div className="relative group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-green-600 transition-colors" size={20} />
          <input 
            type="text"
            placeholder="Buscar template na sua biblioteca..."
            className="w-full p-5 pl-14 bg-white border border-slate-200 rounded-[20px] sm:rounded-[25px] font-bold text-sm sm:text-base outline-none shadow-sm focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all placeholder:text-slate-300 text-slate-800"
            value={searchTemplate}
            onChange={(e) => setSearchTemplate(e.target.value)}
          />
        </div>

        {/* LISTA DE TEMPLATES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {templates.length === 0 ? (
            <div className="col-span-full text-center p-12 border-2 border-dashed border-slate-300 rounded-[35px] bg-white shadow-sm">
               <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                 <Copy size={32} className="text-slate-300" />
               </div>
               <h3 className="text-xl font-black uppercase italic text-slate-400 mb-2">Seu Cofre está vazio</h3>
               <p className="text-sm font-bold text-slate-400 mb-6">Você ainda não salvou nenhuma dieta como template.</p>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="col-span-full text-center p-10 text-slate-400 font-bold bg-white rounded-[30px] border border-slate-100">Nenhum template encontrado com esse nome.</div>
          ) : (
            filteredTemplates.map((template) => (
              <div key={template.id} className="bg-white p-6 rounded-[30px] border border-slate-100 shadow-sm hover:shadow-[0_10px_30px_-15px_rgba(0,0,0,0.1)] hover:border-green-200 transition-all group flex flex-col justify-between relative overflow-hidden">
                <div className="absolute left-0 top-0 w-1.5 h-full bg-slate-200 group-hover:bg-green-500 transition-colors"></div>
                
                <div className="pl-2 mb-6">
                  <h3 className="text-2xl font-black uppercase italic text-slate-900 group-hover:text-green-600 transition-colors mb-3">
                    {template.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-slate-500 bg-slate-50 px-3 py-1.5 rounded-[10px] border border-slate-100">
                      <CalendarDays size={14} className="text-slate-400" /> {new Date(template.created_at).toLocaleDateString('pt-BR')}
                    </span>
                    <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-slate-500 bg-slate-50 px-3 py-1.5 rounded-[10px] border border-slate-100">
                      <Utensils size={14} className="text-slate-400" /> {template.content?.length || 0} Ciclos/Refeições
                    </span>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    setCloningTemplate(template);
                    setSelectedStudents([]); // Reseta a lista ao abrir
                  }}
                  className="w-full bg-slate-900 text-white px-6 py-4 rounded-[20px] font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 shadow-xl hover:bg-green-600 hover:shadow-green-500/30 transition-all active:scale-95"
                >
                  <Users size={16} className="text-green-400 group-hover:text-white transition-colors" /> SELECIONAR ALUNOS
                </button>
              </div>
            ))
          )}
        </div>
      </main>

      {/* MODAL DE SELEÇÃO DE ALUNOS (DISPARO EM MASSA) */}
      {cloningTemplate && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4">
          <div className="bg-white w-full max-w-lg h-[85vh] sm:h-[600px] rounded-t-[35px] sm:rounded-[40px] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 border border-slate-100">
            
            {/* Header do Modal */}
            <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-900 text-white relative">
              <button onClick={() => setCloningTemplate(null)} className="absolute top-5 right-5 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all"><X size={20}/></button>
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-green-400 mb-1">Clonando Template</h2>
              <h3 className="text-2xl font-black uppercase italic truncate pr-8">{cloningTemplate.name}</h3>
            </div>

            {/* Busca de Alunos */}
            <div className="p-4 border-b border-slate-100 bg-slate-50">
               <div className="flex items-center gap-3 bg-white border border-slate-200 p-3 rounded-[16px] focus-within:border-green-500 transition-all shadow-sm">
                  <Search className="text-slate-400" size={18}/>
                  <input placeholder="Procurar aluno..." className="flex-1 bg-transparent outline-none font-bold text-sm text-slate-800" value={searchStudent} onChange={(e) => setSearchStudent(e.target.value)} />
               </div>
            </div>

            {/* Lista de Alunos (Checkboxes) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-white">
              <button 
                onClick={() => {
                   if (selectedStudents.length === filteredStudents.length) setSelectedStudents([]);
                   else setSelectedStudents(filteredStudents.map(s => s.id));
                }}
                className="w-full text-left p-3 mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900"
              >
                {selectedStudents.length === filteredStudents.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
              </button>

              {filteredStudents.map(student => {
                const isSelected = selectedStudents.includes(student.id);
                return (
                  <button 
                    key={student.id} 
                    onClick={() => toggleStudentSelection(student.id)}
                    className={`w-full flex items-center justify-between p-4 rounded-[20px] border-2 transition-all active:scale-[0.98]
                      ${isSelected 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-slate-100 hover:border-slate-300'
                      }
                    `}
                  >
                    <span className={`font-black uppercase text-sm italic ${isSelected ? 'text-green-800' : 'text-slate-700'}`}>
                      {student.full_name}
                    </span>
                    {isSelected ? <CheckSquare size={20} className="text-green-600" /> : <Square size={20} className="text-slate-300" />}
                  </button>
                )
              })}
              {filteredStudents.length === 0 && <p className="text-center text-slate-400 font-bold mt-10">Nenhum aluno encontrado.</p>}
            </div>

            {/* Footer do Modal (Botão de Disparo) */}
            <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50">
              <button 
                onClick={handleConfirmClone}
                disabled={selectedStudents.length === 0 || isCloning}
                className="w-full bg-slate-900 text-white py-5 rounded-[20px] font-black uppercase tracking-[0.2em] text-xs shadow-xl flex items-center justify-center gap-3 hover:bg-green-600 transition-all disabled:opacity-50 disabled:scale-100 active:scale-95"
              >
                {isCloning ? (
                  <><Loader2 size={20} className="animate-spin text-green-400" /> DISPARANDO DIETAS...</>
                ) : (
                  <>
                    <Copy size={20} className={selectedStudents.length > 0 ? "text-green-400" : "text-slate-500"} /> 
                    CLONAR PARA {selectedStudents.length} ALUNO(S)
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}