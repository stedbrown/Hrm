import React, { useEffect, useState } from "react";
import { Bell, Check, X, Info, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { useNotifications, Notification } from "./NotificationsProvider";
import { useNavigate } from "react-router-dom";
import { format, formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

interface NotificationsBellProps {
  showLabel?: boolean;
}

const NotificationsBell = ({ showLabel = false }: NotificationsBellProps) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Aggiunge animazione quando arrivano nuove notifiche
  useEffect(() => {
    if (unreadCount > 0) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [unreadCount]);
  
  // Funzione per gestire il click su una notifica
  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    setOpen(false);
    if (notification.link) {
      navigate(notification.link);
    }
  };

  // Ottiene l'icona e il colore appropriati per il tipo di notifica
  const getNotificationColor = (type: Notification["type"]) => {
    switch (type) {
      case "info":
        return "text-blue-500 bg-blue-50 border-blue-200";
      case "warning":
        return "text-amber-500 bg-amber-50 border-amber-200";
      case "success":
        return "text-green-500 bg-green-50 border-green-200";
      case "error":
        return "text-red-500 bg-red-50 border-red-200";
      default:
        return "text-gray-500 bg-gray-50 border-gray-200";
    }
  };
  
  // Restituisce l'icona appropriata in base al tipo di notifica
  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "info":
        return <Info className="h-4 w-4 text-blue-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  // Formatta la data della notifica in modo leggibile
  const formatNotificationDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      // Se la data è di oggi, mostra il tempo relativo (es. "2 ore fa")
      if (new Date().toDateString() === date.toDateString()) {
        return formatDistanceToNow(date, { addSuffix: true, locale: it });
      }
      // Altrimenti mostra la data completa
      return format(date, "d MMMM yyyy, HH:mm", { locale: it });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative h-9 w-9 p-0 rounded-full"
        >
          <motion.div
            animate={isAnimating ? { rotate: [0, -10, 10, -10, 10, 0] } : {}}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <Bell className="h-5 w-5" />
            <AnimatePresence>
              {unreadCount > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-1 -right-1"
                >
                  <Badge
                    className="h-5 min-w-5 flex items-center justify-center rounded-full bg-red-500 text-white text-xs px-1"
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </Badge>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          {showLabel && (
            <span className="sr-only md:not-sr-only md:ml-2 md:text-sm">
              Notifiche
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-medium">Notifiche</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs"
              onClick={() => markAllAsRead()}
            >
              <Check className="mr-1 h-3.5 w-3.5" />
              Segna tutte come lette
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-[300px]">
          {notifications.length === 0 ? (
            <div className="text-center p-6">
              <div className="flex justify-center mb-2">
                <Bell className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">Non hai notifiche</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`
                  p-3 border-b last:border-none hover:bg-gray-50
                  cursor-pointer transition-colors duration-200
                  ${notification.isRead ? "opacity-70" : ""}
                `}
              >
                <div className="flex items-center gap-3">
                  <div className={`rounded-full p-2 ${getNotificationColor(notification.type)}`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className={`text-sm font-semibold ${notification.isRead ? "text-gray-600" : "text-gray-900"}`}>
                        {notification.title}
                        {!notification.isRead && <span className="ml-2 inline-block h-2 w-2 rounded-full bg-blue-500"></span>}
                      </h4>
                      <span className="text-[10px] text-gray-400">
                        {formatNotificationDate(notification.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {notification.message}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </ScrollArea>
        {notifications.length > 0 && (
          <DropdownMenuSeparator />
        )}
        <div className="p-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => {
              setOpen(false);
              navigate("/notifications");
            }}
          >
            Vedi tutte le notifiche
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationsBell; 