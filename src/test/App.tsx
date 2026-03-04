import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { initAdmin } from "@/lib/store";
import AuthPage from "@/pages/AuthPage";
import PatientDashboard from "@/pages/PatientDashboard";
import AdminDashboard from "@/pages/AdminDashboard";

initAdmin();

const queryClient = new QueryClient();

function AppContent() {
  const { user } = useAuth();
  if (!user) return <AuthPage />;
  if (user.tipo === 'admin') return <AdminDashboard />;
  return <PatientDashboard />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
