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
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Printer,
  Send,
  CreditCard,
  Clock,
  CheckCircle,
  AlertCircle,
  ChefHat,
  DollarSign,
  Search,
  Plus,
  Trash2,
} from "lucide-react";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
  status: "pending" | "preparing" | "ready" | "served";
}

interface Order {
  id: string;
  tableNumber: string;
  items: OrderItem[];
  status: "active" | "completed" | "cancelled";
  createdAt: Date;
  total: number;
}

interface OrderProcessorProps {
  orders?: Order[];
  menuItems?: Array<{
    id: string;
    name: string;
    price: number;
    category: string;
  }>;
  onSendToKitchen?: (order: Order) => void;
  onGenerateBill?: (order: Order) => void;
  onProcessPayment?: (order: Order, paymentMethod: string) => void;
}

const OrderProcessor = ({
  orders: initialOrders = [
    {
      id: "1",
      tableNumber: "12",
      items: [
        {
          id: "101",
          name: "Grilled Salmon",
          price: 24.99,
          quantity: 2,
          status: "served" as const,
        },
        {
          id: "102",
          name: "Caesar Salad",
          price: 12.99,
          quantity: 1,
          status: "served" as const,
        },
        {
          id: "103",
          name: "Chocolate Cake",
          price: 8.99,
          quantity: 2,
          status: "pending" as const,
        },
      ],
      status: "active" as const,
      createdAt: new Date(Date.now() - 45 * 60000), // 45 minutes ago
      total: 80.95,
    },
    {
      id: "2",
      tableNumber: "8",
      items: [
        {
          id: "201",
          name: "Margherita Pizza",
          price: 18.99,
          quantity: 1,
          status: "preparing" as const,
        },
        {
          id: "202",
          name: "Garlic Bread",
          price: 6.99,
          quantity: 1,
          status: "ready" as const,
        },
        {
          id: "203",
          name: "Tiramisu",
          price: 9.99,
          quantity: 1,
          status: "pending" as const,
        },
      ],
      status: "active" as const,
      createdAt: new Date(Date.now() - 20 * 60000), // 20 minutes ago
      total: 35.97,
    },
  ],
  menuItems = [
    { id: "m1", name: "Grilled Salmon", price: 24.99, category: "Main Course" },
    { id: "m2", name: "Caesar Salad", price: 12.99, category: "Starters" },
    {
      id: "m3",
      name: "Margherita Pizza",
      price: 18.99,
      category: "Main Course",
    },
    { id: "m4", name: "Garlic Bread", price: 6.99, category: "Sides" },
    { id: "m5", name: "Chocolate Cake", price: 8.99, category: "Desserts" },
    { id: "m6", name: "Tiramisu", price: 9.99, category: "Desserts" },
    {
      id: "m7",
      name: "Chicken Alfredo",
      price: 22.99,
      category: "Main Course",
    },
    { id: "m8", name: "Bruschetta", price: 10.99, category: "Starters" },
    { id: "m9", name: "French Fries", price: 5.99, category: "Sides" },
    { id: "m10", name: "Cheesecake", price: 8.99, category: "Desserts" },
  ],
  onSendToKitchen = () => {},
  onGenerateBill = () => {},
  onProcessPayment = () => {},
}: OrderProcessorProps) => {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [activeOrderId, setActiveOrderId] = useState<string>(
    orders[0]?.id || "",
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [newOrderDialogOpen, setNewOrderDialogOpen] = useState(false);
  const [newOrder, setNewOrder] = useState<Partial<Order>>({
    tableNumber: "",
    items: [],
    status: "active",
    createdAt: new Date(),
    total: 0,
  });
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("credit_card");

  const activeOrder = orders.find((order) => order.id === activeOrderId);

  const filteredMenuItems = menuItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleAddItemToOrder = (menuItem: (typeof menuItems)[0]) => {
    if (!newOrder.items) return;

    const existingItemIndex = newOrder.items.findIndex(
      (item) => item.id === menuItem.id,
    );

    if (existingItemIndex >= 0) {
      const updatedItems = [...newOrder.items];
      updatedItems[existingItemIndex].quantity += 1;
      setNewOrder({
        ...newOrder,
        items: updatedItems,
        total: calculateTotal(updatedItems),
      });
    } else {
      const newItem: OrderItem = {
        id: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: 1,
        status: "pending",
      };

      const updatedItems = [...newOrder.items, newItem];
      setNewOrder({
        ...newOrder,
        items: updatedItems,
        total: calculateTotal(updatedItems),
      });
    }
  };

  const handleRemoveItemFromOrder = (itemId: string) => {
    if (!newOrder.items) return;

    const updatedItems = newOrder.items.filter((item) => item.id !== itemId);
    setNewOrder({
      ...newOrder,
      items: updatedItems,
      total: calculateTotal(updatedItems),
    });
  };

  const calculateTotal = (items: OrderItem[]) => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const handleCreateOrder = () => {
    if (!newOrder.tableNumber || !newOrder.items?.length) return;

    const createdOrder: Order = {
      id: `order-${Date.now()}`,
      tableNumber: newOrder.tableNumber,
      items: newOrder.items,
      status: "active",
      createdAt: new Date(),
      total: newOrder.total || 0,
    };

    setOrders([...orders, createdOrder]);
    setActiveOrderId(createdOrder.id);
    setNewOrderDialogOpen(false);
    setNewOrder({
      tableNumber: "",
      items: [],
      status: "active",
      createdAt: new Date(),
      total: 0,
    });
  };

  const handleSendToKitchen = (order: Order) => {
    onSendToKitchen(order);
    // Update order items status to 'preparing'
    const updatedOrders = orders.map((o) => {
      if (o.id === order.id) {
        return {
          ...o,
          items: o.items.map((item) => {
            if (item.status === "pending") {
              return { ...item, status: "preparing" };
            }
            return item;
          }),
        };
      }
      return o;
    });
    setOrders(updatedOrders);
  };

  const handleGenerateBill = (order: Order) => {
    onGenerateBill(order);
    setPaymentDialogOpen(true);
  };

  const handleProcessPayment = (order: Order) => {
    onProcessPayment(order, paymentMethod);
    setPaymentDialogOpen(false);

    // Mark order as completed
    const updatedOrders = orders.map((o) => {
      if (o.id === order.id) {
        return { ...o, status: "completed" };
      }
      return o;
    });
    setOrders(updatedOrders);
  };

  const getStatusBadge = (status: OrderItem["status"]) => {
    switch (status) {
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200"
          >
            Pending
          </Badge>
        );
      case "preparing":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200"
          >
            Preparing
          </Badge>
        );
      case "ready":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            Ready
          </Badge>
        );
      case "served":
        return (
          <Badge
            variant="outline"
            className="bg-gray-50 text-gray-700 border-gray-200"
          >
            Served
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 flex">
        {/* Orders List Sidebar */}
        <div className="w-1/4 border-r p-4 bg-gray-50">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Orders</h2>
            <Button onClick={() => setNewOrderDialogOpen(true)} size="sm">
              <Plus className="h-4 w-4 mr-1" /> New Order
            </Button>
          </div>

          <ScrollArea className="h-[calc(100vh-180px)]">
            {orders.map((order) => (
              <Card
                key={order.id}
                className={`mb-3 cursor-pointer hover:bg-gray-100 ${order.id === activeOrderId ? "border-primary" : ""}`}
                onClick={() => setActiveOrderId(order.id)}
              >
                <CardHeader className="p-4 pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base">
                      Table {order.tableNumber}
                    </CardTitle>
                    {order.status === "active" ? (
                      <Badge className="bg-green-500">Active</Badge>
                    ) : order.status === "completed" ? (
                      <Badge className="bg-blue-500">Completed</Badge>
                    ) : (
                      <Badge className="bg-red-500">Cancelled</Badge>
                    )}
                  </div>
                  <CardDescription className="flex items-center text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    {new Date(order.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-sm">{order.items.length} items</p>
                  <p className="font-semibold">${order.total.toFixed(2)}</p>
                </CardContent>
              </Card>
            ))}
          </ScrollArea>
        </div>

        {/* Order Details */}
        <div className="flex-1 p-6">
          {activeOrder ? (
            <>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-2xl font-bold">
                    Table {activeOrder.tableNumber}
                  </h1>
                  <p className="text-gray-500">
                    Order #{activeOrder.id} •
                    {new Date(activeOrder.createdAt).toLocaleString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex gap-2">
                  {activeOrder.status === "active" && (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => handleSendToKitchen(activeOrder)}
                        disabled={
                          !activeOrder.items.some(
                            (item) => item.status === "pending",
                          )
                        }
                      >
                        <ChefHat className="h-4 w-4 mr-2" /> Send to Kitchen
                      </Button>
                      <Button onClick={() => handleGenerateBill(activeOrder)}>
                        <DollarSign className="h-4 w-4 mr-2" /> Generate Bill
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeOrder.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">
                            {item.name}
                          </TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>${item.price.toFixed(2)}</TableCell>
                          <TableCell>
                            ${(item.price * item.quantity).toFixed(2)}
                          </TableCell>
                          <TableCell>{getStatusBadge(item.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
                <CardFooter className="flex justify-between border-t p-4">
                  <div>
                    <p className="text-sm text-gray-500">
                      Total Items:{" "}
                      {activeOrder.items.reduce(
                        (sum, item) => sum + item.quantity,
                        0,
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Subtotal</p>
                    <p className="text-2xl font-bold">
                      ${activeOrder.total.toFixed(2)}
                    </p>
                  </div>
                </CardFooter>
              </Card>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <AlertCircle className="h-12 w-12 mb-4" />
              <h2 className="text-xl font-semibold mb-2">No Order Selected</h2>
              <p>Select an order from the list or create a new one</p>
              <Button
                className="mt-4"
                onClick={() => setNewOrderDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" /> Create New Order
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* New Order Dialog */}
      <Dialog open={newOrderDialogOpen} onOpenChange={setNewOrderDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Create New Order</DialogTitle>
            <DialogDescription>
              Add items to the order and specify the table number.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="mb-4">
                <Label htmlFor="table-number">Table Number</Label>
                <Input
                  id="table-number"
                  value={newOrder.tableNumber}
                  onChange={(e) =>
                    setNewOrder({ ...newOrder, tableNumber: e.target.value })
                  }
                  placeholder="Enter table number"
                  className="mt-1"
                />
              </div>

              <div className="mb-4">
                <Label htmlFor="search-menu">Search Menu</Label>
                <div className="relative mt-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    id="search-menu"
                    placeholder="Search by name or category"
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <ScrollArea className="h-[400px] border rounded-md p-4">
                <div className="grid grid-cols-1 gap-2">
                  {filteredMenuItems.map((item) => (
                    <Card
                      key={item.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleAddItemToOrder(item)}
                    >
                      <CardContent className="p-3 flex justify-between items-center">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-500">
                            {item.category}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <p className="font-semibold">
                            ${item.price.toFixed(2)}
                          </p>
                          <Plus className="h-4 w-4 ml-2 text-primary" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Order Summary</h3>
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {newOrder.items && newOrder.items.length > 0 ? (
                        newOrder.items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>${item.price.toFixed(2)}</TableCell>
                            <TableCell>
                              ${(item.price * item.quantity).toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  handleRemoveItemFromOrder(item.id)
                                }
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="text-center py-4 text-gray-500"
                          >
                            No items added to order
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
                <CardFooter className="flex justify-between border-t p-4">
                  <div>
                    <p className="text-sm text-gray-500">
                      Total Items:{" "}
                      {newOrder.items?.reduce(
                        (sum, item) => sum + item.quantity,
                        0,
                      ) || 0}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Total</p>
                    <p className="text-2xl font-bold">
                      ${newOrder.total?.toFixed(2) || "0.00"}
                    </p>
                  </div>
                </CardFooter>
              </Card>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setNewOrderDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateOrder}
              disabled={!newOrder.tableNumber || !newOrder.items?.length}
            >
              Create Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Payment</DialogTitle>
            <DialogDescription>
              Complete the payment for order #{activeOrder?.id}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="payment-method">Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger id="payment-method" className="mt-1">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="mobile_payment">Mobile Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-gray-50 p-4 rounded-md">
              <div className="flex justify-between mb-2">
                <span>Subtotal:</span>
                <span>${activeOrder?.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Tax (10%):</span>
                <span>
                  ${(activeOrder ? activeOrder.total * 0.1 : 0).toFixed(2)}
                </span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-bold">
                <span>Total:</span>
                <span>
                  ${(activeOrder ? activeOrder.total * 1.1 : 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPaymentDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => activeOrder && handleProcessPayment(activeOrder)}
            >
              <CreditCard className="h-4 w-4 mr-2" /> Process Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderProcessor;
