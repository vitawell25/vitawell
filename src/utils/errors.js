// ==========================================
// 📁 ARCHIVO: src/utils/errors.js
// ==========================================
// INSTRUCCIONES:
// 1. Crea carpeta: src/utils/
// 2. Crea archivo: errors.js
// 3. Copia TODOOO este código
// 4. Guarda
// ==========================================

/**
 * 🔥 ERROR HANDLING & RETRY LOGIC
 * ═════════════════════════════════════════
 * Manejo centralizado de errores con retry automático
 * Evita pérdida de datos por timeout o conexión fallida
 */

// ═════════════════════════════════════════
// ⚙️ CONFIGURACIÓN
// ═════════════════════════════════════════

const RETRY_CONFIG = {
  maxAttempts: 3,                    // Reintentar hasta 3 veces
  initialDelay: 1000,                // Esperar 1 segundo antes de primer reintento
  maxDelay: 10000,                   // Máximo esperar 10 segundos
  backoffMultiplier: 2,              // Duplicar tiempo entre intentos
  timeout: 30000                     // Timeout de 30 segundos por request
};

const ERROR_TYPES = {
  NETWORK: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT_ERROR',
  AUTH: 'AUTH_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  DATABASE: 'DATABASE_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR'
};

let errorLog = [];

// ═════════════════════════════════════════
// 🔄 RETRY CON BACKOFF EXPONENCIAL
// ═════════════════════════════════════════

/**
 * Ejecutar función con reintentos automáticos
 * @param {Function} fn - función a ejecutar
 * @param {Object} options - opciones de retry
 * @returns {Promise} resultado de la función
 * 
 * EJEMPLO:
 * await retryAsync(() => SB.from('sessions').insert(data))
 */
export async function retryAsync(fn, options = {}) {
  const config = { ...RETRY_CONFIG, ...options };
  let lastError;
  
  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      console.log(`⏳ Intento ${attempt}/${config.maxAttempts}...`);
      
      // Ejecutar función con timeout
      const result = await Promise.race([
        fn(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('TIMEOUT')), config.timeout)
        )
      ]);
      
      console.log(`✅ Éxito en intento ${attempt}`);
      return result;
      
    } catch (error) {
      lastError = error;
      
      // NO reintentar estos errores
      if (
        error.message.includes('VALIDATION') || 
        error.message.includes('AUTH') ||
        error.message.includes('401') ||
        error.message.includes('403')
      ) {
        console.error('🛑 Error fatal, no reintentar:', error.message);
        throw error;
      }
      
      // Si es último intento, lanzar error
      if (attempt === config.maxAttempts) {
        console.error(`❌ Falló después de ${config.maxAttempts} intentos`);
        throw error;
      }
      
      // Calcular delay con backoff exponencial
      // Intento 1: 1000ms
      // Intento 2: 2000ms
      // Intento 3: 4000ms (máximo 10000ms)
      const delay = Math.min(
        config.initialDelay * Math.pow(config.backoffMultiplier, attempt - 1),
        config.maxDelay
      );
      
      console.warn(
        `⏳ Intento ${attempt} falló: "${error.message}". ` +
        `Reintentando en ${delay}ms...`
      );
      
      // Esperar antes de reintentar
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

// ═════════════════════════════════════════
// 📋 CLASIFICAR Y LOGUEAR ERRORES
// ═════════════════════════════════════════

/**
 * Manejar error y retornar mensaje para usuario
 * @param {Error} error - error a manejar
 * @param {Object} context - contexto (acción que se estaba haciendo)
 * @returns {string} mensaje de error para usuario
 * 
 * EJEMPLO:
 * try {
 *   await saveSession();
 * } catch (error) {
 *   const msg = handleError(error, { action: 'saveSession' });
 *   showUserMessage(msg);
 * }
 */
export function handleError(error, context = {}) {
  let errorType = ERROR_TYPES.UNKNOWN;
  let userMessage = 'Algo salió mal. Intenta de nuevo.';
  let severity = 'medium';
  
  // Detectar tipo de error
  if (error.message.includes('Network') || error.message.includes('Failed to fetch')) {
    errorType = ERROR_TYPES.NETWORK;
    userMessage = '❌ Sin conexión. Verifica tu internet.';
    severity = 'high';
    
  } else if (error.message.includes('TIMEOUT')) {
    errorType = ERROR_TYPES.TIMEOUT;
    userMessage = '⏱️ La solicitud tardó demasiado. Intenta de nuevo.';
    severity = 'high';
    
  } else if (error.message.includes('AUTH') || error.message.includes('401')) {
    errorType = ERROR_TYPES.AUTH;
    userMessage = '🔒 Tu sesión expiró. Inicia sesión de nuevo.';
    severity = 'high';
    
  } else if (error.message.includes('VALIDATION') || error.status === 400) {
    errorType = ERROR_TYPES.VALIDATION;
    userMessage = error.message || '⚠️ Datos inválidos. Revisa tus entradas.';
    severity = 'low';
    
  } else if (error.message.includes('Database') || error.status === 500) {
    errorType = ERROR_TYPES.DATABASE;
    userMessage = '📊 Error en la base de datos. Intenta más tarde.';
    severity = 'high';
  }
  
  // Crear entrada en log
  const errorEntry = {
    timestamp: new Date().toISOString(),
    type: errorType,
    message: error.message,
    stack: error.stack,
    context,
    userMessage,
    severity
  };
  
  // Guardar en memoria
  errorLog.push(errorEntry);
  
  // Loguear en consola
  console.error(`[${errorType}] ${error.message}`, {
    stack: error.stack,
    context
  });
  
  // Guardar en localStorage para debugging
  try {
    const logs = JSON.parse(localStorage.getItem('vitawell_error_log') || '[]');
    logs.push(errorEntry);
    // Guardar solo últimos 50 errores
    localStorage.setItem('vitawell_error_log', JSON.stringify(logs.slice(-50)));
  } catch (e) {
    console.warn('⚠️ No se pudo guardar log en localStorage');
  }
  
  return userMessage;
}

// ═════════════════════════════════════════
// 💾 BACKUP LOCAL (PARA NO PERDER DATOS)
// ═════════════════════════════════════════

/**
 * Guardar datos en backup local
 * @param {string} key - identificador del backup
 * @param {*} data - datos a guardar
 * @returns {boolean} si fue exitoso
 * 
 * EJEMPLO:
 * saveLocalBackup('session_draft', sessionData);
 */
export function saveLocalBackup(key, data) {
  try {
    const backups = JSON.parse(localStorage.getItem('vitawell_backups') || '{}');
    backups[key] = {
      data,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('vitawell_backups', JSON.stringify(backups));
    console.log(`✅ Backup guardado: ${key}`);
    return true;
  } catch (e) {
    console.warn(`⚠️ No se pudo guardar backup "${key}":`, e.message);
    return false;
  }
}

/**
 * Recuperar datos del backup local
 * @param {string} key - identificador del backup
 * @returns {*} datos o null si no existe
 * 
 * EJEMPLO:
 * const sessionData = recoverFromBackup('session_draft');
 */
export function recoverFromBackup(key) {
  try {
    const backups = JSON.parse(localStorage.getItem('vitawell_backups') || '{}');
    const backup = backups[key];
    
    if (!backup) {
      console.warn(`⚠️ No existe backup: ${key}`);
      return null;
    }
    
    console.log(`✅ Backup recuperado: ${key}`);
    return backup.data;
  } catch (e) {
    console.warn(`⚠️ Error recuperando backup "${key}":`, e.message);
    return null;
  }
}

/**
 * Eliminar un backup
 * @param {string} key
 */
export function deleteBackup(key) {
  try {
    const backups = JSON.parse(localStorage.getItem('vitawell_backups') || '{}');
    delete backups[key];
    localStorage.setItem('vitawell_backups', JSON.stringify(backups));
    console.log(`✅ Backup eliminado: ${key}`);
  } catch (e) {
    console.warn(`⚠️ Error eliminando backup:`, e.message);
  }
}

/**
 * Limpiar backups viejos (>24 horas)
 */
export function cleanupOldBackups() {
  try {
    const backups = JSON.parse(localStorage.getItem('vitawell_backups') || '{}');
    const now = new Date().getTime();
    const maxAge = 24 * 60 * 60 * 1000; // 24 horas
    
    for (const [key, backup] of Object.entries(backups)) {
      const age = now - new Date(backup.timestamp).getTime();
      if (age > maxAge) {
        console.log(`🗑️ Limpiando backup viejo: ${key}`);
        delete backups[key];
      }
    }
    
    localStorage.setItem('vitawell_backups', JSON.stringify(backups));
  } catch (e) {
    console.warn('⚠️ Error limpiando backups:', e.message);
  }
}

// ═════════════════════════════════════════
// 📊 ESTADÍSTICAS DE ERRORES
// ═════════════════════════════════════════

/**
 * Obtener estadísticas de errores
 * @returns {Object} stats
 * 
 * EJEMPLO EN CONSOLE:
 * getErrorStats()
 * {
 *   total: 5,
 *   byType: { NETWORK_ERROR: 2, TIMEOUT_ERROR: 3 },
 *   recent: [...]
 * }
 */
export function getErrorStats() {
  const stats = {
    total: errorLog.length,
    byType: {},
    bySeverity: {},
    recent: errorLog.slice(-10),
    summary: ''
  };
  
  errorLog.forEach(entry => {
    stats.byType[entry.type] = (stats.byType[entry.type] || 0) + 1;
    stats.bySeverity[entry.severity] = (stats.bySeverity[entry.severity] || 0) + 1;
  });
  
  // Crear resumen
  if (stats.total === 0) {
    stats.summary = '✅ Sin errores';
  } else {
    const mostCommon = Object.entries(stats.byType)
      .sort((a, b) => b[1] - a[1])[0];
    stats.summary = `⚠️ ${stats.total} errores (más frecuente: ${mostCommon[0]} x${mostCommon[1]})`;
  }
  
  return stats;
}

/**
 * Limpiar log de errores
 */
export function clearErrorLog() {
  errorLog = [];
  console.log('✅ Log de errores limpiado');
}

/**
 * Exportar log de errores (para debugging)
 * @returns {string} JSON del log
 */
export function exportErrorLog() {
  return JSON.stringify(errorLog, null, 2);
}

// ═════════════════════════════════════════
// 🧪 EJECUTAR CON ERROR HANDLING COMPLETO
// ═════════════════════════════════════════

/**
 * Ejecutar función con retry + error handling
 * @param {Function} fn
 * @param {Object} context
 * @param {Object} options
 * @returns {Promise}
 * 
 * EJEMPLO:
 * const result = await executeWithErrorHandling(
 *   () => SB.from('sessions').insert(data),
 *   { action: 'saveSession', userId: '123' }
 * );
 */
export async function executeWithErrorHandling(fn, context = {}, options = {}) {
  const startTime = performance.now();
  
  try {
    console.log(`🔄 Ejecutando: ${context.action || 'operación'}`);
    
    const result = await retryAsync(fn, options);
    
    const duration = (performance.now() - startTime).toFixed(2);
    console.log(`✅ Completado en ${duration}ms`);
    
    return result;
    
  } catch (error) {
    const duration = (performance.now() - startTime).toFixed(2);
    const userMessage = handleError(error, context);
    
    console.error(`❌ Error después de ${duration}ms:`, userMessage);
    
    // Guardar backup si es acción crítica
    if (context.data) {
      saveLocalBackup(`backup_${context.action}`, context.data);
    }
    
    throw {
      message: userMessage,
      original: error,
      context
    };
  }
}

// ═════════════════════════════════════════
// 🌐 HACER DISPONIBLE GLOBALMENTE
// ═════════════════════════════════════════

if (typeof window !== 'undefined') {
  window.VitawellErrors = {
    retryAsync,
    handleError,
    saveLocalBackup,
    recoverFromBackup,
    deleteBackup,
    cleanupOldBackups,
    getErrorStats,
    clearErrorLog,
    exportErrorLog,
    executeWithErrorHandling,
    ERROR_TYPES,
    RETRY_CONFIG
  };
  
  console.log('✅ Error handling module cargado');
  console.log('💡 Usa: window.VitawellErrors.getErrorStats() en console');
}
