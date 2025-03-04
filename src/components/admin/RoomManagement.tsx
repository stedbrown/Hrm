import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/lib/supabase";
import { PlusCircle, Pencil, Trash2, CheckCircle, X, Upload } from "lucide-react";

// UI Components
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";
import { Switch } from "../ui/switch";
import { toast } from "../ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Separator } from "../ui/separator";

// Schema di validazione per il form
const roomFormSchema = z.object({
  room_number: z.string().min(1, { message: "Il numero della camera è obbligatorio" }),
  room_type: z.string().min(1, { message: "Il tipo di camera è obbligatorio" }),
  capacity: z.coerce.number().int().min(1, { message: "La capacità deve essere almeno 1" }),
  price_per_night: z.coerce.number().min(0.01, { message: "Il prezzo deve essere maggiore di 0" }),
  status: z.enum(["available", "occupied", "maintenance", "reserved"], {
    required_error: "Lo stato della camera è obbligatorio",
  }),
  amenities: z.array(z.string()).optional(),
  description: z.string().optional(),
});

type RoomFormValues = z.infer<typeof roomFormSchema>;

// Tipi di camera predefiniti
const roomTypes = [
  "Standard",
  "Deluxe",
  "Suite",
  "Suite Familiare",
  "Penthouse",
  "Junior Suite",
  "Doppia",
  "Singola",
];

// Servizi disponibili per le camere
const availableAmenities = [
  "WiFi",
  "TV",
  "AC",
  "Mini Bar",
  "Balcony",
  "Kitchen",
  "Jacuzzi",
  "Safe",
  "Coffee Machine",
  "Hair Dryer",
  "Iron",
  "Sea View",
  "Mountain View",
  "Garden View",
];

const RoomManagement = () => {
  const [rooms, setRooms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [editingRoom, setEditingRoom] = useState<any | null>(null);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");

  const form = useForm<RoomFormValues>({
    resolver: zodResolver(roomFormSchema),
    defaultValues: {
      room_number: "",
      room_type: "",
      capacity: 2,
      price_per_night: 99.99,
      status: "available",
      amenities: [],
      description: "",
    },
  });

  // Funzione per caricare le camere dal database
  const fetchRooms = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("rooms")
        .select("*")
        .order("room_number");

      if (error) throw error;
      setRooms(data || []);
    } catch (error) {
      console.error("Errore nel caricamento delle camere:", error);
      toast({
        title: "Errore",
        description: "Non è stato possibile caricare le camere",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Carica le camere all'inizializzazione
  useEffect(() => {
    fetchRooms();
  }, []);

  // Reset del form quando si apre il dialog
  useEffect(() => {
    if (isDialogOpen) {
      if (editingRoom) {
        // Imposta i valori per l'editing
        form.reset({
          room_number: editingRoom.room_number,
          room_type: editingRoom.room_type,
          capacity: editingRoom.capacity,
          price_per_night: editingRoom.price_per_night,
          status: editingRoom.status,
          amenities: editingRoom.amenities || [],
          description: editingRoom.description || "",
        });
        setSelectedAmenities(editingRoom.amenities || []);
      } else {
        // Reset per nuova camera
        form.reset({
          room_number: "",
          room_type: "",
          capacity: 2,
          price_per_night: 99.99,
          status: "available",
          amenities: [],
          description: "",
        });
        setSelectedAmenities([]);
      }
    }
  }, [isDialogOpen, editingRoom, form]);

  // Gestione invio del form
  const onSubmit = async (values: RoomFormValues) => {
    try {
      setIsLoading(true);

      // Assicurati che amenities sia un array
      const roomData = {
        ...values,
        amenities: selectedAmenities,
      };

      let response;
      if (editingRoom) {
        // Aggiorna camera esistente
        response = await supabase
          .from("rooms")
          .update(roomData)
          .eq("id", editingRoom.id)
          .select();
      } else {
        // Inserisci nuova camera
        response = await supabase
          .from("rooms")
          .insert(roomData)
          .select();
      }

      const { error } = response;
      if (error) throw error;

      // Mostra toast di conferma
      toast({
        title: editingRoom ? "Camera aggiornata" : "Camera creata",
        description: editingRoom
          ? `La camera ${values.room_number} è stata aggiornata`
          : `La camera ${values.room_number} è stata creata`,
        variant: "default",
      });

      // Chiudi il dialog e ricarica le camere
      setIsDialogOpen(false);
      fetchRooms();
    } catch (error) {
      console.error("Errore nel salvataggio della camera:", error);
      toast({
        title: "Errore",
        description: `Non è stato possibile ${editingRoom ? "aggiornare" : "creare"} la camera`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Gestione eliminazione camera
  const handleDeleteRoom = async () => {
    if (!deleteId) return;

    try {
      setIsLoading(true);
      const { error } = await supabase
        .from("rooms")
        .delete()
        .eq("id", deleteId);

      if (error) throw error;

      toast({
        title: "Camera eliminata",
        description: "La camera è stata eliminata con successo",
        variant: "default",
      });

      fetchRooms();
    } catch (error) {
      console.error("Errore nell'eliminazione della camera:", error);
      toast({
        title: "Errore",
        description: "Non è stato possibile eliminare la camera",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsDeleteDialogOpen(false);
      setDeleteId(null);
    }
  };

  // Toggle per la selezione dei servizi
  const toggleAmenity = (amenity: string) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

  // Filtra le camere in base al tab attivo
  const filteredRooms = activeTab === "all" 
    ? rooms 
    : rooms.filter(room => room.status === activeTab);

  // Genera UUID per il file upload
  const generateUUID = () => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Gestione Camere</h1>
          <p className="text-gray-500">
            Aggiungi, modifica e gestisci le camere dell'hotel
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingRoom(null);
                setIsDialogOpen(true);
              }}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Aggiungi Camera
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingRoom ? "Modifica Camera" : "Aggiungi Camera"}
              </DialogTitle>
              <DialogDescription>
                Inserisci i dettagli della camera e clicca su salva quando hai finito.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="room_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Numero Camera</FormLabel>
                        <FormControl>
                          <Input placeholder="101" {...field} />
                        </FormControl>
                        <FormDescription>
                          Inserisci il numero identificativo della camera
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="room_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo Camera</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleziona un tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {roomTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Seleziona il tipo di camera
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="capacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Capacità</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value, 10))
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          Numero massimo di ospiti
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="price_per_night"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prezzo per Notte (€)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0.01"
                            step="0.01"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          Prezzo per una notte
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stato</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleziona lo stato" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="available">Disponibile</SelectItem>
                          <SelectItem value="occupied">Occupata</SelectItem>
                          <SelectItem value="maintenance">Manutenzione</SelectItem>
                          <SelectItem value="reserved">Riservata</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Stato attuale della camera
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <FormLabel>Servizi</FormLabel>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                    {availableAmenities.map((amenity) => (
                      <div
                        key={amenity}
                        className={`flex items-center p-2 rounded-md border cursor-pointer ${
                          selectedAmenities.includes(amenity)
                            ? "border-primary bg-primary/10"
                            : "border-gray-200"
                        }`}
                        onClick={() => toggleAmenity(amenity)}
                      >
                        {selectedAmenities.includes(amenity) ? (
                          <CheckCircle className="h-4 w-4 mr-2 text-primary" />
                        ) : (
                          <PlusCircle className="h-4 w-4 mr-2 text-gray-400" />
                        )}
                        <span className="text-sm">{amenity}</span>
                      </div>
                    ))}
                  </div>
                  <FormDescription className="mt-2">
                    Seleziona i servizi disponibili nella camera
                  </FormDescription>
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrizione</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descrivi la camera..."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Fornisci una descrizione dettagliata della camera
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Annulla
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <div className="h-4 w-4 border-2 border-current border-t-transparent animate-spin rounded-full mr-2" />
                        Salvataggio...
                      </>
                    ) : (
                      <>Salva</>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <div className="p-4 border-b">
            <TabsList className="grid grid-cols-4 sm:grid-cols-4 mb-0">
              <TabsTrigger value="all">Tutte</TabsTrigger>
              <TabsTrigger value="available">Disponibili</TabsTrigger>
              <TabsTrigger value="occupied">Occupate</TabsTrigger>
              <TabsTrigger value="maintenance">Manutenzione</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all" className="m-0">
            <RoomTable 
              rooms={filteredRooms} 
              onEdit={(room) => {
                setEditingRoom(room);
                setIsDialogOpen(true);
              }}
              onDelete={(id) => {
                setDeleteId(id);
                setIsDeleteDialogOpen(true);
              }}
              isLoading={isLoading}
            />
          </TabsContent>
          
          <TabsContent value="available" className="m-0">
            <RoomTable 
              rooms={filteredRooms} 
              onEdit={(room) => {
                setEditingRoom(room);
                setIsDialogOpen(true);
              }}
              onDelete={(id) => {
                setDeleteId(id);
                setIsDeleteDialogOpen(true);
              }}
              isLoading={isLoading}
            />
          </TabsContent>
          
          <TabsContent value="occupied" className="m-0">
            <RoomTable 
              rooms={filteredRooms} 
              onEdit={(room) => {
                setEditingRoom(room);
                setIsDialogOpen(true);
              }}
              onDelete={(id) => {
                setDeleteId(id);
                setIsDeleteDialogOpen(true);
              }}
              isLoading={isLoading}
            />
          </TabsContent>
          
          <TabsContent value="maintenance" className="m-0">
            <RoomTable 
              rooms={filteredRooms} 
              onEdit={(room) => {
                setEditingRoom(room);
                setIsDialogOpen(true);
              }}
              onDelete={(id) => {
                setDeleteId(id);
                setIsDeleteDialogOpen(true);
              }}
              isLoading={isLoading}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog di conferma eliminazione */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Conferma Eliminazione</DialogTitle>
            <DialogDescription>
              Sei sicuro di voler eliminare questa camera? Questa azione non può essere annullata.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Annulla
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteRoom}
              disabled={isLoading}
            >
              {isLoading ? "Eliminazione..." : "Elimina"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Componente per visualizzare la tabella delle camere
interface RoomTableProps {
  rooms: any[];
  onEdit: (room: any) => void;
  onDelete: (id: string) => void;
  isLoading: boolean;
}

const RoomTable = ({ rooms, onEdit, onDelete, isLoading }: RoomTableProps) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Disponibile</Badge>;
      case "occupied":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Occupata</Badge>;
      case "maintenance":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Manutenzione</Badge>;
      case "reserved":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Riservata</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent animate-spin rounded-full"></div>
        <span className="ml-3">Caricamento camere...</span>
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500">Nessuna camera trovata</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Numero</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead className="hidden md:table-cell">Capacità</TableHead>
          <TableHead>Prezzo/Notte</TableHead>
          <TableHead className="hidden md:table-cell">Servizi</TableHead>
          <TableHead>Stato</TableHead>
          <TableHead className="text-right">Azioni</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rooms.map((room) => (
          <TableRow key={room.id}>
            <TableCell className="font-medium">{room.room_number}</TableCell>
            <TableCell>{room.room_type}</TableCell>
            <TableCell className="hidden md:table-cell">{room.capacity} ospiti</TableCell>
            <TableCell>€{room.price_per_night.toFixed(2)}</TableCell>
            <TableCell className="hidden md:table-cell">
              <div className="flex flex-wrap gap-1">
                {(room.amenities || []).slice(0, 3).map((amenity: string) => (
                  <Badge key={amenity} variant="outline" className="text-xs">
                    {amenity}
                  </Badge>
                ))}
                {(room.amenities || []).length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{(room.amenities || []).length - 3}
                  </Badge>
                )}
              </div>
            </TableCell>
            <TableCell>{getStatusBadge(room.status)}</TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => onEdit(room)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => onDelete(room.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default RoomManagement; 