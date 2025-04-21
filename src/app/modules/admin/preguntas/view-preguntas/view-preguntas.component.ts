import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { 
  faPlus, 
  faSearch, 
  faFilter, 
  faEdit, 
  faTrash, 
  faSpinner, 
  faSort,
  faExclamationTriangle,
  faTimes 
} from '@fortawesome/free-solid-svg-icons';
import { debounceTime, distinctUntilChanged, tap, finalize, switchMap, of } from 'rxjs';
import { PaginationComponentComponent } from '../../../../shared/components/pagination/pagination.component';
import { ToastService } from '../../../../core/services/toast.service';
import { EspecialidadesService } from '../../../../core/services/especialidades.service';
import { BalotariosService } from '../../../../core/services/balotario.service';
import { TemasService } from '../../../../core/services/temas.service';
import { EspecialidadSelect } from '../../../../core/models/especialidad.model';
import { BalotarioSelect } from '../../../../core/models/balotario.model';
import { TemaSelect } from '../../../../core/models/tema.model';
import { NivelDificultad, Pregunta, Respuesta } from '../../../../core/models/pregunta.model';
import { PreguntasService } from '../../../../core/services/preguntas.service';

@Component({
  selector: 'app-view-preguntas',
  imports: [
    CommonModule, 
    RouterModule, 
    ReactiveFormsModule, 
    FontAwesomeModule,
    PaginationComponentComponent
  ],
  templateUrl: './view-preguntas.component.html',
  styleUrl: './view-preguntas.component.scss'
})
export default class ViewPreguntasComponent implements OnInit {
  private preguntasService = inject(PreguntasService);
  private especialidadesService = inject(EspecialidadesService);
  private balotariosService = inject(BalotariosService);
  private temasService = inject(TemasService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  
  // Iconos
  faPlus = faPlus;
  faSearch = faSearch;
  faFilter = faFilter;
  faEdit = faEdit;
  faTrash = faTrash;
  faSpinner = faSpinner;
  faSort = faSort;
  faExclamationTriangle = faExclamationTriangle;
  faTimes = faTimes;
  
  // Estado del componente
  preguntas: Pregunta[] = [];
  especialidades: EspecialidadSelect[] = [];
  balotarios: BalotarioSelect[] = [];
  temas: TemaSelect[] = [];
  isLoading = false;
  error: string | null = null;
  
  // Enums para plantilla
  nivelDificultad = NivelDificultad;
  
  // Filtros
  filterForm = new FormGroup({
    search: new FormControl(''),
    especialidadId: new FormControl<string>(''),
    balotarioId: new FormControl<string>({value: '', disabled: true}),
    temaId: new FormControl<string>({value: '', disabled: true}),
    nivelDificultad: new FormControl<string>(''),
    showFilters: new FormControl(false)
  });
  
  // Paginación
  currentPage = 1;
  totalItems = 0;
  totalPages = 0;
  itemsPerPage = 10;
  
  // Ordenamiento
  sortBy = 'createdAt';
  sortOrder: 'ASC' | 'DESC' = 'DESC';
  
  ngOnInit(): void {
    // Configurar filtros
    this.filterForm.get('search')?.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.currentPage = 1;
      this.loadPreguntas();
    });
    
    this.filterForm.get('nivelDificultad')?.valueChanges.subscribe(() => {
      this.currentPage = 1;
      this.loadPreguntas();
    });
    
    // Configurar filtros en cascada
    this.filterForm.get('especialidadId')?.valueChanges.pipe(
      tap(especialidadId => {
        // Resetear controles dependientes
        this.filterForm.get('balotarioId')?.setValue('');
        this.filterForm.get('temaId')?.setValue('');
        
        // Deshabilitar/habilitar controles dependientes
        if (especialidadId) {
          this.filterForm.get('balotarioId')?.enable();
        } else {
          this.filterForm.get('balotarioId')?.disable();
          this.filterForm.get('temaId')?.disable();
        }
        
        // Limpiar opciones de balotarios y temas si no hay especialidad
        if (!especialidadId) {
          this.balotarios = [];
          this.temas = [];
        }
      }),
      switchMap(especialidadId => {
        // Si hay especialidad seleccionada, cargar sus balotarios
        if (especialidadId) {
          this.isLoading = true;
          return this.balotariosService.getBalotariosForSelect(especialidadId)
            .pipe(finalize(() => this.isLoading = false));
        }
        return of([]);
      })
    ).subscribe(balotarios => {
      this.balotarios = balotarios;
      this.loadPreguntas();
    });
    
    this.filterForm.get('balotarioId')?.valueChanges.pipe(
      tap(balotarioId => {
        // Resetear tema
        this.filterForm.get('temaId')?.setValue('');
        
        // Deshabilitar/habilitar tema
        if (balotarioId) {
          this.filterForm.get('temaId')?.enable();
        } else {
          this.filterForm.get('temaId')?.disable();
        }
        
        // Limpiar opciones de temas si no hay balotario
        if (!balotarioId) {
          this.temas = [];
        }
      }),
      switchMap(balotarioId => {
        // Si hay balotario seleccionado, cargar sus temas
        if (balotarioId) {
          this.isLoading = true;
          return this.temasService.getTemasForSelect(balotarioId)
            .pipe(finalize(() => this.isLoading = false));
        }
        return of([]);
      })
    ).subscribe(temas => {
      this.temas = temas;
      this.loadPreguntas();
    });
    
    this.filterForm.get('temaId')?.valueChanges.subscribe(() => {
      this.currentPage = 1;
      this.loadPreguntas();
    });
    
    // Cargar especialidades para filtro
    this.loadEspecialidades();
  }
  
  /**
   * Carga las especialidades para el filtro
   */
  loadEspecialidades(): void {
    this.isLoading = true;
    this.especialidadesService.getEspecialidadesForSelect()
      .pipe(finalize(() => this.isLoading = false))
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
   * Carga las preguntas desde el servidor
   */
  loadPreguntas(): void {
    this.isLoading = true;
    this.error = null;
    
    const searchTerm = this.filterForm.get('search')?.value || '';
    const temaId = this.filterForm.get('temaId')?.value || undefined;
    const nivelDificultad = this.filterForm.get('nivelDificultad')?.value || undefined;
    
    this.preguntasService.getPreguntas(
      this.currentPage,
      this.itemsPerPage,
      searchTerm,
      temaId,
      nivelDificultad as NivelDificultad,
      undefined, // activo
      this.sortBy,
      this.sortOrder
    ).subscribe({
      next: (response) => {
        this.preguntas = response.data;
        this.totalItems = response.meta.totalItems;
        this.totalPages = response.meta.totalPages;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar preguntas. Por favor, intente de nuevo.';
        this.isLoading = false;
        console.error('Error cargando preguntas:', err);
      }
    });
  }
  
  /**
   * Cambia el orden de los resultados
   */
  toggleSort(field: string): void {
    if (this.sortBy === field) {
      this.sortOrder = this.sortOrder === 'ASC' ? 'DESC' : 'ASC';
    } else {
      this.sortBy = field;
      this.sortOrder = 'ASC';
    }
    
    this.loadPreguntas();
  }
  
  /**
   * Navega a la página de edición de pregunta
   */
  onEditPregunta(id: string): void {
    this.router.navigate(['/admin/preguntas/edit', id]);
  }
  
  /**
   * Elimina una pregunta
   */
  onDeletePregunta(id: string, texto: string): void {
    if (confirm(`¿Está seguro que desea eliminar la pregunta: "${texto.substring(0, 50)}..."?`)) {
      this.isLoading = true;
      this.preguntasService.deletePregunta(id).subscribe({
        next: () => {
          this.toastService.success(
            'Pregunta eliminada',
            `La pregunta se ha eliminado correctamente.`
          );
          this.loadPreguntas();
        },
        error: (err) => {
          this.toastService.error(
            'Error al eliminar',
            'No se pudo eliminar la pregunta. Por favor, intente de nuevo.'
          );
          this.isLoading = false;
          console.error('Error eliminando pregunta:', err);
        }
      });
    }
  }
  
  /**
   * Maneja el cambio de página
   */
  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadPreguntas();
  }
  
  /**
   * Limpia todos los filtros
   */
  clearFilters(): void {
    this.filterForm.patchValue({
      search: '',
      especialidadId: '',
      balotarioId: '',
      temaId: '',
      nivelDificultad: ''
    });
    
    // Deshabilitar controles en cascada
    this.filterForm.get('balotarioId')?.disable();
    this.filterForm.get('temaId')?.disable();
    
    // Limpiar listas dependientes
    this.balotarios = [];
    this.temas = [];
    
    this.loadPreguntas();
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
  
  /**
   * Formatea el nivel de dificultad para mostrar en pantalla
   */
  formatDificultad(nivel: string): string {
    switch (nivel) {
      case NivelDificultad.FACIL:
        return 'Fácil';
      case NivelDificultad.MEDIO:
        return 'Medio';
      case NivelDificultad.DIFICIL:
        return 'Difícil';
      default:
        return nivel;
    }
  }
  
  /**
   * Navega a la página de creación masiva de preguntas
   */
  onCreateMasivo(): void {
    this.router.navigate(['/admin/preguntas/create-masivo']);
  }

  /**
   * Cuenta el número de respuestas correctas en una pregunta
   */
  countCorrectAnswers(respuestas: Respuesta[]): number {
    if (!respuestas) return 0;
    return respuestas.filter(r => r.esCorrecta).length;
  }
}