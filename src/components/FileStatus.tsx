import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, XCircle, Minus } from 'lucide-react';
import { DealerFile, FileSetting } from '../data/dealers';
import { format } from 'date-fns';

interface FileStatusProps {
  files: DealerFile[];
  fileSettings: FileSetting[];
  compact?: boolean;
}

const FileStatus: React.FC<FileStatusProps> = ({ files, fileSettings, compact = false }) => {
  const getFileIcon = (status: string) => {
    switch (status) {
      case 'sent': return <CheckCircle className="h-3 w-3 text-green-500" />;
      case 'generated': return <Clock className="h-3 w-3 text-yellow-500" />;
      case 'error': return <XCircle className="h-3 w-3 text-red-500" />;
      case 'disabled': return <Minus className="h-3 w-3 text-gray-400" />;
      default: return <Minus className="h-3 w-3 text-gray-400" />;
    }
  };

  const getFileStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-700 border-green-200';
      case 'generated': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'error': return 'bg-red-100 text-red-700 border-red-200';
      case 'disabled': return 'bg-gray-100 text-gray-500 border-gray-200';
      default: return 'bg-gray-100 text-gray-500 border-gray-200';
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        {fileSettings.map((fileSetting) => (
          <div key={fileSetting.name} className="flex items-center gap-1">
            {getFileIcon(fileSetting.status)}
            <span className="text-xs text-slate-600">{fileSetting.name}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {fileSettings.map((fileSetting) => (
        <Badge
          key={fileSetting.name}
          variant="outline"
          className={`flex w-full items-center justify-between py-1 text-xs ${getFileStatusColor(fileSetting.status)}`}
        >
          <div className="flex items-center gap-2">
            {getFileIcon(fileSetting.status)}
            <span>{fileSetting.name}</span>
          </div>
          <span className="text-xs text-slate-400">
            {fileSetting.lastSent
              ? format(new Date(fileSetting.lastSent), 'dd/MM/yyyy HH:mm')
              : '-'}
          </span>        
          </Badge>
      ))}
    </div>
  );
};

export default FileStatus;