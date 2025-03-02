import React, { useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Hotel,
  BarChart3,
  Calendar,
  Users,
  Settings,
  LogOut,
  ChevronDown,
  Utensils,
  Home,
  CreditCard,
  Globe,
  Menu,
  X,
} from "lucide-react";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";

interface SidebarProps {
  userRole?: "staff" | "management" | "restaurant";
  userName?: string;
  userAvatar?: string;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

const Sidebar = ({
  userRole = "staff",
  userName = "John Doe",
  userAvatar = "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
  collapsed = false,
  onToggleCollapse = () => {},
}: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(collapsed);
  const [activeItem, setActiveItem] = useState("dashboard");
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    onToggleCollapse();
  };

  const toggleSubMenu = (key: string) => {
    setOpenSubMenu(openSubMenu === key ? null : key);
  };

  // Navigation items based on user role
  const navigationItems = {
    staff: [
      {
        name: "Dashboard",
        icon: <Home size={20} />,
        key: "dashboard",
        path: "/dashboard",
      },
      {
        name: "Bookings",
        icon: <Calendar size={20} />,
        key: "bookings",
        path: "/bookings",
        subItems: [
          { name: "Calendar", path: "/bookings/calendar" },
          { name: "Room Availability", path: "/bookings/availability" },
          { name: "Create Booking", path: "/bookings/create" },
        ],
      },
      {
        name: "Channel Manager",
        icon: <Globe size={20} />,
        key: "channel",
        path: "/channel-manager",
      },
    ],
    management: [
      {
        name: "Dashboard",
        icon: <Home size={20} />,
        key: "dashboard",
        path: "/dashboard",
      },
      {
        name: "Reports",
        icon: <BarChart3 size={20} />,
        key: "reports",
        path: "/reports",
      },
      {
        name: "Users",
        icon: <Users size={20} />,
        key: "users",
        path: "/users",
      },
      {
        name: "Settings",
        icon: <Settings size={20} />,
        key: "settings",
        path: "/settings",
      },
    ],
    restaurant: [
      {
        name: "Dashboard",
        icon: <Home size={20} />,
        key: "dashboard",
        path: "/restaurant",
      },
      {
        name: "Menu",
        icon: <Utensils size={20} />,
        key: "menu",
        path: "/restaurant/menu",
      },
      {
        name: "Inventory",
        icon: <BarChart3 size={20} />,
        key: "inventory",
        path: "/restaurant/inventory",
      },
      {
        name: "Orders",
        icon: <CreditCard size={20} />,
        key: "orders",
        path: "/restaurant/orders",
      },
    ],
  };

  const items = navigationItems[userRole] || navigationItems.staff;

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-white border-r transition-all duration-300",
        isCollapsed ? "w-[70px]" : "w-[280px]",
      )}
    >
      {/* Logo and collapse button */}
      <div className="flex items-center justify-between p-4 border-b">
        {!isCollapsed && (
          <div className="flex items-center">
            <Hotel className="h-6 w-6 text-primary mr-2" />
            <span className="font-bold text-lg">Hotel Manager</span>
          </div>
        )}
        {isCollapsed && (
          <div className="mx-auto">
            <Hotel className="h-6 w-6 text-primary" />
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleCollapse}
          className={isCollapsed ? "mx-auto" : ""}
        >
          {isCollapsed ? <Menu size={18} /> : <X size={18} />}
        </Button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-2">
          {items.map((item) => (
            <div key={item.key}>
              {item.subItems ? (
                <Collapsible
                  open={openSubMenu === item.key}
                  onOpenChange={() => toggleSubMenu(item.key)}
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant={activeItem === item.key ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start mb-1",
                        isCollapsed ? "px-2" : "px-3",
                      )}
                    >
                      <div className="flex items-center w-full">
                        {isCollapsed ? (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="mx-auto">{item.icon}</div>
                              </TooltipTrigger>
                              <TooltipContent side="right">
                                <p>{item.name}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          <>
                            {item.icon}
                            <span className="ml-3 flex-1 text-left">
                              {item.name}
                            </span>
                            <ChevronDown
                              size={16}
                              className={cn(
                                "transition-transform duration-200",
                                openSubMenu === item.key && "rotate-180",
                              )}
                            />
                          </>
                        )}
                      </div>
                    </Button>
                  </CollapsibleTrigger>
                  {!isCollapsed && (
                    <CollapsibleContent>
                      <div className="pl-9 space-y-1 mt-1">
                        {item.subItems.map((subItem, index) => (
                          <Link
                            key={index}
                            to={subItem.path}
                            className={cn(
                              "block px-3 py-2 rounded-md text-sm",
                              activeItem === `${item.key}-${index}`
                                ? "bg-primary/10 text-primary font-medium"
                                : "text-gray-600 hover:bg-gray-100",
                            )}
                            onClick={() =>
                              setActiveItem(`${item.key}-${index}`)
                            }
                          >
                            {subItem.name}
                          </Link>
                        ))}
                      </div>
                    </CollapsibleContent>
                  )}
                </Collapsible>
              ) : (
                <Link to={item.path}>
                  <Button
                    variant={activeItem === item.key ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start mb-1",
                      isCollapsed ? "px-2" : "px-3",
                    )}
                    onClick={() => setActiveItem(item.key)}
                  >
                    {isCollapsed ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="mx-auto">{item.icon}</div>
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            <p>{item.name}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <>
                        {item.icon}
                        <span className="ml-3">{item.name}</span>
                      </>
                    )}
                  </Button>
                </Link>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* User profile */}
      <div className="p-4 border-t">
        {isCollapsed ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Avatar className="mx-auto cursor-pointer">
                  <AvatarImage src={userAvatar} alt={userName} />
                  <AvatarFallback>
                    {userName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{userName}</p>
                <p className="text-xs text-gray-500 capitalize">{userRole}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center cursor-pointer p-2 rounded-md hover:bg-gray-100">
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarImage src={userAvatar} alt={userName} />
                  <AvatarFallback>
                    {userName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-medium truncate">{userName}</p>
                  <p className="text-xs text-gray-500 capitalize">{userRole}</p>
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
