export interface ServerFile {
  name: string;
  enabled: boolean;
  lastSent?: string;
  status: 'sent' | 'pending' | 'failed' | 'disabled';
}

export interface Server {
  id: string;
  name: string;
  type: string;
  status: string;
  location: string;
  ip: string;
  cpu: number;
  memory: number;
  disk: number;
  uptime: string;
  os: string;
  loadAverage: string;
  responseTime: number;
  lastCheck: string;
  files: ServerFile[];
}

export const servers: Server[] = [
  {
    id: '1',
    name: 'Web Server 01',
    type: 'web',
    status: 'online',
    location: 'New York, US',
    ip: '192.168.1.10',
    cpu: 45,
    memory: 62,
    disk: 78,
    uptime: '15 days, 4 hours',
    os: 'Ubuntu 22.04 LTS',
    loadAverage: '0.85, 0.92, 1.01',
    responseTime: 142,
    lastCheck: '2 minutes ago',
    files: [
      { name: 'ELIPS', enabled: true, lastSent: '2 hours ago', status: 'sent' },
      { name: 'PMM', enabled: true, lastSent: '1 hour ago', status: 'sent' },
      { name: 'PartsData', enabled: false, status: 'disabled' },
      { name: 'Seedz', enabled: true, lastSent: '30 minutes ago', status: 'sent' }
    ]
  },
  {
    id: '2',
    name: 'Database Server',
    type: 'database',
    status: 'online',
    location: 'London, UK',
    ip: '192.168.1.20',
    cpu: 72,
    memory: 84,
    disk: 65,
    uptime: '8 days, 12 hours',
    os: 'CentOS 8',
    loadAverage: '1.25, 1.18, 1.32',
    responseTime: 89,
    lastCheck: '1 minute ago',
    files: [
      { name: 'ELIPS', enabled: true, lastSent: '3 hours ago', status: 'sent' },
      { name: 'PMM', enabled: true, status: 'pending' },
      { name: 'PartsData', enabled: true, lastSent: '45 minutes ago', status: 'sent' },
      { name: 'Seedz', enabled: false, status: 'disabled' }
    ]
  },
  {
    id: '3',
    name: 'API Gateway',
    type: 'api',
    status: 'warning',
    location: 'Tokyo, JP',
    ip: '192.168.1.30',
    cpu: 89,
    memory: 91,
    disk: 45,
    uptime: '3 days, 8 hours',
    os: 'Ubuntu 20.04 LTS',
    loadAverage: '2.15, 2.08, 1.95',
    responseTime: 245,
    lastCheck: '30 seconds ago',
    files: [
      { name: 'ELIPS', enabled: true, status: 'failed' },
      { name: 'PMM', enabled: true, lastSent: '2 hours ago', status: 'sent' },
      { name: 'PartsData', enabled: true, status: 'pending' },
      { name: 'Seedz', enabled: true, lastSent: '1 hour ago', status: 'sent' }
    ]
  },
  {
    id: '4',
    name: 'File Server',
    type: 'web',
    status: 'online',
    location: 'Frankfurt, DE',
    ip: '192.168.1.40',
    cpu: 23,
    memory: 45,
    disk: 92,
    uptime: '22 days, 16 hours',
    os: 'Debian 11',
    loadAverage: '0.45, 0.52, 0.48',
    responseTime: 67,
    lastCheck: '1 minute ago',
    files: [
      { name: 'ELIPS', enabled: true, lastSent: '1 hour ago', status: 'sent' },
      { name: 'PMM', enabled: true, lastSent: '30 minutes ago', status: 'sent' },
      { name: 'PartsData', enabled: true, lastSent: '15 minutes ago', status: 'sent' },
      { name: 'Seedz', enabled: true, lastSent: '45 minutes ago', status: 'sent' }
    ]
  },
  {
    id: '5',
    name: 'Backup Server',
    type: 'database',
    status: 'offline',
    location: 'Sydney, AU',
    ip: '192.168.1.50',
    cpu: 0,
    memory: 0,
    disk: 88,
    uptime: 'Offline',
    os: 'Ubuntu 22.04 LTS',
    loadAverage: 'N/A',
    responseTime: 0,
    lastCheck: '5 minutes ago',
    files: [
      { name: 'ELIPS', enabled: false, status: 'disabled' },
      { name: 'PMM', enabled: false, status: 'disabled' },
      { name: 'PartsData', enabled: false, status: 'disabled' },
      { name: 'Seedz', enabled: false, status: 'disabled' }
    ]
  },
  {
    id: '6',
    name: 'Load Balancer',
    type: 'api',
    status: 'online',
    location: 'Singapore, SG',
    ip: '192.168.1.60',
    cpu: 34,
    memory: 56,
    disk: 34,
    uptime: '45 days, 2 hours',
    os: 'NGINX Plus',
    loadAverage: '0.78, 0.82, 0.75',
    responseTime: 23,
    lastCheck: '45 seconds ago',
    files: [
      { name: 'ELIPS', enabled: true, lastSent: '20 minutes ago', status: 'sent' },
      { name: 'PMM', enabled: false, status: 'disabled' },
      { name: 'PartsData', enabled: true, status: 'pending' },
      { name: 'Seedz', enabled: true, lastSent: '10 minutes ago', status: 'sent' }
    ]
  }
];