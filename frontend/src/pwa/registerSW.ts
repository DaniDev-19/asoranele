import { registerSW } from 'virtual:pwa-register';

/**
 * Registra el Service Worker generado por vite-plugin-pwa con actualización automática.
 */
export function initPwaServiceWorker(): void {
  if (!('serviceWorker' in navigator)) return;

  const updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      // Con registerType: 'autoUpdate', se aplica la nueva versión al recargar
      void updateSW(true);
    },
    onOfflineReady() {
      // Aplicación lista para operar con caché offline
    },
    onRegisterError(error: unknown) {
      console.error('Error al registrar el Service Worker PWA:', error);
    },
  });
}
