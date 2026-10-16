import React from 'react';
import { Network, Lock, Sliders, Shield, Zap, Check } from 'lucide-react';
import { DashboardSettings, ProxyNode, TransportType, SecurityType } from '../types/proxy';

interface ConnectionTabProps {
  settings: DashboardSettings;
  activeNode: ProxyNode;
  onUpdateSettings: (newSettings: Partial<DashboardSettings>) => void;
  onUpdateNode: (nodeUpdate: Partial<ProxyNode>) => void;
  onShowToast: (text: string, type?: 'success' | 'info' | 'error') => void;
}

const CF_TLS_PORTS = [443, 2053, 2083, 2087, 2096, 8443];
const CF_NON_TLS_PORTS = [80, 8080, 8880, 2052, 2082, 2086, 2095];
const FINGERPRINTS = ['chrome', 'firefox', 'safari', 'edge', 'ios', 'randomized'];

export const ConnectionTab: React.FC<ConnectionTabProps> = ({
  settings,
  activeNode,
  onUpdateSettings,
  onUpdateNode,
  onShowToast
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header intro */}
      <div className="bg-[#0b1222] border border-slate-800/90 rounded-xl p-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-cyan-950/60 border border-cyan-800/50 rounded-lg text-cyan-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-100">Connection & Transport Parameters</h2>
            <p className="text-xs text-slate-400">
              Configure TLS handshakes, WebSocket streaming paths, Cloudflare edge ports, and 0-RTT acceleration.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Port & Security card */}
        <div className="bg-[#0b1222] border border-slate-800/90 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Lock className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Port & TLS Encryption
            </h3>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-400 block mb-2">
              Connection Port
            </label>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {CF_TLS_PORTS.slice(0, 6).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    onUpdateSettings({ port: p });
                    onUpdateNode({ port: p });
                    onShowToast(`Port changed to ${p}`);
                  }}
                  className={`py-2 px-3 text-xs font-mono rounded-lg border transition-all cursor-pointer ${
                    activeNode.port === p
                      ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 font-bold'
                      : 'bg-[#080d19] border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  {p} {p === 443 ? '(HTTPS)' : ''}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500">Custom Port:</span>
              <input
                type="number"
                value={activeNode.port}
                onChange={(e) => {
                  const p = parseInt(e.target.value, 10) || 443;
                  onUpdateSettings({ port: p });
                  onUpdateNode({ port: p });
                }}
                className="w-24 bg-[#070b16] border border-slate-800 rounded px-2.5 py-1 text-xs font-mono text-slate-200 outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-400 block mb-1.5">
              Security Protocol
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['tls', 'none'] as SecurityType[]).map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => {
                    onUpdateSettings({ security: sec });
                    onUpdateNode({ security: sec });
                    onShowToast(`Security set to ${sec.toUpperCase()}`);
                  }}
                  className={`py-2 px-3 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                    activeNode.security === sec
                      ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                      : 'bg-[#080d19] border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {sec === 'tls' ? 'TLS 1.3 (Recommended)' : 'None (Plaintext)'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-400 block mb-1">
              TLS Server Name Indication (SNI)
            </label>
            <input
              type="text"
              value={activeNode.sni || ''}
              onChange={(e) => onUpdateNode({ sni: e.target.value })}
              placeholder="e.g. tunnelwe.pages.dev"
              className="w-full bg-[#070b16] border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 outline-none focus:border-cyan-500"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              Match your CDN hostname so the edge certificate validates without warnings.
            </span>
          </div>
        </div>

        {/* Transport & Path card */}
        <div className="bg-[#0b1222] border border-slate-800/90 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Network className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Transport & Header Mappings
            </h3>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-400 block mb-1.5">
              Transport Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['WS', 'gRPC'] as TransportType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    onUpdateSettings({ transport: t });
                    onUpdateNode({ transport: t });
                    onShowToast(`Transport set to ${t}`);
                  }}
                  className={`py-2 px-3 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                    activeNode.transport === t
                      ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                      : 'bg-[#080d19] border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {t === 'WS' ? 'WebSocket (WS)' : 'gRPC'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-400 block mb-1">
              WebSocket Path
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={activeNode.path || '/'}
                onChange={(e) => onUpdateNode({ path: e.target.value })}
                placeholder="/?ed=2048"
                className="w-full bg-[#070b16] border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 outline-none focus:border-cyan-500"
              />
              <button
                type="button"
                onClick={() => onUpdateNode({ path: '/?ed=2048' })}
                className="px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-[11px] text-cyan-300 rounded-lg border border-slate-700 whitespace-nowrap"
              >
                + 0-RTT
              </button>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Append <code className="text-cyan-400">?ed=2048</code> to activate Early Data 0-RTT handshake acceleration.
            </span>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-400 block mb-1">
              Host Header
            </label>
            <input
              type="text"
              value={activeNode.host || ''}
              onChange={(e) => onUpdateNode({ host: e.target.value })}
              placeholder="e.g. tunnelwe.pages.dev"
              className="w-full bg-[#070b16] border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-400 block mb-1">
              uTLS Fingerprint
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {FINGERPRINTS.map((fp) => (
                <button
                  key={fp}
                  type="button"
                  onClick={() => onUpdateNode({ fingerprint: fp })}
                  className={`py-1.5 px-2 text-[11px] rounded border transition-colors cursor-pointer ${
                    activeNode.fingerprint === fp
                      ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 font-semibold'
                      : 'bg-[#080d19] border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {fp}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
