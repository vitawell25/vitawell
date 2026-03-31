// ==========================================
// 📁 ARCHIVO: src/state/store.js
// ==========================================
// INSTRUCCIONES:
// 1. Crea carpeta: src/state/
// 2. Crea archivo: store.js
// 3. Copia TODOOO este código
// 4. Guarda
// ==========================================

/**
 * 🎯 ESTADO GLOBAL (STORE)
 * ═════════════════════════════════════════
 * Una sola fuente de verdad para toda la app
 * Evita estado duplicado y bugs de sincronización
 */

// ═════════════════════════════════════════
// 📊 ESTADO INICIAL
// ═════════════════════════════════════════

/**
 * Estado global de la aplicación
 * Este es el "cerebro" de la app
 */
let STATE = {
  // 👤 AUTENTICACIÓN
  user: null,              // Usuario actual (de Supabase auth)
  profile: null,           // Perfil adicional del usuario
  isAuthenticated: false,
  
  // 🎬 NAVEGACIÓN
  view: 'loading',         // 'loading', 'auth', 'dashboard'
  tab: 'log',              // Tab activa
  trainerTab: 'clients',   // Para entrenadores
  
  // 📋 DATOS PRINCIPALES
  sessions: [],            // Sesiones del usuario
  exercises: [],           // Banco de ejercicios
  routines: [],            // Rutinas disponibles
  clients: [],             // Clientes (si es entrenador)
  
  // 🎨 FORMULARIOS
  form: {
    name: '',
    email: '',
    pass: '',
    role: 'client'
  },
  profileForm: {
    name: '',
    age: '',
    height: '',
    weight: '',
    sex: '',
    activityLevel: 'moderate'
  },
  
  // ⚙️ ESTADOS TRANSITORIOS
  loading: false,
  error: null,
  notif: null,
  notifType: 'info',       // 'success', 'error', 'warning', 'info'
  
  // 🔍 BÚSQUEDA Y FILTROS
  search: '',
  category: null,
  
  // 🎯 VISTA ACTUAL
  selectedSession: null,
  selectedExercise: null,
  selectedClient: null,
  
  // 📅 FORMULARIOS ESPECÍFICOS
  sessionDate: new Date().toISOString().slice(0, 10),
  sessionNote: '',
  sessionExercises: [],
  
  // 🛠️ META
  lastUpdate: null,
  syncPending: false
};

// ═════════════════════════════════════════
// 👂 LISTENERS (Observadores)
// ═════════════════════════════════════════

/**
 * Set de callbacks que se ejecutan cuando cambia el estado
 * Así otros módulos se enterar de cambios
 */
const listeners = new Set();

/**
 * Suscribirse a cambios del estado
 * @param {Function} callback - función a ejecutar cuando cambia estado
 * @returns {Function} función para dejar de escuchar
 * 
 * EJEMPLO:
 * const unsubscribe = subscribe((newState) => {
 *   console.log('Estado cambió:', newState);
 *   render(); // re-renderizar UI
 * });
 * 
 * // Para dejar de escuchar:
 * unsubscribe();
 */
export function subscribe(callback) {
  listeners.add(callback);
  console.log(`📡 Nuevo listener registrado (total: ${listeners.size})`);
  
  // Retornar función para dejar de escuchar
  return () => {
    listeners.delete(callback);
    console.log(`📡 Listener removido (total: ${listeners.size})`);
  };
}

/**
 * Notificar a todos los listeners sobre cambio
 * (se llama automáticamente)
 */
function notifyListeners() {
  listeners.forEach(callback => {
    try {
      callback({ ...STATE });
    } catch (error) {
      console.error('❌ Error en listener:', error);
    }
  });
}

// ═════════════════════════════════════════
// 🔧 FUNCIONES DE ESTADO
// ═════════════════════════════════════════

/**
 * Obtener estado actual (copia)
 * @returns {Object} copia del estado
 * 
 * EJEMPLO:
 * const state = getState();
 * console.log(state.user.email);
 */
export function getState() {
  return { ...STATE };
}

/**
 * Obtener valor específico del estado
 * @param {string} path - ruta al valor (ej: 'user.email')
 * @returns {*}
 * 
 * EJEMPLO:
 * const email = getStateValue('user.email');
 * const allSessions = getStateValue('sessions');
 */
export function getStateValue(path) {
  const parts = path.split('.');
  let value = STATE;
  
  for (const part of parts) {
    if (value && typeof value === 'object') {
      value = value[part];
    } else {
      return undefined;
    }
  }
  
  return value;
}

/**
 * Cambiar estado (agregar/actualizar propiedades)
 * @param {Object} updates - objeto con cambios
 * @param {boolean} skipNotify - no notificar listeners (por defecto false)
 * 
 * EJEMPLO:
 * setState({ user: userData, view: 'dashboard' });
 * setState({ loading: false }); // solo una propiedad
 */
export function setState(updates, skipNotify = false) {
  if (!updates || typeof updates !== 'object') {
    console.warn('⚠️ setState: updates debe ser un objeto');
    return;
  }
  
  const before = { ...STATE };
  STATE = { ...STATE, ...updates };
  
  // Log de cambios (solo en development)
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.log('🔄 Estado actualizado:', {
      before,
      after: STATE,
      changes: updates
    });
  }
  
  // Notificar si no se especifica skip
  if (!skipNotify) {
    notifyListeners();
  }
  
  return STATE;
}

/**
 * Actualizar un objeto dentro del estado
 * @param {string} path - ruta al objeto
 * @param {Object} updates - cambios a agregar
 * 
 * EJEMPLO:
 * updateState('profileForm', { name: 'Juan', age: 30 });
 * updateState('user', { email: 'nuevo@email.com' });
 */
export function updateState(path, updates) {
  const parts = path.split('.');
  const lastPart = parts.pop();
  
  let target = STATE;
  for (const part of parts) {
    target = target[part];
  }
  
  if (target && typeof target === 'object') {
    target[lastPart] = {
      ...target[lastPart],
      ...updates
    };
    notifyListeners();
  }
}

/**
 * Resetear estado a valores iniciales
 * @param {string|null} preserveKey - si especificas, preserva esa key
 * 
 * EJEMPLO:
 * resetState(); // resetea todo
 * resetState('user'); // preserva user, resetea lo demás
 */
export function resetState(preserveKey = null) {
  const preserved = preserveKey ? STATE[preserveKey] : null;
  
  STATE = {
    user: null,
    profile: null,
    isAuthenticated: false,
    view: 'loading',
    tab: 'log',
    trainerTab: 'clients',
    sessions: [],
    exercises: [],
    routines: [],
    clients: [],
    form: { name: '', email: '', pass: '', role: 'client' },
    profileForm: { name: '', age: '', height: '', weight: '', sex: '', activityLevel: 'moderate' },
    loading: false,
    error: null,
    notif: null,
    notifType: 'info',
    search: '',
    category: null,
    selectedSession: null,
    selectedExercise: null,
    selectedClient: null,
    sessionDate: new Date().toISOString().slice(0, 10),
    sessionNote: '',
    sessionExercises: [],
    lastUpdate: null,
    syncPending: false
  };
  
  if (preserved && preserveKey) {
    STATE[preserveKey] = preserved;
  }
  
  console.log('🔄 Estado reseteado');
  notifyListeners();
}

/**
 * Agregar elemento a un array en el estado
 * @param {string} path - ruta al array
 * @param {*} item - elemento a agregar
 * 
 * EJEMPLO:
 * addToState('sessions', newSession);
 * addToState('exercises', newExercise);
 */
export function addToState(path, item) {
  const current = getStateValue(path);
  
  if (Array.isArray(current)) {
    const parts = path.split('.');
    const lastPart = parts.pop();
    
    let target = STATE;
    for (const part of parts) {
      target = target[part];
    }
    
    if (target) {
      target[lastPart] = [...current, item];
      notifyListeners();
    }
  }
}

/**
 * Remover elemento de un array en el estado
 * @param {string} path - ruta al array
 * @param {string} id - id del elemento a remover
 * 
 * EJEMPLO:
 * removeFromState('sessions', sessionId);
 */
export function removeFromState(path, id) {
  const current = getStateValue(path);
  
  if (Array.isArray(current)) {
    const parts = path.split('.');
    const lastPart = parts.pop();
    
    let target = STATE;
    for (const part of parts) {
      target = target[part];
    }
    
    if (target) {
      target[lastPart] = current.filter(item => item.id !== id);
      notifyListeners();
    }
  }
}

/**
 * Actualizar elemento en un array
 * @param {string} path - ruta al array
 * @param {string} id - id del elemento
 * @param {Object} updates - cambios
 * 
 * EJEMPLO:
 * updateInState('sessions', sessionId, { note: 'Excelente' });
 */
export function updateInState(path, id, updates) {
  const current = getStateValue(path);
  
  if (Array.isArray(current)) {
    const parts = path.split('.');
    const lastPart = parts.pop();
    
    let target = STATE;
    for (const part of parts) {
      target = target[part];
    }
    
    if (target) {
      target[lastPart] = current.map(item => 
        item.id === id ? { ...item, ...updates } : item
      );
      notifyListeners();
    }
  }
}

// ═════════════════════════════════════════
// 💬 NOTIFICACIONES
// ═════════════════════════════════════════

/**
 * Mostrar notificación al usuario
 * @param {string} message
 * @param {string} type - 'success', 'error', 'warning', 'info'
 * @param {number} duration - ms antes de desaparecer
 * 
 * EJEMPLO:
 * showNotification('✅ Sesión guardada', 'success');
 * showNotification('❌ Error', 'error', 3000);
 */
export function showNotification(message, type = 'info', duration = 2000) {
  setState({ notif: message, notifType: type });
  
  if (duration > 0) {
    setTimeout(() => {
      setState({ notif: null });
    }, duration);
  }
}

/**
 * Limpiar notificación
 */
export function clearNotification() {
  setState({ notif: null });
}

// ═════════════════════════════════════════
// 🔍 QUERY DE ESTADO
// ═════════════════════════════════════════

/**
 * Obtener estado de carga
 * @returns {boolean}
 */
export function isLoading() {
  return STATE.loading;
}

/**
 * Obtener si hay error
 * @returns {string|null}
 */
export function getError() {
  return STATE.error;
}

/**
 * Obtener usuario autenticado
 * @returns {Object|null}
 */
export function getUser() {
  return STATE.user || null;
}

/**
 * Obtener si está autenticado
 * @returns {boolean}
 */
export function isAuthenticated() {
  return STATE.isAuthenticated;
}

/**
 * Contar listeners activos
 * @returns {number}
 */
export function getListenerCount() {
  return listeners.size;
}

// ═════════════════════════════════════════
// 📊 ESTADO EN CONSOLE
// ═════════════════════════════════════════

/**
 * Ver estado actual en console
 */
export function logState() {
  console.table({
    'Usuario': STATE.user?.email || 'No autenticado',
    'Vista actual': STATE.view,
    'Tab activa': STATE.tab,
    'Sesiones': STATE.sessions.length,
    'Ejercicios': STATE.exercises.length,
    'Loading': STATE.loading,
    'Error': STATE.error,
    'Listeners': listeners.size
  });
}

/**
 * Exportar estado completo (para debugging)
 */
export function exportState() {
  return JSON.stringify(STATE, null, 2);
}

// ═════════════════════════════════════════
// 🌐 HACER DISPONIBLE GLOBALMENTE
// ═════════════════════════════════════════

if (typeof window !== 'undefined') {
  window.VitawellStore = {
    getState,
    setState,
    subscribe,
    resetState,
    addToState,
    removeFromState,
    updateInState,
    showNotification,
    clearNotification,
    isLoading,
    getError,
    getUser,
    isAuthenticated,
    logState,
    exportState,
    getStateValue,
    updateState
  };
  
  console.log('✅ Store module cargado');
  console.log('💡 Usa: window.VitawellStore.logState() para ver estado');
}

// ═════════════════════════════════════════
// 📤 EXPORTAR PARA MÓDULOS
// ═════════════════════════════════════════

export default {
  getState,
  setState,
  subscribe,
  resetState,
  addToState,
  removeFromState,
  updateInState,
  showNotification,
  clearNotification,
  isLoading,
  getError,
  getUser,
  isAuthenticated,
  logState,
  exportState,
  getStateValue,
  updateState
};
