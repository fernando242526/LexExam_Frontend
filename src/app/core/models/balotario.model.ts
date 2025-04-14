// src/app/features/admin/balotarios/models/balotario.model.ts

import { EspecialidadSelect } from "./especialidad.model";


/**
 * Modelo para la entidad Balotario
 */
export interface Balotario {
  /** ID único del balotario */
  id: string;
  
  /** Nombre del balotario */
  nombre: string;
  
  /** Descripción detallada del balotario (opcional) */
  descripcion: string | null;
  
  /** Año del balotario */
  anio: number | null;
  
  /** Institución del balotario */
  institucion: string | null;
  
  /** Especialidad a la que pertenece el balotario */
  especialidad?: EspecialidadSelect;
  
  /** Indica si el balotario está activo */
  activo: boolean;
  
  /** Fecha de creación del registro */
  createdAt: Date;
  
  /** Fecha de última actualización del registro */
  updatedAt: Date;
}

/**
 * Modelo simplificado para selects de balotarios
 */
export interface BalotarioSelect {
  /** ID único del balotario */
  id: string;
  
  /** Nombre del balotario */
  nombre: string;
  
  /** ID de la especialidad */
  especialidadId: string;
}