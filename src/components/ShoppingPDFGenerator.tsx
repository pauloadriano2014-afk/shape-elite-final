'use client'

import { FileText, Loader2, FileDown } from 'lucide-react';
import { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function ShoppingPDFGenerator({ studentName, shoppingList }: { studentName: string, shoppingList: any }) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    const element = document.getElementById('shopping-pdf-render-area');
    if (!element) return;
    
    setIsGenerating(true);
    element.style.display = 'block';

    try {
      const canvas = await html2canvas(element, { 
        scale: 2, 
        useCORS: true, 
        backgroundColor: '#ffffff',
        windowWidth: 800 
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 0.7);
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      // Ajuste para caber em uma única página mantendo a proporção
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const finalWidth = imgWidth * ratio;
      const finalHeight = imgHeight * ratio;

      const marginX = (pdfWidth - finalWidth) / 2;
      
      pdf.addImage(imgData, 'JPEG', marginX, 5, finalWidth, finalHeight, undefined, 'FAST');
      pdf.save(`Mercado - ${studentName}.pdf`);
    } catch (error) {
      console.error("Erro ao gerar PDF do mercado:", error);
    } finally {
      element.style.display = 'none';
      setIsGenerating(false);
    }
  };

  return (
    <>
      <button 
        onClick={(e) => { e.stopPropagation(); generatePDF(); }}
        className="bg-white/10 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase flex items-center gap-2 hover:bg-white/20 border border-white/10 transition-all"
      >
        {isGenerating ? <Loader2 size={12} className="animate-spin" /> : <FileDown size={12} />} 
        GERAR PDF
      </button>

      {/* ÁREA DE RENDERIZAÇÃO 1 ITEM POR LINHA */}
      <div id="shopping-pdf-render-area" style={{ 
        display: 'none', 
        width: '190mm', 
        fontFamily: 'sans-serif',
        backgroundColor: '#fff',
        position: 'absolute',
        left: '-9999px'
      }}>
        <div style={{ padding: '15mm' }}>
          {/* Cabeçalho */}
          <div style={{ borderBottom: '4px solid #2563eb', paddingBottom: '15px', marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', textTransform: 'uppercase', fontStyle: 'italic', margin: 0 }}>Lista de Mercado</h1>
              <p style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold', margin: 0 }}>Shape Natural Elite</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '14px', fontWeight: '900', color: '#2563eb', margin: 0 }}>{studentName.toUpperCase()}</p>
              <p style={{ fontSize: '10px', color: '#94a3b8', margin: 0 }}>{new Date().toLocaleDateString('pt-BR')}</p>
            </div>
          </div>

          {/* Listagem em Coluna Única */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            {Object.keys(shoppingList).map((category, idx) => (
              <div key={idx} style={{ pageBreakInside: 'avoid' }}>
                <h3 style={{ 
                  fontSize: '15px', 
                  fontWeight: '900', 
                  color: '#2563eb', 
                  textTransform: 'uppercase', 
                  marginBottom: '10px', 
                  borderBottom: '2px solid #e2e8f0', 
                  paddingBottom: '5px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  {category}
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {shoppingList[category].map((item: any, i: number) => (
                    <div key={i} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '8px 0', 
                      borderBottom: '1px dashed #f1f5f9'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                        {/* Caixinha de marcação alinhada */}
                        <div style={{ 
                          width: '16px', 
                          height: '16px', 
                          border: '2px solid #cbd5e1', 
                          borderRadius: '4px',
                          flexShrink: 0
                        }}></div>
                        <span style={{ 
                          fontSize: '13px', 
                          fontWeight: '700', 
                          color: '#334155',
                          textTransform: 'uppercase'
                        }}>
                          {item.name}
                        </span>
                      </div>
                      <span style={{ 
                        fontWeight: '900', 
                        color: '#0f172a', 
                        fontSize: '13px',
                        backgroundColor: '#f8fafc',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        minWidth: '60px',
                        textAlign: 'right'
                      }}>
                        {item.amount} {item.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '40px', paddingTop: '15px', borderTop: '1px solid #f1f5f9', textAlign: 'center' }}>
            <p style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Paulo Adriano TEAM - O resultado vem da constância
            </p>
          </div>
        </div>
      </div>
    </>
  );
}