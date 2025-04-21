import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { 
  faArrowLeft, 
  faSpinner, 
  faExclamationTriangle, 
  faUserCog, 
  faUserSlash,
  faUserCheck
} from '@fortawesome/free-solid-svg-icons';
import { finalize } from 'rxjs/operators';
import { ToastService } from '../../../../core/services/toast.service';
import { UsuariosService } from '../../../../core/services/usuarios.service';
import { RolUsuario } from '../../../../core/models/usuario.model';

@Component({
  selector: 'app-usuario-detail',
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './usuario-detail.component.html',
  styleUrl: './usuario-detail.component.scss'
})
export default class UsuarioDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);
  private usuariosService = inject(UsuariosService);
  private toastService = inject(ToastService);
  
  // Iconos
  faArrowLeft = faArrowLeft;
  faSpinner = faSpinner;
  faExclamationTriangle = faExclamationTriangle;
  faUserCog = faUserCog;
  faUserSlash = faUserSlash;
  faUserCheck = faUserCheck;
  
  // Estado del componente
  isLoading = true;
  error: string | null = null;
  usuario: any | null = null;
  
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    
    if (id) {
      this.loadUsuario(id);
    } else {
      this.error = 'ID de usuario no especificado';
      this.isLoading = false;
    }
  }
  
  /**
   * Carga los datos de un usuario
   */
  loadUsuario(id: string): void {
    this.isLoading = true;
    this.error = null;
    
    this.usuariosService.getUsuario(id)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response) => {
          this.usuario = response.data;
        },
        error: (err) => {
          this.error = 'Error al cargar la información del usuario';
          console.error('Error cargando usuario:', err);
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
        // Actualizar localmente
        if (this.usuario) {
          this.usuario.activo = !activo;
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
          // Actualizar localmente
          if (this.usuario) {
            this.usuario.rol = newRol;
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
   * Vuelve a la página anterior
   */
  goBack(): void {
    this.location.back();
  }
}