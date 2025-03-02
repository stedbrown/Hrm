-- Create tables for the hotel management system

-- Rooms table
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_number VARCHAR NOT NULL UNIQUE,
  room_type VARCHAR NOT NULL,
  capacity INT NOT NULL,
  price_per_night DECIMAL(10, 2) NOT NULL,
  status VARCHAR NOT NULL DEFAULT 'available',
  amenities TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guest_name VARCHAR NOT NULL,
  guest_email VARCHAR NOT NULL,
  room_id UUID NOT NULL REFERENCES rooms(id),
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  status VARCHAR NOT NULL DEFAULT 'pending',
  total_amount DECIMAL(10, 2) NOT NULL,
  payment_status VARCHAR NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Restaurant menu items
CREATE TABLE restaurant_menu (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR NOT NULL,
  image_url TEXT,
  dietary_info TEXT[] DEFAULT '{}',
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Restaurant orders
CREATE TABLE restaurant_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_number VARCHAR NOT NULL,
  status VARCHAR NOT NULL DEFAULT 'active',
  total_amount DECIMAL(10, 2) NOT NULL,
  payment_status VARCHAR NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES restaurant_orders(id),
  menu_item_id UUID NOT NULL REFERENCES restaurant_menu(id),
  quantity INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  notes TEXT,
  status VARCHAR NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email VARCHAR NOT NULL UNIQUE,
  name VARCHAR NOT NULL,
  role VARCHAR NOT NULL DEFAULT 'staff',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_menu ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies for access
-- For development, allow full access
CREATE POLICY "Allow full access to all users" ON rooms FOR ALL USING (true);
CREATE POLICY "Allow full access to all users" ON bookings FOR ALL USING (true);
CREATE POLICY "Allow full access to all users" ON restaurant_menu FOR ALL USING (true);
CREATE POLICY "Allow full access to all users" ON restaurant_orders FOR ALL USING (true);
CREATE POLICY "Allow full access to all users" ON order_items FOR ALL USING (true);
CREATE POLICY "Allow full access to all users" ON users FOR ALL USING (true);

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE restaurant_menu;
ALTER PUBLICATION supabase_realtime ADD TABLE restaurant_orders;
ALTER PUBLICATION supabase_realtime ADD TABLE order_items;
ALTER PUBLICATION supabase_realtime ADD TABLE users;

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'staff')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
