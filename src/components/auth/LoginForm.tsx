import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { supabase } from "@/lib/supabase";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Hotel, LogIn } from "lucide-react";

import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
  role: z.enum(["staff", "management", "restaurant"]),
});

type FormValues = z.infer<typeof formSchema>;

interface LoginFormProps {
  onLogin?: (values: FormValues) => void;
  isLoading?: boolean;
  onForgotPassword?: () => void;
}

const LoginForm = ({
  onLogin = () => {},
  isLoading = false,
  onForgotPassword = () => {},
}: LoginFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { signInWithGoogle } = useAuth();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      role: "staff",
    },
  });

  const handleSubmit = async (values: FormValues) => {
    try {
      // Use Supabase auth to sign in with email and password
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) throw error;

      onLogin(values);

      // Get user role from the database
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("role")
        .eq("id", data.user?.id)
        .single();

      if (userError) {
        console.error("Error fetching user role:", userError);
        navigate("/dashboard"); // Default to dashboard if role can't be determined
        return;
      }

      // Navigate to the appropriate dashboard based on role
      const role = userData?.role || values.role;
      switch (role) {
        case "staff":
          navigate("/dashboard");
          break;
        case "management":
          navigate("/management");
          break;
        case "restaurant":
          navigate("/restaurant");
          break;
        default:
          navigate("/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
      // Handle login error
    }
  };

  return (
    <Card className="w-[450px] bg-white shadow-lg">
      <CardHeader className="space-y-1">
        <div className="flex justify-center mb-4">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Hotel className="h-6 w-6 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold text-center">
          Sign In
        </CardTitle>
        <CardDescription className="text-center">
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="your.email@example.com"
                      type="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="••••••••"
                        type={showPassword ? "text" : "password"}
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                        <span className="sr-only">
                          {showPassword ? "Hide password" : "Show password"}
                        </span>
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="staff">Hotel Staff</SelectItem>
                      <SelectItem value="management">Management</SelectItem>
                      <SelectItem value="restaurant">
                        Restaurant Staff
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="h-4 w-4 border-2 border-current border-t-transparent animate-spin rounded-full mr-2" />
                  Signing in...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </div>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <div className="flex flex-col gap-4 w-full">
          <Button
            variant="outline"
            className="w-full"
            type="button"
            onClick={signInWithGoogle}
          >
            <svg
              className="mr-2 h-4 w-4"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
                fill="#333"
              />
            </svg>
            Sign in with GitHub
          </Button>
        </div>
        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
        <div className="flex justify-between text-sm text-muted-foreground">
          <button
            type="button"
            onClick={onForgotPassword}
            className={cn(
              "underline underline-offset-4 hover:text-primary text-left",
              isLoading && "pointer-events-none opacity-50",
            )}
          >
            Forgot your password?
          </button>
          <a
            href="/signup"
            className={cn(
              "underline underline-offset-4 hover:text-primary",
              isLoading && "pointer-events-none opacity-50",
            )}
          >
            Create account
          </a>
        </div>
      </CardFooter>
    </Card>
  );
};

export default LoginForm;
