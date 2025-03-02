import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Button } from "../ui/button";
import {
  Calendar as CalendarIcon,
  BarChart,
  Users,
  Building,
  Plus,
} from "lucide-react";
import RoomAvailability from "../booking/RoomAvailability";
import ChannelManager from "../channel/ChannelManager";

interface HotelDashboardProps {
  userName?: string;
  hotelName?: string;
  stats?: {
    occupancyRate: number;
    totalBookings: number;
    pendingArrivals: number;
    pendingDepartures: number;
  };
}

const HotelDashboard = ({
  userName = "John Doe",
  hotelName = "Grand Hotel",
  stats = {
    occupancyRate: 78,
    totalBookings: 156,
    pendingArrivals: 12,
    pendingDepartures: 8,
  },
}: HotelDashboardProps) => {
  const [activeTab, setActiveTab] = useState<string>("overview");

  const handleCreateBooking = () => {
    // Placeholder for booking creation functionality
    console.log("Create new booking");
  };

  return (
    <div className="w-full h-full bg-gray-50 p-6 overflow-auto">
      {/* Dashboard Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {userName}
          </h1>
          <p className="text-gray-500">
            Here's what's happening at {hotelName} today
          </p>
        </div>
        <Button onClick={handleCreateBooking}>
          <Plus className="mr-2 h-4 w-4" /> New Booking
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Occupancy Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.occupancyRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              +2% from yesterday
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalBookings}</div>
            <p className="text-xs text-muted-foreground mt-1">
              For the current month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Arrivals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.pendingArrivals}</div>
            <p className="text-xs text-muted-foreground mt-1">Today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Departures
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.pendingDepartures}</div>
            <p className="text-xs text-muted-foreground mt-1">Today</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="overview" className="text-base">
            <CalendarIcon className="mr-2 h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="rooms" className="text-base">
            <Building className="mr-2 h-4 w-4" />
            Room Management
          </TabsTrigger>
          <TabsTrigger value="channels" className="text-base">
            <BarChart className="mr-2 h-4 w-4" />
            Channel Manager
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Booking Calendar</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px] flex items-center justify-center bg-gray-100 rounded-md">
                    <p className="text-gray-500">
                      Booking calendar will be displayed here
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Today's Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border-l-4 border-blue-500 pl-4 py-2">
                      <p className="text-sm font-medium">Check-ins</p>
                      <div className="flex items-center mt-1">
                        <Users className="h-4 w-4 mr-2 text-blue-500" />
                        <span className="text-2xl font-bold">12</span>
                      </div>
                    </div>
                    <div className="border-l-4 border-green-500 pl-4 py-2">
                      <p className="text-sm font-medium">Check-outs</p>
                      <div className="flex items-center mt-1">
                        <Users className="h-4 w-4 mr-2 text-green-500" />
                        <span className="text-2xl font-bold">8</span>
                      </div>
                    </div>
                    <div className="border-l-4 border-purple-500 pl-4 py-2">
                      <p className="text-sm font-medium">New Bookings</p>
                      <div className="flex items-center mt-1">
                        <CalendarIcon className="h-4 w-4 mr-2 text-purple-500" />
                        <span className="text-2xl font-bold">5</span>
                      </div>
                    </div>
                    <div className="border-l-4 border-amber-500 pl-4 py-2">
                      <p className="text-sm font-medium">
                        Pending Confirmations
                      </p>
                      <div className="flex items-center mt-1">
                        <CalendarIcon className="h-4 w-4 mr-2 text-amber-500" />
                        <span className="text-2xl font-bold">3</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-5 bg-muted/50 p-3 text-sm font-medium">
                  <div>Guest</div>
                  <div>Room</div>
                  <div>Check In</div>
                  <div>Check Out</div>
                  <div>Status</div>
                </div>
                <div className="divide-y">
                  {[
                    {
                      guest: "John Smith",
                      room: "101 - Deluxe King",
                      checkIn: "2023-06-15",
                      checkOut: "2023-06-18",
                      status: "Confirmed",
                    },
                    {
                      guest: "Sarah Johnson",
                      room: "205 - Suite",
                      checkIn: "2023-06-20",
                      checkOut: "2023-06-25",
                      status: "Pending",
                    },
                    {
                      guest: "Michael Brown",
                      room: "103 - Standard Double",
                      checkIn: "2023-06-10",
                      checkOut: "2023-06-12",
                      status: "Checked Out",
                    },
                    {
                      guest: "Emma Wilson",
                      room: "302 - Deluxe Twin",
                      checkIn: "2023-07-01",
                      checkOut: "2023-07-05",
                      status: "Confirmed",
                    },
                    {
                      guest: "David Lee",
                      room: "401 - Junior Suite",
                      checkIn: "2023-06-28",
                      checkOut: "2023-07-02",
                      status: "Pending",
                    },
                  ].map((booking, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-5 p-3 text-sm items-center"
                    >
                      <div className="font-medium">{booking.guest}</div>
                      <div>{booking.room}</div>
                      <div>{booking.checkIn}</div>
                      <div>{booking.checkOut}</div>
                      <div>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            booking.status === "Confirmed"
                              ? "bg-green-100 text-green-800"
                              : booking.status === "Pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Room Management Tab */}
        <TabsContent value="rooms" className="space-y-6">
          <RoomAvailability />
        </TabsContent>

        {/* Channel Manager Tab */}
        <TabsContent value="channels" className="space-y-6">
          <ChannelManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HotelDashboard;
