
export interface FileSetting {
  name: string;
  type: string; // 'elips' | 'pmm' | 'parts' | 'seedz' etc.
  enabled: boolean;
  status: string;
  lastSent?: string;
}
export interface DealerFile {
  id: string;
  type?: string;
  shipmentType?: string; // e.g., 'Delta', 'Standard'
  shipmentDatetime?: string; // ISO date string
  dataStartDatetime?: string; // ISO date string
  dataEndDatetime?: string; // ISO date string
  fileName?: string; // e.g., 'DLR2JD_ELIPS_Delta
  fileSizeMb?: number; // size in MB
  sended?: boolean; // true if the file has been sent
}


export interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
}


export interface Dealer {
  id: string;
  name: string;
  location: string;
  dealerId?: string;
  clientId?: string;
  status: 'Active' | 'Inactive';
  server: string;
  dbArchitecture?: string; // e.g., 'web', 'database', 'api', 'fabric'
  sapSystem?: string;
  contacts: Contact[];
  files: DealerFile[];
  fileSettings: FileSetting[]; // configuración local (qué se espera que esté activo)
}

export const dealers: Dealer[] = [
  {
    id: '1',
    name: 'Gonzalez Trading',
    location: 'Puerto Rico',
    dealerId: '252830',
    clientId: 'PR',
    server: 'Fabric',
    status: 'Active',
    dbArchitecture: 'B1 HANA',
    sapSystem: 'SAP B1 HANA',
    contacts: [
      { id: '1', name: 'Edwin Perez', email: 'eperez@teselta.com', phone: '555-1234' }
    ],
    files: [

    ],
    fileSettings: [
      {
        name: 'ELIPS',
        type: 'elips',
        enabled: true,
        status: '',
        lastSent: ''
      },
      {
        name: 'PMM',
        type: 'pmm',
        enabled: true,
        status: '',
        lastSent: ''
      },
      {
        name: 'Parts Data',
        type: 'partsdata',
        enabled: true,
        status: '',
        lastSent: ''
      },
      {
        name: 'Seedz',
        type: 'seedz',
        enabled: false,
        status: '',
        lastSent: ''
      }
    ]
  },
  {
    id: '2',
    name: 'Baeza',
    location: 'Republica Dominicana',
    dealerId: '252830',
    clientId: 'RD',
    server: 'Fabric',
    status: 'Active',
    dbArchitecture: 'B1 HANA',
    sapSystem: 'SAP B1 HANA',
    contacts: [
      { id: '1', name: 'Edwin Perez', email: 'eperez@teselta.com', phone: '555-1234' }
    ],
    files: [

    ],
    fileSettings: [
      {
        name: 'ELIPS',
        type: 'elips',
        enabled: true,
        status: '',
        lastSent: ''
      },
      {
        name: 'PMM',
        type: 'pmm',
        enabled: true,
        status: '',
        lastSent: ''
      },
      {
        name: 'Parts Data',
        type: 'partsdata',
        enabled: true,
        status: '',
        lastSent: ''
      },
      {
        name: 'Seedz',
        type: 'seedz',
        enabled: false,
        status: '',
        lastSent: ''
      }
    ]
  },
  {
    id: '3',
    name: 'MATRA',
    location: 'Costa Rica',
    dealerId: '4M1610',
    clientId: 'MATRA',
    server: 'Fabric',
    status: 'Active',
    dbArchitecture: 'MYSQL',
    sapSystem: 'SAP HANA',
    contacts: [
      { id: '1', name: 'Christian Ramirez Vargas', email: 'cramirez@matra.co.cr', phone: '555-1111' },
      { id: '2', name: 'Giselle Castro Hernández', email: 'gicastro@matra.co.cr', phone: '555-2222' },
      { id: '3', name: 'Chris Urrunaga Alayo', email: 'currunaga@matra.co.cr', phone: '555-3333' }
    ],
    files: [],
    fileSettings: [
      {
        name: 'ELIPS',
        type: 'elips',
        enabled: true,
        status: '',
        lastSent: ''
      },
      {
        name: 'PMM',
        type: 'pmm',
        enabled: false,
        status: '',
        lastSent: ''
      },
      {
        name: 'Parts Data',
        type: 'partsdata',
        enabled: false,
        status: '',
        lastSent: ''
      },
      {
        name: 'Seedz',
        type: 'seedz',
        enabled: false,
        status: '',
        lastSent: ''
      }
    ]
  },
  {
    id: '4',
    name: 'COGESA',
    location: 'Costa Rica',
    dealerId: '4M1586',
    clientId: 'COGESA',
    server: 'Fabric',
    status: 'Active',
    dbArchitecture: 'MYSQL',
    sapSystem: 'SAP HANA',
    contacts: [
      { id: '1', name: 'Rafael Aguilar', email: 'raguilar@generaldeequipos.com', phone: '555-1111' },
      { id: '2', name: 'Mauricio Rodriguez Jimenez (IT)', email: 'mauricio.rodriguez@generaldeequipos.com', phone: '555-2222' },
      { id: '3', name: 'Yanira Menjivar', email: 'yanira.menjivar@generaldeequipos.com', phone: '555-3333' },
      { id: '4', name: 'Luz de Maria Aguilar', email: 'luzdemaria.aguilar@generaldeequipos.com', phone: '555-4444' }
    ],
    files: [],
    fileSettings: [
      {
        name: 'ELIPS',
        type: 'elips',
        enabled: false,
        status: '',
        lastSent: ''
      },
      {
        name: 'PMM',
        type: 'pmm',
        enabled: true,
        status: '',
        lastSent: ''
      },
      {
        name: 'Parts Data',
        type: 'partsdata',
        enabled: true,
        status: '',
        lastSent: ''
      },
      {
        name: 'Seedz',
        type: 'seedz',
        enabled: false,
        status: '',
        lastSent: ''
      }
    ]
  },
  {
    id: '5',
    name: 'COGUMA',
    location: 'Costa Rica',
    dealerId: '4M1620',
    clientId: 'COGUMA',
    server: 'Fabric',
    status: 'Active',
    dbArchitecture: 'MYSQL',
    sapSystem: 'SAP HANA',
    contacts: [
      { id: '1', name: 'Laura Melgar', email: 'lmelgar@coguma.com', phone: '555-1234' }
    ],
    files: [],
    fileSettings: [
      {
        name: 'ELIPS',
        type: 'elips',
        enabled: false,
        status: '',
        lastSent: ''
      },
      {
        name: 'PMM',
        type: 'pmm',
        enabled: true,
        status: '',
        lastSent: ''
      },
      {
        name: 'Parts Data',
        type: 'partsdata',
        enabled: true,
        status: '',
        lastSent: ''
      },
      {
        name: 'Seedz',
        type: 'seedz',
        enabled: false,
        status: '',
        lastSent: ''
      }
    ]
  },
  {
    id: '6',
    name: 'MPC',
    location: 'Costa Rica',
    dealerId: '282585',
    clientId: 'MPC',
    server: 'Fabric',
    status: 'Active',
    dbArchitecture: 'MYSQL',
    sapSystem: 'SAP HANA',
    contacts: [],
    files: [],
    fileSettings: [
      {
        name: 'ELIPS',
        type: 'elips',
        enabled: false,
        status: '',
        lastSent: ''
      },
      {
        name: 'PMM',
        type: 'pmm',
        enabled: true,
        status: '',
        lastSent: ''
      },
      {
        name: 'Parts Data',
        type: 'partsdata',
        enabled: true,
        status: '',
        lastSent: ''
      },
      {
        name: 'Seedz',
        type: 'seedz',
        enabled: false,
        status: '',
        lastSent: ''
      }
    ]
  },
  //   "name": "CAMOSA",
  // "dealer_id": "4M1642",
  {
    id: '7',
    name: 'CAMOSA',
    location: 'Costa Rica',
    dealerId: '4M1642',
    clientId: 'CAMOSA',
    server: 'Fabric',
    status: 'Inactive',
    dbArchitecture: 'MYSQL',
    sapSystem: 'SAP HANA',
    contacts: [{ id: '1', name: 'Luis Chavarria', email: 'lchavarria@camosa.com', phone: '555-5678' }],
    files: [],
    fileSettings: [
      {
        name: 'ELIPS',
        type: 'elips',
        enabled: false,
        status: '',
        lastSent: ''
      },
      {
        name: 'PMM',
        type: 'pmm',
        enabled: false,
        status: '',
        lastSent: ''
      },
      {
        name: 'Parts Data',
        type: 'partsdata',
        enabled: false,
        status: '',
        lastSent: ''
      },
      {
        name: 'Seedz',
        type: 'seedz',
        enabled: false,
        status: '',
        lastSent: ''
      }
    ]
  },
  {
    id: '8',
    name: 'COPAMA',
    location: 'Costa Rica',
    dealerId: '4M1660',
    clientId: 'COPAMA',
    server: 'Fabric',
    status: 'Inactive',
    dbArchitecture: 'MYSQL',
    sapSystem: 'SAP HANA',
    contacts: [
      { id: '1', name: 'Luis Chavarria', email: 'lchavarria@camosa.com', phone: '555-5678' }
    ],
    files: [],
    fileSettings: [
      {
        name: 'ELIPS',
        type: 'elips',
        enabled: false,
        status: '',
        lastSent: ''
      },
      {
        name: 'PMM',
        type: 'pmm',
        enabled: false,
        status: '',
        lastSent: ''
      },
      {
        name: 'Parts Data',
        type: 'partsdata',
        enabled: false,
        status: '',
        lastSent: ''
      },
      {
        name: 'Seedz',
        type: 'seedz',
        enabled: false,
        status: '',
        lastSent: ''
      }
    ]
  },
  {
    id: '9',
    name: 'SALFA',
    location: 'Costa Rica',
    dealerId: '2L1562',
    clientId: 'SALFA',
    server: 'Fabric',
    status: 'Active',
    dbArchitecture: 'MYSQL',
    sapSystem: 'SAP HANA',
    contacts: [
      { id: '1', name: 'Luis Chavarria', email: 'lchavarria@camosa.com', phone: '555-5678' }
    ],
    files: [],
    fileSettings: [
      {
        name: 'ELIPS',
        type: 'elips',
        enabled: true,
        status: '',
        lastSent: ''
      },
      {
        name: 'PMM',
        type: 'pmm',
        enabled: false,
        status: '',
        lastSent: ''
      },
      {
        name: 'Parts Data',
        type: 'partsdata',
        enabled: false,
        status: '',
        lastSent: ''
      },
      {
        name: 'Seedz',
        type: 'seedz',
        enabled: false,
        status: '',
        lastSent: ''
      }
    ]
  },
  {
    id: '10',
    name: 'IPESA',
    location: 'Costa Rica',
    dealerId: '4M1642',
    clientId: 'IPESA',
    server: 'Fabric',
    status: 'Inactive',
    dbArchitecture: 'MYSQL',
    sapSystem: 'SAP HANA',
    contacts: [
      { id: '1', name: 'Luis Chavarria', email: 'lchavarria@camosa.com', phone: '555-5678' }
    ],
    files: [],
    fileSettings: [
      {
        name: 'ELIPS',
        type: 'elips',
        enabled: false,
        status: '',
        lastSent: ''
      },
      {
        name: 'PMM',
        type: 'pmm',
        enabled: false,
        status: '',
        lastSent: ''
      },
      {
        name: 'Parts Data',
        type: 'partsdata',
        enabled: false,
        status: '',
        lastSent: ''
      },
      {
        name: 'Seedz',
        type: 'seedz',
        enabled: false,
        status: '',
        lastSent: ''
      }
    ]
  },
  {
    id: '11',
    name: 'IMCA',
    location: 'Costa Rica',
    dealerId: '2L1595',
    clientId: 'IMCA',
    server: 'Fabric',
    status: 'Inactive',
    dbArchitecture: 'MYSQL',
    sapSystem: 'SAP HANA',
    contacts: [
      { id: '1', name: 'Luis Chavarria', email: 'lchavarria@camosa.com', phone: '555-5678' }
    ],
    files: [],
    fileSettings: [
      {
        name: 'ELIPS',
        type: 'elips',
        enabled: false,
        status: '',
        lastSent: ''
      },
      {
        name: 'PMM',
        type: 'pmm',
        enabled: false,
        status: '',
        lastSent: ''
      },
      {
        name: 'Parts Data',
        type: 'partsdata',
        enabled: false,
        status: '',
        lastSent: ''
      },
      {
        name: 'Seedz',
        type: 'seedz',
        enabled: false,
        status: '',
        lastSent: ''
      }
    ]
  },
  {
    id: '12',
    name: 'AUTOMAQ',
    location: 'Costa Rica',
    dealerId: '2L1671',
    clientId: 'AUTOMAQ',
    server: 'Fabric',
    status: 'Inactive',
    dbArchitecture: 'MYSQL',
    sapSystem: 'SAP HANA',
    contacts: [
      { id: '1', name: 'Luis Chavarria', email: 'lchavarria@camosa.com', phone: '555-5678' }
    ],
    files: [],
    fileSettings: [
      {
        name: 'ELIPS',
        type: 'elips',
        enabled: false,
        status: '',
        lastSent: ''
      },
      {
        name: 'PMM',
        type: 'pmm',
        enabled: false,
        status: '',
        lastSent: ''
      },
      {
        name: 'Parts Data',
        type: 'partsdata',
        enabled: false,
        status: '',
        lastSent: ''
      },
      {
        name: 'Seedz',
        type: 'seedz',
        enabled: false,
        status: '',
        lastSent: ''
      }
    ]
  }
];
