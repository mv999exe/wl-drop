"""
WebSocket connection manager for real-time communication
"""

import { getWebSocketURL } from './api';
import { UserProfile } from '../types';

export type WSMessageType = 
  | 'register'
  | 'update_mode'
  | 'device_list'
  | 'transfer_request'
  | 'transfer_accepted'
  | 'transfer_rejected'
  | 'transfer_progress'
  | 'transfer_complete'
  | 'ping'
  | 'pong';

export interface WSMessage {
  type: WSMessageType;
  [key: string]: any;
}

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private clientId: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 2000;
  private messageHandlers: Map<WSMessageType, Function[]> = new Map();
  
  constructor(clientId: string) {
    this.clientId = clientId;
  }
  
  connect(user: UserProfile, mode: string = 'HOME') {
    const url = getWebSocketURL(this.clientId);
    
    try {
      this.ws = new WebSocket(url);
      
      this.ws.onopen = () => {
        console.log('✅ WebSocket connected');
        this.reconnectAttempts = 0;
        
        // Register device on connection
        this.send({
          type: 'register',
          name: user.name,
          deviceType: user.deviceType,
          mode: mode,
          avatarId: user.avatarId
        });
      };
      
      this.ws.onmessage = (event) => {
        try {
          const message: WSMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (e) {
          console.error('Failed to parse WebSocket message:', e);
        }
      };
      
      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
      
      this.ws.onclose = () => {
        console.log('❌ WebSocket disconnected');
        this.attemptReconnect(user, mode);
      };
      
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      this.attemptReconnect(user, mode);
    }
  }
  
  private attemptReconnect(user: UserProfile, mode: string) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect(user, mode);
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }
  
  send(message: WSMessage) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, message not sent:', message);
    }
  }
  
  updateMode(mode: string) {
    this.send({
      type: 'update_mode',
      mode: mode
    });
  }
  
  on(messageType: WSMessageType, handler: Function) {
    if (!this.messageHandlers.has(messageType)) {
      this.messageHandlers.set(messageType, []);
    }
    this.messageHandlers.get(messageType)!.push(handler);
  }
  
  off(messageType: WSMessageType, handler: Function) {
    const handlers = this.messageHandlers.get(messageType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }
  
  private handleMessage(message: WSMessage) {
    const handlers = this.messageHandlers.get(message.type);
    if (handlers) {
      handlers.forEach(handler => handler(message));
    }
  }
  
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
  
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}
