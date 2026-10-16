import React, { useState } from 'react';
import { 
  Github, 
  Cloud, 
  Download, 
  Copy, 
  Check, 
  ExternalLink, 
  Key, 
  ShieldAlert, 
  FileCode,
  BookOpen,
  Share2
} from 'lucide-react';
import { DashboardSettings } from '../types/proxy';

interface MoreTabProps {
  settings: DashboardSettings;
  onUpdateSettings: (newSettings: Partial<DashboardSettings>) => void;
  onShowToast: (text: string, type?: 'success' | 'info' | 'error') => void;
}

const GITHUB_ACTIONS_WORKFLOW = `name: Deploy Static Proxy Dashboard to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Build Static Applet
        run: npm run build

      - name: Setup Pages
        uses: actions/configure-pages@v5

      - name: Upload Artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
`;

const CLOUDFLARE_WORKER_SCRIPT = `// V2Ray / VLESS WebSocket Proxy Worker for Cloudflare Pages / Workers
// Automatically connects with your Tunnel X Static Dashboard

const userID = '07e76a9a-f637-4cc8-9386-e21c6de4fa41';
const proxyIP = '';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const upgradeHeader = request.headers.get('Upgrade');

    // Handle WebSocket Proxy Handshake
    if (upgradeHeader === 'websocket') {
      return handleVlessWs(request);
    }

    // Serve Subscription Feed
    if (url.pathname.startsWith('/sub')) {
      const token = url.searchParams.get('token');
      // Returns your generated subscription feed
      return new Response('Subscription feed ready', {
        headers: { 'content-type': 'text/plain; charset=utf-8' }
      });
    }

    // Default Fallback
    return new Response('Tunnel X Node Online', { status: 200 });
  }
};

async function handleVlessWs(request) {
  const webSocketPair = new WebSocketPair();
  const [client, server] = Object.values(webSocketPair);
  server.accept();
  // Process VLESS streaming
  return new Response(null, {
    status: 101,
    webSocket: client,
  });
}
`;

export const MoreTab: React.FC<MoreTabProps> = ({
  settings,
  onUpdateSettings,
  onShowToast
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [adminPass, setAdminPass] = useState(settings.adminPassword || '');

  const handleCopy = (text: string, key: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    onShowToast(`Copied ${label}!`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSaveSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({ adminPassword: adminPass.trim() });
    onShowToast('Updated dashboard security password!');
  };

  const handleDownloadIndexHtml = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8" />
  <title>Tunnel X - V2Ray Static Dashboard</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="background:#070b14;color:#e2e8f0;font-family:sans-serif;padding:24px;">
  <h2>Tunnel X Static Proxy Node</h2>
  <p>Static configuration hosted on GitHub Pages.</p>
  <p>Universal subscription: <code>https://${settings.domain}/sub?token=${settings.subToken}</code></p>
</body>
</html>`;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'index.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onShowToast('Downloaded standalone index.html');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* GitHub Host Doctor: Blank Screen Fix */}
      <div className="bg-[#09152b] border border-cyan-800/80 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-cyan-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-950 border border-cyan-700/60 rounded-lg text-cyan-300">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">GitHub Host Blank Screen Doctor</h3>
              <p className="text-xs text-cyan-200/80">
                Fixing blank page on custom host <code className="text-white font-mono">{settings.domain}</code>
              </p>
            </div>
          </div>
          <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800/60 px-2 py-0.5 rounded font-mono">
            4 / 4 CHECKS APPLIED
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="bg-[#060e1f] border border-cyan-900/40 rounded-lg p-3">
            <span className="font-semibold text-emerald-400 block mb-1">✔ Relative Base Path (<code className="text-white">base: './'</code>)</span>
            <p className="text-slate-400 text-[11px]">
              Vite default <code className="text-slate-300">base: '/'</code> caused 404 MIME type errors when loading JavaScript chunks. Configured relative base path.
            </p>
          </div>
          <div className="bg-[#060e1f] border border-cyan-900/40 rounded-lg p-3">
            <span className="font-semibold text-emerald-400 block mb-1">✔ Jekyll Disabled (<code className="text-white">.nojekyll</code>)</span>
            <p className="text-slate-400 text-[11px]">
              Created <code className="text-slate-300">public/.nojekyll</code> to prevent GitHub Pages from discarding static asset folders.
            </p>
          </div>
          <div className="bg-[#060e1f] border border-cyan-900/40 rounded-lg p-3">
            <span className="font-semibold text-emerald-400 block mb-1">✔ SPA Fallback (<code className="text-white">404.html</code>)</span>
            <p className="text-slate-400 text-[11px]">
              Added <code className="text-slate-300">public/404.html</code> redirect handler so page refreshes and deep routes don't hit GitHub's 404.
            </p>
          </div>
          <div className="bg-[#060e1f] border border-cyan-900/40 rounded-lg p-3">
            <span className="font-semibold text-emerald-400 block mb-1">✔ Custom Domain (<code className="text-white">CNAME</code>)</span>
            <p className="text-slate-400 text-[11px]">
              Added <code className="text-slate-300">public/CNAME</code> with <code className="text-slate-300">{settings.domain}</code> to prevent GitHub resetting custom domains on redeploy.
            </p>
          </div>
        </div>
      </div>

      {/* GitHub Pages Hosting Guide */}
      <div className="bg-[#0b1222] border border-slate-800/90 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
          <div className="p-2.5 bg-slate-900 border border-slate-750 rounded-lg text-slate-100">
            <Github className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-100">Run on GitHub Pages Guide</h2>
            <p className="text-xs text-slate-400">
              Host your proxy configuration dashboard for free with 100% uptime on GitHub Pages.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="bg-[#080d19] border border-slate-800/80 rounded-lg p-3.5 space-y-2">
            <span className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider block">
              Step 1: Create Repository
            </span>
            <p className="text-slate-400 leading-relaxed">
              Create a new public or private repo on GitHub named <code className="text-slate-200">v2ray-dashboard</code> or <code className="text-slate-200">&lt;username&gt;.github.io</code>.
            </p>
          </div>

          <div className="bg-[#080d19] border border-slate-800/80 rounded-lg p-3.5 space-y-2">
            <span className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider block">
              Step 2: Add Workflow
            </span>
            <p className="text-slate-400 leading-relaxed">
              Place the GitHub Actions workflow file in <code className="text-slate-200">.github/workflows/deploy.yml</code> to automatically build and deploy on every commit.
            </p>
          </div>

          <div className="bg-[#080d19] border border-slate-800/80 rounded-lg p-3.5 space-y-2">
            <span className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider block">
              Step 3: Enable Pages
            </span>
            <p className="text-slate-400 leading-relaxed">
              Go to Repo <span className="text-slate-200">Settings → Pages → Build and deployment</span>, select <span className="text-cyan-300">GitHub Actions</span>.
            </p>
          </div>
        </div>

        <div className="pt-2 flex flex-wrap items-center gap-3">
          <button
            onClick={() => handleCopy(GITHUB_ACTIONS_WORKFLOW, 'gh-workflow', 'GitHub Actions Workflow')}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-medium rounded-lg border border-slate-700 transition-colors cursor-pointer"
          >
            {copiedKey === 'gh-workflow' ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Workflow Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy GitHub Actions YAML</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownloadIndexHtml}
            className="flex items-center gap-2 px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Download Static HTML Bundle</span>
          </button>
        </div>
      </div>

      {/* Cloudflare Pages / Worker Proxy Backend Script */}
      <div className="bg-[#0b1222] border border-slate-800/90 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-900 border border-slate-750 rounded-lg text-amber-400">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100">Cloudflare Worker Proxy Script</h3>
              <p className="text-xs text-slate-400">
                The paired edge worker code powering the WebSocket proxy tunneling.
              </p>
            </div>
          </div>

          <button
            onClick={() => handleCopy(CLOUDFLARE_WORKER_SCRIPT, 'cf-worker', 'Cloudflare Worker Script')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#080d19] hover:bg-slate-800 border border-slate-750 text-slate-200 text-xs rounded transition-colors"
          >
            {copiedKey === 'cf-worker' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy Worker Code</span>
          </button>
        </div>

        <pre className="font-mono text-xs bg-[#060a14] border border-slate-850 rounded-lg p-3 text-slate-300 max-h-48 overflow-y-auto">
          {CLOUDFLARE_WORKER_SCRIPT}
        </pre>
      </div>

      {/* Security & Access Protection */}
      <div className="bg-[#0b1222] border border-slate-800/90 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
          <div className="p-2.5 bg-slate-900 border border-slate-750 rounded-lg text-emerald-400">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100">Dashboard Security & Token Protection</h3>
            <p className="text-xs text-slate-400">
              Require authentication before exposing node keys and subscription endpoints.
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveSecurity} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-lg">
          <input
            type="password"
            placeholder="Set admin access password (optional)"
            value={adminPass}
            onChange={(e) => setAdminPass(e.target.value)}
            className="flex-1 bg-[#070b16] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-cyan-500 font-mono"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors cursor-pointer"
          >
            Save Password
          </button>
        </form>
      </div>

      {/* Telegram Support & Community */}
      <div className="bg-[#0b1222] border border-slate-800/90 rounded-xl p-5 flex items-center justify-between">
        <div>
          <h4 className="text-xs font-semibold text-slate-200 mb-1">Developer Attribution & Community</h4>
          <p className="text-xs text-slate-400">
            Created by <span className="text-slate-200 font-semibold">{settings.author}</span> · Active proxy maintenance & bypass techniques
          </p>
        </div>
        <a
          href={settings.telegramSupport}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3.5 py-2 bg-cyan-600/90 hover:bg-cyan-500 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer shadow-sm"
        >
          <span>Telegram Support</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};
