import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { 
  faBook, 
  faFilter, 
  faSearch, 
  faSpinner, 
  faCalendarAlt, 
  faQuestionCircle, 
  faClock, 
  faCircleCheck, 
  faExclamationTriangle,
  faTimes,
  faPlay
} from '@fortawesome/free-solid-svg-icons';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { PaginationComponentComponent } from '../../../../shared/components/pagination/pagination.component';
import { TemasService } from '../../../../core/services/temas.service';
import { ToastService } from '../../../../core/services/toast.service';
import { TemaSelect } from '../../../../core/models/tema.model';
import { ExamenesService } from '../../../../core/services/examenes.service';
import { EstadoExamen, Examen, FiltroExamen } from '../../../../core/models/examenes.model';

@Component({
  selector: 'app-view-examenes',
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    PaginationComponentComponent
  ],
  templateUrl: './view-examenes.component.html',
  styleUrl: './view-examenes.component.scss'
})
export default class ViewExamenesComponent implements OnInit {
  private examenesService = inject(ExamenesService);
  private temasService = inject(TemasService);
  private toastService = inject(ToastService);
  
  // Iconos de FontAwesome
  faBook = faBook;
  faFilter = faFilter;
  faSearch = faSearch;
  faSpinner = faSpinner;
  faCalendarAlt = faCalendarAlt;
  faQuestionCircle = faQuestionCircle;
  faClock = faClock;
  faCircleCheck = faCircleCheck;
  faExclamationTriangle = faExclamationTriangle;
  faTimes = faTimes;
  faPlay = faPlay;
  
  // Enums para usar en el template
  estadoExamen = EstadoExamen;
  
  // Estado del componente
  examenes: Examen[] = [];
  temas: TemaSelect[] = [];
  isLoading = false;
  error: string | null = null;
  
  // Filtros
  filterForm = new FormGroup({
    search: new FormControl(''),
    temaId: new FormControl<string>(''),
    estado: new FormControl<EstadoExamen | ''>(''),
    showFilters: new FormControl(false)
  });
  
  // Paginación
  currentPage = 1;
  totalItems = 0;
  totalPages = 0;
  itemsPerPage = 12; // Mostramos más items por ser cards
  
  ngOnInit(): void {
    // Configurar filtros
    this.filterForm.get('search')?.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.currentPage = 1;
      this.loadExamenes();
    });
    
    this.filterForm.get('temaId')?.valueChanges.subscribe(() => {
      this.currentPage = 1;
      this.loadExamenes();
    });
    
    this.filterForm.get('estado')?.valueChanges.subscribe(() => {
      this.currentPage = 1;
      this.loadExamenes();
    });
    
    // Cargar temas para el filtro
    this.loadTemas();
    
    // Cargar datos iniciales
    this.loadExamenes();
  }
  
  /**
   * Carga los temas para el filtro
   */
  loadTemas(): void {
    this.temasService.getTemasForSelect().subscribe({
      next: (temas) => {
        this.temas = temas;
      },
      error: (err) => {
        console.error('Error cargando temas:', err);
        this.toastService.error('Error', 'No se pudieron cargar los temas');
      }
    });
  }
  
  /**
   * Carga los exámenes según los filtros aplicados
   */
  loadExamenes(): void {
    this.isLoading = true;
    this.error = null;
    
    const filtros: FiltroExamen = {
      page: this.currentPage,
      limit: this.itemsPerPage,
      temaId: this.filterForm.get('temaId')?.value || undefined,
      estado: this.filterForm.get('estado')?.value as EstadoExamen || undefined,
      sortBy: 'createdAt',
      order: 'DESC'
    };
    
    this.examenesService.getExamenes(filtros).subscribe({
      next: (response) => {
        this.examenes = response.data;
        this.totalItems = response.meta.totalItems;
        this.totalPages = response.meta.totalPages;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar exámenes. Por favor, intente de nuevo.';
        this.isLoading = false;
        console.error('Error cargando exámenes:', err);
      }
    });
  }
  
  /**
   * Formatea la clase CSS según el estado del examen
   */
  getEstadoClass(estado: EstadoExamen): string {
    switch (estado) {
      case EstadoExamen.PENDIENTE:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case EstadoExamen.INICIADO:
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      case EstadoExamen.FINALIZADO:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case EstadoExamen.CADUCADO:
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  }
  
  /**
   * Obtiene el texto formateado según el estado del examen
   */
  getEstadoText(estado: EstadoExamen): string {
    switch (estado) {
      case EstadoExamen.PENDIENTE:
        return 'Pendiente';
      case EstadoExamen.INICIADO:
        return 'En progreso';
      case EstadoExamen.FINALIZADO:
        return 'Finalizado';
      case EstadoExamen.CADUCADO:
        return 'Caducado';
      default:
        return estado;
    }
  }
  
  /**
   * Maneja el cambio de página
   */
  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadExamenes();
  }
  
  /**
   * Limpia todos los filtros
   */
  clearFilters(): void {
    this.filterForm.patchValue({
      search: '',
      temaId: '',
      estado: ''
    });
    this.loadExamenes();
  }
  
  /**
   * Alterna la visibilidad de los filtros avanzados
   */
  toggleFilters(): void {
    const showFilters = this.filterForm.get('showFilters');
    if (showFilters) {
      showFilters.setValue(!showFilters.value);
    }
  }
}