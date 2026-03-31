// ==========================================
// 📁 ARCHIVO: src/services/supabase.js
// ==========================================
// INSTRUCCIONES:
// 1. Crea carpeta: src/services/
// 2. Crea archivo: supabase.js
// 3. Copia TODOOO este código
// 4. Guarda
// ==========================================

/**
 * 🔌 SUPABASE SERVICE
 * ═════════════════════════════════════════
 * Módulo centralizado para conexión a Supabase
 * Evita duplicar credenciales y queries
 */

// ✅ Inicializar cliente de Supabase
// (Supabase debe estar cargado en el HTML via CDN)
export const SB = supabase.createClient(
  'https://rdlmdnzcmvaapkvxhxhl.supabase.co',
  'sb_publishable_1f4owQ2OCnXpRyrDLXqOOA_tCiCG3CL',
  {
    auth: {
      persistSession: true,
      storageKey: 'vitawell-auth',
      autoRefreshToken: true,
      detectSessionInUrl: false
    }
  }
);

// ═════════════════════════════════════════
// 🔐 FUNCIONES DE AUTENTICACIÓN
// ═════════════════════════════════════════

/**
 * Obtener usuario actual
 * @returns {Promise<User|null>}
 */
export async function getUser() {
  try {
    const { data: { user }, error } = await SB.auth.getUser();
    if (error) throw error;
    console.log('✅ Usuario obtenido:', user?.email);
    return user;
  } catch (error) {
    console.error('❌ Error en getUser:', error.message);
    return null;
  }
}

/**
 * Iniciar sesión con email y contraseña
 * @param {string} email
 * @param {string} password
 * @returns {Promise<User>}
 */
export async function signIn(email, password) {
  try {
    const { data, error } = await SB.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    console.log('✅ Inicio de sesión exitoso');
    return data.user;
  } catch (error) {
    console.error('❌ Error en signIn:', error.message);
    throw error;
  }
}

/**
 * Registrar nuevo usuario
 * @param {string} email
 * @param {string} password
 * @param {Object} metadata - datos adicionales {name, role}
 * @returns {Promise<User>}
 */
export async function signUp(email, password, metadata = {}) {
  try {
    const { data, error } = await SB.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });
    if (error) throw error;
    console.log('✅ Registro exitoso');
    return data.user;
  } catch (error) {
    console.error('❌ Error en signUp:', error.message);
    throw error;
  }
}

/**
 * Cerrar sesión
 * @returns {Promise<void>}
 */
export async function signOut() {
  try {
    const { error } = await SB.auth.signOut();
    if (error) throw error;
    console.log('✅ Sesión cerrada');
  } catch (error) {
    console.error('❌ Error en signOut:', error.message);
    throw error;
  }
}

/**
 * Actualizar contraseña
 * @param {string} newPassword
 * @returns {Promise<void>}
 */
export async function updatePassword(newPassword) {
  try {
    const { error } = await SB.auth.updateUser({
      password: newPassword
    });
    if (error) throw error;
    console.log('✅ Contraseña actualizada');
  } catch (error) {
    console.error('❌ Error al actualizar contraseña:', error.message);
    throw error;
  }
}

/**
 * Escuchar cambios en autenticación
 * @param {Function} callback - función a ejecutar cuando cambia auth
 * @returns {Function} función para dejar de escuchar
 */
export function onAuthStateChange(callback) {
  const { data: { subscription } } = SB.auth.onAuthStateChange(
    (event, session) => {
      console.log(`🔄 Auth event: ${event}`);
      callback(event, session);
    }
  );
  
  // Retornar función para dejar de escuchar
  return () => subscription?.unsubscribe?.();
}

/**
 * Enviar email de recuperación
 * @param {string} email
 * @returns {Promise<void>}
 */
export async function resetPassword(email) {
  try {
    const { error } = await SB.auth.resetPasswordForEmail(email);
    if (error) throw error;
    console.log('✅ Email de recuperación enviado');
  } catch (error) {
    console.error('❌ Error al enviar reset:', error.message);
    throw error;
  }
}

// ═════════════════════════════════════════
// 👤 FUNCIONES DE PERFIL
// ═════════════════════════════════════════

/**
 * Obtener perfil del usuario
 * @param {string} userId
 * @returns {Promise<Object>}
 */
export async function getUserProfile(userId) {
  try {
    const { data, error } = await SB
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) throw error;
    console.log('✅ Perfil obtenido');
    return data;
  } catch (error) {
    console.error('❌ Error en getUserProfile:', error.message);
    throw error;
  }
}

/**
 * Crear nuevo perfil
 * @param {string} userId
 * @param {Object} profileData
 * @returns {Promise<Object>}
 */
export async function createUserProfile(userId, profileData) {
  try {
    const { data, error } = await SB
      .from('profiles')
      .insert([{
        user_id: userId,
        ...profileData
      }])
      .select()
      .single();
    
    if (error) throw error;
    console.log('✅ Perfil creado');
    return data;
  } catch (error) {
    console.error('❌ Error en createUserProfile:', error.message);
    throw error;
  }
}

/**
 * Actualizar perfil
 * @param {string} userId
 * @param {Object} updates
 * @returns {Promise<Object>}
 */
export async function updateUserProfile(userId, updates) {
  try {
    const { data, error } = await SB
      .from('profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    console.log('✅ Perfil actualizado');
    return data;
  } catch (error) {
    console.error('❌ Error en updateUserProfile:', error.message);
    throw error;
  }
}

// ═════════════════════════════════════════
// 📋 FUNCIONES DE SESIONES
// ═════════════════════════════════════════

/**
 * Obtener sesiones del usuario
 * @param {string} userId
 * @returns {Promise<Array>}
 */
export async function getUserSessions(userId) {
  try {
    const { data, error } = await SB
      .from('sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    console.log(`✅ ${data.length} sesiones obtenidas`);
    return data;
  } catch (error) {
    console.error('❌ Error en getUserSessions:', error.message);
    return [];
  }
}

/**
 * Crear nueva sesión
 * @param {Object} sessionData
 * @returns {Promise<Object>}
 */
export async function createSession(sessionData) {
  try {
    const { data, error } = await SB
      .from('sessions')
      .insert([sessionData])
      .select()
      .single();
    
    if (error) throw error;
    console.log('✅ Sesión creada');
    return data;
  } catch (error) {
    console.error('❌ Error en createSession:', error.message);
    throw error;
  }
}

/**
 * Actualizar sesión
 * @param {string} sessionId
 * @param {Object} updates
 * @returns {Promise<Object>}
 */
export async function updateSession(sessionId, updates) {
  try {
    const { data, error } = await SB
      .from('sessions')
      .update(updates)
      .eq('id', sessionId)
      .select()
      .single();
    
    if (error) throw error;
    console.log('✅ Sesión actualizada');
    return data;
  } catch (error) {
    console.error('❌ Error en updateSession:', error.message);
    throw error;
  }
}

/**
 * Eliminar sesión
 * @param {string} sessionId
 * @returns {Promise<void>}
 */
export async function deleteSession(sessionId) {
  try {
    const { error } = await SB
      .from('sessions')
      .delete()
      .eq('id', sessionId);
    
    if (error) throw error;
    console.log('✅ Sesión eliminada');
  } catch (error) {
    console.error('❌ Error en deleteSession:', error.message);
    throw error;
  }
}

// ═════════════════════════════════════════
// 🏋️ FUNCIONES DE EJERCICIOS
// ═════════════════════════════════════════

/**
 * Obtener todos los ejercicios
 * @returns {Promise<Array>}
 */
export async function getAllExercises() {
  try {
    const { data, error } = await SB
      .from('exercises')
      .select('*')
      .order('name');
    
    if (error) throw error;
    console.log(`✅ ${data.length} ejercicios obtenidos`);
    return data;
  } catch (error) {
    console.error('❌ Error en getAllExercises:', error.message);
    return [];
  }
}

/**
 * Buscar ejercicios
 * @param {string} query
 * @returns {Promise<Array>}
 */
export async function searchExercises(query) {
  try {
    const { data, error } = await SB
      .from('exercises')
      .select('*')
      .ilike('name', `%${query}%`);
    
    if (error) throw error;
    console.log(`✅ ${data.length} ejercicios encontrados`);
    return data;
  } catch (error) {
    console.error('❌ Error en searchExercises:', error.message);
    return [];
  }
}

/**
 * Obtener ejercicio por ID
 * @param {string} exerciseId
 * @returns {Promise<Object>}
 */
export async function getExerciseById(exerciseId) {
  try {
    const { data, error } = await SB
      .from('exercises')
      .select('*')
      .eq('id', exerciseId)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('❌ Error en getExerciseById:', error.message);
    return null;
  }
}

// ═════════════════════════════════════════
// 👨‍🏫 FUNCIONES PARA ENTRENADORES
// ═════════════════════════════════════════

/**
 * Obtener clientes del entrenador
 * @param {string} trainerId
 * @returns {Promise<Array>}
 */
export async function getTrainerClients(trainerId) {
  try {
    const { data, error } = await SB
      .from('trainer_clients')
      .select('*')
      .eq('trainer_id', trainerId);
    
    if (error) throw error;
    console.log(`✅ ${data.length} clientes obtenidos`);
    return data;
  } catch (error) {
    console.error('❌ Error en getTrainerClients:', error.message);
    return [];
  }
}

/**
 * Crear rutina
 * @param {Object} routineData
 * @returns {Promise<Object>}
 */
export async function createRoutine(routineData) {
  try {
    const { data, error } = await SB
      .from('routines')
      .insert([routineData])
      .select()
      .single();
    
    if (error) throw error;
    console.log('✅ Rutina creada');
    return data;
  } catch (error) {
    console.error('❌ Error en createRoutine:', error.message);
    throw error;
  }
}

/**
 * Obtener rutinas del entrenador
 * @param {string} trainerId
 * @returns {Promise<Array>}
 */
export async function getTrainerRoutines(trainerId) {
  try {
    const { data, error } = await SB
      .from('routines')
      .select('*')
      .eq('trainer_id', trainerId);
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('❌ Error en getTrainerRoutines:', error.message);
    return [];
  }
}

// ═════════════════════════════════════════
// 📊 FUNCIONES GENERALES
// ═════════════════════════════════════════

/**
 * Ejecutar query personalizada
 * @param {string} table
 * @param {string} operation - 'select', 'insert', 'update', 'delete'
 * @param {Object} config
 * @returns {Promise<Any>}
 */
export async function executeQuery(table, operation, config = {}) {
  try {
    let query = SB.from(table)[operation];
    
    if (operation === 'select') {
      const { select = '*', filters = {}, order = null } = config;
      query = SB.from(table).select(select);
      
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
      
      if (order) {
        const [column, ascending] = order;
        query = query.order(column, { ascending });
      }
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`❌ Error en ${operation}:`, error.message);
    throw error;
  }
}

// ═════════════════════════════════════════
// ✅ EXPORTAR SUPABASE PARA USO GLOBAL
// ═════════════════════════════════════════

// Hacer disponible en consola para debugging
if (typeof window !== 'undefined') {
  window.VitawellSupabase = {
    SB,
    getUser,
    signIn,
    signUp,
    signOut,
    getUserProfile,
    getUserSessions,
    createSession,
    getAllExercises,
    searchExercises,
    getTrainerClients
  };
  console.log('✅ Supabase module cargado. Disponible en window.VitawellSupabase');
}
