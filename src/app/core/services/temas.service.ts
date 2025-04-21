import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse, PaginatedResponse } from '../models/api-response.model';
import { Tema, TemaSelect } from '../models/tema.model';

@Injectable({
  providedIn: 'root'
})
export class TemasService {
  private apiUrl = `${environment.apiUrl}/temas`;
  
  constructor(private http: HttpClient) {}
  
  /**
   * Obtiene listado de temas con paginación y filtros
   */
  getTemas(
    page: number = 1, 
    limit: number = 10, 
    titulo?: string, 
    balotarioId?: string,
    activo?: boolean,
    sortBy: string = 'orden',
    order: 'ASC' | 'DESC' = 'ASC'
  ): Observable<PaginatedResponse<Tema>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('sortBy', sortBy)
      .set('order', order);
      
    if (titulo) {
      params = params.set('titulo', titulo);
    }
    
    if (balotarioId) {
      params = params.set('balotarioId', balotarioId);
    }
    
    if (activo !== undefined) {
      params = params.set('activo', activo.toString());
    }
    
    return this.http.get<PaginatedResponse<Tema>>(this.apiUrl, { params });
  }
  
  /**
   * Obtiene temas para select (sin paginación)
   */
  getTemasForSelect(balotarioId?: string): Observable<TemaSelect[]> {
    let params = new HttpParams();
    
    if (balotarioId) {
      params = params.set('balotarioId', balotarioId);
    }
    
    return this.http.get<ApiResponse<TemaSelect[]>>(`${this.apiUrl}/select`, { params })
    .pipe(
      map(response => response.data)
    );
  }
  
  /**
   * Obtiene un tema por su ID
   */
  getTema(id: string): Observable<Tema> {
    return this.http.get<ApiResponse<Tema>>(
      `${this.apiUrl}/${id}`
    ).pipe(
      map(response => response.data)
    );
  }
  
  /**
   * Crea un nuevo tema
   */
  createTema(tema: Partial<Tema>): Observable<Tema> {
    return this.http.post<Tema>(this.apiUrl, tema);
  }
  
  /**
   * Actualiza un tema existente
   */
  updateTema(id: string, tema: Partial<Tema>): Observable<Tema> {
    return this.http.patch<Tema>(`${this.apiUrl}/${id}`, tema);
  }
  
  /**
   * Elimina un tema
   */
  deleteTema(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}