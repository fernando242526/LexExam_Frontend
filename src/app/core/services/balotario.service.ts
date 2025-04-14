// src/app/features/admin/balotarios/services/balotarios.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Balotario, BalotarioSelect } from '../models/balotario.model';
import { environment } from '../../environments/environment';
import { ApiResponse, PaginatedResponse } from '../models/api-response.model';

/**
 * Servicio para gestionar las operaciones CRUD de balotarios
 */
@Injectable({
  providedIn: 'root'
})
export class BalotariosService {
  private apiUrl = `${environment.apiUrl}/balotarios`;
  
  constructor(private http: HttpClient) {}
  
  /**
   * Obtiene listado de balotarios con paginación y filtros
   */
  getBalotarios(
    page: number = 1, 
    limit: number = 10, 
    nombre?: string, 
    institucion?: string,
    anio?: number,
    especialidadId?: string,
    activo?: boolean,
    sortBy: string = 'nombre',
    order: 'ASC' | 'DESC' = 'ASC'
  ): Observable<PaginatedResponse<Balotario>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('sortBy', sortBy)
      .set('order', order);
      
    if (nombre) {
      params = params.set('nombre', nombre);
    }
    
    if (institucion) {
      params = params.set('institucion', institucion);
    }
    
    if (anio !== undefined) {
      params = params.set('anio', anio.toString());
    }
    
    if (especialidadId) {
      params = params.set('especialidadId', especialidadId);
    }
    
    if (activo !== undefined) {
      params = params.set('activo', activo.toString());
    }
    
    return this.http.get<PaginatedResponse<Balotario>>(this.apiUrl, { params });
  }
  
  /**
   * Obtiene balotarios para select (sin paginación)
   */
  getBalotariosForSelect(especialidadId?: string): Observable<BalotarioSelect[]> {
    let params = new HttpParams();
    
    if (especialidadId) {
      params = params.set('especialidadId', especialidadId);
    }
    
    return this.http.get<ApiResponse<BalotarioSelect[]>>(`${this.apiUrl}/select`, { params })
    .pipe(
      map(response => response.data)
    );
  }
  
  /**
   * Obtiene un balotario por su ID
   */
  getBalotario(id: string): Observable<Balotario> {
    return this.http.get<{ data: Balotario }>(
      `${this.apiUrl}/${id}`
    ).pipe(
      map(response => response.data)
    );
  }
  
  /**
   * Crea un nuevo balotario
   */
  createBalotario(balotario: Partial<Balotario>): Observable<Balotario> {
    return this.http.post<Balotario>(this.apiUrl, balotario);
  }
  
  /**
   * Actualiza un balotario existente
   */
  updateBalotario(id: string, balotario: Partial<Balotario>): Observable<Balotario> {
    return this.http.patch<Balotario>(`${this.apiUrl}/${id}`, balotario);
  }
  
  /**
   * Elimina un balotario
   */
  deleteBalotario(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}