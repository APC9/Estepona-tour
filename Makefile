# ===================================
# 🎯 Makefile - Estepona Tours
# ===================================
# Comandos útiles para desarrollo

.PHONY: help install dev build start db-up db-down db-reset seed studio clean

# Ayuda
help:
	@echo "📚 Comandos disponibles:"
	@echo "  make install    - Instalar dependencias con pnpm"
	@echo "  make dev        - Iniciar servidor de desarrollo"
	@echo "  make build      - Build para producción"
	@echo "  make start      - Iniciar servidor de producción"
	@echo "  make db-up      - Levantar PostgreSQL con Docker"
	@echo "  make db-down    - Detener PostgreSQL"
	@echo "  make db-reset   - Resetear base de datos"
	@echo "  make seed       - Poblar base de datos con datos de prueba"
	@echo "  make studio     - Abrir Prisma Studio"
	@echo "  make clean      - Limpiar archivos generados"

# Instalar dependencias
install:
	@echo "📦 Instalando dependencias con pnpm..."
	pnpm install

# Desarrollo
dev:
	@echo "🚀 Iniciando servidor de desarrollo..."
	pnpm dev

# Build
build:
	@echo "🔨 Compilando para producción..."
	pnpm build

# Producción
start:
	@echo "▶️  Iniciando servidor de producción..."
	pnpm start

# Base de datos
db-up:
	@echo "🐳 Levantando PostgreSQL con Docker..."
	docker-compose up -d postgres redis
	@echo "⏳ Esperando que PostgreSQL esté listo..."
	@timeout /t 5 /nobreak > nul
	@echo "✅ PostgreSQL corriendo en localhost:5432"
	@echo "📊 pgAdmin disponible en http://localhost:5050"

db-down:
	@echo "🛑 Deteniendo contenedores..."
	docker-compose down

db-reset:
	@echo "🔄 Reseteando base de datos..."
	pnpm prisma migrate reset --force

# Seed
seed:
	@echo "🌱 Poblando base de datos..."
	pnpm prisma db push
	pnpm run seed

# Prisma Studio
studio:
	@echo "🎨 Abriendo Prisma Studio..."
	pnpm prisma studio

# Limpiar
clean:
	@echo "🧹 Limpiando archivos generados..."
	rd /s /q .next 2>nul || echo "Sin caché de Next.js"
	rd /s /q node_modules 2>nul || echo "Sin node_modules"
	del /f package-lock.json 2>nul || echo "Sin package-lock.json"
	del /f pnpm-lock.yaml 2>nul || echo "Sin pnpm-lock.yaml"
	@echo "✅ Limpieza completada"

# Setup completo
setup: db-up install
	@echo "⏳ Esperando PostgreSQL..."
	@timeout /t 5 /nobreak > nul
	@echo "🔧 Configurando base de datos..."
	pnpm prisma generate
	pnpm prisma db push
	pnpm run seed
	@echo "✅ Setup completado! Ejecuta 'make dev' para iniciar"

# Logs
logs:
	@echo "📋 Mostrando logs de Docker..."
	docker-compose logs -f postgres

# Estado
status:
	@echo "📊 Estado de contenedores:"
	docker-compose ps
