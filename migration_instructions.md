# Istruzioni per l'aggiunta della colonna 'description' alla tabella 'rooms'

Poiché non è possibile eseguire la migrazione direttamente dal terminale a causa della mancanza di strumenti appropriati (come Docker funzionante o psql), ecco come aggiungere la colonna tramite l'interfaccia web di Supabase:

## Passaggio 1: Accedi a Supabase

1. Vai a https://app.supabase.io/
2. Accedi al tuo account
3. Seleziona il progetto "aycfuyxzdtbjbundqbhb"

## Passaggio 2: Apri l'Editor SQL

1. Nel menu laterale, clicca su "SQL Editor"
2. Clicca su "New Query" (Nuova Query)

## Passaggio 3: Inserisci e Esegui la Query per la colonna description

Copia e incolla il seguente codice SQL nell'editor:

```sql
-- Aggiungi la colonna description alla tabella rooms
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS description TEXT;

-- Aggiorna i dati esistenti
UPDATE rooms
SET description = CASE
    WHEN room_type = 'Standard' THEN 'Camera standard confortevole con due letti singoli, perfetta per brevi soggiorni.'
    WHEN room_type = 'Deluxe' THEN 'Camera deluxe con letto matrimoniale e vista sulla città. Include servizi premium.'
    WHEN room_type = 'Suite' THEN 'Suite elegante con camera da letto separata, soggiorno spazioso e balcone privato.'
    WHEN room_type = 'Suite Familiare' THEN 'Spaziosa suite per famiglie con cucina, perfetta per soggiorni prolungati con i bambini.'
    WHEN room_type = 'Penthouse' THEN 'Lussuosa penthouse all''ultimo piano con vista panoramica, jacuzzi privata e servizi esclusivi.'
    ELSE 'Camera confortevole con tutti i servizi essenziali.'
END;

-- Aggiorna la cache dello schema
NOTIFY pgrst, 'reload schema';
```

3. Clicca su "Run" o "Execute" per eseguire la query

## Passaggio 4: Aggiungi il trigger per prevenire prenotazioni doppie

Crea una nuova query e incolla il seguente codice SQL:

```sql
-- Funzione per impedire la sovrapposizione di prenotazioni sulla stessa camera
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
```

5. Clicca su "Run" o "Execute" per eseguire la query

## Passaggio 5: Aggiungi il trigger per aggiornare automaticamente lo stato delle camere

Crea una nuova query e incolla il seguente codice SQL:

```sql
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
```

6. Clicca su "Run" o "Execute" per eseguire la query

## Passaggio 6: Verifica

Per verificare che la colonna sia stata aggiunta correttamente, puoi eseguire questa query:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'rooms' AND column_name = 'description';
```

Per verificare che i trigger siano stati creati correttamente:

```sql
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE event_object_table = 'bookings';
```

Dovresti vedere i trigger `check_booking_overlap` e `update_room_status_trigger` nella lista. 