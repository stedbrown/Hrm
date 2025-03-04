import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useAuth } from "../auth/AuthProvider";
import { useToast } from "../ui/use-toast";
import { fetchUserProfile } from "@/lib/supabase";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  userRole?: "staff" | "management" | "restaurant";
}

const DashboardLayout = ({
  children,
  title = "Dashboard",
  userRole = "staff",
}: DashboardLayoutProps) => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userData, setUserData] = useState<{
    name: string;
    avatar: string | null;
  }>({
    name: "",
    avatar: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Reindirizza all'home page se l'utente non è autenticato
  useEffect(() => {
    if (!loading && !user) {
      toast({
        title: "Accesso richiesto",
        description: "Effettua il login per accedere a questa pagina",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [user, loading, navigate, toast]);

  // Carica i dati dell'utente
  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        try {
          setIsLoading(true);
          const profile = await fetchUserProfile();
          
          setUserData({
            name: profile.name,
            avatar: profile.avatar,
          });
        } catch (error) {
          console.error("Errore nel caricamento del profilo utente:", error);
          // Se non riusciamo a caricare il profilo, usiamo comunque i dati dall'auth
          setUserData({
            name: user.user_metadata?.name || user.email || "",
            avatar: user.user_metadata?.avatar_url || null,
          });
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    loadUserData();
  }, [user]);

  // Non mostrare nulla durante il caricamento
  if (loading || isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-500">Caricamento...</p>
        </div>
      </div>
    );
  }

  // Se l'utente non è autenticato, non mostrare il layout
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          userRole={userRole}
          userName={userData.name}
          userAvatar={userData.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=user"}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Main Content */}
        <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          <Header title={title} />
          <main className="flex-1 p-4 md:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
