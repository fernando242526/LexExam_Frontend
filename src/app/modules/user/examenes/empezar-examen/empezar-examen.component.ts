import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { finalize, interval, Subscription } from 'rxjs';

import { ToastService } from '../../../../core/services/toast.service';
import { 
  ExamenConPreguntas, 
  EstadoExamen, 
  PreguntaExamen, 
  RespuestaUsuarioDto 
} from '../../../../core/models/examenes.model';
import { ExamenesService } from '../../../../core/services/examenes.service';

@Component({
  selector: 'app-empezar-examen',
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FontAwesomeModule
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
  
  // Formulario para capturar respuestas
  respuestasForm: FormGroup;
  
  // Control de pregunta actual
  currentQuestionIndex = 0;
  
  // Control de tiempo
  tiempoRestante: number | null = null;
  tiempoTotal: number = 0;
  tiempoAgotado = false;
  timerSubscription?: Subscription;
  
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
  }
  
  ngOnDestroy(): void {
    // Detener el timer cuando se destruye el componente
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
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
          // Si ya está iniciado, obtenemos el tiempo restante
          this.tiempoRestante = estado.tiempoRestante;
          this.tiempoTotal = estado.tiempoTotal;
          
          // Cargamos el examen
          this.obtenerExamen(examenId);
          
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
   * Obtiene un examen ya iniciado
   */
  obtenerExamen(examenId: string): void {
    this.examenesService.getExamen(examenId).subscribe({
      next: (examen) => {
        // Creamos nuestro propio objeto ExamenConPreguntas ya que la API 
        // no devuelve las preguntas al obtener un examen ya iniciado
        // Esta parte podría requerir un endpoint adicional en el backend
        
        // Por ahora, como solución temporal, redirigimos a la lista
        this.toastService.warning(
          'Sesión de examen no disponible', 
          'No se pudieron recuperar las preguntas de un examen en progreso. Por favor, inicie un nuevo examen.'
        );
        this.router.navigate(['/examenes']);
        
        // En un caso real, obtendrías las preguntas de algún modo y continuarías
        // this.examen = { ...examen, preguntas: [] };
        // this.crearFormularioRespuestas(this.examen.preguntas);
        // this.isLoading = false;
      },
      error: (err) => {
        console.error('Error obteniendo examen:', err);
        this.error = 'Error al cargar el examen. Por favor, intente de nuevo.';
        this.isLoading = false;
      }
    });
  }
  
  /**
   * Crea el formulario para las respuestas
   */
  crearFormularioRespuestas(preguntas: PreguntaExamen[]): void {
    const group: any = {};
    
    preguntas.forEach((pregunta, index) => {
      group[`pregunta_${pregunta.id}`] = this.fb.control('');
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
      this.currentQuestionIndex--;
    }
  }
  
  /**
   * Navega a la pregunta siguiente
   */
  preguntaSiguiente(): void {
    if (this.examen && this.currentQuestionIndex < this.examen.preguntas.length - 1) {
      this.currentQuestionIndex++;
    }
  }
  
  /**
   * Selecciona una respuesta para la pregunta actual
   */
  seleccionarRespuesta(preguntaId: string, respuestaId: string): void {
    this.respuestasForm.get(`pregunta_${preguntaId}`)?.setValue(respuestaId);
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
    if (!this.examen) return;
    
    this.isSubmitting = true;
    
    // Si finalizó por tiempo agotado y no fue confirmado por el usuario
    if (porTiempoAgotado && !confirm('El tiempo ha terminado. ¿Desea enviar las respuestas?')) {
      this.isSubmitting = false;
      this.router.navigate(['/examenes']);
      return;
    }
    
    // Reunir todas las respuestas seleccionadas
    const respuestas: RespuestaUsuarioDto[] = [];
    
    this.examen.preguntas.forEach(pregunta => {
      const respuestaId = this.respuestasForm.get(`pregunta_${pregunta.id}`)?.value;
      
      if (respuestaId) {
        respuestas.push({
          preguntaId: pregunta.id,
          respuestaId
        });
      }
    });
    
    // Verificar si hay respuestas sin contestar
    const preguntasSinResponder = this.examen.preguntas.length - respuestas.length;
    
    if (preguntasSinResponder > 0 && !porTiempoAgotado) {
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
        
        // Redirigir a la página de resultados
        this.router.navigate(['/examenes/resultado', this.examen?.id]);
      },
      error: (err) => {
        console.error('Error enviando respuestas:', err);
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