import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Minus, 
  Send,
  RefreshCw
} from 'lucide-react';
import { DealerFile } from '../data/dealers';
import { useToast } from '../hooks/use-toast';

interface FileManagementProps {
  files: DealerFile[];
  dealerId: string;
  dealerName: string;
}

const FileManagement: React.FC<FileManagementProps> = ({ files, dealerId, dealerName }) => {
  const [fileStates, setFileStates] = useState<DealerFile[]>(files);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const { toast } = useToast();

  const getFileIcon = (status: string) => {
    switch (status) {
      case 'sent': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'disabled': return <Minus className="h-4 w-4 text-gray-400" />;
      default: return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-700 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'failed': return 'bg-red-100 text-red-700 border-red-200';
      case 'disabled': return 'bg-gray-100 text-gray-500 border-gray-200';
      default: return 'bg-gray-100 text-gray-500 border-gray-200';
    }
  };

  const toggleFileEnabled = async (fileName: string) => {
    setIsUpdating(fileName);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setFileStates(prev => prev.map(file => {
      if (file.name === fileName) {
        const newEnabled = !file.enabled;
        return {
          ...file,
          enabled: newEnabled,
          status: newEnabled ? 'pending' : 'disabled'
        };
      }
      return file;
    }));
    
    setIsUpdating(null);
    
    const file = fileStates.find(f => f.name === fileName);
    toast({
      title: `${fileName} ${file?.enabled ? 'disabled' : 'enabled'}`,
      description: `File ${fileName} has been ${file?.enabled ? 'disabled' : 'enabled'} for ${dealerName}`,
    });
  };

  const sendFile = async (fileName: string) => {
    setIsUpdating(fileName);
    
    // Simulate file sending
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Randomly simulate success or failure
    const isSuccess = Math.random() > 0.2;
    
    setFileStates(prev => prev.map(file => {
      if (file.name === fileName) {
        return {
          ...file,
          status: isSuccess ? 'sent' : 'failed',
          lastSent: isSuccess ? 'Just now' : file.lastSent
        };
      }
      return file;
    }));
    
    setIsUpdating(null);
    
    toast({
      title: isSuccess ? `${fileName} sent successfully` : `Failed to send ${fileName}`,
      description: isSuccess 
        ? `${fileName} has been sent to ${dealerName}` 
        : `There was an error sending ${fileName}. Please try again.`,
      variant: isSuccess ? "default" : "destructive"
    });
  };

  const retrySendFile = (fileName: string) => {
    sendFile(fileName);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-indigo-600" />
          File Management
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {fileStates.map((file, index) => (
            <motion.div
              key={file.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border"
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {getFileIcon(file.status)}
                  <span className="font-medium text-slate-800">{file.name}</span>
                </div>
                
                <Badge className={`text-xs ${getStatusColor(file.status)}`}>
                  {file.status}
                </Badge>
                
                {file.lastSent && (
                  <span className="text-xs text-slate-500">
                    Last sent: {file.lastSent}
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600">Enabled</span>
                  <Switch
                    checked={file.enabled}
                    onCheckedChange={() => toggleFileEnabled(file.name)}
                    disabled={isUpdating === file.name}
                  />
                </div>
                
                {file.enabled && (
                  <div className="flex gap-1">
                    {file.status === 'pending' || file.status === 'sent' ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => sendFile(file.name)}
                        disabled={isUpdating === file.name}
                        className="h-8 px-3 text-xs"
                      >
                        {isUpdating === file.name ? (
                          <RefreshCw className="h-3 w-3 animate-spin" />
                        ) : (
                          <>
                            <Send className="h-3 w-3 mr-1" />
                            Send
                          </>
                        )}
                      </Button>
                    ) : file.status === 'failed' ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => retrySendFile(file.name)}
                        disabled={isUpdating === file.name}
                        className="h-8 px-3 text-xs border-red-300 text-red-600 hover:bg-red-50"
                      >
                        {isUpdating === file.name ? (
                          <RefreshCw className="h-3 w-3 animate-spin" />
                        ) : (
                          <>
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Retry
                          </>
                        )}
                      </Button>
                    ) : null}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-6 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between text-sm text-slate-600">
            <span>
              {fileStates.filter(f => f.enabled).length} of {fileStates.length} files enabled
            </span>
            <span>
              {fileStates.filter(f => f.status === 'sent').length} files successfully sent
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FileManagement;