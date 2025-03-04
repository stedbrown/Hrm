import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Calendar } from "../ui/calendar";
import { format } from "date-fns";
import { CalendarIcon, PlusCircle, Filter, Search, Loader2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Skeleton } from "../ui/skeleton";
import { it } from "date-fns/locale";
import { fetchRooms } from "@/lib/supabase";
import { useToast } from "../ui/use-toast";

interface Room {
  id: string;
  room_number: string;
  room_type: string;
  capacity: number;
  price_per_night: number;
  status: "available" | "occupied" | "maintenance" | "reserved";
  amenities: string[];
  description?: string;
}

interface RoomAvailabilityProps {
  onCreateBooking?: (roomId: string) => void;
  onFilterChange?: (filters: any) => void;
}

const RoomAvailability = ({
  onCreateBooking = () => {},
  onFilterChange = () => {},
}: RoomAvailabilityProps) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    type: "",
    status: "",
    capacity: "",
  });
  const { toast } = useToast();

  // Carica le camere dal database
  useEffect(() => {
    const loadRooms = async () => {
      try {
        setIsLoading(true);
        const roomsData = await fetchRooms();
        setRooms(roomsData);
      } catch (error) {
        console.error("Errore durante il caricamento delle camere:", error);
        toast({
          title: "Errore",
          description: "Non è stato possibile caricare le camere. Riprova più tardi.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadRooms();
  }, [toast]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterChange = (key: string) => (value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      type: "",
      status: "",
      capacity: "",
    });
    setSearchQuery("");
    onFilterChange({});
  };

  const filteredRooms = rooms.filter((room) => {
    // Filtra per query di ricerca
    const matchesSearch =
      searchQuery === "" ||
      room.room_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.room_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (room.description && room.description.toLowerCase().includes(searchQuery.toLowerCase()));

    // Filtra per tipo di camera
    const matchesType = filters.type === "" || room.room_type === filters.type;

    // Filtra per stato
    const matchesStatus = filters.status === "" || room.status === filters.status;

    // Filtra per capacità
    const matchesCapacity =
      filters.capacity === "" ||
      room.capacity >= parseInt(filters.capacity);

    return matchesSearch && matchesType && matchesStatus && matchesCapacity;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800 border-green-300 hover:bg-green-200";
      case "occupied":
        return "bg-red-100 text-red-800 border-red-300 hover:bg-red-200";
      case "maintenance":
        return "bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200";
      case "reserved":
        return "bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "available":
        return "Disponibile";
      case "occupied":
        return "Occupata";
      case "maintenance":
        return "In Manutenzione";
      case "reserved":
        return "Prenotata";
      default:
        return status;
    }
  };

  const renderRoomCard = (room: Room) => {
    return (
      <Card
        key={room.id}
        className="overflow-hidden transition-all duration-200 hover:shadow-md"
      >
        <div className={`h-2 w-full ${getStatusColor(room.status).split(" ")[0]}`} />
        <CardHeader className="p-4 pb-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold">{`Camera ${room.room_number}`}</CardTitle>
            <Badge className={getStatusColor(room.status)}>
              {getStatusText(room.status)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div>
              <p className="text-sm font-semibold text-gray-700">
                {room.room_type} • {room.capacity} {room.capacity === 1 ? "Ospite" : "Ospiti"}
              </p>
              <p className="text-sm text-gray-500">
                {room.description || "Camera confortevole con tutti i servizi essenziali."}
              </p>
            </div>
            <div className="flex flex-wrap gap-1">
              {room.amenities?.slice(0, 3).map((amenity, index) => (
                <Badge key={index} variant="outline" className="text-xs bg-gray-50">
                  {amenity}
                </Badge>
              ))}
              {room.amenities && room.amenities.length > 3 && (
                <Badge variant="outline" className="text-xs bg-gray-50">
                  +{room.amenities.length - 3}
                </Badge>
              )}
            </div>
            <div className="flex items-center justify-between pt-2">
              <p className="font-bold text-lg">€{room.price_per_night.toFixed(2)}</p>
              <Button
                onClick={() => onCreateBooking(room.id)}
                disabled={room.status !== "available"}
                className={`${
                  room.status === "available" ? "bg-primary" : "bg-gray-300"
                } text-white`}
                size="sm"
              >
                {room.status === "available" ? "Prenota" : "Non Disponibile"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  function renderRoomList(roomList: Room[]) {
    return (
      <div className="space-y-4">
        {roomList.map((room) => (
          <Card key={room.id} className="overflow-hidden hover:shadow-md transition-all duration-200">
            <div className="flex flex-col sm:flex-row">
              <div className="p-4 sm:w-3/4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <h3 className="text-lg font-semibold">{`Camera ${room.room_number}`}</h3>
                    <Badge className={getStatusColor(room.status)}>
                      {getStatusText(room.status)}
                    </Badge>
                  </div>
                  <p className="font-bold text-lg hidden sm:block">€{room.price_per_night.toFixed(2)}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-700">{room.room_type} • {room.capacity} {room.capacity === 1 ? "Ospite" : "Ospiti"}</p>
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {room.description || "Camera confortevole con tutti i servizi essenziali."}
                  </p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {room.amenities?.map((amenity, index) => (
                      <Badge key={index} variant="outline" className="text-xs bg-gray-50">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 p-4 flex flex-col justify-center items-center sm:w-1/4">
                <p className="font-bold text-lg block sm:hidden mb-2">€{room.price_per_night.toFixed(2)}</p>
                <Button
                  onClick={() => onCreateBooking(room.id)}
                  disabled={room.status !== "available"}
                  className={`${
                    room.status === "available" ? "bg-primary" : "bg-gray-300"
                  } text-white w-full`}
                >
                  {room.status === "available" ? "Prenota" : "Non Disponibile"}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal sm:w-[240px]"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? (
                  format(date, "PPP", { locale: it })
                ) : (
                  <span>Seleziona data</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                locale={it}
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <div className="relative w-full sm:w-[320px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Cerca camere..."
              className="w-full pl-9"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="text-xs h-9 px-2 md:px-3"
            onClick={() => setView("grid")}
          >
            Griglia
          </Button>
          <Button
            variant="outline"
            className="text-xs h-9 px-2 md:px-3"
            onClick={() => setView("list")}
          >
            Lista
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="text-xs h-9">
                <Filter className="mr-1 h-3.5 w-3.5" />
                Filtri
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[240px] p-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tipo Camera</label>
                  <Select value={filters.type} onValueChange={handleFilterChange("type")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tutti i tipi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Tutti i tipi</SelectItem>
                      <SelectItem value="Standard">Standard</SelectItem>
                      <SelectItem value="Deluxe">Deluxe</SelectItem>
                      <SelectItem value="Suite">Suite</SelectItem>
                      <SelectItem value="Suite Familiare">Suite Familiare</SelectItem>
                      <SelectItem value="Penthouse">Penthouse</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Stato</label>
                  <Select value={filters.status} onValueChange={handleFilterChange("status")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tutti gli stati" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Tutti gli stati</SelectItem>
                      <SelectItem value="available">Disponibile</SelectItem>
                      <SelectItem value="occupied">Occupata</SelectItem>
                      <SelectItem value="maintenance">In Manutenzione</SelectItem>
                      <SelectItem value="reserved">Prenotata</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Capacità Minima</label>
                  <Select value={filters.capacity} onValueChange={handleFilterChange("capacity")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Qualsiasi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Qualsiasi</SelectItem>
                      <SelectItem value="1">1 Ospite</SelectItem>
                      <SelectItem value="2">2 Ospiti</SelectItem>
                      <SelectItem value="3">3 Ospiti</SelectItem>
                      <SelectItem value="4">4 Ospiti</SelectItem>
                      <SelectItem value="5">5+ Ospiti</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline" size="sm" onClick={handleClearFilters} className="w-full">
                  Cancella Filtri
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div>
        {isLoading ? (
          <div className={view === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-4"}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-40 w-full" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-28" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-500">Nessuna camera trovata con i filtri selezionati.</p>
            <Button variant="outline" className="mt-4" onClick={handleClearFilters}>
              Cancella Filtri
            </Button>
          </div>
        ) : view === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRooms.map(renderRoomCard)}
          </div>
        ) : (
          renderRoomList(filteredRooms)
        )}
      </div>
    </div>
  );
};

export default RoomAvailability;
