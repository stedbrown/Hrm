import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Calendar as CalendarIcon, ChevronsRight, Hotel, User, Mail, CreditCard, Check, CheckCircle, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { fetchRooms, isRoomAvailable } from "@/lib/supabase";

// Definizione dello schema per la validazione del form
const formSchema = z.object({
  guest_name: z.string().min(3, {
    message: "Il nome deve contenere almeno 3 caratteri",
  }),
  guest_email: z.string().email({
    message: "Inserisci un indirizzo email valido",
  }),
  room_id: z.string({
    required_error: "Seleziona una camera",
  }),
  check_in: z.date({
    required_error: "Seleziona la data di check-in",
  }),
  check_out: z.date({
    required_error: "Seleziona la data di check-out",
  }),
  adults: z.coerce.number().min(1).max(6),
  children: z.coerce.number().min(0).max(4),
  payment_status: z.enum(["pending", "paid"], {
    required_error: "Seleziona lo stato del pagamento",
  }),
  notes: z.string().optional(),
}).refine((data) => data.check_out > data.check_in, {
  message: "La data di check-out deve essere successiva alla data di check-in",
  path: ["check_out"],
});

type FormValues = z.infer<typeof formSchema>;

const BookingFlow = () => {
  const [step, setStep] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string>("");
  const [bookingSummary, setBookingSummary] = useState<FormValues | null>(null);
  const [rooms, setRooms] = useState<any[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      guest_name: "",
      guest_email: "",
      room_id: "",
      adults: 2,
      children: 0,
      payment_status: "pending",
      notes: "",
    },
  });

  // Carica le camere dal database
  useEffect(() => {
    const loadRooms = async () => {
      try {
        setIsLoading(true);
        const roomsData = await fetchRooms();
        console.log("Camere caricate dal database:", roomsData);
        setRooms(roomsData);
      } catch (error) {
        console.error("Errore nel caricamento delle camere:", error);
        toast({
          title: "Errore",
          description: "Non è stato possibile caricare le camere disponibili",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadRooms();
  }, [toast]);

  const onSubmit = async (values: FormValues) => {
    try {
      setIsLoading(true);
      setBookingError(null);

      // Verifica disponibilità in tempo reale prima di confermare la prenotazione
      const checkIn = new Date(values.check_in);
      const checkOut = new Date(values.check_out);
      
      const isAvailable = await isRoomAvailable(
        values.room_id,
        checkIn,
        checkOut
      );
      
      if (!isAvailable) {
        toast({
          title: "Camera non disponibile",
          description: "Questa camera non è più disponibile per le date selezionate. Seleziona un'altra camera o modifica le date.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Calcola il totale della prenotazione
      const selectedRoom = rooms.find(room => room.id === values.room_id);
      const nights = Math.ceil((values.check_out.getTime() - values.check_in.getTime()) / (1000 * 3600 * 24));
      const totalAmount = selectedRoom ? selectedRoom.price_per_night * nights : 0;

      // Prepara i dati per il salvataggio
      const bookingData = {
        guest_name: values.guest_name,
        guest_email: values.guest_email,
        room_id: values.room_id,
        check_in: format(values.check_in, 'yyyy-MM-dd'),
        check_out: format(values.check_out, 'yyyy-MM-dd'),
        status: "confirmed",
        total_amount: totalAmount,
        payment_status: values.payment_status,
        adults: values.adults,
        children: values.children,
        notes: values.notes || null
      };

      console.log("Dati della prenotazione da salvare:", bookingData);

      // Salva la prenotazione nel database
      const { data, error } = await supabase
        .from("bookings")
        .insert(bookingData)
        .select();

      if (error) throw error;

      // Aggiorna lo stato della camera a "reserved"
      await supabase
        .from("rooms")
        .update({ status: "reserved" })
        .eq("id", values.room_id);

      // Crea una notifica per la nuova prenotazione
      toast({
        title: "Prenotazione creata",
        description: "La prenotazione è stata creata con successo",
        variant: "default",
      });

      // Attiva l'effetto confetti per celebrare il successo
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      // Mostra il messaggio di successo
      setBookingSuccess(true);
      
      // Resetta il form dopo 3 secondi e reindirizza
      setTimeout(() => {
        form.reset();
        navigate("/bookings");
      }, 3000);
      
    } catch (error: any) {
      console.error("Errore nella prenotazione:", error);
      
      setBookingError(
        error.message || "Si è verificato un errore durante la prenotazione. Riprova più tardi."
      );
      
      toast({
        title: "Errore",
        description: "Non è stato possibile completare la prenotazione. Riprova più tardi.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoomSelect = (roomId: string) => {
    form.setValue("room_id", roomId);
    setSelectedRoomId(roomId);
  };

  // Calcola il prezzo totale per la prenotazione
  const calculateTotal = () => {
    const roomId = form.getValues("room_id");
    const checkIn = form.getValues("check_in");
    const checkOut = form.getValues("check_out");

    if (!roomId || !checkIn || !checkOut) return 0;

    const selectedRoom = rooms.find(room => room.id === roomId);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 3600 * 24));
    
    return selectedRoom ? selectedRoom.price_per_night * nights : 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Nuova Prenotazione</h2>
        <div className="text-sm text-muted-foreground">
          Passo {step} di 3
        </div>
      </div>

      <div className="flex justify-center mb-8">
        <div className="flex items-center">
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 1 ? 'bg-primary text-white' : 'bg-gray-200'}`}>
            <User size={20} />
          </div>
          <div className="w-16 h-1 bg-gray-200 mx-1">
            <div className={`h-full ${step >= 2 ? 'bg-primary' : 'bg-gray-200'}`} style={{ width: step >= 2 ? '100%' : '0%' }}></div>
          </div>
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 2 ? 'bg-primary text-white' : 'bg-gray-200'}`}>
            <Hotel size={20} />
          </div>
          <div className="w-16 h-1 bg-gray-200 mx-1">
            <div className={`h-full ${step >= 3 ? 'bg-primary' : 'bg-gray-200'}`} style={{ width: step >= 3 ? '100%' : '0%' }}></div>
          </div>
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 3 ? 'bg-primary text-white' : 'bg-gray-200'}`}>
            <CreditCard size={20} />
          </div>
        </div>
      </div>

      {bookingSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg"
        >
          <div className="flex items-start">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2" />
            <div>
              <h3 className="font-medium text-green-800">Prenotazione confermata!</h3>
              <p className="text-green-700 text-sm mt-1">
                La tua prenotazione è stata confermata con successo. Stai per essere reindirizzato...
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {bookingError && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
        >
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2" />
            <div>
              <h3 className="font-medium text-red-800">Errore nella prenotazione</h3>
              <p className="text-red-700 text-sm mt-1">{bookingError}</p>
            </div>
          </div>
        </motion.div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Informazioni Ospite</CardTitle>
                <CardDescription>
                  Inserisci i dettagli dell'ospite per la prenotazione
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="guest_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Mario Rossi" id="guest_name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="guest_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="mario.rossi@example.com"
                          id="guest_email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="adults"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Adulti</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            max={6}
                            id="adults"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="children"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bambini</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            max={4}
                            id="children"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/bookings")}
                >
                  Annulla
                </Button>
                <Button type="button" onClick={() => setStep(2)}>
                  Avanti <ChevronsRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Dettagli soggiorno</CardTitle>
                <CardDescription>
                  Seleziona le date e la camera per il soggiorno
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="check_in"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Data check-in</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                              >
                                {field.value ? (
                                  format(field.value, "PPP", { locale: it })
                                ) : (
                                  <span>Seleziona data</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="check_out"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Data check-out</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                              >
                                {field.value ? (
                                  format(field.value, "PPP", { locale: it })
                                ) : (
                                  <span>Seleziona data</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => {
                                const checkIn = form.getValues("check_in");
                                return !checkIn || date <= checkIn;
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="room_id"
                  render={() => (
                    <FormItem>
                      <FormLabel>Seleziona camera</FormLabel>
                      <FormControl>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                          {rooms.map((room) => (
                            <div
                              key={room.id}
                              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                                selectedRoomId === room.id
                                  ? "border-primary bg-primary/5"
                                  : "hover:border-gray-400"
                              }`}
                              onClick={() => handleRoomSelect(room.id)}
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-medium">Camera {room.room_number}</h3>
                                  <p className="text-sm text-gray-600">{room.room_type}</p>
                                </div>
                                {selectedRoomId === room.id && (
                                  <div className="bg-primary rounded-full p-1">
                                    <Check className="h-4 w-4 text-white" />
                                  </div>
                                )}
                              </div>
                              <div className="mt-2 text-right">
                                <span className="font-bold">€{room.price_per_night}</span>
                                <span className="text-sm text-gray-600">/notte</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                >
                  Indietro
                </Button>
                <Button type="button" onClick={() => setStep(3)}>
                  Avanti <ChevronsRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          )}

          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Riepilogo e Pagamento</CardTitle>
                <CardDescription>
                  Controlla i dettagli della prenotazione e completa il pagamento
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Dettagli ospite</h3>
                    <div className="space-y-2">
                      <div className="flex">
                        <span className="text-gray-500 w-24">Nome:</span>
                        <span className="font-medium">{form.getValues("guest_name")}</span>
                      </div>
                      <div className="flex">
                        <span className="text-gray-500 w-24">Email:</span>
                        <span>{form.getValues("guest_email")}</span>
                      </div>
                      <div className="flex">
                        <span className="text-gray-500 w-24">Persone:</span>
                        <span>
                          {form.getValues("adults")} adulti, {form.getValues("children")} bambini
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Dettagli soggiorno</h3>
                    <div className="space-y-2">
                      <div className="flex">
                        <span className="text-gray-500 w-24">Check-in:</span>
                        <span>
                          {form.getValues("check_in")
                            ? format(form.getValues("check_in"), "PPP", { locale: it })
                            : "-"}
                        </span>
                      </div>
                      <div className="flex">
                        <span className="text-gray-500 w-24">Check-out:</span>
                        <span>
                          {form.getValues("check_out")
                            ? format(form.getValues("check_out"), "PPP", { locale: it })
                            : "-"}
                        </span>
                      </div>
                      <div className="flex">
                        <span className="text-gray-500 w-24">Camera:</span>
                        <span>
                          {selectedRoomId
                            ? `${rooms.find(r => r.id === selectedRoomId)?.room_number} - ${rooms.find(r => r.id === selectedRoomId)?.room_type}`
                            : "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Totale</span>
                    <span>€{calculateTotal().toFixed(2)}</span>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="payment_status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stato pagamento</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleziona stato pagamento" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pending">In attesa</SelectItem>
                          <SelectItem value="paid">Pagato</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Note</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Note aggiuntive (opzionale)"
                          id="notes"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(2)}
                >
                  Indietro
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                      Creazione...
                    </>
                  ) : (
                    "Completa Prenotazione"
                  )}
                </Button>
              </CardFooter>
            </Card>
          )}
        </form>
      </Form>
    </div>
  );
};

export default BookingFlow;
