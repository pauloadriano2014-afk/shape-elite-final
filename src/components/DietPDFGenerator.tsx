'use client'

import { FileDown, Loader2 } from 'lucide-react';
import { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function DietPDFGenerator({ studentName, protocols }: { studentName: string, protocols: any[] }) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    setIsGenerating(true);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    let currentY = margin;

    const renderArea = document.getElementById('diet-pdf-render-area');
    if (!renderArea) return;
    renderArea.style.display = 'block';

    try {
      // 1. Cabeçalho Principal (Correção do nome e design limpo)
      const headerElem = document.createElement('div');
      headerElem.style.width = "750px";
      headerElem.style.padding = "20px 30px";
      headerElem.style.borderBottom = "5px solid #2563eb";
      headerElem.style.fontFamily = "sans-serif";
      headerElem.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h1 style="font-size: 32px; font-weight: 900; color: #0f172a; text-transform: uppercase; font-style: italic; margin: 0;">SHAPE NATURAL</h1>
            <p style="font-size: 12px; color: #64748b; font-weight: bold; margin: 0; text-transform: uppercase;">Consultoria Paulo Adriano</p>
          </div>
          <div style="text-align: right;">
            <p style="font-size: 14px; font-weight: 900; color: #2563eb; margin: 0;">ALUNO: ${studentName.toUpperCase()}</p>
            <p style="font-size: 10px; color: #94a3b8; margin: 0;">Emissão: ${new Date().toLocaleDateString('pt-BR')}</p>
          </div>
        </div>
      `;
      renderArea.appendChild(headerElem);
      const canvasHeader = await html2canvas(headerElem, { scale: 2 });
      const headerH = (canvasHeader.height * (pdfWidth - (margin * 2))) / canvasHeader.width;
      pdf.addImage(canvasHeader.toDataURL('image/jpeg', 0.8), 'JPEG', margin, currentY, pdfWidth - (margin * 2), headerH);
      currentY += headerH + 10;
      renderArea.removeChild(headerElem);

      // 2. Loop pelos Protocolos
      for (const protocol of protocols) {
        const pTitle = document.createElement('div');
        pTitle.style.width = "750px";
        pTitle.style.padding = "15px 30px";
        // AJUSTE: Removido o prefixo "PROTOCOL:"
        pTitle.innerHTML = `<div style="background: #0f172a; color: #fff; padding: 14px 25px; border-radius: 12px; font-size: 20px; font-weight: 900; text-transform: uppercase; font-family: sans-serif; text-align: center; letter-spacing: 2px;">${protocol.name}</div>`;
        renderArea.appendChild(pTitle);
        const canvasP = await html2canvas(pTitle, { scale: 2 });
        const pTitleH = (canvasP.height * (pdfWidth - (margin * 2))) / canvasP.width;

        if (currentY + pTitleH > pdfHeight - margin) { pdf.addPage(); currentY = margin; }
        pdf.addImage(canvasP.toDataURL('image/jpeg', 0.8), 'JPEG', margin, currentY, pdfWidth - (margin * 2), pTitleH);
        currentY += pTitleH + 10;
        renderArea.removeChild(pTitle);

        for (const meal of protocol.meals) {
          const mealCard = document.createElement('div');
          mealCard.style.width = "750px";
          mealCard.style.padding = "20px 30px";
          mealCard.style.fontFamily = "sans-serif";
          mealCard.innerHTML = `
            <div style="background: #fff; border: 2px solid #f1f5f9; border-radius: 25px; padding: 25px; border-left: 12px solid #2563eb; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
              <div style="display: flex; gap: 15px; align-items: center; margin-bottom: 15px; border-bottom: 2px solid #f1f5f9; padding-bottom: 12px;">
                <span style="font-size: 16px; font-weight: 900; color: #2563eb; background: #eff6ff; padding: 5px 15px; border-radius: 10px;">${meal.time}</span>
                <h3 style="font-size: 20px; font-weight: 900; text-transform: uppercase; color: #1e293b; margin: 0; font-style: italic;">${meal.title}</h3>
              </div>
              <div style="margin-bottom: 10px;">
                ${meal.items.map((item: any) => `
                  <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 15px; color: #334155;">
                    <span style="font-weight: 600;">• ${item.name}</span>
                    <span style="font-weight: 900; color: #0f172a;">${item.amount}${item.unit}</span>
                  </div>
                  ${item.substitutes?.length > 0 ? `
                    <div style="margin: 6px 0 15px 20px; font-size: 11px; color: #64748b; background: #f8fafc; padding: 8px 15px; border-radius: 10px; border-left: 4px solid #3b82f6;">
                      <b style="color: #3b82f6; text-transform: uppercase;">Opções de Troca:</b> ${item.substitutes.map((s: any) => `${s.name} (${s.amount}${s.unit})`).join(' | ')}
                    </div>
                  ` : ''}
                `).join('')}
              </div>
              ${meal.observations ? `<div style="background: #fffbeb; border: 1px solid #fef3c7; color: #b45309; padding: 12px; border-radius: 12px; font-size: 12px; font-weight: 700; margin-top: 15px;">ESTRATÉGIA: ${meal.observations}</div>` : ''}
            </div>
          `;
          renderArea.appendChild(mealCard);
          const canvasM = await html2canvas(mealCard, { scale: 2 });
          const mH = (canvasM.height * (pdfWidth - (margin * 2))) / canvasM.width;

          if (currentY + mH > pdfHeight - margin) { pdf.addPage(); currentY = margin; }
          pdf.addImage(canvasM.toDataURL('image/jpeg', 0.8), 'JPEG', margin, currentY, pdfWidth - (margin * 2), mH);
          currentY += mH + 8;
          renderArea.removeChild(mealCard);
        }
      }
      pdf.save(`Plano Alimentar - ${studentName}.pdf`);
    } catch (error) { console.error(error); } finally { renderArea.style.display = 'none'; setIsGenerating(false); }
  };

  return (
    <button onClick={generatePDF} disabled={isGenerating} className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase hover:bg-blue-600 transition-all">
      {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <FileDown size={14} />} BAIXAR DIETA
      <div id="diet-pdf-render-area" style={{ display: 'none', position: 'absolute', left: '-9999px', top: '0' }}></div>
    </button>
  );
}