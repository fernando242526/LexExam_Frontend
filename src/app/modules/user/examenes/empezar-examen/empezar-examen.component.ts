import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule, JsonPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { 
  faClock, 
  faQuestionCircle, 
  faCheck, 
  faSpinner, 
  faExclamationTriangle,
  faArrowLeft, 
  faArrowRight,
  faPaperPlane,
  faHome
} from '@fortawesome/free-solid-svg-icons';
import { debounceTime, finalize, interval, Subject, Subscription } from 'rxjs';
import { ToastService } from '../../../../core/services/toast.service';
import { 
  ExamenConPreguntas, 
  EstadoExamen, 
  PreguntaExamen, 
  RespuestaUsuarioDto, 
  RespuestaPreviaDto
} from '../../../../core/models/examenes.model';
import { ExamenesService } from '../../../../core/services/examenes.service';

@Component({
  selector: 'app-empezar-examen',
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FontAwesomeModule,
  ],
  templateUrl: './empezar-examen.component.html',
  styleUrl: './empezar-examen.component.scss'
})
export default class EmpezarExamenComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private examenesService = inject(ExamenesService);
  private toastService = inject(ToastService);
  
  // Iconos
  faClock = faClock;
  faQuestionCircle = faQuestionCircle;
  faCheck = faCheck;
  faSpinner = faSpinner;
  faExclamationTriangle = faExclamationTriangle;
  faArrowLeft = faArrowLeft;
  faArrowRight = faArrowRight;
  faPaperPlane = faPaperPlane;
  faHome = faHome;
  
  // Estados
  isLoading = true;
  isSubmitting = false;
  error: string | null = null;
  examenId: string | null = null;
  examen: ExamenConPreguntas | null = null;
  isSavingCancelled = false;

  // Formulario para capturar respuestas
  respuestasForm: FormGroup;

  // Control de pregunta actual
  currentQuestionIndex = 0;
  previousQuestionIndex = 0;
  
  // Control de tiempo
  tiempoRestante: number | null = null;
  tiempoTotal: number = 0;
  tiempoAgotado = false;
  timerSubscription?: Subscription;
  
  // Para el guardado automático
  private saveSubject = new Subject<string>();
  private saveSubscription?: Subscription | null;
  isSaving = false;
  lastSaveTime: Date | null = null;
  
  constructor() {
    this.respuestasForm = this.fb.group({});
  }
  
  ngOnInit(): void {
    this.examenId = this.route.snapshot.paramMap.get('id');
    
    if (this.examenId) {
      this.cargarExamen(this.examenId);
    } else {
      this.error = 'ID de examen no especificado';
      this.isLoading = false;
    }

    // Configurar el guardado automático con debounce
    this.saveSubscription = this.saveSubject.pipe(
      debounceTime(2000) // Esperar 2 segundos después de la última acción
    ).subscribe(() => {
      if (this.examen && !this.isSubmitting && !this.isSaving) {
        this.guardarRespuestasParciales();
      }
    });
  }
  
  ngOnDestroy(): void {
    // Detener el timer cuando se destruye el componente
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }

    // Detener suscripción de guardado
    if (this.saveSubscription) {
      this.saveSubscription.unsubscribe();
    }
    
    // Solo guardar si no está cancelado
    if (this.examen && !this.isSubmitting && !this.tiempoAgotado && !this.isSavingCancelled) {
      this.guardarRespuestasParciales(true);
    }
  }
  
  /**
   * Carga el examen con sus preguntas
   */
  cargarExamen(examenId: string): void {
    this.isLoading = true;
    
    // Primero verificamos el estado del examen
    this.examenesService.verificarEstadoExamen(examenId).subscribe({
      next: (estado) => {
        if (estado.estado === EstadoExamen.PENDIENTE) {
          // Si está pendiente, lo iniciamos
          this.iniciarExamen(examenId);
        } else if (estado.estado === EstadoExamen.INICIADO) {
          // Si ya está iniciado, continuamos el examen
          this.tiempoRestante = estado.tiempoRestante;
          this.tiempoTotal = estado.tiempoTotal;
          
          // Llamamos al método continuarExamen
          this.continuarExamen(examenId);
          
          // Iniciamos el contador
          this.iniciarContador();
        } else if (estado.estado === EstadoExamen.FINALIZADO) {
          // Si ya está finalizado, redirigimos a los resultados
          this.router.navigate(['/examenes/resultado', examenId]);
        } else {
          // Si está caducado, mostramos error
          this.error = 'Este examen ha caducado y ya no puede ser completado.';
          this.isLoading = false;
        }
      },
      error: (err) => {
        console.error('Error verificando estado:', err);
        this.error = 'Error al verificar el estado del examen.';
        this.isLoading = false;
      }
    });
  }
  
  /**
   * Inicia un examen nuevo
   */
  iniciarExamen(examenId: string): void {
    this.examenesService.iniciarExamen({ examenId }).subscribe({
      next: (examen) => {
        this.examen = examen;
        this.tiempoRestante = examen.duracionMinutos * 60; // en segundos
        this.tiempoTotal = examen.duracionMinutos * 60;
        console.log('Examen iniciado:', examen);
        
        // Crear FormGroup con todas las preguntas
        this.crearFormularioRespuestas(examen.preguntas);
        
        this.isLoading = false;
        
        // Iniciar contador
        this.iniciarContador();
      },
      error: (err) => {
        console.error('Error iniciando examen:', err);
        this.error = 'Error al iniciar el examen. Por favor, intente de nuevo.';
        this.isLoading = false;
      }
    });
  }
  
  /**
   * Continúa un examen ya iniciado
   */
  continuarExamen(examenId: string): void {
    this.examenesService.continuarExamen(examenId).subscribe({
      next: (examen) => {
        this.examen = examen;
        console.log('Examen continuado:', examen);
        
        // Si el backend ya envía las preguntas ordenadas, no necesitamos hacer nada más
        // Pero si necesitamos ordenarlas explícitamente, podemos hacerlo así:
        if (this.examen && this.examen.preguntas) {
          // Ordenar preguntas por la propiedad orden si existe
          this.examen.preguntas.sort((a, b) => {
            // Si no tienen orden, mantener el orden original
            if (a.orden === undefined || b.orden === undefined) return 0;
            return a.orden - b.orden;
          });
        }
        
        // El resto del código sigue igual...
        this.crearFormularioRespuestas(examen.preguntas);
        
        if (examen.respuestasPrevias && examen.respuestasPrevias.length > 0) {
          this.cargarRespuestasPrevias(examen.respuestasPrevias);
        }
        
        this.isLoading = false;
        
        this.toastService.info(
          'Examen continuado', 
          'Has retomado el examen desde donde lo dejaste. El tiempo sigue corriendo.'
        );
      },
      error: (err) => {
        console.error('Error continuando examen:', err);
        this.error = 'Error al continuar el examen. Por favor, intente de nuevo.';
        this.isLoading = false;
      }
    });
  }

  /**
   * Método para cargar respuestas previas en el formulario
   */
  cargarRespuestasPrevias(respuestasPrevias: RespuestaPreviaDto[]): void {
    respuestasPrevias.forEach(respuesta => {
      if (respuesta.respuestaId) {
        this.respuestasForm.get(`pregunta_${respuesta.preguntaId}`)?.setValue(respuesta.respuestaId);
      }
    });
  }
  
  /**
   * Obtiene un examen (método obsoleto, mantenido por compatibilidad)
   * Ahora usamos continuarExamen en su lugar
   */
  obtenerExamen(examenId: string): void {
    // Este método ya no se usa, redirigimos a continuarExamen
    this.continuarExamen(examenId);
  }
  
  /**
   * Crea el formulario para las respuestas
   */
  crearFormularioRespuestas(preguntas: PreguntaExamen[]): void {
    const group: any = {};
    
    preguntas.forEach((pregunta) => {
      const control = this.fb.control('');
      group[`pregunta_${pregunta.id}`] = control;
      
      // Agregar listener a cada control para detectar cambios
      control.valueChanges.subscribe(value => {
        // Programar guardado cuando se selecciona una respuesta
        this.triggerSave('respuesta-cambiada');
      });
    });
    
    this.respuestasForm = this.fb.group(group);
  }
  
  /**
   * Inicia el contador regresivo
   */
  iniciarContador(): void {
    this.timerSubscription = interval(1000).subscribe(() => {
      if (this.tiempoRestante !== null && this.tiempoRestante > 0) {
        this.tiempoRestante--;
      } else {
        this.tiempoAgotado = true;
        this.finalizarExamen(true);
        
        if (this.timerSubscription) {
          this.timerSubscription.unsubscribe();
        }
      }
    });
  }
  
  /**
   * Formatea el tiempo en formato mm:ss
   */
  formatTiempo(segundos: number | null): string {
    if (segundos === null) return '--:--';
    
    const minutos = Math.floor(segundos / 60);
    const segs = segundos % 60;
    
    return `${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
  }
  
  /**
   * Obtiene el porcentaje de tiempo transcurrido
   */
  getPorcentajeTiempo(): number {
    if (this.tiempoRestante === null || this.tiempoTotal === 0) return 0;
    return 100 - Math.floor((this.tiempoRestante / this.tiempoTotal) * 100);
  }
  
  /**
   * Navega a la pregunta anterior
   */
  preguntaAnterior(): void {
    if (this.currentQuestionIndex > 0) {
      this.previousQuestionIndex = this.currentQuestionIndex;
      this.currentQuestionIndex--;
      this.triggerSave('cambio-pregunta');
    }
  }
  
  /**
   * Navega a la pregunta siguiente
   */
  preguntaSiguiente(): void {
    if (this.examen && this.currentQuestionIndex < this.examen.preguntas.length - 1) {
      this.previousQuestionIndex = this.currentQuestionIndex;
      this.currentQuestionIndex++;
      this.triggerSave('cambio-pregunta');
    }
  }

  /**
   * Navega directamente a una pregunta específica
   */
  cambiarAPregunta(index: number): void {
    if (this.examen && index >= 0 && index < this.examen.preguntas.length) {
      if (index !== this.currentQuestionIndex) {
        this.previousQuestionIndex = this.currentQuestionIndex;
        this.currentQuestionIndex = index;
        this.triggerSave('cambio-pregunta');
      }
    }
  }
  
  /**
   * Selecciona una respuesta para la pregunta actual
   */
  seleccionarRespuesta(preguntaId: string, respuestaId: string): void {
    this.respuestasForm.get(`pregunta_${preguntaId}`)?.setValue(respuestaId);
  }

  /**
   * Programa un guardado automático
   */
  private triggerSave(motivo: string): void {
    console.log(`Programando guardado automático por: ${motivo}`);
    this.saveSubject.next(motivo);
  }

  /**
   * Guarda las respuestas actuales sin finalizar el examen
   */
  private guardarRespuestasParciales(forzar: boolean = false): void {
    if (!this.examen || this.isSubmitting || this.isSaving || this.isSavingCancelled) return;
    
    this.isSaving = true;
    
    // Reunir todas las respuestas actuales
    const respuestas: RespuestaUsuarioDto[] = [];
    
    this.examen.preguntas.forEach(pregunta => {
      const respuestaId = this.respuestasForm.get(`pregunta_${pregunta.id}`)?.value || null;
      
      respuestas.push({
        preguntaId: pregunta.id,
        respuestaId
      });
    });
    
    // Guardar en el servidor
    this.examenesService.guardarRespuestasParciales({
      examenId: this.examen.id,
      respuestas
    }).pipe(
      finalize(() => {
        this.isSaving = false;
        this.lastSaveTime = new Date();
      })
    ).subscribe({
      next: (respuesta) => {
        console.log('Respuestas guardadas automáticamente.');
      },
      error: (err) => {
        // Ignorar específicamente errores 409 (Conflict) al finalizar el examen
        if (err.status !== 409 || forzar) {
          console.error('Error guardando respuestas automáticamente:', err);
        }
        // No mostramos error al usuario para no interrumpir su experiencia
      }
    });
  }
  
  /**
   * Verifica si una respuesta está seleccionada
   */
  isRespuestaSeleccionada(preguntaId: string, respuestaId: string): boolean {
    return this.respuestasForm.get(`pregunta_${preguntaId}`)?.value === respuestaId;
  }
  
  /**
   * Finaliza el examen y envía las respuestas
   */
  finalizarExamen(porTiempoAgotado: boolean = false): void {
    if (!this.examen || this.isSubmitting) return;
  
    // Marcar que estamos enviando y cancelar cualquier guardado
    this.isSubmitting = true;
    this.isSavingCancelled = true;
    
    if (this.saveSubscription) {
      this.saveSubscription.unsubscribe(); // Detener por completo la suscripción
      this.saveSubscription = null; // Limpiarla
    }
  
    // Reunir todas las respuestas, incluyendo las no contestadas como null
    const respuestas: RespuestaUsuarioDto[] = [];
  
    this.examen.preguntas.forEach(pregunta => {
      const respuestaId = this.respuestasForm.get(`pregunta_${pregunta.id}`)?.value || null;
  
      respuestas.push({
        preguntaId: pregunta.id,
        respuestaId
      });
    });
  
    // Verificar si hay respuestas sin contestar
    const preguntasSinResponder = respuestas.filter(r => r.respuestaId === null).length;
  
    // Mostrar confirmación solo si NO es por tiempo agotado y hay preguntas sin responder
    if (!porTiempoAgotado && preguntasSinResponder > 0) {
      if (!confirm(`Tiene ${preguntasSinResponder} pregunta(s) sin responder. ¿Desea finalizar el examen de todas formas?`)) {
        this.isSubmitting = false;
        return;
      }
    }
  
    // Enviar respuestas al servidor
    this.examenesService.enviarRespuestas({
      examenId: this.examen.id,
      respuestas
    }).pipe(
      finalize(() => this.isSubmitting = false)
    ).subscribe({
      next: (resultado) => {
        this.toastService.success(
          'Examen completado',
          `Ha obtenido ${resultado.puntuacionTotal} puntos (${resultado.porcentajeAcierto}% de aciertos)`
        );
        console.log('Examen enviado, estas son las respuestas', this.examenId, respuestas);
  
        // Redirigir a la página de resultados
        this.router.navigate(['/user/examenes/resultado', this.examen?.id]);
      },
      error: (err) => {
        console.error('Error enviando respuestas:', err);
        console.log(this.examenId, 'Respuestas del examen enviado con error:', respuestas);
  
        this.toastService.error(
          'Error al enviar respuestas',
          'No se pudo completar el examen. Por favor, intente de nuevo.'
        );
      }
    });
  }
  
  /**
   * Obtiene el número de preguntas respondidas
   */
  getPreguntasRespondidas(): number {
    if (!this.examen) return 0;
    
    return this.examen.preguntas.filter(pregunta => 
      this.respuestasForm.get(`pregunta_${pregunta.id}`)?.value
    ).length;
  }
  
  /**
   * Obtiene la clase CSS para un indicador de pregunta
   */
  getIndicadorClass(index: number): string {
    if (index === this.currentQuestionIndex) {
      return 'bg-accent text-white';
    }
    
    const pregunta = this.examen?.preguntas[index];
    
    if (pregunta && this.respuestasForm.get(`pregunta_${pregunta.id}`)?.value) {
      return 'bg-green-500 text-white';
    }
    
    return 'bg-surface-alt text-text-secondary hover:bg-slate-200 dark:hover:bg-slate-700';
  }
}