import React, { useState } from "react";
import { useNotifications, Notification, NotificationType } from "./NotificationsProvider";
import { format, formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bell,
  Calendar,
  Info,
  MoreVertical,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Trash2,
  CheckCheck,
  Clock,
  Filter,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const NotificationsPage = () => {
  const { notifications, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [filter, setFilter] = useState<NotificationType | "all">("all");
  const navigate = useNavigate();

  // Funzione per filtrare le notifiche
  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "all") return true;
    return notification.type === filter;
  });

  // Raggruppa le notifiche per data (oggi, ieri, questa settimana, questo mese, più vecchie)
  const groupedNotifications = filteredNotifications.reduce(
    (groups, notification) => {
      const date = new Date(notification.createdAt);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const thisWeekStart = new Date(today);
      thisWeekStart.setDate(thisWeekStart.getDate() - today.getDay());
      const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);

      let group = "older";
      if (date >= today) {
        group = "today";
      } else if (date >= yesterday) {
        group = "yesterday";
      } else if (date >= thisWeekStart) {
        group = "thisWeek";
      } else if (date >= thisMonthStart) {
        group = "thisMonth";
      }

      return {
        ...groups,
        [group]: [...(groups[group] || []), notification],
      };
    },
    {} as Record<string, Notification[]>
  );

  // Ottiene l'icona appropriata per il tipo di notifica
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "info":
        return <Info className="h-5 w-5 text-blue-500" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case "success":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  // Funzione per formattare il titolo della sezione
  const getSectionTitle = (section: string) => {
    switch (section) {
      case "today":
        return "Oggi";
      case "yesterday":
        return "Ieri";
      case "thisWeek":
        return "Questa settimana";
      case "thisMonth":
        return "Questo mese";
      case "older":
        return "Più vecchie";
      default:
        return "";
    }
  };

  // Formatta la data della notifica
  const formatNotificationDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date >= today) {
      return formatDistanceToNow(date, { addSuffix: true, locale: it });
    }
    
    if (date >= yesterday) {
      return `Ieri alle ${format(date, "HH:mm")}`;
    }
    
    const thisYear = now.getFullYear();
    const notificationYear = date.getFullYear();
    
    if (notificationYear === thisYear) {
      return format(date, "d MMMM 'alle' HH:mm", { locale: it });
    }
    
    return format(date, "d MMMM yyyy 'alle' HH:mm", { locale: it });
  };

  // Funzione per gestire il click su una notifica
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    if (notification.link) {
      navigate(notification.link);
    }
  };

  // Conteggio delle notifiche per tipo
  const counts = {
    all: notifications.length,
    info: notifications.filter(n => n.type === "info").length,
    warning: notifications.filter(n => n.type === "warning").length,
    success: notifications.filter(n => n.type === "success").length,
    error: notifications.filter(n => n.type === "error").length,
  };

  // Conteggio delle notifiche non lette
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="container max-w-4xl mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center">
          <Bell className="mr-2 h-5 w-5" /> Notifiche
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-3">
              {unreadCount} non lette
            </Badge>
          )}
        </h1>
        <div className="flex space-x-2">
          {unreadCount > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => markAllAsRead()}
              className="flex items-center"
            >
              <CheckCheck className="mr-1 h-4 w-4" />
              <span>Segna tutte come lette</span>
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="all" onClick={() => setFilter("all")}>
              Tutte {counts.all > 0 && <span className="ml-1">({counts.all})</span>}
            </TabsTrigger>
            <TabsTrigger value="info" onClick={() => setFilter("info")}>
              <Info className="mr-1 h-4 w-4 text-blue-500" />
              Informazioni {counts.info > 0 && <span className="ml-1">({counts.info})</span>}
            </TabsTrigger>
            <TabsTrigger value="warning" onClick={() => setFilter("warning")}>
              <AlertTriangle className="mr-1 h-4 w-4 text-amber-500" />
              Avvisi {counts.warning > 0 && <span className="ml-1">({counts.warning})</span>}
            </TabsTrigger>
            <TabsTrigger value="success" onClick={() => setFilter("success")}>
              <CheckCircle2 className="mr-1 h-4 w-4 text-green-500" />
              Successi {counts.success > 0 && <span className="ml-1">({counts.success})</span>}
            </TabsTrigger>
            <TabsTrigger value="error" onClick={() => setFilter("error")}>
              <XCircle className="mr-1 h-4 w-4 text-red-500" />
              Errori {counts.error > 0 && <span className="ml-1">({counts.error})</span>}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="all" className="mt-0">
          <Card>
            <CardContent className="p-6">
              {Object.keys(groupedNotifications).length === 0 ? (
                <div className="text-center py-10">
                  <Bell className="mx-auto h-10 w-10 text-muted-foreground opacity-30" />
                  <h3 className="mt-4 text-lg font-medium">Nessuna notifica</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Non hai notifiche da visualizzare al momento.
                  </p>
                </div>
              ) : (
                <div className="space-y-8">
                  {Object.entries(groupedNotifications).map(([section, sectionNotifications]) => (
                    <div key={section}>
                      <div className="flex items-center mb-4">
                        <h3 className="text-sm font-medium text-muted-foreground uppercase">
                          {getSectionTitle(section)}
                        </h3>
                        <Separator className="ml-3 flex-1" />
                      </div>
                      <div className="space-y-4">
                        {sectionNotifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`flex p-4 rounded-lg border ${
                              !notification.isRead ? "bg-muted/30" : ""
                            }`}
                          >
                            <div className="flex-shrink-0 mr-4">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div 
                              className="flex-1 cursor-pointer"
                              onClick={() => handleNotificationClick(notification)}
                            >
                              <div className="flex justify-between items-start">
                                <h4 className="text-base font-medium">
                                  {notification.title}
                                  {!notification.isRead && (
                                    <span className="ml-2 inline-block h-2 w-2 rounded-full bg-primary"></span>
                                  )}
                                </h4>
                                <div className="text-xs text-muted-foreground flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {formatNotificationDate(notification.createdAt)}
                                </div>
                              </div>
                              <p className="mt-1 text-sm text-muted-foreground">
                                {notification.message}
                              </p>
                              {notification.link && (
                                <Button
                                  variant="link"
                                  size="sm"
                                  className="p-0 h-auto mt-2 text-primary"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleNotificationClick(notification);
                                  }}
                                >
                                  Visualizza
                                </Button>
                              )}
                            </div>
                            <div className="flex-shrink-0 ml-2">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {!notification.isRead && (
                                    <DropdownMenuItem onClick={() => markAsRead(notification.id)}>
                                      <CheckCheck className="mr-2 h-4 w-4" />
                                      Segna come letta
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem onClick={() => deleteNotification(notification.id)}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Elimina
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Altri tab con contenuto identico, filtrato per tipo */}
        <TabsContent value="info" className="mt-0">
          <Card>
            <CardContent className="p-6">
              {/* Identico a "all" ma con filtro applicato */}
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-10">
                  <Info className="mx-auto h-10 w-10 text-blue-500 opacity-30" />
                  <h3 className="mt-4 text-lg font-medium">Nessuna notifica informativa</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Non hai notifiche informative da visualizzare al momento.
                  </p>
                </div>
              ) : (
                // Contenuto filtrato per tipo "info"
                <div className="space-y-8">
                  {/* Contenuto filtrato identico a "all" ma solo per "info" */}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Altri tab simili per warning, success, error */}
      </Tabs>
    </div>
  );
};

export default NotificationsPage; 