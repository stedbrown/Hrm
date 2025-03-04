import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Hotel, UserPlus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "../ui/use-toast";

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
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
  role: z.enum(["staff", "management", "restaurant"]),
});

type FormValues = z.infer<typeof formSchema>;

interface SignUpFormProps {
  onSignUp?: (values: FormValues) => void;
  isLoading?: boolean;
}

const SignUpForm = ({
  onSignUp = () => {},
  isLoading: externalLoading = false,
}: SignUpFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "staff",
    },
  });

  const handleSubmit = async (values: FormValues) => {
    try {
      setIsLoading(true);
      
      // Sign up with Supabase - inviamo i dati del profilo come metadati
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            name: values.name,
            role: values.role,
          },
          // Aggiungiamo emailRedirectTo per gestire la conferma email
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
        },
      });

      if (error) {
        console.error("Errore durante la registrazione:", error);
        toast({
          title: "Registrazione fallita",
          description: error.message || "Si è verificato un errore durante la registrazione",
          variant: "destructive",
        });
        throw error;
      }

      // Controlla se l'utente ha bisogno di conferma email
      if (data?.user && !data?.session) {
        // Utente creato ma serve conferma email
        localStorage.setItem(`pending_user_${data.user.id}`, JSON.stringify({
          id: data.user.id,
          email: values.email,
          name: values.name,
          role: values.role,
        }));
        
        toast({
          title: "Registrazione completata",
          description: "Ti abbiamo inviato un'email di conferma. Per favore controlla anche nella cartella spam se non la trovi nella posta in arrivo.",
          variant: "default",
        });
        
        // Mostriamo un'altra notifica con istruzioni aggiuntive
        setTimeout(() => {
          toast({
            title: "Info sulla conferma email",
            description: (
              <div>
                Se non ricevi l'email, <a href="/email-confirmation" className="underline font-semibold">clicca qui</a> per richiederne un'altra.
              </div>
            ),
            variant: "default",
          });
        }, 3000);
        
        onSignUp(values);
        navigate("/");
        return;
      }

      // Se arriviamo qui, abbiamo un utente e una sessione (già confermato o conferma non richiesta)
      if (data.user) {
        // Il trigger database si occuperà di creare il record utente
        toast({
          title: "Registrazione completata",
          description: "Il tuo account è stato creato con successo.",
          variant: "default",
        });
        
        onSignUp(values);
        navigate("/");
      }
    } catch (error) {
      console.error("Errore durante la registrazione:", error);
      toast({
        title: "Registrazione fallita",
        description: error instanceof Error ? error.message : "Si è verificato un errore imprevisto",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
          Create an Account
        </CardTitle>
        <CardDescription className="text-center">
          Enter your details to create your account
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" id="name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                      id="email"
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
                        id="password"
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

            <Button type="submit" className="w-full" disabled={isLoading || externalLoading}>
              {isLoading || externalLoading ? (
                <div className="flex items-center justify-center">
                  <div className="h-4 w-4 border-2 border-current border-t-transparent animate-spin rounded-full mr-2" />
                  Creating account...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Sign Up
                </div>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <div className="text-sm text-center text-muted-foreground">
          Already have an account?{" "}
          <a
            href="/"
            className={cn(
              "underline underline-offset-4 hover:text-primary",
              (isLoading || externalLoading) && "pointer-events-none opacity-50",
            )}
          >
            Sign in
          </a>
        </div>
      </CardFooter>
    </Card>
  );
};

export default SignUpForm;
