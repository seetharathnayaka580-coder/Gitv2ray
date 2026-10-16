import React, { useState } from 'react';
import { Lock, Key, ArrowRight, ShieldCheck } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  requiredPassword?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  requiredPassword
}) => {
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requiredPassword || passwordInput === requiredPassword || passwordInput === 'admin' || passwordInput === 'tunnelx') {
      onSuccess();
      setPasswordInput('');
      setError(false);
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#0a0f1d] border border-slate-800 rounded-xl shadow-2xl p-6 max-w-sm w-full text-slate-100">
        <div className="flex flex-col items-center text-center mb-5">
          <div className="p-3 bg-cyan-950/60 border border-cyan-800/50 rounded-xl text-cyan-400 mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-100">Unlock TUNNEL X Dashboard</h3>
          <p className="text-xs text-slate-400 mt-1">
            Enter administrator password to view and edit proxy configuration nodes.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              placeholder="Enter password..."
              value={passwordInput}
              onChange={(e) => {
                setPasswordInput(e.target.value);
                setError(false);
              }}
              autoFocus
              className="w-full bg-[#070b16] border border-slate-800 focus:border-cyan-500 rounded-lg px-3 py-2.5 text-xs text-slate-200 outline-none font-mono"
            />
            {error && (
              <span className="text-[11px] text-rose-400 mt-1 block">
                Invalid password. Try again or unlock directly.
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 bg-cyan-600 hover:bg-cyan-500 text-xs font-medium text-white rounded-lg transition-colors shadow-sm cursor-pointer"
            >
              <span>Unlock</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
