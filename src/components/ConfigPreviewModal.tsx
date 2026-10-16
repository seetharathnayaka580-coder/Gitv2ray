import React, { useState } from 'react';
import { X, Copy, Check, Download, FileText } from 'lucide-react';

interface ConfigPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientName: string;
  configContent: string;
  fileName: string;
  onCopySuccess: () => void;
}

export const ConfigPreviewModal: React.FC<ConfigPreviewModalProps> = ({
  isOpen,
  onClose,
  clientName,
  configContent,
  fileName,
  onCopySuccess
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(configContent);
    setCopied(true);
    onCopySuccess();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([configContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-[#0a0f1d] border border-slate-800 rounded-xl shadow-2xl flex flex-col max-h-[85vh] text-slate-100">
        <div className="flex items-center justify-between p-5 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-cyan-950/60 border border-cyan-800/60 rounded-lg text-cyan-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100">{clientName} Configuration</h3>
              <p className="text-xs text-slate-400">Static rule-based client payload ({fileName})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          <div className="relative">
            <pre className="font-mono text-xs bg-[#060a14] border border-slate-800/80 rounded-lg p-4 text-slate-300 overflow-x-auto selection:bg-cyan-500/30 selection:text-cyan-200">
              {configContent}
            </pre>
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 bg-[#090d1a] flex items-center justify-between gap-3 shrink-0 rounded-b-xl">
          <span className="text-xs text-slate-400">
            Import directly into {clientName} via URL or local file import.
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Configuration</span>
                </>
              )}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
