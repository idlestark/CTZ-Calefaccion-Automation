// Parámetros del sistema y sus valores por defecto.
// Todos son editables desde Ajustes (protegidos con PIN).
const DEFAULT_SETTINGS = {
  company_name: "TANDILTA",
  work_start: "07:00", // inicio de jornada
  work_end: "16:00", // fin de jornada
  tolerance_min: 15, // tolerancia de llegada tarde (min)
  comp_hours_per_saturday: 3, // horas "Comp" por cada sábado del mes
  near_miss_min: 10, // margen para la alerta "casi llega al grado" (min)
  duplicate_min: 0, // 0 = no se ignoran marcas seguidas (ver SUPUESTOS.md)
  extras_in_total: false, // si las horas extra suman a "Hs" de la planilla
  backup_enabled: true, // copia de seguridad local al procesar el reloj

  bonus_puntualidad: 137000,
  bonus_presentismo: 70000,
  bonus_medio: 56000,

  // Medio presentismo
  med_max_exits: 2,
  med_max_exit_hours: 6,
  med_max_late: 2,
  med_max_half_abs: 2,
  med_max_full_abs: 1,
  // Presentismo (Puntualidad usa los mismos topes + llegadas <= work_start)
  pres_max_exits: 1,
  pres_max_exit_hours: 4,
  pres_max_late: 1,
  pres_max_half_abs: 1,
  pres_max_full_abs: 0,

  pin: "1234",
};

const GRADE_LABELS = {
  3: "Puntualidad",
  2: "Presentismo",
  1: "Medio presentismo",
  0: "Sin presentismo",
};
const GRADE_KEYS = { 3: "puntualidad", 2: "presentismo", 1: "medio", 0: "ninguno" };

function mergeSettings(stored) {
  return { ...DEFAULT_SETTINGS, ...(stored || {}) };
}

function timeToMin(hhmm) {
  const [h, m] = String(hhmm).split(":").map(Number);
  return h * 60 + (m || 0);
}

module.exports = { DEFAULT_SETTINGS, GRADE_LABELS, GRADE_KEYS, mergeSettings, timeToMin };
