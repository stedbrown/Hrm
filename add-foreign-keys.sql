-- Script per aggiungere chiavi esterne alle tabelle

-- 1. Bookings riferimento a Rooms
ALTER TABLE public.bookings
ADD CONSTRAINT fk_bookings_room_id_rooms
FOREIGN KEY (room_id)
REFERENCES public.rooms(id)
ON DELETE CASCADE;

-- 2. Restaurant_orders riferimento a Users
ALTER TABLE public.restaurant_orders
ADD CONSTRAINT fk_restaurant_orders_user_id_users
FOREIGN KEY (user_id)
REFERENCES public.users(id)
ON DELETE SET NULL;

-- 3. Order_items riferimento a Restaurant_orders
ALTER TABLE public.order_items
ADD CONSTRAINT fk_order_items_order_id_restaurant_orders
FOREIGN KEY (order_id)
REFERENCES public.restaurant_orders(id)
ON DELETE CASCADE;

-- 4. Order_items riferimento a Restaurant_menu
ALTER TABLE public.order_items
ADD CONSTRAINT fk_order_items_menu_item_id_restaurant_menu
FOREIGN KEY (menu_item_id)
REFERENCES public.restaurant_menu(id)
ON DELETE RESTRICT;

-- 5. Notifications riferimento a Users
ALTER TABLE public.notifications
ADD CONSTRAINT fk_notifications_user_id_users
FOREIGN KEY (user_id)
REFERENCES public.users(id)
ON DELETE CASCADE;

-- 6. Bookings riferimento a Users (se esiste una colonna user_id in bookings)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'bookings'
        AND column_name = 'user_id'
    ) THEN
        EXECUTE '
            ALTER TABLE public.bookings
            ADD CONSTRAINT fk_bookings_user_id_users
            FOREIGN KEY (user_id)
            REFERENCES public.users(id)
            ON DELETE SET NULL;
        ';
    END IF;
END
$$; 