import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

/**
 * Interceptor para agregar tokens de autenticación a las peticiones HTTP
 * y manejar errores de token expirado mediante refresh
 */
@Injectable({
  providedIn: 'root'
})
export class AuthInterceptorService implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  
  constructor(private authService: AuthService) {}
  
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Verificar si la petición es para la API
    if (!req.url.includes(this.authService['API_URL'])) {
      return next.handle(req);
    }
    
    // No agregar token a peticiones de login, registro o refresh
    if (
      req.url.includes('/login') || 
      req.url.includes('/register') || 
      req.url.includes('/refresh')
    ) {
      return next.handle(req);
    }
    
    // Agregar token de autenticación a la petición
    const token = this.authService.getToken();
    
    if (token) {
      req = this.addTokenToRequest(req, token);
    }
    
    // Manejar la respuesta
    return next.handle(req).pipe(
      catchError(error => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          return this.handle401Error(req, next);
        }
        return throwError(() => error);
      })
    );
  }
  
  /**
   * Agrega el token a la cabecera de autorización
   */
  private addTokenToRequest(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  
  /**
   * Maneja errores 401 (Unauthorized) intentando refrescar el token
   */
  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);
      
      return this.authService.refreshToken().pipe(
        switchMap(response => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(response.accessToken);
          
          // Reintentar la petición original con el nuevo token
          return next.handle(this.addTokenToRequest(request, response.accessToken));
        }),
        catchError(error => {
          this.isRefreshing = false;
          
          // Si el refresh falla, forzar logout
          this.authService.logout();
          return throwError(() => error);
        })
      );
    } else {
      // Esperar a que termine el proceso de refresh en curso
      return this.refreshTokenSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap(token => next.handle(this.addTokenToRequest(request, token)))
      );
    }
  }
}