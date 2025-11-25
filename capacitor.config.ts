import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter', // Asegúrate que coincida con tu proyecto
  appName: 'facebomb-app',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  },
  // --- AGREGA O CORRIGE ESTA SECCIÓN ---
  plugins: {
    StatusBar: {
      style: 'DARK', // Pone los iconos (hora/batería) en blanco
      overlay: true, // Permite que la app pase por debajo (necesario para tu diseño)
    },
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '1019503271707-qgf7ho9mvu3g1l0l0ofim3p31qml9678.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
    },
    SplashScreen: {
      launchShowDuration: 3000, // 3000ms = 3 segundos visible
      launchAutoHide: true,     // Se oculta sola después del tiempo
      backgroundColor: "#1b100e", // El color de fondo de tu menú (importante para que no flashee blanco)
      showSpinner: false,       // false para que no salga el círculo de carga nativo
      androidScaleType: "CENTER_CROP",
      splashFullScreen: true,
      splashImmersive: true,
    }
  },
  // -------------------------------------
};

export default config;
