import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { DateRange } from "react-day-picker";
import DatePickerWithRange from "../ui/date-picker-with-range";
import { addDays, format } from "date-fns";
import {
  BarChart,
  LineChart,
  PieChart,
  Activity,
  Download,
  Printer,
  Share2,
} from "lucide-react";
import { Progress } from "../ui/progress";

interface ReportsDashboardProps {
  activeTab?: string;
  dateRange?: DateRange;
}

const ReportsDashboard = ({
  activeTab = "occupancy",
  dateRange = {
    from: new Date(),
    to: addDays(new Date(), 30),
  },
}: ReportsDashboardProps) => {
  const [date, setDate] = useState<DateRange | undefined>(dateRange);
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");

  // Mock data for charts and metrics
  const occupancyData = [
    { month: "Jan", rate: 68 },
    { month: "Feb", rate: 72 },
    { month: "Mar", rate: 85 },
    { month: "Apr", rate: 78 },
    { month: "May", rate: 82 },
    { month: "Jun", rate: 91 },
  ];

  const revenueData = [
    { month: "Jan", hotel: 42000, restaurant: 18000 },
    { month: "Feb", hotel: 45000, restaurant: 19500 },
    { month: "Mar", hotel: 52000, restaurant: 22000 },
    { month: "Apr", hotel: 48000, restaurant: 20500 },
    { month: "May", hotel: 50000, restaurant: 21000 },
    { month: "Jun", hotel: 58000, restaurant: 24000 },
  ];

  const restaurantData = {
    menuItems: [
      { name: "Grilled Salmon", sales: 145, revenue: 3625 },
      { name: "Beef Wellington", sales: 98, revenue: 2940 },
      { name: "Vegetable Risotto", sales: 112, revenue: 2240 },
      { name: "Chocolate Lava Cake", sales: 187, revenue: 1870 },
      { name: "Signature Cocktail", sales: 203, revenue: 2030 },
    ],
    mealPeriods: [
      { period: "Breakfast", percentage: 25 },
      { period: "Lunch", percentage: 30 },
      { period: "Dinner", percentage: 40 },
      { period: "Bar/Lounge", percentage: 5 },
    ],
  };

  return (
    <div className="w-full h-full bg-gray-50 p-6 overflow-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Reports Dashboard
          </h1>
          <p className="text-gray-500">
            View and analyze hotel and restaurant performance metrics
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <DatePickerWithRange date={date} setDate={setDate} />
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue={activeTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="occupancy" className="text-base">
            <Activity className="mr-2 h-4 w-4" />
            Occupancy Reports
          </TabsTrigger>
          <TabsTrigger value="revenue" className="text-base">
            <BarChart className="mr-2 h-4 w-4" />
            Revenue Reports
          </TabsTrigger>
          <TabsTrigger value="restaurant" className="text-base">
            <PieChart className="mr-2 h-4 w-4" />
            Restaurant Performance
          </TabsTrigger>
        </TabsList>

        {/* Occupancy Reports Tab */}
        <TabsContent value="occupancy" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Current Occupancy</CardTitle>
                <CardDescription>
                  As of {format(new Date(), "PPP")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center">
                  <div className="text-5xl font-bold text-blue-600 mb-2">
                    78%
                  </div>
                  <Progress value={78} className="h-2 w-full" />
                  <p className="text-sm text-gray-500 mt-2">
                    +12% from last month
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">
                  Average Length of Stay
                </CardTitle>
                <CardDescription>Last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center">
                  <div className="text-5xl font-bold text-green-600 mb-2">
                    3.2
                  </div>
                  <p className="text-sm text-gray-500">nights per booking</p>
                  <p className="text-sm text-gray-500 mt-2">
                    +0.5 from previous period
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">
                  Room Type Distribution
                </CardTitle>
                <CardDescription>Current bookings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Standard</span>
                      <span>45%</span>
                    </div>
                    <Progress value={45} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Deluxe</span>
                      <span>30%</span>
                    </div>
                    <Progress value={30} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Suite</span>
                      <span>15%</span>
                    </div>
                    <Progress value={15} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Executive</span>
                      <span>10%</span>
                    </div>
                    <Progress value={10} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Occupancy Rate Trends</CardTitle>
              <CardDescription>
                Monthly occupancy rates for the current year
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full bg-white p-4 border border-gray-100 rounded-md">
                {/* Placeholder for LineChart - in a real app, use a charting library */}
                <div className="flex items-center justify-center h-full">
                  <div className="flex flex-col items-center">
                    <LineChart className="h-16 w-16 text-gray-400 mb-2" />
                    <p className="text-gray-500">
                      Occupancy rate chart would render here
                    </p>
                    <div className="flex mt-4 space-x-2">
                      {occupancyData.map((item, index) => (
                        <div key={index} className="flex flex-col items-center">
                          <div className="h-32 w-10 bg-blue-100 relative rounded-t-md overflow-hidden">
                            <div
                              className="absolute bottom-0 w-full bg-blue-500"
                              style={{ height: `${item.rate}%` }}
                            ></div>
                          </div>
                          <span className="text-xs mt-1">{item.month}</span>
                          <span className="text-xs font-semibold">
                            {item.rate}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revenue Reports Tab */}
        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total Revenue</CardTitle>
                <CardDescription>Current {selectedPeriod}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center">
                  <div className="text-5xl font-bold text-emerald-600 mb-2">
                    $82,000
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    +8% from previous period
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Average Daily Rate</CardTitle>
                <CardDescription>Last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center">
                  <div className="text-5xl font-bold text-purple-600 mb-2">
                    $189
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    +$12 from previous period
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">RevPAR</CardTitle>
                <CardDescription>Revenue per available room</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center">
                  <div className="text-5xl font-bold text-indigo-600 mb-2">
                    $147
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    +$23 from previous period
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Revenue Breakdown</CardTitle>
                <CardDescription>Hotel vs. Restaurant revenue</CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline" size="sm">
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full bg-white p-4 border border-gray-100 rounded-md">
                {/* Placeholder for BarChart - in a real app, use a charting library */}
                <div className="flex items-center justify-center h-full">
                  <div className="flex flex-col items-center">
                    <BarChart className="h-16 w-16 text-gray-400 mb-2" />
                    <p className="text-gray-500">
                      Revenue breakdown chart would render here
                    </p>
                    <div className="flex mt-4 space-x-2">
                      {revenueData.map((item, index) => (
                        <div key={index} className="flex flex-col items-center">
                          <div className="flex flex-col items-center space-y-1">
                            <div className="h-32 w-16 flex flex-col-reverse">
                              <div className="h-[60%] w-full bg-blue-500 rounded-t-sm"></div>
                              <div className="h-[40%] w-full bg-green-500 rounded-t-sm"></div>
                            </div>
                            <span className="text-xs mt-1">{item.month}</span>
                            <span className="text-xs font-semibold">
                              ${(item.hotel + item.restaurant).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center space-x-4 mt-4">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-blue-500 rounded-sm mr-1"></div>
                        <span className="text-xs">Hotel</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-sm mr-1"></div>
                        <span className="text-xs">Restaurant</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Restaurant Performance Tab */}
        <TabsContent value="restaurant" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Restaurant Revenue</CardTitle>
                <CardDescription>Current {selectedPeriod}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center">
                  <div className="text-5xl font-bold text-orange-600 mb-2">
                    $24,000
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    +14% from previous period
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Average Check</CardTitle>
                <CardDescription>Per customer</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center">
                  <div className="text-5xl font-bold text-amber-600 mb-2">
                    $42
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    +$3 from previous period
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Table Turnover</CardTitle>
                <CardDescription>Average per day</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center">
                  <div className="text-5xl font-bold text-teal-600 mb-2">
                    4.2x
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    +0.3 from previous period
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Selling Menu Items</CardTitle>
                <CardDescription>
                  Based on sales volume and revenue
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {restaurantData.menuItems.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-md"
                    >
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-500">
                          {item.sales} orders
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          ${item.revenue.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500">
                          ${(item.revenue / item.sales).toFixed(2)} avg
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Meal Period Distribution</CardTitle>
                <CardDescription>
                  Revenue breakdown by meal period
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full bg-white p-4 border border-gray-100 rounded-md flex items-center justify-center">
                  <div className="flex flex-col items-center">
                    <PieChart className="h-16 w-16 text-gray-400 mb-2" />
                    <p className="text-gray-500 mb-4">
                      Meal period distribution chart would render here
                    </p>

                    <div className="w-full space-y-3">
                      {restaurantData.mealPeriods.map((period, index) => (
                        <div key={index}>
                          <div className="flex justify-between text-sm mb-1">
                            <span>{period.period}</span>
                            <span>{period.percentage}%</span>
                          </div>
                          <Progress
                            value={period.percentage}
                            className="h-2"
                            // Different colors for different meal periods
                            style={{
                              backgroundColor:
                                index === 0
                                  ? "#fecaca"
                                  : index === 1
                                    ? "#bfdbfe"
                                    : index === 2
                                      ? "#bbf7d0"
                                      : "#fef3c7",
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end mt-8 space-x-2">
        <Button variant="outline">
          <Share2 className="h-4 w-4 mr-2" />
          Share Report
        </Button>
        <Button variant="outline">
          <Printer className="h-4 w-4 mr-2" />
          Print Report
        </Button>
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button>
      </div>
    </div>
  );
};

export default ReportsDashboard;
