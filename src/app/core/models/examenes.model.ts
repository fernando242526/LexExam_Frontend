import { TemaSelect } from '../../core/models/tema.model';

export enum EstadoExamen {
  PENDIENTE = 'pendiente',
  INICIADO = 'iniciado',
  FINALIZADO = 'finalizado',
  CADUCADO = 'caducado'
}

export interface Examen {
  id: string;
  titulo: string;
  duracionMinutos: number;
  numeroPreguntas: number;
  fechaInicio: Date | null;
  fechaFin: Date | null;
  estado: EstadoExamen;
  tema?: TemaSelect;
  temaId: string;
  usuarioId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PreguntaExamen {
  id: string;
  texto: string;
  respuestas: RespuestaExamen[];
}

export interface RespuestaExamen {
  id: string;
  texto: string;
}

export interface CrearExamenDto {
  temaId: string;
  duracionMinutos: number;
  numeroPreguntas: number;
}

export interface IniciarExamenDto {
  examenId: string;
}

export interface ExamenConPreguntas extends Examen {
  preguntas: PreguntaExamen[];
}

export interface RespuestaUsuarioDto {
  preguntaId: string;
  respuestaId: string;
}

export interface EnviarRespuestasDto {
  examenId: string;
  respuestas: RespuestaUsuarioDto[];
}

export interface ResultadoExamen {
  id: string;
  puntuacionTotal: number;
  preguntasAcertadas: number;
  totalPreguntas: number;
  porcentajeAcierto: number;
  duracionReal: number;
  fechaInicio: Date;
  fechaFin: Date;
  examen?: Examen;
  examenId: string;
  usuarioId: string;
  respuestasUsuario?: RespuestaUsuarioDetalle[];
  createdAt: Date;
  updatedAt: Date;
}

export interface RespuestaUsuarioDetalle {
  id: string;
  esCorrecta: boolean;
  tiempoRespuesta: number | null;
  pregunta?: any; // Se puede detallar más si es necesario
  preguntaId: string;
  respuesta?: any | null; // Se puede detallar más si es necesario
  respuestaId: string;
  resultadoExamenId: string;
}

export interface EstadoExamenDto {
  examenId: string;
  estado: EstadoExamen;
  tiempoRestante: number | null;
  tiempoTotal: number;
  porcentajeCompletado: number;
}

export interface FiltroExamen {
  page?: number;
  limit?: number;
  temaId?: string;
  estado?: EstadoExamen;
  fechaDesde?: string;
  fechaHasta?: string;
  sortBy?: string;
  order?: 'ASC' | 'DESC';
}

// Interfaz para las respuestas previas
export interface RespuestaPreviaDto {
  preguntaId: string;
  respuestaId: string | null;
}

export interface ExamenContinuacion extends ExamenConPreguntas {
  respuestasPrevias?: RespuestaPreviaDto[];
}

export interface GuardarRespuestasParcialesDto {
  examenId: string;
  respuestas: RespuestaUsuarioDto[];
}