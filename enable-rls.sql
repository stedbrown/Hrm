-- Abilita Row Level Security sulla tabella notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Crea una policy che permette agli utenti di vedere solo le proprie notifiche
CREATE POLICY "Gli utenti possono vedere solo le proprie notifiche" 
ON public.notifications 
FOR SELECT 
USING (auth.uid() = user_id);

-- Crea una policy che permette agli utenti di aggiornare solo le proprie notifiche (es. segnare come lette)
CREATE POLICY "Gli utenti possono aggiornare solo le proprie notifiche" 
ON public.notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Gli amministratori potrebbero avere bisogno di creare notifiche per qualsiasi utente
CREATE POLICY "Gli amministratori possono inserire notifiche per tutti" 
ON public.notifications 
FOR INSERT 
WITH CHECK (
  (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  OR auth.uid() = user_id
);

-- Verifica se anche altre tabelle hanno bisogno di RLS
-- Abilita RLS su tutte le tabelle principali se non è già abilitato

-- Tabella bookings
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Tabella rooms
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

-- Tabella users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Tabella restaurant_orders
ALTER TABLE public.restaurant_orders ENABLE ROW LEVEL SECURITY;

-- Tabella order_items
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Tabella restaurant_menu
ALTER TABLE public.restaurant_menu ENABLE ROW LEVEL SECURITY;

-- NOTA: Dopo aver abilitato RLS, è necessario creare policy specifiche per ciascuna tabella
-- in base ai requisiti dell'applicazione e ai ruoli degli utenti 