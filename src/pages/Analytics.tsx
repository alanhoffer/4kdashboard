import React from 'react';
import { motion } from 'framer-motion';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, Activity, Server, Clock } from 'lucide-react';

const Analytics = () => {
  const performanceData = [
    { time: '00:00', cpu: 45, memory: 62, network: 23 },
    { time: '04:00', cpu: 52, memory: 58, network: 31 },
    { time: '08:00', cpu: 78, memory: 71, network: 45 },
    { time: '12:00', cpu: 85, memory: 79, network: 52 },
    { time: '16:00', cpu: 72, memory: 68, network: 38 },
    { time: '20:00', cpu: 58, memory: 61, network: 29 },
  ];

  const uptimeData = [
    { month: 'Jan', uptime: 99.9 },
    { month: 'Feb', uptime: 99.8 },
    { month: 'Mar', uptime: 99.95 },
    { month: 'Apr', uptime: 99.7 },
    { month: 'May', uptime: 99.9 },
    { month: 'Jun', uptime: 99.85 },
  ];

  return (
    <div className="flex flex-col h-full w-full">
      <header className="flex items-center sticky top-0 z-10 gap-4 border-b border-slate-200 bg-white px-6 py-4">
        <SidebarTrigger />
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Analytics</h1>
          <p className="text-sm text-slate-600">Performance metrics and trends</p>
        </div>
      </header>
      
      <main className="flex-1 overflow-auto p-6 space-y-6">
        {/* Performance Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="shadow-lg border-slate-200">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-slate-200">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                System Performance (24h)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="time" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }} 
                  />
                  <Legend />
                  <Area type="monotone" dataKey="cpu" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="CPU %" />
                  <Area type="monotone" dataKey="memory" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} name="Memory %" />
                  <Area type="monotone" dataKey="network" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="Network %" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Uptime Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="shadow-lg border-slate-200">
            <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 border-b border-slate-200">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-green-600" />
                Uptime Percentage (6 months)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={uptimeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" />
                  <YAxis domain={[99, 100]} stroke="#64748b" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                    formatter={(value) => [`${value}%`, 'Uptime']}
                  />
                  <Bar dataKey="uptime" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="shadow-lg border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700">Avg Response Time</p>
                    <p className="text-2xl font-bold text-blue-800">142ms</p>
                    <p className="text-xs text-blue-600">↓ 12% from last week</p>
                  </div>
                  <Activity className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="shadow-lg border-green-200 bg-gradient-to-br from-green-50 to-green-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700">Total Uptime</p>
                    <p className="text-2xl font-bold text-green-800">99.87%</p>
                    <p className="text-xs text-green-600">↑ 0.2% from last month</p>
                  </div>
                  <Clock className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="shadow-lg border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-700">Active Servers</p>
                    <p className="text-2xl font-bold text-purple-800">12/15</p>
                    <p className="text-xs text-purple-600">3 under maintenance</p>
                  </div>
                  <Server className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Analytics;