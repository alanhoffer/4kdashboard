import { useEffect, useState } from 'react';
import axios from 'axios';
import { dealers as initialDealers, Dealer, DealerFile } from '../data/dealers';

// Extiendo DealerFile para incluir todos los campos que vienen del endpoint
export interface ExtendedDealerFile extends DealerFile {
  shipment_type: string;
  shipment_datetime: string;
  data_start_datetime: string;
  data_end_datetime: string;
  file_name: string;
  file_size: number;
  sended: boolean; 
  // agrega más campos que el endpoint devuelva si querés
}

export function useDealersWithFiles() {
  const [dealers, setDealers] = useState<Dealer[]>(initialDealers);

  useEffect(() => {
    async function fetchFileType(dealerId: string, type: string): Promise<ExtendedDealerFile[]> {
      try {
        console.log(`🔍 Fetching ${type.toUpperCase()} logs for dealer ${dealerId}`);
        const res = await axios.get(`http://apitoolbackend.ddns.net:3000/dealers/${dealerId}/logs/${type}`);
        console.log(`✅ Response for ${dealerId} - ${type}:`, res.data);

        const rows = res.data?.rows;

        if (!Array.isArray(rows) || rows.length === 0) {
          console.log(`⚠️ No data found for ${dealerId} - ${type}`);
          return [];
        }

        // Mapeo cada row a un objeto ExtendedDealerFile
        const files: ExtendedDealerFile[] = rows.map(row => {
          const rawStatus = (row.status || '').toLowerCase();
          const statusMap: Record<string, DealerFile['status']> = {
            sent: 'sent',
            success: 'sent',
            ok: 'sent',
            pending: 'pending',
            failed: 'failed',
            error: 'failed',
            disabled: 'disabled',
          };
          const status: DealerFile['status'] = statusMap[rawStatus] ?? 'pending';

          return {
            name: type.toUpperCase(),
            type,
            enabled: true,
            lastSent: row.shipment_datetime,
            status,
            id: row.id, // Asumiendo que cada row tiene un ID único
            file_name: row.file_name,
            file_size: row.file_size,
            sended: row.sended || false, // Asumiendo que 'sended'
            shipment_type: row.shipment_type,
            shipment_datetime: row.shipment_datetime,
            data_start_datetime: row.data_start_datetime,
            data_end_datetime: row.data_end_datetime,
            // agrega aquí más campos si llegan en row y querés guardarlos
          };
        });

        console.log(`📦 Parsed files for ${dealerId} - ${type}:`, files);
        return files;
      } catch (err) {
        console.error(`❌ Error fetching ${type} logs for dealer ${dealerId}:`, err);
        return [];
      }
    }

    async function fetchFilesForDealer(dealer: Dealer): Promise<ExtendedDealerFile[]> {
      console.log(`📡 Processing dealer: ${dealer.name} (${dealer.id})`);
      const fileTypes = ['elips', 'partsdata', 'pmm'];

      // Para cada tipo obtenemos un array de archivos, luego los concatenamos todos
      const filesArrays = await Promise.all(
        fileTypes.map(type => fetchFileType(dealer.name, type))
      );

      const allFiles = filesArrays.flat();
      console.log(`✅ Completed file fetch for ${dealer.name}:`, allFiles);
      return allFiles;
    }

    async function updateDealers() {
      console.log('🚀 Starting dealer update');
      const updated = await Promise.all(
        initialDealers.map(async (dealer) => {
          const files = await fetchFilesForDealer(dealer);
          return { ...dealer, files };
        })
      );
      console.log('✅ All dealers updated (before set):', JSON.stringify(updated, null, 2));
      setDealers(updated);
    }

    updateDealers();
  }, []);

  return dealers;
}
