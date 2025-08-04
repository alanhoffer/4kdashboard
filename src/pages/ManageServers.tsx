import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Edit, 
  Plus, 
  Search, 
  Trash2, 
  Server,
  Globe,
  HardDrive,
  Wifi,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { servers as initialServers, Server as ServerType } from '../data/servers';
import ServerForm from '../components/ServerForm';
import { useToast } from '../hooks/use-toast';

const ManageServers = () => {
  const [servers, setServers] = useState<ServerType[]>(initialServers);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingServer, setEditingServer] = useState<ServerType | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const { toast } = useToast();

  const filteredServers = servers.filter(server =>
    server.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    server.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    server.ip.includes(searchTerm)
  );

  const handleEditServer = (server: ServerType) => {
    setEditingServer(server);
    setIsAddingNew(false);
  };

  const handleAddNew = () => {
    setIsAddingNew(true);
    setEditingServer(null);
  };

  const handleSaveServer = (serverData: ServerType) => {
    if (isAddingNew) {
      setServers(prev => [...prev, serverData]);
    } else {
      setServers(prev => prev.map(s => s.id === serverData.id ? serverData : s));
    }
    setEditingServer(null);
    setIsAddingNew(false);
  };

  const handleDeleteServer = (serverId: string) => {
    const server = servers.find(s => s.id === serverId);
    if (server) {
      setServers(prev => prev.filter(s => s.id !== serverId));
      toast({
        title: "Server deleted",
        description: `${server.name} has been removed from the system.`,
      });
    }
  };

  const handleCancel = () => {
    setEditingServer(null);
    setIsAddingNew(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'offline': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return <Server className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-100 text-green-800 border-green-200';
      case 'offline': return 'bg-red-100 text-red-800 border-red-200';
      case 'warning': return 'bg-white text-yellow-600 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'web': return <Globe className="h-5 w-5 text-blue-600" />;
      case 'database': return <HardDrive className="h-5 w-5 text-purple-600" />;
      case 'api': return <Wifi className="h-5 w-5 text-green-600" />;
      default: return <Server className="h-5 w-5 text-gray-600" />;
    }
  };

  if (editingServer || isAddingNew) {
    return (
      <div className="flex flex-col h-full w-full">
        <header className="flex items-center sticky top-0 z-10 gap-4 border-b border-slate-200 bg-white px-6 py-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              {isAddingNew ? 'Add New Server' : `Edit ${editingServer?.name}`}
            </h1>
            <p className="text-sm text-slate-600">Configure server settings and file management</p>
          </div>
        </header>
        
        <main className="flex-1 overflow-auto p-6">
          <ServerForm
            server={editingServer || undefined}
            onSave={handleSaveServer}
            onCancel={handleCancel}
            isNew={isAddingNew}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full">
      <header className="flex items-center sticky top-0 z-10 gap-4 border-b border-slate-200 bg-white px-6 py-4">
        <SidebarTrigger />
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manage Servers</h1>
          <p className="text-sm text-slate-600">Add, edit, and configure your servers</p>
        </div>
      </header>
      
      <main className="flex-1 overflow-auto p-6 space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search servers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            onClick={handleAddNew}
            className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Server
          </Button>
        </div>

        {/* Server List */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b">
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5 text-blue-600" />
              Servers ({filteredServers.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filteredServers.length === 0 ? (
              <div className="text-center py-12">
                <Server className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">
                  {searchTerm ? 'No servers found matching your search' : 'No servers configured'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredServers.map((server, index) => (
                  <motion.div
                    key={server.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-6 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-slate-100 rounded-lg">
                          {getTypeIcon(server.type)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-800">{server.name}</h3>
                          <p className="text-sm text-slate-600">{server.location} • {server.ip}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {server.type}
                            </Badge>
                            <Badge className={`text-xs ${getStatusColor(server.status)} flex items-center gap-1`}>
                              {getStatusIcon(server.status)}
                              {server.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="text-right text-sm">
                          <p className="text-slate-600">CPU: <span className="font-medium">{server.cpu}%</span></p>
                          <p className="text-slate-600">Memory: <span className="font-medium">{server.memory}%</span></p>
                          <p className="text-slate-600">Disk: <span className="font-medium">{server.disk}%</span></p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditServer(server)}
                            className="flex items-center gap-1"
                          >
                            <Edit className="h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteServer(server.id)}
                            className="flex items-center gap-1 text-red-600 hover:bg-red-50 border-red-200"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700">Total Servers</p>
                    <p className="text-2xl font-bold text-blue-800">{servers.length}</p>
                  </div>
                  <Server className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700">Online</p>
                    <p className="text-2xl font-bold text-green-800">
                      {servers.filter(s => s.status === 'online').length}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-yellow-200 bg-white shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-yellow-700">Warning</p>
                    <p className="text-2xl font-bold text-yellow-800">
                      {servers.filter(s => s.status === 'warning').length}
                    </p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-red-200 bg-gradient-to-br from-red-50 to-red-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-700">Offline</p>
                    <p className="text-2xl font-bold text-red-800">
                      {servers.filter(s => s.status === 'offline').length}
                    </p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default ManageServers;