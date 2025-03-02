import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Hotel, Mail } from "lucide-react";
import { supabase } from "@/lib/supabase";

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
import { cn } from "@/lib/utils";
import { useToast } from "../ui/use-toast";

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface PasswordResetProps {
  onCancel: () => void;
}

const PasswordReset = ({ onCancel }: PasswordResetProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const handleSubmit = async (values: FormValues) => {
    try {
      setIsLoading(true);

      const { error } = await supabase.auth.resetPasswordForEmail(
        values.email,
        {
          redirectTo: `${window.location.origin}/reset-password`,
        },
      );

      if (error) throw error;

      setResetSent(true);
      toast({
        title: "Password reset email sent",
        description: "Check your email for a password reset link",
      });
    } catch (error) {
      console.error("Password reset error:", error);
      toast({
        title: "Error",
        description: "There was a problem sending the password reset email",
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
          Reset Password
        </CardTitle>
        <CardDescription className="text-center">
          {resetSent
            ? "Check your email for a password reset link"
            : "Enter your email to receive a password reset link"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!resetSent ? (
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

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="h-4 w-4 border-2 border-current border-t-transparent animate-spin rounded-full mr-2" />
                    Sending...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Mail className="mr-2 h-4 w-4" />
                    Send Reset Link
                  </div>
                )}
              </Button>
            </form>
          </Form>
        ) : (
          <div className="flex flex-col items-center justify-center py-4">
            <Mail className="h-16 w-16 text-primary mb-4" />
            <p className="text-center mb-4">
              We've sent a password reset link to your email. Please check your
              inbox and follow the instructions to reset your password.
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setResetSent(false)}
            >
              Send again
            </Button>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button variant="ghost" onClick={onCancel}>
          Back to login
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PasswordReset;
