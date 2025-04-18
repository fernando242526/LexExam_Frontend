import { Injectable } from '@angular/core';
import { 
  CanActivate, 
  CanActivateChild, 
  CanMatch,
  Route,
  UrlSegment,
  ActivatedRouteSnapshot, 
  RouterStateSnapshot, 
  Router 
} from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild, CanMatch {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}
  
  /**
   * Verifica si el usuario puede activar una ruta
   */
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    return this.checkAuth(route.data['roles'], state.url);
  }
  
  /**
   * Verifica si el usuario puede activar rutas hijas
   */
  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    return this.canActivate(childRoute, state);
  }
  
  /**
   * Verifica si la ruta coincide con las condiciones (reemplaza a canLoad)
   */
  canMatch(route: Route, segments: UrlSegment[]): boolean {
    const url = `/${segments.map(s => s.path).join('/')}`;
    return this.checkAuth(route.data?.['roles'], url);
  }
  
  /**
   * Método común para verificar autenticación y roles
   */
  private checkAuth(requiredRoles?: string[], url?: string): boolean {
    // Verificar autenticación
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login'], { 
        queryParams: url ? { returnUrl: url } : {} 
      });
      return false;
    }
    
    // Verificar roles si están definidos
    if (requiredRoles && requiredRoles.length > 0) {
      const hasRequiredRole = requiredRoles.some(role => 
        this.authService.hasRole(role)
      );
      
      if (!hasRequiredRole) {
        // Redirigir según el rol actual
        const currentUser = this.authService.getCurrentUser();
        if (currentUser?.rol === 'administrador') {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.router.navigate(['/user/dashboard']);
        }
        return false;
      }
    }
    
    return true;
  }
}