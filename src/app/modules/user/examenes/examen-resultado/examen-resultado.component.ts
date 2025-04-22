import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { 
  faArrowLeft, 
  faCheckCircle, 
  faTimesCircle, 
  faSpinner, 
  faExclamationTriangle,
  faBook,
  faHome,
  faChartPie,
  faClock,
  faCalendarAlt,
  faQuestionCircle,
  faInfoCircle,
  faRedo
} from '@fortawesome/free-solid-svg-icons';

import { ToastService } from '../../../../core/services/toast.service';
import { ExamenesService } from '../../../../core/services/examenes.service';
import { ResultadoExamen } from '../../../../core/models/examenes.model';

@Component({
  selector: 'app-examen-resultado',
  standalone: true,
  imports: [CommonModule, RouterModule, FontAwesomeModule],
  templateUrl: './examen-resultado.component.html',
  styleUrls: ['./examen-resultado.component.scss']
})
export default class ExamenResultadoComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private examenesService = inject(ExamenesService);
  private toastService = inject(ToastService);
  
  // Iconos
  faArrowLeft = faArrowLeft;
  faCheckCircle = faCheckCircle;
  faTimesCircle = faTimesCircle;
  faSpinner = faSpinner;
  faExclamationTriangle = faExclamationTriangle;
  faBook = faBook;
  faHome = faHome;
  faChartPie = faChartPie;
  faClock = faClock;
  faCalendarAlt = faCalendarAlt;
  faQuestionCircle = faQuestionCircle;
  faInfoCircle = faInfoCircle;
  faRedo = faRedo;
  
  // Estados
  isLoading = true;
  error: string | null = null;
  examenId: string | null = null;
  resultado: ResultadoExamen | null = null;
  
  // Mostrar/ocultar explicaciones
  showExplanations = false;
  
  ngOnInit(): void {
    this.examenId = this.route.snapshot.paramMap.get('id');
    
    if (this.examenId) {
      this.cargarResultado(this.examenId);
    } else {
      this.error = 'ID de examen no especificado';
      this.isLoading = false;
    }
  }
  
  /**
   * Carga el resultado del examen
   */
  cargarResultado(examenId: string): void {
    this.isLoading = true;
    
    this.examenesService.getResultadoExamen(examenId).subscribe({
      next: (resultado) => {
        this.resultado = resultado;
        console.log('Resultado del examen:', resultado);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando resultado:', err);
        this.error = 'Error al cargar el resultado del examen. Por favor, intente de nuevo.';
        this.isLoading = false;
      }
    });
  }
  
  /**
   * Determina la clase CSS para el porcentaje de acierto
   */
  getPorcentajeClass(porcentaje: number): string {
    if (porcentaje >= 80) {
      return 'text-green-600 dark:text-green-400';
    } else if (porcentaje >= 60) {
      return 'text-blue-600 dark:text-blue-400';
    } else if (porcentaje >= 40) {
      return 'text-amber-600 dark:text-amber-400';
    } else {
      return 'text-bordeaux-600 dark:text-bordeaux-400';
    }
  }
  
  /**
   * Alterna mostrar/ocultar explicaciones
   */
  toggleExplanations(): void {
    this.showExplanations = !this.showExplanations;
  }
  
  /**
   * Navega a la página de creación de examen para el mismo tema
   */
  crearNuevoExamen(): void {
    if (this.resultado?.examen?.temaId) {
      // Redirigir a la página de creación de examen con el mismo tema preseleccionado
      this.router.navigate(['/user/examenes/crear'], { 
        queryParams: { 
          temaId: this.resultado.examen.temaId 
        } 
      });
    } else {
      this.router.navigate(['user//examenes/crear']);
    }
  }
  
  /**
   * Formatea la duración del examen
   */
  formatDuracion(minutos: number): string {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    
    if (horas > 0) {
      return `${horas}h ${mins}m`;
    }
    
    return `${mins} min`;
  }
}