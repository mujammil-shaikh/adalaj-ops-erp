import React, { useState } from 'react';
import { Download, Share2, X, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running standalone, do not show button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        aria-label="Install App"
        title="Install Adalaj Operations ERP on device"
        className={`inline-flex items-center gap-1.5 font-medium rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-sm active:scale-95 ${
          compact ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-xs'
        }`}
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          aria-label="Install on iOS"
          className={`inline-flex items-center gap-1.5 font-medium rounded-lg border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 transition-all ${
            compact ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-xs'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5 text-amber-400" />
          <span>Add to Screen</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-xl border border-slate-700 bg-slate-900 p-5 shadow-2xl text-slate-100">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-amber-400" />
                  <h3 className="text-sm font-semibold">Install on iPhone / iPad</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-3 space-y-2.5 text-xs text-slate-300">
                <p>To run Adalaj Operations ERP offline with full-screen access:</p>
                <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-800/60 border border-slate-700/50">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">1</span>
                  <span>Tap the <strong>Share</strong> button in Safari's bottom toolbar.</span>
                </div>
                <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-800/60 border border-slate-700/50">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">2</span>
                  <span>Scroll down and tap <strong>Add to Home Screen</strong>.</span>
                </div>
                <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-800/60 border border-slate-700/50">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">3</span>
                  <span>Tap <strong>Add</strong> at top right to launch standalone.</span>
                </div>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full rounded-lg bg-slate-800 hover:bg-slate-700 py-2 text-xs font-semibold text-slate-200 transition"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
