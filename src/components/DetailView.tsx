import React from 'react';
import { Button, Badge } from './ui';
import { Play, Power, ExternalLink, Download, Copy, Maximize2, AlertCircle } from 'lucide-react';

interface DetailViewProps {
  config: any;
  onRunNow: () => void;
  onToggleSync: (enabled: boolean) => void;
  onBack: () => void;
}

export const DetailView: React.FC<DetailViewProps> = ({ config, onRunNow, onToggleSync, onBack }) => {
  const mockImages = [
    { id: 1, url: 'https://placehold.co/600x337?text=Menu+Preview+1', timestamp: '2 mins ago' },
    { id: 2, url: 'https://placehold.co/600x337?text=Menu+Preview+2', timestamp: '15 mins ago' },
    { id: 3, url: 'https://placehold.co/600x337?text=Menu+Preview+3', timestamp: '32 mins ago' },
    { id: 4, url: 'https://placehold.co/600x337?text=Menu+Preview+4', timestamp: '1 hour ago' },
    { id: 5, url: 'https://placehold.co/600x337?text=Menu+Preview+5', timestamp: '2 hours ago' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Top Header */}
      <div className="flex justify-between items-start border-b border-gray-200 pb-6">
        <div>
          <button onClick={onBack} className="text-sm font-medium text-brand hover:underline mb-2 block">← Back to Dashboard</button>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-2xl font-bold text-gray-900">{config.accountName || 'Spectrio HQ'}</h2>
            <Badge variant="success">Active</Badge>
          </div>
          <p className="text-gray-500 font-medium">{config.deviceName || 'Entrance Lobby 01'}</p>
          <div className="flex items-center gap-4 mt-4 text-sm text-gray-600">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-gray-400 uppercase text-[10px] tracking-widest">Last Sync:</span>
              <span>2 mins ago</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-gray-400 uppercase text-[10px] tracking-widest">Next Run:</span>
              <span>In 3 mins</span>
            </div>
            <a href={config.contentUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-brand hover:underline">
              Visit URL <ExternalLink size={14} />
            </a>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center gap-2" onClick={() => onToggleSync(false)}>
            <Power size={18} className="text-success-600" />
            Enable Sync
          </Button>
          <Button onClick={onRunNow} className="flex items-center gap-2">
            <Play size={18} />
            Run Now
          </Button>
        </div>
      </div>

      {/* Image Gallery */}
      <section className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Latest Renderings</h3>
          <Button variant="ghost" size="sm">View All History</Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockImages.map((img) => (
            <div key={img.id} className="group bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all">
              <div className="aspect-video bg-gray-100 relative overflow-hidden">
                <img src={img.url} alt={`Render ${img.id}`} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  <button className="p-2 bg-white rounded-full text-gray-900 hover:bg-gray-100 shadow-lg">
                    <Maximize2 size={20} />
                  </button>
                  <button className="p-2 bg-white rounded-full text-gray-900 hover:bg-gray-100 shadow-lg" title="Download Image">
                    <Download size={20} />
                  </button>
                </div>
              </div>
              <div className="p-4 border-t border-gray-50 flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500">{img.timestamp}</span>
                <button className="text-brand hover:bg-brand-50 p-2 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider">
                  <Copy size={14} />
                  Copy S3 URL
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Error state example footer */}
      {config.status === 'Error' && (
        <div className="p-4 bg-error-50 border border-error-200 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-error-100 rounded-full text-error-600">
              <AlertCircle size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-error-900">Headless rendering failed for last run</p>
              <p className="text-xs text-error-700">Timeout while waiting for page load. Please check if the URL is accessible.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="bg-white">View Logs</Button>
            <Button variant="danger" size="sm">Retry Sync</Button>
          </div>
        </div>
      )}
    </div>
  );
};
