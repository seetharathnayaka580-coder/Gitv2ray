import React, { useState } from 'react';
import { 
  Server, 
  Plus, 
  Copy, 
  Check, 
  QrCode, 
  Trash2, 
  Download, 
  Upload, 
  ArrowRight,
  Shield,
  Radio
} from 'lucide-react';
import { ProxyNode, ProtocolType, TransportType, SecurityType } from '../types/proxy';
import { buildNodeUri, parseNodeUri, generateUUID } from '../utils/v2ray';

interface ProxyTabProps {
  nodes: ProxyNode[];
  activeNodeId: string;
  onSetActiveNode: (id: string) => void;
  onAddNode: (node: ProxyNode) => void;
  onUpdateNode: (id: string, updates: Partial<ProxyNode>) => void;
  onDeleteNode: (id: string) => void;
  onShowToast: (text: string, type?: 'success' | 'info' | 'error') => void;
  onOpenQr: (title: string, data: string, subtitle?: string) => void;
}

export const ProxyTab: React.FC<ProxyTabProps> = ({
  nodes,
  activeNodeId,
  onSetActiveNode,
  onAddNode,
  onUpdateNode,
  onDeleteNode,
  onShowToast,
  onOpenQr
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [importUri, setImportUri] = useState('');

  // New Node Form State
  const [newNodeName, setNewNodeName] = useState('New Edge Proxy');
  const [newNodeProtocol, setNewNodeProtocol] = useState<ProtocolType>('VLESS');
  const [newNodeServer, setNewNodeServer] = useState('tunnelwe.pages.dev');
  const [newNodePort, setNewNodePort] = useState(443);
  const [newNodeTransport, setNewNodeTransport] = useState<TransportType>('WS');
  const [newNodePath, setNewNodePath] = useState('/?ed=2048');
  const [newNodeSecurity, setNewNodeSecurity] = useState<SecurityType>('tls');

  const handleCopyUri = (node: ProxyNode) => {
    const uri = buildNodeUri(node);
    navigator.clipboard.writeText(uri);
    setCopiedId(node.id);
    onShowToast(`Copied ${node.name} URI to clipboard!`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateNode = (e: React.FormEvent) => {
    e.preventDefault();
    const created: ProxyNode = {
      id: generateUUID(),
      name: newNodeName.trim() || 'Custom Node',
      protocol: newNodeProtocol,
      server: newNodeServer.trim(),
      port: newNodePort,
      uuid: generateUUID(),
      transport: newNodeTransport,
      path: newNodePath.trim(),
      host: newNodeServer.trim(),
      sni: newNodeServer.trim(),
      security: newNodeSecurity,
      fingerprint: 'chrome',
      alpn: 'h2,http/1.1',
      enabled: true
    };
    onAddNode(created);
    setShowAddModal(false);
    onShowToast(`Created new node: ${created.name}`);
  };

  const handleImportNode = () => {
    if (!importUri.trim()) return;
    const parsed = parseNodeUri(importUri.trim());
    if (parsed && parsed.server) {
      const imported: ProxyNode = {
        id: generateUUID(),
        name: parsed.name || 'Imported Node',
        protocol: parsed.protocol || 'VLESS',
        server: parsed.server,
        port: parsed.port || 443,
        uuid: parsed.uuid || generateUUID(),
        transport: parsed.transport || 'WS',
        path: parsed.path || '/',
        host: parsed.host || parsed.server,
        sni: parsed.sni || parsed.server,
        security: parsed.security || 'tls',
        fingerprint: parsed.fingerprint || 'chrome',
        alpn: parsed.alpn || 'h2,http/1.1',
        enabled: true
      };
      onAddNode(imported);
      setImportUri('');
      onShowToast(`Successfully imported ${imported.name}!`, 'success');
    } else {
      onShowToast('Could not parse node URI. Make sure it starts with vless://', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Bar */}
      <div className="bg-[#0b1222] border border-slate-800/90 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-cyan-950/60 border border-cyan-800/50 rounded-lg text-cyan-400">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-100">Proxy Nodes Management</h2>
            <p className="text-xs text-slate-400">
              Manage multi-protocol proxy nodes included in your subscription feed.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Node</span>
        </button>
      </div>

      {/* Node Cards List */}
      <div className="space-y-3">
        {nodes.map((node) => {
          const isSelected = activeNodeId === node.id;
          const uri = buildNodeUri(node);
          return (
            <div
              key={node.id}
              className={`bg-[#0b1222] border rounded-xl p-4 transition-all ${
                isSelected
                  ? 'border-cyan-500/80 shadow-[0_0_15px_rgba(6,182,212,0.12)]'
                  : 'border-slate-800/90 hover:border-slate-750'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-start sm:items-center gap-3">
                  <button
                    onClick={() => onSetActiveNode(node.id)}
                    className={`p-2 rounded-lg text-xs font-mono font-bold cursor-pointer transition-colors ${
                      node.protocol === 'VLESS'
                        ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/60'
                        : node.protocol === 'VMess'
                        ? 'bg-purple-950/80 text-purple-300 border border-purple-800/60'
                        : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                    }`}
                  >
                    {node.protocol}
                  </button>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-slate-100">{node.name}</h3>
                      {isSelected && (
                        <span className="text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-800/60 px-1.5 py-0.2 rounded font-medium">
                          Active on Overview
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 font-mono mt-1">
                      <span>{node.cleanIp ? node.cleanIp : node.server}:{node.port}</span>
                      <span>·</span>
                      <span>{node.transport}</span>
                      <span>·</span>
                      <span>{node.security.toUpperCase()}</span>
                      {node.cleanIp && (
                        <>
                          <span>·</span>
                          <span className="text-emerald-400">Clean IP Active</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  <button
                    onClick={() => onOpenQr(`${node.name} QR`, uri, `${node.protocol} Node`)}
                    className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-800/80 rounded-lg transition-colors cursor-pointer"
                    title="Show QR Code"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleCopyUri(node)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#080d19] hover:bg-slate-800 border border-slate-750 text-slate-200 text-xs font-medium rounded-lg transition-colors cursor-pointer"
                  >
                    {copiedId === node.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy URI</span>
                      </>
                    )}
                  </button>
                  {nodes.length > 1 && (
                    <button
                      onClick={() => onDeleteNode(node.id)}
                      className="p-2 text-slate-500 hover:text-rose-400 hover:bg-slate-800/80 rounded-lg transition-colors cursor-pointer"
                      title="Delete Node"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Collapsed URI Preview */}
              <div className="mt-3 pt-3 border-t border-slate-850/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span className="truncate max-w-xl">{uri}</span>
                <button
                  onClick={() => onSetActiveNode(node.id)}
                  className="text-cyan-400 hover:text-cyan-300 font-sans whitespace-nowrap ml-2 cursor-pointer"
                >
                  {isSelected ? 'Selected' : 'Select as primary'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Import Existing Node URI */}
      <div className="bg-[#0b1222] border border-slate-800/90 rounded-xl p-5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2.5 flex items-center gap-2">
          <Upload className="w-4 h-4 text-cyan-400" />
          <span>Import Node from Link</span>
        </h3>
        <p className="text-xs text-slate-400 mb-3">
          Paste any existing <code className="text-cyan-300">vless://</code> URI to parse configuration and add it to your static dashboard feed.
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="vless://07e76a9a...4fa41@tunnelwe.pages.dev:443?..."
            value={importUri}
            onChange={(e) => setImportUri(e.target.value)}
            className="flex-1 bg-[#070b16] border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 outline-none focus:border-cyan-500"
          />
          <button
            onClick={handleImportNode}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            Import Node
          </button>
        </div>
      </div>

      {/* Add Node Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0a0f1d] border border-slate-800 rounded-xl shadow-2xl p-6 max-w-md w-full text-slate-100">
            <h3 className="text-base font-semibold text-slate-100 mb-4">Create Custom Proxy Node</h3>
            <form onSubmit={handleCreateNode} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Node Remark / Name</label>
                <input
                  type="text"
                  value={newNodeName}
                  onChange={(e) => setNewNodeName(e.target.value)}
                  className="w-full bg-[#070b16] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Protocol</label>
                  <select
                    value={newNodeProtocol}
                    onChange={(e) => setNewNodeProtocol(e.target.value as any)}
                    className="w-full bg-[#070b16] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none"
                  >
                    <option value="VLESS">VLESS</option>
                    <option value="VMess">VMess</option>
                    <option value="Trojan">Trojan</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Transport</label>
                  <select
                    value={newNodeTransport}
                    onChange={(e) => setNewNodeTransport(e.target.value as any)}
                    className="w-full bg-[#070b16] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none"
                  >
                    <option value="WS">WebSocket</option>
                    <option value="gRPC">gRPC</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="text-xs text-slate-400 block mb-1">Server Host / Domain</label>
                  <input
                    type="text"
                    value={newNodeServer}
                    onChange={(e) => setNewNodeServer(e.target.value)}
                    className="w-full bg-[#070b16] border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 outline-none focus:border-cyan-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Port</label>
                  <input
                    type="number"
                    value={newNodePort}
                    onChange={(e) => setNewNodePort(parseInt(e.target.value, 10) || 443)}
                    className="w-full bg-[#070b16] border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">WebSocket Path</label>
                <input
                  type="text"
                  value={newNodePath}
                  onChange={(e) => setNewNodePath(e.target.value)}
                  className="w-full bg-[#070b16] border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 text-xs text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-xs font-medium text-white rounded-lg transition-colors shadow-sm"
                >
                  Add Node
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
