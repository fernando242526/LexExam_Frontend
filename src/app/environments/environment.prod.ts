// Este archivo se usará en producción
export const environment = {
  production: true,
  apiUrl: 'https://api.lexexam.com/api', // URL base de la API en producción
  appName: 'LexExam',
  version: '1.0.0',
  // Configuración para autenticación
  auth: {
    tokenExpiryCheckInterval: 300000, // Intervalo para verificar expiración del token (5 minutos)
    sessionTimeoutWarning: 300000, // Mostrar advertencia 5 minutos antes de que expire la sesión
  },
  // Configuración de logging
  logging: {
    level: 'error', // Nivel de log en producción: solo errores
    consoleOutput: false, // No mostrar logs en consola
  },
};