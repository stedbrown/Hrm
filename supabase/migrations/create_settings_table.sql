-- Crea la tabella settings per memorizzare le impostazioni dell'applicazione
CREATE TABLE IF NOT EXISTS public.settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Aggiungi i valori predefiniti
INSERT INTO public.settings (key, value, description) VALUES
('hotel_name', 'Il Tuo Hotel', 'Nome dell''hotel visualizzato nell''interfaccia utente')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Aggiungi le politiche RLS (Row Level Security)
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Crea una policy per consentire a tutti gli utenti autenticati di leggere le impostazioni
CREATE POLICY "Consenti a tutti gli utenti autenticati di leggere le impostazioni" 
ON public.settings FOR SELECT 
TO authenticated 
USING (true);

-- Crea una policy per consentire solo agli amministratori di modificare le impostazioni
CREATE POLICY "Consenti solo agli amministratori di modificare le impostazioni" 
ON public.settings FOR ALL 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.users.id = auth.uid()
        AND auth.users.role = 'admin'
    )
); 