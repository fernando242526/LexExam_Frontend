import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSave, faArrowLeft, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { finalize } from 'rxjs/operators';
import { BalotariosService } from '../../../../core/services/balotario.service';
import { EspecialidadesService } from '../../../../core/services/especialidades.service';
import { ToastService } from '../../../../core/services/toast.service';
import { EspecialidadSelect } from '../../../../core/models/especialidad.model';
import { Balotario } from '../../../../core/models/balotario.model';

/**
 * Componente para crear o editar balotarios
 */
@Component({
  selector: 'app-balotarios-form',
  imports: [CommonModule, ReactiveFormsModule, FontAwesomeModule],
  templateUrl: './balotarios-form.component.html',
  styleUrl: './balotarios-form.component.scss'
})
export default class BalotariosFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);
  private balotariosService = inject(BalotariosService);
  private especialidadesService = inject(EspecialidadesService);
  private toastService = inject(ToastService);
  
  // Iconos
  faSave = faSave;
  faArrowLeft = faArrowLeft;
  faSpinner = faSpinner;
  
  // Estado del componente
  balotarioForm: FormGroup;
  balotarioId: string | null = null;
  isEditing = false;
  isSubmitting = false;
  especialidades: EspecialidadSelect[] = [];
  isLoadingEspecialidades = false;
  
  // Modo de operación (crear o editar)
  get title(): string {
    return this.isEditing ? 'Editar Balotario' : 'Nuevo Balotario';
  }
  
  get submitButtonText(): string {
    return this.isEditing ? 'Guardar Cambios' : 'Crear Balotario';
  }
  
  constructor() {
    // Inicializar formulario vacío
    this.balotarioForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(150)]],
      descripcion: [''],
      anio: [null, [Validators.min(2000), Validators.max(2100)]],
      institucion: ['', [Validators.maxLength(150)]],
      especialidad: this.fb.group({
        id: ['', [Validators.required]]
      }),
      activo: [true]
    });
  }
  
  ngOnInit(): void {
    // Cargar especialidades
    this.loadEspecialidades();
    
    // Obtener ID de la ruta si existe (modo edición)
    this.route.paramMap.subscribe(params => {
      this.balotarioId = params.get('id');
      this.isEditing = !!this.balotarioId;
      
      if (this.isEditing && this.balotarioId) {
        this.loadBalotario(this.balotarioId);
      }
    });
  }
  
  /**
   * Carga las especialidades para el select
   */
  loadEspecialidades(): void {
    this.isLoadingEspecialidades = true;
    
    this.especialidadesService.getEspecialidadesForSelect()
      .pipe(finalize(() => this.isLoadingEspecialidades = false))
      .subscribe({
        next: (especialidades) => {
          this.especialidades = especialidades;
          console.log(especialidades);
        },
        error: (err) => {
          this.toastService.error(
            'Error al cargar especialidades',
            'No se pudieron cargar las especialidades. Por favor, intente de nuevo.'
          );
          console.error('Error cargando especialidades:', err);
        }
      });
  }
  
  /**
   * Carga los datos de un balotario existente
   */
  loadBalotario(id: string): void {
    this.isSubmitting = true;
    
    this.balotariosService.getBalotario(id)
      .pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: (balotario) => {
          // Ahora balotario ya viene como el objeto Balotario, no necesita extraerse de data
          this.balotarioForm.patchValue({
            nombre: balotario.nombre,
            descripcion: balotario.descripcion || '',
            anio: balotario.anio,
            institucion: balotario.institucion || '',
            especialidad: {
              id: balotario.especialidad?.id
            },
            activo: balotario.activo
          });
        },
        error: (err) => {
          this.toastService.error(
            'Error al cargar balotario',
            'No se pudo cargar la información del balotario. Por favor, intente de nuevo.'
          );
          console.error('Error cargando balotario:', err);
        }
      });
  }
  
  /**
   * Maneja el envío del formulario
   */
  onSubmit(): void {
    if (this.balotarioForm.invalid || this.isSubmitting) {
      // Marcar campos como tocados para mostrar errores
      Object.keys(this.balotarioForm.controls).forEach((key) => {
        const control = this.balotarioForm.get(key);
        control?.markAsTouched();
      });
      return;
    }
    
    this.isSubmitting = true;
    const balotarioData = this.balotarioForm.value as Partial<Balotario>;
    const nombreBalotario = balotarioData.nombre || 'balotario';
    
    // Decidir si crear o actualizar
    const saveAction = this.isEditing && this.balotarioId
      ? this.balotariosService.updateBalotario(this.balotarioId, balotarioData)
      : this.balotariosService.createBalotario(balotarioData);
      
    saveAction
      .pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: () => {
          // Mostrar mensaje de éxito según la acción (crear o actualizar)
          if (this.isEditing) {
            this.toastService.success(
              'Balotario actualizado',
              `El balotario "${nombreBalotario}" se ha actualizado correctamente.`
            );
            
          } else {
            this.toastService.success(
              'Balotario creado',
              `El balotario "${nombreBalotario}" se ha creado correctamente.`
            );
          }
          
          // Redirigir a la lista después de guardar
          this.router.navigate(['/admin/balotarios']);
        },
        error: (err) => {
          // Mostrar mensaje de error según el tipo de error
          if (err.status === 409) {
            this.toastService.error(
              'Error de duplicidad',
              `Ya existe un balotario con el nombre "${nombreBalotario}".`
            );
          } else {
            this.toastService.error(
              'Error al guardar',
              this.isEditing 
                ? 'No se pudo actualizar el balotario. Por favor, intente de nuevo.'
                : 'No se pudo crear el balotario. Por favor, intente de nuevo.'
            );
          }
          console.error('Error guardando balotario:', err);
          console.log(this.balotarioForm.value);
        }
      });
  }
  
  /**
   * Vuelve a la página anterior
   */
  goBack(): void {
    this.location.back();
  }
}
