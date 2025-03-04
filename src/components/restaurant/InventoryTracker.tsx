import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Label } from "../ui/label";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import {
  Search,
  Plus,
  RefreshCw,
  AlertTriangle,
  Package,
  Trash2,
  Edit,
} from "lucide-react";

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  unit: string;
  lastUpdated: string;
  supplier: string;
  status: "in-stock" | "low-stock" | "out-of-stock";
}

interface InventoryTrackerProps {
  items?: InventoryItem[];
  onUpdateStock?: (itemId: string, newStock: number) => void;
  onAddItem?: (item: Omit<InventoryItem, "id" | "status">) => void;
  onDeleteItem?: (itemId: string) => void;
}

const InventoryTracker = ({
  items = [
    {
      id: "1",
      name: "Fresh Salmon",
      category: "Seafood",
      currentStock: 25,
      minStock: 10,
      unit: "kg",
      lastUpdated: "2024-01-15",
      supplier: "Ocean Fresh Ltd",
      status: "in-stock" as const,
    },
    {
      id: "2",
      name: "Olive Oil",
      category: "Oils & Condiments",
      currentStock: 5,
      minStock: 8,
      unit: "liters",
      lastUpdated: "2024-01-14",
      supplier: "Mediterranean Imports",
      status: "low-stock" as const,
    },
    {
      id: "3",
      name: "Parmesan Cheese",
      category: "Dairy",
      currentStock: 0,
      minStock: 5,
      unit: "kg",
      lastUpdated: "2024-01-13",
      supplier: "Dairy Delights Inc",
      status: "out-of-stock" as const,
    },
  ],
  onUpdateStock = () => {},
  onAddItem = () => {},
  onDeleteItem = () => {},
}: InventoryTrackerProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);

  const categories = Array.from(
    new Set(items.map((item) => item.category)),
  ).sort();

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getStatusBadge = (status: InventoryItem["status"]) => {
    switch (status) {
      case "in-stock":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700">
            In Stock
          </Badge>
        );
      case "low-stock":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
            Low Stock
          </Badge>
        );
      case "out-of-stock":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700">
            Out of Stock
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Inventory Management</h2>
          <p className="text-gray-500">Track and manage your inventory levels</p>
        </div>
        <Button onClick={() => setShowAddItemDialog(true)}>
          <Plus className="h-4 w-4 mr-2" /> Add New Item
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <CardTitle>Inventory Items</CardTitle>
              <CardDescription>
                Current stock levels and inventory status
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Select
                value={categoryFilter}
                onValueChange={setCategoryFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead>Min. Stock</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>
                      {item.currentStock} {item.unit}
                    </TableCell>
                    <TableCell>
                      {item.minStock} {item.unit}
                    </TableCell>
                    <TableCell>{item.supplier}</TableCell>
                    <TableCell>{item.lastUpdated}</TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDeleteItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      <Dialog open={showAddItemDialog} onOpenChange={setShowAddItemDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Inventory Item</DialogTitle>
            <DialogDescription>
              Enter the details for the new inventory item
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Item Name</Label>
                <Input id="name" placeholder="Enter item name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="currentStock">Current Stock</Label>
                <Input
                  id="currentStock"
                  type="number"
                  placeholder="Enter current stock"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minStock">Minimum Stock</Label>
                <Input
                  id="minStock"
                  type="number"
                  placeholder="Enter minimum stock"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Input id="unit" placeholder="e.g., kg, liters, pieces" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier</Label>
                <Input id="supplier" placeholder="Enter supplier name" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddItemDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={() => setShowAddItemDialog(false)}>
              Add Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryTracker;
