"""
API client configuration and endpoints
"""

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws';

export const API_ENDPOINTS = {
  // Device endpoints
  DEVICES: `${API_BASE_URL}/devices`,
  DEVICE_BY_ID: (id: string) => `${API_BASE_URL}/devices/${id}`,
  RECEIVERS: `${API_BASE_URL}/devices/receivers`,
  
  // File endpoints
  UPLOAD_FILE: `${API_BASE_URL}/files/upload`,
  UPLOAD_MULTIPLE: `${API_BASE_URL}/files/upload-multiple`,
  DOWNLOAD_TRANSFER: (transferId: string) => `${API_BASE_URL}/files/download/${transferId}`,
  DOWNLOAD_FILE: (transferId: string, fileName: string) => 
    `${API_BASE_URL}/files/download/${transferId}/${fileName}`,
  
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
