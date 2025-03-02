import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { DateRange } from "react-day-picker";
import { addDays } from "date-fns";
import {
  BarChart,
  PieChart,
  Users,
  Settings,
  Download,
  Printer,
  Share2,
} from "lucide-react";
import DatePickerWithRange from "../ui/date-picker-with-range";

// Import sub-components
import ReportsDashboard from "../reports/ReportsDashboard";
import SystemSettings from "../admin/SystemSettings";

interface ManagementDashboardProps {
  activeTab?: string;
  dateRange?: DateRange;
}

const ManagementDashboard = ({
  activeTab = "overview",
  dateRange = {
    from: new Date(),
    to: addDays(new Date(), 30),
  },
}: ManagementDashboardProps) => {
  const [currentTab, setCurrentTab] = useState<string>(activeTab);
  const [date, setDate] = useState<DateRange | undefined>(dateRange);

  // Mock data for overview metrics
  const overviewMetrics = {
    occupancy: 78,
    revenue: 152480,
    avgDailyRate: 189,
    revPAR: 147,
    pendingBookings: 24,
    restaurantRevenue: 42650,
  };

  return (
    <div className="w-full h-full bg-gray-50 p-6 overflow-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Management Dashboard
          </h1>
          <p className="text-gray-500">
            Overview of hotel performance, system administration, and reporting
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <DatePickerWithRange date={date} setDate={setDate} />
        </div>
      </div>

      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="overview" className="text-base">
            <BarChart className="mr-2 h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="reports" className="text-base">
            <PieChart className="mr-2 h-4 w-4" />
            Reports
          </TabsTrigger>
          <TabsTrigger value="administration" className="text-base">
            <Settings className="mr-2 h-4 w-4" />
            Administration
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Current Occupancy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center">
                  <div className="text-5xl font-bold text-blue-600 mb-2">
                    {overviewMetrics.occupancy}%
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    +12% from last month
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center">
                  <div className="text-5xl font-bold text-emerald-600 mb-2">
                    ${overviewMetrics.revenue.toLocaleString()}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    +8% from previous period
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Pending Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center">
                  <div className="text-5xl font-bold text-amber-600 mb-2">
                    {overviewMetrics.pendingBookings}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Requires confirmation
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                <div className="flex flex-col items-center">
                  <BarChart className="h-16 w-16 text-gray-400 mb-2" />
                  <p className="text-gray-500">
                    Revenue breakdown chart would render here
                  </p>
                  <div className="flex items-center space-x-4 mt-4">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-sm mr-1"></div>
                      <span className="text-xs">
                        Hotel ($
                        {(
                          overviewMetrics.revenue -
                          overviewMetrics.restaurantRevenue
                        ).toLocaleString()}
                        )
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-sm mr-1"></div>
                      <span className="text-xs">
                        Restaurant ($
                        {overviewMetrics.restaurantRevenue.toLocaleString()})
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Activity</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                <div className="flex flex-col items-center">
                  <Users className="h-16 w-16 text-gray-400 mb-2" />
                  <p className="text-gray-500">
                    User activity chart would render here
                  </p>
                  <div className="grid grid-cols-2 gap-4 mt-4 w-full max-w-xs">
                    <div className="text-center p-2 bg-gray-50 rounded-md">
                      <p className="text-sm text-gray-500">Active Users</p>
                      <p className="font-bold">24</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded-md">
                      <p className="text-sm text-gray-500">New Accounts</p>
                      <p className="font-bold">7</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded-md">
                      <p className="text-sm text-gray-500">Hotel Staff</p>
                      <p className="font-bold">18</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded-md">
                      <p className="text-sm text-gray-500">Restaurant Staff</p>
                      <p className="font-bold">12</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end mt-8 space-x-2">
            <Button variant="outline">
              <Share2 className="h-4 w-4 mr-2" />
              Share Dashboard
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
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports">
          <ReportsDashboard dateRange={date} />
        </TabsContent>

        {/* Administration Tab */}
        <TabsContent value="administration">
          <Tabs defaultValue="users" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="users">User Management</TabsTrigger>
              <TabsTrigger value="settings">System Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="users">
              <div className="p-6 bg-white rounded-lg shadow-sm">
                <h2 className="text-2xl font-bold mb-6">User Management</h2>
                <p className="text-gray-500 mb-4">
                  This component will allow administrators to manage user
                  accounts, permissions, and roles.
                </p>
                <div className="flex justify-center items-center h-64 border-2 border-dashed border-gray-300 rounded-lg">
                  <div className="text-center">
                    <Users className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500">
                      User management interface will be implemented here
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="settings">
              <SystemSettings />
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ManagementDashboard;
