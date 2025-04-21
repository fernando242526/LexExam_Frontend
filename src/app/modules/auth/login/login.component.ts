import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { faEnvelope, faLock, faUser, faEye, faEyeSlash, faMoon, faSun } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FontAwesomeModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export default class LoginComponent {

  // Inyección de servicios
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  public themeService = inject(ThemeService);
  
  // Iconos
  faEnvelope = faEnvelope;
  faLock = faLock;
  faUser = faUser;
  faEye = faEye;
  faEyeSlash = faEyeSlash;
  moon = faMoon;
  sun = faSun;
  
  // Estado del formulario
  loginForm: FormGroup;
  isSubmitting = false;
  loginError = '';
  showPassword = false;
  
  constructor() {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }
  
  /**
   * Maneja el envío del formulario de inicio de sesión
   */
  onSubmit() {
    if (this.loginForm.invalid || this.isSubmitting) {
      return;
    }
    
    this.isSubmitting = true;
    this.loginError = '';
    
    const { username, password } = this.loginForm.value;
    
    this.authService.login(username, password).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        // Redireccionar según el rol
        if (response.rol === 'administrador') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/user']);
        }
      },
      error: (error) => {
        this.isSubmitting = false;
        // Manejar distintos tipos de errores
        if (error.status === 401) {
          this.loginError = 'Credenciales inválidas. Por favor, verifica tu nombre de usuario y contraseña.';
        } else if (error.status === 403) {
          this.loginError = 'Tu cuenta ha sido desactivada. Contacta al administrador.';
        } else {
          this.loginError = 'Error al iniciar sesión. Por favor, intenta de nuevo más tarde.';
        }
      }
    });
  }
  
  /**
   * Alterna la visibilidad de la contraseña
   */
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

}