import React from 'react';
import { Laptop, Smartphone, Tablet } from 'lucide-react';
import { UserProfile, DeviceType } from '../types';

interface HeaderProps {
  user: UserProfile;
  onEditProfile: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onEditProfile }) => {
  const getDeviceIcon = () => {
    switch (user.deviceType) {
      case DeviceType.MOBILE: return <Smartphone className="w-4 h-4" />;
      case DeviceType.TABLET: return <Tablet className="w-4 h-4" />;
      default: return <Laptop className="w-4 h-4" />;
    }
  };

  return (
    <header className="w-full py-4 px-6 flex items-center justify-between sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
      <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.location.href = '/'}>
        {/* Elegant Logo Icon */}
        <div className="relative w-10 h-10 flex items-center justify-center bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        
        {/* Elegant Typography */}
        <div className="hidden sm:flex flex-col justify-center -space-y-1">
          <div className="flex items-baseline">
            <span className="font-black text-2xl tracking-tighter text-white">WL</span>
            <span className="font-bold text-2xl tracking-tighter text-indigo-500 ml-0.5">Drop</span>
          </div>
        </div>
        {/* Mobile only text */}
        <span className="sm:hidden font-black text-xl tracking-tighter text-white">WL<span className="text-indigo-500">D</span></span>
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        {/* User Profile Pill */}
        <button 
          onClick={onEditProfile}
          className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700 transition-all rounded-full pl-2 pr-3 py-1.5 border border-slate-700/50 hover:border-slate-600"
        >
          <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-indigo-400">
            {getDeviceIcon()}
          </div>
          <span className="text-sm font-medium text-slate-200 max-w-[80px] md:max-w-[120px] truncate">
            {user.name}
          </span>
        </button>

        {/* Buy Me Coffee Image Button */}
        <a 
          href="https://buymeacoffee.com/mv999exe" 
          target="_blank"
          rel="noopener noreferrer"
          className="transition-transform hover:scale-105 active:scale-95 flex items-center"
          title="Buy me a coffee"
        >
          <img 
            src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" 
            alt="Buy Me A Coffee" 
            className="h-10 w-auto" 
          />
        </a>
      </div>
    </header>
  );
};

export default Header;