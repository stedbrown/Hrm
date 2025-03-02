import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Switch } from "../ui/switch";
import { Badge } from "../ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Label } from "../ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import {
  AlertCircle,
  ArrowDownUp,
  ArrowUpDown,
  Check,
  ExternalLink,
  Filter,
  Plus,
  RefreshCw,
  Search,
  Settings,
  RefreshCcw,
} from "lucide-react";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "../ui/tooltip";

interface ChannelManagerProps {
  channels?: Channel[];
  bookings?: ExternalBooking[];
  isLoading?: boolean;
}

interface Channel {
  id: string;
  name: string;
  logo: string;
  status: "active" | "inactive" | "error";
  lastSync: string;
  rooms: number;
}

interface ExternalBooking {
  id: string;
  channelId: string;
  channelName: string;
  guestName: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  status: "pending" | "confirmed" | "cancelled";
  amount: number;
  createdAt: string;
}

const ChannelManager: React.FC<ChannelManagerProps> = ({
  channels = defaultChannels,
  bookings = defaultBookings,
  isLoading = false,
}) => {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [showAddChannelDialog, setShowAddChannelDialog] =
    useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.roomType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.channelName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      filterStatus === "all" || booking.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const handleSyncAll = () => {
    // Placeholder for sync functionality
    console.log("Syncing all channels");
  };

  const handleAddChannel = () => {
    setShowAddChannelDialog(false);
    // Placeholder for adding channel functionality
    console.log("Adding new channel");
  };

  return (
    <div className="w-full h-full bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Channel Manager</h1>
          <p className="text-muted-foreground">
            Manage external booking platforms and synchronize availability
          </p>
        </div>
        <div className="flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={handleSyncAll}>
                  <RefreshCcw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Sync all channels</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button onClick={() => setShowAddChannelDialog(true)}>
            <Plus className="h-4 w-4 mr-2" /> Add Channel
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="bookings">External Bookings</TabsTrigger>
          <TabsTrigger value="settings">Channel Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Channels
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{channels.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {channels.filter((c) => c.status === "active").length} active
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Pending Bookings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {bookings.filter((b) => b.status === "pending").length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Requires confirmation
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Last Sync</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-medium">10 minutes ago</div>
                <p className="text-xs text-muted-foreground mt-1">
                  All channels synced
                </p>
              </CardContent>
            </Card>
          </div>

          <h2 className="text-xl font-semibold mt-8 mb-4">
            Connected Channels
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {channels.map((channel) => (
              <Card key={channel.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <img
                        src={channel.logo}
                        alt={channel.name}
                        className="w-8 h-8 rounded-md"
                      />
                      <CardTitle className="text-base">
                        {channel.name}
                      </CardTitle>
                    </div>
                    <Badge
                      variant={
                        channel.status === "active"
                          ? "default"
                          : channel.status === "error"
                            ? "destructive"
                            : "outline"
                      }
                    >
                      {channel.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Rooms</p>
                      <p className="font-medium">{channel.rooms}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Last Sync</p>
                      <p className="font-medium">{channel.lastSync}</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-2">
                  <div className="flex justify-between w-full">
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4 mr-1" /> Visit
                    </Button>
                    <Button variant="ghost" size="sm">
                      <RefreshCcw className="h-4 w-4 mr-1" /> Sync
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}

            <Card
              className="border-dashed flex items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => setShowAddChannelDialog(true)}
            >
              <CardContent className="flex flex-col items-center justify-center py-8">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <Plus className="h-6 w-6 text-primary" />
                </div>
                <p className="font-medium">Connect New Channel</p>
                <p className="text-sm text-muted-foreground">
                  Add a new booking platform
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="bookings">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search bookings..."
                  className="pl-8 w-[250px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <SelectValue placeholder="Filter by status" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" /> Refresh
            </Button>
          </div>

          <Card>
            <ScrollArea className="h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">
                      <div className="flex items-center gap-1 cursor-pointer">
                        Channel <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center gap-1 cursor-pointer">
                        Guest <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead>Room Type</TableHead>
                    <TableHead>
                      <div className="flex items-center gap-1 cursor-pointer">
                        Check In <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead>Check Out</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No bookings found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>
                          <div className="font-medium">
                            {booking.channelName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {booking.createdAt}
                          </div>
                        </TableCell>
                        <TableCell>{booking.guestName}</TableCell>
                        <TableCell>{booking.roomType}</TableCell>
                        <TableCell>{booking.checkIn}</TableCell>
                        <TableCell>{booking.checkOut}</TableCell>
                        <TableCell>${booking.amount.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              booking.status === "confirmed"
                                ? "default"
                                : booking.status === "cancelled"
                                  ? "destructive"
                                  : "outline"
                            }
                          >
                            {booking.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Channel Synchronization Settings</CardTitle>
              <CardDescription>
                Configure how your hotel inventory is synchronized with external
                booking platforms.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Sync Frequency</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sync-interval">
                      Automatic Sync Interval
                    </Label>
                    <Select defaultValue="15">
                      <SelectTrigger id="sync-interval">
                        <SelectValue placeholder="Select interval" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">Every 5 minutes</SelectItem>
                        <SelectItem value="15">Every 15 minutes</SelectItem>
                        <SelectItem value="30">Every 30 minutes</SelectItem>
                        <SelectItem value="60">Every hour</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="auto-sync" className="flex-1">
                      Enable Automatic Sync
                    </Label>
                    <Switch id="auto-sync" defaultChecked />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Inventory Management</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between space-x-2">
                    <div className="space-y-0.5">
                      <Label htmlFor="auto-close">
                        Auto-close Availability
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically close availability when inventory is low
                      </p>
                    </div>
                    <Switch id="auto-close" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between space-x-2">
                    <div className="space-y-0.5">
                      <Label htmlFor="rate-sync">Sync Rate Changes</Label>
                      <p className="text-sm text-muted-foreground">
                        Push rate changes to all channels automatically
                      </p>
                    </div>
                    <Switch id="rate-sync" defaultChecked />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Notification Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between space-x-2">
                    <div className="space-y-0.5">
                      <Label htmlFor="booking-notifications">
                        New Booking Notifications
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications for new bookings
                      </p>
                    </div>
                    <Switch id="booking-notifications" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between space-x-2">
                    <div className="space-y-0.5">
                      <Label htmlFor="error-notifications">
                        Sync Error Notifications
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications for synchronization errors
                      </p>
                    </div>
                    <Switch id="error-notifications" defaultChecked />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Reset to Defaults</Button>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog
        open={showAddChannelDialog}
        onOpenChange={setShowAddChannelDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Channel</DialogTitle>
            <DialogDescription>
              Connect a new booking platform to synchronize inventory and
              receive bookings.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="channel-name" className="text-right">
                Channel
              </Label>
              <Select defaultValue="booking">
                <SelectTrigger id="channel-name" className="col-span-3">
                  <SelectValue placeholder="Select channel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="booking">Booking.com</SelectItem>
                  <SelectItem value="expedia">Expedia</SelectItem>
                  <SelectItem value="airbnb">Airbnb</SelectItem>
                  <SelectItem value="hotels">Hotels.com</SelectItem>
                  <SelectItem value="custom">Custom Channel</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="api-key" className="text-right">
                API Key
              </Label>
              <Input
                id="api-key"
                placeholder="Enter API key"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="api-secret" className="text-right">
                API Secret
              </Label>
              <Input
                id="api-secret"
                type="password"
                placeholder="Enter API secret"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="text-right col-span-1">
                <Label htmlFor="auto-confirm" className="cursor-pointer">
                  Auto-confirm
                </Label>
              </div>
              <div className="flex items-center space-x-2 col-span-3">
                <Switch id="auto-confirm" />
                <Label
                  htmlFor="auto-confirm"
                  className="text-sm text-muted-foreground cursor-pointer"
                >
                  Automatically confirm bookings from this channel
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddChannelDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddChannel}>Connect Channel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Default mock data
const defaultChannels: Channel[] = [
  {
    id: "1",
    name: "Booking.com",
    logo: "https://api.dicebear.com/7.x/avataaars/svg?seed=booking",
    status: "active",
    lastSync: "10 min ago",
    rooms: 24,
  },
  {
    id: "2",
    name: "Expedia",
    logo: "https://api.dicebear.com/7.x/avataaars/svg?seed=expedia",
    status: "active",
    lastSync: "15 min ago",
    rooms: 18,
  },
  {
    id: "3",
    name: "Airbnb",
    logo: "https://api.dicebear.com/7.x/avataaars/svg?seed=airbnb",
    status: "error",
    lastSync: "1 hour ago",
    rooms: 12,
  },
  {
    id: "4",
    name: "Hotels.com",
    logo: "https://api.dicebear.com/7.x/avataaars/svg?seed=hotels",
    status: "inactive",
    lastSync: "2 hours ago",
    rooms: 8,
  },
];

const defaultBookings: ExternalBooking[] = [
  {
    id: "1",
    channelId: "1",
    channelName: "Booking.com",
    guestName: "John Smith",
    roomType: "Deluxe King",
    checkIn: "2023-06-15",
    checkOut: "2023-06-18",
    status: "confirmed",
    amount: 450.0,
    createdAt: "2023-05-20",
  },
  {
    id: "2",
    channelId: "2",
    channelName: "Expedia",
    guestName: "Sarah Johnson",
    roomType: "Suite",
    checkIn: "2023-06-20",
    checkOut: "2023-06-25",
    status: "pending",
    amount: 1200.0,
    createdAt: "2023-05-21",
  },
  {
    id: "3",
    channelId: "3",
    channelName: "Airbnb",
    guestName: "Michael Brown",
    roomType: "Standard Double",
    checkIn: "2023-06-10",
    checkOut: "2023-06-12",
    status: "cancelled",
    amount: 180.0,
    createdAt: "2023-05-18",
  },
  {
    id: "4",
    channelId: "1",
    channelName: "Booking.com",
    guestName: "Emma Wilson",
    roomType: "Deluxe Twin",
    checkIn: "2023-07-01",
    checkOut: "2023-07-05",
    status: "confirmed",
    amount: 520.0,
    createdAt: "2023-05-25",
  },
  {
    id: "5",
    channelId: "2",
    channelName: "Expedia",
    guestName: "David Lee",
    roomType: "Junior Suite",
    checkIn: "2023-06-28",
    checkOut: "2023-07-02",
    status: "pending",
    amount: 780.0,
    createdAt: "2023-05-26",
  },
  {
    id: "6",
    channelId: "4",
    channelName: "Hotels.com",
    guestName: "Jennifer Garcia",
    roomType: "Executive Suite",
    checkIn: "2023-07-10",
    checkOut: "2023-07-15",
    status: "confirmed",
    amount: 1500.0,
    createdAt: "2023-05-27",
  },
];

export default ChannelManager;
