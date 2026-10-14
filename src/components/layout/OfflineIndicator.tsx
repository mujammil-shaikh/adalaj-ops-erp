import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle2, Clock } from 'lucide-react';
import { db } from '../../lib/storage';
import { OutboxItem } from '../../types';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [outbox, setOutbox] = useState<OutboxItem[]>([]);
  const [showDrawer, setShowDrawer] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      triggerSync();
    };
    const handleOffline = () => setIsOnline(false);

    const handleOutboxEvent = () => updateOutbox();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('adalaj-outbox-updated', handleOutboxEvent);

    // Initial outbox check
    updateOutbox();

    // Relaxed 30-second interval only when tab is actively visible (saves battery & CPU across 20-40 team devices)
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        updateOutbox();
      }
    }, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('adalaj-outbox-updated', handleOutboxEvent);
      clearInterval(interval);
    };
  }, []);

  const updateOutbox = () => {
    setOutbox(db.getOutbox());
  };

  const triggerSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      db.markAllSynced();
      updateOutbox();
      setIsSyncing(false);
    }, 900);
  };

  const pendingCount = outbox.filter((i) => !i.synced).length;

  return (
    <>
      <div className="flex items-center gap-1.5 text-xs">
        <button
          onClick={() => setShowDrawer(true)}
          className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-all ${
            !isOnline
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : pendingCount > 0
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
          title={!isOnline ? 'Offline Mode' : `${pendingCount} pending changes`}
        >
          {!isOnline ? (
            <>
              <WifiOff className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline font-medium">Offline</span>
            </>
          ) : (
            <>
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline text-slate-300 font-medium">Online</span>
            </>
          )}

          {pendingCount > 0 && (
            <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950">
              {pendingCount}
            </span>
          )}
        </button>
      </div>

      {showDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-2xl text-slate-100 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <RefreshCw className={`w-4 h-4 text-amber-400 ${isSyncing ? 'animate-spin' : ''}`} />
                <h3 className="text-sm font-semibold">Offline Outbox & Sync Status</h3>
              </div>
              <button
                onClick={() => setShowDrawer(false)}
                className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-slate-800"
              >
                Close
              </button>
            </div>

            <div className="p-3 my-2 rounded-lg bg-slate-950/60 border border-slate-800 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isOnline ? 'bg-emerald-500 shadow-emerald-500/50 shadow-sm' : 'bg-amber-500'
                  }`}
                />
                <span className="text-slate-300">
                  {isOnline ? 'Connected to Network' : 'Working Offline (IndexedDB Store Active)'}
                </span>
              </div>
              <button
                disabled={isSyncing || !isOnline}
                onClick={triggerSync}
                className="px-2.5 py-1 rounded bg-amber-500 text-slate-950 font-medium hover:bg-amber-400 disabled:opacity-40 disabled:pointer-events-none transition text-xs"
              >
                {isSyncing ? 'Syncing...' : 'Sync Now'}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 py-2 pr-1">
              <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                Recent Queue ({outbox.length} records)
              </div>
              {outbox.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-500">
                  All local movements, batches, and expenses are in sync.
                </div>
              ) : (
                outbox.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-lg border border-slate-800 bg-slate-950/40 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="font-medium text-slate-200 flex items-center gap-1.5">
                        <span className="capitalize text-amber-400">{item.entity}:</span>
                        <span>{item.payloadSummary}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                    <div>
                      {item.synced ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400">
                          <CheckCircle2 className="w-3 h-3" /> Synced
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 font-medium">
                          <Clock className="w-3 h-3" /> Pending
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
