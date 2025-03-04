import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "../auth/AuthProvider";
import { useToast } from "../ui/use-toast";

export type NotificationType = "info" | "warning" | "success" | "error";

export interface Notification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  type: NotificationType;
  link?: string;
  relatedId?: string;
}

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  addNotification: (notification: Omit<Notification, "id" | "createdAt" | "isRead">) => Promise<void>;
  loading: boolean;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const NotificationsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Carica le notifiche quando l'utente cambia
  useEffect(() => {
    if (user) {
      fetchNotifications();
    } else {
      setNotifications([]);
    }
  }, [user]);

  // Funzione per caricare le notifiche
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      
      // Prima verifica se esiste la tabella delle notifiche
      const { error: tableCheckError } = await supabase
        .from('notifications')
        .select('id')
        .limit(1);
      
      if (tableCheckError) {
        console.error("La tabella delle notifiche potrebbe non esistere:", tableCheckError);
        // Crea un array vuoto di notifiche se la tabella non esiste
        setNotifications([]);
        return;
      }
      
      // Carica le notifiche reali dal database
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      // Mappa i dati dal database al formato interno
      const mappedNotifications: Notification[] = (data || []).map(n => ({
        id: n.id,
        title: n.title,
        message: n.message,
        createdAt: n.created_at,
        isRead: n.is_read,
        type: n.type as NotificationType,
        link: n.link,
        relatedId: n.related_id,
      }));
      
      setNotifications(mappedNotifications);
    } catch (error) {
      console.error("Errore nel caricamento delle notifiche:", error);
      // In caso di errore, usiamo un array vuoto
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  // Numero di notifiche non lette
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Marca una notifica come letta
  const markAsRead = async (id: string) => {
    try {
      // Verifica se esiste la tabella delle notifiche
      const { error: tableCheckError } = await supabase
        .from('notifications')
        .select('id')
        .limit(1);
      
      if (!tableCheckError) {
        // Aggiorna nel database solo se la tabella esiste
        await supabase
          .from("notifications")
          .update({ is_read: true })
          .eq("id", id);
      }
      
      // Aggiorna lo stato locale
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id
            ? { ...notification, isRead: true }
            : notification
        )
      );
    } catch (error) {
      console.error("Errore nell'aggiornamento della notifica:", error);
    }
  };

  // Marca tutte le notifiche come lette
  const markAllAsRead = async () => {
    try {
      // Verifica se esiste la tabella delle notifiche
      const { error: tableCheckError } = await supabase
        .from('notifications')
        .select('id')
        .limit(1);
      
      if (!tableCheckError) {
        // Aggiorna nel database solo se la tabella esiste
        await supabase
          .from("notifications")
          .update({ is_read: true })
          .eq("user_id", user?.id)
          .eq("is_read", false);
      }
      
      // Aggiorna lo stato locale
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, isRead: true }))
      );
      
      toast({
        title: "Notifiche aggiornate",
        description: "Tutte le notifiche sono state segnate come lette",
        variant: "default",
      });
    } catch (error) {
      console.error("Errore nell'aggiornamento delle notifiche:", error);
    }
  };

  // Elimina una notifica
  const deleteNotification = async (id: string) => {
    try {
      // Verifica se esiste la tabella delle notifiche
      const { error: tableCheckError } = await supabase
        .from('notifications')
        .select('id')
        .limit(1);
      
      if (!tableCheckError) {
        // Elimina dal database solo se la tabella esiste
        await supabase
          .from("notifications")
          .delete()
          .eq("id", id);
      }
      
      // Aggiorna lo stato locale
      setNotifications((prev) =>
        prev.filter((notification) => notification.id !== id)
      );
    } catch (error) {
      console.error("Errore nell'eliminazione della notifica:", error);
    }
  };

  // Aggiungi una nuova notifica
  const addNotification = async (
    notification: Omit<Notification, "id" | "createdAt" | "isRead">
  ) => {
    try {
      // Crea la nuova notifica con un ID temporaneo e timestamp
      const tempNotification: Notification = {
        id: Date.now().toString(),
        title: notification.title,
        message: notification.message,
        type: notification.type,
        link: notification.link,
        relatedId: notification.relatedId,
        createdAt: new Date().toISOString(),
        isRead: false,
      };
      
      // Aggiorna lo stato locale immediatamente per l'UI
      setNotifications((prev) => [tempNotification, ...prev]);
      
      // Verifica se esiste la tabella delle notifiche
      const { error: tableCheckError } = await supabase
        .from('notifications')
        .select('id')
        .limit(1);
      
      if (!tableCheckError && user) {
        // Crea nel database solo se la tabella esiste e l'utente è loggato
        const { data, error } = await supabase
          .from("notifications")
          .insert([
            {
              title: notification.title,
              message: notification.message,
              type: notification.type,
              link: notification.link,
              related_id: notification.relatedId,
              user_id: user.id,
              is_read: false,
            },
          ])
          .select();
        
        if (error) throw error;
        
        // Se l'inserimento nel DB è riuscito, aggiorna l'ID locale
        if (data && data[0]) {
          setNotifications((prev) =>
            prev.map((n) =>
              n.id === tempNotification.id
                ? {
                    ...n,
                    id: data[0].id,
                    createdAt: data[0].created_at,
                  }
                : n
            )
          );
        }
      }
      
      // Mostra toast di notifica
      toast({
        title: notification.title,
        description: notification.message,
        variant: "default",
      });
    } catch (error) {
      console.error("Errore nell'aggiunta della notifica:", error);
    }
  };

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        addNotification,
        loading,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications deve essere utilizzato all'interno di un NotificationsProvider"
    );
  }
  return context;
}; 