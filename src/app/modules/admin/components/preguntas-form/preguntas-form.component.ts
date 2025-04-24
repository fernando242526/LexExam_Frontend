import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  FormArray, 
  FormBuilder, 
  FormControl, 
  FormGroup, 
  ReactiveFormsModule, 
  Validators 
} from '@angular/forms';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { 
  faPlus, 
  faTrash, 
  faSave, 
  faArrowLeft, 
  faExclamationCircle,
  faCheckCircle,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import { NivelDificultad, CreatePreguntaDto } from '../../../../core/models/pregunta.model';
import { TemasService } from '../../../../core/services/temas.service';
import { PreguntasService } from '../../../../core/services/preguntas.service';
import { ToastService } from '../../../../core/services/toast.service';
import { TemaSelect } from '../../../../core/models/tema.model';
import { EspecialidadesService } from '../../../../core/services/especialidades.service';
import { BalotariosService } from '../../../../core/services/balotario.service';
import { EspecialidadSelect } from '../../../../core/models/especialidad.model';
import { BalotarioSelect } from '../../../../core/models/balotario.model';
import { finalize, switchMap, of } from 'rxjs';

@Component({
  selector: 'app-preguntas-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FontAwesomeModule
  ],
  templateUrl: './preguntas-form.component.html',
  styleUrls: ['./preguntas-form.component.scss']
})
export default class PreguntaFormComponent implements OnInit {
  // Servicios inyectados
  private fb = inject(FormBuilder);
  private temasService = inject(TemasService);
  private especialidadesService = inject(EspecialidadesService);
  private balotariosService = inject(BalotariosService);
  private preguntasService = inject(PreguntasService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  // Iconos
  faPlus = faPlus;
  faTrash = faTrash;
  faSave = faSave;
  faArrowLeft = faArrowLeft;
  faExclamationCircle = faExclamationCircle;
  faCheckCircle = faCheckCircle;
  faSpinner = faSpinner;

  // Signals
  isSubmitting = signal(false);
  isLoading = signal(false);
  error = signal<string | null>(null);
  especialidades = signal<EspecialidadSelect[]>([]);
  balotarios = signal<BalotarioSelect[]>([]);
  temas = signal<TemaSelect[]>([]);

  // Enums para la plantilla
  nivelDificultad = NivelDificultad;

  // Formulario de selección para los filtros en cascada
  seleccionForm = this.fb.group({
    especialidadId: ['', Validators.required],
    balotarioId: [{value: '', disabled: true}, Validators.required],
    temaId: [{value: '', disabled: true}, Validators.required]
  });

  // Formulario principal que solo contiene las preguntas
  preguntasForm = this.fb.group({
    preguntas: this.fb.array([
      this.createPreguntaFormGroup()
    ])
  });

  // Computed properties
  preguntasArray = computed(() => this.preguntasForm.get('preguntas') as FormArray);
  temaSeleccionado = computed(() => {
    const temaId = this.seleccionForm.get('temaId')?.value;
    return this.temas().find(tema => tema.id === temaId);
  });

  ngOnInit(): void {
    this.cargarEspecialidades();
    this.setupFormListeners();
  }

  /**
   * Configura los listeners para los controles de selección en cascada
   */
  setupFormListeners(): void {
    // Escuchar cambios en especialidadId
    this.seleccionForm.get('especialidadId')?.valueChanges.subscribe(especialidadId => {
      // Resetear controles dependientes
      this.seleccionForm.get('balotarioId')?.setValue('');
      this.seleccionForm.get('temaId')?.setValue('');
      
      // Actualizar estado de habilitación
      if (especialidadId) {
        this.seleccionForm.get('balotarioId')?.enable();
        this.cargarBalotarios(especialidadId);
      } else {
        this.seleccionForm.get('balotarioId')?.disable();
        this.seleccionForm.get('temaId')?.disable();
        this.balotarios.set([]);
        this.temas.set([]);
      }
    });

    // Escuchar cambios en balotarioId
    this.seleccionForm.get('balotarioId')?.valueChanges.subscribe(balotarioId => {
      // Resetear tema
      this.seleccionForm.get('temaId')?.setValue('');
      
      // Actualizar estado de habilitación
      if (balotarioId) {
        this.seleccionForm.get('temaId')?.enable();
        this.cargarTemas(balotarioId);
      } else {
        this.seleccionForm.get('temaId')?.disable();
        this.temas.set([]);
      }
    });
  }

  /**
   * Carga las especialidades disponibles
   */
  cargarEspecialidades(): void {
    this.isLoading.set(true);
    this.especialidadesService.getEspecialidadesForSelect()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (especialidades) => {
          this.especialidades.set(especialidades);
        },
        error: (err) => {
          console.error('Error cargando especialidades:', err);
          this.error.set('No se pudieron cargar las especialidades. Por favor, intente de nuevo.');
          this.toastService.error('Error', 'No se pudieron cargar las especialidades');
        }
      });
  }

  /**
   * Carga los balotarios para una especialidad específica
   */
  cargarBalotarios(especialidadId: string): void {
    this.isLoading.set(true);
    this.balotariosService.getBalotariosForSelect(especialidadId)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (balotarios) => {
          this.balotarios.set(balotarios);
        },
        error: (err) => {
          console.error('Error cargando balotarios:', err);
          this.error.set('No se pudieron cargar los balotarios. Por favor, intente de nuevo.');
          this.toastService.error('Error', 'No se pudieron cargar los balotarios');
        }
      });
  }

  /**
   * Carga los temas para un balotario específico
   */
  cargarTemas(balotarioId: string): void {
    this.isLoading.set(true);
    this.temasService.getTemasForSelect(balotarioId)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (temas) => {
          this.temas.set(temas);
        },
        error: (err) => {
          console.error('Error cargando temas:', err);
          this.error.set('No se pudieron cargar los temas. Por favor, intente de nuevo.');
          this.toastService.error('Error', 'No se pudieron cargar los temas');
        }
      });
  }

  /**
   * Crea un FormGroup para una nueva pregunta
   */
  createPreguntaFormGroup(): FormGroup {
    return this.fb.group({
      texto: ['', [Validators.required, Validators.minLength(10)]],
      explicacion: [''],
      nivelDificultad: [NivelDificultad.MEDIO, Validators.required],
      respuestas: this.fb.array([
        this.createRespuestaFormGroup(true),  // Primera respuesta (correcta por defecto)
        this.createRespuestaFormGroup(false)  // Segunda respuesta
      ])
    });
  }

  /**
   * Crea un FormGroup para una nueva respuesta
   */
  createRespuestaFormGroup(esCorrecta: boolean = false): FormGroup {
    return this.fb.group({
      texto: ['', Validators.required],
      esCorrecta: [esCorrecta]
    });
  }

  /**
   * Obtiene el array de respuestas para una pregunta específica
   */
  getRespuestasArray(preguntaIndex: number): FormArray {
    return (this.preguntasArray().at(preguntaIndex) as FormGroup).get('respuestas') as FormArray;
  }

  /**
   * Añade una nueva pregunta al formulario
   */
  agregarPregunta(): void {
    this.preguntasArray().push(this.createPreguntaFormGroup());
  }

  /**
   * Elimina una pregunta del formulario
   */
  eliminarPregunta(index: number): void {
    // Asegurar que siempre quede al menos una pregunta
    if (this.preguntasArray().length > 1) {
      this.preguntasArray().removeAt(index);
    } else {
      this.toastService.warning('No se puede eliminar', 'Debe haber al menos una pregunta');
    }
  }

  /**
   * Añade una nueva respuesta a una pregunta específica
   */
  agregarRespuesta(preguntaIndex: number): void {
    const respuestasArray = this.getRespuestasArray(preguntaIndex);
    respuestasArray.push(this.createRespuestaFormGroup());
  }

  /**
   * Elimina una respuesta de una pregunta específica
   */
  eliminarRespuesta(preguntaIndex: number, respuestaIndex: number): void {
    const respuestasArray = this.getRespuestasArray(preguntaIndex);
    
    // Asegurar que siempre queden al menos 2 respuestas
    if (respuestasArray.length > 2) {
      // Si eliminamos una respuesta correcta, marcar la primera como correcta
      const respuestaAEliminar = respuestasArray.at(respuestaIndex) as FormGroup;
      if (respuestaAEliminar.get('esCorrecta')?.value === true) {
        this.setRespuestaCorrecta(preguntaIndex, 0);
      }
      
      respuestasArray.removeAt(respuestaIndex);
    } else {
      this.toastService.warning('No se puede eliminar', 'Debe haber al menos dos respuestas');
    }
  }

  /**
   * Establece una respuesta como correcta y las demás como incorrectas
   */
  setRespuestaCorrecta(preguntaIndex: number, respuestaIndex: number): void {
    const respuestasArray = this.getRespuestasArray(preguntaIndex);
    
    // Establecer todas como incorrectas
    for (let i = 0; i < respuestasArray.length; i++) {
      const respuesta = respuestasArray.at(i) as FormGroup;
      respuesta.get('esCorrecta')?.setValue(i === respuestaIndex);
    }
  }

  /**
   * Valida un FormGroup específico y sus controles
   */
  isFormGroupInvalid(formGroup: FormGroup): boolean {
    return formGroup.invalid && (formGroup.dirty || formGroup.touched);
  }

  /**
   * Guarda el formulario y envía las preguntas al servidor
   */
  onSubmit(): void {
    // Validar selección de tema
    if (this.seleccionForm.invalid) {
      this.seleccionForm.markAllAsTouched();
      this.toastService.warning('Selección incompleta', 'Debe seleccionar una especialidad, balotario y tema');
      return;
    }

    // Validar formulario de preguntas
    if (this.preguntasForm.invalid) {
      // Marcar todos los controles como tocados para mostrar validaciones
      this.markFormGroupTouched(this.preguntasForm);
      this.toastService.warning('Formulario inválido', 'Por favor, revise los campos marcados');
      return;
    }

    // Verificar que cada pregunta tenga una respuesta correcta
    const preguntas = this.preguntasArray();
    for (let i = 0; i < preguntas.length; i++) {
      const respuestas = this.getRespuestasArray(i);
      const tieneRespuestaCorrecta = Array.from({ length: respuestas.length })
        .some((_, j) => (respuestas.at(j) as FormGroup).get('esCorrecta')?.value === true);
      
      if (!tieneRespuestaCorrecta) {
        this.toastService.warning(
          'Respuesta correcta requerida', 
          `La pregunta ${i + 1} debe tener al menos una respuesta correcta`
        );
        return;
      }
    }

    // Preparar los datos para enviar
    const temaId = this.seleccionForm.get('temaId')?.value as string;
    const preguntasDto: CreatePreguntaDto[] = this.preguntasArray().controls.map(control => {
      const preguntaGroup = control as FormGroup;
      const respuestasArray = preguntaGroup.get('respuestas') as FormArray;
      
      return {
        texto: preguntaGroup.get('texto')?.value,
        explicacion: preguntaGroup.get('explicacion')?.value || '',
        nivelDificultad: preguntaGroup.get('nivelDificultad')?.value,
        respuestas: respuestasArray.controls.map(respControl => {
          const respuestaGroup = respControl as FormGroup;
          return {
            texto: respuestaGroup.get('texto')?.value,
            esCorrecta: respuestaGroup.get('esCorrecta')?.value
          };
        })
      };
    });

    // Enviar las preguntas al servidor
    this.isSubmitting.set(true);
    this.error.set(null);

    this.preguntasService.createPreguntasMasivas(temaId, preguntasDto)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (result) => {
          this.toastService.success(
            'Preguntas creadas', 
            `Se han creado ${result.creadas} de ${result.total} preguntas correctamente`
          );
          this.router.navigate(['/admin/preguntas']);
        },
        error: (err) => {
          console.error('Error al crear preguntas:', err);
          this.error.set('No se pudieron crear las preguntas. Por favor, intente de nuevo.');
          this.toastService.error(
            'Error al crear preguntas',
            err.error?.message || 'Ocurrió un error inesperado'
          );
        }
      });
  }

  /**
   * Marca todos los controles de un FormGroup como tocados
   * para activar las validaciones visuales
   */
  private markFormGroupTouched(formGroup: FormGroup | FormArray): void {
    if (formGroup instanceof FormArray) {
      formGroup.controls.forEach(control => {
        control.markAsTouched();
        
        if (control instanceof FormGroup || control instanceof FormArray) {
          this.markFormGroupTouched(control);
        }
      });
    } else {
      Object.values(formGroup.controls).forEach(control => {
        control.markAsTouched();
        
        if (control instanceof FormGroup || control instanceof FormArray) {
          this.markFormGroupTouched(control);
        }
      });
    }
  }

  /**
   * Verifica si una respuesta es válida
   */
  isRespuestaInvalid(respuestaControl: FormControl): boolean {
    return respuestaControl.invalid && (respuestaControl.dirty || respuestaControl.touched);
  }

  /**
   * Navega de vuelta a la lista de preguntas
   */
  volver(): void {
    this.router.navigate(['/admin/preguntas']);
  }
}