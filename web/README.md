# Chime Web Application

Aplicación web frontend construida con React y Amazon Chime SDK para videoconferencias.

## 🚀 Tecnologías

- **React 18.2.0** - Framework frontend
- **Amazon Chime SDK JS** - SDK para videoconferencias
- **Amazon Chime SDK Component Library React** - Componentes UI predefinidos
- **Styled Components** - Styling con CSS-in-JS
- **Styled System** - Sistema de diseño

## 📋 Prerrequisitos

- Node.js 16 o superior
- npm o yarn
- Servidor backend ejecutándose (ver [documentación del servidor](../server/README.md))

## 🛠️ Instalación

1. **Navega al directorio web:**
   ```bash
   cd web
   ```

2. **Instala las dependencias:**
   ```bash
   npm install
   ```

3. **Configura las variables de entorno:**
   ```bash
   # Crea un archivo .env.local (opcional)
   REACT_APP_API_URL=http://localhost:3001
   ```

## 🏃‍♂️ Ejecución

### Modo Desarrollo
```bash
npm start
```
- Abre [http://localhost:3000](http://localhost:3000) en tu navegador
- La página se recarga automáticamente al hacer cambios
- Los errores de lint aparecen en la consola

### Modo Producción
```bash
npm run build
```
- Construye la aplicación para producción en la carpeta `build/`
- Optimiza el build para mejor rendimiento
- Los archivos están minificados y con hashes

## 🧪 Testing

```bash
npm test
```
Ejecuta las pruebas en modo interactivo.

## 📁 Estructura del Proyecto

```
web/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── components/     # Componentes React
│   ├── hooks/         # Custom hooks
│   ├── utils/         # Utilidades
│   ├── styles/        # Estilos globales
│   ├── App.js         # Componente principal
│   └── index.js       # Punto de entrada
├── package.json
└── README.md
```

## 🎯 Características Principales

### Videoconferencias
- **Unirse a reuniones** - Conectar a reuniones existentes
- **Crear reuniones** - Generar nuevas sesiones
- **Audio/Video** - Control de micrófono y cámara
- **Compartir pantalla** - Funcionalidad de screen sharing

### Interfaz de Usuario
- **Responsive Design** - Adaptable a diferentes dispositivos
- **Componentes Chime** - UI components predefinidos
- **Styled Components** - Styling modular y reutilizable

### Integración Backend
- **API REST** - Comunicación con el servidor Node.js
- **Gestión de reuniones** - CRUD de reuniones Chime
- **Autenticación** - Manejo de sesiones de usuario

## 🔧 Configuración Avanzada

### Variables de Entorno
Crea un archivo `.env.local` para configuraciones específicas:

```env
REACT_APP_API_URL=http://localhost:3001
REACT_APP_CHIME_REGION=us-east-1
REACT_APP_DEBUG=true
```

### Personalización de Estilos
Los estilos utilizan Styled Components y Styled System:

```jsx
import styled from 'styled-components';
import { space, color } from 'styled-system';

const Button = styled.button`
  ${space}
  ${color}
  border-radius: 4px;
`;
```

## 🐛 Solución de Problemas

### Problemas Comunes

1. **Error de CORS:**
   - Verifica que el servidor backend esté ejecutándose
   - Confirma la configuración de CORS en el servidor

2. **Problemas de Audio/Video:**
   - Verifica permisos del navegador para micrófono/cámara
   - Comprueba la configuración de Chime SDK

3. **Errores de Build:**
   ```bash
   # Limpia node_modules y reinstala
   rm -rf node_modules package-lock.json
   npm install
   ```

## 📚 Recursos Adicionales

- [Create React App Documentation](https://facebook.github.io/create-react-app/docs/getting-started)
- [React Documentation](https://reactjs.org/)
- [Amazon Chime SDK for JavaScript](https://aws.github.io/amazon-chime-sdk-js/)
- [Styled Components Documentation](https://styled-components.com/)

## 🤝 Contribución

1. Crea una rama para tu feature
2. Sigue las convenciones de código existentes
3. Añade tests para nuevas funcionalidades
4. Actualiza la documentación según sea necesario

## 📄 Scripts Disponibles

- `npm start` - Inicia el servidor de desarrollo
- `npm test` - Ejecuta las pruebas
- `npm run build` - Construye para producción
- `npm run eject` - Expone configuración de webpack (irreversible)

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
