import React, { useState } from 'react';
import { Terminal, ShieldCheck, CheckCircle2, AlertTriangle, FileCode, Copy, RefreshCw } from 'lucide-react';
import { DashboardSettings, ProxyNode } from '../types/proxy';
import { buildSubscriptionBase64, buildNodeUri } from '../utils/v2ray';

interface LogsTabProps {
  settings: DashboardSettings;
  nodes: ProxyNode[];
  onShowToast: (text: string, type?: 'success' | 'info' | 'error') => void;
}

export const LogsTab: React.FC<LogsTabProps> = ({
  settings,
  nodes,
  onShowToast
}) => {
  const [activeTab, setActiveTab] = useState<'decoded' | 'base64' | 'diagnostics'>('decoded');

  const base64Feed = buildSubscriptionBase64(nodes);
  const activeNodes = nodes.filter(n => n.enabled);
  const decodedLinks = activeNodes.map(buildNodeUri).join('\n\n');

  // Diagnostics verification
  const isUuidValid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(settings.uuid);
  const isDomainValid = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(settings.domain);
  const isTokenValid = settings.subToken.length >= 16;
  const isTlsActive = settings.security === 'tls';

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    onShowToast(`Copied ${label} to clipboard!`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Diagnostics summary bar */}
      <div className="bg-[#0b1222] border border-slate-800/90 rounded-xl p-5">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-950/60 border border-cyan-800/50 rounded-lg text-cyan-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-100">Subscription Diagnostics & Raw Feed Inspector</h2>
              <p className="text-xs text-slate-400">
                Inspect the exact payload served to client subscription importers and verify protocol parameters.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 px-2.5 py-1 rounded-md font-mono">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{activeNodes.length} Nodes Active</span>
            </span>
          </div>
        </div>
      </div>

      {/* Validation checklist */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-[#0b1222] border border-slate-800 rounded-lg p-3 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 block">UUID Compliance</span>
            <span className="text-xs font-semibold text-slate-200">RFC-4122 v4</span>
          </div>
          {isUuidValid ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          )}
        </div>

        <div className="bg-[#0b1222] border border-slate-800 rounded-lg p-3 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 block">Edge Domain</span>
            <span className="text-xs font-semibold text-slate-200 truncate max-w-[130px] block">
              {settings.domain}
            </span>
          </div>
          {isDomainValid ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          )}
        </div>

        <div className="bg-[#0b1222] border border-slate-800 rounded-lg p-3 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 block">Subscription Token</span>
            <span className="text-xs font-semibold text-slate-200 font-mono">
              {settings.subToken.slice(0, 8)}...
            </span>
          </div>
          {isTokenValid ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          )}
        </div>

        <div className="bg-[#0b1222] border border-slate-800 rounded-lg p-3 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 block">TLS Termination</span>
            <span className="text-xs font-semibold text-slate-200">TLS 1.3 ALPN</span>
          </div>
          {isTlsActive ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          )}
        </div>
      </div>

      {/* Feed Inspector Tabs */}
      <div className="bg-[#0b1222] border border-slate-800/90 rounded-xl overflow-hidden shadow-sm">
        <div className="p-3 bg-[#080d19] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('decoded')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                activeTab === 'decoded'
                  ? 'bg-slate-800 text-cyan-300 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Decoded Node URIs ({activeNodes.length})
            </button>
            <button
              onClick={() => setActiveTab('base64')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                activeTab === 'base64'
                  ? 'bg-slate-800 text-cyan-300 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Base64 Subscription Feed
            </button>
          </div>

          <button
            onClick={() => handleCopy(activeTab === 'base64' ? base64Feed : decodedLinks, activeTab === 'base64' ? 'Base64 Feed' : 'Decoded URIs')}
            className="flex items-center gap-1.5 px-3 py-1 bg-[#101726] hover:bg-slate-800 text-xs text-slate-300 hover:text-white rounded border border-slate-750 transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy Feed</span>
          </button>
        </div>

        <div className="p-4">
          {activeTab === 'decoded' && (
            <div className="space-y-2">
              <pre className="font-mono text-xs bg-[#060a14] border border-slate-850 rounded-lg p-4 text-slate-300 whitespace-pre-wrap break-all max-h-96 overflow-y-auto">
                {decodedLinks || 'No enabled nodes.'}
              </pre>
              <p className="text-[11px] text-slate-500">
                Each line represents an independent VLESS / VMess / Trojan proxy node configuration.
              </p>
            </div>
          )}

          {activeTab === 'base64' && (
            <div className="space-y-2">
              <pre className="font-mono text-xs bg-[#060a14] border border-slate-850 rounded-lg p-4 text-cyan-300 whitespace-pre-wrap break-all max-h-96 overflow-y-auto">
                {base64Feed || 'No feed data.'}
              </pre>
              <p className="text-[11px] text-slate-500">
                Clients like v2rayNG and Nekobox fetch this Base64 blob from your static endpoint.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
