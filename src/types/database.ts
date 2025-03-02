export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      bookings: {
        Row: {
          id: string;
          created_at: string;
          guest_name: string;
          guest_email: string;
          room_id: string;
          check_in: string;
          check_out: string;
          status: string;
          total_amount: number;
          payment_status: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          guest_name: string;
          guest_email: string;
          room_id: string;
          check_in: string;
          check_out: string;
          status?: string;
          total_amount: number;
          payment_status?: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          guest_name?: string;
          guest_email?: string;
          room_id?: string;
          check_in?: string;
          check_out?: string;
          status?: string;
          total_amount?: number;
          payment_status?: string;
        };
      };
      rooms: {
        Row: {
          id: string;
          room_number: string;
          room_type: string;
          capacity: number;
          price_per_night: number;
          status: string;
          amenities: string[];
        };
        Insert: {
          id?: string;
          room_number: string;
          room_type: string;
          capacity: number;
          price_per_night: number;
          status?: string;
          amenities?: string[];
        };
        Update: {
          id?: string;
          room_number?: string;
          room_type?: string;
          capacity?: number;
          price_per_night?: number;
          status?: string;
          amenities?: string[];
        };
      };
      restaurant_menu: {
        Row: {
          id: string;
          name: string;
          description: string;
          price: number;
          category: string;
          image_url: string | null;
          dietary_info: string[] | null;
          is_available: boolean;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          price: number;
          category: string;
          image_url?: string | null;
          dietary_info?: string[] | null;
          is_available?: boolean;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          price?: number;
          category?: string;
          image_url?: string | null;
          dietary_info?: string[] | null;
          is_available?: boolean;
        };
      };
      restaurant_orders: {
        Row: {
          id: string;
          created_at: string;
          table_number: string;
          status: string;
          total_amount: number;
          payment_status: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          table_number: string;
          status?: string;
          total_amount: number;
          payment_status?: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          table_number?: string;
          status?: string;
          total_amount?: number;
          payment_status?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          menu_item_id: string;
          quantity: number;
          price: number;
          notes: string | null;
          status: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          menu_item_id: string;
          quantity: number;
          price: number;
          notes?: string | null;
          status?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          menu_item_id?: string;
          quantity?: number;
          price?: number;
          notes?: string | null;
          status?: string;
        };
      };
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          role?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          role?: string;
          created_at?: string;
        };
      };
    };
  };
}
