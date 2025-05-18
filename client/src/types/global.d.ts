// Global type declarations for window.ENV
interface Window {
  ENV: {
    TMDB_API_KEY: string;
    TMDB_API_KEY_V3: string;
    USE_DEMO_SERVER: string;
    FIREBASE_CONFIG: {
      apiKey: string;
      authDomain: string;
      projectId: string;
      storageBucket: string;
      messagingSenderId: string;
      appId: string;
      measurementId: string;
    };
  };
}
