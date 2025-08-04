import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  FolderOpen,
  Upload,
  Download,
  Trash2,
  Search,
  File,
  Folder,
  Eye,
  Edit,
  Server
} from 'lucide-react';
import FileUpload from '../components/FileUpload';
import { useDealerContext } from '@/context/DealerContext';
import { isToday } from 'date-fns';

const FileManager = () => {
  const { dealers, loading } = useDealerContext();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDealer, setSelectedDealer] = useState<string>('all');

  // PAGINACIÓN
  const [currentPage, setCurrentPage] = useState(1);
  const filesPerPage = 6;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getDealerName = (dealerId: string) => {
    const dealer = dealers.find(s => s.id === dealerId);
    return dealer ? dealer.name : 'Unknown Dealer';
  };

  const allDealerFiles = dealers.flatMap(dealer =>
    dealer.files.map(file => ({
      ...file,
      dealerId: dealer.id,
      dealerName: dealer.name,
      clientId: dealer.clientId,
    }))
  );

  const filteredFiles = allDealerFiles.filter(file => {
    const nameMatch = file.fileName?.toLowerCase().includes(searchTerm.toLowerCase());
    const dealerMatch = selectedDealer === 'all' || file.dealerId === selectedDealer;
    return nameMatch && dealerMatch;
  });

  // Calculo paginación
  const totalFiles = filteredFiles.length;
  const totalPages = Math.ceil(totalFiles / filesPerPage);
  const indexOfLastFile = currentPage * filesPerPage;
  const indexOfFirstFile = indexOfLastFile - filesPerPage;
  const currentFiles = filteredFiles.slice(indexOfFirstFile, indexOfLastFile);
  const recentUploadsCount = filteredFiles.filter(file => file.shipmentDatetime && isToday(file.shipmentDatetime)).length;
  // Sumar tamaños en MB de los archivos filtrados (o de todos)
  const totalSizeMb = filteredFiles.reduce((acc, file) => acc + Number(file.fileSizeMb || 0), 0);
  // Convertir MB a GB (1 GB = 1024 MB)
  const totalSizeGb = totalSizeMb / 1024;

  // Mostrar con 2 decimales
  const totalSizeFormatted = totalSizeGb.toFixed(2);


  // Reset página al cambiar filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedDealer]);

  const goToNextPage = () => {
    setCurrentPage(page => Math.min(page + 1, totalPages));
  };

  const goToPreviousPage = () => {
    setCurrentPage(page => Math.max(page - 1, 1));
  };

  return (
    <div className="flex flex-col h-full w-full">
      <header className="flex items-center sticky top-0 z-10 gap-4 border-b border-slate-200 bg-white/80 backdrop-blur-sm px-6 py-4">
        <SidebarTrigger />
        <div>
          <h1 className="text-2xl font-bold text-slate-800">File Manager</h1>
          <p className="text-sm text-slate-600">Upload, manage, and organize dealer files</p>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-6 space-y-6">
        {/* File Upload Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <FileUpload />
        </motion.div>

        {/* File Browser */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="shadow-lg border-slate-200">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Folder className="h-5 w-5 text-blue-600" />
                  File Browser
                </CardTitle>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search files..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <select
                    value={selectedDealer}
                    onChange={(e) => setSelectedDealer(e.target.value)}
                    className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Dealers</option>
                    {dealers.map((dealer) => (
                      <option key={dealer.id} value={dealer.id}>
                        {dealer.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 ">
              {filteredFiles.length === 0 ? (
                <div className="text-center py-12">
                  <FolderOpen className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">No files found</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {currentFiles.map((file, index) => (
                    <motion.div
                      key={file.fileName + index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-slate-100 rounded-lg">
                          {file.type === 'elips' ? (
                            <Folder className="h-5 w-5 text-blue-600" />
                          ) : (
                            <File className="h-5 w-5 text-slate-600" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium text-slate-800">{file.fileName}</h3>
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            <span>{file.type.toUpperCase()}</span>
                            <span>•</span>
                            <span>{file.sended ? 'Sent' : 'Not Sent'}</span>
                            {file.fileSizeMb && (
                              <>
                                <span>•</span>
                                <span>{formatFileSize(Number(file.fileSizeMb))}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Server className="h-3 w-3" />
                          {getDealerName(file.dealerId)}
                        </Badge>

                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-600 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Controles de paginación */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 py-4">
                  <Button onClick={goToPreviousPage} disabled={currentPage === 1} variant="outline">
                    Prev
                  </Button>
                  <span>
                    Página {currentPage} de {totalPages}
                  </span>
                  <Button onClick={goToNextPage} disabled={currentPage === totalPages} variant="outline">
                    Next
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Storage Usage (sin cambios) */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700">Total Files</p>
                    <p className="text-2xl font-bold text-blue-800">{filteredFiles.length}</p>
                  </div>
                  <File className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700">Storage Used</p>
                    <p className="text-2xl font-bold text-green-800">{totalSizeFormatted} GB</p>
                  </div>
                  <FolderOpen className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-700">Recent Uploads</p>
                    <p className="text-2xl font-bold text-purple-800">{recentUploadsCount}</p>
                  </div>
                  <Upload className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default FileManager;
