import React, { useState, useEffect } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, PlusCircle, Trash2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { fetchBookings, deleteBooking } from "@/lib/supabase";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const BookingCalendar = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [view, setView] = useState<"day" | "month">("month");
  const [isLoading, setIsLoading] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);
  const [allBookings, setAllBookings] = useState<any[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [bookingToDelete, setBookingToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Funzione per caricare le prenotazioni per una data specifica
  const fetchBookingsByDate = async (selectedDate: Date) => {
    try {
      setIsLoading(true);
      
      // Formatta la data nel formato YYYY-MM-DD
      const formattedDate = selectedDate.toISOString().split('T')[0];
      console.log("Tentativo di recuperare le prenotazioni per la data:", formattedDate);
      
      // Carica le prenotazioni dal database
      const { data, error } = await supabase
        .from("bookings")
        .select("*, rooms:room_id(*)")
        .or(`check_in.eq.${formattedDate},check_out.eq.${formattedDate}`);
      
      if (error) {
        console.error("Errore nella query Supabase:", error);
        throw error;
      }
      
      console.log("Prenotazioni per la data selezionata:", data);
      setBookings(data || []);
    } catch (error) {
      console.error("Errore nel caricamento delle prenotazioni:", error);
      
      // Verifica se l'errore è relativo alla connessione al database
      if (error instanceof Error) {
        console.error("Dettagli errore:", error.message);
      }
      
      toast({
        title: "Errore",
        description: "Non è stato possibile caricare le prenotazioni",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Funzione per caricare tutte le prenotazioni
  const loadAllBookings = async () => {
    try {
      setIsLoading(true);
      const data = await fetchBookings();
      console.log("Tutte le prenotazioni caricate:", data);
      setAllBookings(data || []);
    } catch (error) {
      console.error("Errore nel caricamento di tutte le prenotazioni:", error);
      toast({
        title: "Errore",
        description: "Non è stato possibile caricare tutte le prenotazioni",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Carica le prenotazioni per la data selezionata quando cambia la data
  useEffect(() => {
    if (date) {
      fetchBookingsByDate(date);
    }
  }, [date]);

  // Carica tutte le prenotazioni all'avvio del componente
  useEffect(() => {
    loadAllBookings();
  }, []);

  const handleCreateBooking = () => {
    navigate("/bookings/new");
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
      setView("day");
    }
  };

  // Funzione per formattare la data
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "long",
      year: "numeric",
    };
    return new Date(dateString).toLocaleDateString("it-IT", options);
  };

  // Funzione per ricaricare i dati
  const refreshData = () => {
    loadAllBookings();
    if (date) {
      fetchBookingsByDate(date);
    }
  };

  // Funzione per eliminare una prenotazione
  const handleDeleteBooking = async () => {
    if (!bookingToDelete) return;
    
    try {
      setIsDeleting(true);
      await deleteBooking(bookingToDelete);
      
      toast({
        title: "Prenotazione eliminata",
        description: "La prenotazione è stata eliminata con successo",
      });
      
      // Aggiorna le liste di prenotazioni
      refreshData();
      
      // Ricarica la pagina dopo un breve ritardo per aggiornare completamente la dashboard
      // Questo è un approccio diretto per garantire che tutti i componenti siano aggiornati
      setTimeout(() => {
        // Utilizzare un evento personalizzato che può essere intercettato in qualsiasi punto dell'app
        const event = new CustomEvent('forceRefreshDashboard');
        window.dispatchEvent(event);
        
        // Se siamo nella pagina della dashboard, ricarica la pagina dopo 500ms
        if (window.location.pathname === "/") {
          setTimeout(() => window.location.reload(), 500);
        }
      }, 300);
    } catch (error) {
      console.error("Errore nell'eliminazione della prenotazione:", error);
      toast({
        title: "Errore",
        description: "Impossibile eliminare la prenotazione",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
      setBookingToDelete(null);
    }
  };
  
  // Funzione per aprire il dialog di conferma eliminazione
  const confirmDelete = (bookingId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Impedisce la navigazione alla pagina dei dettagli
    setBookingToDelete(bookingId);
    setShowDeleteDialog(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Prenotazioni</h2>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={refreshData}>
            <CalendarIcon className="mr-2 h-4 w-4" /> Aggiorna
          </Button>
          <Button onClick={handleCreateBooking}>
            <PlusCircle className="mr-2 h-4 w-4" /> Nuova Prenotazione
          </Button>
        </div>
      </div>

      <Tabs defaultValue="calendar" className="space-y-4">
        <TabsList>
          <TabsTrigger value="calendar">Calendario</TabsTrigger>
          <TabsTrigger value="list">Lista</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Data</CardTitle>
                <CardDescription>
                  Seleziona una data per visualizzare le prenotazioni
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={handleDateSelect}
                  className="rounded-md border"
                />
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={refreshData}>
                  Aggiorna dati
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  Prenotazioni del {date && date.toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" })}
                </CardTitle>
                <CardDescription>
                  Prenotazioni con check-in o check-out in questa data
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : bookings.length > 0 ? (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                        onClick={() => navigate(`/bookings/${booking.id}`)}
                      >
                        <div>
                          <h3 className="font-medium">{booking.guest_name}</h3>
                          <p className="text-sm text-gray-500">
                            Camera {booking.rooms?.room_number} ({booking.rooms?.room_type})
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatDate(booking.check_in)} - {formatDate(booking.check_out)}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <Badge variant={booking.status === "confirmed" ? "default" : "outline"}>
                            {booking.status === "confirmed" ? "Confermata" : "In attesa"}
                          </Badge>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="ml-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={(e) => confirmDelete(booking.id, e)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-gray-500">Nessuna prenotazione trovata per questa data</p>
                    <Button className="mt-4" variant="outline" onClick={handleCreateBooking}>
                      Crea una nuova prenotazione
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Tutte le prenotazioni</CardTitle>
              <CardDescription>
                Lista completa delle prenotazioni recenti
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : allBookings.length > 0 ? (
                <div className="space-y-4">
                  {allBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/bookings/${booking.id}`)}
                    >
                      <div>
                        <h3 className="font-medium">{booking.guest_name}</h3>
                        <p className="text-sm text-gray-500">
                          {booking.guest_email}
                        </p>
                        <p className="text-sm text-gray-500">
                          Check-in: {formatDate(booking.check_in)} | Check-out: {formatDate(booking.check_out)}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <div className="flex flex-col items-end mr-3">
                          <Badge variant={booking.status === "confirmed" ? "default" : "outline"}>
                            {booking.status === "confirmed" ? "Confermata" : "In attesa"}
                          </Badge>
                          <span className="text-sm mt-1">
                            Camera {booking.rooms?.room_number}
                          </span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={(e) => confirmDelete(booking.id, e)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500">Nessuna prenotazione trovata</p>
                  <Button className="mt-4" variant="outline" onClick={handleCreateBooking}>
                    Crea una nuova prenotazione
                  </Button>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={refreshData}>
                <CalendarIcon className="mr-2 h-4 w-4" /> Aggiorna prenotazioni
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Dialog di conferma eliminazione */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sei sicuro di voler eliminare questa prenotazione?</AlertDialogTitle>
            <AlertDialogDescription>
              Questa azione non può essere annullata. La prenotazione verrà eliminata definitivamente dal database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteBooking}
              className="bg-red-600 text-white hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? "Eliminazione in corso..." : "Elimina"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BookingCalendar;
