// src/app/modules/admin/preguntas/services/preguntas.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  Pregunta, 
  NivelDificultad, 
  CreatePreguntaDto 
} from '../models/pregunta.model';
import { environment } from '../../environments/environment';
import { PaginatedResponse } from '../models/api-response.model';

/**
 * Servicio para gestionar las operaciones CRUD de preguntas
 */
@Injectable({
  providedIn: 'root'
})
export class PreguntasService {
  private apiUrl = `${environment.apiUrl}/preguntas`;
  
  constructor(private http: HttpClient) {}
  
  /**
   * Obtiene listado de preguntas con paginación y filtros
   */
  getPreguntas(
    page: number = 1, 
    limit: number = 10, 
    texto?: string, 
    temaId?: string,
    nivelDificultad?: NivelDificultad,
    activo?: boolean,
    sortBy: string = 'createdAt',
    order: 'ASC' | 'DESC' = 'DESC'
  ): Observable<PaginatedResponse<Pregunta>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('sortBy', sortBy)
      .set('order', order);
      
    if (texto) {
      params = params.set('texto', texto);
    }
    
    if (temaId) {
      params = params.set('temaId', temaId);
    }
    
    if (nivelDificultad) {
      params = params.set('nivelDificultad', nivelDificultad);
    }
    
    if (activo !== undefined) {
      params = params.set('activo', activo.toString());
    }
    
    return this.http.get<PaginatedResponse<Pregunta>>(this.apiUrl, { params });
  }
  
  /**
   * Obtiene una pregunta por su ID
   */
  getPregunta(id: string): Observable<Pregunta> {
    return this.http.get<Pregunta>(`${this.apiUrl}/${id}`);
  }
  
  /**
   * Crea una pregunta
   */
  createPregunta(createPreguntaDto: CreatePreguntaDto): Observable<Pregunta> {
    return this.http.post<Pregunta>(this.apiUrl, createPreguntaDto);
  }
  
  /**
   * Crea múltiples preguntas para un tema
   */
  createPreguntasMasivas(
    temaId: string,
    preguntas: CreatePreguntaDto[]
  ): Observable<{ total: number; creadas: number; mensaje: string }> {
    return this.http.post<{ total: number; creadas: number; mensaje: string }>(
      `${this.apiUrl}/masivo`,
      {
        temaId,
        preguntas
      }
    );
  }

  /**
   * Actualiza una pregunta existente
   */
  updatePregunta(id: string, updatePreguntaDto: Partial<CreatePreguntaDto>): Observable<Pregunta> {
    return this.http.patch<Pregunta>(`${this.apiUrl}/${id}`, updatePreguntaDto);
  }
  
  /**
   * Elimina una pregunta
   */
  deletePregunta(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}