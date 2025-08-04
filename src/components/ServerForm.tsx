import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Server, 
  Save, 
  X, 
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Server as ServerType, ServerFile } from '../data/servers';
import { useToast } from '../hooks/use-toast';

interface ServerFormProps {
  server?: ServerType;
  onSave: (server: ServerType) => void;
  onCancel: () => void;
  isNew?: boolean;
}

const ServerForm: React.FC<ServerFormProps> = ({ server, onSave, onCancel, isNew = false }) => {
  const [formData, setFormData] = useState<ServerType>(server || {
    id: '',
    name: '',
    type: 'web',
    status: 'online',
    location: '',
    ip: '',
    cpu: 0,
    memory: 0,
    disk: 0,
    uptime: '0 days',
    os: '',
    loadAverage: '0.00, 0.00, 0.00',
    responseTime: 0,
    lastCheck: 'Never',
    files: [
      { name: 'ELIPS', enabled: false, status: 'disabled' },
      { name: 'PMM', enabled: false, status: 'disabled' },
      { name: 'PartsData', enabled: false, status: 'disabled' },
      { name: 'Seedz', enabled: false, status: 'disabled' }
    ]
  });

  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: keyof ServerType, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileToggle = (fileName: string) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.map(file => 
        file.name === fileName 
          ? { ...file, enabled: !file.enabled, status: !file.enabled ? 'pending' : 'disabled' }
          : file
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.ip || !formData.location) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields (Name, IP, Location).",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Generate ID for new servers
    const serverToSave = {
      ...formData,
      id: isNew ? Date.now().toString() : formData.id,
      lastCheck: 'Just now'
    };

    onSave(serverToSave);
    setIsSaving(false);

    toast({
      title: isNew ? "Server added" : "Server updated",
      description: `${formData.name} has been ${isNew ? 'added' : 'updated'} successfully.`,
    });
  };

  const getFileStatusIcon = (file: ServerFile) => {
    if (!file.enabled) return <AlertCircle className="h-4 w-4 text-gray-400" />;
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5 text-blue-600" />
            {isNew ? 'Add New Server' : `Edit ${formData.name}`}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800">Basic Information</h3>
                
                <div>
                  <Label htmlFor="name">Server Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Web Server 01"
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="type">Server Type</Label>
                  <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="web">Web Server</SelectItem>
                      <SelectItem value="database">Database Server</SelectItem>
                      <SelectItem value="api">API Server</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="offline">Offline</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="New York, US"
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="ip">IP Address *</Label>
                  <Input
                    id="ip"
                    value={formData.ip}
                    onChange={(e) => handleInputChange('ip', e.target.value)}
                    placeholder="192.168.1.10"
                    className="mt-1"
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800">System Information</h3>
                
                <div>
                  <Label htmlFor="os">Operating System</Label>
                  <Input
                    id="os"
                    value={formData.os}
                    onChange={(e) => handleInputChange('os', e.target.value)}
                    placeholder="Ubuntu 22.04 LTS"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="cpu">CPU Usage (%)</Label>
                  <Input
                    id="cpu"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.cpu}
                    onChange={(e) => handleInputChange('cpu', parseInt(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="memory">Memory Usage (%)</Label>
                  <Input
                    id="memory"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.memory}
                    onChange={(e) => handleInputChange('memory', parseInt(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="disk">Disk Usage (%)</Label>
                  <Input
                    id="disk"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.disk}
                    onChange={(e) => handleInputChange('disk', parseInt(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="responseTime">Response Time (ms)</Label>
                  <Input
                    id="responseTime"
                    type="number"
                    min="0"
                    value={formData.responseTime}
                    onChange={(e) => handleInputChange('responseTime', parseInt(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* File Configuration */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800">File Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.files.map((file) => (
                  <div key={file.name} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border">
                    <div className="flex items-center gap-3">
                      {getFileStatusIcon(file)}
                      <span className="font-medium text-slate-800">{file.name}</span>
                      <Badge variant={file.enabled ? "default" : "secondary"} className="text-xs">
                        {file.enabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                    <Switch
                      checked={file.enabled}
                      onCheckedChange={() => handleFileToggle(file.name)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSaving}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSaving ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="h-4 w-4 mr-2"
                    >
                      <Save className="h-4 w-4" />
                    </motion.div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {isNew ? 'Add Server' : 'Save Changes'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ServerForm;