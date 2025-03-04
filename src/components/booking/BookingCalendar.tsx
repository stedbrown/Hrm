import React, { useState } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, PlusCircle } from "lucide-react";
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

const BookingCalendar = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [view, setView] = useState<"day" | "month">("month");
  const [isLoading, setIsLoading] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Funzione di esempio per caricare le prenotazioni
  const fetchBookings = async (selectedDate: Date) => {
    try {
      setIsLoading(true);
      
      // Formatta la data nel formato YYYY-MM-DD
      const formattedDate = selectedDate.toISOString().split('T')[0];
      
      // Carica le prenotazioni dal database
      const { data, error } = await supabase
        .from("bookings")
        .select("*, rooms:room_id(*)")
        .or(`check_in.eq.${formattedDate},check_out.eq.${formattedDate}`);
      
      if (error) throw error;
      
      setBookings(data || []);
    } catch (error) {
      console.error("Errore nel caricamento delle prenotazioni:", error);
      toast({
        title: "Errore",
        description: "Non è stato possibile caricare le prenotazioni",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Chiama fetchBookings quando cambia la data
  React.useEffect(() => {
    if (date) {
      fetchBookings(date);
    }
  }, [date]);

  // Dati di esempio per il calendario
  const mockBookings = [
    {
      id: "1",
      guest_name: "Mario Rossi",
      guest_email: "mario@example.com",
      check_in: "2023-07-15",
      check_out: "2023-07-18",
      status: "confirmed",
      rooms: { room_number: "101", room_type: "Standard" },
    },
    {
      id: "2",
      guest_name: "Giulia Bianchi",
      guest_email: "giulia@example.com",
      check_in: "2023-07-16",
      check_out: "2023-07-20",
      status: "pending",
      rooms: { room_number: "204", room_type: "Suite" },
    },
  ];

  const handleCreateBooking = () => {
    navigate("/bookings/create");
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Calendario Prenotazioni</h2>
        <Button onClick={handleCreateBooking}>
          <PlusCircle className="mr-2 h-4 w-4" /> Nuova Prenotazione
        </Button>
      </div>

      <Tabs defaultValue="calendar" className="w-full">
        <TabsList>
          <TabsTrigger value="calendar">Calendario</TabsTrigger>
          <TabsTrigger value="list">Lista Prenotazioni</TabsTrigger>
        </TabsList>
        
        <TabsContent value="calendar" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Seleziona una data</CardTitle>
                <CardDescription>
                  Clicca su una data per vedere le prenotazioni
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={handleDateSelect}
                  className="rounded-md border"
                  disabled={{
                    before: new Date(2022, 0, 1), // Disabilita le date prima del 2022
                  }}
                />
              </CardContent>
            </Card>

            <Card className="col-span-1 md:col-span-2">
              <CardHeader>
                <CardTitle>
                  {date ? (
                    <div className="flex items-center">
                      <Button variant="outline" size="icon" onClick={() => {
                        const prevDay = new Date(date);
                        prevDay.setDate(prevDay.getDate() - 1);
                        setDate(prevDay);
                      }}>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <CalendarIcon className="mr-2 h-5 w-5" />
                      <span>
                        {date.toLocaleDateString("it-IT", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                      <Button variant="outline" size="icon" className="ml-2" onClick={() => {
                        const nextDay = new Date(date);
                        nextDay.setDate(nextDay.getDate() + 1);
                        setDate(nextDay);
                      }}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    "Nessuna data selezionata"
                  )}
                </CardTitle>
                <CardDescription>
                  {view === "day"
                    ? "Prenotazioni per la data selezionata"
                    : "Panoramica del mese"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : bookings.length > 0 ? (
                  <div className="space-y-4">
                    {/* Utilizzo i dati mock per mostrare qualcosa */}
                    {mockBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                        onClick={() => navigate(`/bookings/${booking.id}`)}
                      >
                        <div>
                          <h3 className="font-medium">{booking.guest_name}</h3>
                          <p className="text-sm text-gray-500">
                            Camera {booking.rooms.room_number} ({booking.rooms.room_type})
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatDate(booking.check_in)} - {formatDate(booking.check_out)}
                          </p>
                        </div>
                        <Badge variant={booking.status === "confirmed" ? "default" : "outline"}>
                          {booking.status === "confirmed" ? "Confermata" : "In attesa"}
                        </Badge>
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
              <div className="space-y-4">
                {mockBookings.map((booking) => (
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
                    <div className="flex flex-col items-end">
                      <Badge variant={booking.status === "confirmed" ? "default" : "outline"}>
                        {booking.status === "confirmed" ? "Confermata" : "In attesa"}
                      </Badge>
                      <span className="text-sm mt-1">
                        Camera {booking.rooms.room_number}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={handleCreateBooking}>
                <PlusCircle className="mr-2 h-4 w-4" /> Nuova Prenotazione
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BookingCalendar;
