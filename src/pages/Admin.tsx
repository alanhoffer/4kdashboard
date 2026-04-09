import React, { useState, useEffect } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Shield, Users, AppWindow, RefreshCw, Check, X, Search } from "lucide-react";
import {
  getAllApps,
  getAllClients,
  getAllUsers,
  createApp,
  assignAppToClient,
  removeAppFromClient,
  deleteUser,
  getClientApps,
  apiRequest
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const Admin = () => {
  const [activeTab, setActiveTab] = useState("clients");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Data states
  const [clients, setClients] = useState<any[]>([]);
  const [apps, setApps] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Form states
  const [newAppName, setNewAppName] = useState("");
  const [newAppDesc, setNewAppDesc] = useState("");
  const [isAppDialogOpen, setIsAppDialogOpen] = useState(false);

  // Client form states
  const [newClientId, setNewClientId] = useState<string>("");
  const [newClientName, setNewClientName] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);

  // User form states
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserClientId, setNewUserClientId] = useState("");
  const [newUserRole, setNewUserRole] = useState("user");
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);

  // Permission management
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [clientApps, setClientApps] = useState<any[]>([]);
  const [isPermissionDialogOpen, setIsPermissionDialogOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [clientsData, appsData, usersData] = await Promise.all([
        getAllClients(),
        getAllApps(),
        getAllUsers()
      ]);
      setClients(clientsData);
      setApps(appsData);
      setUsers(usersData);
    } catch (error: any) {
      toast({
        title: "Error fetching data",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateApp = async () => {
    try {
      await createApp({ name: newAppName, description: newAppDesc });
      toast({ title: "Success", description: "Application created successfully" });
      setNewAppName("");
      setNewAppDesc("");
      setIsAppDialogOpen(false);
      fetchData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleCreateClient = async () => {
    try {
      // Usar apiRequest directamente para POST /clients ya que no lo agregamos a lib/api.ts explícitamente con todos los campos
      const response = await apiRequest('/clients/', {
        method: 'POST',
        body: JSON.stringify({
          id: parseInt(newClientId),
          name: newClientName,
          contact_email: newClientEmail || undefined
        })
      });
      if (!response.ok) throw new Error('Error creating client');
      
      toast({ title: "Success", description: "Client created successfully" });
      setNewClientId("");
      setNewClientName("");
      setNewClientEmail("");
      setIsClientDialogOpen(false);
      fetchData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleCreateUser = async () => {
    try {
      const response = await apiRequest('/users/', {
        method: 'POST',
        body: JSON.stringify({
          email: newUserEmail,
          password: newUserPassword,
          client_id: newUserClientId,
          role: newUserRole
        })
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || 'Error creating user');
      }
      
      toast({ title: "Success", description: "User created successfully" });
      setNewUserEmail("");
      setNewUserPassword("");
      setNewUserClientId("");
      setIsUserDialogOpen(false);
      fetchData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await deleteUser(userId);
      toast({ title: "Success", description: "User deleted" });
      fetchData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleManagePermissions = async (client: any) => {
    setSelectedClient(client);
    try {
      const appsOfClient = await getClientApps(client.client_id);
      setClientApps(appsOfClient);
      setIsPermissionDialogOpen(true);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const toggleAppPermission = async (appId: number, hasPermission: boolean) => {
    try {
      if (hasPermission) {
        await removeAppFromClient(selectedClient.client_id, appId);
      } else {
        await assignAppToClient(selectedClient.client_id, appId);
      }
      const updatedApps = await getClientApps(selectedClient.client_id);
      setClientApps(updatedApps);
      toast({ title: "Success", description: "Permission updated" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const filteredData = (data: any[]) => {
    if (!searchTerm) return data;
    return data.filter(item => 
      Object.values(item).some(val => 
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-50">
      <header className="flex items-center sticky top-0 z-10 gap-4 border-b border-slate-200 bg-white px-6 py-4 shadow-sm">
        <SidebarTrigger />
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-800">Admin Panel</h1>
          <p className="text-sm text-slate-600">Manage clients, applications, and user permissions</p>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
             <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
             Refresh
           </Button>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex items-center justify-between mb-4">
            <TabsList className="bg-white border shadow-sm">
              <TabsTrigger value="clients" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                <Users className="h-4 w-4 mr-2" />
                Clients
              </TabsTrigger>
              <TabsTrigger value="apps" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                <AppWindow className="h-4 w-4 mr-2" />
                Applications
              </TabsTrigger>
              <TabsTrigger value="users" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                <Shield className="h-4 w-4 mr-2" />
                Users
              </TabsTrigger>
            </TabsList>

            <div className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white"
              />
            </div>
          </div>

          {/* Clients Tab */}
          <TabsContent value="clients" className="mt-0">
            <Card className="shadow-sm">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Clients Management</CardTitle>
                    <CardDescription>Manage your clients and their access to applications.</CardDescription>
                  </div>
                  <Dialog open={isClientDialogOpen} onOpenChange={setIsClientDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="h-4 w-4 mr-2" />
                        New Client
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Client</DialogTitle>
                        <DialogDescription>Add a new company/dealer to the system.</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="clientId">Client ID (Integer)</Label>
                          <Input id="clientId" type="number" value={newClientId} onChange={(e) => setNewClientId(e.target.value)} placeholder="e.g. 7" />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="clientName">Name</Label>
                          <Input id="clientName" value={newClientName} onChange={(e) => setNewClientName(e.target.value)} placeholder="e.g. NIBOL" />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="clientEmail">Contact Email (Optional)</Label>
                          <Input id="clientEmail" type="email" value={newClientEmail} onChange={(e) => setNewClientEmail(e.target.value)} placeholder="e.g. admin@nibol.com" />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsClientDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreateClient}>Create</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Dealer ID</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData(clients).map((client) => (
                      <TableRow key={client.client_id}>
                        <TableCell className="font-medium">{client.client_id}</TableCell>
                        <TableCell>{client.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{client.dealer_id}</Badge>
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleManagePermissions(client)}
                          >
                            <Shield className="h-4 w-4 mr-2" />
                            Manage Apps
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Apps Tab */}
          <TabsContent value="apps" className="mt-0">
            <Card className="shadow-sm">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Applications</CardTitle>
                    <CardDescription>Define the applications available in the system.</CardDescription>
                  </div>
                  <Dialog open={isAppDialogOpen} onOpenChange={setIsAppDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="h-4 w-4 mr-2" />
                        New App
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Application</DialogTitle>
                        <DialogDescription>Add a new application to the platform.</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="name">Name</Label>
                          <Input id="name" value={newAppName} onChange={(e) => setNewAppName(e.target.value)} placeholder="e.g. ERP, SEEDZ" />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="desc">Description</Label>
                          <Input id="desc" value={newAppDesc} onChange={(e) => setNewAppDesc(e.target.value)} placeholder="Brief description..." />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAppDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreateApp}>Create</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Created At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData(apps).map((app) => (
                      <TableRow key={app.id}>
                        <TableCell>{app.id}</TableCell>
                        <TableCell className="font-bold">{app.name}</TableCell>
                        <TableCell>{app.description}</TableCell>
                        <TableCell>{new Date(app.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="mt-0">
            <Card className="shadow-sm">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>View and manage all registered users.</CardDescription>
                  </div>
                  <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="h-4 w-4 mr-2" />
                        New User
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New User</DialogTitle>
                        <DialogDescription>Add a new user to a specific client.</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="userEmail">Email</Label>
                          <Input id="userEmail" type="email" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} placeholder="user@company.com" />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="userPassword">Password</Label>
                          <Input id="userPassword" type="password" value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="userClientId">Client</Label>
                          <select 
                            id="userClientId" 
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={newUserClientId} 
                            onChange={(e) => setNewUserClientId(e.target.value)}
                          >
                            <option value="">Select a client...</option>
                            {clients.map(c => (
                              <option key={c.client_id} value={c.client_id}>{c.name} (ID: {c.client_id})</option>
                            ))}
                          </select>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="userRole">Role</Label>
                          <select 
                            id="userRole" 
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={newUserRole} 
                            onChange={(e) => setNewUserRole(e.target.value)}
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsUserDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreateUser}>Create User</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Global Role</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData(users).map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.email}</TableCell>
                        <TableCell>{user.client_name || <span className="text-slate-400">N/A</span>}</TableCell>
                        <TableCell>
                          <Badge variant={user.global_role === 'superadmin' ? 'default' : 'secondary'}>
                            {user.global_role}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Permissions Dialog */}
      <Dialog open={isPermissionDialogOpen} onOpenChange={setIsPermissionDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manage App Permissions: {selectedClient?.name}</DialogTitle>
            <DialogDescription>
              Select which applications this client can access.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="grid grid-cols-1 gap-3">
              {apps.map((app) => {
                const hasPermission = clientApps.some(ca => ca.application_id === app.id);
                return (
                  <div key={app.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${hasPermission ? 'bg-green-100' : 'bg-slate-100'}`}>
                        <AppWindow className={`h-4 w-4 ${hasPermission ? 'text-green-600' : 'text-slate-400'}`} />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{app.name}</p>
                        <p className="text-xs text-slate-500">{app.description}</p>
                      </div>
                    </div>
                    <Button 
                      variant={hasPermission ? "destructive" : "default"} 
                      size="sm"
                      onClick={() => toggleAppPermission(app.id, hasPermission)}
                      className={hasPermission ? "" : "bg-blue-600 hover:bg-blue-700"}
                    >
                      {hasPermission ? (
                        <><X className="h-4 w-4 mr-2" /> Revoke</>
                      ) : (
                        <><Check className="h-4 w-4 mr-2" /> Grant</>
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setIsPermissionDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
