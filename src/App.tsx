import { Suspense, lazy, useEffect } from "react";
import { useRoutes, Routes, Route, useNavigate } from "react-router-dom";
import Home from "./components/home";
import routes from "tempo-routes";
import { useAuth } from "./components/auth/AuthProvider";
import { Toaster } from "./components/ui/toaster";

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
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          Loading...
        </div>
      }
    >
      <>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Home showSignUp={true} />} />
          <Route
            path="/dashboard"
            element={
              <DashboardLayout title="Hotel Dashboard" userRole="staff">
                <HotelDashboard />
              </DashboardLayout>
            }
          />
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

          {/* Add this before any catchall route */}
          {import.meta.env.VITE_TEMPO === "true" && (
            <Route path="/tempobook/*" />
          )}
        </Routes>
        {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
        <Toaster />
      </>
    </Suspense>
  );
}

export default App;
