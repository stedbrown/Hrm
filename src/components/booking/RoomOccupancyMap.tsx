import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { CalendarIcon, Info, User, Users } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { format, addDays, isSameDay } from "date-fns";
import { it } from "date-fns/locale";
import { fetchRoomsWithOccupancy } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { InfoIcon } from "lucide-react";

interface RoomOccupancyMapProps {
  floorView?: boolean;
  onRoomClick?: (roomId: string) => void;
}

const RoomOccupancyMap = ({
  floorView = false,
  onRoomClick,
}: RoomOccupancyMapProps) => {
  const [date, setDate] = useState<Date>(new Date());
  const [roomsData, setRoomsData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("today");
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadRoomsData();
  }, [date]);

  const loadRoomsData = async () => {
    try {
      setIsLoading(true);
      // Utilizza la funzione avanzata che abbiamo creato
      const startDate = format(date, "yyyy-MM-dd");
      const endDate = format(addDays(date, 7), "yyyy-MM-dd");
      
      const data = await fetchRoomsWithOccupancy(startDate, endDate);
      setRoomsData(data);
    } catch (error) {
      console.error("Errore nel caricamento dei dati delle camere:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string, isSelected: boolean = false) => {
    const baseClasses = isSelected ? "border-2 border-primary" : "";
    
    switch (status) {
      case "available":
        return `bg-green-100 text-green-800 ${baseClasses}`;
      case "occupied":
      case "booked":
        return `bg-red-100 text-red-800 ${baseClasses}`;
      case "maintenance":
        return `bg-amber-100 text-amber-800 ${baseClasses}`;
      case "reserved":
        return `bg-blue-100 text-blue-800 ${baseClasses}`;
      case "cleaning":
        return `bg-purple-100 text-purple-800 ${baseClasses}`;
      case "checkout_day":
        return `bg-gradient-to-r from-red-100 to-green-100 text-gray-800 ${baseClasses}`;
      default:
        return `bg-gray-100 text-gray-800 ${baseClasses}`;
    }
  };

  const getStatusName = (status: string) => {
    switch (status) {
      case "available":
        return "Disponibile";
      case "occupied":
      case "booked":
        return "Occupata";
      case "maintenance":
        return "Manutenzione";
      case "reserved":
        return "Prenotata";
      case "cleaning":
        return "Pulizia";
      case "checkout_day":
        return "Disponibile dal pomeriggio";
      default:
        return status;
    }
  };

  const handleRoomClick = (roomId: string) => {
    setSelectedRoom(roomId === selectedRoom ? null : roomId);
    if (onRoomClick) {
      onRoomClick(roomId);
    }
  };
  
  const handleViewBooking = (bookingId?: string) => {
    if (bookingId) {
      navigate(`/bookings/${bookingId}`);
    }
  };

  const getRoomStatusForDate = (room: any, selectedDate: Date) => {
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    
    if (room.availability) {
      const dayAvailability = room.availability.find((day: any) => 
        day.date === dateStr
      );
      
      if (dayAvailability) {
        return dayAvailability.status;
      }
    }
    
    return room.status;
  };
  
  // Raggruppa le camere per piano
  const roomsByFloor = roomsData.reduce((acc: any, room: any) => {
    // Estrai il piano dal numero della camera (assumendo che il primo o i primi due caratteri rappresentino il piano)
    const floorNumber = room.room_number.toString().substring(0, 1);
    
    if (!acc[floorNumber]) {
      acc[floorNumber] = [];
    }
    
    acc[floorNumber].push(room);
    return acc;
  }, {});

  // Funzione per renderizzare il layout del piano delle camere
  const renderFloorLayout = (floor: string, rooms: any[]) => {
    return (
      <div key={floor} className="mb-8">
        <h3 className="text-lg font-medium mb-4">Piano {floor}</h3>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-8 gap-2">
          {rooms.map((room) => {
            const status = selectedTab === "today" 
              ? room.status 
              : getRoomStatusForDate(room, date);
              
            const isSelected = selectedRoom === room.id;
            const hasCurrentBooking = room.currentBooking && selectedTab === "today";
            
            return (
              <TooltipProvider key={room.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      onClick={() => handleRoomClick(room.id)}
                      className={`relative cursor-pointer rounded-lg ${
                        isSelected ? "ring-2 ring-primary ring-offset-2" : ""
                      }`}
                    >
                      <div
                        className={`h-16 flex flex-col items-center justify-center rounded-lg ${getStatusColor(
                          status,
                          isSelected
                        )} p-2 transition-all duration-200`}
                      >
                        <span className="font-bold text-sm">{room.room_number}</span>
                        <span className="text-xs">{room.room_type}</span>
                      </div>
                      {hasCurrentBooking && (
                        <div className="absolute -top-1 -right-1">
                          <Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center rounded-full">
                            <User className="h-3 w-3" />
                          </Badge>
                        </div>
                      )}
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-sm">
                      <p className="font-bold">{`Camera ${room.room_number} - ${room.room_type}`}</p>
                      <p className="text-xs">{`Stato: ${getStatusName(status)}`}</p>
                      <p className="text-xs">{`${room.capacity} persone • €${room.price_per_night}/notte`}</p>
                      {hasCurrentBooking && (
                        <p className="text-xs font-semibold mt-1 text-red-600">
                          Occupata da {room.currentBooking.guest_name}
                        </p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>
      </div>
    );
  };

  // Funzione per renderizzare l'elenco delle camere
  const renderRoomsList = () => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {roomsData.map((room) => {
          const status = selectedTab === "today" 
            ? room.status 
            : getRoomStatusForDate(room, date);
            
          const isSelected = selectedRoom === room.id;
          const hasCurrentBooking = room.currentBooking && selectedTab === "today";
          const hasFutureBookings = room.futureBookings && room.futureBookings.length > 0;
          
          return (
            <motion.div
              key={room.id}
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className={`cursor-pointer ${isSelected ? "ring-2 ring-primary rounded-lg" : ""}`}
              onClick={() => handleRoomClick(room.id)}
            >
              <Card className="overflow-hidden">
                <div className={`h-2 w-full ${getStatusColor(status).split(" ")[0]}`} />
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base">Camera {room.room_number}</CardTitle>
                    <Badge className={getStatusColor(status)}>
                      {getStatusName(status)}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500">{room.room_type} • {room.capacity} Ospiti</p>
                </CardHeader>
                <CardContent className="pt-0">
                  {hasCurrentBooking && (
                    <div className="mb-3 bg-red-50 p-2 rounded border border-red-100">
                      <div className="flex items-center text-sm font-medium text-red-800 mb-1">
                        <User className="mr-1 h-4 w-4" />
                        Occupante Attuale
                      </div>
                      <p className="text-xs text-red-700">{room.currentBooking.guest_name}</p>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Check-in: {format(new Date(room.currentBooking.check_in), "dd/MM")}</span>
                        <span>Check-out: {format(new Date(room.currentBooking.check_out), "dd/MM")}</span>
                      </div>
                      <div className="mt-1 text-xs text-gray-600 italic">
                        <InfoIcon className="inline-block h-3 w-3 mr-1" />
                        Disponibile dal pomeriggio del giorno di check-out
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full mt-2 text-xs h-7"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewBooking(room.currentBooking.id);
                        }}
                      >
                        Dettagli Prenotazione
                      </Button>
                    </div>
                  )}
                  
                  {hasFutureBookings && (
                    <div className="mt-2">
                      <div className="flex items-center text-sm font-medium mb-1">
                        <CalendarIcon className="mr-1 h-4 w-4" />
                        Prossime Prenotazioni
                      </div>
                      {room.futureBookings.slice(0, 2).map((booking: any) => (
                        <div key={booking.id} className="text-xs border-l-2 border-blue-300 pl-2 py-1 mb-1">
                          <p className="font-medium">{booking.guest_name}</p>
                          <div className="flex justify-between text-gray-500">
                            <span>{format(new Date(booking.check_in), "dd/MM")}</span>
                            <span>→</span>
                            <span>{format(new Date(booking.check_out), "dd/MM")}</span>
                          </div>
                        </div>
                      ))}
                      {room.futureBookings.length > 2 && (
                        <p className="text-xs text-gray-500 mt-1">
                          + altre {room.futureBookings.length - 2} prenotazioni
                        </p>
                      )}
                    </div>
                  )}
                  
                  {!hasCurrentBooking && !hasFutureBookings && (
                    <div className="flex items-center justify-center py-4 text-sm text-gray-500">
                      <Info className="mr-2 h-4 w-4" />
                      Nessuna prenotazione attiva o futura
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    );
  };

  // Funzione per renderizzare lo skeleton di caricamento
  const renderLoadingSkeleton = () => {
    return floorView ? (
      <div className="space-y-8">
        {[1, 2, 3].map((floor) => (
          <div key={floor} className="mb-8">
            <Skeleton className="h-6 w-24 mb-4" />
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-8 gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-lg" />
              ))}
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-32 rounded-lg" />
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <CardTitle>Mappa Occupazione Camere</CardTitle>
          <div className="flex items-center space-x-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start text-left font-normal w-[200px]">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(date, "PPP", { locale: it })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  locale={it}
                  mode="single"
                  selected={date}
                  onSelect={(date) => date && setDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            
            <Tabs defaultValue={floorView ? "floor" : "list"} className="w-[200px]">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="floor" onClick={() => onRoomClick && onRoomClick("")}>Piano</TabsTrigger>
                <TabsTrigger value="list" onClick={() => onRoomClick && onRoomClick("")}>Lista</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
        
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="today">Oggi</TabsTrigger>
            <TabsTrigger value="selected">Data Selezionata</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-wrap gap-2">
          <div className="flex items-center text-xs">
            <div className="h-3 w-3 rounded bg-green-100 mr-1"></div>
            <span>Disponibile</span>
          </div>
          <div className="flex items-center text-xs">
            <div className="h-3 w-3 rounded bg-red-100 mr-1"></div>
            <span>Occupata</span>
          </div>
          <div className="flex items-center text-xs">
            <div className="h-3 w-3 rounded bg-blue-100 mr-1"></div>
            <span>Prenotata</span>
          </div>
          <div className="flex items-center text-xs">
            <div className="h-3 w-3 rounded bg-amber-100 mr-1"></div>
            <span>Manutenzione</span>
          </div>
          <div className="flex items-center text-xs">
            <div className="h-3 w-3 rounded bg-purple-100 mr-1"></div>
            <span>Pulizia</span>
          </div>
        </div>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={floorView ? "floor" : "list"}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {isLoading ? (
              renderLoadingSkeleton()
            ) : floorView ? (
              <div className="space-y-8">
                {Object.keys(roomsByFloor).sort().map((floor) => 
                  renderFloorLayout(floor, roomsByFloor[floor])
                )}
              </div>
            ) : (
              renderRoomsList()
            )}
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default RoomOccupancyMap; 