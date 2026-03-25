const BASE_URL = 'http://127.0.0.1:3000';

export interface Device {
  accountId: string;
  deviceEDUID: string;
  contentUrl: string;
  displayGroupId: string;
  accountName: string;
  deviceName: string;
  displayGroup: string;
  macAddress: string;
  syncInterval: '30s' | '1m' | '5m' | '10m' | '30m' | '1h';
  imageFormat: 'png' | 'jpg';
  resolution: '1080p' | '4k';
  status?: 'active' | 'syncing' | 'error';
  screenshots?: string[];
  lastSync?: string;
}

export type CreateDevicePayload = Omit<Device, 'status' | 'screenshots' | 'lastSync'>;
export type UpdateDevicePayload = Partial<Omit<Device, 'accountId' | 'screenshots' | 'lastSync' | 'status'>>;

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', accept: 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  getAllDevices: () => request<Device[]>('/devices'),

  getDevice: (accountId: string) => request<Device>(`/devices/${accountId}`),

  createDevice: (payload: CreateDevicePayload) =>
    request<Device>('/devices', { method: 'POST', body: JSON.stringify(payload) }),

  updateDevice: (accountId: string, payload: UpdateDevicePayload) =>
    request<Device>(`/devices/${accountId}`, { method: 'PATCH', body: JSON.stringify(payload) }),

  deleteDevice: (accountId: string) =>
    request<void>(`/devices/${accountId}`, { method: 'DELETE' }),

  syncDevice: (accountId: string) =>
    request<Device>(`/devices/sync/${accountId}`, { method: 'POST' }),

  syncAll: () => request<Device[]>('/devices/sync-all', { method: 'POST' }),
};