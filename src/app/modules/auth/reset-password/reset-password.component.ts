import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { ToastService } from '../../../core/services/toast.service';
import { faKey, faEye, faEyeSlash, faMoon, faSun, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-reset-password',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FontAwesomeModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export default class ResetPasswordComponent implements OnInit {

  // Inyección de servicios
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  public themeService = inject(ThemeService);
  
  // Iconos
  faKey = faKey;
  faEye = faEye;
  faEyeSlash = faEyeSlash;
  faArrowLeft = faArrowLeft;
  moon = faMoon;
  sun = faSun;
  
  // Estado del componente
  resetPasswordForm: FormGroup;
  isSubmitting = false;
  resetError = '';
  resetSuccess = false;
  isVerifying = true;
  tokenValid = false;
  tokenError = '';
  token = '';
  showPassword = false;
  showConfirmPassword = false;
  
  constructor() {
    this.resetPasswordForm = this.fb.group({
      password: ['', [
        Validators.required, 
        Validators.minLength(8),
        Validators.maxLength(50),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/)
      ]],
      confirmPassword: ['', [Validators.required]]
    }, { 
      validators: this.passwordMatchValidator 
    });
  }
  
  ngOnInit(): void {
    // Obtener el token de la URL
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      
      if (!this.token) {
        this.isVerifying = false;
        this.tokenError = 'No se encontró el token en la URL. Vuelve a solicitar un restablecimiento de contraseña.';
        return;
      }
      
      // Verificar validez del token
      this.verifyToken();
    });
  }
  
  /**
   * Verifica si el token es válido
   */
  verifyToken(): void {
    this.authService.verifyResetToken(this.token).subscribe({
      next: (response) => {
        this.isVerifying = false;

        const { valid, message } = response.data; // Acceder a data
        
        if (valid) {
          this.tokenValid = true;
        } else {
          this.tokenError = message;
        }
      },
      error: (error) => {
        this.isVerifying = false;
        this.tokenError = 'Error al verificar el token. Por favor, intenta de nuevo más tarde.';
      }
    });
  }
  
  /**
   * Validador personalizado para verificar que las contraseñas coincidan
   */
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    
    if (password !== confirmPassword) {
      control.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }
  
  /**
   * Maneja el envío del formulario
   */
  onSubmit(): void {
    if (this.resetPasswordForm.invalid || this.isSubmitting) {
      // Marcar los campos como tocados para mostrar errores
      this.resetPasswordForm.markAllAsTouched();
      return;
    }
    
    this.isSubmitting = true;
    this.resetError = '';
    
    const { password } = this.resetPasswordForm.value;
    
    this.authService.resetPassword(this.token, password).subscribe({
      next: (response) => {
        this.isSubmitting = false;

        const { success, message } = response.data; // Acceder a data

        if (success) {
          this.resetSuccess = true;
          this.toastService.success('Contraseña restablecida correctamente');
        } else {
          this.resetError = message || 'Error al restablecer la contraseña. Por favor, intenta de nuevo.';
        }
      },
      error: (error) => {
        this.isSubmitting = false;
        
        if (error.status === 400) {
          this.resetError = 'El token no es válido o ha expirado. Por favor, solicita un nuevo enlace.';
        } else {
          this.resetError = 'Error al restablecer la contraseña. Por favor, intenta más tarde.';
        }
      }
    });
  }
  
  /**
   * Alterna la visibilidad de la contraseña
   */
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
  
  /**
   * Alterna la visibilidad de la confirmación de contraseña
   */
  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
  
  /**
   * Navega a la página de inicio de sesión
   */
  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}