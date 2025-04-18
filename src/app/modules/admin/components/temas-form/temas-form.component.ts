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
import { finalize } from 'rxjs/operators';
import { TemasService } from '../../../../core/services/temas.service';
import { BalotariosService } from '../../../../core/services/balotario.service';
import { EspecialidadesService } from '../../../../core/services/especialidades.service';
import { ToastService } from '../../../../core/services/toast.service';
import { BalotarioSelect } from '../../../../core/models/balotario.model';
import { Tema } from '../../../../core/models/tema.model';
import { EspecialidadSelect } from '../../../../core/models/especialidad.model';

/**
 * Componente para crear o editar temas
 */
@Component({
  selector: 'app-temas-form',
  imports: [CommonModule, ReactiveFormsModule, FontAwesomeModule],
  templateUrl: './temas-form.component.html',
  styleUrl: './temas-form.component.scss',
})
export default class TemasFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);
  private temasService = inject(TemasService);
  private balotariosService = inject(BalotariosService);
  private especialidadesService = inject(EspecialidadesService);
  private toastService = inject(ToastService);

  // Iconos
  faSave = faSave;
  faArrowLeft = faArrowLeft;
  faSpinner = faSpinner;
  faExclamationTriangle = faExclamationTriangle;

  // Estado del componente
  temaForm: FormGroup;
  temaId: string | null = null;
  isEditing = false;
  isSubmitting = false;
  error: string | null = null;
  especialidades: EspecialidadSelect[] = [];
  balotarios: BalotarioSelect[] = [];
  isLoadingEspecialidades = false;
  isLoadingBalotarios = false;

  // Modo de operación (crear o editar)
  get title(): string {
    return this.isEditing ? 'Editar Tema' : 'Nuevo Tema';
  }

  get submitButtonText(): string {
    return this.isEditing ? 'Guardar Cambios' : 'Crear Tema';
  }

  constructor() {
    // Inicializar formulario vacío
    this.temaForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.maxLength(200)]],
      descripcion: [''],
      orden: [0, [Validators.required, Validators.min(0)]],
      especialidadId: ['', [Validators.required]],
      balotario: this.fb.group({
        id: ['', [Validators.required]],
      }),
      activo: [true],
    });
  }

  ngOnInit(): void {
    // Deshabilitar el control de balotario inicialmente
    this.temaForm.get('balotario')?.get('id')?.disable();
    
    // Cargar especialidades
    this.loadEspecialidades();
    
    // Configurar la selección en cascada
    this.temaForm.get('especialidadId')?.valueChanges.subscribe(especialidadId => {
      // Obtener el control de balotario
      const balotarioControl = this.temaForm.get('balotario')?.get('id');
      
      // Limpiar el balotario seleccionado
      if (balotarioControl) {
        balotarioControl.setValue('');
      }
      
      if (especialidadId) {
        // Cargar balotarios de la especialidad seleccionada
        this.loadBalotarios(especialidadId);
        // Habilitar el control de balotario
        balotarioControl?.enable();
      } else {
        // Si no hay especialidad seleccionada, limpiar la lista de balotarios y mantener deshabilitado
        this.balotarios = [];
        balotarioControl?.disable();
      }
    });
    
    // Obtener ID de la ruta si existe (modo edición)
    this.route.paramMap.subscribe(params => {
      this.temaId = params.get('id');
      this.isEditing = !!this.temaId;
      
      if (this.isEditing && this.temaId) {
        this.loadTema(this.temaId);
      }
    });
  }

  /**
   * Carga las especialidades para el select
   */
  loadEspecialidades(): void {
    this.isLoadingEspecialidades = true;
    const especialidadControl = this.temaForm.get('especialidadId');
    
    // Deshabilitar mientras se cargan las especialidades
    if (especialidadControl) {
      especialidadControl.disable();
    }

    this.especialidadesService
      .getEspecialidadesForSelect()
      .pipe(finalize(() => {
        this.isLoadingEspecialidades = false;
        // Volver a habilitar cuando se complete la carga
        if (especialidadControl && !this.isSubmitting) {
          especialidadControl.enable();
        }
      }))
      .subscribe({
        next: (especialidades) => {
          this.especialidades = especialidades;
        },
        error: (err) => {
          this.toastService.error(
            'Error al cargar especialidades',
            'No se pudieron cargar las especialidades. Por favor, intente de nuevo.'
          );
          console.error('Error cargando especialidades:', err);
        },
      });
  }

  /**
   * Carga los balotarios para el select basado en la especialidad seleccionada
   */
  loadBalotarios(especialidadId: string): void {
    this.isLoadingBalotarios = true;
    const balotarioControl = this.temaForm.get('balotario')?.get('id');
    
    // Deshabilitar mientras se cargan los balotarios
    if (balotarioControl) {
      balotarioControl.disable();
    }

    this.balotariosService
      .getBalotariosForSelect(especialidadId)
      .pipe(finalize(() => {
        this.isLoadingBalotarios = false;
        // Volver a habilitar cuando se complete la carga solo si hay una especialidad seleccionada
        if (balotarioControl && this.temaForm.get('especialidadId')?.value && !this.isSubmitting) {
          balotarioControl.enable();
        }
      }))
      .subscribe({
        next: (balotarios) => {
          this.balotarios = balotarios;
        },
        error: (err) => {
          this.toastService.error(
            'Error al cargar balotarios',
            'No se pudieron cargar los balotarios. Por favor, intente de nuevo.'
          );
          console.error('Error cargando balotarios:', err);
        },
      });
  }

  /**
   * Carga los datos de un tema existente
   */
  loadTema(id: string): void {
    this.isSubmitting = true;
    
    // Deshabilitar todos los controles mientras se carga el tema
    this.temaForm.disable();
    
    this.temasService.getTema(id)
      .pipe(finalize(() => {
        this.isSubmitting = false;
        // Si no hay error, habilitar los controles después de cargar
        if (!this.error) {
          this.temaForm.enable();
          // Pero mantener el control de balotario deshabilitado si no hay especialidad seleccionada
          if (!this.temaForm.get('especialidadId')?.value) {
            this.temaForm.get('balotario')?.get('id')?.disable();
          }
        }
      }))
      .subscribe({
        next: (tema) => {
          // Primero actualizamos los campos básicos
          this.temaForm.patchValue({
            titulo: tema.titulo,
            descripcion: tema.descripcion || '',
            orden: tema.orden,
            activo: tema.activo
          });
          
          // Si tenemos el balotario y su especialidad (ahora viene todo anidado)
          if (tema.balotario && tema.balotario.especialidad) {
            // Cargar especialidades para el select
            this.loadEspecialidades();
            
            // Una vez cargadas, setear la especialidad
            const especialidadId = tema.balotario.especialidad.id;
            this.temaForm.get('especialidadId')?.setValue(especialidadId);
            
            // Cargar los balotarios de esa especialidad
            this.loadBalotarios(especialidadId);
            
            // Establecer el valor del balotario después de un breve retardo
            // para asegurar que los balotarios se hayan cargado
            setTimeout(() => {
              // Habilitar el control de balotario antes de asignar el valor
              const balotarioControl = this.temaForm.get('balotario')?.get('id');
              if (balotarioControl) {
                balotarioControl.enable();
                balotarioControl.setValue(tema.balotario?.id);
              }
            }, 300);
          }
        },
        error: (err) => {
          this.error = 'Error al cargar tema. Por favor, intente de nuevo.';
          console.error('Error cargando tema:', err);
        }
      });
  }

  /**
   * Maneja el envío del formulario
   */
  onSubmit(): void {
    if (this.temaForm.invalid || this.isSubmitting) {
      // Marcar campos como tocados para mostrar errores
      Object.keys(this.temaForm.controls).forEach((key) => {
        const control = this.temaForm.get(key);
        control?.markAsTouched();

        // Para los controles anidados (como balotario)
        if (control instanceof FormGroup) {
          Object.keys(control.controls).forEach((nestedKey) => {
            control.get(nestedKey)?.markAsTouched();
          });
        }
      });
      return;
    }

    this.isSubmitting = true;
    this.error = null;
    
    // Deshabilitar formulario durante el envío
    this.temaForm.disable();

    // Extraer solo los campos necesarios para enviar al backend
    const formValues = this.temaForm.getRawValue(); // Usa getRawValue() para obtener también valores de controles deshabilitados
    const temaData: Partial<Tema> = {
      titulo: formValues.titulo,
      descripcion: formValues.descripcion,
      orden: formValues.orden,
      balotario: formValues.balotario,
      activo: formValues.activo,
    };

    const tituloTema = temaData.titulo || 'tema';

    // Decidir si crear o actualizar
    const saveAction =
      this.isEditing && this.temaId
        ? this.temasService.updateTema(this.temaId, temaData)
        : this.temasService.createTema(temaData);

    saveAction.pipe(finalize(() => {
      this.isSubmitting = false;
      // Si hay error, habilitar el formulario nuevamente
      if (this.error) {
        this.temaForm.enable();
        // Pero mantener la lógica para el control de balotario
        if (!this.temaForm.get('especialidadId')?.value) {
          this.temaForm.get('balotario')?.get('id')?.disable();
        }
      }
    })).subscribe({
      next: () => {
        // Mostrar mensaje de éxito según la acción (crear o actualizar)
        if (this.isEditing) {
          this.toastService.success(
            'Tema actualizado',
            `El tema "${tituloTema}" se ha actualizado correctamente.`
          );
        } else {
          this.toastService.success(
            'Tema creado',
            `El tema "${tituloTema}" se ha creado correctamente.`
          );
        }

        // Redirigir a la lista después de guardar
        this.router.navigate(['/admin/temas']);
      },
      error: (err) => {
        // Mostrar mensaje de error según el tipo de error
        if (err.status === 409) {
          this.error = `Ya existe un tema con el título "${tituloTema}".`;
        } else if (err.status === 404) {
          this.error = 'El balotario seleccionado no existe.';
        } else {
          this.error = 'Error al guardar el tema. Por favor, intente de nuevo.';
        }

        console.error('Error guardando tema:', err);
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