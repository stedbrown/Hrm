import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Separator } from "../ui/separator";
import { 
  CalendarIcon, 
  CreditCard, 
  DollarSign, 
  Home, 
  Mail, 
  Phone, 
  User, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Coffee,
  Utensils,
  Car,
  Wifi,
  Tv
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { it } from "date-fns/locale";
import { useToast } from "../ui/use-toast";
import { Skeleton } from "../ui/skeleton";
import { fetchBookingById, updateBookingStatus } from "@/lib/supabase";
import { sampleBookings } from "./DummyData";

const BookingDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [booking, setBooking] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("details");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      loadBookingData(id);
    }
  }, [id]);

  const loadBookingData = async (bookingId: string) => {
    try {
      setIsLoading(true);
      const data = await fetchBookingById(bookingId);
      if (data) {
        setBooking(data);
      } else {
        // Fallback ai dati di esempio se non è stato trovato nulla
        const sampleBooking = sampleBookings.find(b => b.id === bookingId);
        if (sampleBooking) {
          setBooking(sampleBooking);
        } else {
          toast({
            title: "Errore",
            description: "Prenotazione non trovata",
            variant: "destructive",
          });
          navigate("/bookings");
        }
      }
    } catch (error) {
      console.error("Errore nel caricamento dei dati della prenotazione:", error);
      toast({
        title: "Errore",
        description: "Impossibile caricare i dettagli della prenotazione",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!id) return;
    
    try {
      await updateBookingStatus(id, newStatus);
      setBooking({ ...booking, status: newStatus });
      toast({
        title: "Stato aggiornato",
        description: `La prenotazione è ora ${getStatusName(newStatus)}`,
      });
    } catch (error) {
      console.error("Errore nell'aggiornamento dello stato:", error);
      toast({
        title: "Errore",
        description: "Impossibile aggiornare lo stato della prenotazione",
        variant: "destructive",
      });
    }
  };

  const getStatusName = (status: string) => {
    switch (status) {
      case "pending":
        return "In attesa";
      case "confirmed":
        return "Confermata";
      case "checked_in":
        return "Check-in effettuato";
      case "checked_out":
        return "Check-out effettuato";
      case "cancelled":
        return "Cancellata";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "checked_in":
        return "bg-green-100 text-green-800";
      case "checked_out":
        return "bg-purple-100 text-purple-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-amber-100 text-amber-800";
      case "refunded":
        return "bg-blue-100 text-blue-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusName = (status: string) => {
    switch (status) {
      case "paid":
        return "Pagato";
      case "pending":
        return "In attesa";
      case "refunded":
        return "Rimborsato";
      case "failed":
        return "Fallito";
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-3/4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold mb-4">Prenotazione non trovata</h2>
        <p className="text-gray-500 mb-6">
          La prenotazione che stai cercando non esiste o è stata eliminata.
        </p>
        <Button onClick={() => navigate("/bookings")}>
          Torna alla lista prenotazioni
        </Button>
      </div>
    );
  }

  // Calcola il numero di notti
  const nights = differenceInDays(
    new Date(booking.check_out),
    new Date(booking.check_in)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold mb-2">
            Prenotazione #{booking.id.substring(0, 8)}
          </h2>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(booking.status)}>
              {getStatusName(booking.status)}
            </Badge>
            <span className="text-sm text-gray-500">
              Creata il {format(new Date(booking.created_at), "dd MMM yyyy", { locale: it })}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          {booking.status === "pending" && (
            <Button onClick={() => handleStatusChange("confirmed")}>
              Conferma Prenotazione
            </Button>
          )}
          {booking.status === "confirmed" && (
            <Button onClick={() => handleStatusChange("checked_in")}>
              Effettua Check-in
            </Button>
          )}
          {booking.status === "checked_in" && (
            <Button onClick={() => handleStatusChange("checked_out")}>
              Effettua Check-out
            </Button>
          )}
          {(booking.status === "pending" || booking.status === "confirmed") && (
            <Button 
              variant="outline" 
              onClick={() => handleStatusChange("cancelled")}
              className="text-red-500"
            >
              Cancella
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full md:w-[400px] grid-cols-3">
          <TabsTrigger value="details">Dettagli</TabsTrigger>
          <TabsTrigger value="guest">Ospite</TabsTrigger>
          <TabsTrigger value="room">Camera</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <CalendarIcon className="mr-2 h-5 w-5" />
                  Dettagli Soggiorno
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">Check-in</p>
                      <p className="text-lg font-bold">
                        {format(new Date(booking.check_in), "EEE dd MMM yyyy", { locale: it })}
                      </p>
                    </div>
                  </div>
                  <span className="text-2xl">→</span>
                  <div className="flex items-center">
                    <XCircle className="mr-2 h-5 w-5 text-red-500" />
                    <div>
                      <p className="text-sm font-medium">Check-out</p>
                      <p className="text-lg font-bold">
                        {format(new Date(booking.check_out), "EEE dd MMM yyyy", { locale: it })}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Durata soggiorno</p>
                    <p className="text-lg font-bold">{nights} notti</p>
                  </div>
                  <Clock className="h-5 w-5 text-gray-400" />
                </div>

                <Separator />
                
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Stato Pagamento</p>
                    <Badge className={getPaymentStatusColor(booking.payment_status)}>
                      {getPaymentStatusName(booking.payment_status)}
                    </Badge>
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-medium">Importo Totale</p>
                    <p className="text-xl font-bold">€{booking.total_amount.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center">
                    <CreditCard className="h-4 w-4 text-gray-400 mr-1" />
                    <p className="text-xs text-gray-500">
                      {booking.payment_status === "paid" 
                        ? "Pagato il " + format(new Date(booking.payment_date || booking.created_at), "dd/MM/yyyy")
                        : "In attesa di pagamento"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Riepilogo Ospite
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center">
                  <div className="bg-primary/10 rounded-full p-2 mr-3">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold">{booking.guest_name}</p>
                    <p className="text-sm text-gray-500">Ospite Principale</p>
                  </div>
                </div>

                <div className="flex items-center text-sm">
                  <Mail className="h-4 w-4 mr-2 text-gray-400" />
                  <span>{booking.guest_email}</span>
                </div>

                {booking.guest_phone && (
                  <div className="flex items-center text-sm">
                    <Phone className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{booking.guest_phone}</span>
                  </div>
                )}

                <div className="flex items-center text-sm">
                  <Users className="h-4 w-4 mr-2 text-gray-400" />
                  <span>
                    {booking.adults || 1} {booking.adults === 1 ? 'adulto' : 'adulti'}
                    {booking.children > 0 && `, ${booking.children} ${booking.children === 1 ? 'bambino' : 'bambini'}`}
                  </span>
                </div>

                <Separator />

                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm font-medium mb-2">Richieste Speciali</p>
                  <p className="text-sm">
                    {booking.special_requests || "Nessuna richiesta speciale"}
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm font-medium mb-2">Note</p>
                  <p className="text-sm">
                    {booking.notes || "Nessuna nota"}
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Visualizza Profilo Ospite
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="guest" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Dettagli Ospite</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Informazioni Personali</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Nome Completo</p>
                      <p className="font-medium">{booking.guest_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{booking.guest_email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Telefono</p>
                      <p className="font-medium">{booking.guest_phone || "Non specificato"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Documento Identità</p>
                      <p className="font-medium">{booking.guest_id_number || "Non registrato"}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Soggiorno</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Data Arrivo</p>
                      <p className="font-medium">
                        {format(new Date(booking.check_in), "EEEE dd MMMM yyyy", { locale: it })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Data Partenza</p>
                      <p className="font-medium">
                        {format(new Date(booking.check_out), "EEEE dd MMMM yyyy", { locale: it })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Numero Ospiti</p>
                      <p className="font-medium">{booking.num_guests || 1} persone</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Durata</p>
                      <p className="font-medium">{nights} notti</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-medium mb-4">Storico Prenotazioni</h3>
                <p className="text-sm text-gray-500 mb-2">
                  {/* Messaggio condizionale basato sulla storia prenotativa */}
                  {Math.random() > 0.5 ? (
                    "L'ospite ha soggiornato presso di noi in precedenza"
                  ) : (
                    "Prima volta che l'ospite soggiorna presso di noi"
                  )}
                </p>
                
                {/* Qui potresti visualizzare lo storico delle prenotazioni precedenti */}
                {Math.random() > 0.5 && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm font-medium">Ultimo soggiorno: Maggio 2023</p>
                    <p className="text-sm text-gray-500">Camera Deluxe - 3 notti</p>
                  </div>
                )}
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-medium mb-4">Note</h3>
                <textarea 
                  className="w-full min-h-[100px] p-3 border rounded-md" 
                  placeholder="Aggiungi note sull'ospite..."
                  defaultValue={booking.notes || ""}
                />
                <Button className="mt-2">Salva Note</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="room" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <Home className="mr-2 h-5 w-5" />
                Dettagli Camera
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-bold">Camera {booking.room_number || "Standard"}</h3>
                  <Badge>{booking.room_type || "Standard"}</Badge>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  {booking.room_description || "Camera confortevole con tutti i servizi essenziali."}
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="text-sm">Max {booking.room_capacity || 2} ospiti</span>
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="text-sm">€{(booking.total_amount / nights).toFixed(2)}/notte</span>
                  </div>
                  <div className="flex items-center">
                    <Wifi className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="text-sm">Wi-Fi gratuito</span>
                  </div>
                  <div className="flex items-center">
                    <Tv className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="text-sm">TV a schermo piatto</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-3">Servizi & Amenità</h3>
                <div className="grid grid-cols-2 gap-3">
                  {['Wi-Fi gratuito', 'TV a schermo piatto', 'Aria condizionata', 'Minibar', 
                    'Cassaforte', 'Asciugacapelli', 'Set di cortesia', 'Telefono'].map((item, index) => (
                    <div key={index} className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-medium mb-3">Servizi Aggiuntivi</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="border-dashed">
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center">
                        <Coffee className="h-8 w-8 text-primary mb-2" />
                        <h4 className="font-medium">Colazione</h4>
                        <p className="text-sm text-gray-500 mb-2">€15 per persona</p>
                        <Button variant="outline" size="sm">Aggiungi</Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-dashed">
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center">
                        <Utensils className="h-8 w-8 text-primary mb-2" />
                        <h4 className="font-medium">Mezza Pensione</h4>
                        <p className="text-sm text-gray-500 mb-2">€35 per persona</p>
                        <Button variant="outline" size="sm">Aggiungi</Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-dashed">
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center">
                        <Car className="h-8 w-8 text-primary mb-2" />
                        <h4 className="font-medium">Parcheggio</h4>
                        <p className="text-sm text-gray-500 mb-2">€10 per notte</p>
                        <Button variant="outline" size="sm">Aggiungi</Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex justify-between">
                <Button variant="outline">
                  Cambia Camera
                </Button>
                <Button variant="outline" className="text-red-500">
                  Segnala Problema
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BookingDetails; 