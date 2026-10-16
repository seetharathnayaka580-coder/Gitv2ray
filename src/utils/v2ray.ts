import { ProxyNode } from '../types/proxy';

export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function generateHexToken(length: number = 32): string {
  const chars = '0123456789abcdef';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function buildVlessUri(node: ProxyNode): string {
  const address = node.cleanIp && node.cleanIp.trim() !== '' ? node.cleanIp.trim() : node.server;
  const params = new URLSearchParams();
  params.set('encryption', 'none');
  params.set('security', node.security);
  params.set('type', node.transport.toLowerCase());
  
  if (node.host) params.set('host', node.host);
  if (node.sni) params.set('sni', node.sni);
  if (node.path) params.set('path', node.path);
  if (node.alpn) params.set('alpn', node.alpn);
  if (node.fingerprint) params.set('fp', node.fingerprint);
  if (node.earlyData) params.set('ed', node.earlyData);

  const encodedRemark = encodeURIComponent(node.name);
  return `vless://${node.uuid}@${address}:${node.port}?${params.toString()}#${encodedRemark}`;
}

export function buildVmessUri(node: ProxyNode): string {
  const address = node.cleanIp && node.cleanIp.trim() !== '' ? node.cleanIp.trim() : node.server;
  const config = {
    v: '2',
    ps: node.name,
    add: address,
    port: node.port.toString(),
    id: node.uuid,
    aid: '0',
    scy: 'auto',
    net: node.transport.toLowerCase(),
    type: 'none',
    host: node.host || '',
    path: node.path || '/',
    tls: node.security === 'tls' ? 'tls' : '',
    sni: node.sni || node.host || '',
    alpn: node.alpn || ''
  };
  
  const jsonStr = JSON.stringify(config);
  const base64 = typeof window !== 'undefined' ? btoa(unescape(encodeURIComponent(jsonStr))) : Buffer.from(jsonStr).toString('base64');
  return `vmess://${base64}`;
}

export function buildTrojanUri(node: ProxyNode): string {
  const address = node.cleanIp && node.cleanIp.trim() !== '' ? node.cleanIp.trim() : node.server;
  const params = new URLSearchParams();
  params.set('security', node.security);
  params.set('type', node.transport.toLowerCase());
  if (node.host) params.set('host', node.host);
  if (node.sni) params.set('sni', node.sni);
  if (node.path) params.set('path', node.path);
  if (node.alpn) params.set('alpn', node.alpn);
  if (node.fingerprint) params.set('fp', node.fingerprint);

  const encodedRemark = encodeURIComponent(node.name);
  return `trojan://${node.uuid}@${address}:${node.port}?${params.toString()}#${encodedRemark}`;
}

export function buildNodeUri(node: ProxyNode): string {
  switch (node.protocol) {
    case 'VLESS':
      return buildVlessUri(node);
    case 'VMess':
      return buildVmessUri(node);
    case 'Trojan':
      return buildTrojanUri(node);
    default:
      return buildVlessUri(node);
  }
}

export function buildSubscriptionBase64(nodes: ProxyNode[]): string {
  const validNodes = nodes.filter(n => n.enabled);
  const uris = validNodes.map(buildNodeUri).join('\n');
  try {
    return btoa(unescape(encodeURIComponent(uris)));
  } catch {
    return '';
  }
}

export function parseNodeUri(uri: string): Partial<ProxyNode> | null {
  try {
    const trimmed = uri.trim();
    if (trimmed.startsWith('vless://')) {
      const url = new URL(trimmed);
      const uuid = url.username;
      const host = url.hostname;
      const port = parseInt(url.port || '443', 10);
      const name = decodeURIComponent(url.hash.replace(/^#/, '')) || 'Imported VLESS';
      const search = url.searchParams;

      return {
        protocol: 'VLESS',
        uuid,
        server: host,
        port,
        name,
        security: (search.get('security') as any) || 'tls',
        transport: search.get('type')?.toUpperCase() === 'GRPC' ? 'gRPC' : 'WS',
        host: search.get('host') || host,
        sni: search.get('sni') || host,
        path: search.get('path') || '/',
        fingerprint: search.get('fp') || 'chrome',
        alpn: search.get('alpn') || 'h2,http/1.1',
        enabled: true
      };
    }
    return null;
  } catch (err) {
    console.error('Failed to parse node URI:', err);
    return null;
  }
}

export function buildClashYaml(nodes: ProxyNode[], serverDomain: string): string {
  const activeNodes = nodes.filter(n => n.enabled);
  const proxyList = activeNodes.map(node => {
    const address = node.cleanIp && node.cleanIp.trim() !== '' ? node.cleanIp.trim() : node.server;
    return `  - name: "${node.name}"
    type: ${node.protocol.toLowerCase()}
    server: ${address}
    port: ${node.port}
    uuid: ${node.uuid}
    udp: true
    tls: ${node.security === 'tls'}
    servername: ${node.sni || node.host}
    client-fingerprint: ${node.fingerprint || 'chrome'}
    network: ${node.transport.toLowerCase()}
    ws-opts:
      path: "${node.path || '/'}"
      headers:
        Host: "${node.host || serverDomain}"`;
  }).join('\n');

  const proxyNames = activeNodes.map(n => `      - "${n.name}"`).join('\n');

  return `port: 7890
socks-port: 7891
allow-lan: false
mode: rule
log-level: info
ipv6: false

proxies:
${proxyList}

proxy-groups:
  - name: "TUNNEL-X-AUTO"
    type: url-test
    url: http://www.gstatic.com/generate_204
    interval: 300
    proxies:
${proxyNames}
  - name: "PROXY"
    type: select
    proxies:
      - "TUNNEL-X-AUTO"
${proxyNames}
      - DIRECT

rules:
  - DOMAIN-SUFFIX,local,DIRECT
  - IP-CIDR,127.0.0.0/8,DIRECT
  - IP-CIDR,192.168.0.0/16,DIRECT
  - MATCH,PROXY
`;
}

export function buildSingBoxJson(nodes: ProxyNode[]): string {
  const activeNodes = nodes.filter(n => n.enabled);
  const outbounds = activeNodes.map(node => {
    const address = node.cleanIp && node.cleanIp.trim() !== '' ? node.cleanIp.trim() : node.server;
    return {
      type: node.protocol.toLowerCase(),
      tag: node.name,
      server: address,
      server_port: node.port,
      uuid: node.uuid,
      transport: {
        type: node.transport.toLowerCase(),
        path: node.path || '/',
        headers: {
          Host: node.host
        }
      },
      tls: {
        enabled: node.security === 'tls',
        server_name: node.sni || node.host,
        utls: {
          enabled: true,
          fingerprint: node.fingerprint || 'chrome'
        }
      }
    };
  });

  const config = {
    log: {
      level: "info",
      timestamp: true
    },
    dns: {
      servers: [
        {
          tag: "cf-dns",
          address: "https://1.1.1.1/dns-query"
        }
      ]
    },
    inbounds: [
      {
        type: "mixed",
        tag: "mixed-in",
        listen: "127.0.0.1",
        listen_port: 2080
      }
    ],
    outbounds: [
      {
        type: "selector",
        tag: "select-out",
        outbounds: activeNodes.map(n => n.name).concat(["direct"])
      },
      ...outbounds,
      {
        type: "direct",
        tag: "direct"
      }
    ]
  };

  return JSON.stringify(config, null, 2);
}

export function buildSurgeConf(nodes: ProxyNode[]): string {
  const activeNodes = nodes.filter(n => n.enabled);
  const proxyLines = activeNodes.map(node => {
    const address = node.cleanIp && node.cleanIp.trim() !== '' ? node.cleanIp.trim() : node.server;
    return `${node.name} = ${node.protocol.toLowerCase()}, ${address}, ${node.port}, username=${node.uuid}, ws=true, ws-path=${node.path}, ws-headers=Host:${node.host}, tls=true, sni=${node.sni || node.host}`;
  }).join('\n');

  return `[General]
loglevel = notify
skip-proxy = 127.0.0.1, 192.168.0.0/16, 10.0.0.0/8, localhost, *.local
ipv6 = false

[Proxy]
${proxyLines}

[Proxy Group]
TUNNEL-X = select, ${activeNodes.map(n => n.name).join(', ')}

[Rule]
FINAL, TUNNEL-X
`;
}

export function buildLoonConf(nodes: ProxyNode[]): string {
  const activeNodes = nodes.filter(n => n.enabled);
  const proxyLines = activeNodes.map(node => {
    const address = node.cleanIp && node.cleanIp.trim() !== '' ? node.cleanIp.trim() : node.server;
    return `${node.name} = ${node.protocol.toLowerCase()}, ${address}, ${node.port}, "${node.uuid}", transport=ws, path=${node.path}, host=${node.host}, over-tls=true, tls-name=${node.sni || node.host}`;
  }).join('\n');

  return `[Proxy]
${proxyLines}

[Proxy Group]
TUNNEL-X = select, ${activeNodes.map(n => n.name).join(', ')}

[Rule]
FINAL, TUNNEL-X
`;
}

export function buildQuanXConf(nodes: ProxyNode[]): string {
  const activeNodes = nodes.filter(n => n.enabled);
  const proxyLines = activeNodes.map(node => {
    const address = node.cleanIp && node.cleanIp.trim() !== '' ? node.cleanIp.trim() : node.server;
    return `${node.protocol.toLowerCase()}=${address}:${node.port}, method=none, password=${node.uuid}, obfs=wss, obfs-host=${node.host}, obfs-uri=${node.path}, tls13=true, fast-open=false, udp-relay=false, tag=${node.name}`;
  }).join('\n');

  return `[server_local]
${proxyLines}

[policy]
static=TUNNEL-X, ${activeNodes.map(n => nodeTag(n.name)).join(', ')}, img-url=https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Global.png

[filter_local]
final, TUNNEL-X
`;
}

function nodeTag(name: string): string {
  return `"${name}"`;
}
