import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
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
import { 
  checkAppAccess,
  sendFileToJohnDeere,
  sendFileToSeedz
} from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

type FileSendType = 
  | 'johndeere-pmm' 
  | 'johndeere-partsdata' 
  | 'johndeere-elips'
  | 'seedz-invoice'
  | 'seedz-invoice_items'
  | 'seedz-customers'
  | 'seedz-items'
  | 'seedz-items-branding'
  | 'seedz-orders'
  | 'seedz-address'
  | 'seedz-items-group'
  | 'seedz-sellers';

interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  dealerId?: string;
  sendType?: FileSendType;
  errorMessage?: string;
}

const FileUpload = () => {
  const { dealers, loading } = useDealerContext();
  const { user } = useAuth();

  const [selectedDealer, setSelectedDealer] = useState<string>('');
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [hasRpmAccess, setHasRpmAccess] = useState<boolean>(false);
  const [hasElipsAccess, setHasElipsAccess] = useState<boolean>(false);
  const [hasSeedzAccess, setHasSeedzAccess] = useState<boolean>(false);
  const { toast } = useToast();

  const onlineDealers = dealers; // todos

  // Verificar acceso a aplicaciones al montar el componente
  useEffect(() => {
    const checkAccess = async () => {
      if (user) {
        const rpm = await checkAppAccess('RPM');
        const elips = await checkAppAccess('ELIPS');
        const seedz = await checkAppAccess('SEEDZ');
        setHasRpmAccess(rpm);
        setHasElipsAccess(elips);
        setHasSeedzAccess(seedz);
      }
    };
    checkAccess();
  }, [user]);

  // Detectar tipo de archivo según extensión
  const detectFileType = (fileName: string): FileSendType | null => {
    const ext = fileName.toLowerCase().split('.').pop();
    
    // John Deere
    if (ext === 'dat') return 'johndeere-pmm';
    if (ext === 'dpmbra') return 'johndeere-partsdata';
    if (ext === 'json' || ext === 'xml') {
      // Para JSON/XML, podría ser ELIPS o Seedz, por defecto ELIPS
      return 'johndeere-elips';
    }
    
    // Seedz acepta JSON y CSV
    if (ext === 'csv') return 'seedz-invoice'; // Por defecto invoice
    
    return null;
  };

  // Mapear tipo de envío a tipo de archivo para SEEDZ (según API_COMPLETE_REFERENCE.md)
  const getSeedzFileType = (sendType: FileSendType): string => {
    switch (sendType) {
      case 'seedz-invoice':
        return 'invoices'; // Endpoint es /seedz/invoices (plural)
      case 'seedz-invoice_items':
        return 'invoice_items';
      case 'seedz-customers':
        return 'customers';
      case 'seedz-items':
        return 'items';
      case 'seedz-items-branding':
        return 'items-branding';
      case 'seedz-orders':
        return 'orders';
      case 'seedz-address':
        return 'address';
      case 'seedz-items-group':
        return 'items-group';
      case 'seedz-sellers':
        return 'sellers';
      default:
        throw new Error('Tipo de envío SEEDZ no válido');
    }
  };

  // Verificar si el usuario tiene acceso al tipo de envío
  const hasAccessToSendType = (sendType: FileSendType): boolean => {
    if (sendType.startsWith('johndeere-pmm') || sendType.startsWith('johndeere-partsdata')) {
      return hasRpmAccess;
    }
    if (sendType.startsWith('johndeere-elips')) {
      return hasElipsAccess;
    }
    if (sendType.startsWith('seedz-')) {
      return hasSeedzAccess;
    }
    return false;
  };
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
    const newFiles: UploadFile[] = files.map(file => {
      const detectedType = detectFileType(file.name);
      return {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        file,
        progress: 0,
        status: 'pending',
        sendType: detectedType || undefined
      };
    });
    setUploadFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (fileId: string) => {
    setUploadFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const simulateUpload = async (fileId: string) => {
    const fileToUpload = uploadFiles.find(f => f.id === fileId);
    if (!fileToUpload) return;

    // Verificar que tenga tipo de envío asignado
    if (!fileToUpload.sendType) {
      toast({
        title: "Tipo de archivo no reconocido",
        description: "Por favor selecciona manualmente el tipo de envío para este archivo.",
        variant: "destructive"
      });
      return;
    }

    // Verificar acceso a la aplicación
    if (!hasAccessToSendType(fileToUpload.sendType)) {
      const appName = fileToUpload.sendType.startsWith('seedz-') ? 'SEEDZ' 
        : fileToUpload.sendType.startsWith('johndeere-elips') ? 'ELIPS' 
        : 'RPM';
      toast({
        title: "Sin acceso",
        description: `No tienes acceso a la aplicación ${appName}.`,
        variant: "destructive"
      });
      setUploadFiles(prev => prev.map(f =>
        f.id === fileId ? { ...f, status: 'error', errorMessage: `Sin acceso a ${appName}` } : f
      ));
      return;
    }

    setUploadFiles(prev => prev.map(f =>
      f.id === fileId
        ? { ...f, status: 'uploading', progress: 10, errorMessage: undefined }
        : f
    ));

    try {
      let result: any;

      // Determinar target_client_id si es superadmin
      const dealer = dealers.find(d => d.id === selectedDealer);
      const targetClientId = user?.global_role === 'admin' && dealer?.clientId
        ? (typeof dealer.clientId === 'string' ? parseInt(dealer.clientId, 10) : dealer.clientId)
        : undefined;

      // FLUJO: Envío usando endpoints de FourK API (el backend maneja todo)
      if (fileToUpload.sendType.startsWith('johndeere-')) {
        // John Deere: PMM, PartsData, ELIPS
        
        setUploadFiles(prev => prev.map(f =>
          f.id === fileId ? { ...f, progress: 30 } : f
        ));
        
        const fileType = fileToUpload.sendType.replace('johndeere-', '') as 'pmm' | 'partsdata' | 'elips';
        
        // El backend maneja:
        // - Obtención de credenciales
        // - Obtención de token OAuth
        // - Modificación de PartsData (si aplica)
        // - Envío a John Deere
        // - Marcado de orders/transfers como enviados (si aplica)
        // - Guardado en Blob Storage
        // - Creación de log
        result = await sendFileToJohnDeere(
          fileToUpload.file,
          fileType,
          targetClientId
        );

      } else if (fileToUpload.sendType.startsWith('seedz-')) {
        // SEEDZ
        
        setUploadFiles(prev => prev.map(f =>
          f.id === fileId ? { ...f, progress: 30 } : f
        ));
        
        const seedzFileType = getSeedzFileType(fileToUpload.sendType);
        
        // El backend maneja:
        // - Obtención de credenciales
        // - Obtención de token OAuth
        // - Conversión CSV a JSON (si aplica)
        // - Envío a SEEDZ
        // - Guardado en Blob Storage
        // - Creación de log
        result = await sendFileToSeedz(
          fileToUpload.file,
          seedzFileType,
          targetClientId
        );
      }

      setUploadFiles(prev => prev.map(f =>
        f.id === fileId ? { ...f, status: 'completed', progress: 100 } : f
      ));
      
      toast({
        title: "✅ Envío exitoso",
        description: `Archivo ${fileToUpload.file.name} enviado exitosamente a ${fileToUpload.sendType.startsWith('johndeere-') ? 'John Deere' : 'SEEDZ'}`,
        variant: "default",
        duration: 5000
      });

    } catch (error: any) {
      setUploadFiles(prev => prev.map(f =>
        f.id === fileId ? { 
          ...f, 
          status: 'error', 
          progress: 0,
          errorMessage: error.message 
        } : f
      ));
      
      // El log se crea automáticamente en el backend de FourK API
      
      toast({
        title: "Error en el envío",
        description: error.message || "Error al enviar el archivo. Por favor intenta nuevamente.",
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
        {/* Dealer Selection - Solo para superadmins */}
        {user?.global_role === 'admin' && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Select Target Dealer {user?.global_role === 'admin' && '(Opcional para superadmin)'}
            </label>
            <Select value={selectedDealer} onValueChange={setSelectedDealer}>
              <SelectTrigger className="w-full border-slate-300 hover:border-slate-400">
                <SelectValue placeholder={user?.global_role === 'admin' ? "Dejar vacío para usar tu cliente" : "Choose a dealer"} />
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
        )}

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
                  disabled={uploadFiles.every(f => f.status !== 'pending' || !f.sendType)}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  Enviar Todos
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
                        {uploadFile.sendType && (
                          <Badge variant="outline" className="text-xs">
                            {uploadFile.sendType.replace('johndeere-', 'JD ').replace('seedz-', 'Seedz ')}
                          </Badge>
                        )}
                        <Badge className={`text-xs ${getStatusColor(uploadFile.status)}`}>
                          {uploadFile.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{formatFileSize(uploadFile.file.size)}</span>
                      {uploadFile.status === 'uploading' && (
                        <span>{uploadFile.progress}%</span>
                      )}
                    </div>

                    {uploadFile.errorMessage && (
                      <p className="text-xs text-red-600 mt-1">{uploadFile.errorMessage}</p>
                    )}

                    {uploadFile.status === 'uploading' && (
                      <Progress value={uploadFile.progress} className="h-1 mt-2" />
                    )}

                    {/* Selector de tipo de envío si no se detectó automáticamente */}
                    {!uploadFile.sendType && uploadFile.status === 'pending' && (
                      <div className="mt-2">
                        <Select
                          value={uploadFile.sendType || ''}
                          onValueChange={(value: FileSendType) => {
                            setUploadFiles(prev => prev.map(f =>
                              f.id === uploadFile.id ? { ...f, sendType: value } : f
                            ));
                          }}
                        >
                          <SelectTrigger className="w-full text-xs h-8">
                            <SelectValue placeholder="Seleccionar tipo de envío" />
                          </SelectTrigger>
                          <SelectContent>
                            {(hasRpmAccess || hasElipsAccess) && (
                              <optgroup label="John Deere">
                                {hasRpmAccess && (
                                  <>
                                    <SelectItem value="johndeere-pmm">PMM (.dat)</SelectItem>
                                    <SelectItem value="johndeere-partsdata">PartsData (.DPMBRA)</SelectItem>
                                  </>
                                )}
                                {hasElipsAccess && (
                                  <SelectItem value="johndeere-elips">ELIPS (.json, .xml)</SelectItem>
                                )}
                              </optgroup>
                            )}
                            {hasSeedzAccess && (
                              <optgroup label="Seedz">
                                <SelectItem value="seedz-invoice">Invoice</SelectItem>
                                <SelectItem value="seedz-invoice_items">Invoice Items</SelectItem>
                                <SelectItem value="seedz-customers">Customers</SelectItem>
                                <SelectItem value="seedz-items">Items</SelectItem>
                                <SelectItem value="seedz-items-branding">Items Branding</SelectItem>
                                <SelectItem value="seedz-orders">Orders</SelectItem>
                                <SelectItem value="seedz-address">Address</SelectItem>
                                <SelectItem value="seedz-items-group">Items Group</SelectItem>
                                <SelectItem value="seedz-sellers">Sellers</SelectItem>
                              </optgroup>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {uploadFile.status === 'pending' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => simulateUpload(uploadFile.id)}
                        disabled={!uploadFile.sendType}
                        className="h-8 w-8 p-0 text-indigo-600 hover:bg-indigo-50"
                        title={!uploadFile.sendType ? "Selecciona un tipo de envío primero" : "Enviar archivo"}
                      >
                        <Upload className="h-4 w-4" />
                      </Button>
                    )}
                    {uploadFile.status === 'error' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setUploadFiles(prev => prev.map(f =>
                            f.id === uploadFile.id ? { ...f, status: 'pending', errorMessage: undefined } : f
                          ));
                        }}
                        className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50"
                        title="Reintentar"
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