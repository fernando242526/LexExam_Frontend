import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { 
  faExclamationTriangle, 
  faSpinner, 
  faCheck, 
  faPlus, 
  faMinus, 
  faBookOpen 
} from '@fortawesome/free-solid-svg-icons';
import { finalize, switchMap, tap, of } from 'rxjs';

import { ToastService } from '../../../../core/services/toast.service';
import { EspecialidadesService } from '../../../../core/services/especialidades.service';
import { BalotariosService } from '../../../../core/services/balotario.service';
import { TemasService } from '../../../../core/services/temas.service';
import { ExamenesService } from '../../../../core/services/examenes.service';
import { EspecialidadSelect } from '../../../../core/models/especialidad.model';
import { BalotarioSelect } from '../../../../core/models/balotario.model';
import { Tema, TemaSelect } from '../../../../core/models/tema.model';
import { CrearExamenDto } from '../../../../core/models/examenes.model';

@Component({
  selector: 'app-crear-examen',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FontAwesomeModule
  ],
  templateUrl: './crear-examen.component.html',
  styleUrls: ['./crear-examen.component.scss']
})
export default class CrearExamenComponent implements OnInit {
  // Servicios inyectados
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toastService = inject(ToastService);
  private especialidadesService = inject(EspecialidadesService);
  private balotariosService = inject(BalotariosService);
  private temasService = inject(TemasService);
  private examenesService = inject(ExamenesService);
  
  // Iconos
  faExclamationTriangle = faExclamationTriangle;
  faSpinner = faSpinner;
  faCheck = faCheck;
  faPlus = faPlus;
  faMinus = faMinus;
  faBookOpen = faBookOpen;
  
  // Estado del componente
  examenForm: FormGroup;
  isSubmitting = false;
  error: string | null = null;
  
  // Datos para selects
  especialidades: EspecialidadSelect[] = [];
  balotarios: BalotarioSelect[] = [];
  temas: TemaSelect[] = [];
  temaSeleccionado: Tema | null = null;
  
  // Estados de carga
  isLoadingEspecialidades = false;
  isLoadingBalotarios = false;
  isLoadingTemas = false;
  
  constructor() {
    // Inicializar formulario
    this.examenForm = this.fb.group({
      especialidadId: ['', Validators.required],
      balotarioId: [{ value: '', disabled: true }, Validators.required],
      temaId: [{ value: '', disabled: true }, Validators.required],
      duracionMinutos: [30, [Validators.required, Validators.min(5), Validators.max(120)]],
      numeroPreguntas: [10, [Validators.required, Validators.min(5), Validators.max(50)]]
    });
  }
  
  ngOnInit(): void {
    // Cargar especialidades
    this.loadEspecialidades();
    
    // Configurar cambios en cascada para los filtros
    this.setupFilterCascade();
    
    // Verificar si viene con parámetros preseleccionados
    this.route.queryParams.subscribe(params => {
      if (params['temaId']) {
        // Buscar tema, balotario y especialidad por el temaId
        this.loadTemaPreseleccionado(params['temaId']);
      }
    });
  }
  
  /**
   * Configura la lógica en cascada para los filtros
   */
  setupFilterCascade(): void {
    // Cuando cambia la especialidad, carga los balotarios
    this.examenForm.get('especialidadId')?.valueChanges.pipe(
      tap(especialidadId => {
        // Resetear balotario y tema
        this.examenForm.get('balotarioId')?.setValue('');
        this.examenForm.get('temaId')?.setValue('');
        this.temaSeleccionado = null;
        
        // Habilitar/deshabilitar balotario
        if (especialidadId) {
          this.examenForm.get('balotarioId')?.enable();
        } else {
          this.examenForm.get('balotarioId')?.disable();
          this.examenForm.get('temaId')?.disable();
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
    this.examenForm.get('balotarioId')?.valueChanges.pipe(
      tap(balotarioId => {
        // Resetear tema
        this.examenForm.get('temaId')?.setValue('');
        this.temaSeleccionado = null;
        
        // Habilitar/deshabilitar tema
        if (balotarioId) {
          this.examenForm.get('temaId')?.enable();
        } else {
          this.examenForm.get('temaId')?.disable();
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
    
    // Cuando cambia el tema, carga la información detallada del tema
    this.examenForm.get('temaId')?.valueChanges.pipe(
      tap(() => {
        this.temaSeleccionado = null;
      }),
      switchMap(temaId => {
        if (temaId) {
          return this.temasService.getTema(temaId);
        }
        return of(null);
      })
    ).subscribe(tema => {
      this.temaSeleccionado = tema;
    });
  }
  
  /**
   * Carga tema preseleccionado cuando se navega desde otra página
   */
  loadTemaPreseleccionado(temaId: string): void {
    this.temasService.getTema(temaId).subscribe({
      next: (tema) => {
        if (tema && tema.balotario) {
          // Configurar especialidad
          const especialidadId = tema.balotario?.especialidad?.id;
          if (especialidadId) {
            this.examenForm.get('especialidadId')?.setValue(especialidadId);
            
            // Esperar a que se carguen los balotarios
            setTimeout(() => {
              // Configurar balotario
              const balotarioId = tema.balotario?.id;
              if (balotarioId) {
                this.examenForm.get('balotarioId')?.setValue(balotarioId);
                
                // Esperar a que se carguen los temas
                setTimeout(() => {
                  // Configurar tema
                  this.examenForm.get('temaId')?.setValue(temaId);
                }, 300);
              }
            }, 300);
          }
        }
      },
      error: (err) => {
        console.error('Error cargando tema preseleccionado:', err);
      }
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
          this.error = 'Error al cargar especialidades. Por favor, intente de nuevo.';
        }
      });
  }
  
  /**
   * Incrementa la duración del examen en 5 minutos
   */
  incrementarDuracion(): void {
    const duracionControl = this.examenForm.get('duracionMinutos');
    if (duracionControl) {
      const actualValue = duracionControl.value || 0;
      const newValue = Math.min(actualValue + 5, 120); // Máximo 120 minutos
      duracionControl.setValue(newValue);
    }
  }
  
  /**
   * Decrementa la duración del examen en 5 minutos
   */
  decrementarDuracion(): void {
    const duracionControl = this.examenForm.get('duracionMinutos');
    if (duracionControl) {
      const actualValue = duracionControl.value || 0;
      const newValue = Math.max(actualValue - 5, 5); // Mínimo 5 minutos
      duracionControl.setValue(newValue);
    }
  }
  
  /**
   * Incrementa el número de preguntas en 1
   */
  incrementarPreguntas(): void {
    const preguntasControl = this.examenForm.get('numeroPreguntas');
    if (preguntasControl) {
      const actualValue = preguntasControl.value || 0;
      const newValue = Math.min(actualValue + 1, 50); // Máximo 50 preguntas
      preguntasControl.setValue(newValue);
    }
  }
  
  /**
   * Decrementa el número de preguntas en 1
   */
  decrementarPreguntas(): void {
    const preguntasControl = this.examenForm.get('numeroPreguntas');
    if (preguntasControl) {
      const actualValue = preguntasControl.value || 0;
      const newValue = Math.max(actualValue - 1, 5); // Mínimo 5 preguntas
      preguntasControl.setValue(newValue);
    }
  }
  
  /**
   * Maneja el envío del formulario
   */
  onSubmit(): void {
    if (this.examenForm.invalid || this.isSubmitting) {
      // Marcar todos los campos como tocados para mostrar errores
      Object.keys(this.examenForm.controls).forEach(key => {
        const control = this.examenForm.get(key);
        control?.markAsTouched();
      });
      return;
    }
    
    this.isSubmitting = true;
    this.error = null;
    
    const examenData: CrearExamenDto = {
      temaId: this.examenForm.get('temaId')?.value,
      duracionMinutos: this.examenForm.get('duracionMinutos')?.value,
      numeroPreguntas: this.examenForm.get('numeroPreguntas')?.value
    };
    
    this.examenesService.crearExamen(examenData)
      .pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: (examen) => {
          this.toastService.success(
            'Examen creado con éxito',
            `Se ha creado un examen con ${examenData.numeroPreguntas} preguntas de ${this.temaSeleccionado?.titulo || 'tema seleccionado'}`
          );
          
          // Navegar a la página de iniciar examen con el ID del examen creado
          this.router.navigate(['/user/examenes/iniciar', examen.id]);
        },
        error: (err) => {
          console.error('Error al crear examen:', err);
          if (err.status === 400) {
            this.error = err.error?.message || 'No hay suficientes preguntas disponibles para este tema. Intenta con menos preguntas o selecciona otro tema.';
          } else {
            this.error = 'Ocurrió un error al crear el examen. Por favor, intente de nuevo.';
          }
        }
      });
  }
}