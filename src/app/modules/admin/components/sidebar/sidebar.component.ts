import { Component, inject } from '@angular/core';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faGavel,
  faBookOpen,
  faListAlt,
  faQuestionCircle,
  faUsers,
  faChartBar,
  faTachometerAlt,
  faSignOutAlt,
  faMoon,
  faSun,
} from '@fortawesome/free-solid-svg-icons';
import { ThemeService } from '../../../../core/services/theme.service';
import { filter } from 'rxjs';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';

/**
 * Componente de sidebar para el panel de administración.
 * Proporciona navegación entre las diferentes secciones administrativas.
 */
@Component({
  selector: 'app-sidebar',
  imports: [RouterModule, FontAwesomeModule, CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  // Inyección de servicios
  private router = inject(Router);
  private authService = inject(AuthService);
  public themeService = inject(ThemeService);

  // Íconos de FontAwesome
  dashboard = faTachometerAlt;
  especialidades = faGavel;
  balotarios = faBookOpen;
  temas = faListAlt;
  preguntas = faQuestionCircle;
  usuarios = faUsers;
  reportes = faChartBar;
  logout = faSignOutAlt;
  moon = faMoon;
  sun = faSun;

  // Ruta activa actual
  currentRoute = '';

  // Menú de navegación
  navItems = [
    {
      title: 'Dashboard',
      route: '/admin/dashboard',
      icon: this.dashboard,
    },
    {
      title: 'Especialidades',
      route: '/admin/especialidades',
      icon: this.especialidades,
    },
    {
      title: 'Balotarios',
      route: '/admin/balotarios',
      icon: this.balotarios,
    },
    {
      title: 'Temas',
      route: '/admin/temas',
      icon: this.temas,
    },
    {
      title: 'Preguntas',
      route: '/admin/preguntas',
      icon: this.preguntas,
    },
    {
      title: 'Usuarios',
      route: '/admin/usuarios',
      icon: this.usuarios,
    },
    {
      title: 'Reportes',
      route: '/admin/reportes',
      icon: this.reportes,
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
