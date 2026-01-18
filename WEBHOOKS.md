# 🔌 Webhooks para n8n - Estepona Tours

## Descripción General

Este documento describe los webhooks disponibles para integración con n8n (o cualquier plataforma de automatización). Los webhooks se disparan automáticamente cuando ocurren eventos importantes en la aplicación.

---

## 🎯 Endpoints Disponibles

### 1. POI Visitado

**Trigger:** Cuando un usuario escanea un POI

**Endpoint:** `POST {N8N_WEBHOOK_URL}/poi-visited`

**Payload:**
```json
{
  "userId": "clx123abc",
  "poiId": "clx456def",
  "poiName": "Torre del Reloj",
  "points": 15,
  "xp": 75,
  "leveledUp": false,
  "newLevel": 3,
  "timestamp": "2026-01-13T10:30:00.000Z",
  "location": {
    "latitude": 36.4265,
    "longitude": -5.1469
  }
}
```

**Use Cases:**
- Enviar email de felicitación
- Notificación push
- Actualizar dashboard externo
- Registrar en sistema analytics

---

### 2. Usuario Registrado

**Trigger:** Cuando un nuevo usuario completa el registro

**Endpoint:** `POST {N8N_WEBHOOK_URL}/user-registered`

**Payload:**
```json
{
  "userId": "clx789ghi",
  "email": "usuario@example.com",
  "name": "Juan Pérez",
  "createdAt": "2026-01-13T09:00:00.000Z",
  "language": "ES",
  "tier": "FREE"
}
```

**Use Cases:**
- Email de bienvenida
- Crear contacto en CRM
- Añadir a mailing list
- Notificar a equipo de marketing

---

### 3. Tour Completado

**Trigger:** Cuando un usuario visita todos los POIs disponibles

**Endpoint:** `POST {N8N_WEBHOOK_URL}/tour-completed`

**Payload:**
```json
{
  "userId": "clx123abc",
  "userName": "Juan Pérez",
  "email": "usuario@example.com",
  "totalPOIs": 10,
  "totalPoints": 180,
  "totalXP": 850,
  "level": 5,
  "completedAt": "2026-01-13T18:00:00.000Z",
  "duration": "6h 30m",
  "badges": [
    {
      "id": "badge1",
      "name": "Maestro Turista"
    }
  ]
}
```

**Use Cases:**
- Enviar certificado digital
- Ofrecer descuento especial
- Felicitación personalizada
- Generar review request

---

### 4. Upgrade a Premium

**Trigger:** Cuando un usuario actualiza su tier a Premium

**Endpoint:** `POST {N8N_WEBHOOK_URL}/tier-upgraded`

**Payload:**
```json
{
  "userId": "clx123abc",
  "email": "usuario@example.com",
  "name": "Juan Pérez",
  "previousTier": "FREE",
  "newTier": "PREMIUM",
  "paymentAmount": 9.99,
  "currency": "EUR",
  "upgradedAt": "2026-01-13T11:00:00.000Z",
  "stripePaymentId": "pi_abc123"
}
```

**Use Cases:**
- Email de bienvenida premium
- Actualizar CRM
- Notificar a equipo de ventas
- Activar beneficios adicionales

---

## 🔧 Configuración en n8n

### Paso 1: Crear Workflow en n8n

1. Acceder a n8n dashboard
2. Crear nuevo workflow
3. Agregar nodo "Webhook"
4. Configurar método: POST
5. Path: `/poi-visited` (o el evento deseado)
6. Copiar Webhook URL

### Paso 2: Configurar en la Aplicación

Agregar a `.env`:
```env
N8N_WEBHOOK_URL="https://tu-instancia-n8n.com/webhook"
```

### Paso 3: Ejemplo de Workflow

```
Webhook (Recibir evento)
    │
    ▼
Switch (Verificar tipo de evento)
    │
    ├─► POI Visitado
    │   ├─► Enviar Email (Gmail)
    │   └─► Crear registro (Google Sheets)
    │
    ├─► Usuario Registrado
    │   ├─► Añadir a Mailchimp
    │   └─► Notificar Slack
    │
    ├─► Tour Completado
    │   ├─► Generar certificado (Cloudinary)
    │   ├─► Enviar por email
    │   └─► Crear lead en Salesforce
    │
    └─► Tier Upgraded
        ├─► Actualizar CRM
        ├─► Enviar email premium
        └─► Analytics (Mixpanel)
```

---

## 🧪 Testing de Webhooks

### Usando cURL

```bash
# Test POI Visited
curl -X POST https://tu-n8n.com/webhook/poi-visited \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test123",
    "poiId": "poi456",
    "poiName": "Test POI",
    "points": 10,
    "xp": 50,
    "timestamp": "2026-01-13T10:00:00.000Z"
  }'
```

### Usando Postman

1. Crear nueva request POST
2. URL: Webhook endpoint
3. Body: Raw JSON con payload de ejemplo
4. Send

### Testing Local con ngrok

```bash
# Exponer n8n local
npx ngrok http 5678

# Actualizar N8N_WEBHOOK_URL con URL de ngrok
N8N_WEBHOOK_URL="https://abc123.ngrok.io/webhook"
```

---

## 🔐 Seguridad

### Autenticación de Webhooks

Para mayor seguridad, puedes validar webhooks con un secret:

**1. Generar secret:**
```bash
openssl rand -hex 32
```

**2. Configurar en .env:**
```env
WEBHOOK_SECRET="tu-secret-generado"
```

**3. Firmar payload en el código:**
```typescript
// En /lib/webhooks.ts
import crypto from 'crypto';

function signPayload(payload: any): string {
  const hmac = crypto.createHmac('sha256', process.env.WEBHOOK_SECRET!);
  hmac.update(JSON.stringify(payload));
  return hmac.digest('hex');
}

// Al enviar webhook:
const signature = signPayload(payload);
await fetch(webhookUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Webhook-Signature': signature,
  },
  body: JSON.stringify(payload),
});
```

**4. Verificar en n8n:**
```javascript
// En n8n Function node
const receivedSignature = $('Webhook').item.json.headers['x-webhook-signature'];
const payload = $('Webhook').item.json.body;
const secret = 'tu-secret-generado';

const crypto = require('crypto');
const hmac = crypto.createHmac('sha256', secret);
hmac.update(JSON.stringify(payload));
const expectedSignature = hmac.digest('hex');

if (receivedSignature !== expectedSignature) {
  throw new Error('Invalid webhook signature');
}

return payload;
```

---

## 📊 Monitoreo

### Logs de Webhooks

Los webhooks se registran en la consola:

```typescript
console.log(`Webhook sent: ${eventType}`, {
  userId,
  timestamp: new Date().toISOString(),
});
```

### Reintentos

Si un webhook falla, la aplicación **no reintenta automáticamente**. Consideraciones:

1. **Implementar queue**: Usar Redis/Bull para reintentos
2. **Dead Letter Queue**: Guardar webhooks fallidos
3. **Monitoring**: Alertas cuando webhooks fallan

---

## 🎨 Casos de Uso Avanzados

### 1. Sistema de Notificaciones Inteligentes

```
Webhook: POI Visitado
    │
    ▼
n8n: Verificar hora del día
    │
    ├─► Si es hora de comida → Recomendar restaurantes cercanos
    ├─► Si es tarde → Sugerir miradores para sunset
    └─► Si es fin de semana → Eventos especiales
```

### 2. Gamificación Social

```
Webhook: Badge Desbloqueado
    │
    ▼
n8n: Compartir logro
    │
    ├─► Post en Twitter automático
    ├─► Actualizar perfil LinkedIn
    └─► Notificar amigos en la app
```

### 3. Analytics Personalizado

```
Webhook: Tour Completado
    │
    ▼
n8n: Analizar comportamiento
    │
    ├─► Calcular ruta tomada
    ├─► Tiempo promedio por POI
    ├─► Categorías preferidas
    └─► Enviar informe personalizado
```

### 4. Integración con Comercios Locales

```
Webhook: POI Visitado (Restaurante)
    │
    ▼
n8n: Generar cupón de descuento
    │
    ├─► Crear código único
    ├─► Enviar por email
    ├─► Notificar al restaurante
    └─► Trackear uso
```

---

## 📝 Plantillas de n8n

### Plantilla 1: Welcome Flow

```json
{
  "nodes": [
    {
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "position": [250, 300],
      "parameters": {
        "httpMethod": "POST",
        "path": "user-registered"
      }
    },
    {
      "name": "Send Welcome Email",
      "type": "n8n-nodes-base.gmail",
      "position": [450, 300],
      "parameters": {
        "to": "={{$json.email}}",
        "subject": "¡Bienvenido a Estepona Tours!",
        "message": "Hola {{$json.name}}, gracias por unirte..."
      }
    }
  ],
  "connections": {
    "Webhook": {
      "main": [
        [
          {
            "node": "Send Welcome Email",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

---

## 🆘 Troubleshooting

### Webhook no se recibe

1. **Verificar URL**: Asegurar que N8N_WEBHOOK_URL está correcta
2. **Verificar n8n está activo**: Workflow debe estar "Active"
3. **Check logs**: Ver errores en n8n execution log
4. **Firewall**: Verificar que n8n es accesible públicamente

### Payload incorrecto

1. **Verificar estructura**: Comparar con documentación
2. **Check encoding**: Debe ser JSON con UTF-8
3. **Validar tipos**: Fechas en ISO 8601

### Performance

Si hay muchos webhooks:
1. **Async processing**: No bloquear request
2. **Queue system**: Usar Redis/Bull
3. **Batch updates**: Agrupar eventos similares

---

## 📚 Recursos

- [n8n Documentation](https://docs.n8n.io)
- [Webhook Best Practices](https://webhooks.fyi)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)

---

**¡Webhooks listos para automatizar tu flujo de trabajo!** 🚀
