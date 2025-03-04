-- Seed data for the hotel management system

-- Insert sample rooms
INSERT INTO rooms (id, room_number, room_type, capacity, price_per_night, status, amenities, description)
VALUES
  ('123e4567-e89b-12d3-a456-426614174001', '101', 'Standard', 2, 99.99, 'available', ARRAY['WiFi', 'TV', 'AC'], 'Camera standard confortevole con due letti singoli, perfetta per brevi soggiorni.'),
  ('123e4567-e89b-12d3-a456-426614174002', '102', 'Deluxe', 2, 149.99, 'available', ARRAY['WiFi', 'TV', 'AC', 'Mini Bar'], 'Camera deluxe con letto matrimoniale e vista sulla città. Include servizi premium.'),
  ('123e4567-e89b-12d3-a456-426614174003', '201', 'Suite', 4, 249.99, 'available', ARRAY['WiFi', 'TV', 'AC', 'Mini Bar', 'Balcony'], 'Suite elegante con camera da letto separata, soggiorno spazioso e balcone privato.'),
  ('123e4567-e89b-12d3-a456-426614174004', '202', 'Suite Familiare', 5, 299.99, 'available', ARRAY['WiFi', 'TV', 'AC', 'Mini Bar', 'Balcony', 'Kitchen'], 'Spaziosa suite per famiglie con cucina, perfetta per soggiorni prolungati con i bambini.'),
  ('123e4567-e89b-12d3-a456-426614174005', '301', 'Penthouse', 6, 499.99, 'available', ARRAY['WiFi', 'TV', 'AC', 'Mini Bar', 'Balcony', 'Kitchen', 'Jacuzzi'], 'Lussuosa penthouse all\'ultimo piano con vista panoramica, jacuzzi privata e servizi esclusivi.');

-- Insert sample bookings with correct date format (YYYY-MM-DD)
-- Genera alcune prenotazioni per l'oggi, il passato e il futuro
INSERT INTO bookings (id, guest_name, guest_email, room_id, check_in, check_out, status, total_amount, payment_status)
VALUES
  -- Prenotazione attuale (oggi)
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Mario Rossi', 'mario.rossi@example.com', 
   '123e4567-e89b-12d3-a456-426614174001', CURRENT_DATE, 
   (CURRENT_DATE + INTERVAL '3 days')::date, 'confirmed', 299.97, 'paid'),
   
  -- Prenotazione futura prossima settimana
  ('550e8400-e29b-41d4-a716-446655440000', 'Giulia Verdi', 'giulia.verdi@example.com', 
   '123e4567-e89b-12d3-a456-426614174002', 
   (CURRENT_DATE + INTERVAL '7 days')::date, 
   (CURRENT_DATE + INTERVAL '10 days')::date, 'confirmed', 449.97, 'paid'),
   
  -- Prenotazione futura prossimo mese
  ('6ba7b810-9dad-11d1-80b4-00c04fd430c8', 'Franco Bianchi', 'franco.bianchi@example.com', 
   '123e4567-e89b-12d3-a456-426614174003', 
   (CURRENT_DATE + INTERVAL '30 days')::date, 
   (CURRENT_DATE + INTERVAL '35 days')::date, 'confirmed', 1249.95, 'pending'),
   
  -- Prenotazione passata
  ('6ba7b811-9dad-11d1-80b4-00c04fd430c8', 'Anna Neri', 'anna.neri@example.com', 
   '123e4567-e89b-12d3-a456-426614174004', 
   (CURRENT_DATE - INTERVAL '10 days')::date, 
   (CURRENT_DATE - INTERVAL '5 days')::date, 'completed', 1499.95, 'paid'),
   
  -- Prenotazione passata mese scorso
  ('6ba7b812-9dad-11d1-80b4-00c04fd430c8', 'Luca Gialli', 'luca.gialli@example.com', 
   '123e4567-e89b-12d3-a456-426614174005', 
   (CURRENT_DATE - INTERVAL '40 days')::date, 
   (CURRENT_DATE - INTERVAL '35 days')::date, 'completed', 2499.95, 'paid');

-- Aggiorna lo stato delle camere occupate oggi
UPDATE rooms 
SET status = 'occupied' 
WHERE id = '123e4567-e89b-12d3-a456-426614174001';

-- Insert sample restaurant menu items
INSERT INTO restaurant_menu (id, name, description, price, category, image_url, dietary_info, is_available)
VALUES
  ('c5c3b5ee-5fac-4df5-b279-fc6959037cfc', 'Spaghetti Carbonara', 'Traditional Italian pasta with eggs, cheese, pancetta, and black pepper', 14.99, 'Pasta', 'https://example.com/carbonara.jpg', ARRAY['Contains Gluten', 'Contains Dairy'], true),
  ('a33e5b4a-4d2c-4fe6-9da1-2c48b8e9e8a7', 'Caesar Salad', 'Fresh romaine lettuce with Caesar dressing, croutons, and parmesan', 10.99, 'Salads', 'https://example.com/caesar.jpg', ARRAY['Contains Dairy'], true),
  ('7e9f8a2d-6e5b-4b1c-9d8c-3f7e6b5a4d3c', 'Filet Mignon', '8oz premium cut served with garlic mashed potatoes and seasonal vegetables', 34.99, 'Main Courses', 'https://example.com/filet.jpg', NULL, true);

-- Add more seed data here as needed 