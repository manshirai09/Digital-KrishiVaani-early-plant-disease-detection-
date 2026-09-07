import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw, CheckCircle2, Cloud, Sparkles } from 'lucide-react';
import { I18nService } from '../../services/i18nService';

interface OfflineBannerProps {
  isOffline?: boolean;
  onToggleOffline?: () => void;
  pendingCount?: number;
  onSync?: () => void;
  isSyncing?: boolean;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({
  isOffline = false,
  onToggleOffline,
  pendingCount = 0,
  onSync,
  isSyncing = false
}) => {
  const [langCode, setLangCode] = useState(I18nService.getCurrentLanguage());

  useEffect(() => {
    return I18nService.subscribe(code => setLangCode(code));
  }, []);

  // Only render if explicitly in simulated offline mode or if there are pending scans to sync
  if (!isOffline && (!pendingCount || pendingCount === 0)) return null;

  return (
    <div
      id="offline-status-banner"
      className={`px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs border-b transition-all ${
        isOffline
          ? 'bg-amber-500/10 border-amber-500/30 text-amber-950'
          : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-950'
      }`}
    >
      <div className="flex items-center gap-2.5">
        <div className={`p-1.5 rounded-lg ${isOffline ? 'bg-amber-600 text-white' : 'bg-emerald-600 text-white'}`}>
          {isOffline ? <WifiOff className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
        </div>
        <div>
          <span className="font-bold text-xs">
            {isOffline ? I18nService.t('offlineModeText') : I18nService.t('offlineSyncedText')}
          </span>
          <span className="text-slate-600 ml-1.5 hidden sm:inline">
            {isOffline
              ? I18nService.t('offlineModeText')
              : pendingCount > 0
              ? `${pendingCount} ${I18nService.t('syncScansBtn')}`
              : I18nService.t('offlineSyncedText')}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {pendingCount > 0 && onSync && (
          <button
            id="sync-pending-btn"
            type="button"
            onClick={onSync}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs shadow-2xs transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Saving...' : `${I18nService.t('syncScansBtn')} (${pendingCount})`}</span>
          </button>
        )}

        {onToggleOffline && (
          <button
            id="toggle-offline-btn"
            type="button"
            onClick={onToggleOffline}
            className="px-2.5 py-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 font-bold text-xs text-slate-700 transition-colors cursor-pointer shadow-2xs"
          >
            {isOffline ? I18nService.t('goOnlineBtn') : 'Offline'}
          </button>
        )}
      </div>
    </div>
  );
};
