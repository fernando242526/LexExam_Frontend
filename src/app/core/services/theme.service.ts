import { Injectable, signal, computed, effect, RendererFactory2, Renderer2 } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  /** Signal que almacena el estado del tema actual */
  private isDarkMode = signal<boolean>(this.getInitialThemeState());
  
  /** Signal computado que expone si el tema actual es oscuro */
  public isDarkMode$ = computed(() => this.isDarkMode());
  
  /** Signal computado que devuelve el nombre del tema actual */
  public currentTheme$ = computed(() => this.isDarkMode() ? 'dark' : 'light');

  private renderer: Renderer2;

  constructor(private rendererFactory: RendererFactory2) {
    // Generar instancia de Renderer2 desde el factory
    this.renderer = rendererFactory.createRenderer(null, null);
    // Efecto para actualizar el DOM y localStorage cuando cambia el tema
    effect(() => {
      const isDark = this.isDarkMode();
      
      // Actualizar la clase en el elemento HTML
      if (isDark) {
        this.renderer.addClass(document.documentElement, 'dark');
      } else {
        this.renderer.removeClass(document.documentElement, 'dark');
      }
      
      // Guardar preferencia en localStorage
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
  }

  /**
   * Determina el estado inicial del tema basado en la preferencia guardada
   * o las preferencias del sistema del usuario
   * @returns boolean - true si el tema inicial debe ser oscuro
   */
  private getInitialThemeState(): boolean {
    // Revisar localStorage para preferencia guardada
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    
    // Si no hay preferencia guardada, usar preferencia del sistema
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  /**
   * Alterna entre los modos claro y oscuro
   */
  public toggleTheme(): void {
    this.isDarkMode.update(current => !current);
  }

  /**
   * Establece un tema específico
   * @param isDark - true para tema oscuro, false para tema claro
   */
  public setTheme(isDark: boolean): void {
    this.isDarkMode.set(isDark);
  }
}