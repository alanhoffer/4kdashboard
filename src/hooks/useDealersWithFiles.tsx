import { useEffect, useState } from 'react';
import axios from 'axios';
import { dealers as initialDealers, Dealer, DealerFile, FileSetting } from '../data/dealers';
import { isToday, isSameMonth } from 'date-fns';

// Extiendo DealerFile para incluir todos los campos que vienen del endpoint
export interface ExtendedDealerFile extends DealerFile {
  shipmentType?: string; // e.g., 'Delta', 'Standard'
  shipmentDatetime?: string; // ISO date string
  dataStartDatetime?: string; // ISO date string
  dataEndDatetime?: string; // ISO date string
  fileName?: string; // e.g., 'DLR2JD_ELIPS_Delta
  fileSizeMb?: number; // size in MB
  sended?: boolean; // true if the file has been sent
  // agrega más campos que el endpoint devuelva si querés
}

export function useDealersWithFiles() {
  const [dealers, setDealers] = useState<Dealer[]>(initialDealers);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFileType(dealerId: string, type: string): Promise<ExtendedDealerFile[]> {
      try {
        const res = await axios.get(`https://4k.xn--cabaahoffer-4db.com.ar/dealers/${dealerId}/logs/${type}`);

        const rows = res.data?.rows;

        if (!Array.isArray(rows) || rows.length === 0) {
          return [];
        }

        // Mapeo cada row a un objeto ExtendedDealerFile
        const files: ExtendedDealerFile[] = rows.map(row => ({
          type,
          name: type.toUpperCase(),
          lastSent: row.shipment_datetime,
          id: row.id,
          fileName: row.file_name,
          fileSizeMb: row.file_size_mb,
          sended: row.sended || false,
          shipmentType: row.shipment_type,
          shipmentDatetime: row.shipment_datetime,
          dataStartDatetime: row.data_start_datetime,
          dataEndDatetime: row.data_end_datetime,
        }));

        return files;
      } catch (err) {
        return [];
      }
    }

    async function fetchFilesForDealer(dealer: Dealer): Promise<ExtendedDealerFile[]> {
      const enabledTypes = dealer.fileSettings
        .filter(s => s.enabled)
        .map(s => s.type.toLowerCase());

      const filesArrays = await Promise.all(
        enabledTypes.map(type => fetchFileType(dealer.clientId, type))
      );

      return filesArrays.flat();
    }

    async function updateDealers() {
      setLoading(true);

      const updated = await Promise.all(
        initialDealers.map(async (dealer) => {
          let files: ExtendedDealerFile[] = [];

          // ✅ Solo buscar archivos si el dealer está activo
          const hasEnabledFileSettings = dealer.fileSettings.some(s => s.enabled);

          if (dealer.status === 'Active' && hasEnabledFileSettings) {
            files = await fetchFilesForDealer(dealer);
          }


          const updatedSettings = dealer.fileSettings.map(setting => {
            const matchingFiles = files
              .filter(f => f.type === setting.type && f.shipmentDatetime)
              .sort((a, b) =>
                new Date(b.shipmentDatetime!).getTime() - new Date(a.shipmentDatetime!).getTime()
              );

            const mostRecentFile = matchingFiles[0];
            
            function isWithinLast24Hours(date: Date) {
              const now = new Date();
              const diffMs = now.getTime() - date.getTime();
              const hours24 = 24 * 60 * 60 * 1000;
              return diffMs >= 0 && diffMs <= hours24;
            }

            const fileTodayOrMonth = matchingFiles.find(f => {
              if (!f.shipmentDatetime) return false;
              const shipmentDate = new Date(f.shipmentDatetime);
              return setting.type.toLowerCase() === 'pmm'
                ? isSameMonth(shipmentDate, new Date())
                : isWithinLast24Hours(shipmentDate);
            });


            let status: FileSetting['status'] = 'disabled';
            if (!setting.enabled) {
              status = 'disabled';
            } else if (fileTodayOrMonth) {
              status = fileTodayOrMonth.sended ? 'sent' : 'generated';
            } else {
              status = 'error';
            }

            return {
              ...setting,
              lastSent: mostRecentFile?.shipmentDatetime ?? setting.lastSent,
              status
            };
          });

          return {
            ...dealer,
            files,
            fileSettings: updatedSettings
          };
        })
      );


      setDealers(updated);
      setLoading(false);
    }
    updateDealers();
  }, []);

  return { dealers, loading };
}
