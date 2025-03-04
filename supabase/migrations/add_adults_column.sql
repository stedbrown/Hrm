-- Aggiungi colonne per numero di adulti e bambini alla tabella bookings
ALTER TABLE bookings 
ADD COLUMN adults INT NOT NULL DEFAULT 1,
ADD COLUMN children INT DEFAULT 0;

-- Aggiorna il trigger per la colonna updated_at
DROP TRIGGER IF EXISTS set_timestamp_bookings ON bookings;
CREATE TRIGGER set_timestamp_bookings
BEFORE UPDATE ON bookings
FOR EACH ROW EXECUTE FUNCTION update_modified_column(); 