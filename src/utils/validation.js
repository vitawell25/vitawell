// ==========================================
// 📁 ARCHIVO: src/utils/validation.js
// ==========================================
// INSTRUCCIONES:
// 1. Crea carpeta: src/utils/
// 2. Crea archivo: validation.js
// 3. Copia TODOOO este código
// 4. Guarda
// ==========================================

/**
 * ✅ VALIDATION UTILITIES
 * ═════════════════════════════════════════
 * Centralizar TODA la validación de datos
 * Evita datos corruptos en la BD
 */

// ═════════════════════════════════════════
// 📧 VALIDACIÓN DE EMAIL
// ═════════════════════════════════════════

/**
 * Validar formato de email
 * @param {string} email
 * @returns {boolean}
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string') return false;
  
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValid = regex.test(email.toLowerCase());
  
  if (!isValid) {
    console.warn(`⚠️ Email inválido: ${email}`);
  }
  
  return isValid;
}

// ═════════════════════════════════════════
// 🔐 VALIDACIÓN DE CONTRASEÑA
// ═════════════════════════════════════════

/**
 * Validar contraseña (mínimo 6 caracteres)
 * @param {string} password
 * @returns {boolean}
 */
export function validatePassword(password) {
  if (!password || typeof password !== 'string') return false;
  
  const isValid = password.length >= 6;
  
  if (!isValid) {
    console.warn('⚠️ Contraseña muy corta (mínimo 6 caracteres)');
  }
  
  return isValid;
}

/**
 * Validar fuerza de contraseña (mejorado)
 * @param {string} password
 * @returns {Object} {score, feedback}
 */
export function validatePasswordStrength(password) {
  let score = 0;
  const feedback = [];
  
  if (!password) {
    return { score: 0, feedback: ['La contraseña es requerida'] };
  }
  
  // Longitud
  if (password.length >= 6) score += 1;
  if (password.length >= 10) score += 1;
  if (password.length >= 16) score += 1;
  
  // Caracteres especiales
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[!@#$%^&*]/.test(password)) score += 1;
  
  // Feedback
  if (password.length < 6) feedback.push('Mínimo 6 caracteres');
  if (!/[A-Z]/.test(password)) feedback.push('Agrega mayúscula');
  if (!/[0-9]/.test(password)) feedback.push('Agrega número');
  if (!/[!@#$%^&*]/.test(password)) feedback.push('Agrega símbolo especial');
  
  const strength = score <= 2 ? 'Débil' : score <= 4 ? 'Media' : 'Fuerte';
  
  return {
    score: Math.min(score, 7),
    strength,
    feedback: feedback.length > 0 ? feedback : ['Excelente contraseña']
  };
}

// ═════════════════════════════════════════
// 👤 VALIDACIÓN DE PERFIL
// ═════════════════════════════════════════

/**
 * Validar perfil completo del usuario
 * @param {Object} profile
 * @returns {Object} {valid, errors}
 * 
 * EJEMPLO:
 * const result = validateProfile(userData);
 * if (!result.valid) {
 *   console.error(result.errors);
 * }
 */
export function validateProfile(profile) {
  const errors = [];
  
  // Nombre
  if (!profile.name || typeof profile.name !== 'string') {
    errors.push('Nombre es requerido');
  } else if (profile.name.length < 2) {
    errors.push('Nombre debe tener al menos 2 caracteres');
  } else if (profile.name.length > 100) {
    errors.push('Nombre no puede exceder 100 caracteres');
  }
  
  // Peso
  if (!profile.weight) {
    errors.push('Peso es requerido');
  } else if (isNaN(profile.weight)) {
    errors.push('Peso debe ser un número');
  } else if (profile.weight < 30 || profile.weight > 300) {
    errors.push('Peso debe estar entre 30 y 300 kg');
  }
  
  // Altura
  if (!profile.height) {
    errors.push('Altura es requerida');
  } else if (isNaN(profile.height)) {
    errors.push('Altura debe ser un número');
  } else if (profile.height < 120 || profile.height > 220) {
    errors.push('Altura debe estar entre 120 y 220 cm');
  }
  
  // Edad
  if (!profile.age) {
    errors.push('Edad es requerida');
  } else if (isNaN(profile.age)) {
    errors.push('Edad debe ser un número');
  } else if (profile.age < 13 || profile.age > 100) {
    errors.push('Edad debe estar entre 13 y 100 años');
  }
  
  // Sexo
  if (profile.sex && !['M', 'F', 'O'].includes(profile.sex)) {
    errors.push('Sexo inválido');
  }
  
  // Nivel de actividad
  const validLevels = ['sedentary', 'light', 'moderate', 'active', 'veryActive'];
  if (profile.activityLevel && !validLevels.includes(profile.activityLevel)) {
    errors.push('Nivel de actividad inválido');
  }
  
  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : ['✅ Perfil válido']
  };
}

// ═════════════════════════════════════════
// 📋 VALIDACIÓN DE SESIÓN
// ═════════════════════════════════════════

/**
 * Validar datos de sesión
 * @param {Object} session
 * @returns {Object} {valid, errors}
 */
export function validateSession(session) {
  const errors = [];
  
  // Fecha
  if (!session.date) {
    errors.push('La fecha es requerida');
  } else if (isNaN(new Date(session.date).getTime())) {
    errors.push('La fecha es inválida');
  }
  
  // Ejercicios
  if (!session.exercises || !Array.isArray(session.exercises)) {
    errors.push('Ejercicios debe ser un array');
  } else if (session.exercises.length === 0) {
    errors.push('Debes agregar al menos un ejercicio');
  } else {
    // Validar cada ejercicio
    session.exercises.forEach((ex, idx) => {
      if (!ex.id) errors.push(`Ejercicio ${idx + 1}: ID requerido`);
      if (!ex.series || ex.series < 1) errors.push(`Ejercicio ${idx + 1}: Series inválidas`);
      if (!ex.reps || ex.reps < 1) errors.push(`Ejercicio ${idx + 1}: Reps inválidas`);
    });
  }
  
  // Notas (opcional)
  if (session.notes && session.notes.length > 500) {
    errors.push('Las notas no pueden exceder 500 caracteres');
  }
  
  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : ['✅ Sesión válida']
  };
}

// ═════════════════════════════════════════
// 💪 VALIDACIÓN DE EJERCICIO
// ═════════════════════════════════════════

/**
 * Validar un ejercicio individual
 * @param {Object} exercise
 * @returns {Object} {valid, errors}
 */
export function validateExercise(exercise) {
  const errors = [];
  
  // ID
  if (!exercise.id) {
    errors.push('ID del ejercicio es requerido');
  }
  
  // Nombre
  if (!exercise.name || exercise.name.length < 2) {
    errors.push('Nombre del ejercicio inválido');
  }
  
  // Series
  if (!exercise.series || isNaN(exercise.series) || exercise.series < 1) {
    errors.push('Series debe ser un número > 0');
  }
  
  // Reps
  if (!exercise.reps || isNaN(exercise.reps) || exercise.reps < 1) {
    errors.push('Reps debe ser un número > 0');
  }
  
  // Peso (opcional)
  if (exercise.weight) {
    if (isNaN(exercise.weight) || exercise.weight < 0) {
      errors.push('Peso debe ser un número válido');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : ['✅ Ejercicio válido']
  };
}

// ═════════════════════════════════════════
// 👨‍🏫 VALIDACIÓN DE RUTINA
// ═════════════════════════════════════════

/**
 * Validar datos de rutina
 * @param {Object} routine
 * @returns {Object} {valid, errors}
 */
export function validateRoutine(routine) {
  const errors = [];
  
  // Nombre
  if (!routine.name || routine.name.length < 3) {
    errors.push('Nombre de rutina inválido (mínimo 3 caracteres)');
  }
  
  // Descripción
  if (!routine.description || routine.description.length < 10) {
    errors.push('Descripción inválida (mínimo 10 caracteres)');
  }
  
  // Ejercicios
  if (!routine.exercises || routine.exercises.length === 0) {
    errors.push('La rutina debe tener al menos un ejercicio');
  }
  
  // Duración
  if (!routine.durationDays || routine.durationDays < 1 || routine.durationDays > 365) {
    errors.push('Duración debe estar entre 1 y 365 días');
  }
  
  // Dificultad
  const validDifficulties = ['beginner', 'intermediate', 'advanced'];
  if (!routine.difficulty || !validDifficulties.includes(routine.difficulty)) {
    errors.push('Dificultad inválida');
  }
  
  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : ['✅ Rutina válida']
  };
}

// ═════════════════════════════════════════
// 🔧 FUNCIONES GENERALES
// ═════════════════════════════════════════

/**
 * Validar objeto contra esquema
 * @param {Object} data
 * @param {Object} schema
 * @returns {Object} {valid, errors}
 * 
 * EJEMPLO:
 * const schema = {
 *   email: { required: true, type: 'string', pattern: 'email' },
 *   age: { required: true, type: 'number', min: 18, max: 100 }
 * };
 * validateAgainstSchema(formData, schema);
 */
export function validateAgainstSchema(data, schema) {
  const errors = [];
  
  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];
    
    // Requerido
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push(`${field} es requerido`);
      continue;
    }
    
    if (value === undefined || value === null) continue;
    
    // Tipo
    if (rules.type && typeof value !== rules.type) {
      errors.push(`${field} debe ser ${rules.type}`);
    }
    
    // Min
    if (rules.min !== undefined && value < rules.min) {
      errors.push(`${field} debe ser mínimo ${rules.min}`);
    }
    
    // Max
    if (rules.max !== undefined && value > rules.max) {
      errors.push(`${field} debe ser máximo ${rules.max}`);
    }
    
    // Length mínima
    if (rules.minLength && value.length < rules.minLength) {
      errors.push(`${field} debe tener mínimo ${rules.minLength} caracteres`);
    }
    
    // Length máxima
    if (rules.maxLength && value.length > rules.maxLength) {
      errors.push(`${field} debe tener máximo ${rules.maxLength} caracteres`);
    }
    
    // Patrón (regex)
    if (rules.pattern && !rules.pattern.test(value)) {
      errors.push(`${field} tiene formato inválido`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : ['✅ Datos válidos']
  };
}

/**
 * Limpiar y validar número
 * @param {*} value
 * @param {Object} options - {min, max, decimals}
 * @returns {number|null}
 */
export function validateNumber(value, options = {}) {
  const num = parseFloat(value);
  
  if (isNaN(num)) return null;
  
  if (options.min !== undefined && num < options.min) return null;
  if (options.max !== undefined && num > options.max) return null;
  
  if (options.decimals !== undefined) {
    return Math.round(num * Math.pow(10, options.decimals)) / Math.pow(10, options.decimals);
  }
  
  return num;
}

/**
 * Limpiar y validar string
 * @param {*} value
 * @param {Object} options - {minLength, maxLength, lowercase, uppercase}
 * @returns {string|null}
 */
export function validateString(value, options = {}) {
  let str = String(value).trim();
  
  if (options.minLength && str.length < options.minLength) return null;
  if (options.maxLength && str.length > options.maxLength) return null;
  
  if (options.lowercase) str = str.toLowerCase();
  if (options.uppercase) str = str.toUpperCase();
  
  return str;
}

// ═════════════════════════════════════════
// 🌐 HACER DISPONIBLE GLOBALMENTE
// ═════════════════════════════════════════

if (typeof window !== 'undefined') {
  window.VitawellValidation = {
    validateEmail,
    validatePassword,
    validatePasswordStrength,
    validateProfile,
    validateSession,
    validateExercise,
    validateRoutine,
    validateAgainstSchema,
    validateNumber,
    validateString
  };
  
  console.log('✅ Validation module cargado');
}

// ═════════════════════════════════════════
// 📥 EXPORTAR TODAS LAS FUNCIONES
// ═════════════════════════════════════════

export default {
  validateEmail,
  validatePassword,
  validatePasswordStrength,
  validateProfile,
  validateSession,
  validateExercise,
  validateRoutine,
  validateAgainstSchema,
  validateNumber,
  validateString
};
