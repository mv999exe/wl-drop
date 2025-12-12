import React from 'react';
import { Heart } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full py-6 mt-auto border-t border-slate-800 bg-slate-900/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-center gap-2 text-slate-400 text-sm">
        <span className="flex items-center gap-1.5">
          Made with 
          <span className="relative flex h-4 w-4 items-center justify-center">
             <Heart className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse relative z-10" />
             <span className="absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-40 animate-ping"></span>
          </span>
          by 
          <a 
            href="https://github.com/mv999exe" 
            target="_blank" 
            rel="noopener noreferrer"
            className="font-bold text-slate-200 hover:text-indigo-400 transition-colors duration-300 border-b border-transparent hover:border-indigo-400 pb-0.5"
          >
            mv999exe
          </a>
        </span>
      </div>
    </footer>
  );
};

export default Footer;