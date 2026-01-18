# ⚡ Comandos Útiles - Estepona Tours

Referencia rápida de comandos para desarrollo, testing y deployment.

---

## 📦 Gestión de Dependencias

```bash
# Instalar todas las dependencias
npm install

# Instalar una dependencia específica
npm install nombre-paquete

# Instalar dependencia de desarrollo
npm install -D nombre-paquete

# Actualizar dependencias
npm update

# Verificar dependencias desactualizadas
npm outdated

# Limpiar node_modules y reinstalar
rm -rf node_modules package-lock.json && npm install

# Auditar vulnerabilidades
npm audit
npm audit fix
```

---

## 🔨 Desarrollo

```bash
# Iniciar servidor de desarrollo
npm run dev

# Iniciar en puerto específico
PORT=3001 npm run dev

# Limpiar caché de Next.js
rm -rf .next

# Build para producción
npm run build

# Iniciar servidor de producción
npm start

# Analizar bundle size
ANALYZE=true npm run build
```

---

## 🗄️ Base de Datos (Prisma)

```bash
# Generar Prisma Client
npx prisma generate

# Sincronizar schema (desarrollo)
npx prisma db push

# Crear migration
npx prisma migrate dev --name nombre-migration

# Aplicar migrations (producción)
npx prisma migrate deploy

# Abrir Prisma Studio (GUI)
npm run prisma:studio
# o
npx prisma studio

# Ver estado de migrations
npx prisma migrate status

# Resetear base de datos (⚠️ CUIDADO)
npx prisma migrate reset

# Seed database
npm run seed

# Format schema
npx prisma format

# Validar schema
npx prisma validate

# Introspect DB existente
npx prisma db pull
```

---

## 🧪 Testing

```bash
# Ejecutar todos los tests
npm test

# Tests en modo watch
npm test -- --watch

# Tests con coverage
npm test -- --coverage

# Tests de un archivo específico
npm test nombre-archivo

# Tests E2E (cuando estén configurados)
npm run test:e2e
```

---

## 🎨 Linting y Formatting

```bash
# Ejecutar ESLint
npm run lint

# Fix automático de problemas
npm run lint -- --fix

# Type checking
npx tsc --noEmit

# Format con Prettier (si está configurado)
npx prettier --write .
```

---

## 🔐 Autenticación

```bash
# Generar NEXTAUTH_SECRET
openssl rand -base64 32

# En Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# En PowerShell (Windows)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

---

## 🚀 Deployment (Vercel)

```bash
# Login a Vercel
vercel login

# Deploy a preview
vercel

# Deploy a producción
vercel --prod

# Ver logs
vercel logs

# Ver logs en tiempo real
vercel logs --follow

# Listar deployments
vercel ls

# Remover deployment
vercel rm <deployment-name>

# Información del proyecto
vercel inspect

# Link proyecto local
vercel link
```

---

## 🐳 Docker (Opcional)

```bash
# Build imagen
docker build -t estepona-tours .

# Ejecutar contenedor
docker run -p 3000:3000 estepona-tours

# Con variables de entorno
docker run -p 3000:3000 --env-file .env estepona-tours

# Ver contenedores activos
docker ps

# Ver logs
docker logs <container-id>

# Detener contenedor
docker stop <container-id>

# Docker Compose
docker-compose up
docker-compose down
```

---

## 🔍 Debugging

```bash
# Next.js con debug
NODE_OPTIONS='--inspect' npm run dev

# Ver variables de entorno
printenv | grep NEXT_PUBLIC

# Verificar build
npm run build && npm start

# Análisis de bundle
npm run build -- --analyze

# Verificar que puerto está usando
lsof -i :3000

# Matar proceso en puerto 3000
kill -9 $(lsof -t -i:3000)
```

---

## 📊 Performance

```bash
# Lighthouse audit
npx lighthouse http://localhost:3000 --view

# Bundle analyzer
ANALYZE=true npm run build

# Check performance
npm run build && npm run start
# Luego usar Chrome DevTools > Lighthouse
```

---

## 🌐 Red y DNS

```bash
# Exponer localhost con ngrok
npx ngrok http 3000

# Verificar DNS
nslookup esteponatours.com

# Test SSL certificate
openssl s_client -connect esteponatours.com:443

# Curl con headers
curl -I https://esteponatours.com

# Test webhook
curl -X POST https://tu-n8n.com/webhook \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

---

## 🗂️ Archivos y Búsqueda

```bash
# Buscar en archivos
grep -r "search-term" .

# Buscar y reemplazar
find . -type f -name "*.ts" -exec sed -i 's/old/new/g' {} +

# Contar líneas de código
find . -name "*.ts" -o -name "*.tsx" | xargs wc -l

# Ver estructura de carpetas
tree -L 2 -I 'node_modules'

# Tamaño de carpetas
du -sh *
```

---

## 🔄 Git

```bash
# Commit con mensaje
git add .
git commit -m "feat: add new feature"

# Push a main
git push origin main

# Crear branch
git checkout -b feature/nueva-funcionalidad

# Ver cambios
git diff

# Ver log
git log --oneline

# Stash cambios
git stash
git stash pop

# Reset a commit anterior
git reset --hard HEAD~1

# Ver branches
git branch -a
```

---

## 📱 PWA

```bash
# Verificar Service Worker
# Abrir DevTools > Application > Service Workers

# Limpiar caché
# DevTools > Application > Clear storage

# Test offline
# DevTools > Network > Offline
```

---

## 🔌 APIs y Webhooks

```bash
# Test GET endpoint
curl http://localhost:3000/api/pois

# Test POST endpoint
curl -X POST http://localhost:3000/api/visits \
  -H "Content-Type: application/json" \
  -d '{"poiId": "123", "nfcUid": "ABC"}'

# Con autenticación
curl http://localhost:3000/api/protected \
  -H "Authorization: Bearer $TOKEN"

# Ver response headers
curl -I http://localhost:3000/api/health

# Test Stripe webhook
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

---

## 🔧 Utilidades

```bash
# Generar UUID
node -e "console.log(require('crypto').randomUUID())"

# Timestamp actual
date +%s

# Formatear JSON
echo '{"key":"value"}' | jq .

# Comprimir archivos
tar -czf backup.tar.gz prisma/ .env

# Descomprimir
tar -xzf backup.tar.gz

# Ver uso de memoria
free -h

# Ver uso de disco
df -h
```

---

## 📚 Documentación

```bash
# Generar documentación de API (si está configurado)
npm run docs:generate

# Servir documentación local
npm run docs:serve

# Ver TypeScript types
npx tsc --showConfig
```

---

## 🚨 Emergencias

```bash
# Rollback rápido (Vercel)
vercel rollback

# Restaurar base de datos desde backup
pg_restore -d estepona_tours backup.dump

# Ver logs de errores
tail -f logs/error.log

# Reiniciar servicios
systemctl restart postgresql
systemctl restart redis
```

---

## 🎯 Scripts Personalizados

Agregar a `package.json`:

```json
{
  "scripts": {
    "db:reset": "npx prisma migrate reset && npm run seed",
    "db:studio": "npx prisma studio",
    "type-check": "tsc --noEmit",
    "format": "prettier --write .",
    "clean": "rm -rf .next node_modules",
    "fresh": "npm run clean && npm install && npm run dev"
  }
}
```

Ejecutar:
```bash
npm run db:reset
npm run type-check
npm run format
```

---

## ⚙️ Variables de Entorno

```bash
# Ver todas las variables
printenv

# Ver específica
echo $DATABASE_URL

# Setear temporalmente
DATABASE_URL="..." npm run dev

# Cargar desde archivo
source .env.local && npm run dev

# Copiar .env de ejemplo
cp .env.example .env
```

---

## 🔍 Troubleshooting Rápido

```bash
# Puerto ocupado
lsof -ti:3000 | xargs kill -9

# Reinstalar dependencias
rm -rf node_modules package-lock.json && npm install

# Limpiar caché completo
rm -rf .next node_modules .turbo && npm install

# Verificar versión Node
node -v
npm -v

# Actualizar npm
npm install -g npm@latest

# Verificar conexión DB
psql $DATABASE_URL -c "SELECT 1"
```

---

**Tip:** Guarda este archivo en tu carpeta de bookmarks para referencia rápida! 📌
