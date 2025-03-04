import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Save,
  RefreshCw,
  Globe,
  DollarSign,
  Percent,
  Building,
  Server,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const taxFormSchema = z.object({
  vatRate: z.string().min(1, { message: "VAT rate is required" }),
  serviceTax: z.string().min(1, { message: "Service tax is required" }),
  cityTax: z.string().min(1, { message: "City tax is required" }),
  enableAutomaticTaxCalculation: z.boolean().default(true),
});

const platformFormSchema = z.object({
  bookingComApiKey: z
    .string()
    .min(1, { message: "Booking.com API key is required" }),
  expediaApiKey: z.string().min(1, { message: "Expedia API key is required" }),
  airbnbApiKey: z.string().min(1, { message: "Airbnb API key is required" }),
  syncFrequency: z.string().min(1, { message: "Sync frequency is required" }),
  enableAutoSync: z.boolean().default(true),
});

const generalFormSchema = z.object({
  hotelName: z.string().min(1, { message: "Hotel name is required" }),
  hotelAddress: z.string().min(1, { message: "Hotel address is required" }),
  contactEmail: z.string().email({ message: "Invalid email address" }),
  contactPhone: z.string().min(1, { message: "Contact phone is required" }),
  defaultCurrency: z
    .string()
    .min(1, { message: "Default currency is required" }),
  checkInTime: z.string().min(1, { message: "Check-in time is required" }),
  checkOutTime: z.string().min(1, { message: "Check-out time is required" }),
});

interface SystemSettingsProps {
  initialData?: {
    taxSettings?: z.infer<typeof taxFormSchema>;
    platformSettings?: z.infer<typeof platformFormSchema>;
    generalSettings?: z.infer<typeof generalFormSchema>;
  };
}

const SystemSettings = ({ initialData = {} }: SystemSettingsProps) => {
  const [activeTab, setActiveTab] = useState("general");

  // Tax Settings Form
  const taxForm = useForm<z.infer<typeof taxFormSchema>>({
    resolver: zodResolver(taxFormSchema),
    defaultValues: initialData.taxSettings || {
      vatRate: "18",
      serviceTax: "5",
      cityTax: "2",
      enableAutomaticTaxCalculation: true,
    },
  });

  // Platform Settings Form
  const platformForm = useForm<z.infer<typeof platformFormSchema>>({
    resolver: zodResolver(platformFormSchema),
    defaultValues: initialData.platformSettings || {
      bookingComApiKey: "",
      expediaApiKey: "",
      airbnbApiKey: "",
      syncFrequency: "15",
      enableAutoSync: true,
    },
  });

  // General Settings Form
  const generalForm = useForm<z.infer<typeof generalFormSchema>>({
    resolver: zodResolver(generalFormSchema),
    defaultValues: initialData.generalSettings || {
      hotelName: "Grand Hotel",
      hotelAddress: "123 Main Street, City, Country",
      contactEmail: "contact@grandhotel.com",
      contactPhone: "+1 234 567 8900",
      defaultCurrency: "USD",
      checkInTime: "14:00",
      checkOutTime: "11:00",
    },
  });

  const onTaxSubmit = (data: z.infer<typeof taxFormSchema>) => {
    console.log("Tax settings submitted:", data);
    // Here you would typically save the data to your backend
  };

  const onPlatformSubmit = (data: z.infer<typeof platformFormSchema>) => {
    console.log("Platform settings submitted:", data);
    // Here you would typically save the data to your backend
  };

  const onGeneralSubmit = (data: z.infer<typeof generalFormSchema>) => {
    console.log("General settings submitted:", data);
    // Here you would typically save the data to your backend
  };

  return (
    <div className="w-full h-full p-6 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
          <p className="text-muted-foreground mt-2">
            Configure system-wide settings for your hotel management system.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="tax" className="flex items-center gap-2">
              <Percent className="h-4 w-4" />
              Tax Settings
            </TabsTrigger>
            <TabsTrigger value="platforms" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              External Platforms
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Configure basic information about your hotel and operational
                  settings.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...generalForm}>
                  <form
                    onSubmit={generalForm.handleSubmit(onGeneralSubmit)}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={generalForm.control}
                        name="hotelName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hotel Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter hotel name"
                                id="hotelName"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={generalForm.control}
                        name="defaultCurrency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Default Currency</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select currency" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="USD">USD ($)</SelectItem>
                                <SelectItem value="EUR">EUR (€)</SelectItem>
                                <SelectItem value="GBP">GBP (£)</SelectItem>
                                <SelectItem value="JPY">JPY (¥)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={generalForm.control}
                        name="hotelAddress"
                        render={({ field }) => (
                          <FormItem className="col-span-2">
                            <FormLabel>Hotel Address</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter hotel address"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={generalForm.control}
                        name="contactEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Email</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter contact email"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={generalForm.control}
                        name="contactPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Phone</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter contact phone"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Separator className="col-span-2 my-4" />
                      <h3 className="col-span-2 text-lg font-medium">
                        Check-in/Check-out Times
                      </h3>

                      <FormField
                        control={generalForm.control}
                        name="checkInTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Check-in Time</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={generalForm.control}
                        name="checkOutTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Check-out Time</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button type="submit" className="flex items-center gap-2">
                        <Save className="h-4 w-4" />
                        Save General Settings
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tax" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Tax Settings</CardTitle>
                <CardDescription>
                  Configure tax rates and calculation settings for invoices and
                  quotes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...taxForm}>
                  <form
                    onSubmit={taxForm.handleSubmit(onTaxSubmit)}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={taxForm.control}
                        name="vatRate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>VAT Rate (%)</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type="number"
                                  placeholder="Enter VAT rate"
                                  id="vatRate"
                                  {...field}
                                  className="pl-8"
                                />
                                <Percent className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                              </div>
                            </FormControl>
                            <FormDescription>
                              Standard VAT rate applied to all bookings
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={taxForm.control}
                        name="serviceTax"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Service Tax (%)</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type="number"
                                  placeholder="Enter service tax"
                                  id="serviceTax"
                                  {...field}
                                  className="pl-8"
                                />
                                <Percent className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                              </div>
                            </FormControl>
                            <FormDescription>
                              Service tax applied to all bookings
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={taxForm.control}
                        name="cityTax"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City Tax (%)</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type="number"
                                  placeholder="Enter city tax"
                                  {...field}
                                  className="pl-8"
                                />
                                <Percent className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                              </div>
                            </FormControl>
                            <FormDescription>
                              Local city tax applied per night
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={taxForm.control}
                        name="enableAutomaticTaxCalculation"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Automatic Tax Calculation
                              </FormLabel>
                              <FormDescription>
                                Automatically calculate and apply taxes to
                                invoices and quotes
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button type="submit" className="flex items-center gap-2">
                        <Save className="h-4 w-4" />
                        Save Tax Settings
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="platforms" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>External Platforms Integration</CardTitle>
                <CardDescription>
                  Configure API keys and synchronization settings for external
                  booking platforms.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...platformForm}>
                  <form
                    onSubmit={platformForm.handleSubmit(onPlatformSubmit)}
                    className="space-y-6"
                  >
                    <div className="space-y-4">
                      <FormField
                        control={platformForm.control}
                        name="bookingComApiKey"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Booking.com API Key</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  placeholder="Enter Booking.com API key"
                                  {...field}
                                  type="password"
                                />
                              </div>
                            </FormControl>
                            <FormDescription>
                              API key for Booking.com integration
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={platformForm.control}
                        name="expediaApiKey"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Expedia API Key</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  placeholder="Enter Expedia API key"
                                  {...field}
                                  type="password"
                                />
                              </div>
                            </FormControl>
                            <FormDescription>
                              API key for Expedia integration
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={platformForm.control}
                        name="airbnbApiKey"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Airbnb API Key</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  placeholder="Enter Airbnb API key"
                                  {...field}
                                  type="password"
                                />
                              </div>
                            </FormControl>
                            <FormDescription>
                              API key for Airbnb integration
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <FormField
                          control={platformForm.control}
                          name="syncFrequency"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Sync Frequency (minutes)</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select frequency" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="5">
                                    Every 5 minutes
                                  </SelectItem>
                                  <SelectItem value="15">
                                    Every 15 minutes
                                  </SelectItem>
                                  <SelectItem value="30">
                                    Every 30 minutes
                                  </SelectItem>
                                  <SelectItem value="60">Every hour</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                How often to sync with external platforms
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={platformForm.control}
                          name="enableAutoSync"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">
                                  Automatic Synchronization
                                </FormLabel>
                                <FormDescription>
                                  Automatically sync availability and bookings
                                  with external platforms
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              type="button"
                              className="flex items-center gap-2"
                            >
                              <RefreshCw className="h-4 w-4" />
                              Test Connections
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              Test connectivity to all configured external
                              platforms
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <Button type="submit" className="flex items-center gap-2">
                        <Save className="h-4 w-4" />
                        Save Platform Settings
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SystemSettings;
