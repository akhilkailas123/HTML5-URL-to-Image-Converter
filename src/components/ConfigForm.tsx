import React, { useState, useEffect } from 'react';
import { Button, Input } from './ui';
import { Search } from 'lucide-react';
import { api } from '../api';
import type { CreateDevicePayload, Device } from '../api';

const HARDCODED_DETAILS: Record<string, {
  accountName: string;
  deviceName: string;
  displayGroup: string;
  macAddress: string;
}> = {
  'a1-edu1': {
    accountName: 'test user',
    deviceName: 'hall',
    displayGroup: 'company',
    macAddress: '00:1A:2B:3C:4D:5E',
  },
  'a2-edu2': {
    accountName: 'user2',
    deviceName: 'monitor1',
    displayGroup: 'combain',
    macAddress: '00:2A:2B:2C:4D:5E',
  },
};

interface ConfigFormProps {
  onSave: (config: any) => void;
  onCancel: () => void;
  initialData?: Device | null;
  isEdit?: boolean;
}

export const ConfigForm: React.FC<ConfigFormProps> = ({ onSave, onCancel, initialData, isEdit }) => {
  const [formData, setFormData] = useState({
    accountId: '',
    deviceEDUID: '',
    contentUrl: '',
    displayGroupId: '',
    accountName: '',
    deviceName: '',
    displayGroup: '',
    macAddress: '',
    syncInterval: '5m' as '30s' | '1m' | '5m' | '10m' | '30m' | '1h',
    imageFormat: 'png' as 'png' | 'jpg',
    resolution: '1080p' as '1080p' | '4k',
  });

  const [details, setDetails] = useState<any>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Populate form when editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        accountId: initialData.accountId,
        deviceEDUID: initialData.deviceEDUID,
        contentUrl: initialData.contentUrl,
        displayGroupId: initialData.displayGroupId,
        accountName: initialData.accountName,
        deviceName: initialData.deviceName,
        displayGroup: initialData.displayGroup,
        macAddress: initialData.macAddress,
        syncInterval: initialData.syncInterval,
        imageFormat: initialData.imageFormat,
        resolution: initialData.resolution,
      });
      setDetails({
        accountName: initialData.accountName,
        deviceName: initialData.deviceName,
        displayGroup: initialData.displayGroup,
        macAddress: initialData.macAddress,
      });
    }
  }, [initialData]);

  const handleFetchDetails = () => {
    setIsFetching(true);

    setTimeout(() => {
      const key = `${formData.accountId}-${formData.deviceEDUID}`;
      const result = HARDCODED_DETAILS[key];

      if (!result) {
        setDetails(null);
        setIsFetching(false);
        return;
      }

      setDetails(result);
      setFormData(prev => ({
        ...prev,
        accountName: result.accountName,
        deviceName: result.deviceName,
        displayGroup: result.displayGroup,
        macAddress: result.macAddress,
      }));

      setIsFetching(false);
    }, 800);
  };

  const handleSave = async () => {
    setSaveError(null);
    setIsSaving(true);
    try {
      if (isEdit && initialData) {
        const patch = {
          deviceEDUID: formData.deviceEDUID,
          contentUrl: formData.contentUrl,
          displayGroupId: formData.displayGroupId,
          accountName: formData.accountName,
          deviceName: formData.deviceName,
          displayGroup: formData.displayGroup,
          macAddress: formData.macAddress,
          syncInterval: formData.syncInterval,
          imageFormat: formData.imageFormat,
          resolution: formData.resolution,
        };
        const updated = await api.updateDevice(initialData.accountId, patch);
        onSave(updated);
      } else {
        const payload: CreateDevicePayload = {
          accountId: formData.accountId,
          deviceEDUID: formData.deviceEDUID,
          contentUrl: formData.contentUrl,
          displayGroupId: formData.displayGroupId,
          accountName: formData.accountName || '',
          deviceName: formData.deviceName || '',
          displayGroup: formData.displayGroup || '',
          macAddress: formData.macAddress || '',
          syncInterval: formData.syncInterval,
          imageFormat: formData.imageFormat,
          resolution: formData.resolution,
        };
        const created = await api.createDevice(payload);
        onSave(created);
      }
    } catch (err: any) {
      setSaveError(err.message || 'Something went wrong');
    } finally {
      setIsSaving(false);
    }
  };

  const field = (key: keyof typeof formData) => ({
    value: formData[key] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setFormData(prev => ({ ...prev, [key]: e.target.value })),
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Account ID"
          placeholder="e.g. ACC-123"
          disabled={isEdit}
          {...field('accountId')}
        />
        <Input
          label="Device EDUID"
          placeholder="e.g. EDU-456"
          {...field('deviceEDUID')}
        />
        <Input
          label="Content URL"
          placeholder="https://menu.spectrio.com/..."
          className="col-span-2"
          {...field('contentUrl')}
        />
        <Input
          label="Display Group ID"
          placeholder="e.g. DG-789"
          {...field('displayGroupId')}
        />
        {!isEdit && (
          <div className="flex items-end">
            <Button
              variant="outline"
              className="w-full flex items-center gap-2"
              onClick={handleFetchDetails}
              disabled={!formData.accountId || !formData.deviceEDUID || isFetching}
            >
              {isFetching ? 'Fetching...' : <><Search size={18} /> Fetch Details</>}
            </Button>
          </div>
        )}
      </div>

      {details && (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 animate-in slide-in-from-top-2 duration-300">
          <h4 className="text-sm font-semibold text-gray-700 mb-3 border-b border-gray-200 pb-2">
            {isEdit ? 'Current Metadata' : 'Fetched Metadata'}
          </h4>
          <div className="grid grid-cols-2 gap-y-3 gap-x-4">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Account Name</p>
              <p className="text-sm text-gray-900">{details.accountName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Device Name</p>
              <p className="text-sm text-gray-900">{details.deviceName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Display Group</p>
              <p className="text-sm text-gray-900">{details.displayGroup}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">MAC Address</p>
              <p className="text-sm font-mono text-gray-900">{details.macAddress}</p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4 pt-4 border-t border-gray-100">
        <h4 className="text-sm font-semibold text-gray-700">Additional Settings</h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Sync Interval</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-brand focus:border-brand"
              value={formData.syncInterval}
              onChange={(e) => setFormData(prev => ({ ...prev, syncInterval: e.target.value as typeof formData.syncInterval }))}
            >
              <option value="30s">30 Seconds</option>
              <option value="1m">1 Minute</option>
              <option value="5m">5 Minutes</option>
              <option value="10m">10 Minutes</option>
              <option value="30m">30 Minutes</option>
              <option value="1h">1 Hour</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Image Format</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-brand focus:border-brand"
              value={formData.imageFormat}
              onChange={(e) => setFormData(prev => ({ ...prev, imageFormat: e.target.value as 'png' | 'jpg' }))}
            >
              <option value="png">PNG</option>
              <option value="jpg">JPG</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Resolution</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-brand focus:border-brand"
              value={formData.resolution}
              onChange={(e) => setFormData(prev => ({ ...prev, resolution: e.target.value as '1080p' | '4k' }))}
            >
              <option value="1080p">1080p</option>
              <option value="4k">4K</option>
            </select>
          </div>
        </div>
      </div>

      {saveError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {saveError}
        </div>
      )}

      <div className="flex justify-end gap-3 mt-8">
        <Button variant="outline" onClick={onCancel} disabled={isSaving}>Cancel</Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (isEdit ? 'Saving...' : 'Creating...') : (isEdit ? 'Save Changes' : 'Save Configuration')}
        </Button>
      </div>
    </div>
  );
};