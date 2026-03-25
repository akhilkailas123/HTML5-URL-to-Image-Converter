import React, { useState } from 'react';
import { Plus, Search, Filter, Eye, Edit2, Pause, Trash2 } from 'lucide-react';
import { Button, Badge } from './components/ui';
import { Modal } from './components/Modal';
import { ConfigForm } from './components/ConfigForm';
import { DetailView } from './components/DetailView';

const INITIAL_DATA = [
  { 
    id: 1, 
    accountName: 'Spectrio HQ', 
    deviceName: 'Entrance Lobby 01', 
    displayGroupName: 'Main Lobby Floor', 
    status: 'Active', 
    lastSync: '2 mins ago',
    contentUrl: 'https://menu.spectrio.com/hq-lobby'
  },
  { 
    id: 2, 
    accountName: 'Spectrio Tampa', 
    deviceName: 'Cafeteria A', 
    displayGroupName: 'Dining Area', 
    status: 'Syncing', 
    lastSync: '15 mins ago',
    contentUrl: 'https://menu.spectrio.com/tampa-cafe'
  },
  { 
    id: 3, 
    accountName: 'Spectrio Chicago', 
    deviceName: 'North Wing', 
    displayGroupName: 'Wayfinding', 
    status: 'Error', 
    lastSync: '1 hour ago',
    contentUrl: 'https://menu.spectrio.com/chi-north'
  },
];

const App: React.FC = () => {
  const [view, setView] = useState<'dashboard' | 'detail'>('dashboard');
  const [configs, setConfigs] = useState(INITIAL_DATA);
  const [selectedConfig, setSelectedConfig] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All Statuses');

  const handleAddConfig = (newConfig: any) => {
    setConfigs([...configs, { ...newConfig, id: Date.now(), status: 'Active', lastSync: 'Just now' }]);
    setIsModalOpen(false);
  };

  const handleViewDetails = (config: any) => {
    setSelectedConfig(config);
    setView('detail');
  };

  const filteredConfigs = configs.filter(c => {
    const matchesSearch = c.accountName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.deviceName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'All Statuses' || c.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center text-white font-bold">S</div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Rendering Manager</h1>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
            <Plus size={20} />
            Add Configuration
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {view === 'dashboard' ? (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Search by account or device name..." 
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent outline-none bg-white shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 bg-white shadow-sm">
                  <Filter size={18} className="text-gray-400" />
                  <select 
                    className="outline-none bg-transparent text-gray-700 font-medium cursor-pointer"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option>All Statuses</option>
                    <option>Active</option>
                    <option>Syncing</option>
                    <option>Error</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-[#F9FAFB] border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-sm text-gray-500 uppercase tracking-wider">Account Name</th>
                    <th className="px-6 py-4 font-semibold text-sm text-gray-500 uppercase tracking-wider">Device Name</th>
                    <th className="px-6 py-4 font-semibold text-sm text-gray-500 uppercase tracking-wider">Display Group</th>
                    <th className="px-6 py-4 font-semibold text-sm text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 font-semibold text-sm text-gray-500 uppercase tracking-wider">Last Sync</th>
                    <th className="px-6 py-4 font-semibold text-sm text-gray-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredConfigs.map((config) => (
                    <tr key={config.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-900">{config.accountName}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">{config.deviceName}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">{config.displayGroupName}</div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={config.status === 'Active' ? 'success' : config.status === 'Error' ? 'error' : 'warning'}>
                          {config.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                        {config.lastSync}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="sm" onClick={() => handleViewDetails(config)} title="View Details">
                            <Eye size={18} />
                          </Button>
                          <Button variant="ghost" size="sm" title="Edit">
                            <Edit2 size={18} />
                          </Button>
                          <Button variant="ghost" size="sm" title="Pause">
                            <Pause size={18} />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-error-600 hover:bg-error-50" title="Delete">
                            <Trash2 size={18} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredConfigs.length === 0 && (
                <div className="py-20 text-center">
                  <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                    <Search size={32} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">No configurations found</h3>
                  <p className="text-gray-500">Try adjusting your search or filters</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <DetailView 
            config={selectedConfig} 
            onBack={() => setView('dashboard')}
            onRunNow={() => alert('Triggering render run...')}
            onToggleSync={(enabled) => alert(`Sync ${enabled ? 'enabled' : 'disabled'}`)}
          />
        )}
      </main>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Add Rendering Configuration"
      >
        <ConfigForm 
          onCancel={() => setIsModalOpen(false)} 
          onSave={handleAddConfig}
        />
      </Modal>
    </div>
  );
};

export default App;
