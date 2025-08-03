import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Server, 
  Cpu, 
  HardDrive, 
  Wifi, 
  Activity,
  Clock,
  Users,
  Database
} from 'lucide-react';
import { dealers } from '../data/dealers';
import FileManagement from '../components/FileManagement';

const DealerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dealer = dealers.find(s => s.id === id);

  if (!dealer) {
    return (
      <div className="flex flex-col h-full w-full">
        <header className="flex items-center sticky top-0 z-10 gap-4 border-b border-slate-200 bg-white px-6 py-4">
          <SidebarTrigger />
          <h1 className="text-2xl font-semibold">Dealer Not Found</h1>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-slate-600 mb-4">Dealer not found</p>
            <Button onClick={() => navigate('/')}>Back to Overview</Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full">
      <header className="flex items-center sticky top-0 z-10 gap-4 border-b border-slate-200 bg-white px-6 py-4">
        <SidebarTrigger />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/')}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{dealer.name}</h1>
          <p className="text-sm text-slate-600">{dealer.location} • {dealer.ip}</p>
        </div>
      </header>
      
      <main className="flex-1 overflow-auto p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Dealer Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2"
          >
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-slate-200">
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5 text-blue-600" />
                  Dealer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-slate-700 mb-3">System Resources</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Cpu className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium">CPU Usage</span>
                          </div>
                          <span className="text-sm text-slate-600">{dealer.cpu}%</span>
                        </div>
                        <Progress value={dealer.cpu} className="h-3" />
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <HardDrive className="h-4 w-4 text-purple-600" />
                            <span className="text-sm font-medium">Memory Usage</span>
                          </div>
                          <span className="text-sm text-slate-600">{dealer.memory}%</span>
                        </div>
                        <Progress value={dealer.memory} className="h-3" />
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Database className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium">Disk Usage</span>
                          </div>
                          <span className="text-sm text-slate-600">{dealer.disk}%</span>
                        </div>
                        <Progress value={dealer.disk} className="h-3" />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-slate-700 mb-3">Dealer Details</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Type:</span>
                        <Badge variant="outline">{dealer.type}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">OS:</span>
                        <span className="text-sm font-medium">{dealer.os}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Uptime:</span>
                        <span className="text-sm font-medium">{dealer.uptime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Load Average:</span>
                        <span className="text-sm font-medium">{dealer.loadAverage}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Status Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="shadow-lg ">
              <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-600" />
                  Status
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
                    dealer.status === 'online' ? 'bg-green-100 text-green-800' :
                    dealer.status === 'warning' ? 'bg-white text-yellow-600 border border-yellow-200' :
                    'bg-red-100 text-red-800'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      dealer.status === 'online' ? 'bg-green-500' :
                      dealer.status === 'warning' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`} />
                    <span className="font-medium capitalize">{dealer.status}</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Response Time:</span>
                      <span className="text-sm font-medium">{dealer.responseTime}ms</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Last Check:</span>
                      <span className="text-sm font-medium">{dealer.lastCheck}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* File Management Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <FileManagement 
            files={dealer.files} 
            dealerId={dealer.id} 
            dealerName={dealer.name}
          />
        </motion.div>
      </main>
    </div>
  );
};

export default DealerDetails;