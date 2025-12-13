import { DeviceType, UserProfile } from '../types';

const ADJECTIVES = ['Cosmic', 'Swift', 'Neon', 'Digital', 'Silent', 'Brave', 'Hyper', 'Sonic', 'Rapid', 'Turbo'];
const NOUNS = ['Falcon', 'Fox', 'Panda', 'Eagle', 'Badger', 'Wolf', 'Tiger', 'Shark', 'Otter', 'Lynx'];

/**
 * Generate a UUID v4 with fallback for browsers that don't support crypto.randomUUID
 */
export const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  
  // Fallback implementation
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const generateRandomName = (): string => {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  return `${adj} ${noun}`;
};

export const detectDeviceType = (): DeviceType => {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return DeviceType.TABLET;
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return DeviceType.MOBILE;
  }
  return DeviceType.DESKTOP;
};

// Simple persistent storage wrapper
export const storage = {
  getUser: (): UserProfile | null => {
    try {
      const data = localStorage.getItem('qt_user_profile');
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },
  saveUser: (user: UserProfile) => {
    localStorage.setItem('qt_user_profile', JSON.stringify(user));
  }
};

export const formatBytes = (bytes: number, decimals = 2) => {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};
