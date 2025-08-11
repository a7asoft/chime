# Chime Mobile Application

Aplicación móvil multiplataforma construida con Flutter que integra Amazon Chime SDK para videoconferencias nativas.

## 🚀 Tecnologías

- **Flutter 3.8+** - Framework multiplataforma
- **Dart SDK** - Lenguaje de programación
- **Flutter AWS Chime** - Plugin para Amazon Chime SDK
- **HTTP** - Cliente HTTP para API calls
- **Cupertino Icons** - Iconos iOS style

## 📱 Plataformas Soportadas

- ✅ **Android** (API 21+)
- ✅ **iOS** (iOS 11+)
- ✅ **Web** (Chrome, Firefox, Safari)
- ✅ **macOS** (macOS 10.14+)
- ✅ **Windows** (Windows 10+)
- ✅ **Linux** (Ubuntu 18.04+)

## 📋 Prerrequisitos

### Herramientas de Desarrollo
- Flutter SDK 3.8 o superior
- Dart SDK 3.0+
- Android Studio / VS Code con extensiones Flutter
- Xcode (para desarrollo iOS/macOS)

### Dependencias del Sistema
- **Android:** Android SDK, Android NDK
- **iOS:** Xcode, CocoaPods
- **Web:** Chrome/Firefox para debugging

## 🛠️ Instalación

1. **Verifica la instalación de Flutter:**
   ```bash
   flutter doctor
   ```

2. **Navega al directorio mobile:**
   ```bash
   cd mobile
   ```

3. **Instala las dependencias:**
   ```bash
   flutter pub get
   ```

4. **Configura las plataformas específicas:**

   ### Android
   ```bash
   # Verifica configuración Android
   flutter doctor --android-licenses
   ```

   ### iOS (solo en macOS)
   ```bash
   cd ios
   pod install
   cd ..
   ```

## 🏃‍♂️ Ejecución

### Desarrollo
```bash
# Ejecutar en dispositivo/emulador conectado
flutter run

# Ejecutar en plataforma específica
flutter run -d chrome          # Web
flutter run -d android         # Android
flutter run -d ios             # iOS
flutter run -d macos           # macOS
flutter run -d windows         # Windows
flutter run -d linux           # Linux
```

### Modo Release
```bash
# Android APK
flutter build apk --release

# iOS (requiere certificados)
flutter build ios --release

# Web
flutter build web --release

# Desktop
flutter build macos --release
flutter build windows --release
flutter build linux --release
```

## 📁 Estructura del Proyecto

```
mobile/
├── lib/
│   ├── main.dart                    # Punto de entrada de la aplicación
│   ├── api_service.dart            # Servicio para comunicación con API backend
│   ├── meeting_list_screen.dart    # Pantalla principal con lista de reuniones
│   └── meeting_view_screen.dart    # Pantalla de videoconferencia
├── test/
│   └── widget_test.dart            # Tests de widgets
├── android/                        # Configuración Android
├── ios/                            # Configuración iOS
├── web/                            # Configuración Web
├── macos/                          # Configuración macOS
├── windows/                        # Configuración Windows
├── linux/                          # Configuración Linux
├── pubspec.yaml                    # Dependencias Flutter
└── README.md
```

## 🎯 Características Principales

### Videoconferencias
- **Unirse a reuniones** - Conectar usando meeting ID
- **Audio/Video** - Control nativo de micrófono y cámara
- **Múltiples participantes** - Soporte para reuniones grupales
- **Calidad adaptativa** - Ajuste automático según conexión

### Interfaz Nativa
- **Material Design** - UI nativa Android
- **Cupertino Design** - UI nativa iOS
- **Responsive Layout** - Adaptable a diferentes tamaños
- **Dark/Light Theme** - Soporte para temas del sistema

### Funcionalidades Avanzadas
- **Background Mode** - Continuar llamadas en segundo plano
- **Push Notifications** - Notificaciones de reuniones
- **Screen Sharing** - Compartir pantalla (plataformas compatibles)
- **Recording** - Grabación local de reuniones

## 🔧 Configuración

### Variables de Entorno
Crea un archivo `lib/config/app_config.dart`:

```dart
class AppConfig {
  static const String apiBaseUrl = 'http://localhost:3001';
  static const String chimeRegion = 'us-east-1';
  static const bool debugMode = true;
  
  // Configuración por plataforma
  static const Map<String, dynamic> platformConfig = {
    'android': {
      'minSdkVersion': 21,
      'targetSdkVersion': 33,
    },
    'ios': {
      'minimumOSVersion': '11.0',
    },
  };
}
```

### Permisos

#### Android (`android/app/src/main/AndroidManifest.xml`)
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

#### iOS (`ios/Runner/Info.plist`)
```xml
<key>NSCameraUsageDescription</key>
<string>Esta app necesita acceso a la cámara para videoconferencias</string>
<key>NSMicrophoneUsageDescription</key>
<string>Esta app necesita acceso al micrófono para videoconferencias</string>
```

## 🧪 Testing

```bash
# Tests unitarios
flutter test

# Tests de integración
flutter test integration_test/

# Tests en dispositivo específico
flutter test -d android
flutter test -d ios
```

### Estructura de Tests
```
test/
├── unit/
│   ├── models/
│   ├── services/
│   └── utils/
├── widget/
│   ├── screens/
│   └── widgets/
└── integration_test/
    ├── app_test.dart
    └── meeting_flow_test.dart
```

## 🐛 Solución de Problemas

### Problemas Comunes

1. **Error de Dependencias:**
   ```bash
   flutter clean
   flutter pub get
   ```

2. **Problemas de Permisos:**
   - Verifica permisos en AndroidManifest.xml e Info.plist
   - Solicita permisos en tiempo de ejecución

3. **Error de Build iOS:**
   ```bash
   cd ios
   pod deintegrate
   pod install
   cd ..
   flutter clean
   flutter build ios
   ```

4. **Problemas de Audio/Video:**
   - Verifica que el dispositivo tenga cámara/micrófono
   - Confirma permisos de la aplicación
   - Prueba en dispositivo físico (no emulador)

### Debugging

#### Logs Detallados
```bash
flutter run --verbose
```

#### Inspector de Flutter
```bash
flutter inspector
```

#### DevTools
```bash
flutter pub global activate devtools
flutter pub global run devtools
```

## 📱 Deployment

### Android Play Store
1. **Configura signing:**
   ```bash
   # Genera keystore
   keytool -genkey -v -keystore ~/upload-keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias upload
   ```

2. **Build release:**
   ```bash
   flutter build appbundle --release
   ```

### iOS App Store
1. **Configura certificados en Xcode**
2. **Build para distribución:**
   ```bash
   flutter build ios --release
   ```

### Web Hosting
```bash
flutter build web --release
# Sube el contenido de build/web/ a tu hosting
```

## 🔄 CI/CD

### GitHub Actions (`.github/workflows/flutter.yml`)
```yaml
name: Flutter CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.8.0'
      - run: flutter pub get
      - run: flutter test
      - run: flutter build apk --debug
```

## 📚 Recursos Adicionales

- [Flutter Documentation](https://docs.flutter.dev/)
- [Dart Language Tour](https://dart.dev/guides/language/language-tour)
- [Flutter AWS Chime Plugin](https://pub.dev/packages/flutter_aws_chime)
- [Material Design Guidelines](https://material.io/design)
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)

## 🤝 Contribución

1. **Configuración del entorno:**
   ```bash
   flutter doctor
   flutter pub get
   ```

2. **Convenciones de código:**
   - Sigue las [Dart Style Guidelines](https://dart.dev/guides/language/effective-dart/style)
   - Usa `flutter format .` antes de commit
   - Añade tests para nuevas funcionalidades

3. **Pull Request Process:**
   - Crea una rama feature
   - Implementa cambios con tests
   - Ejecuta `flutter analyze` y `flutter test`
   - Crea PR con descripción detallada

## 📄 Scripts Útiles

```bash
# Desarrollo
flutter run --hot-reload
flutter run --debug

# Análisis de código
flutter analyze
flutter format .

# Limpieza
flutter clean
flutter pub get

# Build
flutter build apk --debug
flutter build ios --debug
flutter build web --release

# Testing
flutter test --coverage
flutter test integration_test/
```

## 🔐 Seguridad

### Mejores Prácticas
- No hardcodear API keys en el código
- Usar variables de entorno para configuración sensible
- Validar inputs del usuario
- Implementar autenticación robusta
- Mantener dependencias actualizadas

### Ofuscación de Código
```bash
flutter build apk --obfuscate --split-debug-info=build/debug-info
```
