/**
 * Modelo para la entidad Especialidad
 */
export interface Especialidad {
  id: string;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Modelo simplificado para selects de especialidades
 */
export interface EspecialidadSelect {
  id: string;
  nombre: string;
}
