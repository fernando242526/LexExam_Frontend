import { Component, inject } from '@angular/core';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faTachometerAlt,
  faSignOutAlt,
  faMoon,
  faSun,
  faFileLines
} from '@fortawesome/free-solid-svg-icons';
import { ThemeService } from '../../../../core/services/theme.service';
import { filter } from 'rxjs';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  imports: [RouterModule, FontAwesomeModule, CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {

  // Inyección de servicios
  private router = inject(Router);
  private authService = inject(AuthService);
  public themeService = inject(ThemeService);

  // Íconos de FontAwesome
  dashboard = faTachometerAlt;
  examanes = faFileLines;
  logout = faSignOutAlt;
  moon = faMoon;
  sun = faSun;

  // Ruta activa actual
  currentRoute = '';

  // Menú de navegación
  navItems = [
    {
      title: 'Dashboard',
      route: '/user/dashboard',
      icon: this.dashboard,
    },
    {
      title: 'Examenes',
      route: '/user/examenes',
      icon: this.examanes,
    },
  ];

  constructor() {
    // Suscripción para detectar cambios en la ruta activa
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentRoute = event.urlAfterRedirects;
      });
  }

  /**
   * Verifica si una ruta está activa
   * @param route Ruta a verificar
   * @returns Verdadero si la ruta está activa
   */
  isActive(route: string): boolean {
    return this.currentRoute.startsWith(route);
  }

  /**
   * Cierra la sesión del usuario
   */
  onLogout(): void {
    // Implementar lógica de logout
    console.log('Logout clicked');
    this.authService.logout().subscribe({
      next: () => {
        // La navegación ya se maneja dentro del servicio, no necesitas hacerlo aquí
        console.log('Logout completado correctamente');
      },
      error: (error) => {
        console.error('Error al cerrar sesión:', error);
        // Aún así navegamos al login en caso de error
        this.router.navigate(['/auth/login']);
      },
    });
  }
}