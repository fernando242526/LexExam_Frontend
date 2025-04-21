import { EspecialidadSelect } from "./especialidad.model";

/**
 * Modelo para la entidad Balotario
 */
export interface Balotario {
  id: string;
  nombre: string;
  descripcion: string | null;
  anio: number | null;
  institucion: string | null;
  especialidad?: EspecialidadSelect;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Modelo simplificado para selects de balotarios
 */
export interface BalotarioSelect {
  id: string;
  nombre: string;
  especialidadId: string;
}