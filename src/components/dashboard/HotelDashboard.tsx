import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Button } from "../ui/button";
import {
  Calendar as CalendarIcon,
  BarChart,
  Users,
  Building,
  Plus,
  Bell,
  X,
  ArrowUp,
  ArrowDown,
  Loader2,
  CheckCircle,
  Home,
  DollarSign,
  AlertCircle,
} from "lucide-react";
import RoomAvailability from "../booking/RoomAvailability";
import ChannelManager from "../channel/ChannelManager";
import { useNotifications } from "../notifications/NotificationsProvider";
import { useNavigate } from "react-router-dom";
import { fetchHotelStats, fetchHotelName, fetchUserProfile } from "@/lib/supabase";
import { useToast } from "../ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Skeleton } from "../ui/skeleton";
import { motion } from "framer-motion";
import RoomOccupancyMap from "../booking/RoomOccupancyMap";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

interface HotelDashboardProps {}

const HotelDashboard = ({}: HotelDashboardProps) => {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const { addNotification } = useNotifications();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [userName, setUserName] = useState<string>("");
  const [hotelName, setHotelName] = useState<string>("");
  const [stats, setStats] = useState({
    occupancyRate: 0,
    totalBookings: 0,
    pendingArrivals: 0,
    pendingDepartures: 0,
    revenueToday: 0,
    revenueTrend: 0, // percentuale di cambiamento rispetto a ieri
  });
  const [isLoading, setIsLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Stato per il modale di notifica
  const [notificationDialogOpen, setNotificationDialogOpen] = useState(false);
  const [notificationForm, setNotificationForm] = useState({
    title: "",
    message: "",
    type: "info" as "info" | "warning" | "success" | "error",
    link: "/notifications"
  });

  // Funzione per caricare i dati della dashboard
  const loadData = async () => {
    try {
      console.log("Caricamento dati dashboard...");
      setIsLoading(true);
      
      // Carica i dati in parallelo
      const [statsData, hotelNameData, userProfileData] = await Promise.all([
        fetchHotelStats(),
        fetchHotelName(),
        fetchUserProfile().catch(() => null), // Non bloccare il caricamento se non c'è un utente loggato
      ]);
      
      console.log("Dati statistiche ricevuti:", statsData);
      
      // Utilizziamo solo i dati reali, senza aggiungere dati fittizi
      setStats({
        ...statsData,
        // Per il momento impostiamo questi valori a 0, in futuro si potranno implementare
        // funzioni per calcolare questi valori in base ai dati reali
        revenueToday: 0,
        revenueTrend: 0,
      });
      
      setHotelName(hotelNameData);
      
      if (userProfileData) {
        setUserName(userProfileData.name);
      }
    } catch (error) {
      console.error("Errore durante il caricamento dei dati:", error);
      toast({
        title: "Errore",
        description: "Non è stato possibile caricare i dati. Riprova più tardi.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    
    // Aggiungi un listener per l'evento 'bookingDeleted'
    const handleBookingDeleted = () => {
      console.log("Evento bookingDeleted ricevuto, ricarico i dati della dashboard");
      loadData();
    };
    
    // Aggiungi un listener per l'evento 'forceRefreshDashboard'
    const handleForceRefresh = () => {
      console.log("Evento forceRefreshDashboard ricevuto, ricarico i dati della dashboard");
      loadData();
    };
    
    window.addEventListener('bookingDeleted', handleBookingDeleted);
    window.addEventListener('forceRefreshDashboard', handleForceRefresh);
    
    // Rimuovi i listener quando il componente viene smontato
    return () => {
      window.removeEventListener('bookingDeleted', handleBookingDeleted);
      window.removeEventListener('forceRefreshDashboard', handleForceRefresh);
    };
  }, [toast]);

  const handleCreateBooking = () => {
    navigate("/bookings/create");
  };

  // Funzione per creare una notifica di test
  const createTestNotification = (type: "info" | "warning" | "success" | "error") => {
    const titles = {
      info: "Nuova informazione",
      warning: "Attenzione",
      success: "Operazione completata",
      error: "Errore",
    };
    
    const messages = {
      info: "È disponibile un nuovo aggiornamento del sistema.",
      warning: "Ci sono prenotazioni in attesa di conferma.",
      success: "Check-in completato con successo.",
      error: "Si è verificato un errore durante il processo di pagamento.",
    };
    
    addNotification({
      title: titles[type],
      message: messages[type],
      type,
      link: "/notifications",
    });
  };

  // Gestori di eventi per il form di notifica
  const handleOpenNotificationDialog = () => {
    setNotificationDialogOpen(true);
  };

  const handleCloseNotificationDialog = () => {
    setNotificationDialogOpen(false);
  };

  const handleNotificationChange = (field: keyof typeof notificationForm) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setNotificationForm({
      ...notificationForm,
      [field]: e.target.value,
    });
  };

  const handleTypeChange = (value: string) => {
    setNotificationForm({
      ...notificationForm,
      type: value as "info" | "warning" | "success" | "error",
    });
  };

  const handleSubmitNotification = () => {
    if (!notificationForm.title || !notificationForm.message) {
      toast({
        title: "Errore",
        description: "Titolo e messaggio sono obbligatori",
        variant: "destructive",
      });
      return;
    }

    addNotification({
      title: notificationForm.title,
      message: notificationForm.message,
      type: notificationForm.type,
      link: notificationForm.link || "/notifications",
    });

    // Mostra messaggio di successo
    setSuccessMessage("Notifica inviata con successo!");
    setTimeout(() => setSuccessMessage(null), 3000);

    toast({
      title: "Notifica Inviata",
      description: "La notifica è stata inviata con successo",
      variant: "default",
    });

    // Reset del form e chiusura del modale
    setNotificationForm({
      title: "",
      message: "",
      type: "info",
      link: "/notifications"
    });
    handleCloseNotificationDialog();
  };

  if (isLoading) {
  return (
      <div className="space-y-8">
        <div>
          <Skeleton className="h-10 w-80 mb-2" />
          <Skeleton className="h-4 w-60" />
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-28" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-4 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-1 md:col-span-2 lg:col-span-4">
            <CardHeader>
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-10 w-48" />
            </CardContent>
          </Card>
          
          <Card className="col-span-1 md:col-span-2 lg:col-span-3">
            <CardHeader>
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Benvenuto{userName ? `, ${userName}` : ""}
        </h2>
        <p className="text-muted-foreground">
          Dashboard di gestione per {hotelName}
        </p>
      </div>

      {successMessage && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="bg-green-50 border border-green-200 text-green-800 rounded-md p-4 flex items-center"
        >
          <CheckCircle className="h-5 w-5 mr-2" />
          {successMessage}
        </motion.div>
      )}

      <div className="flex justify-end mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => {
            loadData();
            toast({
              title: "Dati aggiornati",
              description: "I dati della dashboard sono stati aggiornati",
            });
          }}
          className="flex items-center gap-1"
        >
          <ArrowUp className="h-4 w-4 mr-1" />
          Aggiorna dati
        </Button>
      </div>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-2">
          <TabsTrigger value="overview">Panoramica</TabsTrigger>
          <TabsTrigger value="availability">Disponibilità</TabsTrigger>
          <TabsTrigger value="channels">Canali</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
              <div className="h-1 w-full bg-blue-500" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Tasso di Occupazione
                </CardTitle>
                <Home className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.occupancyRate}%</div>
                <p className="text-xs text-muted-foreground">
                  Camere occupate / totale
                </p>
              </CardContent>
            </Card>
            <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
              <div className="h-1 w-full bg-indigo-500" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Prenotazioni Totali
                </CardTitle>
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalBookings}</div>
                <p className="text-xs text-muted-foreground">
                  Prenotazioni registrate
                </p>
              </CardContent>
            </Card>
            <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
              <div className="h-1 w-full bg-green-500" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Arrivi Oggi
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.pendingArrivals}
                </div>
                <p className="text-xs text-muted-foreground">
                  Ospiti in arrivo oggi
                </p>
              </CardContent>
            </Card>
            <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
              <div className="h-1 w-full bg-amber-500" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Ricavi Oggi
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  €{stats.revenueToday}
                </div>
                <div className="flex items-center text-xs">
                  {stats.revenueTrend > 0 ? (
                    <>
                      <ArrowUp className="h-3 w-3 mr-1 text-green-500" />
                      <span className="text-green-500">+{stats.revenueTrend}%</span>
                    </>
                  ) : stats.revenueTrend < 0 ? (
                    <>
                      <ArrowDown className="h-3 w-3 mr-1 text-red-500" />
                      <span className="text-red-500">{stats.revenueTrend}%</span>
                    </>
                  ) : (
                    <span className="text-gray-500">0%</span>
                  )}
                  <span className="text-muted-foreground ml-1">rispetto a ieri</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-1 md:col-span-2 lg:col-span-4 transition-all duration-200 hover:shadow-md">
              <CardHeader>
                <CardTitle>Azioni Rapide</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Button 
                    onClick={handleCreateBooking}
                    className="w-full flex items-center justify-center"
                    size="lg"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Nuova Prenotazione
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center justify-center" 
                    size="lg"
                    onClick={() => navigate("/rooms")}
                  >
                    <Building className="mr-2 h-4 w-4" />
                    Gestisci Camere
                  </Button>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full flex items-center justify-center"
                  onClick={handleOpenNotificationDialog}
                >
                  <Bell className="mr-2 h-4 w-4" />
                  Invia Notifica
                </Button>
              </CardContent>
            </Card>

            <Card className="col-span-1 md:col-span-2 lg:col-span-3 transition-all duration-200 hover:shadow-md">
              <CardHeader>
                <CardTitle>Promemoria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.pendingArrivals > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center p-2 bg-red-50 border border-red-100 rounded-md"
                    >
                      <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                      <p className="text-sm text-red-700">
                        {stats.pendingArrivals} check-in da gestire oggi
                      </p>
                    </motion.div>
                  )}
                  {stats.pendingDepartures > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className="flex items-center p-2 bg-amber-50 border border-amber-100 rounded-md"
                    >
                      <div className="w-2 h-2 bg-amber-500 rounded-full mr-2"></div>
                      <p className="text-sm text-amber-700">
                        {stats.pendingDepartures} check-out da gestire oggi
                      </p>
                    </motion.div>
                  )}
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center p-2 bg-blue-50 border border-blue-100 rounded-md"
                  >
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    <p className="text-sm text-blue-700">
                      Statistiche mensili disponibili
                    </p>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="transition-all duration-200 hover:shadow-md">
            <CardHeader>
              <CardTitle>Attività Recenti</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-l-2 border-green-500 pl-3 pb-3 pt-1">
                  <p className="text-sm font-medium">Prenotazione Confermata</p>
                  <p className="text-xs text-muted-foreground">
                    La prenotazione #4872 è stata confermata per Mario Rossi, Camera 304
                  </p>
                  <p className="text-xs text-gray-400 mt-1">20 minuti fa</p>
                </div>
                
                <div className="border-l-2 border-blue-500 pl-3 pb-3 pt-1">
                  <p className="text-sm font-medium">Check-in Completato</p>
                  <p className="text-xs text-muted-foreground">
                    La famiglia Bianchi ha completato il check-in per la Suite 201
                  </p>
                  <p className="text-xs text-gray-400 mt-1">1 ora fa</p>
                </div>
                
                <div className="border-l-2 border-amber-500 pl-3 pb-3 pt-1">
                  <p className="text-sm font-medium">Richiesta Servizio in Camera</p>
                  <p className="text-xs text-muted-foreground">
                    Richiesta di pulizia extra per la camera 102 ricevuta
                  </p>
                  <p className="text-xs text-gray-400 mt-1">3 ore fa</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="availability" className="space-y-4">
          <RoomAvailability />
        </TabsContent>

        <TabsContent value="channels" className="space-y-4">
          <ChannelManager />
        </TabsContent>
      </Tabs>

      {/* Modale per l'invio di una notifica personalizzata */}
      <Dialog open={notificationDialogOpen} onOpenChange={setNotificationDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Invia Notifica</DialogTitle>
            <DialogDescription>
              Compila il form per inviare una notifica personalizzata.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Titolo</Label>
              <Input
                id="title"
                value={notificationForm.title}
                onChange={handleNotificationChange("title")}
                placeholder="Inserisci il titolo della notifica"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="message">Messaggio</Label>
              <Textarea
                id="message"
                value={notificationForm.message}
                onChange={handleNotificationChange("message")}
                placeholder="Inserisci il contenuto della notifica"
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">Tipo di notifica</Label>
              <Select
                value={notificationForm.type}
                onValueChange={handleTypeChange}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Seleziona il tipo di notifica" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">Informazione</SelectItem>
                  <SelectItem value="warning">Avviso</SelectItem>
                  <SelectItem value="success">Successo</SelectItem>
                  <SelectItem value="error">Errore</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="link">Link (opzionale)</Label>
              <Input
                id="link"
                value={notificationForm.link}
                onChange={handleNotificationChange("link")}
                placeholder="/notifications"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={handleCloseNotificationDialog}>
              Annulla
            </Button>
            <Button type="button" onClick={handleSubmitNotification}>
              Invia Notifica
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="mt-8">
        <Alert variant="info" className="bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-800">Informazioni sul sistema di prenotazione</AlertTitle>
          <AlertDescription className="text-blue-700">
            <p>Il nostro sistema gestisce il check-out in modo efficiente:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
              <li>Le camere diventano <strong>disponibili per nuove prenotazioni dal giorno di check-out</strong></li>
              <li>Una camera con check-out il 6 marzo sarà prenotabile a partire dal 6 marzo stesso</li>
              <li>Camere con check-out giornaliero sono evidenziate con un <strong>gradiente speciale</strong> che indica "disponibilità dal pomeriggio"</li>
              <li>Il sistema previene automaticamente prenotazioni sovrapposte sulla stessa camera</li>
            </ul>
          </AlertDescription>
        </Alert>
      </div>

      <div className="mt-8">
        <RoomOccupancyMap />
      </div>
    </div>
  );
};

export default HotelDashboard;
