/**
 * src/components/ErrorBoundary.tsx
 * React Error Boundary global: menangkap error render di mana pun di bawah
 * App dan menampilkan fallback UI bergaya santuari alih-alih layar putih.
 * Progres Kitsune tersimpan di localStorage & tidak tersentuh error render,
 * sehingga "Coba Lagi" (remount) aman dilakukan.
 */

import { Component, ErrorInfo } from 'react';
import type { ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Catat untuk debugging; info.componentStack menunjukkan pohon komponen.
    console.error('[HAGUMI ErrorBoundary] Render error:', error, info.componentStack);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[100dvh] bg-[#1c1815] text-stone-100 flex items-center justify-center p-4 font-['Zen_Maru_Gothic',sans-serif]">
          <div className="max-w-md w-full rounded-3xl bg-gradient-to-b from-[#251e18] via-[#1a1512] to-[#120e0b] border-2 border-amber-600/70 p-6 text-center shadow-2xl">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-950/80 border-2 border-amber-500/70 flex items-center justify-center text-3xl mb-3">
              ⛩️
            </div>
            <h1 className="text-lg font-bold font-['Shippori_Mincho',serif] text-amber-200">
              Kuil Sempat Gelap Sesaat...
            </h1>
            <p className="text-xs text-stone-400 mt-2 leading-relaxed">
              Terjadi kesalahan tak terduga saat menampilkan santuari. Tenang saja — progres
              Kitsune-mu tetap tersimpan aman di perangkat ini dan tidak hilang.
            </p>

            {this.state.error && (
              <pre className="mt-3 text-left text-[10px] leading-snug bg-black/50 border border-stone-800 rounded-xl p-2.5 overflow-auto max-h-28 text-rose-300 whitespace-pre-wrap break-words">
                {this.state.error.message}
              </pre>
            )}

            <div className="mt-4 grid grid-cols-2 gap-2.5">
              <button
                onClick={this.handleRetry}
                className="py-2.5 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-200 font-bold text-xs active:scale-95 transition-all cursor-pointer"
              >
                Coba Lagi
              </button>
              <button
                onClick={this.handleReload}
                className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-white font-extrabold text-xs shadow-lg active:scale-95 transition-all cursor-pointer"
              >
                Muat Ulang Halaman
              </button>
            </div>

            <p className="mt-3 text-[10px] text-stone-600 font-['Shippori_Mincho',serif]">
              深呼吸 — tarik napas perlahan, lalu coba lagi.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
