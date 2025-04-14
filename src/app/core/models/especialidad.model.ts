// src/app/features/admin/especialidades/models/especialidad.model.ts

/**
 * Modelo para la entidad Especialidad
 */
export interface Especialidad {
    /** ID único de la especialidad */
    id: string;
    
    /** Nombre de la especialidad */
    nombre: string;
    
    /** Descripción detallada de la especialidad (opcional) */
    descripcion: string | null;
    
    /** Indica si la especialidad está activa */
    activo: boolean;
    
    /** Fecha de creación del registro */
    createdAt: Date;
    
    /** Fecha de última actualización del registro */
    updatedAt: Date;
  }
  
  /**
   * Modelo simplificado para selects de especialidades
   */
  export interface EspecialidadSelect {
    /** ID único de la especialidad */
    id: string;
    
    /** Nombre de la especialidad */
    nombre: string;
  }