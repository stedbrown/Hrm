import React, { useState } from "react";
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
import { CalendarIcon, PlusCircle, Filter, Search } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

interface Room {
  id: string;
  number: string;
  type: string;
  capacity: number;
  price: number;
  status: "available" | "occupied" | "maintenance" | "reserved";
  amenities: string[];
}

interface RoomAvailabilityProps {
  rooms?: Room[];
  onCreateBooking?: (roomId: string) => void;
  onFilterChange?: (filters: any) => void;
}

const RoomAvailability = ({
  rooms = [
    {
      id: "1",
      number: "101",
      type: "Standard",
      capacity: 2,
      price: 99.99,
      status: "available",
      amenities: ["WiFi", "TV", "AC"],
    },
    {
      id: "2",
      number: "102",
      type: "Deluxe",
      capacity: 2,
      price: 149.99,
      status: "occupied",
      amenities: ["WiFi", "TV", "AC", "Mini Bar"],
    },
    {
      id: "3",
      number: "201",
      type: "Suite",
      capacity: 4,
      price: 249.99,
      status: "available",
      amenities: ["WiFi", "TV", "AC", "Mini Bar", "Jacuzzi"],
    },
    {
      id: "4",
      number: "202",
      type: "Standard",
      capacity: 2,
      price: 99.99,
      status: "maintenance",
      amenities: ["WiFi", "TV", "AC"],
    },
    {
      id: "5",
      number: "301",
      type: "Deluxe",
      capacity: 3,
      price: 179.99,
      status: "reserved",
      amenities: ["WiFi", "TV", "AC", "Mini Bar"],
    },
  ],
  onCreateBooking = () => {},
  onFilterChange = () => {},
}: RoomAvailabilityProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [roomType, setRoomType] = useState<string>("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [showFilters, setShowFilters] = useState(false);

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch =
      room.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = roomType === "" || room.type === roomType;

    return matchesSearch && matchesType;
  });

  const availableRooms = filteredRooms.filter(
    (room) => room.status === "available",
  );
  const occupiedRooms = filteredRooms.filter(
    (room) => room.status === "occupied",
  );
  const maintenanceRooms = filteredRooms.filter(
    (room) => room.status === "maintenance",
  );
  const reservedRooms = filteredRooms.filter(
    (room) => room.status === "reserved",
  );

  const roomTypes = Array.from(new Set(rooms.map((room) => room.type)));

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800";
      case "occupied":
        return "bg-red-100 text-red-800";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800";
      case "reserved":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="w-full h-full bg-white">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>Room Availability</CardTitle>
          <div className="flex space-x-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  {date ? format(date, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
            </Button>
            <Button onClick={() => onCreateBooking("")}>
              <PlusCircle className="h-4 w-4 mr-2" /> New Booking
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search rooms..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={roomType} onValueChange={setRoomType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Room Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                {roomTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid grid-cols-5 mb-4">
            <TabsTrigger value="all">All ({filteredRooms.length})</TabsTrigger>
            <TabsTrigger value="available">
              Available ({availableRooms.length})
            </TabsTrigger>
            <TabsTrigger value="occupied">
              Occupied ({occupiedRooms.length})
            </TabsTrigger>
            <TabsTrigger value="maintenance">
              Maintenance ({maintenanceRooms.length})
            </TabsTrigger>
            <TabsTrigger value="reserved">
              Reserved ({reservedRooms.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {renderRoomList(filteredRooms)}
          </TabsContent>

          <TabsContent value="available" className="space-y-4">
            {renderRoomList(availableRooms)}
          </TabsContent>

          <TabsContent value="occupied" className="space-y-4">
            {renderRoomList(occupiedRooms)}
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-4">
            {renderRoomList(maintenanceRooms)}
          </TabsContent>

          <TabsContent value="reserved" className="space-y-4">
            {renderRoomList(reservedRooms)}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );

  function renderRoomList(roomList: Room[]) {
    if (roomList.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          No rooms match the current filters
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {roomList.map((room) => (
          <Card key={room.id} className="overflow-hidden">
            <div className="p-4 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">Room {room.number}</h3>
                  <Badge className={getStatusColor(room.status)}>
                    {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500">
                  {room.type} - {room.capacity}{" "}
                  {room.capacity > 1 ? "persons" : "person"}
                </p>
                <p className="font-medium">${room.price.toFixed(2)} / night</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {room.amenities.map((amenity) => (
                    <Badge key={amenity} variant="outline" className="text-xs">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>
              <Button
                variant={room.status === "available" ? "default" : "outline"}
                size="sm"
                disabled={room.status !== "available"}
                onClick={() => onCreateBooking(room.id)}
              >
                {room.status === "available" ? "Book Now" : "Unavailable"}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    );
  }
};

export default RoomAvailability;
