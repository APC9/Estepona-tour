# Script para configurar variables de entorno para tunnelmole
# Uso: .\set-tunnel-env.ps1 <URL_TUNNEL>
# Ejemplo: .\set-tunnel-env.ps1 https://hyp0aw-ip-87-220-218-170.tunnelmole.net

param(
    [Parameter(Mandatory=$true)]
    [string]$TunnelUrl
)

# Eliminar la barra final si existe
$TunnelUrl = $TunnelUrl.TrimEnd('/')

Write-Host "🔧 Configurando variables de entorno para: $TunnelUrl" -ForegroundColor Cyan

# Leer el archivo .env actual
$envContent = Get-Content .env -Raw -ErrorAction SilentlyContinue

if (-not $envContent) {
    Write-Host "❌ No se encontró el archivo .env" -ForegroundColor Red
    exit 1
}

# Hacer backup del .env original
Copy-Item .env .env.backup -Force
Write-Host "✅ Backup creado: .env.backup" -ForegroundColor Green

# Actualizar las URLs
$envContent = $envContent -replace 'NEXTAUTH_URL="[^"]*"', "NEXTAUTH_URL=`"$TunnelUrl`""
$envContent = $envContent -replace 'NEXT_PUBLIC_APP_URL="[^"]*"', "NEXT_PUBLIC_APP_URL=`"$TunnelUrl`""

# Guardar el archivo actualizado
$envContent | Set-Content .env -NoNewline

Write-Host "✅ Variables actualizadas:" -ForegroundColor Green
Write-Host "   NEXTAUTH_URL=$TunnelUrl" -ForegroundColor Yellow
Write-Host "   NEXT_PUBLIC_APP_URL=$TunnelUrl" -ForegroundColor Yellow
Write-Host ""
Write-Host "⚠️  IMPORTANTE: Debes REINICIAR el servidor de Next.js para que los cambios tengan efecto" -ForegroundColor Red
Write-Host ""
Write-Host "📝 Para restaurar la configuración original:" -ForegroundColor Cyan
Write-Host "   .\restore-env.ps1" -ForegroundColor Yellow
