export enum DeviceType {
  MOBILE = 'MOBILE',
  DESKTOP = 'DESKTOP',
  TABLET = 'TABLET'
}

export interface UserProfile {
  id: string;
  name: string;
  deviceType: DeviceType;
  avatarId: number; // Just a random number to select an avatar color or icon
}

export enum AppMode {
  HOME = 'HOME',
  SEND = 'SEND',
  RECEIVE = 'RECEIVE'
}

export interface FileItem {
  name: string;
  size: number;
  type: string;
  path?: string; // For folder uploads
}
