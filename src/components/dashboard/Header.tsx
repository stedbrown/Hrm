import React, { useState } from "react";
import { Bell, Search, Settings, User, ChevronDown, Menu } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface HeaderProps {
  title?: string;
  onMenuToggle?: () => void;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  notifications?: Array<{
    id: string;
    title: string;
    description: string;
    time: string;
    read: boolean;
  }>;
}

const Header = ({
  title = "Dashboard",
  onMenuToggle = () => {},
  user = {
    name: "John Doe",
    email: "john.doe@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
  },
  notifications = [
    {
      id: "1",
      title: "New Booking",
      description: "Room 101 has been booked for June 15-18",
      time: "5 minutes ago",
      read: false,
    },
    {
      id: "2",
      title: "Payment Received",
      description: "Payment of $450 received for booking #1234",
      time: "1 hour ago",
      read: false,
    },
    {
      id: "3",
      title: "System Update",
      description: "System will undergo maintenance tonight at 2 AM",
      time: "3 hours ago",
      read: true,
    },
  ],
}: HeaderProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const unreadNotifications = notifications.filter((n) => !n.read).length;

  return (
    <header className="bg-white border-b h-20 px-6 flex items-center justify-between w-full">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden mr-2"
          onClick={onMenuToggle}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold">{title}</h1>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative hidden md:block w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadNotifications > 0 && (
                <Badge
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0"
                  variant="destructive"
                >
                  {unreadNotifications}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="p-4 border-b">
              <div className="font-medium">Notifications</div>
              <div className="text-xs text-muted-foreground">
                You have {unreadNotifications} unread notifications
              </div>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-6 text-center text-muted-foreground">
                  No notifications
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b last:border-0 ${!notification.read ? "bg-muted/50" : ""}`}
                  >
                    <div className="font-medium">{notification.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {notification.description}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {notification.time}
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-2 border-t">
              <Button variant="ghost" size="sm" className="w-full">
                View all notifications
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <div className="font-medium text-sm">{user.name}</div>
                <div className="text-xs text-muted-foreground">
                  {user.email}
                </div>
              </div>
              <ChevronDown className="h-4 w-4 hidden md:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="h-4 w-4 mr-2" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="h-4 w-4 mr-2" /> Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
