import React, { useState } from 'react';
import { Button, Badge } from './ui';
import { Play, Power, ExternalLink, Download, Copy, Maximize2, AlertCircle } from 'lucide-react';
import type { Device } from '../api';

interface DetailViewProps {
  config: Device;
  onRunNow: () => void;
  onToggleSync: (enabled: boolean) => void;
  onBack: () => void;
  formatLastSync: (iso?: string) => string;
}

export const DetailView: React.FC<DetailViewProps> = ({
  config,
  onRunNow,
  onToggleSync,
  onBack,
  formatLastSync,
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  const screenshots = config.screenshots ?? [];

  const handleRunNow = async () => {
    setIsSyncing(true);
    try {
      await onRunNow();
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const handleDownload = (filePath: string) => {
    // Convert local file path to a downloadable URL if served statically,
    // otherwise open in new tab as fallback
    window.open(filePath, '_blank');
  };

  const statusVariant = (status?: string) => {
    if (status === 'active') return 'success';
    if (status === 'error') return 'error';
    return 'warning';
  };

  const statusLabel = config.status
    ? config.status.charAt(0).toUpperCase() + config.status.slice(1)
    : '—';

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Lightbox */}
      {lightboxSrc && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightboxSrc(null)}
        >
          <img
            src={lightboxSrc}
            alt="Screenshot fullscreen"
            className="max-w-full max-h-full rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Top Header */}
      <div className="flex justify-between items-start border-b border-gray-200 pb-6">
        <div>
          <button onClick={onBack} className="text-sm font-medium text-brand hover:underline mb-2 block">
            ← Back to Dashboard
          </button>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-2xl font-bold text-gray-900">{config.accountName}</h2>
            <Badge variant={statusVariant(config.status)}>{statusLabel}</Badge>
          </div>
          <p className="text-gray-500 font-medium">{config.deviceName}</p>
          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-600">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-gray-400 uppercase text-[10px] tracking-widest">Last Sync:</span>
              <span>{formatLastSync(config.lastSync)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-gray-400 uppercase text-[10px] tracking-widest">Resolution:</span>
              <span>{config.resolution}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-gray-400 uppercase text-[10px] tracking-widest">Format:</span>
              <span className="uppercase">{config.imageFormat}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-gray-400 uppercase text-[10px] tracking-widest">Interval:</span>
              <span>{config.syncInterval}</span>
            </div>
            <a
              href={config.contentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-brand hover:underline"
            >
              Visit URL <ExternalLink size={14} />
            </a>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => onToggleSync(config.status !== 'active')}
          >
            <Power size={18} className="text-success-600" />
            {config.status === 'active' ? 'Disable Sync' : 'Enable Sync'}
          </Button>
          <Button onClick={handleRunNow} className="flex items-center gap-2" disabled={isSyncing}>
            <Play size={18} />
            {isSyncing ? 'Running...' : 'Run Now'}
          </Button>
        </div>
      </div>

      {/* Device Metadata */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Account ID', value: config.accountId },
          { label: 'Device EDUID', value: config.deviceEDUID },
          { label: 'Display Group', value: config.displayGroup },
          { label: 'MAC Address', value: config.macAddress, mono: true },
          { label: 'Display Group ID', value: config.displayGroupId },
          { label: 'Account Name', value: config.accountName },
        ].map(({ label, value, mono }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 px-4 py-3 shadow-sm">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
            <p className={`text-sm text-gray-900 break-all ${mono ? 'font-mono' : 'font-medium'}`}>{value || '—'}</p>
          </div>
        ))}
      </section>

      {/* Screenshot Gallery */}
      <section className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">
            Latest Renderings
            <span className="ml-2 text-sm font-normal text-gray-400">({screenshots.length})</span>
          </h3>
          <Button variant="ghost" size="sm" onClick={handleRunNow} disabled={isSyncing}>
            {isSyncing ? 'Syncing...' : 'Refresh Renders'}
          </Button>
        </div>

        {screenshots.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-xl border border-gray-200">
            <p className="text-gray-500 text-sm">No screenshots yet. Click <strong>Run Now</strong> to generate renders.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {screenshots.map((filePath, idx) => {
              // Backend returns absolute file paths; convert to a usable URL
              // Assumes backend serves /screenshots statically at http://127.0.0.1:3000/screenshots/
              const fileName = filePath.replace(/\\/g, '/').split('/').pop();
              const imgUrl = `http://127.0.0.1:3000/screenshots/${fileName}`;

              return (
                <div
                  key={idx}
                  className="group bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all"
                >
                  <div className="aspect-video bg-gray-100 relative overflow-hidden">
                    <img
                      src={imgUrl}
                      alt={`Render ${idx + 1}`}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://placehold.co/600x337?text=Render+${idx + 1}`;
                      }}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                      <button
                        className="p-2 bg-white rounded-full text-gray-900 hover:bg-gray-100 shadow-lg"
                        onClick={() => setLightboxSrc(imgUrl)}
                      >
                        <Maximize2 size={20} />
                      </button>
                      <button
                        className="p-2 bg-white rounded-full text-gray-900 hover:bg-gray-100 shadow-lg"
                        title="Download Image"
                        onClick={() => handleDownload(imgUrl)}
                      >
                        <Download size={20} />
                      </button>
                    </div>
                  </div>
                  <div className="p-4 border-t border-gray-50 flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500 truncate max-w-[140px]" title={fileName}>
                      {fileName}
                    </span>
                    <button
                      className="text-brand hover:bg-brand-50 p-2 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider"
                      onClick={() => handleCopy(imgUrl)}
                    >
                      <Copy size={14} />
                      {copiedUrl === imgUrl ? 'Copied!' : 'Copy URL'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Error Banner */}
      {config.status === 'error' && (
        <div className="p-4 bg-error-50 border border-error-200 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-error-100 rounded-full text-error-600">
              <AlertCircle size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-error-900">Headless rendering failed for last run</p>
              <p className="text-xs text-error-700">
                Timeout while waiting for page load. Please check if the URL is accessible.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="danger" size="sm" onClick={handleRunNow} disabled={isSyncing}>
              {isSyncing ? 'Retrying...' : 'Retry Sync'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};