import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import {
  BarChart3,
  Utensils,
  ShoppingBag,
  ClipboardList,
  DollarSign,
  Users,
  TrendingUp,
  Clock,
  Calendar,
} from "lucide-react";
import { Progress } from "../ui/progress";

// Import restaurant components
import MenuManager from "../restaurant/MenuManager";
import OrderProcessor from "../restaurant/OrderProcessor";

interface RestaurantDashboardProps {
  activeTab?: string;
  restaurantMetrics?: {
    dailyRevenue: number;
    monthlyRevenue: number;
    averageCheck: number;
    totalOrders: number;
    pendingOrders: number;
    completedOrders: number;
    popularItems: Array<{ name: string; sales: number; percentage: number }>;
    lowStockItems: Array<{
      name: string;
      currentStock: number;
      minStock: number;
    }>;
    revenueByHour: Array<{ hour: string; revenue: number }>;
  };
}

const RestaurantDashboard = ({
  activeTab = "overview",
  restaurantMetrics = {
    dailyRevenue: 1245.75,
    monthlyRevenue: 32580.5,
    averageCheck: 42.35,
    totalOrders: 124,
    pendingOrders: 8,
    completedOrders: 116,
    popularItems: [
      { name: "Grilled Salmon", sales: 48, percentage: 75 },
      { name: "Margherita Pizza", sales: 42, percentage: 65 },
      { name: "Chocolate Lava Cake", sales: 36, percentage: 55 },
      { name: "Caesar Salad", sales: 30, percentage: 45 },
      { name: "Chicken Alfredo", sales: 24, percentage: 35 },
    ],
    lowStockItems: [
      { name: "Fresh Salmon", currentStock: 3, minStock: 5 },
      { name: "Parmesan Cheese", currentStock: 2, minStock: 4 },
      { name: "Chocolate", currentStock: 1, minStock: 3 },
    ],
    revenueByHour: [
      { hour: "12pm", revenue: 245 },
      { hour: "1pm", revenue: 375 },
      { hour: "2pm", revenue: 185 },
      { hour: "5pm", revenue: 290 },
      { hour: "6pm", revenue: 450 },
      { hour: "7pm", revenue: 520 },
      { hour: "8pm", revenue: 480 },
      { hour: "9pm", revenue: 320 },
    ],
  },
}: RestaurantDashboardProps) => {
  const [currentTab, setCurrentTab] = useState(activeTab);

  return (
    <div className="w-full h-full bg-white">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Restaurant Dashboard</h1>
            <p className="text-gray-500">
              Manage menu, orders, and inventory for your restaurant
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Today
            </Button>
            <Button>
              <ClipboardList className="h-4 w-4 mr-2" />
              New Order
            </Button>
          </div>
        </div>

        <Tabs
          value={currentTab}
          onValueChange={setCurrentTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="overview" className="flex items-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="menu" className="flex items-center">
              <Utensils className="h-4 w-4 mr-2" />
              Menu Management
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center">
              <ClipboardList className="h-4 w-4 mr-2" />
              Order Processing
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center">
              <ShoppingBag className="h-4 w-4 mr-2" />
              Inventory
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Daily Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    ${restaurantMetrics.dailyRevenue.toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    +12% from yesterday
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Orders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {restaurantMetrics.totalOrders}
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                    <Badge
                      variant="outline"
                      className="mr-1 bg-green-50 text-green-700 border-green-200"
                    >
                      {restaurantMetrics.completedOrders}
                    </Badge>
                    completed
                    <Badge
                      variant="outline"
                      className="ml-2 mr-1 bg-yellow-50 text-yellow-700 border-yellow-200"
                    >
                      {restaurantMetrics.pendingOrders}
                    </Badge>
                    pending
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Average Check
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    ${restaurantMetrics.averageCheck.toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    +5% from last week
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Popular Menu Items</CardTitle>
                  <CardDescription>
                    Top selling items in the last 30 days
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {restaurantMetrics.popularItems.map((item) => (
                      <div key={item.name} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{item.name}</span>
                          <span className="text-sm text-gray-500">
                            {item.sales} orders
                          </span>
                        </div>
                        <Progress value={item.percentage} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Hour</CardTitle>
                  <CardDescription>
                    Today's revenue distribution
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[220px] flex items-end justify-between">
                    {restaurantMetrics.revenueByHour.map((hourData) => {
                      const heightPercentage = (hourData.revenue / 520) * 100;
                      return (
                        <div
                          key={hourData.hour}
                          className="flex flex-col items-center"
                        >
                          <div
                            className="w-8 bg-primary rounded-t-md"
                            style={{ height: `${heightPercentage}%` }}
                          ></div>
                          <div className="text-xs mt-2">{hourData.hour}</div>
                          <div className="text-xs font-semibold">
                            ${hourData.revenue}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Low Stock Alerts</CardTitle>
                    <CardDescription>
                      Inventory items that need to be restocked
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    View All Inventory
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {restaurantMetrics.lowStockItems.map((item) => (
                    <div
                      key={item.name}
                      className="flex justify-between items-center p-3 bg-red-50 rounded-md border border-red-100"
                    >
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-gray-500">
                          Min stock: {item.minStock}
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Badge variant="destructive">
                          {item.currentStock} remaining
                        </Badge>
                        <Button variant="outline" size="sm" className="ml-4">
                          Restock
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Menu Management Tab */}
          <TabsContent value="menu">
            <MenuManager />
          </TabsContent>

          {/* Order Processing Tab */}
          <TabsContent value="orders">
            <OrderProcessor />
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory">
            <div className="flex flex-col items-center justify-center h-[600px] bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <ShoppingBag className="h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Inventory Tracker</h3>
              <p className="text-gray-500 mb-4 text-center max-w-md">
                Track inventory levels, set low stock alerts, and manage supply
                orders
              </p>
              <Button>
                <ShoppingBag className="h-4 w-4 mr-2" /> Set Up Inventory
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default RestaurantDashboard;
