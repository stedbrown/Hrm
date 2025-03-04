-- Crea una funzione SQL per eseguire query SQL dinamiche
-- NOTA: Questa funzione è potenzialmente pericolosa e dovrebbe essere protetta da RLS
-- e accessibile solo con privilegi elevati

-- Abilita l'estensione pgcrypto se non è già abilitata
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Crea la funzione sql che esegue query SQL dinamiche
CREATE OR REPLACE FUNCTION public.sql(query text)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Esegue con i privilegi del creatore
AS $$
DECLARE
  result JSONB;
BEGIN
  -- Esegui la query dinamica e restituisci il risultato come JSONB
  EXECUTE 'SELECT to_jsonb(array_agg(row_to_json(t))) FROM (' || query || ') t' INTO result;
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'error', SQLERRM,
      'detail', SQLSTATE,
      'query', query
    );
END;
$$;

-- Imposta i permessi per la funzione
-- Solo gli utenti con ruolo 'service_role' possono eseguire questa funzione
REVOKE ALL ON FUNCTION public.sql(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.sql(text) TO service_role; 