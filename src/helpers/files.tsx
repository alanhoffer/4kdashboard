import { DealerFile } from '../data/dealers';

export function isSameDay(date1: string, date2: string) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export function summarizeFilesToday(files: DealerFile[]): DealerFile[] {
  const today = new Date().toISOString();

  const grouped: Record<string, DealerFile[]> = files.reduce((acc, file) => {
    const key = file.type ?? file.name;
    if (!acc[key]) acc[key] = [];
    acc[key].push(file);
    return acc;
  }, {} as Record<string, DealerFile[]>);

  return Object.entries(grouped).map(([type, fileList]) => {
    // Ordenar por lastSent descendente
    const sorted = fileList
      .filter(f => f.lastSent)
      .sort((a, b) => new Date(b.lastSent!).getTime() - new Date(a.lastSent!).getTime());

    const latest = sorted[0];

    if (!latest) {
      // No tiene archivos con fecha, devuelvo uno con estado pending
      return {
        id: `no-send-${type}`,
        name: type.toUpperCase(),
        type,
        enabled: false,
        lastSent: undefined,
        status: 'pending' as const,
      };
    }

    // ¿Se envió hoy?
    const sentToday = latest.lastSent ? isSameDay(latest.lastSent, today) : false;

    return {
      ...latest,
      status: sentToday ? 'sent' : 'pending',
      enabled: true,
    };
  });
}
