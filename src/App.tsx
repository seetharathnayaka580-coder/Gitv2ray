/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Navigation, TabType } from './components/Navigation';
import { OverviewTab } from './components/OverviewTab';
import { ConnectionTab } from './components/ConnectionTab';
import { AddressesTab } from './components/AddressesTab';
import { ProxyTab } from './components/ProxyTab';
import { LogsTab } from './components/LogsTab';
import { MoreTab } from './components/MoreTab';
import { Toast, ToastMessage } from './components/Toast';
import { QrModal } from './components/QrModal';
import { ConfigPreviewModal } from './components/ConfigPreviewModal';
import { AuthModal } from './components/AuthModal';
import { DashboardSettings, ProxyNode } from './types/proxy';
import { 
  buildClashYaml, 
  buildSingBoxJson, 
  buildSurgeConf, 
  buildLoonConf, 
  buildQuanXConf 
} from './utils/v2ray';

const INITIAL_SETTINGS: DashboardSettings = {
  domain: 'tunnelwe.pages.dev',
  uuid: '07e76a9a-f637-4cc8-9386-e21c6de4fa41',
  subToken: '2422eec360200f3e8b4c9774c7761a2a',
  protocol: 'VLESS',
  transport: 'WS',
  port: 443,
  addressMode: 'Domain',
  path: '/?ed=2048',
  sni: 'tunnelwe.pages.dev',
  security: 'tls',
  cleanIp: '',
  author: 'TX MASTER',
  telegramSupport: 'https://t.me/txmaster',
  theme: 'dark',
  isAuthenticated: true,
  adminPassword: ''
};

const INITIAL_NODES: ProxyNode[] = [
  {
    id: 'node-1',
    name: 'TUNNEL-X-Default',
    protocol: 'VLESS',
    server: 'tunnelwe.pages.dev',
    port: 443,
    uuid: '07e76a9a-f637-4cc8-9386-e21c6de4fa41',
    transport: 'WS',
    path: '/?ed=2048',
    host: 'tunnelwe.pages.dev',
    sni: 'tunnelwe.pages.dev',
    security: 'tls',
    fingerprint: 'chrome',
    alpn: 'h2,http/1.1',
    earlyData: '2048',
    cleanIp: '',
    enabled: true
  },
  {
    id: 'node-2',
    name: 'TUNNEL-X-CleanIP-DE',
    protocol: 'VLESS',
    server: 'tunnelwe.pages.dev',
    port: 443,
    uuid: '07e76a9a-f637-4cc8-9386-e21c6de4fa41',
    transport: 'WS',
    path: '/?ed=2048',
    host: 'tunnelwe.pages.dev',
    sni: 'tunnelwe.pages.dev',
    security: 'tls',
    fingerprint: 'chrome',
    alpn: 'h2,http/1.1',
    earlyData: '2048',
    cleanIp: '104.16.1.1',
    enabled: true
  },
  {
    id: 'node-3',
    name: 'TUNNEL-X-VMess-Edge',
    protocol: 'VMess',
    server: 'tunnelwe.pages.dev',
    port: 443,
    uuid: '07e76a9a-f637-4cc8-9386-e21c6de4fa41',
    transport: 'WS',
    path: '/?ed=2048',
    host: 'tunnelwe.pages.dev',
    sni: 'tunnelwe.pages.dev',
    security: 'tls',
    fingerprint: 'chrome',
    cleanIp: '',
    enabled: true
  },
  {
    id: 'node-4',
    name: 'TUNNEL-X-Trojan-Direct',
    protocol: 'Trojan',
    server: 'tunnelwe.pages.dev',
    port: 443,
    uuid: '07e76a9a-f637-4cc8-9386-e21c6de4fa41',
    transport: 'WS',
    path: '/?ed=2048',
    host: 'tunnelwe.pages.dev',
    sni: 'tunnelwe.pages.dev',
    security: 'tls',
    fingerprint: 'chrome',
    cleanIp: '',
    enabled: true
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [settings, setSettings] = useState<DashboardSettings>(() => {
    try {
      const saved = localStorage.getItem('tunnelx_settings');
      return saved ? { ...INITIAL_SETTINGS, ...JSON.parse(saved) } : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  const [nodes, setNodes] = useState<ProxyNode[]>(() => {
    try {
      const saved = localStorage.getItem('tunnelx_nodes');
      return saved ? JSON.parse(saved) : INITIAL_NODES;
    } catch {
      return INITIAL_NODES;
    }
  });

  const [activeNodeId, setActiveNodeId] = useState<string>(nodes[0]?.id || 'node-1');

  // Persistence
  useEffect(() => {
    try {
      localStorage.setItem('tunnelx_settings', JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save settings:', e);
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem('tunnelx_nodes', JSON.stringify(nodes));
    } catch (e) {
      console.warn('Failed to save nodes:', e);
    }
  }, [nodes]);

  // Toast Notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // QR Modal State
  const [qrModal, setQrModal] = useState<{
    isOpen: boolean;
    title: string;
    data: string;
    subtitle?: string;
  }>({
    isOpen: false,
    title: '',
    data: '',
    subtitle: ''
  });

  // Config Preview Modal State
  const [configModal, setConfigModal] = useState<{
    isOpen: boolean;
    clientName: string;
    fileName: string;
    content: string;
  }>({
    isOpen: false,
    clientName: '',
    fileName: '',
    content: ''
  });

  // Auth Modal State
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Active Node selector
  const activeNode = nodes.find((n) => n.id === activeNodeId) || nodes[0] || INITIAL_NODES[0];

  const handleUpdateSettings = (newSettings: Partial<DashboardSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const handleUpdateActiveNode = (updates: Partial<ProxyNode>) => {
    setNodes((prev) =>
      prev.map((node) => (node.id === activeNode.id ? { ...node, ...updates } : node))
    );
  };

  const handleUpdateSpecificNode = (id: string, updates: Partial<ProxyNode>) => {
    setNodes((prev) =>
      prev.map((node) => (node.id === id ? { ...node, ...updates } : node))
    );
  };

  const handleAddNode = (newNode: ProxyNode) => {
    setNodes((prev) => [...prev, newNode]);
    setActiveNodeId(newNode.id);
  };

  const handleDeleteNode = (id: string) => {
    if (nodes.length <= 1) {
      showToast('Cannot delete the last remaining node', 'error');
      return;
    }
    setNodes((prev) => prev.filter((n) => n.id !== id));
    if (activeNodeId === id) {
      const remaining = nodes.filter((n) => n.id !== id);
      if (remaining[0]) setActiveNodeId(remaining[0].id);
    }
    showToast('Node removed successfully');
  };

  const handleOpenConfigPreview = (clientName: string, fileName: string) => {
    let content = '';
    if (clientName.includes('Clash')) {
      content = buildClashYaml(nodes, settings.domain);
    } else if (clientName.includes('sing-box')) {
      content = buildSingBoxJson(nodes);
    } else if (clientName.includes('Surge')) {
      content = buildSurgeConf(nodes);
    } else if (clientName.includes('Loon')) {
      content = buildLoonConf(nodes);
    } else if (clientName.includes('Quantumult')) {
      content = buildQuanXConf(nodes);
    } else {
      content = buildClashYaml(nodes, settings.domain);
    }

    setConfigModal({
      isOpen: true,
      clientName,
      fileName,
      content
    });
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        isAuthenticated={settings.isAuthenticated}
        onSignOut={() => {
          handleUpdateSettings({ isAuthenticated: false });
          showToast('Signed out of dashboard', 'info');
        }}
        onSignInClick={() => setIsAuthOpen(true)}
        hostDomain={settings.domain}
      />

      {/* Navigation Tabs */}
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Viewport Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-6">
        {activeTab === 'overview' && (
          <OverviewTab
            settings={settings}
            activeNode={activeNode}
            onUpdateSettings={handleUpdateSettings}
            onUpdateNode={handleUpdateActiveNode}
            onShowToast={showToast}
            onOpenQr={(title, data, subtitle) =>
              setQrModal({ isOpen: true, title, data, subtitle })
            }
            onOpenConfigPreview={handleOpenConfigPreview}
          />
        )}

        {activeTab === 'connection' && (
          <ConnectionTab
            settings={settings}
            activeNode={activeNode}
            onUpdateSettings={handleUpdateSettings}
            onUpdateNode={handleUpdateActiveNode}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'addresses' && (
          <AddressesTab
            settings={settings}
            activeNode={activeNode}
            onUpdateSettings={handleUpdateSettings}
            onUpdateNode={handleUpdateActiveNode}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'proxy' && (
          <ProxyTab
            nodes={nodes}
            activeNodeId={activeNodeId}
            onSetActiveNode={setActiveNodeId}
            onAddNode={handleAddNode}
            onUpdateNode={handleUpdateSpecificNode}
            onDeleteNode={handleDeleteNode}
            onShowToast={showToast}
            onOpenQr={(title, data, subtitle) =>
              setQrModal({ isOpen: true, title, data, subtitle })
            }
          />
        )}

        {activeTab === 'logs' && (
          <LogsTab
            settings={settings}
            nodes={nodes}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'more' && (
          <MoreTab
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onShowToast={showToast}
          />
        )}
      </main>

      {/* QR Code Modal */}
      <QrModal
        isOpen={qrModal.isOpen}
        onClose={() => setQrModal((prev) => ({ ...prev, isOpen: false }))}
        title={qrModal.title}
        data={qrModal.data}
        subtitle={qrModal.subtitle}
        onCopySuccess={() => showToast('Copied string to clipboard!')}
      />

      {/* Config Preview Modal */}
      <ConfigPreviewModal
        isOpen={configModal.isOpen}
        onClose={() => setConfigModal((prev) => ({ ...prev, isOpen: false }))}
        clientName={configModal.clientName}
        fileName={configModal.fileName}
        configContent={configModal.content}
        onCopySuccess={() => showToast(`Copied ${configModal.clientName} configuration!`)}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        requiredPassword={settings.adminPassword}
        onSuccess={() => {
          handleUpdateSettings({ isAuthenticated: true });
          setIsAuthOpen(false);
          showToast('Dashboard unlocked successfully', 'success');
        }}
      />

      {/* Floating Toast Alerts */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
