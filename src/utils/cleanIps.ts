import { CleanIPItem } from '../types/proxy';

export const DEFAULT_CLEAN_IPS: CleanIPItem[] = [
  { ip: '104.16.1.1', provider: 'Cloudflare Anycast', location: 'Frankfurt, DE', latency: 42, jitter: 3, loss: 0 },
  { ip: '104.17.2.2', provider: 'Cloudflare Anycast', location: 'London, UK', latency: 48, jitter: 4, loss: 0 },
  { ip: '172.67.1.1', provider: 'Cloudflare Anycast', location: 'Amsterdam, NL', latency: 39, jitter: 2, loss: 0 },
  { ip: '104.18.3.3', provider: 'Cloudflare Anycast', location: 'Helsinki, FI', latency: 55, jitter: 5, loss: 0 },
  { ip: '141.101.120.1', provider: 'Cloudflare Anycast', location: 'Vienna, AT', latency: 46, jitter: 3, loss: 0 },
  { ip: '188.114.96.1', provider: 'Cloudflare Anycast', location: 'Zurich, CH', latency: 44, jitter: 4, loss: 0 },
  { ip: '198.41.214.1', provider: 'Cloudflare Anycast', location: 'New York, US', latency: 110, jitter: 8, loss: 0 },
  { ip: '104.19.4.4', provider: 'Cloudflare Anycast', location: 'Los Angeles, US', latency: 135, jitter: 9, loss: 0 },
  { ip: '104.20.5.5', provider: 'Cloudflare Anycast', location: 'Singapore, SG', latency: 85, jitter: 6, loss: 0 },
  { ip: '104.21.6.6', provider: 'Cloudflare Anycast', location: 'Tokyo, JP', latency: 98, jitter: 7, loss: 0 },
  { ip: '104.22.7.7', provider: 'Cloudflare Anycast', location: 'Sydney, AU', latency: 170, jitter: 12, loss: 0 },
  { ip: '162.159.192.1', provider: 'Cloudflare Anycast', location: 'Paris, FR', latency: 45, jitter: 3, loss: 0 },
  { ip: '172.64.32.1', provider: 'Cloudflare Anycast', location: 'Stockholm, SE', latency: 52, jitter: 4, loss: 0 },
  { ip: '104.24.8.8', provider: 'Cloudflare Anycast', location: 'Madrid, ES', latency: 50, jitter: 5, loss: 0 }
];

export const REGIONAL_PRESETS: { [key: string]: { label: string; ips: string[] } } = {
  optimal: {
    label: 'Fastest Europe / Middle East',
    ips: ['172.67.1.1', '104.16.1.1', '188.114.96.1', '141.101.120.1']
  },
  asia: {
    label: 'Asia Pacific (Singapore / Tokyo)',
    ips: ['104.20.5.5', '104.21.6.6', '104.16.15.15']
  },
  north_america: {
    label: 'North America (US East & West)',
    ips: ['198.41.214.1', '104.19.4.4', '172.64.32.1']
  },
  bypass_firewall: {
    label: 'High Resilience / Anti-Censorship',
    ips: ['104.16.1.1', '141.101.120.1', '162.159.192.1', '188.114.96.1']
  }
};
