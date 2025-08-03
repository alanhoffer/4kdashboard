import React from 'react';
import { motion } from 'framer-motion';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings as SettingsIcon, Bell, Shield, Database, Mail } from 'lucide-react';

const Settings = () => {
  return (
    <div className="flex flex-col h-full w-full">
      <header className="flex items-center sticky top-0 z-10 gap-4 border-b border-slate-200 bg-white px-6 py-4">
        <SidebarTrigger />
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
          <p className="text-sm text-slate-600">Configure your monitoring preferences</p>
        </div>
      </header>
      
      <main className="flex-1 overflow-auto p-6 space-y-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Notification Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-blue-600" />
                  Notification Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Email Alerts</Label>
                    <p className="text-sm text-slate-600">Receive email notifications for server issues</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">SMS Alerts</Label>
                    <p className="text-sm text-slate-600">Get SMS notifications for critical issues</p>
                  </div>
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Slack Integration</Label>
                    <p className="text-sm text-slate-600">Send alerts to your Slack workspace</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Alert Thresholds */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="shadow-lg">
              <CardHeader className="bg-white border-b">
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-yellow-600" />
                  Alert Thresholds
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cpu-threshold">CPU Usage Threshold (%)</Label>
                    <Input id="cpu-threshold" type="number" defaultValue="80" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="memory-threshold">Memory Usage Threshold (%)</Label>
                    <Input id="memory-threshold" type="number" defaultValue="85" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="disk-threshold">Disk Usage Threshold (%)</Label>
                    <Input id="disk-threshold" type="number" defaultValue="90" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="response-threshold">Response Time Threshold (ms)</Label>
                    <Input id="response-threshold" type="number" defaultValue="1000" className="mt-1" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Monitoring Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50 border-b">
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-green-600" />
                  Monitoring Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="check-interval">Check Interval (seconds)</Label>
                    <Input id="check-interval" type="number" defaultValue="60" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="timeout">Request Timeout (seconds)</Label>
                    <Input id="timeout" type="number" defaultValue="30" className="mt-1" />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Auto-restart Failed Services</Label>
                    <p className="text-sm text-slate-600">Automatically attempt to restart failed services</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Save Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex justify-end"
          >
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              Save Settings
            </Button>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Settings;