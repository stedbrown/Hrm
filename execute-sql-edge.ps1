# Script per eseguire file SQL utilizzando la Edge Function di Supabase

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

# Funzione per eseguire un file SQL utilizzando la Edge Function
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
    
    # Preparazione della richiesta HTTP
    $headers = @{
        "apikey" = $supabaseKey
        "Authorization" = "Bearer $supabaseKey"
        "Content-Type" = "application/json"
    }
    
    # Esegui il file SQL tramite la Edge Function
    try {
        $response = Invoke-RestMethod -Uri "$supabaseUrl/functions/v1/execute-sql" -Method POST -Headers $headers -Body (@{
            "sqlContent" = $sqlContent
        } | ConvertTo-Json) -UseBasicParsing
        
        if ($response.success) {
            Write-Host "File SQL eseguito con successo"
            return $true
        } else {
            Write-Error "Errore durante l'esecuzione del file SQL: $($response.error)"
            return $false
        }
    }
    catch {
        Write-Error "Errore durante la chiamata alla Edge Function: $_"
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Error "Risposta del server: $responseBody"
            $reader.Close()
        }
        return $false
    }
}

# Esegui gli script SQL
if ($SqlFile) {
    # Esegui il file SQL specificato
    Write-Host "Esecuzione del file SQL $SqlFile utilizzando la Edge Function..."
    $success = Execute-SqlFile $SqlFile
    
    if ($success) {
        Write-Host "Operazione completata con successo!"
    } else {
        Write-Error "Operazione fallita."
        exit 1
    }
} else {
    # Esegui i file SQL predefiniti
    Write-Host "Esecuzione degli script SQL predefiniti utilizzando la Edge Function..."
    
    # Esegui i file SQL
    $success1 = Execute-SqlFile "enable-rls.sql"
    $success2 = Execute-SqlFile "add-foreign-keys.sql"
    
    if ($success1 -and $success2) {
        Write-Host "Operazione completata con successo!"
    } else {
        Write-Error "Operazione fallita."
        exit 1
    }
} 