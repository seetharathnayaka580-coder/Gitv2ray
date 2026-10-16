import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  QrCode, 
  RefreshCw, 
  Eye, 
  Edit3, 
  Info, 
  ExternalLink,
  ShieldCheck,
  Radio
} from 'lucide-react';
import { DashboardSettings, ProxyNode } from '../types/proxy';
import { buildVlessUri, buildNodeUri, generateUUID, generateHexToken } from '../utils/v2ray';

interface OverviewTabProps {
  settings: DashboardSettings;
  activeNode: ProxyNode;
  onUpdateSettings: (newSettings: Partial<DashboardSettings>) => void;
  onUpdateNode: (nodeUpdate: Partial<ProxyNode>) => void;
  onShowToast: (text: string, type?: 'success' | 'info' | 'error') => void;
  onOpenQr: (title: string, data: string, subtitle?: string) => void;
  onOpenConfigPreview: (clientName: string, fileName: string) => void;
  onOpenDoctor: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  settings,
  activeNode,
  onUpdateSettings,
  onUpdateNode,
  onShowToast,
  onOpenQr,
  onOpenConfigPreview,
  onOpenDoctor
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isEditingHost, setIsEditingHost] = useState(false);
  const [tempHost, setTempHost] = useState(settings.domain);

  const copyToClipboard = (text: string, key: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    onShowToast(`Copied ${label} to clipboard!`);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  const handleRegenerateUuid = () => {
    const newUuid = generateUUID();
    onUpdateSettings({ uuid: newUuid });
    onUpdateNode({ uuid: newUuid });
    onShowToast('Generated new UUID!');
  };

  const handleRegenerateToken = () => {
    const newToken = generateHexToken();
    onUpdateSettings({ subToken: newToken });
    onShowToast('Generated new subscription token!');
  };

  const handleSaveHost = () => {
    if (!tempHost.trim()) return;
    const cleanHost = tempHost.trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    onUpdateSettings({ domain: cleanHost });
    onUpdateNode({ host: cleanHost, server: cleanHost, sni: cleanHost });
    setIsEditingHost(false);
    onShowToast(`Host updated to ${cleanHost}`);
  };

  const singleNodeUri = buildNodeUri(activeNode);

  // Subscription URLs
  const baseUrl = `https://${settings.domain}`;
  const universalSubUrl = `${baseUrl}/sub?token=${settings.subToken}`;
  const clashSubUrl = `${baseUrl}/sub?token=${settings.subToken}&clash`;
  const singBoxSubUrl = `${baseUrl}/sub?token=${settings.subToken}&sb`;
  const surgeSubUrl = `${baseUrl}/sub?token=${settings.subToken}&surge`;
  const loonSubUrl = `${baseUrl}/sub?token=${settings.subToken}&loon`;
  const quanxSubUrl = `${baseUrl}/sub?token=${settings.subToken}&quanx`;

  const clientLinks = [
    { id: 'clash', label: 'Clash / Mihomo', url: clashSubUrl, fileName: 'config.yaml' },
    { id: 'sb', label: 'sing-box', url: singBoxSubUrl, fileName: 'sing-box.json' },
    { id: 'surge', label: 'Surge', url: surgeSubUrl, fileName: 'surge.conf' },
    { id: 'loon', label: 'Loon', url: loonSubUrl, fileName: 'loon.conf' },
    { id: 'quanx', label: 'Quantumult X', url: quanxSubUrl, fileName: 'quanx.conf' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Host Doctor & Custom Domain Switcher */}
      <div className="bg-[#091122] border border-cyan-900/40 rounded-lg px-4 py-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-slate-400">Host Domain:</span>
          <span className="font-mono font-semibold text-cyan-300 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
            {settings.domain}
          </span>
          <div className="flex items-center gap-1.5 ml-1">
            <button
              onClick={() => {
                onUpdateSettings({ domain: 'tunnelwe.pages.dev' });
                onUpdateNode({ host: 'tunnelwe.pages.dev', server: 'tunnelwe.pages.dev', sni: 'tunnelwe.pages.dev' });
                onShowToast('Switched host to tunnelwe.pages.dev');
              }}
              className={`px-2 py-0.5 rounded text-[11px] transition-colors cursor-pointer ${
                settings.domain === 'tunnelwe.pages.dev'
                  ? 'bg-cyan-950 text-cyan-300 font-medium border border-cyan-800/60'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-900/60 hover:bg-slate-800'
              }`}
            >
              tunnelwe.pages.dev
            </button>
            <button
              onClick={() => {
                onUpdateSettings({ domain: 'ge.nvderttf56.pp.ua' });
                onUpdateNode({ host: 'ge.nvderttf56.pp.ua', server: 'ge.nvderttf56.pp.ua', sni: 'ge.nvderttf56.pp.ua' });
                onShowToast('Switched host to ge.nvderttf56.pp.ua');
              }}
              className={`px-2 py-0.5 rounded text-[11px] transition-colors cursor-pointer ${
                settings.domain === 'ge.nvderttf56.pp.ua'
                  ? 'bg-cyan-950 text-cyan-300 font-medium border border-cyan-800/60'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-900/60 hover:bg-slate-800'
              }`}
            >
              ge.nvderttf56.pp.ua
            </button>
          </div>
        </div>

        <button
          onClick={onOpenDoctor}
          className="flex items-center gap-1.5 text-xs text-amber-300 hover:text-amber-200 bg-amber-950/40 hover:bg-amber-900/40 border border-amber-800/50 px-2.5 py-1 rounded transition-colors cursor-pointer shrink-0"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          <span>Fix GitHub Host / Blank Screen</span>
        </button>
      </div>

      {/* Top Info Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {/* PROTOCOL */}
        <div className="bg-[#0b1222] border border-slate-800/90 rounded-lg p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 tracking-wider">
            <span>PROTOCOL</span>
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-sm md:text-base font-bold text-slate-100">{settings.protocol}</span>
            <select
              value={settings.protocol}
              onChange={(e) => {
                const val = e.target.value as any;
                onUpdateSettings({ protocol: val });
                onUpdateNode({ protocol: val });
              }}
              className="bg-slate-900 text-[11px] text-slate-300 border border-slate-800 rounded px-1.5 py-0.5 cursor-pointer outline-none hover:border-slate-700"
            >
              <option value="VLESS">VLESS</option>
              <option value="VMess">VMess</option>
              <option value="Trojan">Trojan</option>
            </select>
          </div>
        </div>

        {/* TRANSPORT */}
        <div className="bg-[#0b1222] border border-slate-800/90 rounded-lg p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 tracking-wider">
            <span>TRANSPORT</span>
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-sm md:text-base font-bold text-slate-100">{settings.transport}</span>
            <select
              value={settings.transport}
              onChange={(e) => {
                const val = e.target.value as any;
                onUpdateSettings({ transport: val });
                onUpdateNode({ transport: val });
              }}
              className="bg-slate-900 text-[11px] text-slate-300 border border-slate-800 rounded px-1.5 py-0.5 cursor-pointer outline-none hover:border-slate-700"
            >
              <option value="WS">WS</option>
              <option value="gRPC">gRPC</option>
            </select>
          </div>
        </div>

        {/* HOST */}
        <div className="bg-[#0b1222] border border-slate-800/90 rounded-lg p-3.5 flex flex-col justify-between md:col-span-1">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 tracking-wider">
            <span>HOST</span>
            <button
              onClick={() => {
                setIsEditingHost(!isEditingHost);
                setTempHost(settings.domain);
              }}
              className="text-slate-400 hover:text-cyan-400 transition-colors"
              title="Edit host"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="mt-2">
            {isEditingHost ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={tempHost}
                  onChange={(e) => setTempHost(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveHost()}
                  className="w-full bg-slate-900 border border-cyan-500 text-xs px-1.5 py-0.5 rounded text-slate-100 font-mono outline-none"
                  autoFocus
                />
                <button
                  onClick={handleSaveHost}
                  className="px-1.5 py-0.5 bg-cyan-600 text-[10px] rounded text-white"
                >
                  Save
                </button>
              </div>
            ) : (
              <span
                onClick={() => {
                  setIsEditingHost(true);
                  setTempHost(settings.domain);
                }}
                className="text-xs md:text-sm font-bold text-slate-100 font-mono truncate block cursor-pointer hover:text-cyan-300"
                title="Click to edit host"
              >
                {settings.domain}
              </span>
            )}
          </div>
        </div>

        {/* UUID */}
        <div className="bg-[#0b1222] border border-slate-800/90 rounded-lg p-3.5 flex flex-col justify-between col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 tracking-wider">
            <span>UUID</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleRegenerateUuid}
                className="text-slate-400 hover:text-cyan-400 transition-colors"
                title="Generate new UUID"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => copyToClipboard(settings.uuid, 'uuid', 'UUID')}
                className="text-slate-400 hover:text-slate-200 transition-colors"
                title="Copy UUID"
              >
                {copiedKey === 'uuid' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
          <div className="mt-2">
            <span
              className="text-[11px] font-mono text-slate-200 truncate block select-all"
              title={settings.uuid}
            >
              {settings.uuid}
            </span>
          </div>
        </div>

        {/* ADDRESS MODE */}
        <div className="bg-[#0b1222] border border-slate-800/90 rounded-lg p-3.5 flex flex-col justify-between col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 tracking-wider">
            <span>ADDRESS MODE</span>
            <span className="text-[10px] text-cyan-400 font-mono">CF CDN</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-sm md:text-base font-bold text-slate-100">{settings.addressMode}</span>
            <select
              value={settings.addressMode}
              onChange={(e) => {
                const mode = e.target.value as any;
                onUpdateSettings({ addressMode: mode });
                if (mode === 'Domain') {
                  onUpdateNode({ cleanIp: '' });
                } else if (mode === 'Clean IP') {
                  onUpdateNode({ cleanIp: settings.cleanIp || '104.16.1.1' });
                }
              }}
              className="bg-slate-900 text-[11px] text-slate-300 border border-slate-800 rounded px-1.5 py-0.5 cursor-pointer outline-none hover:border-slate-700"
            >
              <option value="Domain">Domain</option>
              <option value="Clean IP">Clean IP</option>
              <option value="Custom IP">Custom IP</option>
            </select>
          </div>
        </div>
      </div>

      {/* SUBSCRIPTION LINK SECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Subscription Link
          </h2>
          <button
            onClick={handleRegenerateToken}
            className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-cyan-400 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset Token</span>
          </button>
        </div>

        {/* Universal Subscription Box */}
        <div className="bg-[#0b1222] border border-slate-800/90 rounded-xl p-4 sm:p-5 space-y-4 shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-300">
                Universal (NetMod, v2rayNG, Hiddify, Nekobox...)
              </span>
              <button
                onClick={() => onOpenQr('Universal Subscription QR', universalSubUrl, 'Scan in v2rayNG, Hiddify, or Nekobox')}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-cyan-400 transition-colors"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Show QR</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 bg-[#070b16] border border-slate-800 rounded-lg px-3 py-2.5 overflow-hidden">
                <input
                  type="text"
                  readOnly
                  value={universalSubUrl}
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                  className="w-full bg-transparent text-xs sm:text-sm font-mono text-slate-200 outline-none select-all truncate"
                />
              </div>
              <button
                onClick={() => copyToClipboard(universalSubUrl, 'universal-sub', 'Universal Subscription Link')}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600 text-slate-950 font-semibold text-xs sm:text-sm rounded-lg transition-colors shrink-0 shadow-sm cursor-pointer"
              >
                {copiedKey === 'universal-sub' ? (
                  <>
                    <Check className="w-4 h-4 text-slate-950" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* In NetMod Instruction Box */}
          <div className="flex items-start gap-2.5 bg-[#09152b] border border-cyan-900/50 rounded-lg p-3 text-xs text-cyan-200/90">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <span className="font-semibold text-cyan-300">In NetMod:</span>{' '}
              <span className="text-white font-medium">Add → Import subscription</span> (or paste the link). Re-import after changing any setting.
            </p>
          </div>

          {/* Client-specific links */}
          <div className="space-y-2.5 pt-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-2">
              Client-specific links
            </span>

            {clientLinks.map((client) => {
              const isCopied = copiedKey === client.id;
              return (
                <div
                  key={client.id}
                  className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-[#080d19] border border-slate-800/90 rounded-lg p-2 sm:p-2.5 hover:border-slate-750 transition-colors"
                >
                  <div className="flex-1 bg-[#060a14] border border-slate-850 px-2.5 py-1.5 rounded text-xs font-mono text-slate-300 truncate">
                    {client.url}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 justify-end">
                    <button
                      onClick={() => onOpenConfigPreview(client.label, client.fileName)}
                      className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800/80 rounded transition-colors"
                      title={`Preview ${client.label} raw configuration`}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => copyToClipboard(client.url, client.id, `${client.label} link`)}
                      className="px-3 py-1.5 text-xs font-medium bg-[#101726] hover:bg-slate-800 border border-slate-750 text-slate-200 hover:text-white rounded transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <span>{client.label}</span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* SINGLE NODE LINK SECTION */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Single Node Link
          </h2>
          <button
            onClick={() => onOpenQr(`${activeNode.protocol} Single Node QR`, singleNodeUri, 'Scan with v2rayNG or Nekobox')}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-cyan-400 transition-colors"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Show QR</span>
          </button>
        </div>

        <div className="bg-[#0b1222] border border-slate-800/90 rounded-xl p-4 sm:p-5 shadow-sm space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-[#070b16] border border-slate-800 rounded-lg px-3 py-2.5 overflow-hidden">
              <input
                type="text"
                readOnly
                value={singleNodeUri}
                onClick={(e) => (e.target as HTMLInputElement).select()}
                className="w-full bg-transparent text-xs sm:text-sm font-mono text-slate-200 outline-none select-all truncate"
              />
            </div>
            <button
              onClick={() => copyToClipboard(singleNodeUri, 'single-node', 'Single Node URI')}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600 text-slate-950 font-semibold text-xs sm:text-sm rounded-lg transition-colors shrink-0 shadow-sm cursor-pointer"
            >
              {copiedKey === 'single-node' ? (
                <>
                  <Check className="w-4 h-4 text-slate-950" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <p className="text-xs text-slate-500">
            Uses your domain as the address, so normal ping works.
          </p>
        </div>
      </div>

      {/* Bottom Footer Attribution matching screenshot */}
      <div className="pt-6 pb-2 text-center text-xs text-slate-500">
        <span>Created by </span>
        <span className="font-semibold text-slate-400">{settings.author}</span>
        <span className="mx-2">·</span>
        <a
          href={settings.telegramSupport}
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyan-400 hover:text-cyan-300 transition-colors inline-flex items-center gap-1"
        >
          <span>Telegram Support</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};
