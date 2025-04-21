import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Especialidad } from '../models/especialidad.model';
import { environment } from '../../environments/environment';
import { ApiResponse, PaginatedResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class EspecialidadesService {
  private apiUrl = `${environment.apiUrl}/especialidades`;
  
  constructor(private http: HttpClient) {}
  
  /**
   * Obtiene listado de especialidades con paginación y filtros
   */
  getEspecialidades(
    page: number = 1, 
    limit: number = 10, 
    nombre?: string, 
    activo?: boolean
  ): Observable<PaginatedResponse<Especialidad>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
      
    if (nombre) {
      params = params.set('nombre', nombre);
    }
    
    if (activo !== undefined) {
      params = params.set('activo', activo.toString());
    }
    
    return this.http.get<PaginatedResponse<Especialidad>>(this.apiUrl, { params });
  }
  
  /**
   * Obtiene todas las especialidades para select (sin paginación)
   */
  getEspecialidadesForSelect(): Observable<Especialidad[]> {
    return this.http.get<ApiResponse<Especialidad[]>>(`${this.apiUrl}/select`)
    .pipe(
      map(response => response.data) // Extraer solo el objeto data
    );
  }
  
  /**
   * Obtiene una especialidad por su ID
   */
  getEspecialidad(id: string): Observable<Especialidad> {
    return this.http.get<ApiResponse<Especialidad>>(`${this.apiUrl}/${id}`)
    .pipe(
      map(response => response.data) // Extraer solo el objeto data
    );
  }
  
  /**
   * Crea una nueva especialidad
   */
  createEspecialidad(especialidad: Partial<Especialidad>): Observable<Especialidad> {
    return this.http.post<Especialidad>(this.apiUrl, especialidad);
  }
  
  /**
   * Actualiza una especialidad existente
   */
  updateEspecialidad(id: string, especialidad: Partial<Especialidad>): Observable<Especialidad> {
    return this.http.patch<Especialidad>(`${this.apiUrl}/${id}`, especialidad);
  }
  
  /**
   * Elimina una especialidad
   */
  deleteEspecialidad(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}