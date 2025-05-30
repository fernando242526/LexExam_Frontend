import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

/**
 * Modelo para la respuesta de autenticación
 */
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  id: string;
  username: string;
  email: string;
  nombreCompleto: string;
  rol: string;
  expiresAt: Date;
}

/**
 * Modelo para el usuario autenticado
 */
export interface User {
  id: string;
  username: string;
  email: string;
  nombreCompleto: string;
  rol: string;
  expiresAt?: Date;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly API_URL = `${environment.apiUrl}`;
  private readonly TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'user';

  // Subject para manejar el estado de autenticación
  private currentUserSubject = new BehaviorSubject<User | null>(
    this.getUserFromStorage()
  );
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  /**
   * Inicia sesión con email y contraseña
   */
  login(username: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<{ data: AuthResponse }>(`${this.API_URL}/auth/login`, {
        username,
        password,
      })
      .pipe(
        map((response) => response.data), // Extraer el objeto data de la respuesta
        tap((authData) => this.handleAuthentication(authData)),
        catchError((error) => this.handleError(error))
      );
  }

  /**
   * Cierra la sesión del usuario
   */
  logout(): Observable<{ success: boolean }> {
    const refreshToken = this.getRefreshToken();

    // Si no hay refresh token, simplemente limpiamos localmente
    if (!refreshToken) {
      this.clearAuthData();
      this.router.navigate(['/auth/login']);
      return new Observable((observer) => {
        observer.next({ success: true });
        observer.complete();
      });
    }

    // Si hay refresh token, lo revocamos en el servidor
    return this.http
      .post<{ success: boolean }>(`${this.API_URL}/auth/logout`, {
        refreshToken,
      })
      .pipe(
        tap(() => {
          this.clearAuthData();
          this.router.navigate(['/auth/login']);
        }),
        catchError((error) => {
          // Incluso si hay error, limpiamos localmente
          this.clearAuthData();
          this.router.navigate(['/auth/login']);
          return this.handleError(error);
        })
      );
  }

  /**
   * Actualiza el token usando el refresh token
   */
  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      return throwError(() => new Error('No hay refresh token disponible'));
    }

    return this.http
      .post<AuthResponse>(`${this.API_URL}/auth/refresh`, { refreshToken })
      .pipe(
        tap((response) => this.handleAuthentication(response)),
        catchError((error) => this.handleError(error))
      );
  }

  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token;
  }

  /**
   * Verifica si el usuario tiene un rol específico
   */
  hasRole(role: string): boolean {
    const user = this.currentUserSubject.value;
    return user?.rol === role;
  }

  /**
   * Obtiene el token actual
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Obtiene el refresh token actual
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Obtiene el usuario actual
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Maneja la respuesta de autenticación exitosa
   */
  private handleAuthentication(response: AuthResponse): void {
    // Guardar tokens
    localStorage.setItem(this.TOKEN_KEY, response.accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, response.refreshToken);

    // Crear y guardar usuario
    const user: User = {
      id: response.id,
      username: response.username,
      email: response.email,
      nombreCompleto: response.nombreCompleto,
      rol: response.rol,
      expiresAt: response.expiresAt,
    };

    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  /**
   * Limpia los datos de autenticación
   */
  private clearAuthData(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
  }

  /**
   * Obtiene el usuario desde el localStorage
   */
  private getUserFromStorage(): User | null {
    const userJson = localStorage.getItem(this.USER_KEY);
    if (!userJson) {
      return null;
    }

    try {
      return JSON.parse(userJson) as User;
    } catch (error) {
      console.error('Error al parsear usuario desde localStorage', error);
      return null;
    }
  }

  isTokenExpired(): boolean {
    const user = this.getCurrentUser();
    if (!user || !user.expiresAt) return true;

    return new Date() > new Date(user.expiresAt);
  }

  /**
   * Maneja los errores HTTP
   */
  private handleError(error: any): Observable<never> {
    let errorMessage = 'Ha ocurrido un error desconocido';

    if (error.error instanceof ErrorEvent) {
      // Error del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del servidor
      errorMessage = `Código: ${error.status}, Mensaje: ${error.message}`;
    }

    console.error(errorMessage);
    return throwError(() => error);
  }

  /**
   * Envía una solicitud para restablecer la contraseña
   * @param email Correo electrónico del usuario
   */
  forgotPassword(
    email: string
  ): Observable<{ success: boolean; message: string }> {
    return this.http
      .post<{ success: boolean; message: string }>(
        `${this.API_URL}/auth/forgot-password`,
        { email }
      )
      .pipe(catchError((error) => this.handleError(error)));
  }

  /**
   * Verifica si un token de restablecimiento es válido
   * @param token Token de restablecimiento
   */
  verifyResetToken(
    token: string
  ): Observable<{ data: { valid: boolean; message: string } }> {
    console.log(token);
    console.log(`${this.API_URL}/auth/verify-reset-token/${token}`);
    
    return this.http
      .get<{ data: { valid: boolean; message: string } }>(`${this.API_URL}/auth/verify-reset-token/${token}`)
      .pipe(catchError((error) => this.handleError(error)));
  }

  /**
   * Restablece la contraseña con un token válido
   * @param token Token de restablecimiento
   * @param password Nueva contraseña
   */
  resetPassword(
    token: string,
    password: string
  ): Observable<{ data: { success: boolean; message: string } }> {
    return this.http
      .post<{ data: { success: boolean; message: string } }>(
        `${this.API_URL}/auth/reset-password`,
        { token, password }
      )
      .pipe(catchError((error) => this.handleError(error)));
  }
}