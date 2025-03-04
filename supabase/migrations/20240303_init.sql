-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create tables for the hotel management system

-- Rooms table
CREATE TABLE IF NOT EXISTS rooms (
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
CREATE TABLE IF NOT EXISTS bookings (
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
CREATE TABLE IF NOT EXISTS restaurant_menu (
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
CREATE TABLE IF NOT EXISTS restaurant_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_number VARCHAR NOT NULL,
  status VARCHAR NOT NULL DEFAULT 'active',
  total_amount DECIMAL(10, 2) NOT NULL,
  payment_status VARCHAR NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items
CREATE TABLE IF NOT EXISTS order_items (
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
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR NOT NULL,
  name VARCHAR NOT NULL,
  role VARCHAR NOT NULL DEFAULT 'staff',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Creare un indice sulla colonna email della tabella users
CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);

-- Enable Row Level Security
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_menu ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies for access
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
DECLARE
  user_data jsonb;
  user_name text;
  user_role text;
BEGIN
  -- Verifica che l'utente non esista già
  PERFORM id FROM public.users WHERE id = NEW.id;
  IF FOUND THEN
    -- Se l'utente esiste già, non fare nulla e considera l'operazione come completata con successo
    RETURN NEW;
  END IF;

  -- Extract user metadata, handling both versions of the metadata field
  BEGIN
    user_data := COALESCE(
      NEW.raw_user_meta_data,
      NEW.user_metadata,
      '{}'::jsonb
    );
  EXCEPTION WHEN OTHERS THEN
    -- In caso di errore, usa un oggetto vuoto
    user_data := '{}'::jsonb;
  END;

  -- Estrai nome utente con gestione degli errori
  BEGIN
    user_name := COALESCE(
      user_data->>'name',
      user_data->>'full_name',
      split_part(NEW.email, '@', 1)
    );
  EXCEPTION WHEN OTHERS THEN
    -- In caso di errore, usa la parte dell'email
    user_name := split_part(NEW.email, '@', 1);
  END;

  -- Estrai ruolo utente con gestione degli errori
  BEGIN
    user_role := COALESCE(
      user_data->>'role',
      'staff'
    );
  EXCEPTION WHEN OTHERS THEN
    -- In caso di errore, usa il ruolo predefinito
    user_role := 'staff';
  END;

  -- Inserisci il nuovo utente con gestione degli errori
  BEGIN
    INSERT INTO public.users (id, email, name, role, created_at)
    VALUES (
      NEW.id,
      NEW.email,
      user_name,
      user_role,
      NOW()
    );
  EXCEPTION WHEN unique_violation THEN
    -- In caso di violazione di unicità, prova ad aggiornare l'utente esistente
    UPDATE public.users 
    SET 
      email = NEW.email,
      name = user_name,
      role = user_role,
      updated_at = NOW()
    WHERE id = NEW.id;
  WHEN OTHERS THEN
    -- Log di errori generici ma continua l'esecuzione
    RAISE NOTICE 'Errore nell''inserimento dell''utente %: %', NEW.id, SQLERRM;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Funzione e trigger per aggiornare 'updated_at' automaticamente
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Applica trigger di aggiornamento a tutte le tabelle
DROP TRIGGER IF EXISTS set_timestamp_rooms ON rooms;
CREATE TRIGGER set_timestamp_rooms
BEFORE UPDATE ON rooms
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

DROP TRIGGER IF EXISTS set_timestamp_bookings ON bookings;
CREATE TRIGGER set_timestamp_bookings
BEFORE UPDATE ON bookings
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

DROP TRIGGER IF EXISTS set_timestamp_restaurant_menu ON restaurant_menu;
CREATE TRIGGER set_timestamp_restaurant_menu
BEFORE UPDATE ON restaurant_menu
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

DROP TRIGGER IF EXISTS set_timestamp_restaurant_orders ON restaurant_orders;
CREATE TRIGGER set_timestamp_restaurant_orders
BEFORE UPDATE ON restaurant_orders
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

DROP TRIGGER IF EXISTS set_timestamp_order_items ON order_items;
CREATE TRIGGER set_timestamp_order_items
BEFORE UPDATE ON order_items
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

DROP TRIGGER IF EXISTS set_timestamp_users ON users;
CREATE TRIGGER set_timestamp_users
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_modified_column();