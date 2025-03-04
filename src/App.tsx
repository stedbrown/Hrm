import { Suspense, lazy, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Home from "./components/home";
import { useAuth } from "./components/auth/AuthProvider";
import { Toaster } from "./components/ui/toaster";
import EmailConfirmation from "./components/auth/EmailConfirmation";
import { NotificationsProvider } from "./components/notifications/NotificationsProvider";

// Lazy load dashboard components
const DashboardLayout = lazy(
  () => import("./components/dashboard/DashboardLayout"),
);
const HotelDashboard = lazy(
  () => import("./components/dashboard/HotelDashboard"),
);
const ManagementDashboard = lazy(
  () => import("./components/dashboard/ManagementDashboard"),
);
const RestaurantDashboard = lazy(
  () => import("./components/dashboard/RestaurantDashboard"),
);

// Lazy load booking components
const BookingCalendar = lazy(
  () => import("./components/booking/BookingCalendar"),
);
const RoomAvailability = lazy(
  () => import("./components/booking/RoomAvailability"),
);
const BookingFlow = lazy(
  () => import("./components/booking/BookingFlow"),
);
const BookingDetails = lazy(
  () => import("./components/booking/BookingDetails"),
);
const RoomOccupancyMap = lazy(
  () => import("./components/booking/RoomOccupancyMap"),
);

// Lazy load restaurant components
const MenuManager = lazy(
  () => import("./components/restaurant/MenuManager"),
);
const InventoryTracker = lazy(
  () => import("./components/restaurant/InventoryTracker"),
);
const OrderProcessor = lazy(
  () => import("./components/restaurant/OrderProcessor"),
);

// Lazy load admin components
const UserManagement = lazy(
  () => import("./components/admin/UserManagement"),
);
const SystemSettings = lazy(
  () => import("./components/admin/SystemSettings"),
);
const RoomManagement = lazy(
  () => import("./components/admin/RoomManagement"),
);

// Lazy load reports and channel manager
const ReportsDashboard = lazy(
  () => import("./components/reports/ReportsDashboard"),
);
const ChannelManager = lazy(
  () => import("./components/channel/ChannelManager"),
);

// Lazy load notifications page
const NotificationsPage = lazy(
  () => import("./components/notifications/NotificationsPage"),
);

function App() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is authenticated, redirect to dashboard
    if (user && window.location.pathname === "/") {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  return (
    <NotificationsProvider>
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            <span className="ml-3">Caricamento...</span>
          </div>
        }
      >
        <>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/signup" element={<Home showSignUp={true} />} />
            <Route 
              path="/email-confirmation" 
              element={
                <div className="flex items-center justify-center min-h-screen bg-gray-100">
                  <EmailConfirmation />
                </div>
              } 
            />
            <Route 
              path="/auth/confirm" 
              element={
                <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
                  <div className="text-center mb-4">
                    <h1 className="text-2xl font-bold">Email Confermata</h1>
                    <p className="mt-2">La tua email è stata confermata con successo!</p>
                  </div>
                  <button 
                    onClick={() => navigate("/login")}
                    className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
                  >
                    Vai al Login
                  </button>
                </div>
              } 
            />
            
            {/* Notifications Page */}
            <Route
              path="/notifications"
              element={
                <DashboardLayout title="Notifiche" userRole="staff">
                  <NotificationsPage />
                </DashboardLayout>
              }
            />
            
            {/* Hotel Dashboard */}
            <Route
              path="/dashboard"
              element={
                <DashboardLayout title="Hotel Dashboard" userRole="staff">
                  <HotelDashboard />
                </DashboardLayout>
              }
            />
            
            {/* Bookings */}
            <Route
              path="/bookings"
              element={
                <DashboardLayout title="Prenotazioni" userRole="staff">
                  <BookingCalendar />
                </DashboardLayout>
              }
            />
            <Route
              path="/bookings/calendar"
              element={
                <DashboardLayout title="Calendario Prenotazioni" userRole="staff">
                  <BookingCalendar />
                </DashboardLayout>
              }
            />
            <Route
              path="/bookings/:id"
              element={
                <DashboardLayout title="Dettagli Prenotazione" userRole="staff">
                  <BookingDetails />
                </DashboardLayout>
              }
            />
            <Route
              path="/bookings/availability"
              element={
                <DashboardLayout title="Disponibilità Camere" userRole="staff">
                  <RoomAvailability />
                </DashboardLayout>
              }
            />
            <Route
              path="/bookings/occupancy-map"
              element={
                <DashboardLayout title="Mappa Occupazione Camere" userRole="staff">
                  <RoomOccupancyMap />
                </DashboardLayout>
              }
            />
            <Route
              path="/bookings/new"
              element={
                <DashboardLayout title="Nuova Prenotazione" userRole="staff">
                  <BookingFlow />
                </DashboardLayout>
              }
            />
            
            {/* Channel Manager */}
            <Route
              path="/channel-manager"
              element={
                <DashboardLayout title="Channel Manager" userRole="management">
                  <ChannelManager />
                </DashboardLayout>
              }
            />
            
            {/* Restaurant */}
            <Route
              path="/restaurant"
              element={
                <DashboardLayout
                  title="Restaurant Dashboard"
                  userRole="restaurant"
                >
                  <RestaurantDashboard />
                </DashboardLayout>
              }
            />
            <Route
              path="/restaurant/menu"
              element={
                <DashboardLayout title="Gestione Menu" userRole="restaurant">
                  <MenuManager />
                </DashboardLayout>
              }
            />
            <Route
              path="/restaurant/inventory"
              element={
                <DashboardLayout title="Inventario Ristorante" userRole="restaurant">
                  <InventoryTracker />
                </DashboardLayout>
              }
            />
            <Route
              path="/restaurant/orders"
              element={
                <DashboardLayout title="Ordini Ristorante" userRole="restaurant">
                  <OrderProcessor />
                </DashboardLayout>
              }
            />
            
            {/* Reports */}
            <Route
              path="/reports"
              element={
                <DashboardLayout title="Reports" userRole="management">
                  <ReportsDashboard />
                </DashboardLayout>
              }
            />
            
            {/* Users */}
            <Route
              path="/users"
              element={
                <DashboardLayout title="Gestione Utenti" userRole="management">
                  <UserManagement />
                </DashboardLayout>
              }
            />
            
            {/* Room Management */}
            <Route
              path="/rooms"
              element={
                <DashboardLayout title="Gestione Camere" userRole="staff">
                  <RoomManagement />
                </DashboardLayout>
              }
            />
            
            {/* Settings */}
            <Route
              path="/settings"
              element={
                <DashboardLayout title="Impostazioni" userRole="staff">
                  <SystemSettings />
                </DashboardLayout>
              }
            />
            
            {/* Management Dashboard */}
            <Route
              path="/management"
              element={
                <DashboardLayout
                  title="Management Dashboard"
                  userRole="management"
                >
                  <ManagementDashboard />
                </DashboardLayout>
              }
            />
            
            {/* Aggiungi una rotta di fallback per gestire le rotte non trovate */}
            <Route
              path="*"
              element={
                <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
                  <div className="text-center mb-4">
                    <h1 className="text-2xl font-bold">Pagina non trovata</h1>
                    <p className="mt-2">La pagina che stai cercando non esiste.</p>
                  </div>
                  <button 
                    onClick={() => navigate("/")}
                    className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
                  >
                    Torna alla Home
                  </button>
                </div>
              }
            />
          </Routes>
          <Toaster />
        </>
      </Suspense>
    </NotificationsProvider>
  );
}

export default App;
