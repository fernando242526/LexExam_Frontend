import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { ToastService } from '../../../core/services/toast.service';

import { faEnvelope, faMoon, faSun, faArrowLeft } from '@fortawesome/free-solid-svg-icons';


/**
 * Componente para la página de solicitud de restablecimiento de contraseña
 */
@Component({
  selector: 'app-forgot-password',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FontAwesomeModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export default class ForgotPasswordComponent {

  // Inyección de servicios
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  public themeService = inject(ThemeService);
  
  // Iconos
  faEnvelope = faEnvelope;
  faArrowLeft = faArrowLeft;
  moon = faMoon;
  sun = faSun;
  
  // Estado del formulario
  forgotPasswordForm: FormGroup;
  isSubmitting = false;
  requestError = '';
  requestSent = false;
  
  constructor() {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }
  
  /**
   * Maneja el envío del formulario de solicitud de restablecimiento
   */
  onSubmit() {
    if (this.forgotPasswordForm.invalid || this.isSubmitting) {
      // Marcar los campos como tocados para mostrar errores
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }
    
    this.isSubmitting = true;
    this.requestError = '';
    
    const { email } = this.forgotPasswordForm.value;
    
    this.authService.forgotPassword(email).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.requestSent = true;
        
        // No mostrar mensaje de éxito con el toast para no revelar si el correo existe
        // Ya que es mejor por seguridad no revelar esa información
      },
      error: (error) => {
        this.isSubmitting = false;
        
        if (error.status === 400) {
          this.requestError = 'Correo electrónico inválido. Por favor, verifica e intenta de nuevo.';
        } else {
          this.requestError = 'Error en la solicitud. Por favor, intenta más tarde.';
        }
      }
    });
  }
  
  /**
   * Navega de vuelta a la página de inicio de sesión
   */
  goToLogin() {
    this.router.navigate(['/auth/login']);
  }
}