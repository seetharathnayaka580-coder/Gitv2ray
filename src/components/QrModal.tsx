import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { X, Copy, Download, Check } from 'lucide-react';

interface QrModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  data: string;
  subtitle?: string;
  onCopySuccess: () => void;
}

export const QrModal: React.FC<QrModalProps> = ({
  isOpen,
  onClose,
  title,
  data,
  subtitle,
  onCopySuccess
}) => {
  const [dataUrl, setDataUrl] = useState<string>('');
  const [hasCopied, setHasCopied] = useState(false);

  useEffect(() => {
    if (isOpen && data) {
      QRCode.toDataURL(data, {
        width: 320,
        margin: 2,
        color: {
          dark: '#030712',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'M'
      })
        .then((url) => setDataUrl(url))
        .catch((err) => console.error('Failed to generate QR code', err));
    }
  }, [isOpen, data]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(data);
    setHasCopied(true);
    onCopySuccess();
    setTimeout(() => setHasCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `tunnel-x-qr-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md bg-[#0a0f1d] border border-slate-800 rounded-xl shadow-2xl overflow-hidden p-6 text-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-5">
          <div>
            <h3 className="text-base font-semibold text-slate-100">{title}</h3>
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col items-center">
          <div className="p-3 bg-white rounded-xl shadow-lg mb-4">
            {dataUrl ? (
              <img src={dataUrl} alt="Proxy Node QR Code" className="w-64 h-64 object-contain" />
            ) : (
              <div className="w-64 h-64 flex items-center justify-center text-slate-500 text-xs">
                Generating QR code...
              </div>
            )}
          </div>

          <div className="w-full bg-[#0d1424] border border-slate-800 rounded-lg p-3 mb-5">
            <span className="text-[11px] font-medium text-slate-400 block mb-1">Configuration String / URL</span>
            <p className="font-mono text-xs text-slate-300 break-all select-all line-clamp-3">
              {data}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full">
            <button
              onClick={handleCopyLink}
              className="flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-800 hover:bg-slate-750 border border-slate-700/80 text-xs font-medium text-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              {hasCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy String</span>
                </>
              )}
            </button>
            <button
              onClick={handleDownloadQR}
              className="flex items-center justify-center gap-2 py-2.5 px-4 bg-cyan-600 hover:bg-cyan-500 text-xs font-medium text-white rounded-lg transition-colors cursor-pointer shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Save Image</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
