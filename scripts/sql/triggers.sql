-- Funzione per impedire la sovrapposizione di prenotazioni sulla stessa camera
-- Questa funzione sarà eseguita ogni volta che viene creata o aggiornata una prenotazione
CREATE OR REPLACE FUNCTION prevent_booking_overlap()
RETURNS TRIGGER AS $$
BEGIN
  -- Verifica se ci sono prenotazioni sovrapposte per la stessa camera
  IF EXISTS (
    SELECT 1 FROM bookings
    WHERE 
      room_id = NEW.room_id 
      AND id != NEW.id  -- Escludi la prenotazione corrente (per gli aggiornamenti)
      AND status IN ('confirmed', 'pending', 'checked_in')
      AND check_in < NEW.check_out  -- La data di check-in esistente è prima della data di check-out nuova
      AND check_out > NEW.check_in  -- La data di check-out esistente è dopo la data di check-in nuova
  ) THEN
    RAISE EXCEPTION 'Non è possibile prenotare questa camera perché è già occupata nelle date selezionate';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crea il trigger che esegue la funzione prima di ogni INSERT o UPDATE nella tabella bookings
DROP TRIGGER IF EXISTS check_booking_overlap ON bookings;

CREATE TRIGGER check_booking_overlap
BEFORE INSERT OR UPDATE ON bookings
FOR EACH ROW
EXECUTE FUNCTION prevent_booking_overlap();

-- Trigger che aggiorna automaticamente lo stato della camera quando una prenotazione cambia stato
CREATE OR REPLACE FUNCTION update_room_status_on_booking_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Se lo stato della prenotazione è cambiato
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Se la prenotazione è confermata, imposta la camera come prenotata
    IF NEW.status = 'confirmed' THEN
      UPDATE rooms SET status = 'reserved' WHERE id = NEW.room_id;
    
    -- Se è stato effettuato il check-in, imposta la camera come occupata
    ELSIF NEW.status = 'checked_in' THEN
      UPDATE rooms SET status = 'occupied' WHERE id = NEW.room_id;
    
    -- Se è stato effettuato il check-out, imposta la camera come "in pulizia"
    ELSIF NEW.status = 'checked_out' THEN
      UPDATE rooms SET status = 'cleaning' WHERE id = NEW.room_id;
    
    -- Se la prenotazione è stata cancellata, reimposta lo stato della camera a disponibile
    ELSIF NEW.status = 'cancelled' THEN
      -- Controlla se non ci sono altre prenotazioni attive per questa camera
      IF NOT EXISTS (
        SELECT 1 FROM bookings 
        WHERE room_id = NEW.room_id 
          AND id != NEW.id 
          AND status IN ('confirmed', 'checked_in')
      ) THEN
        UPDATE rooms SET status = 'available' WHERE id = NEW.room_id;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crea il trigger per l'aggiornamento dello stato della camera
DROP TRIGGER IF EXISTS update_room_status_trigger ON bookings;

CREATE TRIGGER update_room_status_trigger
AFTER UPDATE OF status ON bookings
FOR EACH ROW
EXECUTE FUNCTION update_room_status_on_booking_change(); 