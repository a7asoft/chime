# Chime - Video Conferencing Platform

Una plataforma completa de videoconferencias construida con Amazon Chime SDK, que incluye aplicaciones web, móvil y un servidor backend.

## 🏗️ Arquitectura del Proyecto

Este repositorio contiene tres componentes principales:

- **[Web](./web/)** - Aplicación web React con Amazon Chime SDK
- **[Server](./server/)** - API backend Node.js/Express con AWS Chime SDK
- **[Mobile](./mobile/)** - Aplicación móvil Flutter con integración Chime

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 16+ y npm
- Flutter SDK 3.8+
- Cuenta AWS con acceso a Amazon Chime SDK
- Dart SDK

### Configuración del Entorno

1. **Clona el repositorio:**
   ```bash
   git clone <repository-url>
   cd chime_git
   ```

2. **Configura las credenciales AWS:**
   - Crea un archivo `.env` en el directorio `server/`
   - Añade tus credenciales AWS (ver documentación del servidor)

3. **Instala dependencias:**
   ```bash
   # Backend
   cd server && npm install

   # Frontend Web
   cd ../web && npm install

   # Mobile
   cd ../mobile && flutter pub get
   ```

### Ejecutar la Aplicación

1. **Inicia el servidor backend:**
   ```bash
   cd server
   npm start
   ```

2. **Inicia la aplicación web:**
   ```bash
   cd web
   npm start
   ```

3. **Ejecuta la aplicación móvil:**
   ```bash
   cd mobile
   flutter run
   ```

## 📱 Componentes

### Web Application
- **Tecnología:** React 18 + Amazon Chime SDK
- **Puerto:** 3000
- **Características:** Interfaz web responsiva para videoconferencias

### Backend Server
- **Tecnología:** Node.js + Express + AWS SDK
- **Puerto:** Configurable
- **Características:** API REST para gestión de reuniones Chime

### Mobile Application
- **Tecnología:** Flutter + AWS Chime SDK
- **Plataformas:** iOS, Android, Web, Desktop
- **Características:** App nativa multiplataforma

## 🔧 Desarrollo

Cada componente tiene su propia documentación detallada:

- [Documentación Web](./web/README.md)
- [Documentación Server](./server/README.md)
- [Documentación Mobile](./mobile/README.md)

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la licencia [MIT](LICENSE).