import { Injectable, signal } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';

/** Tipos de toast disponibles */
export type ToastType = 'success' | 'error' | 'info' | 'warning';

/** Interfaz para representar un toast */
export interface Toast {
  id: string;
  message: string;
  detail?: string;
  type: ToastType;
  /** Duración en milisegundos (0 para permanente) */
  duration: number;
  timestamp: number;
  dismissible: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  // Señal que contiene todos los toasts activos
  private toasts = signal<Toast[]>([]);
  
  // Señal pública (readonly) para que los componentes accedan a los toasts
  public toasts$ = this.toasts.asReadonly();
  
  /**
   * Muestra un toast de éxito
   * @param message Mensaje principal
   * @param detail Mensaje de detalle opcional
   * @param duration Duración en ms (por defecto 5000, 0 para permanente)
   */
  success(message: string, detail?: string, duration = 5000): void {
    this.showToast(message, 'success', duration, detail);
  }
  
  /**
   * Muestra un toast de error
   * @param message Mensaje principal
   * @param detail Mensaje de detalle opcional
   * @param duration Duración en ms (por defecto 8000, 0 para permanente)
   */
  error(message: string, detail?: string, duration = 8000): void {
    this.showToast(message, 'error', duration, detail);
  }
  
  /**
   * Muestra un toast informativo
   * @param message Mensaje principal
   * @param detail Mensaje de detalle opcional
   * @param duration Duración en ms (por defecto 5000, 0 para permanente)
   */
  info(message: string, detail?: string, duration = 5000): void {
    this.showToast(message, 'info', duration, detail);
  }
  
  /**
   * Muestra un toast de advertencia
   * @param message Mensaje principal
   * @param detail Mensaje de detalle opcional
   * @param duration Duración en ms (por defecto 6000, 0 para permanente)
   */
  warning(message: string, detail?: string, duration = 6000): void {
    this.showToast(message, 'warning', duration, detail);
  }
  
  /**
   * Elimina un toast específico por su ID
   * @param id ID del toast a eliminar
   */
  dismiss(id: string): void {
    this.toasts.update(toasts => toasts.filter(toast => toast.id !== id));
  }
  
  /**
   * Elimina todos los toasts actualmente visibles
   */
  clear(): void {
    this.toasts.set([]);
  }
  
  /**
   * Método interno para mostrar un toast
   */
  private showToast(
    message: string, 
    type: ToastType, 
    duration: number, 
    detail?: string
  ): void {
    // Generar ID único para este toast
    const id = uuidv4();
    
    // Crear objeto toast
    const toast: Toast = {
      id,
      message,
      detail,
      type,
      duration,
      timestamp: Date.now(),
      dismissible: true
    };
    
    // Añadir toast a la lista
    this.toasts.update(toasts => [...toasts, toast]);
    
    // Programar eliminación automática si la duración es mayor que 0
    if (duration > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, duration);
    }
  }
}