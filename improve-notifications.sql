-- Script per migliorare il sistema di notifiche
-- Aggiunge funzionalità avanzate alla tabella notifications

-- 1. Estendere la tabella notifications con nuove colonne
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'general';
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS priority SMALLINT DEFAULT 1; -- 1=bassa, 2=media, 3=alta
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS action_url TEXT DEFAULT NULL;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS icon VARCHAR(100) DEFAULT 'bell';

-- 2. Creare una tabella per le impostazioni delle notifiche per utente
CREATE TABLE IF NOT EXISTS public.notification_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,
    enabled BOOLEAN DEFAULT TRUE,
    email_enabled BOOLEAN DEFAULT FALSE,
    push_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, category)
);

-- Abilita RLS sulla tabella notification_settings
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

-- Crea policy per notification_settings
CREATE POLICY "Utenti possono vedere solo le proprie impostazioni di notifica"
    ON public.notification_settings
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Utenti possono modificare solo le proprie impostazioni di notifica"
    ON public.notification_settings
    FOR UPDATE
    USING (auth.uid() = user_id);

-- 3. Creare una tabella per le categorie di notifiche
CREATE TABLE IF NOT EXISTS public.notification_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    default_enabled BOOLEAN DEFAULT TRUE,
    default_email_enabled BOOLEAN DEFAULT FALSE,
    default_push_enabled BOOLEAN DEFAULT FALSE,
    icon VARCHAR(100) DEFAULT 'bell',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Inserisci categorie predefinite
INSERT INTO public.notification_categories (name, description, icon)
VALUES 
    ('booking', 'Notifiche relative alle prenotazioni', 'calendar'),
    ('order', 'Notifiche relative agli ordini del ristorante', 'utensils'),
    ('system', 'Notifiche di sistema', 'cog'),
    ('payment', 'Notifiche relative ai pagamenti', 'credit-card'),
    ('general', 'Notifiche generali', 'bell')
ON CONFLICT (name) DO NOTHING;

-- 4. Creare una funzione per inviare notifiche
CREATE OR REPLACE FUNCTION public.send_notification(
    p_user_id UUID,
    p_message TEXT,
    p_category VARCHAR DEFAULT 'general',
    p_priority SMALLINT DEFAULT 1,
    p_action_url TEXT DEFAULT NULL,
    p_icon VARCHAR DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_icon VARCHAR;
    v_notification_id UUID;
    v_user_settings RECORD;
BEGIN
    -- Verifica se l'utente ha disabilitato questa categoria di notifiche
    SELECT * INTO v_user_settings 
    FROM public.notification_settings 
    WHERE user_id = p_user_id AND category = p_category;
    
    -- Se l'utente ha impostazioni specifiche e ha disabilitato questa categoria, esci
    IF v_user_settings.id IS NOT NULL AND NOT v_user_settings.enabled THEN
        RETURN NULL;
    END IF;
    
    -- Se non è specificata un'icona, usa quella della categoria
    IF p_icon IS NULL THEN
        SELECT icon INTO v_icon FROM public.notification_categories WHERE name = p_category;
    ELSE
        v_icon := p_icon;
    END IF;
    
    -- Inserisci la notifica
    INSERT INTO public.notifications (
        user_id, 
        message, 
        category, 
        priority, 
        is_read, 
        action_url, 
        icon
    ) VALUES (
        p_user_id, 
        p_message, 
        p_category, 
        p_priority, 
        FALSE, 
        p_action_url, 
        COALESCE(v_icon, 'bell')
    ) RETURNING id INTO v_notification_id;
    
    -- Qui si potrebbero aggiungere logiche per l'invio di email o notifiche push
    -- in base alle impostazioni dell'utente (v_user_settings.email_enabled, v_user_settings.push_enabled)
    
    RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Creare una funzione per segnare una notifica come letta
CREATE OR REPLACE FUNCTION public.mark_notification_as_read(
    p_notification_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Ottieni l'ID dell'utente corrente
    v_user_id := auth.uid();
    
    -- Aggiorna la notifica solo se appartiene all'utente corrente
    UPDATE public.notifications 
    SET is_read = TRUE, updated_at = now()
    WHERE id = p_notification_id AND user_id = v_user_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Creare una funzione per segnare tutte le notifiche come lette
CREATE OR REPLACE FUNCTION public.mark_all_notifications_as_read(
    p_category VARCHAR DEFAULT NULL
) RETURNS INTEGER AS $$
DECLARE
    v_user_id UUID;
    v_count INTEGER;
BEGIN
    -- Ottieni l'ID dell'utente corrente
    v_user_id := auth.uid();
    
    -- Aggiorna tutte le notifiche dell'utente, opzionalmente filtrando per categoria
    IF p_category IS NULL THEN
        UPDATE public.notifications 
        SET is_read = TRUE, updated_at = now()
        WHERE user_id = v_user_id AND is_read = FALSE;
    ELSE
        UPDATE public.notifications 
        SET is_read = TRUE, updated_at = now()
        WHERE user_id = v_user_id AND category = p_category AND is_read = FALSE;
    END IF;
    
    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Creare una vista per il conteggio delle notifiche non lette
CREATE OR REPLACE VIEW public.unread_notification_counts AS
SELECT 
    user_id,
    category,
    COUNT(*) as count
FROM 
    public.notifications
WHERE 
    is_read = FALSE
GROUP BY 
    user_id, category;

-- 8. Creare una funzione per aggiornare il timestamp
CREATE OR REPLACE FUNCTION public.update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Creare trigger per aggiornare automaticamente updated_at
CREATE TRIGGER update_notification_settings_timestamp
BEFORE UPDATE ON public.notification_settings
FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

CREATE TRIGGER update_notification_categories_timestamp
BEFORE UPDATE ON public.notification_categories
FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

-- 10. Creare una notifica di test per verificare il funzionamento
DO $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Ottieni il primo utente disponibile
    SELECT id INTO v_user_id FROM public.users LIMIT 1;
    
    IF v_user_id IS NOT NULL THEN
        -- Invia una notifica di test
        PERFORM public.send_notification(
            v_user_id,
            'Benvenuto al nuovo sistema di notifiche!',
            'system',
            3,
            '/dashboard',
            'star'
        );
    END IF;
END
$$; 