# Configurar Webhooks de Stripe en Localhost

## Problema
Los webhooks de Stripe no pueden llegar a `localhost` directamente desde internet.

## Solución: Stripe CLI

### 1. Instalar Stripe CLI
```bash
# En Windows con Chocolatey:
choco install stripe-cli

# O descargar desde:
https://github.com/stripe/stripe-cli/releases
```

### 2. Iniciar sesión
```bash
stripe login
```

### 3. Redirigir webhooks a tu servidor local
```bash
stripe listen --forward-to localhost:3001/api/webhooks/stripe
```

Esto te dará un **webhook signing secret** como:
```
whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 4. Actualizar .env
Copia el secret y actualiza tu `.env`:
```
STRIPE_WEBHOOK_SECRET="whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

### 5. Reiniciar el servidor
```bash
pnpm dev
```

Ahora cuando hagas un pago, verás los webhooks llegando en ambas consolas.
