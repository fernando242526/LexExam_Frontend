/**
 * Modelo para la entidad Tema
 */
export interface Tema {
  /** ID único del tema */
  id: string;
  
  /** Título del tema */
  titulo: string;
  
  /** Descripción detallada del tema (opcional) */
  descripcion: string | null;
  
  /** Orden del tema dentro del balotario */
  orden: number;
  
  /** Balotario al que pertenece el tema */
  balotario?: {
    id: string;
    nombre: string;
    especialidad?: {
        id: string,
        nombre: string
    }
  };
  
  /** Indica si el tema está activo */
  activo: boolean;
  
  /** Fecha de creación del registro */
  createdAt: Date;
  
  /** Fecha de última actualización del registro */
  updatedAt: Date;
}

/**
 * Modelo simplificado para selects de temas
 */
export interface TemaSelect {
  /** ID único del tema */
  id: string;
  
  /** Título del tema */
  titulo: string;
  
  /** Balotario al que pertenece */
  balotario: {
    id: string;
    nombre: string;
  };
}