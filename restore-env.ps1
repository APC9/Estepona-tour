# Script para restaurar variables de entorno originales
# Uso: .\restore-env.ps1

Write-Host "🔄 Restaurando configuración original..." -ForegroundColor Cyan

if (Test-Path .env.backup) {
    Copy-Item .env.backup .env -Force
    Write-Host "✅ Configuración restaurada desde .env.backup" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  IMPORTANTE: Debes REINICIAR el servidor de Next.js para que los cambios tengan efecto" -ForegroundColor Red
} else {
    Write-Host "❌ No se encontró el archivo .env.backup" -ForegroundColor Red
    exit 1
}
