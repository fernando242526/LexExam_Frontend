import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faSave,
  faArrowLeft,
  faSpinner,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons';
import { finalize, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { EspecialidadesService } from '../../../../core/services/especialidades.service';
import { Especialidad } from '../../../../core/models/especialidad.model';
import { ToastService } from '../../../../core/services/toast.service';

/**
 * Componente para crear o editar especialidades
 */
@Component({
  selector: 'app-especialidades-form',
  imports: [CommonModule, ReactiveFormsModule, FontAwesomeModule],
  templateUrl: './especialidades-form.component.html',
  styleUrl: './especialidades-form.component.scss',
})
export default class EspecialidadesFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);
  private especialidadesService = inject(EspecialidadesService);
  private toastService = inject(ToastService);

  // Iconos
  faSave = faSave;
  faArrowLeft = faArrowLeft;
  faSpinner = faSpinner;
  faExclamationTriangle = faExclamationTriangle;

  // Estado del componente
  especialidadForm: FormGroup;
  especialidadId: string | null = null;
  isEditing = false;
  isSubmitting = false;
  error: string | null = null;

  // Modo de operación (crear o editar)
  get title(): string {
    return this.isEditing ? 'Editar Especialidad' : 'Nueva Especialidad';
  }

  get submitButtonText(): string {
    return this.isEditing ? 'Guardar Cambios' : 'Crear Especialidad';
  }

  constructor() {
    // Inicializar formulario vacío
    this.especialidadForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      descripcion: [''],
      activo: [true],
    });
  }

  ngOnInit(): void {
    // Suscribirse a los cambios de parámetros en lugar de usar snapshot
    this.route.paramMap.subscribe((params) => {
      this.especialidadId = params.get('id');
      console.log('ID obtenido de la ruta:', this.especialidadId);

      this.isEditing = !!this.especialidadId;

      if (this.isEditing && this.especialidadId) {
        this.loadEspecialidad(this.especialidadId);
      }
    });
  }

  /**
   * Carga los datos de una especialidad existente
   */
  loadEspecialidad(id: string): void {
    this.isSubmitting = true;
    this.error = null;

    this.especialidadesService
      .getEspecialidad(id)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: (especialidad) => {
          this.especialidadForm.patchValue({
            nombre: especialidad.nombre,
            descripcion: especialidad.descripcion || '',
            activo: especialidad.activo,
          });
        },
        error: (err) => {
          this.error =
            'Error al cargar la especialidad. Por favor, intente de nuevo.';
          console.error('Error cargando especialidad:', err);
        },
      });
  }

  /**
   * Maneja el envío del formulario
   */
  onSubmit(): void {
    if (this.especialidadForm.invalid || this.isSubmitting) {
      // Marcar campos como tocados para mostrar errores
      Object.keys(this.especialidadForm.controls).forEach((key) => {
        const control = this.especialidadForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;
    this.error = null;

    const especialidadData = this.especialidadForm.value as Partial<Especialidad>;
    const nombreEspecialidad = especialidadData.nombre || 'especialidad';

    // Decidir si crear o actualizar
    const saveAction =
      this.isEditing && this.especialidadId
        ? this.especialidadesService.updateEspecialidad(
            this.especialidadId,
            especialidadData
          )
        : this.especialidadesService.createEspecialidad(especialidadData);

    saveAction.pipe(finalize(() => (this.isSubmitting = false))).subscribe({
      next: () => {
        // Mostrar mensaje de éxito según la acción (crear o actualizar)
        if (this.isEditing) {
          this.toastService.success(
            'Especialidad actualizada',
            `La especialidad "${nombreEspecialidad}" se ha actualizado correctamente.`
          );
        } else {
          this.toastService.success(
            'Especialidad creada',
            `La especialidad "${nombreEspecialidad}" se ha creado correctamente.`
          );
        }
        
        // Redirigir a la lista después de guardar
        this.router.navigate(['/admin/especialidades']);
      },
      error: (err) => {
        // Mostrar mensaje de error según el tipo de error
        if (err.status === 409) {
          this.toastService.error(
            'Error de duplicidad',
            `Ya existe una especialidad con el nombre "${nombreEspecialidad}".`
          );
          this.error = 'Ya existe una especialidad con ese nombre.';
        } else {
          this.toastService.error(
            'Error al guardar',
            this.isEditing 
              ? 'No se pudo actualizar la especialidad. Por favor, intente de nuevo.'
              : 'No se pudo crear la especialidad. Por favor, intente de nuevo.'
          );
          this.error = 'Error al guardar la especialidad. Por favor, intente de nuevo.';
        }
        console.error('Error guardando especialidad:', err);
      },
    });
  }

  /**
   * Vuelve a la página anterior
   */
  goBack(): void {
    this.location.back();
  }
}
