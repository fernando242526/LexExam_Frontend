import { Component } from '@angular/core';
import { ThemeService } from '../../../core/services/theme.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-theme-toggle',
  imports: [FontAwesomeModule],
  templateUrl: './theme-toggle.component.html',
  styleUrl: './theme-toggle.component.scss'
})
export class ThemeToggleComponent {
  faSun = faSun;
  faMoon = faMoon;

  constructor(public themeService: ThemeService) {}
  
  /**
   * Llama al servicio para alternar el tema
   */
  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

}