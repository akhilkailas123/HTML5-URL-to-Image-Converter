import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Filter, Eye, Edit2, RefreshCw, Trash2, RotateCcw } from 'lucide-react';
import { Button, Badge } from './components/ui';
import { Modal } from './components/Modal';
import { ConfigForm } from './components/ConfigForm';
import { DetailView } from './components/DetailView';
import { api } from './api';
import type { Device } from './api';

const App: React.FC = () => {
  const [view, setView] = useState<'dashboard' | 'detail'>('dashboard');
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editDevice, setEditDevice] = useState<Device | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All Statuses');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchDevices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getAllDevices();
      setDevices(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load devices');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  const handleAddConfig = async (payload: any) => {
    await fetchDevices();
    setIsModalOpen(false);
  };

  const handleEditConfig = async (payload: any) => {
    await fetchDevices();
    setEditDevice(null);
    setIsModalOpen(false);
  };

  const handleViewDetails = (device: Device) => {
    setSelectedDevice(device);
    setView('detail');
  };

  const handleOpenEdit = (device: Device) => {
    setEditDevice(device);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditDevice(null);
  };

  const handleSync = async (accountId: string) => {
    try {
      setSyncingId(accountId);
      await api.syncDevice(accountId);
      await fetchDevices();
    } catch (err: any) {
      alert(`Sync failed: ${err.message}`);
    } finally {
      setSyncingId(null);
    }
  };

  const handleDelete = async (accountId: string) => {
    if (!window.confirm('Are you sure you want to delete this device?')) return;
    try {
      setDeletingId(accountId);
      await api.deleteDevice(accountId);
      setDevices(prev => prev.filter(d => d.accountId !== accountId));
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSyncAll = async () => {
    try {
      setLoading(true);
      await api.syncAll();
      await fetchDevices();
    } catch (err: any) {
      alert(`Sync all failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formatLastSync = (iso?: string) => {
    if (!iso) return '—';
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins} min${mins > 1 ? 's' : ''} ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
    return new Date(iso).toLocaleDateString();
  };

  const statusVariant = (status?: string) => {
    if (status === 'active') return 'success';
    if (status === 'error') return 'error';
    return 'warning';
  };

  const filteredDevices = devices.filter(d => {
    const matchesSearch =
      d.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.deviceName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === 'All Statuses' ||
      d.status?.toLowerCase() === filterStatus.toLowerCase();
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
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleSyncAll} className="flex items-center gap-2" disabled={loading}>
              <RotateCcw size={18} />
              Sync All
            </Button>
            <Button onClick={() => { setEditDevice(null); setIsModalOpen(true); }} className="flex items-center gap-2">
              <Plus size={20} />
              Add Configuration
            </Button>
          </div>
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

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">
                {error} —{' '}
                <button onClick={fetchDevices} className="underline">Retry</button>
              </div>
            )}

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
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-20 text-center text-gray-500 text-sm">Loading devices...</td>
                    </tr>
                  ) : filteredDevices.map((device) => (
                    <tr key={device.accountId} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-900">{device.accountName}</div>
                        <div className="text-xs text-gray-400 font-mono">{device.accountId}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">{device.deviceName}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">{device.displayGroup}</div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={statusVariant(device.status)}>
                          {device.status ? device.status.charAt(0).toUpperCase() + device.status.slice(1) : '—'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                        {formatLastSync(device.lastSync)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="sm" onClick={() => handleViewDetails(device)} title="View Details">
                            <Eye size={18} />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(device)} title="Edit">
                            <Edit2 size={18} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Sync"
                            disabled={syncingId === device.accountId}
                            onClick={() => handleSync(device.accountId)}
                          >
                            <RefreshCw size={18} className={syncingId === device.accountId ? 'animate-spin' : ''} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-error-600 hover:bg-error-50"
                            title="Delete"
                            disabled={deletingId === device.accountId}
                            onClick={() => handleDelete(device.accountId)}
                          >
                            <Trash2 size={18} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!loading && filteredDevices.length === 0 && (
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
          selectedDevice && (
            <DetailView
              config={selectedDevice}
              onBack={() => { setView('dashboard'); fetchDevices(); }}
              onRunNow={() => handleSync(selectedDevice.accountId)}
              onToggleSync={(enabled) => alert(`Sync ${enabled ? 'enabled' : 'disabled'}`)}
              formatLastSync={formatLastSync}
            />
          )
        )}
      </main>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editDevice ? 'Edit Configuration' : 'Add Rendering Configuration'}
      >
        <ConfigForm
          onCancel={handleCloseModal}
          onSave={editDevice ? handleEditConfig : handleAddConfig}
          initialData={editDevice}
          isEdit={!!editDevice}
        />
      </Modal>
    </div>
  );
};

export default App;