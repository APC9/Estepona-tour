# =========================================
# 🚀 Script de Inicio Rápido - Estepona Tours
# =========================================
# Ejecutar: .\start-dev.ps1

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "   🎮 ESTEPONA TOURS - DEV MODE" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar Docker
Write-Host "📦 Verificando Docker..." -ForegroundColor Yellow
$dockerRunning = docker info 2>$null
if (-not $dockerRunning) {
    Write-Host "❌ Docker no está corriendo. Por favor inicia Docker Desktop." -ForegroundColor Red
    exit 1
}
Write-Host "✅ Docker OK" -ForegroundColor Green
Write-Host ""

# 2. Levantar servicios si no están corriendo
Write-Host "🐳 Verificando contenedores..." -ForegroundColor Yellow
$containers = docker-compose ps --services --filter "status=running" 2>$null
if ($containers -notcontains "postgres") {
    Write-Host "⚡ Levantando PostgreSQL, Redis y pgAdmin..." -ForegroundColor Yellow
    docker-compose up -d 2>&1 | Out-Null
    Write-Host "⏳ Esperando que PostgreSQL esté listo..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
    Write-Host "✅ Servicios levantados" -ForegroundColor Green
} else {
    Write-Host "✅ Contenedores ya están corriendo" -ForegroundColor Green
}
Write-Host ""

# 3. Verificar node_modules
Write-Host "📚 Verificando dependencias..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "⚡ Instalando dependencias con pnpm..." -ForegroundColor Yellow
    pnpm install
    Write-Host "✅ Dependencias instaladas" -ForegroundColor Green
} else {
    Write-Host "✅ Dependencias OK" -ForegroundColor Green
}
Write-Host ""

# 4. Verificar .env
Write-Host "🔐 Verificando variables de entorno..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  Archivo .env no encontrado. Copiando desde .env.docker..." -ForegroundColor Yellow
    Copy-Item .env.docker .env
    Write-Host "✅ .env creado" -ForegroundColor Green
    Write-Host "⚠️  IMPORTANTE: Configura Google OAuth en .env antes de usar auth" -ForegroundColor Red
} else {
    Write-Host "✅ .env OK" -ForegroundColor Green
}
Write-Host ""

# 5. Mostrar servicios disponibles
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "   🌐 SERVICIOS DISPONIBLES" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🏠 Aplicación:    http://localhost:3000" -ForegroundColor White
Write-Host "🎨 pgAdmin:       http://localhost:5050" -ForegroundColor White
Write-Host "🔍 Prisma Studio: http://localhost:5555 (ejecutar: pnpm prisma:studio)" -ForegroundColor White
Write-Host ""
Write-Host "🐘 PostgreSQL:    localhost:5433" -ForegroundColor White
Write-Host "   User:          estepona_user" -ForegroundColor Gray
Write-Host "   Password:      estepona_password_dev" -ForegroundColor Gray
Write-Host "   Database:      estepona_tours" -ForegroundColor Gray
Write-Host ""
Write-Host "🔴 Redis:         localhost:6379" -ForegroundColor White
Write-Host ""

# 6. Iniciar servidor de desarrollo
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "   🚀 INICIANDO SERVIDOR" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Presiona Ctrl+C para detener el servidor" -ForegroundColor Yellow
Write-Host ""

pnpm dev
