-- Add description column to rooms table
ALTER TABLE IF EXISTS public.rooms ADD COLUMN IF NOT EXISTS description TEXT;

-- Update timestamp trigger if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_timestamp_rooms') THEN
        CREATE TRIGGER set_timestamp_rooms
        BEFORE UPDATE ON rooms
        FOR EACH ROW EXECUTE FUNCTION update_modified_column();
    END IF;
END
$$; 