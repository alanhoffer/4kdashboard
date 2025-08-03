import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, XCircle, Minus } from 'lucide-react';
import { DealerFile } from '../data/dealers';

interface FileStatusProps {
  files: DealerFile[];
  compact?: boolean;
}

const FileStatus: React.FC<FileStatusProps> = ({ files, compact = false }) => {
  const getFileIcon = (status: string) => {
    switch (status) {
      case 'sent': return <CheckCircle className="h-3 w-3 text-green-500" />;
      case 'pending': return <Clock className="h-3 w-3 text-yellow-500" />;
      case 'failed': return <XCircle className="h-3 w-3 text-red-500" />;
      case 'disabled': return <Minus className="h-3 w-3 text-gray-400" />;
      default: return <Minus className="h-3 w-3 text-gray-400" />;
    }
  };

  const getFileStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-700 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'failed': return 'bg-red-100 text-red-700 border-red-200';
      case 'disabled': return 'bg-gray-100 text-gray-500 border-gray-200';
      default: return 'bg-gray-100 text-gray-500 border-gray-200';
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        {files.map((file) => (
          <div key={file.name} className="flex items-center gap-1">
            {getFileIcon(file.status)}
            <span className="text-xs text-slate-600">{file.name}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {files.map((file) => (
        <Badge
          key={file.name}
          variant="outline"
          className={`flex w-full items-center justify-between text-xs ${getFileStatusColor(file.status)}`}
        >
          <div className="flex items-center gap-1">
            {getFileIcon(file.status)}
            <span>{file.name}</span>
          </div>
          <span className="text-xs text-slate-400">xxx</span>
        </Badge>
      ))}
    </div>
  );
};

export default FileStatus;