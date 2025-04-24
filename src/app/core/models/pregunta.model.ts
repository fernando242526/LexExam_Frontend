import { TemaSelect } from "./tema.model";

export enum NivelDificultad {
  FACIL = 'facil',
  MEDIO = 'medio',
  DIFICIL = 'dificil'
}

export interface Respuesta {
  id?: string;
  texto: string;
  esCorrecta: boolean;
}

export interface Pregunta {
  id: string;
  texto: string;
  explicacion: string | null;
  nivelDificultad: NivelDificultad;
  respuestas: Respuesta[];
  tema?: TemaSelect;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// DTO para crear preguntas
export interface CreatePreguntaDto {
  texto: string;
  explicacion?: string;
  nivelDificultad?: NivelDificultad;
  respuestas: CreateRespuestaDto[];
  activo?: boolean;
}

export interface CreateRespuestaDto {
  texto: string;
  esCorrecta: boolean;
}

/**
 * Modelo para el formulario de creación de respuestas
 */
export interface RespuestaFormModel {
  texto: string;
  esCorrecta: boolean;
}

/**
 * Modelo para el formulario de creación de preguntas
 */
export interface PreguntaFormModel {
  texto: string;
  explicacion: string;
  nivelDificultad: NivelDificultad;
  respuestas: RespuestaFormModel[];
}

/**
 * Modelo para el payload que se enviará al backend
 */
export interface CreatePreguntasMasivoPayload {
  temaId: string;
  preguntas: PreguntaFormModel[];
}