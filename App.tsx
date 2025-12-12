import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import ProfileModal from './components/ProfileModal';
import SenderView from './components/SenderView';
import ReceiverView from './components/ReceiverView';
import { Send, Download, Zap, CloudOff, Wifi, Copy, Check } from 'lucide-react';
import { AppMode, UserProfile, DeviceType } from './types';
import { detectDeviceType, generateRandomName, storage } from './utils/helpers';
import { WebSocketClient } from './utils/websocket';
import { getServerURL, API_ENDPOINTS } from './utils/api';

function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [mode, setMode] = useState<AppMode>(AppMode.HOME);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [serverUrl, setServerUrl] = useState<string>("Connecting...");
  const wsClient = useRef<WebSocketClient | null>(null);

  // Initialize Application
  useEffect(() => {
    // 1. Detect Device
    const currentDevice = detectDeviceType();

    // 2. Check Storage for User
    let currentUser = storage.getUser();

    // 3. Create if not exists or update device type
    if (!currentUser) {
      currentUser = {
        id: crypto.randomUUID(),
        name: generateRandomName(),
        deviceType: currentDevice,
        avatarId: Math.floor(Math.random() * 5)
      };
      storage.saveUser(currentUser);
    } else {
      // Ensure device type is accurate to current session
      currentUser.deviceType = currentDevice;
      storage.saveUser(currentUser);
    }

    setUser(currentUser);
    
    // 4. Get server URL from backend
    fetchServerInfo();
    
    // 5. Initialize WebSocket connection
    if (currentUser) {
      wsClient.current = new WebSocketClient(currentUser.id);
      wsClient.current.connect(currentUser, AppMode.HOME);
    }
    
    return () => {
      // Cleanup WebSocket on unmount
      if (wsClient.current) {
        wsClient.current.disconnect();
      }
    };
  }, []);
  
  // Fetch server info to get actual IP
  const fetchServerInfo = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.HEALTH);
      const data = await response.json();
      setServerUrl(`http://${data.server}`);
    } catch (error) {
      console.error('Failed to fetch server info:', error);
      setServerUrl(getServerURL());
    }
  };
  
  // Update WebSocket mode when app mode changes
  useEffect(() => {
    if (wsClient.current && user) {
      wsClient.current.updateMode(mode);
    }
  }, [mode, user]);

  const handleProfileUpdate = (newName: string) => {
    if (user) {
      const updatedUser = { ...user, name: newName };
      setUser(updatedUser);
      storage.saveUser(updatedUser);
      
      // Update name on server via WebSocket
      if (wsClient.current) {
        wsClient.current.send({
          type: 'register',
          name: newName,
          deviceType: user.deviceType,
          mode: mode,
          avatarId: user.avatarId
        });
      }
    }
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(serverUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!user) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500">Loading...</div>;

  return (
    <div className="min-h-screen flex flex-col bg-[#0f172a] text-slate-200 font-sans selection:bg-indigo-500/30">
      
      <Header user={user} onEditProfile={() => setIsProfileModalOpen(true)} />
      
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12 flex flex-col">
        
        {/* VIEW: HOME */}
        {mode === AppMode.HOME && (
          <div className="flex-1 flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-500">
            <div className="text-center mb-10">
              <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400 mb-4">
                Share files instantly.
              </h1>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-8">
                Secure peer-to-peer file transfer directly in your browser. No size limits, no clouds, just direct sharing.
              </p>

              {/* IP Address / Connection Bar */}
              <div 
                className="inline-flex items-center gap-4 px-5 py-2.5 bg-slate-800/60 border border-slate-700/60 rounded-full backdrop-blur-md shadow-lg cursor-pointer hover:bg-slate-800/80 transition-all group"
                onClick={copyUrl}
                title="Click to copy connection URL"
              >
                <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
                  <div className="p-1.5 bg-indigo-500/10 rounded-full">
                    <Wifi className="w-4 h-4 text-indigo-400" />
                  </div>
                  <span className="hidden sm:inline">Connect via:</span>
                </div>
                
                <code className="font-mono text-indigo-300 font-bold tracking-wide">
                  {serverUrl.replace('http://', '')}
                </code>

                <div className="pl-3 border-l border-slate-700">
                   {copied ? (
                     <Check className="w-4 h-4 text-emerald-400" />
                   ) : (
                     <Copy className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                   )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
              {/* Send Card */}
              <button 
                onClick={() => setMode(AppMode.SEND)}
                className="group relative p-8 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-indigo-500/50 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/10 text-left overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Send className="w-32 h-32 -rotate-12" />
                </div>
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-indigo-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Send className="w-7 h-7 text-indigo-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Send</h2>
                  <p className="text-slate-400 group-hover:text-slate-300">
                    Transfer files or folders to another device nearby.
                  </p>
                </div>
              </button>

              {/* Receive Card */}
              <button 
                onClick={() => setMode(AppMode.RECEIVE)}
                className="group relative p-8 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/50 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-500/10 text-left overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Download className="w-32 h-32 -rotate-12" />
                </div>
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Download className="w-7 h-7 text-emerald-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Receive</h2>
                  <p className="text-slate-400 group-hover:text-slate-300">
                    Make this device visible to receive files.
                  </p>
                </div>
              </button>
            </div>
            
            <div className="mt-16 flex items-center gap-6 text-slate-500 text-sm">
              <div className="flex items-center gap-2" title="Transfers happen on local network">
                <Zap className="w-4 h-4 text-yellow-500" />
        {/* VIEW: SEND */}
        {mode === AppMode.SEND && (
          <SenderView 
            onBack={() => setMode(AppMode.HOME)} 
            user={user}
            wsClient={wsClient.current}
          />
        )}

        {/* VIEW: RECEIVE */}
        {mode === AppMode.RECEIVE && (
          <ReceiverView 
            onBack={() => setMode(AppMode.HOME)}
            user={user}
            wsClient={wsClient.current}
          />
        )}</div>
        )}

        {/* VIEW: SEND */}
        {mode === AppMode.SEND && (
          <SenderView onBack={() => setMode(AppMode.HOME)} />
        )}

        {/* VIEW: RECEIVE */}
        {mode === AppMode.RECEIVE && (
          <ReceiverView onBack={() => setMode(AppMode.HOME)} />
        )}

      </main>

      <Footer />

      <ProfileModal 
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentName={user.name}
        onSave={handleProfileUpdate}
      />
    </div>
  );
}

export default App;