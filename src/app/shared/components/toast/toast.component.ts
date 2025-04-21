import { Component, inject, computed, NgZone, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate, state } from '@angular/animations';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { 
  faCheckCircle, 
  faInfoCircle, 
  faExclamationTriangle, 
  faTimesCircle, 
  faTimes 
} from '@fortawesome/free-solid-svg-icons';
import { Toast, ToastService, ToastType } from '../../../core/services/toast.service';

/**
 * Componente que muestra y gestiona las notificaciones toast
 */
@Component({
  selector: 'app-toast',
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss',
  animations: [
    trigger('toastAnimation', [
      // Estado inicial cuando el toast entra
      state('void', style({
        transform: 'translateX(100%)',
        opacity: 0
      })),
      // Estado cuando el toast está visible
      state('visible', style({
        transform: 'translateX(0)',
        opacity: 1
      })),
      // Transición de entrada
      transition('void => visible', [
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)')
      ]),
      // Transición de salida
      transition('visible => void', [
        animate('200ms cubic-bezier(0.4, 0, 0.2, 1)', style({
          transform: 'translateX(100%)',
          opacity: 0
        }))
      ])
    ])
  ]
})
export class ToastComponent implements OnInit, OnDestroy {

  private toastService = inject(ToastService);
  private ngZone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);
  
  // Iconos para los diferentes tipos de toast
  icons = {
    'success': faCheckCircle,
    'error': faTimesCircle,
    'info': faInfoCircle,
    'warning': faExclamationTriangle
  };
  
  // Icono para cerrar el toast
  closeIcon = faTimes;
  
  // Obtener toasts del servicio
  toastsValue = computed(() => this.toastService.toasts$());
  
  // Progreso de cada toast
  toastProgress = new Map<string, number>();
  
  // Intervalo para actualizar el progreso
  private progressInterval: any;

  ngOnInit() {
    // Configurar el intervalo de actualización fuera de la zona de Angular
    this.ngZone.runOutsideAngular(() => {
      this.progressInterval = setInterval(() => {
        let needsUpdate = false;
        
        for (const toast of this.toastsValue()) {
          if (toast.duration > 0) {
            const progress = this.calculateProgress(toast);
            // Solo actualizamos si hay un cambio significativo
            if (!this.toastProgress.has(toast.id) || 
                Math.abs(this.toastProgress.get(toast.id)! - progress) > 0.5) {
              this.toastProgress.set(toast.id, progress);
              needsUpdate = true;
            }
          }
        }
        
        // Solo trigger de detección de cambios si hay actualizaciones significativas
        if (needsUpdate) {
          this.ngZone.run(() => {
            this.cdr.detectChanges();
          });
        }
      }, 100); // Actualización cada 100ms
    });
  }

  ngOnDestroy() {
    // Limpiar intervalo al destruir el componente
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
    }
  }
  
  /**
   * Determina la clase CSS del contenedor según el tipo de toast
   */
  getContainerClass(type: ToastType): string {
    return 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700';
  }
  
  /**
   * Determina la clase CSS del círculo de icono según el tipo de toast
   */
  getIconContainerClass(type: ToastType): string {
    switch (type) {
      case 'success':
        return 'bg-green-500 dark:bg-green-600';
      case 'error':
        return 'bg-bordeaux-500 dark:bg-bordeaux-600';
      case 'warning':
        return 'bg-amber-500 dark:bg-amber-600';
      case 'info':
        return 'bg-info-500 dark:bg-info-600';
      default:
        return 'bg-slate-500 dark:bg-slate-600';
    }
  }
  
  /**
   * Determina la clase CSS de la barra de progreso según el tipo de toast
   */
  getProgressClass(type: ToastType): string {
    switch (type) {
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-bordeaux-500';
      case 'warning':
        return 'bg-amber-500';
      case 'info':
        return 'bg-info-500';
      default:
        return 'bg-slate-500';
    }
  }
  
  /**
   * Obtiene el icono correspondiente al tipo de toast
   */
  getIconForType(type: ToastType) {
    return this.icons[type];
  }
  
  /**
   * Cierra un toast específico
   */
  dismiss(id: string): void {
    this.toastService.dismiss(id);
  }
  
  /**
   * Obtiene el progreso calculado para un toast específico
   */
  getProgress(toast: Toast): number {
    if (!this.toastProgress.has(toast.id)) {
      this.toastProgress.set(toast.id, this.calculateProgress(toast));
    }
    return this.toastProgress.get(toast.id)!;
  }
  
  /**
   * Calcula el progreso actual pero no actualiza el Map
   */
  private calculateProgress(toast: Toast): number {
    if (toast.duration <= 0) return 100;
    
    const elapsed = Date.now() - toast.timestamp;
    const progress = 100 - (elapsed / toast.duration * 100);
    return Math.max(0, Math.min(100, progress));
  }
}