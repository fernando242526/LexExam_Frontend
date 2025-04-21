import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, PaginatedResponse } from '../models/api-response.model';
import { environment } from '../../environments/environment';
import { RolUsuario } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private apiUrl = `${environment.apiUrl}/usuarios`;
  
  constructor(private http: HttpClient) {}
  
  /**
   * Obtiene listado de usuarios con paginación y filtros
   */
  getUsuarios(
    page: number = 1, 
    limit: number = 10, 
    search?: string, 
    rol?: RolUsuario,
    activo?: boolean
  ): Observable<PaginatedResponse<any>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
      
    if (search) {
      params = params.set('search', search);
    }
    
    if (rol) {
      params = params.set('rol', rol);
    }
    
    if (activo !== undefined) {
      params = params.set('activo', activo.toString());
    }
    
    return this.http.get<PaginatedResponse<any>>(this.apiUrl, { params });
  }
  
  /**
   * Obtiene un usuario por su ID
   */
  getUsuario(id: string): Observable<any> {
    return this.http.get<ApiResponse<any>>(
      `${this.apiUrl}/${id}`
    );
  }
  
  /**
   * Crea un nuevo usuario
   */
  createUsuario(usuario: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/auth/register`, usuario);
  }
  
  /**
   * Actualiza un usuario existente
   */
  updateUsuario(id: string, usuario: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}`, usuario);
  }
  
  /**
   * Cambia el estado activo/inactivo de un usuario
   */
  toggleActivo(id: string, activo: boolean): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/activo?activo=${activo}`, {});
  }
  
  /**
   * Cambia el rol de un usuario
   */
  changeRol(id: string, rol: RolUsuario): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/rol?rol=${rol}`, {});
  }
}