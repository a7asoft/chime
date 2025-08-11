# Chime Backend Server

API backend construida con Node.js y Express que proporciona endpoints para la gestión de reuniones usando Amazon Chime SDK.

## 🚀 Tecnologías

- **Node.js** - Runtime de JavaScript
- **Express 5.1.0** - Framework web
- **AWS SDK for Chime** - SDK para Amazon Chime SDK Meetings
- **CORS** - Middleware para Cross-Origin Resource Sharing
- **dotenv** - Gestión de variables de entorno
- **UUID** - Generación de identificadores únicos

## 📋 Prerrequisitos

- Node.js 16 o superior
- npm o yarn
- Cuenta AWS con acceso a Amazon Chime SDK
- Credenciales AWS configuradas

## 🛠️ Instalación

1. **Navega al directorio server:**
   ```bash
   cd server
   ```

2. **Instala las dependencias:**
   ```bash
   npm install
   ```

3. **Configura las variables de entorno:**
   ```bash
   # Crea un archivo .env
   cp .env.example .env
   ```

   Edita el archivo `.env` con tus credenciales:
   ```env
   AWS_ACCESS_KEY_ID=tu_access_key
   AWS_SECRET_ACCESS_KEY=tu_secret_key
   AWS_REGION=us-east-1
   PORT=3001
   CHIME_REGION=us-east-1
   ```

## 🏃‍♂️ Ejecución

### Modo Desarrollo
```bash
npm run dev
```
Usa nodemon para reinicio automático en cambios.

### Modo Producción
```bash
npm start
```
Ejecuta el servidor con Node.js directamente.

## 📡 API Endpoints

### Reuniones

#### Crear Reunión
```http
POST /meetings
Content-Type: application/json

{
  "title": "Mi Reunión",
  "region": "us-east-1"
}
```

**Respuesta:**
```json
{
  "meeting": {
    "MeetingId": "meeting-id-uuid",
    "MediaRegion": "us-east-1",
    "MediaPlacement": {
      "AudioHostUrl": "...",
      "AudioFallbackUrl": "...",
      "ScreenDataUrl": "...",
      "ScreenSharingUrl": "...",
      "ScreenViewingUrl": "...",
      "SignalingUrl": "...",
      "TurnControlUrl": "..."
    }
  }
}
```

#### Unirse a Reunión
```http
POST /meetings/:meetingId/attendees
Content-Type: application/json

{
  "name": "Nombre del Participante"
}
```

**Respuesta:**
```json
{
  "attendee": {
    "AttendeeId": "attendee-id-uuid",
    "JoinToken": "join-token-string"
  }
}
```

#### Obtener Información de Reunión
```http
GET /meetings/:meetingId
```

#### Finalizar Reunión
```http
DELETE /meetings/:meetingId
```

### Salud del Servidor

#### Health Check
```http
GET /health
```

**Respuesta:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 12345
}
```

## 📁 Estructura del Proyecto

```
server/
├── server.js          # Archivo principal del servidor
├── routes/
│   ├── meetings.js    # Rutas de reuniones
│   └── health.js      # Rutas de salud
├── middleware/
│   ├── auth.js        # Middleware de autenticación
│   └── cors.js        # Configuración CORS
├── utils/
│   ├── chime.js       # Utilidades de Chime SDK
│   └── logger.js      # Sistema de logging
├── .env               # Variables de entorno
├── .env.example       # Ejemplo de variables
├── package.json
└── README.md
```

## 🔧 Configuración

### Variables de Entorno

| Variable | Descripción | Valor por Defecto |
|----------|-------------|-------------------|
| `PORT` | Puerto del servidor | `3001` |
| `AWS_REGION` | Región AWS | `us-east-1` |
| `CHIME_REGION` | Región Chime | `us-east-1` |
| `AWS_ACCESS_KEY_ID` | Access Key AWS | - |
| `AWS_SECRET_ACCESS_KEY` | Secret Key AWS | - |
| `CORS_ORIGIN` | Origen permitido CORS | `*` |
| `LOG_LEVEL` | Nivel de logging | `info` |

### Configuración AWS

#### Opción 1: Variables de Entorno
```env
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
```

#### Opción 2: AWS CLI
```bash
aws configure
```

#### Opción 3: IAM Roles (Recomendado para producción)
Configura roles IAM con los permisos necesarios.

### Permisos AWS Requeridos

El usuario/rol debe tener los siguientes permisos:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "chime:CreateMeeting",
        "chime:DeleteMeeting",
        "chime:GetMeeting",
        "chime:ListMeetings",
        "chime:CreateAttendee",
        "chime:DeleteAttendee",
        "chime:GetAttendee",
        "chime:ListAttendees"
      ],
      "Resource": "*"
    }
  ]
}
```

## 🐛 Solución de Problemas

### Problemas Comunes

1. **Error de Credenciales AWS:**
   ```
   Error: The security token included in the request is invalid
   ```
   - Verifica tus credenciales AWS
   - Confirma que el usuario tiene permisos para Chime SDK

2. **Error de CORS:**
   ```
   Access to fetch at 'http://localhost:3001' from origin 'http://localhost:3000' has been blocked by CORS policy
   ```
   - Verifica la configuración CORS en el servidor
   - Añade el origen del frontend a `CORS_ORIGIN`

3. **Puerto en Uso:**
   ```
   Error: listen EADDRINUSE: address already in use :::3001
   ```
   - Cambia el puerto en `.env`
   - O mata el proceso que usa el puerto: `lsof -ti:3001 | xargs kill`

### Debugging

Activa logs detallados:
```env
LOG_LEVEL=debug
```

## 🧪 Testing

```bash
# Ejecutar tests
npm test

# Tests con coverage
npm run test:coverage

# Tests en modo watch
npm run test:watch
```

## 📊 Monitoring

### Logs
El servidor utiliza un sistema de logging estructurado:

```javascript
// Ejemplo de log
{
  "timestamp": "2024-01-01T00:00:00.000Z",
  "level": "info",
  "message": "Meeting created",
  "meetingId": "meeting-123",
  "attendeeCount": 2
}
```

### Métricas
- Tiempo de respuesta de endpoints
- Número de reuniones activas
- Errores por minuto
- Uso de memoria y CPU

## 🚀 Deployment

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

### PM2
```bash
npm install -g pm2
pm2 start server.js --name chime-backend
```

## 📚 Recursos Adicionales

- [Amazon Chime SDK Documentation](https://docs.aws.amazon.com/chime-sdk/)
- [AWS SDK for JavaScript](https://docs.aws.amazon.com/sdk-for-javascript/)
- [Express.js Documentation](https://expressjs.com/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

## 🤝 Contribución

1. Sigue las convenciones de código (ESLint + Prettier)
2. Añade tests para nuevas funcionalidades
3. Actualiza la documentación de API
4. Verifica que todos los tests pasen

## 📄 Scripts Disponibles

- `npm start` - Inicia el servidor en producción
- `npm run dev` - Inicia con nodemon para desarrollo
- `npm test` - Ejecuta las pruebas
- `npm run lint` - Verifica el código con ESLint
- `npm run format` - Formatea el código con Prettier
