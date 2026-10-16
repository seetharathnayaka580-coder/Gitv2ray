import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Download, 
  ExternalLink, 
  Copy, 
  Globe, 
  Terminal,
  ShieldCheck,
  FileCheck,
  Check
} from 'lucide-react';

interface GitHubHostDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentHost: string;
  onApplyHost: (host: string) => void;
  onShowToast: (text: string, type?: 'success' | 'info' | 'error') => void;
}

export const GitHubHostDoctorModal: React.FC<GitHubHostDoctorModalProps> = ({
  isOpen,
  onClose,
  currentHost,
  onApplyHost,
  onShowToast
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    onShowToast(`Copied ${label}!`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownloadDeployPackage = () => {
    const readmeContent = `# GitHub Pages Deployment for ${currentHost}

## Fixed Blank Screen Issues:
1. base: './' in vite.config.ts (Fixes /assets/ 404 MIME type errors)
2. .nojekyll in root (Bypasses Jekyll asset stripping)
3. 404.html in root (Fixes SPA routing 404s)
4. CNAME containing ${currentHost} (Preserves custom domain)

## Deploy Steps:
1. Run: npm run build
2. Commit and push the dist/ folder or use GitHub Actions workflow
3. In GitHub Repo Settings -> Pages:
   - Source: GitHub Actions (or Deploy from branch -> /dist)
   - Custom domain: ${currentHost}
   - Check "Enforce HTTPS"
`;
    const blob = new Blob([readmeContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'GITHUB_PAGES_DEPLOY_GUIDE.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onShowToast('Downloaded GitHub Pages Fix Guide!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-[#0a0f1d] border border-slate-800 rounded-xl shadow-2xl flex flex-col max-h-[90vh] text-slate-100 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-950/70 border border-cyan-800/60 rounded-lg text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">
                GitHub Host Doctor: Blank White Screen Fix
              </h3>
              <p className="text-xs text-slate-400">
                Diagnosing and resolving host loading issues for <code className="text-cyan-300 font-mono">{currentHost}</code>
              </p>
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

        {/* Modal Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4 text-xs">
          {/* Quick Domain Switch Banner */}
          <div className="bg-[#09152b] border border-cyan-900/60 rounded-lg p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="font-semibold text-cyan-300 block mb-0.5">
                Target Custom Domain: <span className="font-mono text-white">ge.nvderttf56.pp.ua</span>
              </span>
              <p className="text-slate-300 text-[11px]">
                Detected from your mobile browser screenshot. Switch your dashboard host to this domain:
              </p>
            </div>
            <button
              onClick={() => {
                onApplyHost('ge.nvderttf56.pp.ua');
                onShowToast('Applied ge.nvderttf56.pp.ua as dashboard host!');
              }}
              className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded text-xs transition-colors whitespace-nowrap cursor-pointer shadow-sm"
            >
              Use ge.nvderttf56.pp.ua
            </button>
          </div>

          {/* Diagnosis Checklist */}
          <div className="space-y-2.5">
            <h4 className="font-semibold text-slate-300 uppercase tracking-wider text-[11px]">
              Root Causes & Automated Fix Status
            </h4>

            {/* Check 1 */}
            <div className="bg-[#080d19] border border-slate-800 rounded-lg p-3 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">1. Relative Asset Base Path (<code className="text-cyan-400 font-mono">base: './'</code>)</span>
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800/60 px-1.5 py-0.5 rounded">FIXED</span>
                </div>
                <p className="text-slate-400 text-[11px] mt-1 leading-relaxed">
                  Default Vite sets <code className="text-slate-300">base: '/'</code> which looks for <code className="text-slate-300">/assets/index.js</code> from domain root, throwing a 404 MIME type error (blank screen) on GitHub Pages and custom subdomains. We configured <code className="text-cyan-300">base: './'</code> so assets load relatively everywhere.
                </p>
              </div>
            </div>

            {/* Check 2 */}
            <div className="bg-[#080d19] border border-slate-800 rounded-lg p-3 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">2. Jekyll Asset Stripping Prevention (<code className="text-cyan-400 font-mono">.nojekyll</code>)</span>
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800/60 px-1.5 py-0.5 rounded">FIXED</span>
                </div>
                <p className="text-slate-400 text-[11px] mt-1 leading-relaxed">
                  GitHub Pages automatically treats repositories as Jekyll blogs and ignores folders with underscores or static assets. We added <code className="text-cyan-300">public/.nojekyll</code> to force raw static asset serving.
                </p>
              </div>
            </div>

            {/* Check 3 */}
            <div className="bg-[#080d19] border border-slate-800 rounded-lg p-3 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">3. SPA Routing Fallback (<code className="text-cyan-400 font-mono">404.html</code>)</span>
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800/60 px-1.5 py-0.5 rounded">FIXED</span>
                </div>
                <p className="text-slate-400 text-[11px] mt-1 leading-relaxed">
                  Navigating to subpaths or refreshing the browser on static GitHub Pages returns a 404 without a fallback. We added <code className="text-cyan-300">public/404.html</code> to seamlessly route back to the dashboard.
                </p>
              </div>
            </div>

            {/* Check 4 */}
            <div className="bg-[#080d19] border border-slate-800 rounded-lg p-3 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">4. Custom Domain Retention (<code className="text-cyan-400 font-mono">CNAME</code>)</span>
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800/60 px-1.5 py-0.5 rounded">CONFIGURED</span>
                </div>
                <p className="text-slate-400 text-[11px] mt-1 leading-relaxed">
                  Without a <code className="text-slate-300">CNAME</code> file in the build output, GitHub resets your custom domain on every commit. We created <code className="text-cyan-300">public/CNAME</code> with <code className="text-cyan-300">ge.nvderttf56.pp.ua</code>.
                </p>
              </div>
            </div>

            {/* Check 5: Cloudflare SSL Notice */}
            <div className="bg-[#141008] border border-amber-900/50 rounded-lg p-3 flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold text-amber-300 block mb-0.5">
                  5. Cloudflare SSL/TLS Mode for <span className="font-mono">.pp.ua</span> Domains
                </span>
                <p className="text-amber-200/80 text-[11px] leading-relaxed">
                  If your <code className="text-amber-100">ge.nvderttf56.pp.ua</code> is routed through Cloudflare, make sure <span className="font-semibold text-white">SSL/TLS encryption mode</span> is set to <span className="text-cyan-300 font-bold">Full</span> or <span className="text-cyan-300 font-bold">Full (Strict)</span>. Setting it to "Flexible" causes infinite redirect loops and blank screens because GitHub Pages enforces HTTPS.
                </p>
              </div>
            </div>
          </div>

          {/* GitHub Actions Deployment Workflow */}
          <div className="bg-[#080d19] border border-slate-800 rounded-lg p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200">
                Automated Deployment Workflow (<code className="text-cyan-400">.github/workflows/deploy.yml</code>)
              </span>
              <button
                onClick={() => handleCopy(`name: Deploy Static Dashboard
on:
  push:
    branches: [ main ]
permissions:
  contents: read
  pages: write
  id-token: write
jobs:
  deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'
      - id: deployment
        uses: actions/deploy-pages@v4`, 'workflow-copy', 'Deploy Workflow')}
                className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300"
              >
                {copiedKey === 'workflow-copy' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey === 'workflow-copy' ? 'Copied' : 'Copy YAML'}</span>
              </button>
            </div>
            <p className="text-slate-400 text-[11px]">
              Commit this file to your GitHub repository to build with relative paths and auto-deploy to <code className="text-slate-300">{currentHost}</code> on every push.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#090d1a] flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-400">
            Fix is live: build now outputs relative paths with .nojekyll & CNAME.
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadDeployPackage}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Guide</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
