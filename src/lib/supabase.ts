import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/database";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storage: localStorage,
  },
});

export async function fetchRooms() {
  try {
    const { data, error } = await supabase
      .from("rooms")
      .select("*")
      .order("room_number");

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching rooms:", error);
    // Fallback to mock data if there's an error
    return [
      {
        id: "1",
        room_number: "101",
        room_type: "Standard",
        capacity: 2,
        price_per_night: 99.99,
        status: "available",
        amenities: ["WiFi", "TV", "AC"],
      },
      {
        id: "2",
        room_number: "102",
        room_type: "Deluxe",
        capacity: 2,
        price_per_night: 149.99,
        status: "occupied",
        amenities: ["WiFi", "TV", "AC", "Mini Bar"],
      },
      {
        id: "3",
        room_number: "201",
        room_type: "Suite",
        capacity: 4,
        price_per_night: 249.99,
        status: "available",
        amenities: ["WiFi", "TV", "AC", "Mini Bar", "Jacuzzi"],
      },
    ];
  }
}

export async function fetchBookings() {
  try {
    const { data, error } = await supabase
      .from("bookings")
      .select(
        `
        *,
        rooms:room_id(room_number, room_type)
      `,
      )
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching bookings:", error);
    // Fallback to mock data if there's an error
    return [
      {
        id: "1",
        created_at: new Date().toISOString(),
        guest_name: "John Smith",
        guest_email: "john@example.com",
        room_id: "1",
        check_in: "2023-06-15",
        check_out: "2023-06-18",
        status: "confirmed",
        total_amount: 299.97,
        payment_status: "paid",
        rooms: {
          room_number: "101",
          room_type: "Standard",
        },
      },
      {
        id: "2",
        created_at: new Date().toISOString(),
        guest_name: "Jane Doe",
        guest_email: "jane@example.com",
        room_id: "3",
        check_in: "2023-07-01",
        check_out: "2023-07-05",
        status: "pending",
        total_amount: 999.96,
        payment_status: "pending",
        rooms: {
          room_number: "201",
          room_type: "Suite",
        },
      },
    ];
  }
}

export async function fetchMenuItems() {
  try {
    const { data, error } = await supabase
      .from("restaurant_menu")
      .select("*")
      .order("category");

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching menu items:", error);
    // Fallback to mock data if there's an error
    return [
      {
        id: "1",
        name: "Classic Burger",
        description: "Juicy beef patty with lettuce, tomato, and special sauce",
        price: 12.99,
        category: "Main Course",
        image_url:
          "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&h=350&fit=crop",
        dietary_info: ["Contains Gluten", "Contains Dairy"],
        is_available: true,
      },
      {
        id: "2",
        name: "Caesar Salad",
        description:
          "Crisp romaine lettuce with parmesan, croutons, and Caesar dressing",
        price: 9.99,
        category: "Starters",
        image_url:
          "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=500&h=350&fit=crop",
        dietary_info: ["Vegetarian"],
        is_available: true,
      },
      {
        id: "3",
        name: "Chocolate Lava Cake",
        description:
          "Warm chocolate cake with a molten center, served with vanilla ice cream",
        price: 7.99,
        category: "Desserts",
        image_url:
          "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&h=350&fit=crop",
        dietary_info: ["Vegetarian", "Contains Gluten", "Contains Dairy"],
        is_available: true,
      },
    ];
  }
}

export async function fetchRestaurantOrders() {
  try {
    const { data, error } = await supabase
      .from("restaurant_orders")
      .select(
        `
        *,
        order_items:order_items(*, restaurant_menu:menu_item_id(name, category))
      `,
      )
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching restaurant orders:", error);
    // Fallback to mock data if there's an error
    return [
      {
        id: "1",
        created_at: new Date().toISOString(),
        table_number: "12",
        status: "active",
        total_amount: 80.95,
        payment_status: "pending",
        order_items: [
          {
            id: "101",
            order_id: "1",
            menu_item_id: "1",
            quantity: 2,
            price: 24.99,
            notes: null,
            status: "served",
            restaurant_menu: {
              name: "Grilled Salmon",
              category: "Main Course",
            },
          },
          {
            id: "102",
            order_id: "1",
            menu_item_id: "2",
            quantity: 1,
            price: 12.99,
            notes: null,
            status: "served",
            restaurant_menu: {
              name: "Caesar Salad",
              category: "Starters",
            },
          },
        ],
      },
    ];
  }
}

export async function fetchUsers() {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching users:", error);
    // Fallback to mock data if there's an error
    return [
      {
        id: "1",
        email: "john.doe@example.com",
        name: "John Doe",
        role: "staff",
        created_at: new Date().toISOString(),
      },
      {
        id: "2",
        email: "jane.smith@example.com",
        name: "Jane Smith",
        role: "management",
        created_at: new Date().toISOString(),
      },
      {
        id: "3",
        email: "chef@example.com",
        name: "Chef Gordon",
        role: "restaurant",
        created_at: new Date().toISOString(),
      },
    ];
  }
}
