import React, { useEffect, useState } from 'react';
import { ArrowLeft, Wifi, Download, ShieldCheck, FileText, X } from 'lucide-react';
import { UserProfile } from '../types';
import { WebSocketClient } from '../utils/websocket';
import { API_ENDPOINTS } from '../utils/api';
import { formatBytes } from '../utils/helpers';
import DownloadProgress from './DownloadProgress';

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

interface DownloadStatus {
  fileName: string;
  progress: number;
  downloadedBytes: number;
  totalBytes: number;
  status: 'downloading' | 'completed' | 'error';
}

const ReceiverView: React.FC<ReceiverViewProps> = ({ onBack, user, wsClient }) => {
  const [incomingTransfers, setIncomingTransfers] = useState<IncomingTransfer[]>([]);
  const [downloadStatuses, setDownloadStatuses] = useState<DownloadStatus[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);
  
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
  
  const downloadFile = async (transferId: string, file: any, index: number) => {
    const fileName = file.path || file.name;
    
    try {
      const response = await fetch(
        API_ENDPOINTS.DOWNLOAD_FILE(transferId, fileName),
        { method: 'GET' }
      );
      
      if (!response.ok) throw new Error('Download failed');
      
      const totalBytes = parseInt(response.headers.get('content-length') || '0');
      let downloadedBytes = 0;
      
      // Create download status
      const status: DownloadStatus = {
        fileName: file.name,
        progress: 0,
        downloadedBytes: 0,
        totalBytes: file.size || totalBytes,
        status: 'downloading'
      };
      
      setDownloadStatuses(prev => [...prev, status]);
      const statusIndex = downloadStatuses.length;
      
      const reader = response.body?.getReader();
      const chunks: Uint8Array[] = [];
      
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) break;
          
          chunks.push(value);
          downloadedBytes += value.length;
          
          // Update progress
          const progress = totalBytes > 0 ? (downloadedBytes / totalBytes) * 100 : 0;
          setDownloadStatuses(prev => {
            const newStatuses = [...prev];
            if (newStatuses[statusIndex]) {
              newStatuses[statusIndex] = {
                ...newStatuses[statusIndex],
                progress,
                downloadedBytes
              };
            }
            return newStatuses;
          });
        }
      }
      
      // Create blob and download
      const blob = new Blob(chunks);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      // Mark as completed
      setDownloadStatuses(prev => {
        const newStatuses = [...prev];
        if (newStatuses[statusIndex]) {
          newStatuses[statusIndex].status = 'completed';
          newStatuses[statusIndex].progress = 100;
        }
        return newStatuses;
      });
      
    } catch (error) {
      console.error('Download error:', error);
      
      // Mark as error
      setDownloadStatuses(prev => {
        const newStatuses = [...prev];
        const idx = newStatuses.findIndex(s => s.fileName === file.name);
        if (idx !== -1) {
          newStatuses[idx].status = 'error';
        }
        return newStatuses;
      });
    }
  };
  
  const handleAcceptTransfer = async (transfer: IncomingTransfer) => {
    try {
      setIsDownloading(true);
      
      // Accept transfer
      const formData = new FormData();
      formData.append('receiver_id', user.id);
      
      const response = await fetch(API_ENDPOINTS.ACCEPT_TRANSFER(transfer.transferId), {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        // Download each file individually
        for (let i = 0; i < transfer.files.length; i++) {
          await downloadFile(transfer.transferId, transfer.files[i], i);
        }
        
        // Remove from incoming transfers after all downloads complete
        setTimeout(() => {
          setIncomingTransfers(prev => prev.filter(t => t.transferId !== transfer.transferId));
          setIsDownloading(false);
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to accept transfer:', error);
      alert('Failed to accept transfer');
      setIsDownloading(false);
    }
  };

  const handleRejectTransfer = async (transfer: IncomingTransfer) => {
    try {
      const formData = new FormData();
      formData.append('receiver_id', user.id);
      
      await fetch(API_ENDPOINTS.REJECT_TRANSFER(transfer.transferId), {
        method: 'POST',
        body: formData
      });
      
      // Remove from list
      setIncomingTransfers(prev => prev.filter(t => t.transferId !== transfer.transferId));
    } catch (error) {
      console.error('Failed to reject transfer:', error);
    }
  };
  
  const getTotalSize = (files: any[]) => {
    return files.reduce((sum, file) => sum + (file.size || 0), 0);
  };

  return (
    <div className="flex-1 flex flex-col">
      <button 
        onClick={onBack}
        className="self-start mb-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors py-2"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Home</span>
      </button>

      <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full">
        <div className="mb-8 text-center">
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Wifi className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Ready to Receive</h2>
          <p className="text-slate-400">
            Your device is now visible to nearby senders on the network.
          </p>
        </div>

        {/* Security Badge */}
        <div className="w-full mb-8 p-4 bg-slate-800/40 border border-slate-700 rounded-xl flex items-center gap-3">
          <div className="p-2 bg-emerald-500/20 rounded-lg">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-white">Secure Transfer</p>
            <p className="text-xs text-slate-500">All transfers are encrypted and stay on your local network</p>
          </div>
        </div>

        {/* Download Progress */}
        {downloadStatuses.length > 0 && (
          <div className="w-full max-w-2xl mb-6">
            <h3 className="text-xl font-bold text-white mb-3">Downloads</h3>
            <div className="space-y-2">
              {downloadStatuses.map((status, idx) => (
                <DownloadProgress
                  key={idx}
                  fileName={status.fileName}
                  progress={status.progress}
                  downloadedBytes={status.downloadedBytes}
                  totalBytes={status.totalBytes}
                  status={status.status}
                />
              ))}
            </div>
          </div>
        )}
        
        {/* Incoming Transfers */}
        {incomingTransfers.length > 0 && (
          <div className="w-full max-w-2xl space-y-4">
            <h3 className="text-xl font-bold text-white mb-3">Incoming Transfers</h3>
            {incomingTransfers.map((transfer) => (
              <div 
                key={transfer.transferId}
                className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-1">
                      {transfer.fromName || 'Unknown Sender'}
                    </h4>
                    <p className="text-sm text-slate-400">
                      {transfer.files.length} {transfer.files.length === 1 ? 'file' : 'files'} • {formatBytes(getTotalSize(transfer.files))}
                    </p>
                  </div>
                </div>

                {/* File List Preview */}
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                  {transfer.files.map((file, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center gap-3 p-2 bg-slate-900/40 rounded-lg"
                    >
                      <FileText className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-300 truncate">{file.name}</p>
                        <p className="text-xs text-slate-500">{formatBytes(file.size)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleAcceptTransfer(transfer)}
                    disabled={isDownloading}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    {isDownloading ? 'Downloading...' : 'Accept & Download'}
                  </button>
                  <button
                    onClick={() => handleRejectTransfer(transfer)}
                    disabled={isDownloading}
                    className="px-6 bg-slate-700 hover:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Transfers */}
        {incomingTransfers.length === 0 && downloadStatuses.length === 0 && (
          <div className="text-center text-slate-500 mt-8">
            <p>Waiting for incoming transfers...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceiverView;
