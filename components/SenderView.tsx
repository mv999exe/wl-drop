import React, { useState, useRef, ChangeEvent, useEffect } from 'react';
import { ArrowLeft, Upload, File, Folder, X, CheckCircle2, AlertCircle, Send as SendIcon, Users } from 'lucide-react';
import { FileItem, UserProfile } from '../types';
import { formatBytes } from '../utils/helpers';
import { WebSocketClient } from '../utils/websocket';
import { API_ENDPOINTS } from '../utils/api';

interface SenderViewProps {
  onBack: () => void;
  user: UserProfile;
  wsClient: WebSocketClient | null;
}

interface ReceiverDevice {
  id: string;
  name: string;
  deviceType: string;
  avatarId: number;
}

type UploadMode = 'FILES' | 'FOLDER';

const SenderView: React.FC<SenderViewProps> = ({ onBack, user, wsClient }) => {
  const [mode, setMode] = useState<UploadMode>('FILES');
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [receivers, setReceivers] = useState<ReceiverDevice[]>([]);
  const [selectedReceiver, setSelectedReceiver] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Fetch receivers on mount and when device list changes
  useEffect(() => {
    if (wsClient) {
      wsClient.on('device_list', (message: any) => {
        const receiverDevices = message.devices?.filter((d: any) => d.mode === 'RECEIVE') || [];
        setReceivers(receiverDevices);
      });
    }
  }, [wsClient]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const processFiles = (fileList: FileList) => {
    setFiles(prev => [...prev, ...Array.from(fileList)]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const triggerInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const handleSend = async () => {
    if (!selectedReceiver || files.length === 0) {
      alert('Please select files and a receiver');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      // Generate transfer ID
      const transferId = `transfer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Upload files one by one
      const totalFiles = files.length;
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('sender_id', user.id);
        formData.append('transfer_id', transferId);
        
        // Add relative path if it exists (for folders)
        if ((file as any).webkitRelativePath) {
          formData.append('relative_path', (file as any).webkitRelativePath);
        }

        const uploadResponse = await fetch(API_ENDPOINTS.UPLOAD_FILE, {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) throw new Error(`Failed to upload ${file.name}`);
        
        // Update progress
        setUploadProgress(Math.round(((i + 1) / totalFiles) * 80));
      }

      // Initiate transfer
      const transferData = new FormData();
      transferData.append('sender_id', user.id);
      transferData.append('receiver_id', selectedReceiver);
      transferData.append('transfer_id', transferId);

      const transferResponse = await fetch(API_ENDPOINTS.INITIATE_TRANSFER, {
        method: 'POST',
        body: transferData,
      });
      
      setUploadProgress(100);
      
      if (transferResponse.ok) {
        alert('Files sent successfully!');
        setFiles([]);
        setSelectedReceiver(null);
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to send files. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
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

      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        <h2 className="text-3xl font-bold text-white mb-2">Send Files</h2>
        <p className="text-slate-400 mb-8">Select files or folders to transfer to nearby devices.</p>

        {/* Mode Toggle */}
        <div className="flex bg-slate-800 p-1 rounded-xl w-fit mb-6 border border-slate-700">
          <button
            onClick={() => setMode('FILES')}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all ${mode === 'FILES' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            <File className="w-4 h-4" />
            Files
          </button>
          <button
            onClick={() => setMode('FOLDER')}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all ${mode === 'FOLDER' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            <Folder className="w-4 h-4" />
            Folder
          </button>
        </div>

        {/* Drop Zone */}
        <div
          className={`
            border-2 border-dashed rounded-2xl p-8 md:p-12 text-center transition-all duration-300 mb-6
            ${isDragging ? 'border-indigo-500 bg-indigo-500/10 scale-105' : 'border-slate-700 bg-slate-800/30 hover:border-slate-600'}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="p-6 bg-indigo-500/10 rounded-full">
              <Upload className="w-10 h-10 text-indigo-400" />
            </div>
            <div>
              <p className="text-lg text-slate-300 font-medium mb-1">
                Drag & drop {mode === 'FILES' ? 'files' : 'a folder'} here
              </p>
              <p className="text-sm text-slate-500">or</p>
            </div>
            <button
              onClick={triggerInput}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-indigo-500/50"
            >
              Browse {mode === 'FILES' ? 'Files' : 'Folder'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple={mode === 'FILES'}
              onChange={handleFileChange}
              className="hidden"
              {...(mode === 'FOLDER' ? { webkitdirectory: '', directory: '' } as any : {})}
            />
          </div>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Selected Files ({files.length})</h3>
              <button
                onClick={() => setFiles([])}
                className="text-sm text-slate-400 hover:text-red-400 transition-colors"
              >
                Clear All
              </button>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-slate-800/60 border border-slate-700 rounded-xl hover:bg-slate-800 transition-colors group"
                >
                  <div className="p-2 bg-indigo-500/20 rounded-lg">
                    <File className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">{file.name}</p>
                    <p className="text-xs text-slate-500">{formatBytes(file.size)}</p>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-slate-700 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Receiver Selection */}
        {files.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Select Receiver
            </h3>
            
            {receivers.length === 0 ? (
              <div className="p-6 bg-slate-800/40 border border-slate-700 rounded-xl text-center">
                <AlertCircle className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                <p className="text-slate-400">No receivers available</p>
                <p className="text-sm text-slate-500 mt-1">Ask someone to open the app in receive mode</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {receivers.map((receiver) => (
                  <button
                    key={receiver.id}
                    onClick={() => setSelectedReceiver(receiver.id)}
                    className={`
                      p-4 rounded-xl border-2 transition-all text-left
                      ${selectedReceiver === receiver.id
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : 'border-slate-700 bg-slate-800/40 hover:border-slate-600'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${
                        receiver.avatarId === 0 ? 'from-purple-500 to-pink-500' :
                        receiver.avatarId === 1 ? 'from-blue-500 to-cyan-500' :
                        receiver.avatarId === 2 ? 'from-green-500 to-emerald-500' :
                        receiver.avatarId === 3 ? 'from-orange-500 to-red-500' :
                        'from-indigo-500 to-purple-500'
                      } flex items-center justify-center text-white font-bold`}>
                        {receiver.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white truncate">{receiver.name}</p>
                        <p className="text-xs text-slate-400 capitalize">{receiver.deviceType}</p>
                      </div>
                      {selectedReceiver === receiver.id && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Send Button */}
        {files.length > 0 && selectedReceiver && (
          <button
            onClick={handleSend}
            disabled={uploading}
            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-indigo-500/50 flex items-center justify-center gap-3"
          >
            {uploading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Sending... {uploadProgress}%
              </>
            ) : (
              <>
                <SendIcon className="w-5 h-5" />
                Send {files.length} {files.length === 1 ? 'File' : 'Files'}
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default SenderView;
