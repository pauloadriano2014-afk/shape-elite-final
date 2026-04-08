'use client'

import React, { useEffect, useState } from 'react';
import { Share, Smartphone, CheckCircle, ArrowRight, Plus, MoreHorizontal, Trophy } from 'lucide-react';

interface InstallScreenProps {
  onContinue: () => void;
}

export default function InstallScreen({ onContinue }: InstallScreenProps) {
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isChromeIOS, setIsChromeIOS] = useState(false);
  const [hasJustInstalled, setHasJustInstalled] = useState(false); // NOVO RADAR DE INSTALAÇÃO

  useEffect(() => {
    const checkStandalone = () => {
      return (
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone ||
        document.referrer.includes('android-app://')
      );
    };

    if (checkStandalone()) {
      setIsStandalone(true);
      setTimeout(() => onContinue(), 600);
      return;
    }

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);
    
    if (isIOSDevice && /crios/.test(userAgent)) {
      setIsChromeIOS(true);
    }

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    // RADAR: Detecta quando o App termina de ser instalado no Android/Chrome!
    const installHandler = () => {
      setHasJustInstalled(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', installHandler);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installHandler);
    };
  }, [onContinue]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      // No Android as vezes o appinstalled já dispara, mas garantimos aqui também
      setTimeout(() => setHasJustInstalled(true), 1500); 
    }
  };

  if (isStandalone) {
    return (
      <div className="fixed inset-0 w-screen h-[100dvh] z-[9999] bg-slate-950 flex flex-col items-center justify-center p-6 text-center touch-none overscroll-none overflow-hidden">
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

  // TELA DE SUCESSO (MOSTRADA ASSIM QUE A INSTALAÇÃO TERMINA)
  if (hasJustInstalled) {
    return (
      <div className="fixed inset-0 w-screen h-[100dvh] z-[9999] bg-slate-950 flex flex-col items-center justify-center p-6 text-center touch-none overscroll-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-green-600 rounded-full blur-[150px] opacity-20 pointer-events-none"></div>
        <div className="w-24 h-24 bg-green-500 rounded-[30px] flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(22,163,74,0.4)] animate-in zoom-in duration-500">
          <Trophy size={48} className="text-white" />
        </div>
        <h2 className="text-white text-3xl font-black uppercase italic tracking-tighter leading-tight mb-4">
          INSTALAÇÃO<br/><span className="text-green-500">CONCLUÍDA!</span>
        </h2>
        <p className="text-slate-300 text-base font-medium max-w-xs mx-auto leading-relaxed">
          Você já pode fechar o navegador.<br/><br/>
          Vá até a tela inicial do seu celular, abra o app <strong className="text-white">Shape Elite</strong> e faça seu cadastro.
        </p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 w-screen h-[100dvh] z-[9999] bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden touch-none overscroll-none">
      <div className="absolute top-0 right-0 w-80 h-80 bg-green-600 rounded-full blur-[150px] opacity-20 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600 rounded-full blur-[150px] opacity-10 pointer-events-none"></div>
      
      <div className="w-full max-w-sm relative z-10 flex flex-col items-center">
        <img src="/logo.png" alt="Logo" className="w-24 h-24 mb-6 drop-shadow-[0_0_15px_rgba(34,197,94,0.3)]" />
        
        <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter text-center leading-none">
          SHAPE <span className="text-green-500">ELITE</span>
        </h1>
        <p className="text-slate-400 text-center mt-4 text-sm font-medium leading-relaxed">
          Instale o App oficial para ter acesso rápido ao seu plano e criar sua conta.
        </p>

        <div className="w-full mt-10 space-y-4">
          {isIOS ? (
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-[30px] shadow-xl">
              <h3 className="text-green-500 font-black uppercase text-[10px] tracking-[0.2em] mb-6 text-center">
                Como instalar no {isChromeIOS ? "Chrome" : "Safari"}
              </h3>
              
              {isChromeIOS ? (
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center shrink-0 border border-blue-500/20">
                      <Share size={18} className="text-blue-400" />
                    </div>
                    <p className="text-slate-300 text-xs leading-relaxed pt-1">
                      1. Toque em <span className="text-white font-bold">Compartilhar</span> na parte superior da tela.
                    </p>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center shrink-0 border border-slate-700">
                      <MoreHorizontal size={18} className="text-white" />
                    </div>
                    <p className="text-slate-300 text-xs leading-relaxed pt-1">
                      2. Toque em <span className="text-white font-bold">Ver mais</span>.
                    </p>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center shrink-0 border border-slate-700">
                      <Plus size={18} className="text-white" />
                    </div>
                    <p className="text-slate-300 text-xs leading-relaxed pt-1">
                      3. Selecione <span className="text-white font-bold">Adicionar à Tela de Início</span>.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center shrink-0 border border-slate-700">
                      <MoreHorizontal size={18} className="text-white" />
                    </div>
                    <p className="text-slate-300 text-xs leading-relaxed pt-1">
                      1. Toque nos <span className="text-white font-bold">3 pontinhos</span>.
                    </p>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center shrink-0 border border-blue-500/20">
                      <Share size={18} className="text-blue-400" />
                    </div>
                    <p className="text-slate-300 text-xs leading-relaxed pt-1">
                      2. Toque em <span className="text-white font-bold">Compartilhar</span> e depois em <span className="text-white font-bold">Ver mais</span>.
                    </p>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center shrink-0 border border-slate-700">
                      <Plus size={18} className="text-white" />
                    </div>
                    <p className="text-slate-300 text-xs leading-relaxed pt-1">
                      3. Selecione <span className="text-white font-bold">Adicionar à Tela de Início</span>.
                    </p>
                  </div>
                </div>
              )}

            </div>
          ) : (
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
            Já tenho conta (Entrar) <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}