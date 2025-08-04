import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  FileSpreadsheet,
  Upload,
  Download,
  FileText,
  Table,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  File,
  X
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import * as XLSX from 'xlsx';

interface ParsedData {
  headers: string[];
  rows: string[][];
  totalRows: number;
  totalColumns: number;
}

const Transform = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('transformed_data');
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [customHeaders, setCustomHeaders] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setParsedData(null);
      // Set default output filename based on input file
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
      setFileName(`${nameWithoutExt}_converted`);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    const file = event.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      setParsedData(null);
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
      setFileName(`${nameWithoutExt}_converted`);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setParsedData(null);
    setCustomHeaders('');
    setFileName('transformed_data');
  };

  const parseFileData = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a file to transform.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      const fileContent = await readFileContent(selectedFile);

      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      const lines = fileContent.trim().split('\n').filter(line => line.trim());

      if (lines.length === 0) {
        throw new Error('No valid data found in file');
      }

      // Parse first line as headers (or use custom headers)
      let headers: string[];
      let dataLines: string[];

      if (customHeaders.trim()) {
        headers = customHeaders.split(',').map(h => h.trim());
        dataLines = lines;
      } else {
        headers = lines[0].split(/\s+/);
        dataLines = lines.slice(1);
      }

      // Parse data rows
      // Parse data rows
      const rows = dataLines.map(line => line.split(/\s+/));

      // Detect maximum number of columns
      const maxCols = Math.max(...rows.map(row => row.length));

      // Extend headers if needed
      if (headers.length < maxCols) {
        const extraCount = maxCols - headers.length;
        const extraHeaders = Array.from({ length: extraCount }, (_, i) => `extra_${i + 1}`);
        headers = [...headers, ...extraHeaders];
      }

      // Normalize all rows to match headers
      const normalizedRows = rows.map(row => {
        const filled = [...row];
        while (filled.length < headers.length) filled.push('');
        return filled.slice(0, headers.length);
      });

      const parsed: ParsedData = {
        headers,
        rows: normalizedRows,
        totalRows: normalizedRows.length,
        totalColumns: headers.length
      };


      setParsedData(parsed);
      setIsProcessing(false);

      toast({
        title: "File parsed successfully",
        description: `Found ${parsed.totalRows} rows and ${parsed.totalColumns} columns.`,
      });
    } catch (error) {
      setIsProcessing(false);
      toast({
        title: "Parsing failed",
        description: "Could not parse the file. Please check the format.",
        variant: "destructive"
      });
    }
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        resolve(content);
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  const downloadExcel = () => {
    if (!parsedData) return;

    try {
      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();

      // Prepare data with headers
      const wsData = [parsedData.headers, ...parsedData.rows];

      // Create worksheet
      const ws = XLSX.utils.aoa_to_sheet(wsData);

      // Auto-size columns
      const colWidths = parsedData.headers.map((header, i) => {
        const maxLength = Math.max(
          header.length,
          ...parsedData.rows.map(row => (row[i] || '').toString().length)
        );
        return { wch: Math.min(Math.max(maxLength + 2, 10), 50) };
      });
      ws['!cols'] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Data');

      // Generate Excel file and download
      const excelFileName = fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`;
      XLSX.writeFile(wb, excelFileName);

      toast({
        title: "Excel file downloaded",
        description: `${excelFileName} has been downloaded successfully.`,
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Could not generate Excel file. Please try again.",
        variant: "destructive"
      });
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
    <div className="flex flex-col h-full w-full">
      <header className="flex items-center sticky top-0 z-10 gap-4 border-b border-slate-200 bg-white/80 backdrop-blur-sm px-6 py-4">
        <SidebarTrigger />
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Transform Data</h1>
          <p className="text-sm text-slate-600">Convert text files to Excel format</p>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-6 space-y-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* File Upload Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  File Upload
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {!selectedFile ? (
                  <>
                    {/* Custom Headers Input */}
                    <div>
                      <Label htmlFor="custom-headers">Custom Headers (optional)</Label>
                      <Input
                        id="custom-headers"
                        placeholder="Name, Age, Department, Salary (comma-separated)"
                        value={customHeaders}
                        onChange={(e) => setCustomHeaders(e.target.value)}
                        className="mt-1"
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        Leave empty to use first line as headers
                      </p>
                    </div>

                    {/* File Drop Zone */}
                    <div
                      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDragOver
                          ? 'border-blue-400 bg-blue-50'
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
                        Drop your text file here or click to browse
                      </p>
                      <p className="text-sm text-slate-500 mb-4">
                        Supports .txt files with space-separated columns
                      </p>
                      <input
                        type="file"
                        accept=".txt,.csv,.tsv,.DAT,.DPMBRA"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="file-upload"
                      />
                      <Button
                        variant="outline"
                        onClick={() => document.getElementById('file-upload')?.click()}
                        className="border-blue-300 text-blue-600 hover:bg-blue-50"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Browse Files
                      </Button>
                    </div>
                  </>
                ) : (
                  /* Selected File Display */
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border">
                      <File className="h-8 w-8 text-blue-600" />
                      <div className="flex-1">
                        <p className="font-medium text-slate-800">{selectedFile.name}</p>
                        <p className="text-sm text-slate-600">
                          {formatFileSize(selectedFile.size)} • {selectedFile.type || 'text/plain'}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={removeFile}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Custom Headers for selected file */}
                    <div>
                      <Label htmlFor="custom-headers-file">Custom Headers (optional)</Label>
                      <Input
                        id="custom-headers-file"
                        placeholder="Name, Age, Department, Salary (comma-separated)"
                        value={customHeaders}
                        onChange={(e) => setCustomHeaders(e.target.value)}
                        className="mt-1"
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        Leave empty to use first line as headers
                      </p>
                    </div>

                    <Button
                      onClick={parseFileData}
                      disabled={isProcessing}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      {isProcessing ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Processing File...
                        </>
                      ) : (
                        <>
                          <Table className="h-4 w-4 mr-2" />
                          Transform to Excel
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Preview Section */}
          {parsedData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      Data Preview
                    </CardTitle>
                    <div className="flex items-center gap-4">
                      <Badge className="bg-green-100 text-green-700">
                        {parsedData.totalRows} rows
                      </Badge>
                      <Badge className="bg-blue-100 text-blue-700">
                        {parsedData.totalColumns} columns
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="file-name">Excel File Name</Label>
                        <Input
                          id="file-name"
                          value={fileName}
                          onChange={(e) => setFileName(e.target.value)}
                          className="mt-1 w-64"
                          placeholder="Enter file name"
                        />
                      </div>
                      <Button
                        onClick={downloadExcel}
                        className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Download Excel
                      </Button>
                    </div>

                    {/* Data Table Preview */}
                    <div className="border rounded-lg overflow-hidden">
                      <div className="overflow-x-auto max-h-96">
                        <table className="w-full text-sm">
                          <thead className="bg-slate-50 border-b">
                            <tr>
                              {parsedData.headers.map((header, index) => (
                                <th
                                  key={index}
                                  className="px-4 py-3 text-left font-medium text-slate-700 border-r last:border-r-0"
                                >
                                  {header}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {parsedData.rows.slice(0, 10).map((row, rowIndex) => (
                              <tr key={rowIndex} className="hover:bg-slate-50">
                                {row.map((cell, cellIndex) => (
                                  <td
                                    key={cellIndex}
                                    className="px-4 py-3 border-r last:border-r-0 text-slate-600"
                                  >
                                    {cell || '-'}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {parsedData.rows.length > 10 && (
                        <div className="bg-slate-50 px-4 py-2 text-center text-sm text-slate-600 border-t">
                          Showing first 10 rows of {parsedData.totalRows} total rows
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Instructions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-purple-600" />
                  How to Use
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3 text-sm text-slate-600">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                      1
                    </div>
                    <p>
                      <strong>Prepare your file:</strong> Ensure your file has columns separated by spaces and each row on a new line.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                      2
                    </div>
                    <p>
                      <strong>Upload your file:</strong> Drag and drop your text file or click "Browse Files" to select it.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                      3
                    </div>
                    <p>
                      <strong>Set headers (optional):</strong> Enter custom column headers separated by commas, or leave empty to use the first line as headers.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                      4
                    </div>
                    <p>
                      <strong>Transform and download:</strong> Click "Transform to Excel" to process your file, then "Download Excel" to get your .xlsx file.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Transform;