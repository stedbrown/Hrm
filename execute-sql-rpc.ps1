# Script per eseguire file SQL utilizzando la funzione SQL RPC di Supabase

# Parametri
param (
    [Parameter(Mandatory=$false)]
    [string]$SqlFile
)

# Funzione per leggere le variabili d'ambiente da .env
function Get-EnvVariable {
    param (
        [string]$VarName
    )
    
    $envFile = Get-Content ".env" -ErrorAction SilentlyContinue
    if ($envFile) {
        foreach ($line in $envFile) {
            if ($line -match "^$VarName=(.+)$") {
                return $matches[1]
            }
        }
    }
    
    return $null
}

# Leggi l'URL di Supabase e la chiave API dal file .env
$supabaseUrl = Get-EnvVariable "VITE_SUPABASE_URL"
$supabaseKey = Get-EnvVariable "VITE_SUPABASE_ANON_KEY"

if (-not $supabaseUrl -or -not $supabaseKey) {
    Write-Error "VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY non trovati nel file .env"
    exit 1
}

# Funzione per eseguire una query SQL utilizzando la funzione RPC
function Execute-SqlQuery {
    param (
        [string]$SqlContent
    )
    
    # Preparazione della richiesta HTTP
    $headers = @{
        "apikey" = $supabaseKey
        "Authorization" = "Bearer $supabaseKey"
        "Content-Type" = "application/json"
        "Prefer" = "return=minimal"
    }
    
    # Esegui la query tramite la funzione RPC 'sql'
    try {
        $response = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/rpc/sql" -Method POST -Headers $headers -Body (@{
            "query" = $SqlContent
        } | ConvertTo-Json) -UseBasicParsing
        
        Write-Host "Query eseguita con successo"
        return $response
    }
    catch {
        Write-Error "Errore durante l'esecuzione della query: $_"
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Error "Risposta del server: $responseBody"
            $reader.Close()
        }
        return $null
    }
}

# Funzione per eseguire un file SQL
function Execute-SqlFile {
    param (
        [string]$SqlFile
    )
    
    Write-Host "Esecuzione di $SqlFile..."
    
    # Verifica se il file esiste
    if (-not (Test-Path $SqlFile)) {
        Write-Error "Il file $SqlFile non esiste."
        return $false
    }
    
    # Leggi il contenuto del file SQL
    $sqlContent = Get-Content $SqlFile -Raw
    
    # Dividi il file in singole query (separate da ;)
    $queries = $sqlContent -split ";" | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne "" }
    
    # Esegui ogni query separatamente
    foreach ($query in $queries) {
        Write-Host "Esecuzione query: $($query.Substring(0, [Math]::Min(50, $query.Length)))..."
        $result = Execute-SqlQuery $query
        
        if ($null -eq $result) {
            Write-Warning "La query potrebbe non essere stata eseguita correttamente."
        }
    }
    
    Write-Host "File $SqlFile eseguito."
    return $true
}

# Esegui gli script SQL
if ($SqlFile) {
    # Esegui il file SQL specificato
    Write-Host "Esecuzione del file SQL $SqlFile utilizzando la funzione RPC 'sql'..."
    $success = Execute-SqlFile $SqlFile
    
    if ($success) {
        Write-Host "Operazione completata con successo!"
    } else {
        Write-Error "Operazione fallita."
        exit 1
    }
} else {
    # Esegui i file SQL predefiniti
    Write-Host "Esecuzione degli script SQL predefiniti utilizzando la funzione RPC 'sql'..."
    
    # Esegui i file SQL
    Execute-SqlFile "enable-rls.sql"
    Execute-SqlFile "add-foreign-keys.sql"
    
    Write-Host "Operazione completata!"
} 