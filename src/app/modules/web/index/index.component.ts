import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { 
  faGavel, 
  faBookOpen, 
  faChartLine, 
  faCheckCircle, 
  faArrowRight, 
  faQuoteLeft 
} from '@fortawesome/free-solid-svg-icons';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';

@Component({
  selector: 'app-index',
  imports: [
    CommonModule, 
    RouterModule, 
    FontAwesomeModule,
    NavbarComponent,
    FooterComponent
  ],
  templateUrl: './index.component.html',
  styleUrl: './index.component.scss'
})
export default class IndexComponent {

  // Iconos
  faGavel = faGavel;
  faBookOpen = faBookOpen;
  faChartLine = faChartLine;
  faCheckCircle = faCheckCircle;
  faArrowRight = faArrowRight;
  faQuoteLeft = faQuoteLeft;
  
  // Características
  features = [
    {
      icon: this.faGavel,
      title: 'Exámenes Especializados',
      description: 'Simulacros de examen diseñados por expertos en distintas áreas del derecho.'
    },
    {
      icon: this.faBookOpen,
      title: 'Balotarios Actualizados',
      description: 'Material de estudio constantemente actualizado según las últimas reformas legales.'
    },
    {
      icon: this.faChartLine,
      title: 'Análisis de Resultados',
      description: 'Estadísticas detalladas para identificar tus fortalezas y áreas de mejora.'
    }
  ];
  
  // Testimonios
  testimonials = [
    {
      name: 'María Rodríguez',
      position: 'Jueza Civil, Lima',
      image: 'assets/images/testimonial-1.jpg',
      text: 'Gracias a LexExam logré aprobar mi evaluación para juez con una calificación sobresaliente. Los simulacros fueron cruciales en mi preparación.'
    },
    {
      name: 'Carlos Mendoza',
      position: 'Fiscal Adjunto Provincial',
      image: 'assets/images/testimonial-2.jpg',
      text: 'La plataforma ofrece preguntas muy similares a las del examen real. Sin duda, es la mejor inversión que he hecho para mi carrera.'
    },
    {
      name: 'Ana Castillo',
      position: 'Asistente de Juez Superior',
      image: 'assets/images/testimonial-3.jpg',
      text: 'El análisis detallado de resultados me permitió enfocarme en mis debilidades. Recomiendo LexExam a todos los abogados que buscan crecer profesionalmente.'
    }
  ];
  
  // Especialidades
  specialities = [
    {
      title: 'Derecho Constitucional',
      path: '/especialidades/constitucional',
      image: 'assets/images/constitucional.jpg'
    },
    {
      title: 'Derecho Civil',
      path: '/especialidades/civil',
      image: 'assets/images/civil.jpg'
    },
    {
      title: 'Derecho Penal',
      path: '/especialidades/penal',
      image: 'assets/images/penal.jpg'
    },
    {
      title: 'Derecho Administrativo',
      path: '/especialidades/administrativo',
      image: 'assets/images/administrativo.jpg'
    }
  ];
  
  // Pasos para empezar
  steps = [
    {
      number: '01',
      title: 'Regístrate',
      description: 'Crea tu cuenta en menos de 2 minutos'
    },
    {
      number: '02',
      title: 'Elige un plan',
      description: 'Selecciona el que mejor se adapte a tus necesidades'
    },
    {
      number: '03',
      title: 'Comienza a practicar',
      description: 'Accede a cientos de preguntas y simulacros'
    }
  ];

}
