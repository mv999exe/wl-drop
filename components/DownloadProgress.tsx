import React from 'react';
import { Download, CheckCircle2, X } from 'lucide-react';
import { formatBytes } from '../utils/helpers';

interface DownloadProgressProps {
  fileName: string;
  progress: number;
  downloadedBytes: number;
  totalBytes: number;
  status: 'downloading' | 'completed' | 'error';
  onCancel?: () => void;
}

const DownloadProgress: React.FC<DownloadProgressProps> = ({
  fileName,
  progress,
  downloadedBytes,
  totalBytes,
  status,
  onCancel
}) => {
  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 mb-3">
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-lg ${
          status === 'completed' ? 'bg-emerald-500/20' : 
          status === 'error' ? 'bg-red-500/20' : 
          'bg-indigo-500/20'
        }`}>
          {status === 'completed' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          ) : (
            <Download className={`w-5 h-5 ${
              status === 'error' ? 'text-red-400' : 'text-indigo-400 animate-bounce'
            }`} />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-200 truncate">{fileName}</p>
          <p className="text-xs text-slate-500">
            {formatBytes(downloadedBytes)} / {formatBytes(totalBytes)}
            {status === 'downloading' && ` • ${Math.round(progress)}%`}
          </p>
        </div>
        
        {status === 'downloading' && onCancel && (
          <button
            onClick={onCancel}
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      
      {/* Progress Bar */}
      <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            status === 'completed' ? 'bg-emerald-500' :
            status === 'error' ? 'bg-red-500' :
            'bg-indigo-500'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {status === 'completed' && (
        <p className="text-xs text-emerald-400 mt-2">✓ Download completed</p>
      )}
      
      {status === 'error' && (
        <p className="text-xs text-red-400 mt-2">✗ Download failed</p>
      )}
    </div>
  );
};

export default DownloadProgress;
