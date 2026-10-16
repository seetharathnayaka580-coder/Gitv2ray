import React, { useState } from 'react';
import { Globe2, Play, Check, Plus, RefreshCw, Zap, Server, Trash2 } from 'lucide-react';
import { CleanIPItem, DashboardSettings, ProxyNode } from '../types/proxy';
import { DEFAULT_CLEAN_IPS, REGIONAL_PRESETS } from '../utils/cleanIps';

interface AddressesTabProps {
  settings: DashboardSettings;
  activeNode: ProxyNode;
  onUpdateSettings: (newSettings: Partial<DashboardSettings>) => void;
  onUpdateNode: (nodeUpdate: Partial<ProxyNode>) => void;
  onShowToast: (text: string, type?: 'success' | 'info' | 'error') => void;
}

export const AddressesTab: React.FC<AddressesTabProps> = ({
  settings,
  activeNode,
  onUpdateSettings,
  onUpdateNode,
  onShowToast
}) => {
  const [cleanIps, setCleanIps] = useState<CleanIPItem[]>(DEFAULT_CLEAN_IPS);
  const [isTesting, setIsTesting] = useState(false);
  const [newIp, setNewIp] = useState('');
  const [newLocation, setNewLocation] = useState('');

  const handleRunPingTest = () => {
    setIsTesting(true);
    onShowToast('Running Clean IP latency diagnosis...', 'info');

    // Simulate real network latency test across edge nodes
    let currentIdx = 0;
    const interval = setInterval(() => {
      setCleanIps((prev) =>
        prev.map((item, idx) => {
          if (idx <= currentIdx) {
            // Realistic simulated latency with minor jitter
            const base = item.location.includes('DE') || item.location.includes('NL') || item.location.includes('UK')
              ? 35 + Math.floor(Math.random() * 20)
              : item.location.includes('US')
              ? 110 + Math.floor(Math.random() * 35)
              : item.location.includes('SG') || item.location.includes('JP')
              ? 80 + Math.floor(Math.random() * 25)
              : 50 + Math.floor(Math.random() * 30);
            return {
              ...item,
              latency: base,
              jitter: Math.floor(Math.random() * 6) + 1,
              isTesting: false
            };
          }
          return idx === currentIdx + 1 ? { ...item, isTesting: true } : item;
        })
      );

      currentIdx++;
      if (currentIdx >= cleanIps.length) {
        clearInterval(interval);
        setIsTesting(false);
        onShowToast('Latency diagnosis complete! Ranked fastest edge IPs.', 'success');
      }
    }, 150);
  };

  const handleApplyIp = (ip: string) => {
    onUpdateSettings({ cleanIp: ip, addressMode: 'Clean IP' });
    onUpdateNode({ cleanIp: ip });
    onShowToast(`Applied ${ip} as Clean IP node address!`, 'success');
  };

  const handleRevertDomain = () => {
    onUpdateSettings({ cleanIp: '', addressMode: 'Domain' });
    onUpdateNode({ cleanIp: '' });
    onShowToast(`Reverted address to domain (${settings.domain})`, 'info');
  };

  const handleAddCustomIp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIp.trim()) return;
    const item: CleanIPItem = {
      ip: newIp.trim(),
      provider: 'Custom Edge',
      location: newLocation.trim() || 'Custom Location',
      latency: 45,
      jitter: 2,
      loss: 0
    };
    setCleanIps([item, ...cleanIps]);
    setNewIp('');
    setNewLocation('');
    onShowToast(`Added custom clean address ${item.ip}`);
  };

  const handleDeleteIp = (ipToDelete: string) => {
    setCleanIps(cleanIps.filter((i) => i.ip !== ipToDelete));
    if (activeNode.cleanIp === ipToDelete) {
      handleRevertDomain();
    }
  };

  const sortedIps = [...cleanIps].sort((a, b) => (a.latency || 999) - (b.latency || 999));

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header card */}
      <div className="bg-[#0b1222] border border-slate-800/90 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-cyan-950/60 border border-cyan-800/50 rounded-lg text-cyan-400">
            <Globe2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-100">Clean IP & CDN Edge Addresses</h2>
            <p className="text-xs text-slate-400">
              When Cloudflare standard domains are throttled, route traffic through low-latency clean Anycast IP addresses.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRunPingTest}
            disabled={isTesting}
            className="flex items-center gap-2 px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer shadow-sm"
          >
            {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isTesting ? 'Testing Latency...' : 'Run Latency Test'}</span>
          </button>
          {activeNode.cleanIp ? (
            <button
              onClick={handleRevertDomain}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-750 text-xs text-slate-300 rounded-lg border border-slate-700 transition-colors"
            >
              Use Default Domain
            </button>
          ) : null}
        </div>
      </div>

      {/* Current Address Mode Status */}
      <div className="bg-[#080d19] border border-slate-800/90 rounded-lg p-3.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Current Node Address:</span>
          <span className="font-mono font-semibold text-cyan-400">
            {activeNode.cleanIp ? activeNode.cleanIp : `${settings.domain} (Default Domain)`}
          </span>
        </div>
        <span className="text-[11px] text-slate-500 font-mono">
          SNI / Host Header retains: {settings.domain}
        </span>
      </div>

      {/* Regional Presets */}
      <div>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-2.5">
          Quick Regional Presets
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {Object.entries(REGIONAL_PRESETS).map(([key, preset]) => (
            <div
              key={key}
              className="bg-[#0b1222] border border-slate-800 rounded-lg p-3 flex flex-col justify-between hover:border-slate-700 transition-colors"
            >
              <div>
                <span className="text-xs font-semibold text-slate-200 block mb-1">{preset.label}</span>
                <span className="text-[11px] font-mono text-slate-400 block truncate">
                  {preset.ips.join(', ')}
                </span>
              </div>
              <button
                onClick={() => handleApplyIp(preset.ips[0])}
                className="mt-3 text-[11px] text-cyan-400 hover:text-cyan-300 font-medium text-left flex items-center gap-1 cursor-pointer"
              >
                <span>Apply Best ({preset.ips[0]})</span>
                <Zap className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Clean IP Table */}
      <div className="bg-[#0b1222] border border-slate-800/90 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Available Anycast Edge IP Nodes ({sortedIps.length})
          </h3>
          <span className="text-[11px] text-slate-500 font-mono">
            Lowest latency first
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#070b16] text-slate-400 font-medium border-b border-slate-800/80">
              <tr>
                <th className="py-2.5 px-4">Edge IP Address</th>
                <th className="py-2.5 px-4">Edge Location</th>
                <th className="py-2.5 px-4">Provider</th>
                <th className="py-2.5 px-4 text-right">Latency</th>
                <th className="py-2.5 px-4 text-right">Status</th>
                <th className="py-2.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 font-mono">
              {sortedIps.map((item) => {
                const isSelected = activeNode.cleanIp === item.ip;
                const latencyColor = (item.latency || 0) < 60 ? 'text-emerald-400' : (item.latency || 0) < 120 ? 'text-cyan-400' : 'text-amber-400';
                return (
                  <tr
                    key={item.ip}
                    className={`hover:bg-slate-800/30 transition-colors ${
                      isSelected ? 'bg-cyan-950/20' : ''
                    }`}
                  >
                    <td className="py-2.5 px-4 font-semibold text-slate-200">
                      {item.ip}
                    </td>
                    <td className="py-2.5 px-4 font-sans text-slate-300">
                      {item.location}
                    </td>
                    <td className="py-2.5 px-4 font-sans text-slate-400 text-[11px]">
                      {item.provider}
                    </td>
                    <td className={`py-2.5 px-4 text-right font-bold ${latencyColor}`}>
                      {item.isTesting ? (
                        <span className="text-slate-500 text-[11px] animate-pulse">testing...</span>
                      ) : (
                        `${item.latency || 45} ms`
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      {isSelected ? (
                        <span className="text-[11px] font-sans text-emerald-400 font-semibold inline-flex items-center gap-1">
                          <Check className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="text-[11px] font-sans text-slate-500">Standby</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 font-sans">
                        <button
                          onClick={() => handleApplyIp(item.ip)}
                          disabled={isSelected}
                          className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/50 cursor-default'
                              : 'bg-slate-800 hover:bg-cyan-600 text-slate-200 hover:text-white border border-slate-700'
                          }`}
                        >
                          {isSelected ? 'Applied' : 'Use IP'}
                        </button>
                        <button
                          onClick={() => handleDeleteIp(item.ip)}
                          className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                          title="Remove IP"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Custom Address form */}
      <div className="bg-[#0b1222] border border-slate-800/90 rounded-xl p-5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5 text-cyan-400" />
          <span>Add Custom Clean IP or Domain</span>
        </h3>
        <form onSubmit={handleAddCustomIp} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="IP Address (e.g. 104.16.88.99)"
            value={newIp}
            onChange={(e) => setNewIp(e.target.value)}
            className="bg-[#070b16] border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 outline-none focus:border-cyan-500"
          />
          <input
            type="text"
            placeholder="Location description (e.g. Frankfurt, DE)"
            value={newLocation}
            onChange={(e) => setNewLocation(e.target.value)}
            className="bg-[#070b16] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-cyan-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 text-xs font-medium rounded-lg transition-colors cursor-pointer"
          >
            Add Address
          </button>
        </form>
      </div>
    </div>
  );
};
