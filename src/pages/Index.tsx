import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Link } from 'react-router-dom';
import {
  Server,
  Cpu,
  HardDrive,
  Wifi,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
  Users,
  Globe,
  FileText
} from 'lucide-react';
import FileStatus from '../components/FileStatus';
import ProgressFake from '@/components/ui/progress-fake';
import { useDealerContext } from '@/context/DealerContext';

const Index = () => {
  const { dealers, loading } = useDealerContext();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (!loading) {
      // Si la carga terminó, dejar que el ProgressFake termine y luego mostrar
      const timeout = setTimeout(() => {
        setShowContent(true);
      }, 3000); // si querés dejar que se vea el progreso al 100% antes de mostrar
      return () => clearTimeout(timeout);
    }
  }, [loading]);

  console.log('Dealers with files:', dealers);

  const allFiles = dealers.flatMap(d => d.fileSettings);
  const totalFiles = allFiles.filter(f => f.status !== 'disabled').length;
  const sentFiles = allFiles.filter(f => f.status === 'sent').length;
  const generatedFiles = allFiles.filter(f => f.status === 'generated').length;
  const errorFiles = allFiles.filter(f => f.status === 'error').length;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'Inactive': return <XCircle className="h-4 w-4 text-gray-500" />;
      default: return <Server className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800 border-green-200';
      case 'Inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!showContent) {
    return (
      <div className="flex justify-center items-center h-full w-full">
        <ProgressFake loading={loading} onFinish={() => setShowContent(true)} />
      </div>
    );
  }
  return (
    <div className="flex flex-col h-full w-full">
      <header className="flex items-center sticky top-0 z-10 gap-4 border-b border-slate-200 bg-white backdrop-blur-sm px-6 py-4">
        <SidebarTrigger />
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Resumen del dealer</h1>
          <p className="text-sm text-slate-600">Supervisa la información de tu dealer en tiempo real</p>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-6 space-y-6">
        {/* Status Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700">Enviados</p>
                    <p className="text-2xl font-bold text-green-800">{sentFiles}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-yellow-200 bg-white shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-yellow-700">Generados</p>
                    <p className="text-2xl font-bold text-yellow-800">{generatedFiles}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-red-200 bg-gradient-to-br from-red-50 to-red-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-700">Error</p>
                    <p className="text-2xl font-bold text-red-800">{errorFiles}</p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700">Total</p>
                    <p className="text-2xl font-bold text-blue-800">{totalFiles}</p>
                  </div>
                  <Server className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Server List */}
        <Card className="shadow-lg border-slate-200">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Dealer Status
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {dealers.map((dealer, index) => (
                <motion.div
                  key={dealer.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={`/dealer/${dealer.id}`}
                    className="block p-6 hover:bg-slate-50 transition-colors"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-slate-100 rounded-lg">
                            {dealer.server === 'Fabric' && <Globe className="h-5 w-5 text-blue-600" />}
                            {dealer.server === 'Agent' && <HardDrive className="h-5 w-5 text-purple-600" />}
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-800">{dealer.name}</h3>
                            <p className="text-sm text-slate-600">{dealer.dealerId} • {dealer.location}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <div className="flex items-center gap-2 mb-1">
                              <Cpu className="h-4 w-4 text-slate-500" />
                              <span className="text-sm text-slate-600">{dealer.dbArchitecture}</span>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="flex items-center gap-2 mb-1">
                              <HardDrive className="h-4 w-4 text-slate-500" />
                              <span className="text-sm text-slate-600">{dealer.sapSystem}</span>
                            </div>
                          </div>

                          <Badge className={`${getStatusColor(dealer.status)} flex items-center gap-1`}>
                            {getStatusIcon(dealer.status)}
                            {dealer.status}
                          </Badge>
                        </div>
                      </div>

                      {/* File Status Section */}
                      <div className="flex items-start gap-3 pl-14">
                        <div className="flex items-center gap-2 text-sm text-slate-600 min-w-0">
                          <FileText className="h-4 w-4 text-slate-500 flex-shrink-0" />
                          <span className="font-medium">Archivos:</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <FileStatus files={dealer.files} fileSettings={dealer.fileSettings} />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Index;