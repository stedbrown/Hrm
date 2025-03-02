import React, { useState } from "react";
import { Hotel } from "lucide-react";
import LoginForm from "./auth/LoginForm";
import SignUpForm from "./auth/SignUpForm";
import PasswordReset from "./auth/PasswordReset";

interface HomeProps {
  title?: string;
  subtitle?: string;
  backgroundImage?: string;
  showSignUp?: boolean;
}

const Home = ({
  title = "Hotel Management System",
  subtitle = "Streamline your hotel operations with our comprehensive management solution",
  backgroundImage = "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop",
  showSignUp = false,
}: HomeProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);

  const handleLogin = (values: any) => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      console.log("Login values:", values);
      // Navigation is handled in the LoginForm component
    }, 1500);
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-gray-50">
      {/* Left side - Login form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Hotel className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            <p className="mt-2 text-gray-500">
              Sign in to access your dashboard
            </p>
          </div>

          {showPasswordReset ? (
            <PasswordReset onCancel={() => setShowPasswordReset(false)} />
          ) : showSignUp ? (
            <SignUpForm onSignUp={() => {}} isLoading={isLoading} />
          ) : (
            <LoginForm
              onLogin={handleLogin}
              isLoading={isLoading}
              onForgotPassword={() => setShowPasswordReset(true)}
            />
          )}
        </div>
      </div>

      {/* Right side - Background image and features */}
      <div
        className="hidden md:block md:w-1/2 bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="h-full w-full bg-black/40 p-12 flex flex-col justify-end">
          <div className="text-white">
            <h2 className="text-3xl font-bold mb-4">{subtitle}</h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-white text-xs font-bold">1</span>
                </div>
                <p>
                  Comprehensive booking management with calendar and
                  availability tracking
                </p>
              </div>
              <div className="flex items-start">
                <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-white text-xs font-bold">2</span>
                </div>
                <p>
                  Integrated channel manager to sync with external booking
                  platforms
                </p>
              </div>
              <div className="flex items-start">
                <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-white text-xs font-bold">3</span>
                </div>
                <p>
                  Restaurant management with menu creation and inventory
                  tracking
                </p>
              </div>
              <div className="flex items-start">
                <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-white text-xs font-bold">4</span>
                </div>
                <p>
                  Detailed reporting for occupancy rates, revenue, and
                  performance metrics
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
