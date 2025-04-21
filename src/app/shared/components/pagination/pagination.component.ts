import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChevronLeft, faChevronRight, faEllipsis } from '@fortawesome/free-solid-svg-icons';

/**
 * Componente reutilizable para paginación
 */
@Component({
  selector: 'app-pagination',
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss'
})
export class PaginationComponentComponent implements OnChanges {

  // Íconos
  faChevronLeft = faChevronLeft;
  faChevronRight = faChevronRight;
  faEllipsis = faEllipsis;
  
  // Inputs
  @Input() currentPage = 1;
  @Input() totalPages = 1;
  @Input() maxVisiblePages = 5;
  
  // Outputs
  @Output() pageChange = new EventEmitter<number>();
  
  // Variables calculadas
  visiblePages: number[] = [];
  startPage = 1;
  endPage = 1;
  showFirstPage = true;
  showLastPage = true;
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentPage'] || changes['totalPages']) {
      this.calculateVisiblePages();
    }
  }
  
  /**
   * Calcula las páginas visibles en la paginación
   */
  calculateVisiblePages(): void {
    if (this.totalPages <= this.maxVisiblePages) {
      // Mostrar todas las páginas si son menos que el máximo
      this.startPage = 1;
      this.endPage = this.totalPages;
      this.showFirstPage = false;
      this.showLastPage = false;
    } else {
      // Calcular rango de páginas a mostrar
      const halfVisiblePages = Math.floor(this.maxVisiblePages / 2);
      
      if (this.currentPage <= halfVisiblePages + 1) {
        // Cerca del inicio
        this.startPage = 2;
        this.endPage = this.maxVisiblePages;
        this.showFirstPage = true;
        this.showLastPage = true;
      } else if (this.currentPage >= this.totalPages - halfVisiblePages) {
        // Cerca del final
        this.startPage = this.totalPages - this.maxVisiblePages + 1;
        this.endPage = this.totalPages - 1;
        this.showFirstPage = true;
        this.showLastPage = true;
      } else {
        // En medio
        this.startPage = this.currentPage - halfVisiblePages + 1;
        this.endPage = this.currentPage + halfVisiblePages - 1;
        this.showFirstPage = true;
        this.showLastPage = true;
      }
    }
    
    // Generar array de páginas visibles
    this.visiblePages = [];
    for (let i = this.startPage; i <= this.endPage; i++) {
      // No incluir primera y última página si ya se muestran separadamente
      if ((i === 1 && this.showFirstPage) || (i === this.totalPages && this.showLastPage)) {
        continue;
      }
      this.visiblePages.push(i);
    }
  }
  
  /**
   * Maneja el cambio de página
   */
  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) {
      return;
    }
    
    this.pageChange.emit(page);
  }
}