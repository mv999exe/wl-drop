import React, { useEffect, useState } from 'react';
import { ArrowLeft, Wifi, Download, ShieldCheck, FileText, X } from 'lucide-react';
import { UserProfile } from '../types';
import { WebSocketClient } from '../utils/websocket';
import { API_ENDPOINTS } from '../utils/api';
import { formatBytes } from '../utils/helpers';

interface ReceiverViewProps {
  onBack: () => void;
  user: UserProfile;
  wsClient: WebSocketClient | null;
}

interface IncomingTransfer {
  transferId: string;
  from: string;
  fromName?: string;
  files: any[];
}

const ReceiverView: React.FC<ReceiverViewProps> = ({ onBack, user, wsClient }) => {
  const [incomingTransfers, setIncomingTransfers] = useState<IncomingTransfer[]>([]);
  
  useEffect(() => {
    if (wsClient) {
      wsClient.on('transfer_request', (message: any) => {
        setIncomingTransfers(prev => [...prev, {
          transferId: message.transferId,
          from: message.from,
          fromName: message.fromName,
          files: message.files || []
        }]);
      });
    }
    
    return () => {
      if (wsClient) {
        wsClient.off('transfer_request', () => {});
      }
    };
  }, [wsClient]);
  
  const handleAcceptTransfer = async (transfer: IncomingTransfer) => {
    try {
      // Accept transfer
      const formData = new FormData();
      formData.append('receiver_id', user.id);
      
      const response = await fetch(API_ENDPOINTS.ACCEPT_TRANSFER(transfer.transferId), {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        // Download files
        window.open(API_ENDPOINTS.DOWNLOAD_TRANSFER(transfer.transferId), '_blank');
        
        // Remove from incoming transfers
        setIncomingTransfers(prev => prev.filter(t => t.transferId !== transfer.transferId));
      }
    } catch (error) {
      console.error('Failed to accept transfer:', error);
      alert('Failed to accept transfer');
    }
  };
  
  const handleRejectTransfer = async (transfer: IncomingTransfer) => {
    try {
      await fetch(API_ENDPOINTS.REJECT_TRANSFER(transfer.transferId), {
        method: 'POST'
      });
      
      setIncomingTransfers(prev => prev.filter(t => t.transferId !== transfer.transferId));
    } catch (error) {
      console.error('Failed to reject transfer:', error);
    }
  };
  
  return (
    <div className="flex flex-col h-full animate-fade-in">
      <button 
        onClick={onBack}
        className="self-start mb-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors py-2 px-3 rounded-lg hover:bg-slate-800/50"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Home</span>
      </button>

      <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
        
        {/* Advanced Professional Radar Animation */}
        <div className="relative w-64 h-64 mb-12 flex items-center justify-center">
          
          {/* Ripple Wave 1 (Slow & Wide) */}
          <div className="absolute inset-0 border border-emerald-500/20 rounded-full animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]" style={{ animationDuration: '3s' }}></div>
          
          {/* Ripple Wave 2 (Delayed) */}
          <div className="absolute inset-0 border border-emerald-500/20 rounded-full animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]" style={{ animationDuration: '3s', animationDelay: '1s' }}></div>
          
          {/* Rotating Technical Ring (Outer) */}
          <div className="absolute inset-2 border border-dashed border-emerald-500/10 rounded-full animate-[spin_12s_linear_infinite]"></div>

          {/* Rotating Technical Ring (Inner - Reverse) */}
          <div className="absolute inset-10 border border-dashed border-emerald-400/20 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>

          {/* Soft Glow Background */}
          <div className="absolute w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl animate-pulse"></div>

          {/* Core Circle */}
          <div className="relative z-10 w-28 h-28 bg-slate-900 rounded-full border border-emerald-500/30 flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.25)] backdrop-blur-xl">
             <div className="relative">
                <Wifi className="w-10 h-10 text-emerald-400" />
                {/* Small indicator dot on the icon */}
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900 animate-bounce"></div>
             </div>
          </div>
        </div>

        <div className="space-y-2 mb-8">
            <h2 className="text-3xl font-bold text-white tracking-tight">Discoverable</h2>
            <div className="flex items-center justify-center gap-2 text-slate-400 animate-pulse">
                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                <p className="text-lg font-medium">Waiting for incoming connections...</p>
            </div>
            <p className="text-sm text-slate-500">Keep this screen open to receive files</p>
        </div>
        
        {/* Incoming Transfers */}
        {incomingTransfers.length > 0 && (
          <div className="w-full max-w-2xl space-y-4">
            <h3 className="text-xl font-bold text-white mb-3">Incoming Transfers</h3>
            {incomingTransfers.map((transfer) => (
              <div key={transfer.transferId} className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-white">
                      {transfer.fromName || 'Unknown Device'}
                    </h4>
                    <p className="text-sm text-slate-400">
                      {transfer.files.length} file(s) • {formatBytes(transfer.files.reduce((sum, f) => sum + (f.size || 0), 0))}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRejectTransfer(transfer)}
                    className="text-slate-400 hover:text-red-400 p-2"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="bg-slate-900/50 rounded-lg p-3 mb-4 max-h-32 overflow-y-auto">
                  {transfer.files.map((file, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-slate-300 py-1">
                      <FileText className="w-4 h-4 text-slate-500" />
                      <span className="flex-1 truncate">{file.name}</span>
                      <span className="text-xs text-slate-500">{formatBytes(file.size)}</span>
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => handleAcceptTransfer(transfer)}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Accept & Download
                  </button>
                  <button
                    onClick={() => handleRejectTransfer(transfer)}
                    className="px-6 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 rounded-xl transition-all"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Card */}
        <div className="mt-4 p-5 rounded-2xl bg-slate-800/40 border border-slate-700/50 flex items-center gap-4 max-w-sm text-left backdrop-blur-sm hover:bg-slate-800/60 transition-colors">
            <div className="p-3 bg-emerald-500/10 rounded-xl">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
                <h4 className="font-semibold text-slate-200">Secure Connection</h4>
                <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                    Files are transferred directly over your local network. No internet required.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiverView;