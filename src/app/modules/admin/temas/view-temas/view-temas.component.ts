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
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { PaginationComponentComponent } from '../../../../shared/components/pagination/pagination.component';
import { Tema } from '../../../../core/models/tema.model';
import { TemasService } from '../../../../core/services/temas.service';
import { ToastService } from '../../../../core/services/toast.service';
import { BalotariosService } from '../../../../core/services/balotario.service';
import { BalotarioSelect } from '../../../../core/models/balotario.model';

/**
 * Componente para listar y gestionar temas
 */
@Component({
  selector: 'app-view-temas',
  imports: [
    CommonModule, 
    RouterModule, 
    ReactiveFormsModule, 
    FontAwesomeModule,
    PaginationComponentComponent
  ],
  templateUrl: './view-temas.component.html',
  styleUrl: './view-temas.component.scss'
})
export default class ViewTemasComponent implements OnInit {
  private temasService = inject(TemasService);
  private balotariosService = inject(BalotariosService);
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
  temas: Tema[] = [];
  balotarios: BalotarioSelect[] = [];
  isLoading = true;
  error: string | null = null;
  
  // Filtros
  filterForm = new FormGroup({
    search: new FormControl(''),
    balotarioId: new FormControl(''),
    showFilters: new FormControl(false)
  });
  
  // Paginación
  currentPage = 1;
  totalItems = 0;
  totalPages = 0;
  itemsPerPage = 10;
  
  // Ordenamiento
  sortBy = 'orden';
  sortOrder: 'ASC' | 'DESC' = 'ASC';
  
  ngOnInit(): void {
    // Configurar filtros
    this.filterForm.get('search')?.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.currentPage = 1;
      this.loadTemas();
    });
    
    this.filterForm.get('balotarioId')?.valueChanges.subscribe(() => {
      this.currentPage = 1;
      this.loadTemas();
    });
    
    // Cargar balotarios para filtro
    this.loadBalotarios();
    
    // Cargar datos iniciales
    this.loadTemas();
  }
  
  /**
   * Carga los balotarios para el filtro
   */
  loadBalotarios(): void {
    this.balotariosService.getBalotariosForSelect().subscribe({
      next: (balotarios) => {
        this.balotarios = balotarios;
      },
      error: (err) => {
        console.error('Error cargando balotarios:', err);
      }
    });
  }
  
  /**
   * Carga los temas desde el servidor
   */
  loadTemas(): void {
    this.isLoading = true;
    this.error = null;
    
    const searchTerm = this.filterForm.get('search')?.value || '';
    const balotarioId = this.filterForm.get('balotarioId')?.value || '';
    
    this.temasService.getTemas(
      this.currentPage,
      this.itemsPerPage,
      searchTerm,
      balotarioId,
      undefined, // activo
      this.sortBy,
      this.sortOrder
    ).subscribe({
      next: (response) => {
        this.temas = response.data;
        this.totalItems = response.meta.totalItems;
        this.totalPages = response.meta.totalPages;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar temas. Por favor, intente de nuevo.';
        this.isLoading = false;
        console.error('Error cargando temas:', err);
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
    
    this.loadTemas();
  }
  
  /**
   * Navega a la página de edición de tema
   */
  onEditTema(id: string): void {
    this.router.navigate(['/admin/temas/edit', id]);
  }
  
  /**
   * Elimina un tema
   */
  onDeleteTema(id: string, titulo: string): void {
    if (confirm(`¿Está seguro que desea eliminar el tema "${titulo}"?`)) {
      this.isLoading = true;
      this.temasService.deleteTema(id).subscribe({
        next: () => {
          this.toastService.success(
            'Tema eliminado',
            `El tema "${titulo}" se ha eliminado correctamente.`
          );
          this.loadTemas();
        },
        error: (err) => {
          this.toastService.error(
            'Error al eliminar',
            'No se pudo eliminar el tema. Por favor, intente de nuevo.'
          );
          this.isLoading = false;
          console.error('Error eliminando tema:', err);
        }
      });
    }
  }
  
  /**
   * Cambia el estado activo/inactivo de un tema
   */
  onToggleStatus(id: string, activo: boolean, titulo: string): void {
    this.isLoading = true;
    this.temasService.updateTema(id, { activo: !activo }).subscribe({
      next: () => {
        // Actualizar solo el tema modificado
        const index = this.temas.findIndex(t => t.id === id);
        if (index !== -1) {
          this.temas[index].activo = !activo;
        }
        this.isLoading = false;
        
        this.toastService.success(
          'Estado actualizado',
          `El tema "${titulo}" ha sido ${!activo ? 'activado' : 'desactivado'}.`
        );
      },
      error: (err) => {
        this.toastService.error(
          'Error al cambiar estado',
          'No se pudo actualizar el estado del tema.'
        );
        this.isLoading = false;
        console.error('Error actualizando tema:', err);
      }
    });
  }
  
  /**
   * Maneja el cambio de página
   */
  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadTemas();
  }
  
  /**
   * Limpia todos los filtros
   */
  clearFilters(): void {
    this.filterForm.patchValue({
      search: '',
      balotarioId: ''
    });
    this.loadTemas();
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