import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const DISMISS_STORAGE_KEY = 'asoranele_pwa_banner_dismissed';

function isAppInstalled(): boolean {
  if (typeof window === 'undefined') return false;
  const isStandaloneMedia = window.matchMedia('(display-mode: standalone)').matches;
  const isIosStandalone =
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
  return isStandaloneMedia || isIosStandalone;
}

export function InstallPwaBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState<boolean>(() => isAppInstalled());
  const [dismissed, setDismissed] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(DISMISS_STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(display-mode: standalone)');

    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setInstalled(true);
        setDeferredPrompt(null);
      }
    };

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      if (!isAppInstalled()) {
        setDeferredPrompt(e as BeforeInstallPromptEvent);
      }
    };

    const handleAppInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };

    mediaQuery.addEventListener('change', handleDisplayModeChange);
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      mediaQuery.removeEventListener('change', handleDisplayModeChange);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  if (installed || dismissed || !deferredPrompt) {
    return null;
  }

  const handleInstall = async () => {
    setIsInstalling(true);
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setInstalled(true);
      }
      setDeferredPrompt(null);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem(DISMISS_STORAGE_KEY, '1');
    } catch {
      // Ignorar si sessionStorage no está disponible
    }
  };

  return (
    <aside
      aria-label="Instalar aplicación"
      className="fixed bottom-20 inset-x-3 z-40 lg:bottom-6 lg:left-auto lg:right-6 lg:w-96 animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div className="relative overflow-hidden rounded-2xl border border-violet-200 bg-white/95 p-4 shadow-xl shadow-violet-900/10 backdrop-blur-md">
        <div className="flex items-start gap-3">
          <img
            src="/logo.webp"
            alt="Asoranele Gracia Divina"
            className="h-12 w-12 shrink-0 rounded-xl border border-violet-100 bg-violet-50 object-contain p-1"
          />

          <div className="min-w-0 flex-1 pr-5">
            <h3 className="text-sm font-bold text-slate-900 leading-tight">
              Instalar Asoranele Gracia Divina
            </h3>
            <p className="mt-1 text-xs text-slate-600 leading-relaxed">
              Lleva el catálogo de pulseras, manualidades, víveres e inventario directo en tu pantalla de inicio.
            </p>
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Cerrar aviso de instalación"
            title="Cerrar aviso de instalación"
            className="cursor-pointer absolute right-2.5 top-2.5 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-3.5 flex items-center justify-end gap-2">
          <button
            type="button"
            title="Descartar aviso de instalación"
            onClick={handleDismiss}
            className="cursor-pointer min-h-9 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Ahora no
          </button>
          <button
            type="button"
            title="Instalar Asoranele Gracia Divina como aplicación"
            onClick={handleInstall}
            disabled={isInstalling}
            className="cursor-pointer inline-flex min-h-9 items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm shadow-violet-600/20 hover:bg-violet-700 disabled:opacity-50 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            {isInstalling ? 'Instalando...' : 'Instalar App'}
          </button>
        </div>
      </div>
    </aside>
  );
}
