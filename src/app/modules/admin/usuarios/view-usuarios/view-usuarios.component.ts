import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { 
  faPlus, 
  faSearch, 
  faFilter, 
  faEye, 
  faUserCog, 
  faSpinner, 
  faExclamationTriangle,
  faTimes 
} from '@fortawesome/free-solid-svg-icons';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { PaginationComponentComponent } from '../../../../shared/components/pagination/pagination.component';
import { ToastService } from '../../../../core/services/toast.service';
import { UsuariosService } from '../../../../core/services/usuarios.service';
import { RolUsuario } from '../../../../core/models/usuario.model';

/**
 * Componente para listar y gestionar usuarios
 */
@Component({
  selector: 'app-view-usuarios',
  imports: [
    CommonModule, 
    RouterModule, 
    ReactiveFormsModule, 
    FontAwesomeModule,
    PaginationComponentComponent
  ],
  templateUrl: './view-usuarios.component.html',
  styleUrl: './view-usuarios.component.scss'
})
export default class ViewUsuariosComponent implements OnInit {
  private usuariosService = inject(UsuariosService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  
  // Iconos
  faPlus = faPlus;
  faSearch = faSearch;
  faFilter = faFilter;
  faEye = faEye;
  faUserCog = faUserCog;
  faSpinner = faSpinner;
  faExclamationTriangle = faExclamationTriangle;
  faTimes = faTimes;
  
  // Estado del componente
  usuarios: any[] = [];
  isLoading = true;
  error: string | null = null;
  
  // Filtros
  filterForm = new FormGroup({
    search: new FormControl(''),
    rol: new FormControl(''),
    activo: new FormControl<boolean | null>(null),
    showFilters: new FormControl(false)
  });
  
  // Paginación
  currentPage = 1;
  totalItems = 0;
  totalPages = 0;
  itemsPerPage = 10;
  
  ngOnInit(): void {
    // Configurar filtros
    this.filterForm.get('search')?.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.currentPage = 1;
      this.loadUsuarios();
    });
    
    this.filterForm.get('rol')?.valueChanges.subscribe(() => {
      this.currentPage = 1;
      this.loadUsuarios();
    });
    
    this.filterForm.get('activo')?.valueChanges.subscribe(() => {
      this.currentPage = 1;
      this.loadUsuarios();
    });
    
    // Cargar datos iniciales
    this.loadUsuarios();
  }
  
  /**
   * Carga los usuarios desde el servidor
   */
  loadUsuarios(): void {
    this.isLoading = true;
    this.error = null;
    
    const search = this.filterForm.get('search')?.value || '';
    const rol = this.filterForm.get('rol')?.value || undefined;
    const activo = this.filterForm.get('activo')?.value;
    
    this.usuariosService.getUsuarios(
      this.currentPage,
      this.itemsPerPage,
      search,
      rol as RolUsuario | undefined,
      activo !== null ? activo : undefined
    ).subscribe({
      next: (response) => {
        this.usuarios = response.data;
        this.totalItems = response.meta.totalItems;
        this.totalPages = response.meta.totalPages;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar usuarios. Por favor, intente de nuevo.';
        this.isLoading = false;
        console.error('Error cargando usuarios:', err);
      }
    });
  }
  
  /**
   * Cambia el estado activo/inactivo de un usuario
   */
  onToggleStatus(id: string, activo: boolean, nombre: string): void {
    this.isLoading = true;
    this.usuariosService.toggleActivo(id, !activo).subscribe({
      next: () => {
        // Actualizar solo el usuario modificado
        const index = this.usuarios.findIndex(u => u.id === id);
        if (index !== -1) {
          this.usuarios[index].activo = !activo;
        }
        this.isLoading = false;
        
        this.toastService.success(
          'Estado actualizado',
          `El usuario "${nombre}" ha sido ${!activo ? 'activado' : 'desactivado'}.`
        );
      },
      error: (err) => {
        this.toastService.error(
          'Error al cambiar estado',
          'No se pudo actualizar el estado del usuario.'
        );
        this.isLoading = false;
        console.error('Error actualizando usuario:', err);
      }
    });
  }
  
  /**
   * Cambia el rol de un usuario
   */
  onChangeRol(id: string, currentRol: string, nombre: string): void {
    const newRol = currentRol === 'administrador' ? 'abogado' : 'administrador';
    
    if (confirm(`¿Está seguro que desea cambiar el rol de "${nombre}" a ${newRol}?`)) {
      this.isLoading = true;
      this.usuariosService.changeRol(id, newRol as RolUsuario).subscribe({
        next: () => {
          // Actualizar solo el usuario modificado
          const index = this.usuarios.findIndex(u => u.id === id);
          if (index !== -1) {
            this.usuarios[index].rol = newRol;
          }
          this.isLoading = false;
          
          this.toastService.success(
            'Rol actualizado',
            `El rol de "${nombre}" ha cambiado a ${newRol}.`
          );
        },
        error: (err) => {
          this.toastService.error(
            'Error al cambiar rol',
            'No se pudo actualizar el rol del usuario.'
          );
          this.isLoading = false;
          console.error('Error cambiando rol:', err);
        }
      });
    }
  }
  
  /**
   * Navega a la vista de detalles de usuario
   */
  onViewUser(id: string): void {
    this.router.navigate(['/admin/usuarios/view', id]);
  }
  
  /**
   * Maneja el cambio de página
   */
  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadUsuarios();
  }
  
  /**
   * Limpia todos los filtros
   */
  clearFilters(): void {
    this.filterForm.patchValue({
      search: '',
      rol: '',
      activo: null
    });
    this.loadUsuarios();
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