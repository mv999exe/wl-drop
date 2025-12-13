/**
 * API client configuration and endpoints
 */

// Detect server URL dynamically from current location
const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.host}`;
  }
  return 'http://localhost:8000';
};

const BASE_URL = getBaseURL();
const API_BASE_URL = `${BASE_URL}/api`;
const WS_BASE_URL = BASE_URL.replace('http://', 'ws://').replace('https://', 'wss://') + '/ws';

export const API_ENDPOINTS = {
  // Device endpoints
  DEVICES: `${API_BASE_URL}/devices`,
  DEVICE_BY_ID: (id: string) => `${API_BASE_URL}/devices/${id}`,
  RECEIVERS: `${API_BASE_URL}/devices/receivers`,
  
  // File endpoints
  UPLOAD_FILE: `${API_BASE_URL}/files/upload`,
  UPLOAD_MULTIPLE: `${API_BASE_URL}/files/upload-multiple`,
  DOWNLOAD_TRANSFER: (transferId: string) => `${API_BASE_URL}/files/download/${transferId}`,
  DOWNLOAD_FILE: (transferId: string, filePath: string) => 
    `${API_BASE_URL}/files/download/${transferId}/${encodeURIComponent(filePath)}`,
  
  // Transfer endpoints
  INITIATE_TRANSFER: `${API_BASE_URL}/transfers/initiate`,
  GET_TRANSFER: (transferId: string) => `${API_BASE_URL}/transfers/${transferId}`,
  ACCEPT_TRANSFER: (transferId: string) => `${API_BASE_URL}/transfers/${transferId}/accept`,
  REJECT_TRANSFER: (transferId: string) => `${API_BASE_URL}/transfers/${transferId}/reject`,
  DELETE_TRANSFER: (transferId: string) => `${API_BASE_URL}/transfers/${transferId}`,
  
  // Health check
  HEALTH: `${API_BASE_URL}/health`,
};

export const getWebSocketURL = (clientId: string) => {
  return `${WS_BASE_URL}/${clientId}`;
};

export const getServerURL = () => {
  return API_BASE_URL.replace('/api', '');
};
