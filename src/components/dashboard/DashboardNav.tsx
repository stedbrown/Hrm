import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CalendarIcon, BedIcon, LayoutGridIcon, PlusCircleIcon } from "lucide-react";

const DashboardNav = () => {
  const pathname = window.location.pathname;

  return (
    <div className="px-3 py-2">
      <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
        Prenotazioni
      </h2>
      <div className="space-y-1">
        <Button
          asChild
          variant={
            pathname === "/bookings" || pathname === "/bookings/calendar"
              ? "secondary"
              : "ghost"
          }
          className="w-full justify-start"
        >
          <Link to="/bookings/calendar">
            <CalendarIcon className="mr-2 h-4 w-4" />
            Calendario
          </Link>
        </Button>
        <Button
          asChild
          variant={
            pathname === "/bookings/availability" ? "secondary" : "ghost"
          }
          className="w-full justify-start"
        >
          <Link to="/bookings/availability">
            <BedIcon className="mr-2 h-4 w-4" />
            Disponibilità
          </Link>
        </Button>
        <Button
          asChild
          variant={
            pathname === "/bookings/occupancy-map" ? "secondary" : "ghost"
          }
          className="w-full justify-start"
        >
          <Link to="/bookings/occupancy-map">
            <LayoutGridIcon className="mr-2 h-4 w-4" />
            Mappa Occupazione
          </Link>
        </Button>
        <Button
          asChild
          variant={pathname === "/bookings/new" ? "secondary" : "ghost"}
          className="w-full justify-start"
        >
          <Link to="/bookings/new">
            <PlusCircleIcon className="mr-2 h-4 w-4" />
            Nuova Prenotazione
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default DashboardNav; 