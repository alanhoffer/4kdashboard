import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import axios from 'axios';
import {
  Upload,
  File,
  X,
  CheckCircle,
  AlertCircle,
  Server,
  FolderOpen
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { useDealerContext } from '@/context/DealerContext';

interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  dealerId?: string;
}

const FileUpload = () => {

  const { dealers, loading } = useDealerContext();

  const [selectedDealer, setSelectedDealer] = useState<string>('');
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const { toast } = useToast();

  const onlineDealers = dealers.filter(dealer => dealer.status === 'Active');
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    addFiles(files);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    const files = Array.from(event.dataTransfer.files);
    addFiles(files);
  };

  const addFiles = (files: File[]) => {
    const newFiles: UploadFile[] = files.map(file => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      file,
      progress: 0,
      status: 'pending'
    }));
    setUploadFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (fileId: string) => {
    setUploadFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const simulateUpload = async (fileId: string) => {
    if (!selectedDealer) {
      toast({
        title: "No dealer selected",
        description: "Please select a dealer before uploading files.",
        variant: "destructive"
      });
      return;
    }

    const fileToUpload = uploadFiles.find(f => f.id === fileId);
    if (!fileToUpload) return;

    setUploadFiles(prev => prev.map(f =>
      f.id === fileId
        ? { ...f, status: 'uploading', progress: 0 }
        : f
    ));

    // Obtener el dealer seleccionado completo para tomar clientId
    const dealer = dealers.find(d => d.id === selectedDealer);
    if (!dealer) return;

    // Crear FormData para enviar
    const formData = new FormData();
    formData.append('file', fileToUpload.file);
    formData.append('clientId', dealer.clientId || '');

    try {
      const response = await axios.post('https://4k.cabañahoffer.com.ar/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadFiles(prev => prev.map(f =>
            f.id === fileId ? { ...f, progress } : f
          ));
        }
      });

      if (response.data.success) {
        setUploadFiles(prev => prev.map(f =>
          f.id === fileId ? { ...f, status: 'completed', progress: 100 } : f
        ));
        toast({
          title: "Upload successful",
          description: `File uploaded to ${dealer.name}`,
          variant: "default"
        });
      } else {
        setUploadFiles(prev => prev.map(f =>
          f.id === fileId ? { ...f, status: 'error', progress: 0 } : f
        ));
        toast({
          title: "Upload failed",
          description: response.data.message || "Unknown error during upload.",
          variant: "destructive"
        });
      }
    } catch (error) {
      setUploadFiles(prev => prev.map(f =>
        f.id === fileId ? { ...f, status: 'error', progress: 0 } : f
      ));
      toast({
        title: "Upload error",
        description: "Network or server error. Please try again.",
        variant: "destructive"
      });
      console.error('Upload error:', error);
    }
  };

  const uploadAllFiles = () => {
    const pendingFiles = uploadFiles.filter(f => f.status === 'pending');
    pendingFiles.forEach(file => {
      simulateUpload(file.id);
    });
  };


  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'uploading': return <Upload className="h-4 w-4 text-blue-500 animate-pulse" />;
      default: return <File className="h-4 w-4 text-slate-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      case 'uploading': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className="shadow-lg border-slate-200">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-slate-200">
        <CardTitle className="flex items-center gap-2">
          <FolderOpen className="h-5 w-5 text-indigo-600" />
          File Upload
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Dealer Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Select Target Dealer</label>
          <Select value={selectedDealer} onValueChange={setSelectedDealer}>
            <SelectTrigger className="w-full border-slate-300 hover:border-slate-400">
              <SelectValue placeholder="Choose a dealer to upload files to" />
            </SelectTrigger>
            <SelectContent>
              {onlineDealers.map((dealer) => (
                <SelectItem key={dealer.id} value={dealer.id}>
                  <div className="flex items-center gap-2">
                    <Server className="h-4 w-4 text-slate-500" />
                    <span>{dealer.name}</span>
                    <Badge variant="outline" className="ml-2 text-xs">
                      {dealer.location}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* File Drop Zone */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDragOver
            ? 'border-indigo-400 bg-indigo-50'
            : 'border-slate-300 hover:border-slate-400'
            }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
        >
          <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-slate-700 mb-2">
            Drop files here or click to browse
          </p>
          <p className="text-sm text-slate-500 mb-4">
            Support for multiple files up to 100MB each
          </p>
          <input
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
          />
          <Button
            variant="outline"
            onClick={() => document.getElementById('file-upload')?.click()}
            className="border-indigo-300 text-indigo-600 hover:bg-indigo-50"
          >
            Browse Files
          </Button>
        </div>

        {/* File List */}
        {uploadFiles.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-800">
                Files to Upload ({uploadFiles.length})
              </h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setUploadFiles([])}
                  className="text-slate-600"
                >
                  Clear All
                </Button>
                <Button
                  size="sm"
                  onClick={uploadAllFiles}
                  disabled={!selectedDealer || uploadFiles.every(f => f.status !== 'pending')}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  Upload All
                </Button>
              </div>
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto">
              {uploadFiles.map((uploadFile) => (
                <motion.div
                  key={uploadFile.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border"
                >
                  {getStatusIcon(uploadFile.status)}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-slate-800 truncate">
                        {uploadFile.file.name}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge className={`text-xs ${getStatusColor(uploadFile.status)}`}>
                          {uploadFile.status}
                        </Badge>
                        {uploadFile.dealerId && (
                          <Badge variant="outline" className="text-xs">
                            {dealers.find(s => s.id === uploadFile.dealerId)?.name}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{formatFileSize(uploadFile.file.size)}</span>
                      {uploadFile.status === 'uploading' && (
                        <span>{uploadFile.progress}%</span>
                      )}
                    </div>

                    {uploadFile.status === 'uploading' && (
                      <Progress value={uploadFile.progress} className="h-1 mt-2" />
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {uploadFile.status === 'pending' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => simulateUpload(uploadFile.id)}
                        disabled={!selectedDealer}
                        className="h-8 w-8 p-0 text-indigo-600 hover:bg-indigo-50"
                      >
                        <Upload className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFile(uploadFile.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FileUpload;