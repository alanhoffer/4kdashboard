import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./components/AppSidebar";
import Index from "@/pages/Index";
import ServerDetails from "@/pages/DealerDetails";
import FileManager from "@/pages/FileManager";
import Analytics from "@/pages/Analytics";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";
import Login from "@/pages/Login";
import { useDealersWithFiles } from "./hooks/useDealersWithFiles";
import { DealerProvider } from "./context/DealerContext";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import ManageServers from "./pages/ManageServers";
import Transform from "./pages/Transform";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <DealerProvider>
                      <SidebarProvider>
                        <div className="flex min-h-screen w-full bg-slate-50">
                          <AppSidebar />
                          <SidebarInset className="flex-1 w-full min-w-0">
                            <Toaster />
                            <Sonner />
                            <Routes>
                              <Route path="/" element={<Index />} />
                              <Route path="/dealer/:id" element={<ServerDetails />} />
                              <Route 
                                path="/files" 
                                element={
                                  <ProtectedRoute requirePermission="upload_files">
                                    <FileManager />
                                  </ProtectedRoute>
                                } 
                              />
                              <Route 
                                path="/transform" 
                                element={
                                  <ProtectedRoute requirePermission="upload_files">
                                    <Transform />
                                  </ProtectedRoute>
                                } 
                              />
                              <Route 
                                path="/manage-servers" 
                                element={
                                  <ProtectedRoute requireSuperadmin>
                                    <ManageServers />
                                  </ProtectedRoute>
                                } 
                              />
                              <Route 
                                path="/analytics" 
                                element={
                                  <ProtectedRoute requirePermission="view_analytics">
                                    <Analytics />
                                  </ProtectedRoute>
                                } 
                              />
                              <Route 
                                path="/clients" 
                                element={
                                  <ProtectedRoute requireSuperadmin>
                                    <ManageServers />
                                  </ProtectedRoute>
                                } 
                              />
                              <Route 
                                path="/users" 
                                element={
                                  <ProtectedRoute requirePermission="manage_users">
                                    <ManageServers />
                                  </ProtectedRoute>
                                } 
                              />
                              <Route path="/settings" element={<Settings />} />
                              <Route path="*" element={<NotFound />} />
                            </Routes>
                          </SidebarInset>
                        </div>
                      </SidebarProvider>
                    </DealerProvider>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;