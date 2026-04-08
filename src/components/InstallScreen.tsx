'use client'

import React, { useEffect, useState } from 'react';
import { Share, Download, Smartphone, CheckCircle, ArrowRight, Plus } from 'lucide-react';

interface InstallScreenProps {
  onContinue: () => void;
}

export default function InstallScreen({ onContinue }: InstallScreenProps) {
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // 1. Detectar se já está instalado (Modo Standalone)
    const checkStandalone = () => {
      return (
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone ||
        document.referrer.includes('android-app://')
      );
    };

    if (checkStandalone()) {
      setIsStandalone(true);
      // Se já estiver instalado, chama o onContinue (que vai pro Login) após um delay curto
      setTimeout(() => onContinue(), 600);
      return;
    }

    // 2. Detectar se é iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));

    // 3. Capturar evento de instalação para Android/Chrome
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [onContinue]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  if (isStandalone) {
    return (
      <div className="fixed inset-0 z-[9999] bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6 border border-green-500/50 animate-pulse">
          <CheckCircle size={40} className="text-green-500" />
        </div>
        <h2 className="text-white text-2xl font-black uppercase italic tracking-tighter">
          Ambiente <span className="text-green-500">Elite</span>
        </h2>
        <p className="text-slate-400 text-sm mt-2">Sincronizando sua performance...</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Luz de fundo */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-green-600 rounded-full blur-[150px] opacity-20 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600 rounded-full blur-[150px] opacity-10 pointer-events-none"></div>
      
      <div className="w-full max-w-sm relative z-10 flex flex-col items-center py-10">
        <img src="/logo.png" alt="Logo" className="w-24 h-24 mb-6 drop-shadow-[0_0_15px_rgba(34,197,94,0.3)]" />
        
        {/* NOME CORRIGIDO AQUI */}
        <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter text-center leading-none">
          SHAPE <span className="text-green-500">ELITE</span>
        </h1>
        <p className="text-slate-400 text-center mt-4 text-sm font-medium leading-relaxed">
          Instale o App oficial para ter acesso rápido ao seu plano e notificações do Coach.
        </p>

        <div className="w-full mt-10 space-y-4">
          {isIOS ? (
            /* INSTRUÇÕES iOS */
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-[30px] shadow-xl">
              <h3 className="text-green-500 font-black uppercase text-[10px] tracking-[0.2em] mb-6 text-center">
                Como instalar no iPhone
              </h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center shrink-0 border border-blue-500/20">
                    <Share size={20} className="text-blue-400" />
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed pt-1">
                    1. Clique no ícone de <span className="text-white font-bold">Compartilhar</span> na barra do Safari.
                  </p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center shrink-0 border border-slate-700">
                    <Plus size={20} className="text-white" />
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed pt-1">
                    2. Role a lista e selecione <span className="text-white font-bold">Adicionar à Tela de Início</span>.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* BOTÃO ANDROID / CHROME */
            <button
              onClick={handleInstallClick}
              className="w-full bg-green-600 hover:bg-green-500 text-white font-black uppercase tracking-widest py-5 rounded-[22px] flex items-center justify-center gap-3 shadow-[0_15px_30px_-10px_rgba(22,163,74,0.4)] transition-all active:scale-95"
            >
              <Smartphone size={20} />
              Instalar App Agora
            </button>
          )}

          <button 
            onClick={onContinue}
            className="w-full py-4 mt-2 text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-[0.2em] transition-colors flex items-center justify-center gap-2"
          >
            Continuar pelo navegador <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}