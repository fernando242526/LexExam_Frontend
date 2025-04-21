/**
 * Modelo para la entidad Tema
 */
export interface Tema {
  id: string;
  titulo: string;
  descripcion: string | null;
  orden: number;
  balotario?: {
    id: string;
    nombre: string;
    especialidad?: {
        id: string,
        nombre: string
    }
  };
  
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Modelo simplificado para selects de temas
 */
export interface TemaSelect {
  id: string;
  titulo: string;
  
  /** Balotario al que pertenece */
  balotario: {
    id: string;
    nombre: string;
  };
}