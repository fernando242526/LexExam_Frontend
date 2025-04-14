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
import { Balotario } from '../../../../core/models/balotario.model';
import { EspecialidadSelect } from '../../../../core/models/especialidad.model';
import { EspecialidadesService } from '../../../../core/services/especialidades.service';
import { BalotariosService } from '../../../../core/services/balotario.service';
import { ToastService } from '../../../../core/services/toast.service';

/**
 * Componente para listar y gestionar balotarios
 */
@Component({
  selector: 'app-view-balotarios',
  imports: [
    CommonModule, 
    RouterModule, 
    ReactiveFormsModule, 
    FontAwesomeModule,
    PaginationComponentComponent
  ],
  templateUrl: './view-balotarios.component.html',
  styleUrl: './view-balotarios.component.scss'
})
export default class ViewBalotariosComponent implements OnInit {
  private balotariosService = inject(BalotariosService);
  private especialidadesService = inject(EspecialidadesService);
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
  balotarios: Balotario[] = [];
  especialidades: EspecialidadSelect[] = [];
  isLoading = true;
  error: string | null = null;
  
  // Filtros
  filterForm = new FormGroup({
    search: new FormControl(''),
    especialidadId: new FormControl(''),
    anio: new FormControl<number | null>(null),
    showFilters: new FormControl(false)
  });
  
  // Paginación
  currentPage = 1;
  totalItems = 0;
  totalPages = 0;
  itemsPerPage = 10;
  
  // Ordenamiento
  sortBy = 'nombre';
  sortOrder: 'ASC' | 'DESC' = 'ASC';
  
  ngOnInit(): void {
    // Configurar filtros
    this.filterForm.get('search')?.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.currentPage = 1;
      this.loadBalotarios();
    });
    
    this.filterForm.get('especialidadId')?.valueChanges.subscribe(() => {
      this.currentPage = 1;
      this.loadBalotarios();
    });
    
    this.filterForm.get('anio')?.valueChanges.subscribe(() => {
      this.currentPage = 1;
      this.loadBalotarios();
    });
    
    // Cargar especialidades para filtro
    this.loadEspecialidades();
    
    // Cargar datos iniciales
    this.loadBalotarios();
  }
  
  /**
   * Carga las especialidades para el filtro
   */
  loadEspecialidades(): void {
    this.especialidadesService.getEspecialidadesForSelect().subscribe({
      next: (especialidades) => {
        this.especialidades = especialidades;
      },
      error: (err) => {
        console.error('Error cargando especialidades:', err);
      }
    });
  }
  
  /**
   * Carga los balotarios desde el servidor
   */
  loadBalotarios(): void {
    this.isLoading = true;
    this.error = null;
    
    const searchTerm = this.filterForm.get('search')?.value || '';
    const especialidadId = this.filterForm.get('especialidadId')?.value || '';
    const anio = this.filterForm.get('anio')?.value || undefined;
    
    this.balotariosService.getBalotarios(
      this.currentPage,
      this.itemsPerPage,
      searchTerm,
      undefined, // institución
      anio,
      especialidadId,
      undefined, // activo
      this.sortBy,
      this.sortOrder
    ).subscribe({
      next: (response) => {
        this.balotarios = response.data;
        this.totalItems = response.meta.totalItems;
        this.totalPages = response.meta.totalPages;
        this.isLoading = false;
        console.log(response);
        
      },
      error: (err) => {
        this.error = 'Error al cargar balotarios. Por favor, intente de nuevo.';
        this.isLoading = false;
        console.error('Error cargando balotarios:', err);
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
    
    this.loadBalotarios();
  }
  
  /**
   * Navega a la página de edición de balotario
   */
  onEditBalotario(id: string): void {
    this.router.navigate(['/admin/balotarios/edit', id]);
  }
  
  /**
   * Elimina un balotario
   */
  onDeleteBalotario(id: string, nombre: string): void {
    if (confirm(`¿Está seguro que desea eliminar el balotario "${nombre}"?`)) {
      this.isLoading = true;
      this.balotariosService.deleteBalotario(id).subscribe({
        next: () => {
          this.toastService.success(
            'Balotario eliminado',
            `El balotario "${nombre}" se ha eliminado correctamente.`
          );
          this.loadBalotarios();
        },
        error: (err) => {
          this.toastService.error(
            'Error al eliminar',
            'No se pudo eliminar el balotario. Por favor, intente de nuevo.'
          );
          this.isLoading = false;
          console.error('Error eliminando balotario:', err);
        }
      });
    }
  }
  
  /**
   * Cambia el estado activo/inactivo de un balotario
   */
  onToggleStatus(id: string, activo: boolean, nombre: string): void {
    this.isLoading = true;
    this.balotariosService.updateBalotario(id, { activo: !activo }).subscribe({
      next: () => {
        // Actualizar solo el balotario modificado
        const index = this.balotarios.findIndex(b => b.id === id);
        if (index !== -1) {
          this.balotarios[index].activo = !activo;
        }
        this.isLoading = false;
        
        this.toastService.success(
          'Estado actualizado',
          `El balotario "${nombre}" ha sido ${!activo ? 'activado' : 'desactivado'}.`
        );
      },
      error: (err) => {
        this.toastService.error(
          'Error al cambiar estado',
          'No se pudo actualizar el estado del balotario.'
        );
        this.isLoading = false;
        console.error('Error actualizando balotario:', err);
      }
    });
  }
  
  /**
   * Maneja el cambio de página
   */
  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadBalotarios();
  }
  
  /**
   * Limpia todos los filtros
   */
  clearFilters(): void {
    this.filterForm.patchValue({
      search: '',
      especialidadId: '',
      anio: null
    });
    this.loadBalotarios();
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