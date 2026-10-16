export type ProtocolType = 'VLESS' | 'VMess' | 'Trojan' | 'Shadowsocks';
export type TransportType = 'WS' | 'gRPC' | 'HTTPUpgrade';
export type AddressMode = 'Domain' | 'Clean IP' | 'Custom IP';
export type SecurityType = 'tls' | 'none' | 'reality';

export interface ProxyNode {
  id: string;
  name: string;
  protocol: ProtocolType;
  server: string;
  port: number;
  uuid: string;
  transport: TransportType;
  path: string;
  host: string;
  sni: string;
  security: SecurityType;
  alpn?: string;
  fingerprint?: string;
  earlyData?: string;
  cleanIp?: string;
  country?: string;
  ping?: number;
  enabled: boolean;
}

export interface CleanIPItem {
  ip: string;
  provider: string;
  location: string;
  latency?: number;
  jitter?: number;
  loss?: number;
  isTesting?: boolean;
}

export interface DashboardSettings {
  domain: string;
  uuid: string;
  subToken: string;
  protocol: ProtocolType;
  transport: TransportType;
  port: number;
  addressMode: AddressMode;
  path: string;
  sni: string;
  security: SecurityType;
  cleanIp: string;
  telegramSupport: string;
  author: string;
  theme: 'dark' | 'oled';
  isAuthenticated: boolean;
  adminPassword?: string;
}
