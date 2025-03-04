# Sistema di Gestione Alberghiera

Questo repository contiene il codice sorgente per il sistema di gestione alberghiera, inclusi i trigger SQL per la gestione delle prenotazioni e dello stato delle camere.

## Trigger SQL

### 1. Prevenzione delle prenotazioni sovrapposte

Il trigger `prevent_booking_overlap` impedisce la creazione di prenotazioni sovrapposte per la stessa camera. Viene eseguito prima di ogni INSERT o UPDATE nella tabella `bookings` e verifica se ci sono prenotazioni esistenti che si sovrappongono con quella nuova.

```sql
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

CREATE TRIGGER check_booking_overlap
BEFORE INSERT OR UPDATE ON bookings
FOR EACH ROW
EXECUTE FUNCTION prevent_booking_overlap();
```

### 2. Aggiornamento automatico dello stato della camera

Il trigger `update_room_status_on_booking_change` aggiorna automaticamente lo stato della camera in base allo stato della prenotazione. Viene eseguito dopo ogni UPDATE dello stato nella tabella `bookings`.

```sql
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

CREATE TRIGGER update_room_status_trigger
AFTER UPDATE OF status ON bookings
FOR EACH ROW
EXECUTE FUNCTION update_room_status_on_booking_change();
```

## Struttura del Database

### Tabella `rooms`

- `id`: UUID (chiave primaria)
- `room_number`: Numero della camera
- `room_type`: Tipo di camera (Standard, Deluxe, Suite, ecc.)
- `capacity`: Capacità della camera (numero di persone)
- `price_per_night`: Prezzo per notte
- `status`: Stato della camera (available, reserved, occupied, cleaning, maintenance)
- `amenities`: Array di servizi disponibili nella camera
- `created_at`: Data di creazione del record
- `updated_at`: Data di aggiornamento del record
- `description`: Descrizione della camera

### Tabella `bookings`

- `id`: UUID (chiave primaria)
- `guest_name`: Nome dell'ospite
- `guest_email`: Email dell'ospite
- `room_id`: ID della camera (chiave esterna)
- `check_in`: Data di check-in
- `check_out`: Data di check-out
- `status`: Stato della prenotazione (pending, confirmed, checked_in, checked_out, cancelled)
- `total_amount`: Importo totale della prenotazione
- `payment_status`: Stato del pagamento (pending, paid, refunded)
- `created_at`: Data di creazione del record
- `updated_at`: Data di aggiornamento del record
- `adults`: Numero di adulti
- `children`: Numero di bambini
- `notes`: Note aggiuntive

## Come applicare i trigger

Per applicare i trigger al database Supabase, segui questi passaggi:

1. Accedi al pannello di amministrazione di Supabase: https://app.supabase.io
2. Seleziona il tuo progetto
3. Vai alla sezione 'SQL Editor'
4. Crea una nuova query
5. Copia e incolla il contenuto del file `scripts/sql/triggers.sql`
6. Esegui la query cliccando su 'Run'

## Struttura del Progetto

- `scripts/sql/`: Contiene gli script SQL per i trigger e altre operazioni sul database
- `supabase/migrations/`: Contiene i file di migrazione per il database Supabase
- `src/`: Contiene il codice sorgente dell'applicazione React
