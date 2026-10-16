import React from 'react';
import { LogOut, Lock, Globe } from 'lucide-react';

interface HeaderProps {
  isAuthenticated: boolean;
  onSignOut: () => void;
  onSignInClick: () => void;
  hostDomain: string;
}

export const Header: React.FC<HeaderProps> = ({
  isAuthenticated,
  onSignOut,
  onSignInClick,
  hostDomain
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#070b16]/95 backdrop-blur-md border-b border-slate-800/80 px-4 md:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Zone 1: Single text wordmark */}
        <div className="flex items-center gap-3">
          <div className="flex items-center tracking-wider text-base font-bold whitespace-nowrap">
            <span className="text-cyan-400 font-extrabold">TUNNEL</span>
            <span className="text-slate-100 ml-1.5 font-black">X</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
            <span>/</span>
            <Globe className="w-3 h-3 text-cyan-500/70" />
            <span className="text-slate-400 truncate max-w-[180px]">{hostDomain}</span>
          </div>
        </div>

        {/* Zone 3: Primary Action */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <button
              onClick={onSignOut}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-100 px-3 py-1.5 rounded-md hover:bg-slate-800/70 border border-slate-800/60 transition-colors whitespace-nowrap cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign out</span>
            </button>
          ) : (
            <button
              onClick={onSignInClick}
              className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 px-3 py-1.5 rounded-md bg-cyan-950/40 hover:bg-cyan-950/70 border border-cyan-800/50 transition-colors whitespace-nowrap cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Unlock Dashboard</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
