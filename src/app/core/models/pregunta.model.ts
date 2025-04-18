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

//