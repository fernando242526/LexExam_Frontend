// Este archivo se usará durante el desarrollo
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api', // URL base de la API en desarrollo
  appName: 'LexExam - Dev',
  version: '1.0.0',
  // Configuración para autenticación
  auth: {
    tokenExpiryCheckInterval: 60000, // Intervalo para verificar expiración del token (1 minuto)
    sessionTimeoutWarning: 300000, // Mostrar advertencia 5 minutos antes de que expire la sesión
  },
  // Configuración de logging
  logging: {
    level: 'debug', // Nivel de log en desarrollo: debug
    consoleOutput: true, // Mostrar logs en consola
  },
};
