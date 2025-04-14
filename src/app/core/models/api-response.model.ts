// src/app/core/models/api-response.model.ts

/**
 * Información de paginación para respuestas paginadas
 */
export interface PaginationMeta {
  /** Página actual */
  currentPage: number;

  /** Elementos por página */
  itemsPerPage: number;

  /** Total de elementos */
  totalItems: number;

  /** Total de páginas */
  totalPages: number;

  /** Indica si hay página anterior */
  hasPreviousPage: boolean;

  /** Indica si hay página siguiente */
  hasNextPage: boolean;

  /** Marca de tiempo de la respuesta */
  timestamp?: string;
}

/**
 * Respuesta paginada de la API
 */
export interface PaginatedResponse<T> {
  /** Datos paginados */
  data: T[];

  /** Metadatos de paginación */
  meta: PaginationMeta;
}

/**
 * Respuesta base de la API
 */
export interface ApiResponse<T> {
  /** Datos de la respuesta */
  data: T;

  /** Metadatos (opcional) */
  meta?: {
    /** Marca de tiempo de la respuesta */
    timestamp: string;

    /** Información adicional (opcional) */
    [key: string]: any;
  };
}

/**
 * Respuesta de error de la API
 */
export interface ApiErrorResponse {
  /** Código de estado HTTP */
  statusCode: number;

  /** Marca de tiempo del error */
  timestamp: string;

  /** Ruta que generó el error */
  path: string;

  /** Método HTTP */
  method: string;

  /** Mensaje de error */
  message: string | null;

  /** Tipo de error */
  error: string;
}
