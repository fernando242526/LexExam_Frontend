import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { CrearExamenDto, EnviarRespuestasDto, EstadoExamenDto, Examen, ExamenConPreguntas, FiltroExamen, IniciarExamenDto, ResultadoExamen } from '../models/examenes.model';
import { ApiResponse, PaginatedResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class ExamenesService {
  private apiUrl = `${environment.apiUrl}/examenes`;
  
  constructor(private http: HttpClient) {}
  
  /**
   * Obtiene un listado de exámenes con filtros y paginación
   */
  getExamenes(filtros: FiltroExamen = {}): Observable<PaginatedResponse<Examen>> {
    let params = new HttpParams()
      .set('page', filtros.page?.toString() || '1')
      .set('limit', filtros.limit?.toString() || '10');
      
    if (filtros.temaId) {
      params = params.set('temaId', filtros.temaId);
    }
    
    if (filtros.estado) {
      params = params.set('estado', filtros.estado);
    }
    
    if (filtros.fechaDesde) {
      params = params.set('fechaDesde', filtros.fechaDesde);
    }
    
    if (filtros.fechaHasta) {
      params = params.set('fechaHasta', filtros.fechaHasta);
    }
    
    if (filtros.sortBy) {
      params = params.set('sortBy', filtros.sortBy);
    }
    
    if (filtros.order) {
      params = params.set('order', filtros.order);
    }
    
    return this.http.get<PaginatedResponse<Examen>>(this.apiUrl, { params });
  }
  
  /**
   * Obtiene un examen por su ID
   */
  getExamen(id: string): Observable<Examen> {
    return this.http.get<ApiResponse<Examen>>(`${this.apiUrl}/${id}`)
      .pipe(
        map(response => response.data)
      );
  }
  
  /**
   * Crea un nuevo examen
   */
  crearExamen(data: CrearExamenDto): Observable<Examen> {
    return this.http.post<ApiResponse<Examen>>(this.apiUrl, data)
      .pipe(
        map(response => response.data)
      );
  }
  
  /**
   * Inicia un examen y obtiene sus preguntas
   */
  iniciarExamen(data: IniciarExamenDto): Observable<ExamenConPreguntas> {
    return this.http.post<ApiResponse<ExamenConPreguntas>>(`${this.apiUrl}/iniciar`, data)
      .pipe(
        map(response => response.data)
      );
  }
  
  /**
   * Envía las respuestas del examen
   */
  enviarRespuestas(data: EnviarRespuestasDto): Observable<ResultadoExamen> {
    return this.http.post<ApiResponse<ResultadoExamen>>(`${this.apiUrl}/enviar-respuestas`, data)
      .pipe(
        map(response => response.data)
      );
  }
  
  /**
   * Obtiene el resultado de un examen
   */
  getResultadoExamen(examenId: string): Observable<ResultadoExamen> {
    return this.http.get<ApiResponse<ResultadoExamen>>(`${this.apiUrl}/${examenId}/resultado`)
      .pipe(
        map(response => response.data)
      );
  }
  
  /**
   * Obtiene el historial de resultados de exámenes
   */
  getHistorialResultados(filtros: FiltroExamen = {}): Observable<PaginatedResponse<ResultadoExamen>> {
    let params = new HttpParams()
      .set('page', filtros.page?.toString() || '1')
      .set('limit', filtros.limit?.toString() || '10');
      
    if (filtros.temaId) {
      params = params.set('temaId', filtros.temaId);
    }
    
    if (filtros.fechaDesde) {
      params = params.set('fechaDesde', filtros.fechaDesde);
    }
    
    if (filtros.fechaHasta) {
      params = params.set('fechaHasta', filtros.fechaHasta);
    }
    
    if (filtros.sortBy) {
      params = params.set('sortBy', filtros.sortBy);
    }
    
    if (filtros.order) {
      params = params.set('order', filtros.order);
    }
    
    return this.http.get<PaginatedResponse<ResultadoExamen>>(`${this.apiUrl}/resultados/historial`, { params });
  }
  
  /**
   * Verifica el estado de un examen (tiempo restante, estado)
   */
  verificarEstadoExamen(examenId: string): Observable<EstadoExamenDto> {
    return this.http.get<ApiResponse<EstadoExamenDto>>(`${this.apiUrl}/${examenId}/estado`)
      .pipe(
        map(response => response.data)
      );
  }
}