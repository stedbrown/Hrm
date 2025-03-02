import React, { useState, ReactNode } from "react";
import { cn } from "@/lib/utils";
import Header from "./Header";
import Sidebar from "./Sidebar";

interface DashboardLayoutProps {
  children?: ReactNode;
  title?: string;
  userRole?: "staff" | "management" | "restaurant";
  userName?: string;
  userAvatar?: string;
  notifications?: Array<{
    id: string;
    title: string;
    description: string;
    time: string;
    read: boolean;
  }>;
}

const DashboardLayout = ({
  children,
  title = "Dashboard",
  userRole = "staff",
  userName = "John Doe",
  userAvatar = "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
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
}: DashboardLayoutProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50">
      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 transform md:relative md:translate-x-0 transition-all duration-300 ease-in-out",
          mobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0",
        )}
      >
        <Sidebar
          userRole={userRole}
          userName={userName}
          userAvatar={userAvatar}
          collapsed={sidebarCollapsed}
          onToggleCollapse={toggleSidebar}
        />
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 w-full overflow-hidden">
        <Header
          title={title}
          onMenuToggle={toggleMobileMenu}
          user={{
            name: userName,
            email: `${userName.toLowerCase().replace(" ", ".")}@example.com`,
            avatar: userAvatar,
          }}
          notifications={notifications}
        />

        <main
          className={cn(
            "flex-1 overflow-auto transition-all duration-300",
            sidebarCollapsed ? "md:ml-[70px]" : "md:ml-[280px]",
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
