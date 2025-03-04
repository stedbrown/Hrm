import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Image,
  DollarSign,
  Tag,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Form schema for menu item validation
const menuItemSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  description: z
    .string()
    .min(10, { message: "Description must be at least 10 characters" }),
  price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Price must be a positive number",
  }),
  category: z.string().min(1, { message: "Please select a category" }),
  imageUrl: z.string().optional(),
  dietary: z.array(z.string()).optional(),
});

type MenuItem = z.infer<typeof menuItemSchema> & { id: string };

interface MenuManagerProps {
  initialMenuItems?: MenuItem[];
  categories?: string[];
  dietaryOptions?: string[];
}

const MenuManager = ({
  initialMenuItems = [
    {
      id: "1",
      name: "Classic Burger",
      description:
        "Juicy beef patty with lettuce, tomato, and special sauce on a brioche bun",
      price: "12.99",
      category: "Main Course",
      imageUrl:
        "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&h=350&fit=crop",
      dietary: ["Contains Gluten", "Contains Dairy"],
    },
    {
      id: "2",
      name: "Caesar Salad",
      description:
        "Crisp romaine lettuce with parmesan, croutons, and Caesar dressing",
      price: "9.99",
      category: "Starters",
      imageUrl:
        "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=500&h=350&fit=crop",
      dietary: ["Vegetarian"],
    },
    {
      id: "3",
      name: "Chocolate Lava Cake",
      description:
        "Warm chocolate cake with a molten center, served with vanilla ice cream",
      price: "7.99",
      category: "Desserts",
      imageUrl:
        "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&h=350&fit=crop",
      dietary: ["Vegetarian", "Contains Gluten", "Contains Dairy"],
    },
  ],
  categories = ["Starters", "Main Course", "Sides", "Desserts", "Beverages"],
  dietaryOptions = [
    "Vegetarian",
    "Vegan",
    "Gluten-Free",
    "Dairy-Free",
    "Contains Nuts",
    "Contains Gluten",
    "Contains Dairy",
  ],
}: MenuManagerProps) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  // Initialize form
  const form = useForm<z.infer<typeof menuItemSchema>>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      category: "",
      imageUrl: "",
      dietary: [],
    },
  });

  // Handle form submission
  const onSubmit = (data: z.infer<typeof menuItemSchema>) => {
    if (editingItem) {
      // Update existing item
      setMenuItems(
        menuItems.map((item) =>
          item.id === editingItem.id ? { ...data, id: editingItem.id } : item,
        ),
      );
    } else {
      // Add new item
      const newItem = {
        ...data,
        id: Date.now().toString(),
      };
      setMenuItems([...menuItems, newItem]);
    }
    setIsDialogOpen(false);
    form.reset();
    setEditingItem(null);
  };

  // Handle edit item
  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    form.reset({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      imageUrl: item.imageUrl,
      dietary: item.dietary || [],
    });
    setIsDialogOpen(true);
  };

  // Handle delete item
  const handleDeleteItem = (id: string) => {
    setMenuItems(menuItems.filter((item) => item.id !== id));
  };

  // Handle add new item
  const handleAddItem = () => {
    setEditingItem(null);
    form.reset({
      name: "",
      description: "",
      price: "",
      category: "",
      imageUrl: "",
      dietary: [],
    });
    setIsDialogOpen(true);
  };

  // Filter menu items based on search and category
  const filteredMenuItems = menuItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      activeCategory === "all" || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // Group menu items by category
  const menuItemsByCategory = filteredMenuItems.reduce<
    Record<string, MenuItem[]>
  >((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm w-full h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Restaurant Menu Manager</h1>
        <Button onClick={handleAddItem}>
          <Plus className="mr-2 h-4 w-4" /> Add Menu Item
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="md:col-span-3">
          <div className="flex items-center space-x-2 mb-4">
            <Search className="h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search menu items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
        </div>
        <div>
          <Select value={activeCategory} onValueChange={setActiveCategory}>
            <SelectTrigger>
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
        </div>
      </div>

      <Tabs defaultValue="grid" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="grid">Grid View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="category">Category View</TabsTrigger>
        </TabsList>

        {/* Grid View */}
        <TabsContent value="grid" className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMenuItems.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <div className="relative h-48 w-full">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                      <Image className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  <Badge className="absolute top-2 right-2">
                    {item.category}
                  </Badge>
                </div>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    <div className="font-bold text-lg">${item.price}</div>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {item.description}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {item.dietary?.map((diet) => (
                      <Badge key={diet} variant="outline" className="text-xs">
                        {diet}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end space-x-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditItem(item)}
                  >
                    <Edit className="h-4 w-4 mr-1" /> Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* List View */}
        <TabsContent value="list" className="w-full">
          <div className="border rounded-md overflow-hidden">
            <div className="grid grid-cols-12 bg-gray-100 p-3 font-medium text-sm">
              <div className="col-span-4">Item</div>
              <div className="col-span-3">Category</div>
              <div className="col-span-2">Price</div>
              <div className="col-span-3">Actions</div>
            </div>
            <ScrollArea className="h-[500px]">
              {filteredMenuItems.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-12 p-3 border-t items-center"
                >
                  <div className="col-span-4">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-gray-500 line-clamp-1">
                      {item.description}
                    </div>
                  </div>
                  <div className="col-span-3">
                    <Badge>{item.category}</Badge>
                  </div>
                  <div className="col-span-2 font-medium">${item.price}</div>
                  <div className="col-span-3 flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditItem(item)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </div>
        </TabsContent>

        {/* Category View */}
        <TabsContent value="category" className="w-full">
          <Accordion type="multiple" className="w-full">
            {Object.entries(menuItemsByCategory).map(([category, items]) => (
              <AccordionItem key={category} value={category}>
                <AccordionTrigger className="hover:bg-gray-50 px-4">
                  <div className="flex items-center">
                    <span>{category}</span>
                    <Badge className="ml-2" variant="outline">
                      {items.length}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 p-4">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="border rounded-md p-3 grid grid-cols-12 gap-4 items-center"
                      >
                        <div className="col-span-7">
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-gray-500">
                            {item.description}
                          </div>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {item.dietary?.map((diet) => (
                              <Badge
                                key={diet}
                                variant="outline"
                                className="text-xs"
                              >
                                {diet}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="col-span-2 font-bold text-lg">
                          ${item.price}
                        </div>
                        <div className="col-span-3 flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditItem(item)}
                          >
                            <Edit className="h-4 w-4 mr-1" /> Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" /> Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Menu Item Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit Menu Item" : "Add New Menu Item"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Item Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Classic Burger" id="name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                          <Input
                            placeholder="0.00"
                            className="pl-8"
                            id="price"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the menu item..."
                        className="resize-none"
                        id="description"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://example.com/image.jpg"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="dietary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dietary Information</FormLabel>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {dietaryOptions.map((option) => (
                        <Badge
                          key={option}
                          variant={
                            field.value?.includes(option)
                              ? "default"
                              : "outline"
                          }
                          className="cursor-pointer"
                          onClick={() => {
                            const currentValue = field.value || [];
                            const newValue = currentValue.includes(option)
                              ? currentValue.filter((item) => item !== option)
                              : [...currentValue, option];
                            field.onChange(newValue);
                          }}
                        >
                          {option}
                        </Badge>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="submit">
                  {editingItem ? "Update Item" : "Add Item"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MenuManager;
