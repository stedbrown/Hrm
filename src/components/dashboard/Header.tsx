import React, { useState, useEffect } from "react";
import { Search, User, ChevronDown, Menu, Settings, LogOut } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import NotificationsBell from "../notifications/NotificationsBell";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { useToast } from "../ui/use-toast";
import { fetchUserProfile } from "@/lib/supabase";

interface HeaderProps {
  title?: string;
  onMenuToggle?: () => void;
}

const Header = ({
  title = "Dashboard",
  onMenuToggle = () => {},
}: HeaderProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [userProfile, setUserProfile] = useState<{
    name: string;
    email: string;
    avatar: string | null;
  } | null>(null);
  
  useEffect(() => {
    const loadUserProfile = async () => {
      if (user) {
        try {
          const profile = await fetchUserProfile().catch(() => null);
          
          if (profile) {
            setUserProfile({
              name: profile.name,
              email: profile.email,
              avatar: profile.avatar,
            });
          } else {
            // Usa i dati di base dall'autenticazione se il profilo non è disponibile
            setUserProfile({
              name: user.user_metadata?.name || user.email?.split('@')[0] || "Utente",
              email: user.email || "",
              avatar: user.user_metadata?.avatar_url || null,
            });
          }
        } catch (error) {
          console.error("Errore nel caricamento del profilo:", error);
          // Fallback
          setUserProfile({
            name: user.user_metadata?.name || user.email?.split('@')[0] || "Utente",
            email: user.email || "",
            avatar: user.user_metadata?.avatar_url || null,
          });
        }
      }
    };
    
    loadUserProfile();
  }, [user]);
  
  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logout effettuato",
        description: "Hai effettuato il logout con successo.",
        variant: "default",
      });
      navigate("/");
    } catch (error) {
      console.error("Errore durante il logout:", error);
      toast({
        title: "Errore durante il logout",
        description: "Si è verificato un errore. Riprova più tardi.",
        variant: "destructive",
      });
    }
  };

  // Restituisci le iniziali dal nome per l'avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <header className="sticky top-0 z-10 w-full bg-white border-b shadow-sm">
      <div className="px-4 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden mr-2"
            onClick={onMenuToggle}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Apri menu</span>
          </Button>
          <h1 className="text-xl font-semibold">{title}</h1>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative hidden md:flex w-40 lg:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Cerca..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <NotificationsBell />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-8 w-8 rounded-full"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={userProfile?.avatar || ""} alt={userProfile?.name || ""} />
                  <AvatarFallback>
                    {userProfile?.name ? getInitials(userProfile.name) : "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {userProfile?.name || ""}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {userProfile?.email || ""}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Impostazioni</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
