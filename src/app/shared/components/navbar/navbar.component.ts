import { Component, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { 
  faGavel, 
  faBookOpen, 
  faUser, 
  faBars, 
  faTimes 
} from '@fortawesome/free-solid-svg-icons';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';
import { ThemeService } from '../../../core/services/theme.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterModule, FontAwesomeModule, ThemeToggleComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  private themeService = inject(ThemeService);
  private authService = inject(AuthService);
  
  // Iconos
  faGavel = faGavel;
  faBookOpen = faBookOpen;
  faUser = faUser;
  faBars = faBars;
  faTimes = faTimes;
  
  // Estado del componente
  isMenuOpen = false;
  isScrolled = false;
  
  // Enlaces de navegación
  navLinks = [
    { title: 'Inicio', path: '/' },
    { title: 'Especialidades', path: '/especialidades' },
    { title: 'Exámenes', path: '/examenes' },
    { title: 'Planes', path: '/planes' },
    { title: 'Nosotros', path: '/nosotros' },
    { title: 'Contacto', path: '/contacto' }
  ];
  
  @HostListener('window:scroll', [])
  onWindowScroll() {
    // Cambiar apariencia del navbar al hacer scroll
    this.isScrolled = window.scrollY > 20;
  }
  
  // Verificar si el usuario está autenticado
  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }
  
  // Alternar menú móvil
  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }
  
  // Cerrar menú móvil
  closeMenu() {
    this.isMenuOpen = false;
  }
}