import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";
import { useToast } from "../ui/use-toast";
import { supabase } from "@/lib/supabase";
import { Mail, AlertCircle, CheckCircle } from "lucide-react";

const EmailConfirmation = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleResendEmail = async () => {
    if (!email) {
      toast({
        title: "Email mancante",
        description: "Inserisci l'email utilizzata durante la registrazione",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Invia nuovamente l'email di conferma
      const { data, error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
        },
      });

      if (error) {
        console.error("Errore nell'invio dell'email:", error);
        toast({
          title: "Invio fallito",
          description: error.message || "Impossibile inviare l'email di conferma",
          variant: "destructive",
        });
        return;
      }

      setResendSuccess(true);
      toast({
        title: "Email inviata",
        description: "Abbiamo inviato una nuova email di conferma. Controlla la tua casella di posta.",
        variant: "default",
      });
    } catch (error) {
      console.error("Errore:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'invio dell'email",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualConfirmation = () => {
    // Reindirizza alla pagina di login con un messaggio informativo
    toast({
      title: "Accesso richiesto",
      description: "Per favore, prova ad accedere con le tue credenziali. Se l'account è già stato confermato, potrai accedere normalmente.",
      variant: "default",
    });
    navigate("/auth/login");
  };

  return (
    <Card className="w-[450px] bg-white shadow-lg">
      <CardHeader className="space-y-1">
        <div className="flex justify-center mb-4">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Mail className="h-6 w-6 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold text-center">
          Conferma Email
        </CardTitle>
        <CardDescription className="text-center">
          Non hai ricevuto l'email di conferma? Inserisci la tua email per richiederne una nuova.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Input
            type="email"
            placeholder="La tua email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {resendSuccess && (
          <div className="bg-green-50 p-4 rounded-md flex items-start space-x-2">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-800">
                Email inviata con successo!
              </p>
              <p className="text-sm text-green-700 mt-1">
                Controlla la tua casella di posta e segui le istruzioni nell'email.
                Ricorda di verificare anche nella cartella spam.
              </p>
            </div>
          </div>
        )}

        <div className="bg-amber-50 p-4 rounded-md flex items-start space-x-2">
          <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">
              Informazioni importanti
            </p>
            <p className="text-sm text-amber-700 mt-1">
              Se hai già confermato il tuo account, prova ad effettuare l'accesso normalmente.
              Se non riesci ad accedere, contatta l'assistenza o l'amministratore del sistema.
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-3">
        <Button
          className="w-full"
          onClick={handleResendEmail}
          disabled={isLoading}
        >
          {isLoading ? "Invio in corso..." : "Invia nuova email di conferma"}
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={handleManualConfirmation}
        >
          Ho già confermato il mio account
        </Button>
        <Button
          variant="link"
          className="w-full"
          onClick={() => navigate("/auth/login")}
        >
          Torna alla pagina di accesso
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EmailConfirmation; 