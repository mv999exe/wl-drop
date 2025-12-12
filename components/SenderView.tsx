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
    
    // Simple drag drop logic for demo (mostly files)
    // Full folder traverse in drag-drop requires FileSystemEntry API recursion
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
  const processFiles = (fileList: FileList) => {
    setFiles(prev => [...prev, ...Array.from(fileList)]);
  };

  const processFiles = (fileList: FileList) => {
    const newFiles: FileItem[] = Array.from(fileList).map(f => ({
      name: f.name,
      size: f.size,
      type: f.type || 'unknown',
      path: f.webkitRelativePath || f.name
    }));
    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const triggerInput = () => {
    if (fileInputRef.current) {
        // Reset value to allow selecting same folder/files again
        fileInputRef.current.value = '';
        fileInputRef.current.click();
    }
  const triggerInput = () => {
    if (fileInputRef.current) {
        // Reset value to allow selecting same folder/files again
        fileInputRef.current.value = '';
        fileInputRef.current.click();
    }
  };
  
  const handleSendFiles = async () => {
    if (!selectedReceiver || files.length === 0) {
      alert('Please select files and a receiver');
      return;
    }
    
    setUploading(true);
    setUploadProgress(0);
    
    try {
      const transferId = crypto.randomUUID();
      
      // Upload files to server
      const formData = new FormData();
      formData.append('sender_id', user.id);
      formData.append('transfer_id', transferId);
      
      let uploadedCount = 0;
      for (const file of files) {
        const fileFormData = new FormData();
        fileFormData.append('file', file);
        fileFormData.append('sender_id', user.id);
        fileFormData.append('transfer_id', transferId);
        
        if (file.webkitRelativePath) {
          fileFormData.append('relative_path', file.webkitRelativePath);
        }
        
        const response = await fetch(API_ENDPOINTS.UPLOAD_FILE, {
          method: 'POST',
          body: fileFormData,
        });
        
        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }
        
        uploadedCount++;
        setUploadProgress((uploadedCount / files.length) * 100);
      }
      
      // Initiate transfer via API
      const fileMetadata = files.map(f => ({
        name: f.name,
        size: f.size,
        type: f.type,
        path: f.webkitRelativePath || f.name
      }));
      
      const transferResponse = await fetch(API_ENDPOINTS.INITIATE_TRANSFER, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: user.id,
          receiverId: selectedReceiver,
          files: fileMetadata
        })
      });
      
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
  };    className="self-start mb-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors py-2"
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
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={triggerInput}
            className={`
                group relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300
                ${isDragging 
                    ? 'border-indigo-500 bg-indigo-500/10 scale-[1.02]' 
                    : 'border-slate-700 bg-slate-800/30 hover:border-slate-500 hover:bg-slate-800/50'
                }
            `}
        >
            <input 
                ref={fileInputRef}
                type="file" 
                multiple 
                // @ts-ignore - React doesn't fully type webkitdirectory yet
                webkitdirectory={mode === 'FOLDER' ? "" : undefined}
                // @ts-ignore
                directory={mode === 'FOLDER' ? "" : undefined}
                className="hidden" 
                onChange={handleFileSelect}
            />

            <div className="flex flex-col items-center gap-4">
                <div className={`p-4 rounded-full bg-slate-800 group-hover:bg-slate-700 transition-colors ${isDragging ? 'bg-indigo-900/50' : ''}`}>
                    {mode === 'FOLDER' ? <Folder className="w-8 h-8 text-indigo-400" /> : <Upload className="w-8 h-8 text-indigo-400" />}
                </div>
                <div>
                    <h3 className="text-xl font-semibold text-slate-200 mb-1">
                        {mode === 'FOLDER' ? 'Select Folder' : 'Select Files'}
                    </h3>
                    <p className="text-slate-500">
                        {isDragging ? 'Drop it here!' : 'Click to browse or drag and drop'}
                    </p>
                </div>
            </div>
        </div>

        {/* File List */}
        {files.length > 0 && (
            <div className="mt-8">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        Ready to send ({files.length})
                    </h3>
                    <button 
                        onClick={() => setFiles([])}
                        className="text-sm text-red-400 hover:text-red-300"
                    >
                        Clear All
                    </button>
                </div>
                
                <div className="bg-slate-800/50 rounded-xl border border-slate-700 divide-y divide-slate-700 max-h-[300px] overflow-y-auto">
                    {files.map((file, idx) => (
                        <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-700/30 transition-colors">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="p-2 bg-slate-900 rounded-lg">
                                    <File className="w-4 h-4 text-indigo-400"/>
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-slate-200 truncate pr-4">{file.webkitRelativePath || file.name}</p>
                                    <p className="text-xs text-slate-500">{formatBytes(file.size)}</p>
                                </div>
                            </div>
                            <button 
                                onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                                className="p-2 text-slate-500 hover:text-red-400 hover:bg-slate-700 rounded-full transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
                
                {/* Receiver Selection */}
                <div className="mt-6">
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                        <Users className="w-5 h-5 text-emerald-400" />
                        Select Receiver
                    </h3>
                    
                    {receivers.length === 0 ? (
                        <div className="p-6 bg-slate-800/30 border border-slate-700 rounded-xl text-center">
                            <AlertCircle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                            <p className="text-slate-400">No receivers available</p>
                            <p className="text-sm text-slate-500 mt-1">Ask someone to open the app in Receive mode</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {receivers.map((receiver) => (
                                <button
                                    key={receiver.id}
                                    onClick={() => setSelectedReceiver(receiver.id)}
                                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                                        selectedReceiver === receiver.id
                                            ? 'border-emerald-500 bg-emerald-500/10'
                                            : 'border-slate-700 bg-slate-800/30 hover:border-slate-600'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                            selectedReceiver === receiver.id ? 'bg-emerald-500/20' : 'bg-slate-700'
                                        }`}>
                                            <span className="text-lg">
                                                {receiver.deviceType === 'MOBILE' ? '📱' : receiver.deviceType === 'TABLET' ? '📱' : '💻'}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">{receiver.name}</p>
                                            <p className="text-xs text-slate-400">{receiver.deviceType}</p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="mt-6 flex justify-end">
                    <button 
                        onClick={handleSendFiles}
                        disabled={!selectedReceiver || uploading}
                        className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                    >
                        {uploading ? (
                            <>
                                <span>Sending... {Math.round(uploadProgress)}%</span>
                            </>
                        ) : (
                            <>
                                <SendIcon className="w-4 h-4" />
                                <span>Send Files</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default SenderView;
