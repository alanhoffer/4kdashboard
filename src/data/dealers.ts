

export interface DealerFile {
  id: string;
  name: string;
  enabled: boolean;
  lastSent?: string; 
  type?: string;
  status: 'sent' | 'pending' | 'failed' | 'disabled';
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
}

export const dealers: Dealer[] = [
  {
    id: '1',
    name: 'PR',
    location: 'Puerto Rico',
    dealerId: '252830',
    clientId: 'PR',
    server: 'Fabric',
    status: 'Active',
    dbArchitecture: 'B1 HANA',
    sapSystem: 'SAP B1 HANA',
    contacts: [
      { id: '1', name: 'John Doe', email: 'john.doe@example.com', phone: '555-1234' }
    ],
    files: [
    ]
  }
 
];
