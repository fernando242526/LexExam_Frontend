import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus, faSearch, faEdit, faTrash, faSpinner, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { PaginationComponentComponent } from '../../../../shared/components/pagination/pagination.component';
import { EspecialidadesService } from '../../../../core/services/especialidades.service';
import { Especialidad } from '../../../../core/models/especialidad.model';

/**
 * Componente para listar y gestionar especialidades
 */
@Component({
  selector: 'app-view-especialidades',
  imports: [CommonModule, 
    RouterModule, 
    ReactiveFormsModule, 
    FontAwesomeModule,
    PaginationComponentComponent
  ],
  templateUrl: './view-especialidades.component.html',
  styleUrl: './view-especialidades.component.scss'
})
export default class ViewEspecialidadesComponent implements OnInit {

  private especialidadesService = inject(EspecialidadesService);
  private router = inject(Router);
  
  // Iconos
  faPlus = faPlus;
  faSearch = faSearch;
  faEdit = faEdit;
  faTrash = faTrash;
  faSpinner = faSpinner;
  faExclamationTriangle = faExclamationTriangle;
  
  // Estado del componente
  especialidades: Especialidad[] = [];
  isLoading = true;
  error: string | null = null;
  searchControl = new FormControl('');
  
  // Paginación
  currentPage = 1;
  totalItems = 0;
  totalPages = 0;
  itemsPerPage = 10;
  
  ngOnInit(): void {
    // Configurar búsqueda
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.currentPage = 1;
      this.loadEspecialidades();
    });
    
    // Cargar datos iniciales
    this.loadEspecialidades();
  }
  
  /**
   * Carga las especialidades desde el servidor
   */
  loadEspecialidades(): void {
    this.isLoading = true;
    this.error = null;
    
    const searchTerm = this.searchControl.value || '';
    
    this.especialidadesService.getEspecialidades(
      this.currentPage, 
      this.itemsPerPage,
      searchTerm
    ).subscribe({
      next: (response) => {
        this.especialidades = response.data;
        this.totalItems = response.meta.totalItems;
        this.totalPages = response.meta.totalPages;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar especialidades. Por favor, intente de nuevo.';
        this.isLoading = false;
        console.error('Error cargando especialidades:', err);
      }
    });
  }
  
  /**
   * Navega a la página de edición de especialidad
   */
  onEditEspecialidad(id: string): void {
    this.router.navigate(['/admin/especialidades/edit', id]);
  }
  
  /**
   * Elimina una especialidad
   */
  onDeleteEspecialidad(id: string, nombre: string): void {
    if (confirm(`¿Está seguro que desea eliminar la especialidad "${nombre}"?`)) {
      this.isLoading = true;
      this.especialidadesService.deleteEspecialidad(id).subscribe({
        next: () => {
          this.loadEspecialidades();
        },
        error: (err) => {
          this.error = 'Error al eliminar la especialidad. Por favor, intente de nuevo.';
          this.isLoading = false;
          console.error('Error eliminando especialidad:', err);
        }
      });
    }
  }
  
  /**
   * Cambia el estado activo/inactivo de una especialidad
   */
  onToggleStatus(id: string, activo: boolean): void {
    this.isLoading = true;
    this.especialidadesService.updateEspecialidad(id, { activo: !activo }).subscribe({
      next: () => {
        // Actualizar solo la especialidad modificada
        const index = this.especialidades.findIndex(esp => esp.id === id);
        if (index !== -1) {
          this.especialidades[index].activo = !activo;
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Error al cambiar el estado de la especialidad. Por favor, intente de nuevo.';
        this.isLoading = false;
        console.error('Error actualizando especialidad:', err);
      }
    });
  }
  
  /**
   * Maneja el cambio de página
   */
  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadEspecialidades();
  }

}
