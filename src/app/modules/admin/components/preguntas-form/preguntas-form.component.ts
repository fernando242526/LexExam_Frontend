import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { 
  faSave, 
  faPlus, 
  faTrash,
  faArrowLeft, 
  faSpinner,
  faExclamationTriangle,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import { finalize, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { PreguntasService } from '../../../../core/services/preguntas.service';
import { EspecialidadesService } from '../../../../core/services/especialidades.service';
import { BalotariosService } from '../../../../core/services/balotario.service';
import { TemasService } from '../../../../core/services/temas.service';
import { ToastService } from '../../../../core/services/toast.service';
import { CreatePreguntaDto, NivelDificultad } from '../../../../core/models/pregunta.model';
import { EspecialidadSelect } from '../../../../core/models/especialidad.model';
import { BalotarioSelect } from '../../../../core/models/balotario.model';
import { TemaSelect } from '../../../../core/models/tema.model';

/**
 * Componente para la creación masiva de preguntas
 */
@Component({
  selector: 'app-preguntas-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FontAwesomeModule
  ],
  templateUrl: './preguntas-form.component.html',
  styleUrl: './preguntas-form.component.scss'
})
export default class PreguntasFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private location = inject(Location);
  private preguntasService = inject(PreguntasService);
  private especialidadesService = inject(EspecialidadesService);
  private balotariosService = inject(BalotariosService);
  private temasService = inject(TemasService);
  private toastService = inject(ToastService);
  
  // Iconos
  faSave = faSave;
  faPlus = faPlus;
  faTrash = faTrash;
  faArrowLeft = faArrowLeft;
  faSpinner = faSpinner;
  faExclamationTriangle = faExclamationTriangle;
  faTimes = faTimes;
  
  // Enums para la plantilla
  nivelDificultadEnum = NivelDificultad;
  
  // Estado del componente
  preguntasForm: FormGroup;
  isSubmitting = false;
  error: string | undefined = undefined;
  especialidades: EspecialidadSelect[] = [];
  balotarios: BalotarioSelect[] = [];
  temas: TemaSelect[] = [];
  isLoadingEspecialidades = false;
  isLoadingBalotarios = false;
  isLoadingTemas = false;
  
  // Mensajes de validación
  validationMessages = {
    especialidadId: {
      required: 'La especialidad es obligatoria'
    },
    balotarioId: {
      required: 'El balotario es obligatorio'
    },
    temaId: {
      required: 'El tema es obligatorio'
    },
    preguntas: {
      required: 'Debe agregar al menos una pregunta',
      minlength: 'Debe agregar al menos una pregunta'
    },
    pregunta: {
      texto: {
        required: 'El texto de la pregunta es obligatorio',
        minlength: 'El texto debe tener al menos 10 caracteres'
      },
      respuestas: {
        required: 'Debe agregar al menos dos respuestas',
        minlength: 'Debe agregar al menos dos respuestas'
      }
    },
    respuesta: {
      texto: {
        required: 'El texto de la respuesta es obligatorio'
      }
    }
  };
  
  constructor() {
    this.preguntasForm = this.fb.group({
      especialidadId: ['', Validators.required],
      balotarioId: [{value: '', disabled: true}, Validators.required],
      temaId: [{value: '', disabled: true}, Validators.required],
      preguntas: this.fb.array([], [Validators.required, Validators.minLength(1)])
    });
  }
  
  ngOnInit(): void {
    // Cargar especialidades
    this.loadEspecialidades();
    
    // Agregar primera pregunta por defecto
    this.addPregunta();
    
    // Configurar cambios en cascada para los filtros
    this.setupFilterCascade();
  }
  
  /**
   * Configura la lógica en cascada para los filtros
   */
  setupFilterCascade(): void {
    // Cuando cambia la especialidad, carga los balotarios
    this.preguntasForm.get('especialidadId')?.valueChanges.pipe(
      tap(especialidadId => {
        // Resetear balotario y tema
        this.preguntasForm.get('balotarioId')?.setValue('');
        this.preguntasForm.get('temaId')?.setValue('');
        
        // Habilitar/deshabilitar balotario
        if (especialidadId) {
          this.preguntasForm.get('balotarioId')?.enable();
        } else {
          this.preguntasForm.get('balotarioId')?.disable();
          this.preguntasForm.get('temaId')?.disable();
        }
        
        // Limpiar listas dependientes
        this.balotarios = [];
        this.temas = [];
      }),
      switchMap(especialidadId => {
        if (especialidadId) {
          this.isLoadingBalotarios = true;
          return this.balotariosService.getBalotariosForSelect(especialidadId)
            .pipe(finalize(() => this.isLoadingBalotarios = false));
        }
        return of([]);
      })
    ).subscribe(balotarios => {
      this.balotarios = balotarios;
    });
    
    // Cuando cambia el balotario, carga los temas
    this.preguntasForm.get('balotarioId')?.valueChanges.pipe(
      tap(balotarioId => {
        // Resetear tema
        this.preguntasForm.get('temaId')?.setValue('');
        
        // Habilitar/deshabilitar tema
        if (balotarioId) {
          this.preguntasForm.get('temaId')?.enable();
        } else {
          this.preguntasForm.get('temaId')?.disable();
        }
        
        // Limpiar temas
        this.temas = [];
      }),
      switchMap(balotarioId => {
        if (balotarioId) {
          this.isLoadingTemas = true;
          return this.temasService.getTemasForSelect(balotarioId)
            .pipe(finalize(() => this.isLoadingTemas = false));
        }
        return of([]);
      })
    ).subscribe(temas => {
      this.temas = temas;
    });
  }
  
  /**
   * Carga las especialidades para el filtro
   */
  loadEspecialidades(): void {
    this.isLoadingEspecialidades = true;
    this.especialidadesService.getEspecialidadesForSelect()
      .pipe(finalize(() => this.isLoadingEspecialidades = false))
      .subscribe({
        next: (especialidades) => {
          this.especialidades = especialidades;
        },
        error: (err) => {
          console.error('Error cargando especialidades:', err);
          this.toastService.error('Error', 'No se pudieron cargar las especialidades');
        }
      });
  }
  
  /**
   * Obtiene el FormArray de preguntas
   */
  get preguntas(): FormArray {
    return this.preguntasForm.get('preguntas') as FormArray;
  }
  
  /**
   * Obtiene el FormArray de respuestas para una pregunta específica
   */
  getRespuestas(preguntaIndex: number): FormArray {
    return this.preguntas.at(preguntaIndex).get('respuestas') as FormArray;
  }
  
  /**
   * Agrega una nueva pregunta al formulario
   */
  addPregunta(): void {
    const preguntaForm = this.fb.group({
      texto: ['', [Validators.required, Validators.minLength(10)]],
      explicacion: [''],
      nivelDificultad: [NivelDificultad.MEDIO],
      respuestas: this.fb.array([], [Validators.required, Validators.minLength(2)])
    });
    
    this.preguntas.push(preguntaForm);
    
    // Agregar 2 respuestas por defecto (una correcta y una incorrecta)
    this.addRespuesta(this.preguntas.length - 1, true);
    this.addRespuesta(this.preguntas.length - 1, false);
  }
  
  /**
   * Elimina una pregunta del formulario
   */
  removePregunta(index: number): void {
    if (this.preguntas.length > 1) {
      this.preguntas.removeAt(index);
    } else {
      this.toastService.warning('No permitido', 'Debe tener al menos una pregunta');
    }
  }
  
  /**
   * Agrega una nueva respuesta a una pregunta específica
   */
  addRespuesta(preguntaIndex: number, esCorrecta: boolean = false): void {
    const respuestas = this.getRespuestas(preguntaIndex);
    const respuestaForm = this.fb.group({
      texto: ['', Validators.required],
      esCorrecta: [esCorrecta]
    });
    
    respuestas.push(respuestaForm);
  }
  
  /**
   * Elimina una respuesta de una pregunta específica
   */
  removeRespuesta(preguntaIndex: number, respuestaIndex: number): void {
    const respuestas = this.getRespuestas(preguntaIndex);
    
    if (respuestas.length > 2) {
      respuestas.removeAt(respuestaIndex);
    } else {
      this.toastService.warning('No permitido', 'Cada pregunta debe tener al menos dos respuestas');
    }
  }
  
  /**
   * Cambia el estado correcto/incorrecto de una respuesta
   */
  onCorrectoChange(preguntaIndex: number, respuestaIndex: number, event: Event): void {
    const target = event.target as HTMLInputElement;
    const checked = target.checked;
    
    // Si se está desmarcando, verificar que haya al menos una respuesta correcta
    if (!checked) {
      const respuestas = this.getRespuestas(preguntaIndex);
      const tieneOtraCorrecta = Array.from({length: respuestas.length})
        .some((_, i) => i !== respuestaIndex && respuestas.at(i).get('esCorrecta')?.value);
      
      if (!tieneOtraCorrecta) {
        target.checked = true; // Revertir el cambio
        this.toastService.warning('No permitido', 'Cada pregunta debe tener al menos una respuesta correcta');
        return;
      }
    }
  }
  
  /**
   * Valida y envía el formulario
   */
  onSubmit(): void {
    if (this.preguntasForm.invalid || this.isSubmitting) {
      // Marcar todos los campos como tocados para mostrar errores
      this.markFormGroupTouched(this.preguntasForm);
      this.toastService.error('Error', 'Por favor, corrija los errores en el formulario');
      return;
    }
    
    this.isSubmitting = true;
    this.error = undefined;
    
    const temaId = this.preguntasForm.get('temaId')?.value;
    const preguntas: CreatePreguntaDto[] = this.preguntas.value;
    
    // Verificar que todas las preguntas tengan al menos una respuesta correcta
    for (let i = 0; i < preguntas.length; i++) {
      const pregunta = preguntas[i];
      const tieneRespuestaCorrecta = pregunta.respuestas.some(r => r.esCorrecta);
      
      if (!tieneRespuestaCorrecta) {
        this.isSubmitting = false;
        this.toastService.error('Error', `La pregunta ${i + 1} debe tener al menos una respuesta correcta`);
        return;
      }
    }
    
    this.preguntasService.createPreguntasMasivas(temaId, preguntas)
      .pipe(finalize(() => this.isSubmitting = false))
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
          this.error = err.error?.message ?? 'Error al crear las preguntas. Por favor, intente de nuevo.';
          this.toastService.error('Error', this.error);
        }
      });
  }
  
  /**
   * Marca recursivamente todos los controles de un FormGroup como tocados
   */
  markFormGroupTouched(formGroup: FormGroup | FormArray): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markFormGroupTouched(control);
      }
    });
  }
  
  /**
   * Navega hacia atrás
   */
  goBack(): void {
    this.location.back();
  }
}