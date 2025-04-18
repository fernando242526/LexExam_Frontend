import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSave, faArrowLeft, faSpinner, faExclamationTriangle, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { finalize } from 'rxjs/operators';
import { UsuariosService } from '../../../../core/services/usuarios.service';
import { ToastService } from '../../../../core/services/toast.service';

/**
 * Componente para crear o editar usuarios
 */
@Component({
  selector: 'app-usuarios-form',
  imports: [CommonModule, ReactiveFormsModule, FontAwesomeModule],
  templateUrl: './usuarios-form.component.html',
  styleUrl: './usuarios-form.component.scss'
})
export default class UsuariosFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);
  private usuariosService = inject(UsuariosService);
  private toastService = inject(ToastService);
  
  // Iconos
  faSave = faSave;
  faArrowLeft = faArrowLeft;
  faSpinner = faSpinner;
  faExclamationTriangle = faExclamationTriangle;
  faEye = faEye;
  faEyeSlash = faEyeSlash;
  
  // Estado del componente
  usuarioForm: FormGroup;
  usuarioId: string | null = null;
  isEditing = false;
  isSubmitting = false;
  error: string | null = null;
  showPassword = false;
  
  // Modo de operación (crear o editar)
  get title(): string {
    return this.isEditing ? 'Detalle de Usuario' : 'Nuevo Usuario';
  }
  
  get submitButtonText(): string {
    return this.isEditing ? 'Guardar Cambios' : 'Crear Usuario';
  }
  
  constructor() {
    // Inicializar formulario vacío
    this.usuarioForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      apellidos: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
      username: ['', [
        Validators.required, 
        Validators.minLength(4), 
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-Z0-9._-]+$/)
      ]],
      password: ['', [
        Validators.required, 
        Validators.minLength(8),
        Validators.maxLength(50),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/)
      ]],
      rol: ['', [Validators.required]],
      activo: [true]
    });
  }
  
  ngOnInit(): void {
    // Obtener ID de la ruta si existe (modo edición)
    this.route.paramMap.subscribe(params => {
      this.usuarioId = params.get('id');
      this.isEditing = !!this.usuarioId;
      
      if (this.isEditing && this.usuarioId) {
        // En modo edición, eliminar validadores de campos no editables
        this.usuarioForm.get('nombre')?.clearValidators();
        this.usuarioForm.get('apellidos')?.clearValidators();
        this.usuarioForm.get('email')?.clearValidators();
        this.usuarioForm.get('username')?.clearValidators();
        this.usuarioForm.get('password')?.clearValidators();
        
        // Remover el campo password en modo edición
        this.usuarioForm.removeControl('password');
        
        // Actualizar los validadores
        this.usuarioForm.get('nombre')?.updateValueAndValidity();
        this.usuarioForm.get('apellidos')?.updateValueAndValidity();
        this.usuarioForm.get('email')?.updateValueAndValidity();
        this.usuarioForm.get('username')?.updateValueAndValidity();
        
        // Cargar datos del usuario
        this.loadUsuario(this.usuarioId);
      }
    });
  }
  
  /**
   * Carga los datos de un usuario existente
   */
  loadUsuario(id: string): void {
    this.isSubmitting = true;
    
    this.usuariosService.getUsuario(id)
      .pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: (response) => {
          // Actualizar el formulario con los datos del usuario
          this.usuarioForm.patchValue({
            nombre: response.data.nombre,
            apellidos: response.data.apellidos,
            email: response.data.email,
            username: response.data.username,
            rol: response.data.rol,
            activo: response.data.activo
          });
          
          // Deshabilitar campos que no se pueden editar
          this.usuarioForm.get('nombre')?.disable();
          this.usuarioForm.get('apellidos')?.disable();
          this.usuarioForm.get('email')?.disable();
          this.usuarioForm.get('username')?.disable();
        },
        error: (err) => {
          this.error = 'Error al cargar el usuario. Por favor, intente de nuevo.';
          console.error('Error cargando usuario:', err);
        }
      });
  }
  
  /**
   * Maneja el envío del formulario
   */
  onSubmit(): void {
    if (this.usuarioForm.invalid || this.isSubmitting) {
      // Marcar campos como tocados para mostrar errores
      Object.keys(this.usuarioForm.controls).forEach((key) => {
        const control = this.usuarioForm.get(key);
        control?.markAsTouched();
      });
      return;
    }
    
    this.isSubmitting = true;
    this.error = null;
    
    if (this.isEditing && this.usuarioId) {
      // En modo edición, solo actualizar rol y estado activo
      const updateData = {
        rol: this.usuarioForm.get('rol')?.value,
        activo: this.usuarioForm.get('activo')?.value
      };
      
      this.usuariosService.updateUsuario(this.usuarioId, updateData)
        .pipe(finalize(() => this.isSubmitting = false))
        .subscribe({
          next: (response) => {
            this.toastService.success(
              'Usuario actualizado',
              `El usuario "${response.nombreCompleto}" se ha actualizado correctamente.`
            );
            this.router.navigate(['/admin/usuarios']);
          },
          error: (err) => {
            this.error = 'Error al actualizar el usuario. Por favor, intente de nuevo.';
            console.error('Error actualizando usuario:', err);
          }
        });
    } else {
      // En modo creación, enviar todos los datos
      this.usuariosService.createUsuario(this.usuarioForm.value)
        .pipe(finalize(() => this.isSubmitting = false))
        .subscribe({
          next: (response) => {
            this.toastService.success(
              'Usuario creado',
              `El usuario "${response.nombreCompleto}" se ha creado correctamente.`
            );
            this.router.navigate(['/admin/usuarios']);
          },
          error: (err) => {
            if (err.status === 409) {
              this.error = 'Ya existe un usuario con ese correo electrónico o nombre de usuario.';
            } else {
              this.error = 'Error al crear el usuario. Por favor, intente de nuevo.';
            }
            console.error('Error creando usuario:', err);
          }
        });
    }
  }
  
  /**
   * Alterna la visibilidad de la contraseña
   */
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
  
  /**
   * Vuelve a la página anterior
   */
  goBack(): void {
    this.location.back();
  }
}